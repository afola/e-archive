package com.banque.archives.service;

import com.banque.archives.dto.*;
import com.banque.archives.entity.*;
import com.banque.archives.exception.BusinessException;
import com.banque.archives.exception.EntityNotFoundException;
import com.banque.archives.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class WorkflowService {

    private final WorkflowRequestRepository workflowRepository;
    private final ArchiveRepository archiveRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public WorkflowRequestDTO findById(String id) {
        WorkflowRequest request = workflowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("WorkflowRequest", id));
        return toDTO(request);
    }

    public Page<WorkflowRequestDTO> findByFilters(WorkflowType type, WorkflowStatus status, 
                                                   String requesterId, Pageable pageable) {
        return workflowRepository.findByFilters(type, status, requesterId, pageable)
                .map(this::toDTO);
    }

    public List<WorkflowRequestDTO> findPendingApprovals(String userId) {
        // Find requests that need approval from this user based on their role
        return workflowRepository.findByStatusIn(
                List.of(WorkflowStatus.SUBMITTED, WorkflowStatus.IN_VALIDATION),
                Pageable.unpaged()
        ).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkflowRequestDTO create(WorkflowRequestDTO dto, String requesterId) {
        Archive archive = null;
        if (dto.getArchiveId() != null) {
            archive = archiveRepository.findById(dto.getArchiveId())
                    .orElseThrow(() -> new EntityNotFoundException("Archive", dto.getArchiveId()));
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new EntityNotFoundException("User", requesterId));

        WorkflowRequest request = WorkflowRequest.builder()
                .archive(archive)
                .type(dto.getType())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority() : WorkflowPriority.NORMAL)
                .requester(requester)
                .status(WorkflowStatus.DRAFT)
                .currentStep(0)
                .totalSteps(3) // N+1, Compliance, Manager
                .dueDate(dto.getDueDate())
                .build();

        request = workflowRepository.save(request);
        log.info("Demande créée: {} - {}", request.getId(), request.getTitle());

        auditLogService.log(requesterId, AuditAction.CREATE, "WorkflowRequest", request.getId(),
                "Création de la demande: " + request.getTitle());

        return toDTO(request);
    }

    @Transactional
    public WorkflowRequestDTO submit(String id, String userId) {
        WorkflowRequest request = workflowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("WorkflowRequest", id));

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        if (request.getStatus() != WorkflowStatus.DRAFT) {
            throw new BusinessException("Seule une demande en brouillon peut être soumise");
        }

        if (!request.getRequester().getId().equals(userId) && !"ADMIN".equals(actor.getRole().getCode())) {
            throw new BusinessException("Seul le demandeur ou un administrateur peut soumettre cette demande");
        }

        request.setStatus(WorkflowStatus.SUBMITTED);
        request.setCurrentStep(1);
        request = workflowRepository.save(request);

        // Notify approvers
        notificationService.notifyApprovers(request);

        log.info("Demande soumise: {}", id);
        return toDTO(request);
    }

    @Transactional
    public WorkflowRequestDTO approve(String id, String userId, String comment, int step) {
        WorkflowRequest request = workflowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("WorkflowRequest", id));

        User approver = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        if (request.getStatus() != WorkflowStatus.IN_VALIDATION && 
            request.getStatus() != WorkflowStatus.SUBMITTED) {
            throw new BusinessException("Cette demande ne peut pas être approuvée");
        }

        if (step != request.getCurrentStep()) {
            throw new BusinessException("Cette étape ne peut pas être approuvée dans l'état actuel");
        }

        // Set approval based on step
        switch (step) {
            case 1:
                request.setApprovedByN1(userId);
                request.setApprovedAtN1(LocalDateTime.now());
                request.setCommentN1(comment);
                break;
            case 2:
                request.setApprovedByCompliance(userId);
                request.setApprovedAtCompliance(LocalDateTime.now());
                request.setCommentCompliance(comment);
                break;
            case 3:
                request.setApprovedByManager(userId);
                request.setApprovedAtManager(LocalDateTime.now());
                request.setCommentManager(comment);
                request.setStatus(WorkflowStatus.APPROVED);
                request.setCompletedAt(LocalDateTime.now());
                break;
        }

        if (step < request.getTotalSteps()) {
            request.setCurrentStep(step + 1);
            request.setStatus(WorkflowStatus.IN_VALIDATION);
        }

        request = workflowRepository.save(request);

        // Notify requester
        notificationService.notifyApproval(request, approver, true);

        auditLogService.log(userId, AuditAction.APPROVE, "WorkflowRequest", id,
                "Approbation étape " + step + ": " + comment, true);

        log.info("Demande approuvée (étape {}): {}", step, id);
        return toDTO(request);
    }

    @Transactional
    public WorkflowRequestDTO reject(String id, String userId, String reason) {
        WorkflowRequest request = workflowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("WorkflowRequest", id));

        User rejecter = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        request.setStatus(WorkflowStatus.REJECTED);
        request.setCompletedAt(LocalDateTime.now());
        request = workflowRepository.save(request);

        // Notify requester
        notificationService.notifyRejection(request, rejecter, reason);

        auditLogService.log(userId, AuditAction.REJECT, "WorkflowRequest", id,
                "Rejet: " + reason, true);

        log.info("Demande rejetée: {}", id);
        return toDTO(request);
    }

    @Transactional
    public WorkflowRequestDTO execute(String id, String userId, String notes) {
        WorkflowRequest request = workflowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("WorkflowRequest", id));

        if (request.getStatus() != WorkflowStatus.APPROVED) {
            throw new BusinessException("Seule une demande approuvée peut être exécutée");
        }

        request.setStatus(WorkflowStatus.EXECUTED);
        request.setExecutedBy(userId);
        request.setExecutedAt(LocalDateTime.now());
        request.setExecutionNotes(notes);
        request = workflowRepository.save(request);

        auditLogService.log(userId, AuditAction.UPDATE, "WorkflowRequest", id,
                "Exécution: " + notes, true);

        log.info("Demande exécutée: {}", id);
        return toDTO(request);
    }

    public long countByStatus(WorkflowStatus status) {
        return workflowRepository.countByStatus(status);
    }

    public long countPending() {
        return workflowRepository.countByStatusIn(
                List.of(WorkflowStatus.SUBMITTED, WorkflowStatus.IN_VALIDATION)
        );
    }

    private WorkflowRequestDTO toDTO(WorkflowRequest request) {
        return WorkflowRequestDTO.builder()
                .id(request.getId())
                .archiveId(request.getArchive() != null ? request.getArchive().getId() : null)
                .archiveReference(request.getArchive() != null ? request.getArchive().getReference() : null)
                .archiveTitle(request.getArchive() != null ? request.getArchive().getTitle() : null)
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .requesterId(request.getRequester() != null ? request.getRequester().getId() : null)
                .requesterName(request.getRequester() != null ? request.getRequester().getName() : null)
                .requestedAt(request.getRequestedAt())
                .currentStep(request.getCurrentStep())
                .totalSteps(request.getTotalSteps())
                .status(request.getStatus())
                .approvedByN1(request.getApprovedByN1())
                .approvedAtN1(request.getApprovedAtN1())
                .commentN1(request.getCommentN1())
                .approvedByCompliance(request.getApprovedByCompliance())
                .approvedAtCompliance(request.getApprovedAtCompliance())
                .commentCompliance(request.getCommentCompliance())
                .approvedByManager(request.getApprovedByManager())
                .approvedAtManager(request.getApprovedAtManager())
                .commentManager(request.getCommentManager())
                .executedBy(request.getExecutedBy())
                .executedAt(request.getExecutedAt())
                .executionNotes(request.getExecutionNotes())
                .dueDate(request.getDueDate())
                .completedAt(request.getCompletedAt())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
