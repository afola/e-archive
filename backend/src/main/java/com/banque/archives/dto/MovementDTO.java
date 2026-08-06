package com.banque.archives.dto;

import com.banque.archives.entity.MovementStatus;
import com.banque.archives.entity.MovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovementDTO {

    private String id;
    private String archiveId;
    private String archiveReference;
    private String archiveTitle;
    
    private MovementType type;
    
    private String fromLocation;
    private String toLocation;
    private String fromAgency;
    private String toAgency;
    
    private String reason;
    private String notes;
    
    private String requestedById;
    private String requestedByName;
    private LocalDateTime requestedAt;
    
    private String approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    
    private String executedById;
    private String executedByName;
    private LocalDateTime executedAt;
    
    private MovementStatus status;
    private String receiptNumber;
    
    private LocalDate expectedReturnDate;
    private LocalDate actualReturnDate;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
