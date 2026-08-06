package com.banque.archives.controller;

import com.banque.archives.dto.MovementCreateRequest;
import com.banque.archives.dto.MovementDTO;
import com.banque.archives.entity.MovementStatus;
import com.banque.archives.entity.MovementType;
import com.banque.archives.security.AppUserPrincipal;
import com.banque.archives.service.MovementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movements")
@RequiredArgsConstructor
@Tag(name = "Mouvements", description = "API de gestion des mouvements physiques")
public class MovementController {

    private final MovementService movementService;

    @GetMapping
    @Operation(summary = "Lister tous les mouvements avec filtres optionnels")
    public ResponseEntity<List<MovementDTO>> findByFilters(
            @Parameter(description = "Type de mouvement") @RequestParam(required = false) MovementType type,
            @Parameter(description = "Statut") @RequestParam(required = false) MovementStatus status,
            @Parameter(description = "ID archive") @RequestParam(required = false) String archiveId
    ) {
        return ResponseEntity.ok(movementService.findByFilters(type, status, archiveId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un mouvement par ID")
    public ResponseEntity<MovementDTO> findById(
            @Parameter(description = "ID du mouvement") @PathVariable String id
    ) {
        return ResponseEntity.ok(movementService.findById(id));
    }

    @GetMapping("/receipt/{receiptNumber}")
    @Operation(summary = "Obtenir un mouvement par numéro de récépissé")
    public ResponseEntity<MovementDTO> findByReceiptNumber(
            @Parameter(description = "Numéro de récépissé") @PathVariable String receiptNumber
    ) {
        return ResponseEntity.ok(movementService.findByReceiptNumber(receiptNumber));
    }

    @GetMapping("/archive/{archiveId}")
    @Operation(summary = "Lister les mouvements d'une archive")
    public ResponseEntity<List<MovementDTO>> findByArchiveId(
            @Parameter(description = "ID de l'archive") @PathVariable String archiveId
    ) {
        return ResponseEntity.ok(movementService.findByArchiveId(archiveId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Lister les mouvements par statut")
    public ResponseEntity<List<MovementDTO>> findByStatus(
            @Parameter(description = "Statut") @PathVariable MovementStatus status
    ) {
        return ResponseEntity.ok(movementService.findByStatus(status));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Lister les mouvements par type")
    public ResponseEntity<List<MovementDTO>> findByType(
            @Parameter(description = "Type") @PathVariable MovementType type
    ) {
        return ResponseEntity.ok(movementService.findByType(type));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY','COMPLIANCE','AUDITOR') or #userId == principal.id")
    @Operation(summary = "Lister les mouvements demandés par un utilisateur")
    public ResponseEntity<List<MovementDTO>> findByUser(
            @Parameter(description = "ID utilisateur") @PathVariable String userId
    ) {
        return ResponseEntity.ok(movementService.findByUserId(userId));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Lister mes demandes de mouvement")
    public ResponseEntity<List<MovementDTO>> findMyRequests(
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        return ResponseEntity.ok(movementService.findByUserId(userDetails.getId()));
    }

    @PostMapping
    @Operation(summary = "Créer une demande de mouvement")
    public ResponseEntity<MovementDTO> create(
            @Valid @RequestBody MovementCreateRequest request,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        MovementDTO movement = movementService.createMovement(
                request.getArchiveId(),
                request.getType(),
                request.getReason(),
                request.getFromLocation(),
                request.getToLocation(),
                request.getFromAgency(),
                request.getToAgency(),
                userDetails.getId(),
                request.getExpectedReturnDate()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(movement);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY','COMPLIANCE')")
    @Operation(summary = "Approuver un mouvement")
    public ResponseEntity<MovementDTO> approve(
            @Parameter(description = "ID du mouvement") @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal userDetails,
            @Parameter(description = "Notes") @RequestParam(required = false) String notes
    ) {
        return ResponseEntity.ok(movementService.approveMovement(id, userDetails.getId(), notes));
    }

    @PostMapping("/{id}/execute")
    @PreAuthorize("hasAnyRole('ADMIN','ARCHIVIST_CENTRAL','ARCHIVIST_AGENCY','COMPLIANCE')")
    @Operation(summary = "Exécuter un mouvement")
    public ResponseEntity<MovementDTO> execute(
            @Parameter(description = "ID du mouvement") @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal userDetails,
            @Parameter(description = "Notes") @RequestParam(required = false) String notes
    ) {
        return ResponseEntity.ok(movementService.executeMovement(id, userDetails.getId(), notes));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Annuler un mouvement")
    public ResponseEntity<MovementDTO> cancel(
            @Parameter(description = "ID du mouvement") @PathVariable String id,
            @AuthenticationPrincipal AppUserPrincipal userDetails,
            @Parameter(description = "Raison") @RequestParam(required = false) String reason
    ) {
        return ResponseEntity.ok(movementService.cancelMovement(id, userDetails.getId(), reason));
    }

    @GetMapping("/count")
    @Operation(summary = "Compter tous les mouvements")
    public ResponseEntity<Long> countAll() {
        return ResponseEntity.ok(movementService.countAll());
    }

    @GetMapping("/count/status/{status}")
    @Operation(summary = "Compter les mouvements par statut")
    public ResponseEntity<Long> countByStatus(
            @Parameter(description = "Statut") @PathVariable MovementStatus status
    ) {
        return ResponseEntity.ok(movementService.countByStatus(status));
    }
}
