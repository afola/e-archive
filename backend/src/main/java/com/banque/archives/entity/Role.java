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
@Table(name = "roles")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "level")
    @Builder.Default
    private Integer level = 0;

    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions; // JSON array of permission codes

    @Column(name = "is_system")
    @Builder.Default
    private Boolean isSystem = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    private List<User> users = new ArrayList<>();

    // Role codes constants
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_ARCHIVIST_CENTRAL = "ARCHIVIST_CENTRAL";
    public static final String ROLE_ARCHIVIST_AGENCY = "ARCHIVIST_AGENCY";
    public static final String ROLE_COMPLIANCE = "COMPLIANCE";
    public static final String ROLE_AUDITOR = "AUDITOR";
    public static final String ROLE_USER = "USER";
}
