package com.banque.archives.repository;

import com.banque.archives.entity.AuditAction;
import com.banque.archives.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    List<AuditLog> findByUserId(String userId);

    List<AuditLog> findByArchiveId(String archiveId);

    List<AuditLog> findByAction(AuditAction action);

    Page<AuditLog> findByIsSensitiveTrue(Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:userId IS NULL OR a.user.id = :userId) " +
           "AND (:action IS NULL OR a.action = :action) " +
           "AND (:archiveId IS NULL OR a.archive.id = :archiveId) " +
           "AND (:startDate IS NULL OR a.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR a.createdAt <= :endDate)")
    Page<AuditLog> findByFilters(
        @Param("userId") String userId,
        @Param("action") AuditAction action,
        @Param("archiveId") String archiveId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :startDate AND :endDate")
    List<AuditLog> findByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT a.action as action, COUNT(a) as count FROM AuditLog a GROUP BY a.action")
    List<Object[]> countByAction();

    @Query("SELECT a.user.name as userName, COUNT(a) as count FROM AuditLog a GROUP BY a.user.id, a.user.name ORDER BY count DESC")
    List<Object[]> countByUser();

    long countByIsSensitiveTrue();
}
