package com.banque.archives.controller;

import com.banque.archives.dto.*;
import com.banque.archives.security.AppUserPrincipal;
import com.banque.archives.service.UserService;
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
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Utilisateurs", description = "API de gestion des utilisateurs")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister tous les utilisateurs")
    public ResponseEntity<List<UserDTO>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Rechercher des utilisateurs avec filtres")
    public ResponseEntity<List<UserDTO>> search(
            @Parameter(description = "Terme de recherche") @RequestParam(required = false) String search,
            @Parameter(description = "ID du rôle") @RequestParam(required = false) String roleId,
            @Parameter(description = "ID de l'agence") @RequestParam(required = false) String agencyId
    ) {
        return ResponseEntity.ok(userService.findByFilters(search, roleId, agencyId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    @Operation(summary = "Obtenir un utilisateur par ID")
    public ResponseEntity<UserDTO> findById(
            @Parameter(description = "ID de l'utilisateur") @PathVariable String id
    ) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtenir le profil de l'utilisateur connecté")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal AppUserPrincipal userDetails) {
        return ResponseEntity.ok(userService.findByUsername(userDetails.getUsername()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un nouvel utilisateur")
    public ResponseEntity<UserDTO> create(
            @Valid @RequestBody UserCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(request.getUser(), request.getPassword()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    @Operation(summary = "Mettre à jour un utilisateur")
    public ResponseEntity<UserDTO> update(
            @Parameter(description = "ID de l'utilisateur") @PathVariable String id,
            @Valid @RequestBody UserDTO dto
    ) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    @PostMapping("/{id}/change-password")
    @PreAuthorize("#id == principal.id")
    @Operation(summary = "Changer le mot de passe")
    public ResponseEntity<Void> changePassword(
            @Parameter(description = "ID de l'utilisateur") @PathVariable String id,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Réinitialiser le mot de passe")
    public ResponseEntity<Void> resetPassword(
            @Parameter(description = "ID de l'utilisateur") @PathVariable String id,
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        userService.resetPassword(id, request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Désactiver un utilisateur")
    public ResponseEntity<Void> deactivate(
            @Parameter(description = "ID de l'utilisateur") @PathVariable String id
    ) {
        userService.deactivate(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activer un utilisateur")
    public ResponseEntity<Void> activate(
            @Parameter(description = "ID de l'utilisateur") @PathVariable String id
    ) {
        userService.activate(id);
        return ResponseEntity.ok().build();
    }
}
