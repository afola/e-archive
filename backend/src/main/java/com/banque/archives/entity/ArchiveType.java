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
@Table(name = "archive_types")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchiveType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "retention_years", nullable = false)
    private Integer retentionYears;

    @Column(name = "category")
    private String category;

    @Column(name = "sub_category")
    private String subCategory;

    @Column(name = "color")
    @Builder.Default
    private String color = "#3b82f6";

    @Column(name = "icon")
    private String icon;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "type", cascade = CascadeType.ALL)
    private List<Archive> archives = new ArrayList<>();

    // Archive type codes
    public static final String KYC = "KYC";
    public static final String CREDIT = "CREDIT";
    public static final String CONTRACT = "CONTRACT";
    public static final String ACCOUNTING = "ACCOUNTING";
    public static final String HR = "HR";
    public static final String LEGAL = "LEGAL";
    public static final String COMMITTEE = "COMMITTEE";
    public static final String REGULATORY = "REGULATORY";
    public static final String TRANSACTION = "TRANSACTION";
    public static final String LITIGATION = "LITIGATION";
}
