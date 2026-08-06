package com.banque.archives.controller;

import com.banque.archives.dto.*;
import com.banque.archives.entity.*;
import com.banque.archives.security.AppUserPrincipal;
import com.banque.archives.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
@RequestMapping("/workflows")
@RequiredArgsConstructor
@Tag(name = "Workflows", description = "API de gestion des demandes et workflows")
public class WorkflowController {

    private final WorkflowService workflowService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY','COMPLIANCE','AUDITOR')")
    @Operation(summary = "Lister toutes les demandes avec pagination")
    public ResponseEntity<Page<WorkflowRequestDTO>> findAll(
            @Parameter(description = "Type de demande") @RequestParam(required = false) WorkflowType type,
            @Parameter(description = "Statut") @RequestParam(required = false) WorkflowStatus status,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(workflowService.findByFilters(type, status, null, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une demande par ID")
    public ResponseEntity<WorkflowRequestDTO> findById(
            @Parameter(description = "ID de la demande") @PathVariable String id
    ) {
        return ResponseEntity.ok(workflowService.findById(id));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY','COMPLIANCE')")
    @Operation(summary = "Obtenir les demandes en attente d'approbation")
    public ResponseEntity<List<WorkflowRequestDTO>> findPendingApprovals(
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails.getId();
        return ResponseEntity.ok(workflowService.findPendingApprovals(userId));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Obtenir mes demandes")
    public ResponseEntity<Page<WorkflowRequestDTO>> findMyRequests(
            @AuthenticationPrincipal AppUserPrincipal userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String userId = userDetails.getId();
        return ResponseEntity.ok(workflowService.findByFilters(null, null, userId, pageable));
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle demande")
    public ResponseEntity<WorkflowRequestDTO> create(
            @Valid @RequestBody WorkflowRequestDTO dto,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails.getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workflowService.create(dto, userId));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Soumettre une demande")
    public ResponseEntity<WorkflowRequestDTO> submit(
            @Parameter(description = "ID de la demande") @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails.getId();
        return ResponseEntity.ok(workflowService.submit(id, userId));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY','COMPLIANCE')")
    @Operation(summary = "Approuver une demande")
    public ResponseEntity<WorkflowRequestDTO> approve(
            @Parameter(description = "ID de la demande") @PathVariable String id,
            @Parameter(description = "Commentaire") @RequestParam(required = false) String comment,
            @Parameter(description = "Étape") @RequestParam int step,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails.getId();
        return ResponseEntity.ok(workflowService.approve(id, userId, comment, step));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY','COMPLIANCE')")
    @Operation(summary = "Rejeter une demande")
    public ResponseEntity<WorkflowRequestDTO> reject(
            @Parameter(description = "ID de la demande") @PathVariable String id,
            @Parameter(description = "Raison du rejet") @RequestParam String reason,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails.getId();
        return ResponseEntity.ok(workflowService.reject(id, userId, reason));
    }

    @PostMapping("/{id}/execute")
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY','COMPLIANCE')")
    @Operation(summary = "Exécuter une demande")
    public ResponseEntity<WorkflowRequestDTO> execute(
            @Parameter(description = "ID de la demande") @PathVariable String id,
            @Parameter(description = "Notes d'exécution") @RequestParam(required = false) String notes,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails.getId();
        return ResponseEntity.ok(workflowService.execute(id, userId, notes));
    }

    // Statistics
    @GetMapping("/count/status/{status}")
    @Operation(summary = "Compter les demandes par statut")
    public ResponseEntity<Long> countByStatus(
            @Parameter(description = "Statut") @PathVariable WorkflowStatus status
    ) {
        return ResponseEntity.ok(workflowService.countByStatus(status));
    }

    @GetMapping("/count/pending")
    @Operation(summary = "Compter les demandes en attente")
    public ResponseEntity<Long> countPending() {
        return ResponseEntity.ok(workflowService.countPending());
    }
}
