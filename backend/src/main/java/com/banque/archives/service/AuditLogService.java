package com.banque.archives.service;

import com.banque.archives.entity.*;
import com.banque.archives.repository.AuditLogRepository;
import com.banque.archives.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void log(String userId, AuditAction action, String entityType, String entityId, String details) {
        log(userId, action, entityType, entityId, details, action.isSensitive());
    }

    public void log(String userId, AuditAction action, String entityType, String entityId, String details, boolean isSensitive) {
        User user = userRepository.findById(userId).orElse(null);

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .isSensitive(isSensitive)
                .build();

        auditLogRepository.save(auditLog);
        log.debug("Audit log: {} - {} - {} - {}", userId, action, entityType, entityId);
    }

    public void logWithMetadata(String userId, AuditAction action, String entityType, String entityId,
                                String details, String ipAddress, String userAgent, String sessionId) {
        User user = userRepository.findById(userId).orElse(null);

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .sessionId(sessionId)
                .isSensitive(action.isSensitive())
                .build();

        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> findByFilters(String userId, AuditAction action, String archiveId,
                                        LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findByFilters(userId, action, archiveId, startDate, endDate, pageable);
    }

    @Transactional(readOnly = true)
    public long countSensitiveActions() {
        return auditLogRepository.countByIsSensitiveTrue();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getActionStatistics() {
        Map<String, Long> stats = new HashMap<>();
        auditLogRepository.countByAction()
                .forEach(row -> stats.put(((AuditAction) row[0]).name(), (Long) row[1]));
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getUserStatistics() {
        Map<String, Long> stats = new HashMap<>();
        auditLogRepository.countByUser()
                .forEach(row -> stats.put((String) row[0], (Long) row[1]));
        return stats;
    }
}
