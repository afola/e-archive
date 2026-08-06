package com.banque.archives.service;

import com.banque.archives.dto.KpiDTO;
import com.banque.archives.entity.*;
import com.banque.archives.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class KpiService {

    private final ArchiveRepository archiveRepository;
    private final MovementRepository movementRepository;
    private final WorkflowRequestRepository workflowRepository;
    private final ArchiveTypeRepository archiveTypeRepository;
    private final AgencyRepository agencyRepository;

    public KpiDTO getKpis() {
        LocalDate today = LocalDate.now();
        LocalDate expirationLimit = today.plusDays(90);

        return KpiDTO.builder()
                .totalArchives(archiveRepository.count())
                .activeArchives(archiveRepository.countByStatus(ArchiveStatus.ACTIVE))
                .onLoanArchives(archiveRepository.countByStatus(ArchiveStatus.ON_LOAN))
                .expiringArchives(archiveRepository.findByRetentionEndDateBetween(today, expirationLimit).size())
                .pendingValidation(workflowRepository.countByStatusIn(
                        List.of(WorkflowStatus.SUBMITTED, WorkflowStatus.IN_VALIDATION)))
                .destroyedArchives(archiveRepository.countByStatus(ArchiveStatus.DESTROYED))
                .transferredArchives(archiveRepository.countByStatus(ArchiveStatus.IN_TRANSFER))
                .totalMovements(movementRepository.count())
                .pendingRequests(movementRepository.countByStatus(MovementStatus.PENDING))
                .archivesByType(getArchivesByType())
                .archivesByStatus(getArchivesByStatus())
                .archivesByAgency(getArchivesByAgency())
                .monthlyMovements(getMonthlyMovements())
                .build();
    }

    private List<KpiDTO.ChartItem> getArchivesByType() {
        return archiveRepository.countByType().stream()
                .map(row -> KpiDTO.ChartItem.builder()
                        .name((String) row[0])
                        .value((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    private List<KpiDTO.ChartItem> getArchivesByStatus() {
        return archiveRepository.countByStatus().stream()
                .map(row -> {
                    ArchiveStatus status = (ArchiveStatus) row[0];
                    return KpiDTO.ChartItem.builder()
                            .name(status.getLabel())
                            .value((Long) row[1])
                            .color(getStatusColor(status))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<KpiDTO.ChartItem> getArchivesByAgency() {
        return archiveRepository.countByAgency().stream()
                .map(row -> KpiDTO.ChartItem.builder()
                        .name((String) row[0])
                        .value((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    private List<KpiDTO.MonthlyData> getMonthlyMovements() {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(12);
        return movementRepository.countByMonthAndType(startDate).stream()
                .map(row -> KpiDTO.MonthlyData.builder()
                        .month((String) row[0])
                        .entries(((Number) row[2]).longValue())
                        .exits(0L) // Simplified for now
                        .build())
                .collect(Collectors.toList());
    }

    private String getStatusColor(ArchiveStatus status) {
        return switch (status) {
            case ACTIVE -> "#10b981";
            case ON_LOAN -> "#f59e0b";
            case IN_TRANSFER -> "#3b82f6";
            case PENDING_DESTRUCTION -> "#ef4444";
            case DESTROYED -> "#6b7280";
            case ARCHIVED -> "#8b5cf6";
            case EXPIRED -> "#ef4444";
        };
    }
}
