package com.banque.archives.repository;

import com.banque.archives.entity.WorkflowRequest;
import com.banque.archives.entity.WorkflowStatus;
import com.banque.archives.entity.WorkflowType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkflowRequestRepository extends JpaRepository<WorkflowRequest, String> {

    List<WorkflowRequest> findByRequesterId(String requesterId);

    List<WorkflowRequest> findByArchiveId(String archiveId);

    List<WorkflowRequest> findByStatus(WorkflowStatus status);

    List<WorkflowRequest> findByType(WorkflowType type);

    Page<WorkflowRequest> findByStatusIn(List<WorkflowStatus> statuses, Pageable pageable);

    @Query("SELECT w FROM WorkflowRequest w WHERE " +
           "(:type IS NULL OR w.type = :type) " +
           "AND (:status IS NULL OR w.status = :status) " +
           "AND (:requesterId IS NULL OR w.requester.id = :requesterId)")
    Page<WorkflowRequest> findByFilters(
        @Param("type") WorkflowType type,
        @Param("status") WorkflowStatus status,
        @Param("requesterId") String requesterId,
        Pageable pageable
    );

    @Query("SELECT w FROM WorkflowRequest w WHERE w.dueDate < :date AND w.status NOT IN :statuses")
    List<WorkflowRequest> findOverdueRequests(
        @Param("date") LocalDateTime date,
        @Param("statuses") List<WorkflowStatus> statuses
    );

    @Query("SELECT w.status as status, COUNT(w) as count FROM WorkflowRequest w GROUP BY w.status")
    List<Object[]> countByStatus();

    @Query("SELECT w.priority as priority, COUNT(w) as count FROM WorkflowRequest w GROUP BY w.priority")
    List<Object[]> countByPriority();

    long countByStatus(WorkflowStatus status);

    long countByStatusIn(List<WorkflowStatus> statuses);
}
