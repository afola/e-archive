package com.banque.archives.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workflow_requests", indexes = {
    @Index(name = "idx_workflow_type", columnList = "type"),
    @Index(name = "idx_workflow_status", columnList = "status"),
    @Index(name = "idx_workflow_requester_id", columnList = "requester_id")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "archive_id")
    private Archive archive;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private WorkflowType type;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private WorkflowPriority priority = WorkflowPriority.NORMAL;

    // Requester
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    // Workflow Progress
    @Column(name = "current_step")
    @Builder.Default
    private Integer currentStep = 1;

    @Column(name = "total_steps")
    @Builder.Default
    private Integer totalSteps = 3;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private WorkflowStatus status = WorkflowStatus.DRAFT;

    // N+1 Approval
    @Column(name = "approved_by_n1")
    private String approvedByN1;

    @Column(name = "approved_at_n1")
    private LocalDateTime approvedAtN1;

    @Column(name = "comment_n1", columnDefinition = "TEXT")
    private String commentN1;

    // Compliance Approval
    @Column(name = "approved_by_compliance")
    private String approvedByCompliance;

    @Column(name = "approved_at_compliance")
    private LocalDateTime approvedAtCompliance;

    @Column(name = "comment_compliance", columnDefinition = "TEXT")
    private String commentCompliance;

    // Manager Approval
    @Column(name = "approved_by_manager")
    private String approvedByManager;

    @Column(name = "approved_at_manager")
    private LocalDateTime approvedAtManager;

    @Column(name = "comment_manager", columnDefinition = "TEXT")
    private String commentManager;

    // Execution
    @Column(name = "executed_by")
    private String executedBy;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @Column(name = "execution_notes", columnDefinition = "TEXT")
    private String executionNotes;

    // SLA
    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Additional request data
    @Column(name = "request_data", columnDefinition = "TEXT")
    private String requestData; // JSON object

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    // Pre-persist hook
    @PrePersist
    public void prePersist() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
    }
}
