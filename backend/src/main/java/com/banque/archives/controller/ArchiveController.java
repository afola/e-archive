package com.banque.archives.controller;

import com.banque.archives.dto.*;
import com.banque.archives.entity.ArchiveStatus;
import com.banque.archives.security.AppUserPrincipal;
import com.banque.archives.service.ArchiveService;
import com.banque.archives.service.KpiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/archives")
@RequiredArgsConstructor
@Tag(name = "Archives", description = "API de gestion des archives")
public class ArchiveController {

    private final ArchiveService archiveService;
    private final KpiService kpiService;

    @GetMapping
    @Operation(summary = "Lister toutes les archives avec pagination")
    public ResponseEntity<PageResponse<ArchiveDTO>> findAll(
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Tri par") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Direction du tri") @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(archiveService.findAll(pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des archives avec filtres")
    public ResponseEntity<PageResponse<ArchiveDTO>> search(@Valid ArchiveSearchRequest request) {
        return ResponseEntity.ok(archiveService.search(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une archive par ID")
    public ResponseEntity<ArchiveDTO> findById(
            @Parameter(description = "ID de l'archive") @PathVariable String id
    ) {
        return ResponseEntity.ok(archiveService.findById(id));
    }

    @GetMapping("/reference/{reference}")
    @Operation(summary = "Obtenir une archive par référence")
    public ResponseEntity<ArchiveDTO> findByReference(
            @Parameter(description = "Référence de l'archive") @PathVariable String reference
    ) {
        return ResponseEntity.ok(archiveService.findByReference(reference));
    }

    @GetMapping("/expiring")
    @Operation(summary = "Obtenir les archives arrivant à échéance")
    public ResponseEntity<List<ArchiveDTO>> findExpiring(
            @Parameter(description = "Nombre de jours") @RequestParam(defaultValue = "90") int days
    ) {
        return ResponseEntity.ok(archiveService.findExpiringArchives(days));
    }

    @GetMapping("/expired")
    @Operation(summary = "Obtenir les archives expirées")
    public ResponseEntity<List<ArchiveDTO>> findExpired() {
        return ResponseEntity.ok(archiveService.findExpiredArchives());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY')")
    @Operation(summary = "Créer une nouvelle archive")
    public ResponseEntity<ArchiveDTO> create(
            @Valid @RequestBody ArchiveCreateRequest request,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails.getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(archiveService.create(request, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY')")
    @Operation(summary = "Mettre à jour une archive")
    public ResponseEntity<ArchiveDTO> update(
            @Parameter(description = "ID de l'archive") @PathVariable String id,
            @Valid @RequestBody ArchiveCreateRequest request,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails.getId();
        return ResponseEntity.ok(archiveService.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','COMPLIANCE')")
    @Operation(summary = "Supprimer une archive")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID de l'archive") @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails.getId();
        archiveService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY','COMPLIANCE')")
    @Operation(summary = "Changer le statut d'une archive")
    public ResponseEntity<ArchiveDTO> changeStatus(
            @Parameter(description = "ID de l'archive") @PathVariable String id,
            @Parameter(description = "Nouveau statut") @RequestParam ArchiveStatus status,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails.getId();
        return ResponseEntity.ok(archiveService.changeStatus(id, status, userId));
    }

    // Statistics endpoints
    @GetMapping("/statistics")
    @Operation(summary = "Obtenir les statistiques des archives")
    public ResponseEntity<KpiDTO> getStatistics() {
        return ResponseEntity.ok(kpiService.getKpis());
    }

    @GetMapping("/count")
    @Operation(summary = "Compter toutes les archives")
    public ResponseEntity<Long> countAll() {
        return ResponseEntity.ok(archiveService.countAll());
    }

    @GetMapping("/count/status/{status}")
    @Operation(summary = "Compter les archives par statut")
    public ResponseEntity<Long> countByStatus(
            @Parameter(description = "Statut") @PathVariable ArchiveStatus status
    ) {
        return ResponseEntity.ok(archiveService.countByStatus(status));
    }
}
