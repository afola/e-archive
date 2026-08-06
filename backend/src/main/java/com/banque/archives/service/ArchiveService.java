package com.banque.archives.service;

import com.banque.archives.dto.*;
import com.banque.archives.entity.*;
import com.banque.archives.exception.BusinessException;
import com.banque.archives.exception.EntityNotFoundException;
import com.banque.archives.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
public class ArchiveService {

    private final ArchiveRepository archiveRepository;
    private final ArchiveTypeRepository archiveTypeRepository;
    private final AgencyRepository agencyRepository;
    private final LocationRepository locationRepository;
    private final AuditLogService auditLogService;

    public ArchiveDTO findById(String id) {
        Archive archive = archiveRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Archive", id));
        return toDTO(archive);
    }

    public ArchiveDTO findByReference(String reference) {
        Archive archive = archiveRepository.findByReference(reference)
                .orElseThrow(() -> new EntityNotFoundException("Archive", "reference=" + reference));
        return toDTO(archive);
    }

    public PageResponse<ArchiveDTO> findAll(Pageable pageable) {
        Page<Archive> page = archiveRepository.findAll(pageable);
        return PageResponse.of(page.map(this::toDTO));
    }

    public PageResponse<ArchiveDTO> search(ArchiveSearchRequest request) {
        Sort sort = Sort.by(
            Sort.Direction.fromString(request.getSortDirection()),
            request.getSortBy()
        );
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Archive> page = archiveRepository.findByFilters(
            null, // status
            request.getTypeId(),
            request.getAgencyId(),
            null, // confidentiality
            request.getClientName(),
            request.getAccountNumber(),
            pageable
        );

        return PageResponse.of(page.map(this::toDTO));
    }

    public List<ArchiveDTO> findExpiringArchives(int days) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days);
        return archiveRepository.findArchivesNearExpiration(today, endDate)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ArchiveDTO> findExpiredArchives() {
        LocalDate today = LocalDate.now();
        return archiveRepository.findExpiredArchives(today)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ArchiveDTO create(ArchiveCreateRequest request, String userId) {
        // Check if reference already exists
        if (archiveRepository.existsByReference(request.getReference())) {
            throw new BusinessException("Une archive avec cette référence existe déjà");
        }

        ArchiveType type = archiveTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new EntityNotFoundException("ArchiveType", request.getTypeId()));

        Agency agency = agencyRepository.findById(request.getAgencyId())
                .orElseThrow(() -> new EntityNotFoundException("Agency", request.getAgencyId()));

        Archive archive = Archive.builder()
                .reference(request.getReference())
                .title(request.getTitle())
                .description(request.getDescription())
                .type(type)
                .clientName(request.getClientName())
                .clientNumber(request.getClientNumber())
                .accountNumber(request.getAccountNumber())
                .dossierNumber(request.getDossierNumber())
                .agency(agency)
                .department(request.getDepartment())
                .ownerService(request.getOwnerService())
                .archiveDate(LocalDate.now())
                .retentionEndDate(LocalDate.now().plusYears(type.getRetentionYears()))
                .status(ArchiveStatus.ACTIVE)
                .confidentiality(request.getConfidentiality() != null ?
                        ConfidentialityLevel.valueOf(request.getConfidentiality()) :
                        ConfidentialityLevel.NORMAL)
                .hasDigitalCopy(false)
                .createdBy(userId)
                .lastModifiedBy(userId)
                .lastActionAt(LocalDateTime.now())
                .lastActionType("CREATE")
                .build();

        archive = archiveRepository.save(archive);

        // Log audit
        auditLogService.log(userId, AuditAction.CREATE, "Archive", archive.getId(),
                "Création de l'archive: " + archive.getReference());

        log.info("Archive créée: {}", archive.getReference());
        return toDTO(archive);
    }

    @Transactional
    public ArchiveDTO update(String id, ArchiveCreateRequest request, String userId) {
        Archive archive = archiveRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Archive", id));

        // Update fields
        archive.setTitle(request.getTitle());
        archive.setDescription(request.getDescription());
        archive.setClientName(request.getClientName());
        archive.setClientNumber(request.getClientNumber());
        archive.setAccountNumber(request.getAccountNumber());
        archive.setDossierNumber(request.getDossierNumber());
        archive.setDepartment(request.getDepartment());
        archive.setOwnerService(request.getOwnerService());
        archive.setLastModifiedBy(userId);
        archive.setLastActionAt(LocalDateTime.now());
        archive.setLastActionType("UPDATE");

        // Increment version
        archive.setVersion(archive.getVersion() + 1);

        archive = archiveRepository.save(archive);

        // Log audit
        auditLogService.log(userId, AuditAction.UPDATE, "Archive", archive.getId(),
                "Modification de l'archive: " + archive.getReference());

        log.info("Archive modifiée: {}", archive.getReference());
        return toDTO(archive);
    }

    @Transactional
    public void delete(String id, String userId) {
        Archive archive = archiveRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Archive", id));

        archive.setStatus(ArchiveStatus.DESTROYED);
        archive.setDestructionDate(LocalDate.now());
        archive.setLastModifiedBy(userId);
        archive.setLastActionAt(LocalDateTime.now());
        archive.setLastActionType("DELETE");

        archiveRepository.save(archive);

        // Log audit
        auditLogService.log(userId, AuditAction.DELETE, "Archive", id,
                "Suppression de l'archive: " + archive.getReference(), true);

        log.info("Archive supprimée: {}", archive.getReference());
    }

    @Transactional
    public ArchiveDTO changeStatus(String id, ArchiveStatus newStatus, String userId) {
        Archive archive = archiveRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Archive", id));

        ArchiveStatus oldStatus = archive.getStatus();
        archive.setStatus(newStatus);
        archive.setLastModifiedBy(userId);
        archive.setLastActionAt(LocalDateTime.now());
        archive.setLastActionType("STATUS_CHANGE");

        archive = archiveRepository.save(archive);

        // Log audit
        auditLogService.log(userId, AuditAction.UPDATE, "Archive", id,
                "Changement de statut: " + oldStatus + " -> " + newStatus);

        return toDTO(archive);
    }

    // Statistics methods
    public long countAll() {
        return archiveRepository.count();
    }

    public long countByStatus(ArchiveStatus status) {
        return archiveRepository.countByStatus(status);
    }

    private ArchiveDTO toDTO(Archive archive) {
        return ArchiveDTO.builder()
                .id(archive.getId())
                .reference(archive.getReference())
                .title(archive.getTitle())
                .description(archive.getDescription())
                .typeId(archive.getType() != null ? archive.getType().getId() : null)
                .typeName(archive.getType() != null ? archive.getType().getName() : null)
                .clientName(archive.getClientName())
                .clientNumber(archive.getClientNumber())
                .accountNumber(archive.getAccountNumber())
                .dossierNumber(archive.getDossierNumber())
                .agencyId(archive.getAgency() != null ? archive.getAgency().getId() : null)
                .agencyName(archive.getAgency() != null ? archive.getAgency().getName() : null)
                .department(archive.getDepartment())
                .ownerService(archive.getOwnerService())
                .documentDate(archive.getDocumentDate())
                .archiveDate(archive.getArchiveDate())
                .retentionEndDate(archive.getRetentionEndDate())
                .destructionDate(archive.getDestructionDate())
                .status(archive.getStatus())
                .confidentiality(archive.getConfidentiality())
                .version(archive.getVersion())
                .locationId(archive.getLocation() != null ? archive.getLocation().getId() : null)
                .locationCode(archive.getLocation() != null ? archive.getLocation().getCode() : null)
                .boxNumber(archive.getBoxNumber())
                .physicalNotes(archive.getPhysicalNotes())
                .hasDigitalCopy(archive.getHasDigitalCopy())
                .filePath(archive.getFilePath())
                .fileName(archive.getFileName())
                .fileSize(archive.getFileSize())
                .createdBy(archive.getCreatedBy())
                .lastModifiedBy(archive.getLastModifiedBy())
                .lastActionAt(archive.getLastActionAt() != null ?
                        archive.getLastActionAt().toString() : null)
                .lastActionType(archive.getLastActionType())
                .createdAt(archive.getCreatedAt() != null ?
                        archive.getCreatedAt().toString() : null)
                .updatedAt(archive.getUpdatedAt() != null ?
                        archive.getUpdatedAt().toString() : null)
                .build();
    }
}
