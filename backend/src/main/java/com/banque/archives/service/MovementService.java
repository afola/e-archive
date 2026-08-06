package com.banque.archives.service;

import com.banque.archives.dto.MovementDTO;
import com.banque.archives.entity.*;
import com.banque.archives.exception.BusinessException;
import com.banque.archives.exception.EntityNotFoundException;
import com.banque.archives.repository.ArchiveRepository;
import com.banque.archives.repository.MovementRepository;
import com.banque.archives.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MovementService {

    private final MovementRepository movementRepository;
    private final ArchiveRepository archiveRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public MovementDTO findById(String id) {
        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movement", id));
        return toDTO(movement);
    }

    public MovementDTO findByReceiptNumber(String receiptNumber) {
        Movement movement = movementRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new EntityNotFoundException("Movement", "receiptNumber=" + receiptNumber));
        return toDTO(movement);
    }

    public List<MovementDTO> findByArchiveId(String archiveId) {
        return movementRepository.findByArchiveId(archiveId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MovementDTO> findByStatus(MovementStatus status) {
        return movementRepository.findByStatus(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MovementDTO> findByType(MovementType type) {
        return movementRepository.findByType(type)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MovementDTO> findByUserId(String userId) {
        return movementRepository.findByRequestedById(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MovementDTO> findByFilters(MovementType type, MovementStatus status, String archiveId) {
        return movementRepository.findByFilters(type, status, archiveId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MovementDTO createMovement(String archiveId, MovementType type, String reason,
                                       String fromLocation, String toLocation,
                                       String fromAgency, String toAgency,
                                       String requestedByUserId, LocalDate expectedReturnDate) {
        
        Archive archive = archiveRepository.findById(archiveId)
                .orElseThrow(() -> new EntityNotFoundException("Archive", archiveId));

        User requestedBy = userRepository.findById(requestedByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", requestedByUserId));

        // Check if archive is available for movement
        if (archive.getStatus() == ArchiveStatus.ON_LOAN && type != MovementType.RETURN) {
            throw new BusinessException("L'archive est actuellement empruntée et ne peut pas faire l'objet d'un autre mouvement");
        }

        String receiptNumber = generateReceiptNumber(type);

        Movement movement = Movement.builder()
                .archive(archive)
                .type(type)
                .fromLocation(fromLocation)
                .toLocation(toLocation)
                .fromAgency(fromAgency)
                .toAgency(toAgency)
                .reason(reason)
                .requestedBy(requestedBy)
                .requestedAt(LocalDateTime.now())
                .status(MovementStatus.PENDING)
                .receiptNumber(receiptNumber)
                .expectedReturnDate(expectedReturnDate)
                .build();

        movement = movementRepository.save(movement);

        // Log audit
        auditLogService.log(requestedByUserId, AuditAction.CREATE, "Movement", movement.getId(),
                "Création du mouvement: " + type + " pour l'archive " + archive.getReference());

        log.info("Mouvement créé: {} pour l'archive {}", type, archive.getReference());
        return toDTO(movement);
    }

    @Transactional
    public MovementDTO approveMovement(String movementId, String approvedByUserId, String notes) {
        Movement movement = movementRepository.findById(movementId)
                .orElseThrow(() -> new EntityNotFoundException("Movement", movementId));

        if (movement.getStatus() != MovementStatus.PENDING) {
            throw new BusinessException("Seuls les mouvements en attente peuvent être approuvés");
        }

        User approvedBy = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", approvedByUserId));

        movement.setStatus(MovementStatus.APPROVED);
        movement.setApprovedBy(approvedBy);
        movement.setApprovedAt(LocalDateTime.now());
        if (notes != null) {
            movement.setNotes(notes);
        }

        movement = movementRepository.save(movement);

        // Log audit
        auditLogService.log(approvedByUserId, AuditAction.APPROVE, "Movement", movementId,
                "Approbation du mouvement: " + movement.getType());

        log.info("Mouvement approuvé: {}", movement.getReceiptNumber());
        return toDTO(movement);
    }

    @Transactional
    public MovementDTO executeMovement(String movementId, String executedByUserId, String notes) {
        Movement movement = movementRepository.findById(movementId)
                .orElseThrow(() -> new EntityNotFoundException("Movement", movementId));

        if (movement.getStatus() != MovementStatus.APPROVED) {
            throw new BusinessException("Seuls les mouvements approuvés peuvent être exécutés");
        }

        User executedBy = userRepository.findById(executedByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", executedByUserId));

        Archive archive = movement.getArchive();

        movement.setStatus(MovementStatus.EXECUTED);
        movement.setExecutedBy(executedBy);
        movement.setExecutedAt(LocalDateTime.now());
        if (notes != null) {
            movement.setNotes(notes);
        }

        // Update archive status based on movement type
        switch (movement.getType()) {
            case EXIT:
            case BORROW:
                archive.setStatus(ArchiveStatus.ON_LOAN);
                break;
            case RETURN:
                archive.setStatus(ArchiveStatus.ACTIVE);
                movement.setActualReturnDate(LocalDate.now());
                break;
            case TRANSFER:
                // Archive remains active, just location changes
                break;
            case DESTRUCTION:
                archive.setStatus(ArchiveStatus.DESTROYED);
                archive.setDestructionDate(LocalDate.now());
                break;
            case ENTRY:
                archive.setStatus(ArchiveStatus.ACTIVE);
                break;
            case QUARANTINE:
                archive.setStatus(ArchiveStatus.IN_TRANSFER);
                break;
        }

        archive.setLastActionAt(LocalDateTime.now());
        archive.setLastActionType(movement.getType().name());
        archiveRepository.save(archive);

        movement = movementRepository.save(movement);

        // Log audit
        auditLogService.log(executedByUserId, AuditAction.UPDATE, "Movement", movementId,
                "Exécution du mouvement: " + movement.getType(), true);

        log.info("Mouvement exécuté: {}", movement.getReceiptNumber());
        return toDTO(movement);
    }

    @Transactional
    public MovementDTO cancelMovement(String movementId, String cancelledByUserId, String reason) {
        Movement movement = movementRepository.findById(movementId)
                .orElseThrow(() -> new EntityNotFoundException("Movement", movementId));

        User cancelledBy = userRepository.findById(cancelledByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", cancelledByUserId));

        if (movement.getStatus() == MovementStatus.EXECUTED) {
            throw new BusinessException("Un mouvement exécuté ne peut pas être annulé");
        }

        boolean isRequester = movement.getRequestedBy() != null &&
                movement.getRequestedBy().getId().equals(cancelledByUserId);
        boolean isPrivileged = cancelledBy.getRole() != null && List.of(
                "ADMIN",
                "ARCHIVIST_CENTRAL",
                "ARCHIVIST_AGENCY",
                "COMPLIANCE"
        ).contains(cancelledBy.getRole().getCode());

        if (!isRequester && !isPrivileged) {
            throw new BusinessException("Vous n'êtes pas autorisé à annuler ce mouvement");
        }

        movement.setStatus(MovementStatus.CANCELLED);
        movement.setNotes(reason != null ? reason : movement.getNotes());

        movement = movementRepository.save(movement);

        // Log audit
        auditLogService.log(cancelledByUserId, AuditAction.UPDATE, "Movement", movementId,
                "Annulation du mouvement: " + movement.getType());

        log.info("Mouvement annulé: {}", movement.getReceiptNumber());
        return toDTO(movement);
    }

    // Statistics methods
    public long countByStatus(MovementStatus status) {
        return movementRepository.countByStatus(status);
    }

    public long countAll() {
        return movementRepository.count();
    }

    private String generateReceiptNumber(MovementType type) {
        String prefix = switch (type) {
            case ENTRY -> "ENT";
            case EXIT -> "SOR";
            case RETURN -> "RET";
            case TRANSFER -> "TRF";
            case DESTRUCTION -> "DES";
            case QUARANTINE -> "QUA";
            case BORROW -> "EMP";
        };
        return prefix + "-" + LocalDate.now().getYear() + "-" + 
               String.format("%06d", UUID.randomUUID().hashCode() & 0xFFFFFF);
    }

    private MovementDTO toDTO(Movement movement) {
        return MovementDTO.builder()
                .id(movement.getId())
                .archiveId(movement.getArchive() != null ? movement.getArchive().getId() : null)
                .archiveReference(movement.getArchive() != null ? movement.getArchive().getReference() : null)
                .archiveTitle(movement.getArchive() != null ? movement.getArchive().getTitle() : null)
                .type(movement.getType())
                .fromLocation(movement.getFromLocation())
                .toLocation(movement.getToLocation())
                .fromAgency(movement.getFromAgency())
                .toAgency(movement.getToAgency())
                .reason(movement.getReason())
                .notes(movement.getNotes())
                .requestedById(movement.getRequestedBy() != null ? movement.getRequestedBy().getId() : null)
                .requestedByName(movement.getRequestedBy() != null ? movement.getRequestedBy().getFullName() : null)
                .requestedAt(movement.getRequestedAt())
                .approvedById(movement.getApprovedBy() != null ? movement.getApprovedBy().getId() : null)
                .approvedByName(movement.getApprovedBy() != null ? movement.getApprovedBy().getFullName() : null)
                .approvedAt(movement.getApprovedAt())
                .executedById(movement.getExecutedBy() != null ? movement.getExecutedBy().getId() : null)
                .executedByName(movement.getExecutedBy() != null ? movement.getExecutedBy().getFullName() : null)
                .executedAt(movement.getExecutedAt())
                .status(movement.getStatus())
                .receiptNumber(movement.getReceiptNumber())
                .expectedReturnDate(movement.getExpectedReturnDate())
                .actualReturnDate(movement.getActualReturnDate())
                .createdAt(movement.getCreatedAt())
                .updatedAt(movement.getUpdatedAt())
                .build();
    }
}
