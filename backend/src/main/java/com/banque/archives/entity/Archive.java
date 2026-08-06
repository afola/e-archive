package com.banque.archives.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "archives", indexes = {
    @Index(name = "idx_archive_reference", columnList = "reference"),
    @Index(name = "idx_archive_client_name", columnList = "client_name"),
    @Index(name = "idx_archive_account_number", columnList = "account_number"),
    @Index(name = "idx_archive_status", columnList = "status"),
    @Index(name = "idx_archive_retention_end_date", columnList = "retention_end_date")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Archive {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "reference", nullable = false, unique = true)
    private String reference;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Type and Classification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private ArchiveType type;

    @Column(name = "category_id")
    private String categoryId;

    @Column(name = "sub_category_id")
    private String subCategoryId;

    // Client/Account Information
    @Column(name = "client_name")
    private String clientName;

    @Column(name = "client_number")
    private String clientNumber;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "dossier_number")
    private String dossierNumber;

    // Ownership
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @Column(name = "department")
    private String department;

    @Column(name = "owner_service")
    private String ownerService;

    // Dates
    @Column(name = "document_date")
    private LocalDate documentDate;

    @Column(name = "archive_date", nullable = false)
    private LocalDate archiveDate;

    @Column(name = "retention_end_date", nullable = false)
    private LocalDate retentionEndDate;

    @Column(name = "destruction_date")
    private LocalDate destructionDate;

    // Status and Classification
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ArchiveStatus status = ArchiveStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "confidentiality", nullable = false)
    @Builder.Default
    private ConfidentialityLevel confidentiality = ConfidentialityLevel.NORMAL;

    @Column(name = "version")
    @Builder.Default
    private Integer version = 1;

    // Physical Location
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "box_number")
    private String boxNumber;

    @Column(name = "physical_notes", columnDefinition = "TEXT")
    private String physicalNotes;

    // Digital Information
    @Column(name = "has_digital_copy")
    @Builder.Default
    private Boolean hasDigitalCopy = false;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "mime_type")
    private String mimeType;

    // Metadata
    @Column(name = "keywords", columnDefinition = "TEXT")
    private String keywords; // JSON array

    @Column(name = "custom_fields", columnDefinition = "TEXT")
    private String customFields; // JSON object

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags; // JSON array

    // Parent Archive (for hierarchy)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_archive_id")
    private Archive parentArchive;

    // Tracking
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    @Column(name = "last_action_at")
    private LocalDateTime lastActionAt;

    @Column(name = "last_action_type")
    private String lastActionType;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "parentArchive", cascade = CascadeType.ALL)
    private List<Archive> childArchives = new ArrayList<>();

    @OneToMany(mappedBy = "archive", cascade = CascadeType.ALL)
    private List<Movement> movements = new ArrayList<>();

    @OneToMany(mappedBy = "archive", cascade = CascadeType.ALL)
    private List<WorkflowRequest> workflowRequests = new ArrayList<>();

    @OneToMany(mappedBy = "archive", cascade = CascadeType.ALL)
    private List<AuditLog> auditLogs = new ArrayList<>();

    @OneToMany(mappedBy = "archive", cascade = CascadeType.ALL)
    private List<ArchiveFile> files = new ArrayList<>();

    @OneToMany(mappedBy = "archive", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();
}
