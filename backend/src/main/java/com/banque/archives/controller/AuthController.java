package com.banque.archives.controller;

import com.banque.archives.dto.*;
import com.banque.archives.security.AppUserPrincipal;
import com.banque.archives.security.CustomUserDetailsService;
import com.banque.archives.security.JwtService;
import com.banque.archives.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "API d'authentification")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final CustomUserDetailsService userDetailsService;

    @PostMapping("/login")
    @Operation(summary = "Authentifier un utilisateur")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        if (!StringUtils.hasText(request.getIdentifier()) || !StringUtils.hasText(request.getPassword())) {
            return ResponseEntity.badRequest().build();
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getIdentifier(), request.getPassword())
        );

        AppUserPrincipal userDetails = (AppUserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        UserDTO user = userService.findByUsernameOrEmail(request.getIdentifier());
        userService.updateLastLogin(user.getId());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getExpirationTime())
                .user(user)
                .build());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rafraîchir le token")
    public ResponseEntity<AuthResponse> refreshToken(
            @RequestBody(required = false) RefreshTokenRequest request,
            @Parameter(description = "Refresh token") @RequestParam(required = false) String refreshToken
    ) {
        String effectiveRefreshToken = request != null ? request.getRefreshToken() : refreshToken;
        if (!StringUtils.hasText(effectiveRefreshToken)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String username = jwtService.extractUsername(effectiveRefreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.isTokenValid(effectiveRefreshToken, userDetails)) {
                return ResponseEntity.status(401).build();
            }

            String newToken = jwtService.generateToken(userDetails);
            UserDTO user = userService.findByUsernameOrEmail(username);

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(newToken)
                    .refreshToken(effectiveRefreshToken)
                    .expiresIn(jwtService.getExpirationTime())
                    .user(user)
                    .build());
        } catch (Exception ex) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Obtenir le profil de l'utilisateur connecté")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal AppUserPrincipal userDetails) {
        return ResponseEntity.ok(userService.findByUsername(userDetails.getUsername()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Déconnexion")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal AppUserPrincipal userDetails) {
        // In a real implementation, you would invalidate the token
        // For now, we just return success
        return ResponseEntity.ok().build();
    }
}
