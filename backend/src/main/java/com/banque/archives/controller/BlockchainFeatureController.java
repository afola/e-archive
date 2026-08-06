package com.banque.archives.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/blockchain")
@Tag(name = "Blockchain Feature", description = "API de certification blockchain simulée")
public class BlockchainFeatureController {

    private final Map<String, Map<String, Object>> proofs = new ConcurrentHashMap<>();

    @PostMapping("/register")
    @Operation(summary = "Enregistrer un document")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String documentId = stringValue(body.get("documentId"));
        if (!StringUtils.hasText(documentId)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Document ID is required"));
        }

        Map<String, Object> proof = proofs.computeIfAbsent(documentId, this::createProof);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "proof", proof,
                        "message", "Document successfully registered on blockchain"
                )
        ));
    }

    @GetMapping("/register")
    @Operation(summary = "Récupérer une preuve")
    public ResponseEntity<?> getProof(@RequestParam String documentId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "proof", proofs.get(documentId),
                        "registered", proofs.containsKey(documentId)
                )
        ));
    }

    @PostMapping("/verify")
    @Operation(summary = "Vérifier un document")
    public ResponseEntity<?> verify(@RequestBody Map<String, Object> body) {
        String documentId = stringValue(body.get("documentId"));
        String providedHash = stringValue(body.get("providedHash"));

        if (!StringUtils.hasText(documentId) && !StringUtils.hasText(providedHash)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Document ID or hash is required"));
        }

        Map<String, Object> proof = StringUtils.hasText(documentId) ? proofs.computeIfAbsent(documentId, this::createProof) : null;
        String currentHash = proof != null ? String.valueOf(proof.get("hash")) : providedHash;
        String storedHash = proof != null ? String.valueOf(proof.get("hash")) : providedHash;
        boolean verified = currentHash.equals(storedHash);

        LinkedHashMap<String, Object> result = new LinkedHashMap<>();
        result.put("verified", verified);
        result.put("documentId", StringUtils.hasText(documentId) ? documentId : "unknown");
        result.put("documentReference", proof != null ? proof.get("documentReference") : "unknown");
        result.put("hash", currentHash);
        result.put("storedHash", storedHash);
        result.put("hashMatch", verified);
        result.put("timestamp", proof != null ? proof.get("timestamp") : null);
        result.put("verificationDate", OffsetDateTime.now().toString());
        result.put("details", Map.of(
                "documentIntegrity", verified,
                "tamperEvidence", true,
                "authenticity", verified
        ));

        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }

    @GetMapping("/verify")
    @Operation(summary = "Vérifier si un document a une preuve")
    public ResponseEntity<?> getVerify(@RequestParam String documentId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "isVerified", proofs.containsKey(documentId),
                        "verifiedAt", proofs.containsKey(documentId) ? proofs.get(documentId).get("timestamp") : null
                )
        ));
    }

    private Map<String, Object> createProof(String documentId) {
        LinkedHashMap<String, Object> proof = new LinkedHashMap<>();
        String hash = sha256(documentId);
        proof.put("documentId", documentId);
        proof.put("documentReference", "ARC-" + documentId.toUpperCase());
        proof.put("documentTitle", "Document certifié");
        proof.put("hash", hash);
        proof.put("transactionId", "0x" + sha256(documentId + "-tx").substring(0, 64));
        proof.put("blockNumber", 18500000 + Math.abs(documentId.hashCode() % 10000));
        proof.put("timestamp", OffsetDateTime.now().toString());
        proof.put("network", "Ethereum Mainnet (Simulated)");
        proof.put("verified", true);
        return proof;
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponible", exception);
        }
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}
