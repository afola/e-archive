package com.banque.archives.repository;

import com.banque.archives.entity.Archive;
import com.banque.archives.entity.ArchiveStatus;
import com.banque.archives.entity.ConfidentialityLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ArchiveRepository extends JpaRepository<Archive, String> {

    Optional<Archive> findByReference(String reference);

    boolean existsByReference(String reference);

    Page<Archive> findByStatus(ArchiveStatus status, Pageable pageable);

    Page<Archive> findByAgencyId(String agencyId, Pageable pageable);

    Page<Archive> findByTypeId(String typeId, Pageable pageable);

    @Query("SELECT a FROM Archive a WHERE " +
           "(:search IS NULL OR LOWER(a.reference) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.clientName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.accountNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Archive> search(@Param("search") String search, Pageable pageable);

    @Query("SELECT a FROM Archive a WHERE " +
           "(:status IS NULL OR a.status = :status) " +
           "AND (:typeId IS NULL OR a.type.id = :typeId) " +
           "AND (:agencyId IS NULL OR a.agency.id = :agencyId) " +
           "AND (:confidentiality IS NULL OR a.confidentiality = :confidentiality) " +
           "AND (:clientName IS NULL OR LOWER(a.clientName) LIKE LOWER(CONCAT('%', :clientName, '%'))) " +
           "AND (:accountNumber IS NULL OR LOWER(a.accountNumber) LIKE LOWER(CONCAT('%', :accountNumber, '%')))")
    Page<Archive> findByFilters(
        @Param("status") ArchiveStatus status,
        @Param("typeId") String typeId,
        @Param("agencyId") String agencyId,
        @Param("confidentiality") ConfidentialityLevel confidentiality,
        @Param("clientName") String clientName,
        @Param("accountNumber") String accountNumber,
        Pageable pageable
    );

    @Query("SELECT a FROM Archive a WHERE a.retentionEndDate BETWEEN :startDate AND :endDate")
    List<Archive> findByRetentionEndDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT a FROM Archive a WHERE a.retentionEndDate < :date")
    List<Archive> findExpiredArchives(@Param("date") LocalDate date);

    @Query("SELECT a FROM Archive a WHERE a.retentionEndDate BETWEEN :startDate AND :endDate AND a.status NOT IN (com.banque.archives.entity.ArchiveStatus.DESTROYED, com.banque.archives.entity.ArchiveStatus.ARCHIVED)")
    List<Archive> findArchivesNearExpiration(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    long countByStatus(ArchiveStatus status);

    long countByAgencyId(String agencyId);

    long countByTypeId(String typeId);

    @Query("SELECT COUNT(a) FROM Archive a WHERE a.retentionEndDate < :date")
    long countExpiredArchives(@Param("date") LocalDate date);

    @Query("SELECT a.type.name as typeName, COUNT(a) as count FROM Archive a GROUP BY a.type.id, a.type.name")
    List<Object[]> countByType();

    @Query("SELECT a.agency.name as agencyName, COUNT(a) as count FROM Archive a GROUP BY a.agency.id, a.agency.name")
    List<Object[]> countByAgency();

    @Query("SELECT a.status as status, COUNT(a) as count FROM Archive a GROUP BY a.status")
    List<Object[]> countByStatus();

    @Query("SELECT FUNCTION('DATE_FORMAT', a.archiveDate, '%Y-%m') as month, COUNT(a) as count " +
           "FROM Archive a " +
           "WHERE a.archiveDate >= :startDate " +
           "GROUP BY FUNCTION('DATE_FORMAT', a.archiveDate, '%Y-%m') " +
           "ORDER BY month")
    List<Object[]> countByMonth(@Param("startDate") LocalDate startDate);
}
