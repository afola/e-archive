package com.banque.archives.dto;

import com.banque.archives.entity.WorkflowPriority;
import com.banque.archives.entity.WorkflowStatus;
import com.banque.archives.entity.WorkflowType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowRequestDTO {

    private String id;
    private String archiveId;
    private String archiveReference;
    private String archiveTitle;
    
    private WorkflowType type;
    
    @NotBlank(message = "Le titre est obligatoire")
    private String title;
    
    private String description;
    
    private WorkflowPriority priority;
    
    private String requesterId;
    private String requesterName;
    private LocalDateTime requestedAt;
    
    private Integer currentStep;
    private Integer totalSteps;
    
    private WorkflowStatus status;
    
    // Approvals
    private String approvedByN1;
    private LocalDateTime approvedAtN1;
    private String commentN1;
    
    private String approvedByCompliance;
    private LocalDateTime approvedAtCompliance;
    private String commentCompliance;
    
    private String approvedByManager;
    private LocalDateTime approvedAtManager;
    private String commentManager;
    
    private String executedBy;
    private String executedByName;
    private LocalDateTime executedAt;
    private String executionNotes;
    
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
