package com.banque.archives.repository;

import com.banque.archives.entity.Movement;
import com.banque.archives.entity.MovementStatus;
import com.banque.archives.entity.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovementRepository extends JpaRepository<Movement, String> {

    List<Movement> findByArchiveId(String archiveId);

    List<Movement> findByType(MovementType type);

    List<Movement> findByStatus(MovementStatus status);

    List<Movement> findByRequestedById(String userId);

    Optional<Movement> findByReceiptNumber(String receiptNumber);

    @Query("SELECT m FROM Movement m WHERE " +
           "(:type IS NULL OR m.type = :type) " +
           "AND (:status IS NULL OR m.status = :status) " +
           "AND (:archiveId IS NULL OR m.archive.id = :archiveId)")
    List<Movement> findByFilters(
        @Param("type") MovementType type,
        @Param("status") MovementStatus status,
        @Param("archiveId") String archiveId
    );

    @Query("SELECT m FROM Movement m WHERE m.requestedAt BETWEEN :startDate AND :endDate")
    List<Movement> findByRequestedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT m.type as type, COUNT(m) as count FROM Movement m GROUP BY m.type")
    List<Object[]> countByType();

    @Query("SELECT FUNCTION('DATE_FORMAT', m.requestedAt, '%Y-%m') as month, m.type as type, COUNT(m) as count " +
           "FROM Movement m " +
           "WHERE m.requestedAt >= :startDate " +
           "GROUP BY FUNCTION('DATE_FORMAT', m.requestedAt, '%Y-%m'), m.type " +
           "ORDER BY month")
    List<Object[]> countByMonthAndType(@Param("startDate") LocalDateTime startDate);

    long countByStatus(MovementStatus status);
}
