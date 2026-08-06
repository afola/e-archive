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
@Table(name = "locations")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id")
    private Agency agency;

    @Column(name = "site")
    private String site;

    @Column(name = "building")
    private String building;

    @Column(name = "room")
    private String room;

    @Column(name = "shelf")
    private String shelf;

    @Column(name = "box")
    private String box;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "current_load")
    @Builder.Default
    private Integer currentLoad = 0;

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
    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL)
    private List<Archive> archives = new ArrayList<>();

    // Helper method
    public String getFullPath() {
        StringBuilder path = new StringBuilder();
        if (site != null) path.append(site);
        if (building != null) path.append("/").append(building);
        if (room != null) path.append("/").append(room);
        if (shelf != null) path.append("/").append(shelf);
        if (box != null) path.append("/").append(box);
        return path.toString();
    }
}
