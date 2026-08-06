package com.banque.archives.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/lifecycle")
@Tag(name = "Lifecycle Feature", description = "API cycle de vie des archives")
public class LifecycleFeatureController {

    private final List<Map<String, Object>> extensionHistory = new CopyOnWriteArrayList<>();
    private final List<Map<String, Object>> destructionRequests = new CopyOnWriteArrayList<>();
    private final List<Map<String, Object>> destructionCertificates = new CopyOnWriteArrayList<>();
    private final List<Map<String, Object>> archivePool = new ArrayList<>();

    @PostConstruct
    void init() {
        if (!archivePool.isEmpty()) {
            return;
        }

        archivePool.add(archive("arch-life-001", "ARC-KYC-102344", "Dossier KYC - Client Martin", "KYC", "Documents KYC", -10, "ACTIVE"));
        archivePool.add(archive("arch-life-002", "ARC-CREDIT-087112", "Contrat de prêt PME", "CREDIT", "Dossiers de Crédit", 8, "ACTIVE"));
        archivePool.add(archive("arch-life-003", "ARC-LEGAL-120045", "Convention de garantie", "LEGAL", "Documents Juridiques", 45, "ACTIVE"));
        archivePool.add(archive("arch-life-004", "ARC-RH-332010", "Dossier RH - Employé", "RH", "Documents RH", 88, "ACTIVE"));
        archivePool.add(archive("arch-life-005", "ARC-COMP-550018", "Pièce comptable clôture", "ACCOUNTING", "Pièces Comptables", 140, "ACTIVE"));
        archivePool.add(archive("arch-life-006", "ARC-KYC-200001", "Pièce d'identité client", "KYC", "Documents KYC", -35, "PENDING_DESTRUCTION"));
    }

    @GetMapping
    @Operation(summary = "Récupérer les données du cycle de vie")
    public ResponseEntity<?> getLifecycle() {
        List<Map<String, Object>> archivesWithDaysLeft = archivePool.stream()
                .map(this::withDaysLeft)
                .collect(Collectors.toList());

        List<Map<String, Object>> expiringThisMonth = filterByDays(archivesWithDaysLeft, 1, 30);
        List<Map<String, Object>> expiringIn3Months = filterByDays(archivesWithDaysLeft, 31, 90);
        List<Map<String, Object>> expiringIn6Months = filterByDays(archivesWithDaysLeft, 91, 180);
        List<Map<String, Object>> expiredArchives = archivesWithDaysLeft.stream()
                .filter(item -> intValue(item.get("daysLeft")) <= 0)
                .collect(Collectors.toList());
        List<Map<String, Object>> readyForDestruction = expiredArchives.stream()
                .filter(item -> !"PENDING_DESTRUCTION".equals(item.get("status")) && !"DESTROYED".equals(item.get("status")))
                .collect(Collectors.toList());
        List<Map<String, Object>> pendingDestruction = archivesWithDaysLeft.stream()
                .filter(item -> "PENDING_DESTRUCTION".equals(item.get("status")))
                .collect(Collectors.toList());

        LinkedHashMap<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalArchives", archivesWithDaysLeft.size());
        stats.put("expiringThisMonth", expiringThisMonth.size());
        stats.put("expiringIn3Months", expiringIn3Months.size());
        stats.put("expiringIn6Months", expiringIn6Months.size());
        stats.put("expired", expiredArchives.size());
        stats.put("readyForDestruction", readyForDestruction.size());
        stats.put("pendingDestruction", pendingDestruction.size());
        stats.put("destroyedThisMonth", destructionCertificates.size());
        stats.put("transferredThisMonth", 2);
        stats.put("extendedThisMonth", extensionHistory.size());

        List<Map<String, Object>> retentionRules = List.of(
                retentionRule("type-kyc", "KYC", "Documents KYC", 10, "Conformité", "#2563eb", 2, 1),
                retentionRule("type-credit", "CREDIT", "Dossiers de Crédit", 10, "Crédit", "#16a34a", 1, 1),
                retentionRule("type-legal", "LEGAL", "Documents Juridiques", 15, "Juridique", "#7c3aed", 1, 1),
                retentionRule("type-rh", "RH", "Documents RH", 5, "Ressources Humaines", "#ea580c", 1, 1),
                retentionRule("type-accounting", "ACCOUNTING", "Pièces Comptables", 10, "Comptabilité", "#0891b2", 1, 1)
        );

        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("archivesWithDaysLeft", archivesWithDaysLeft);
        payload.put("expiringThisMonth", expiringThisMonth);
        payload.put("expiringIn3Months", expiringIn3Months);
        payload.put("expiringIn6Months", expiringIn6Months);
        payload.put("expiredArchives", expiredArchives);
        payload.put("readyForDestruction", readyForDestruction);
        payload.put("pendingDestruction", pendingDestruction);
        payload.put("retentionRules", retentionRules);
        payload.put("extensionHistory", extensionHistory);
        payload.put("stats", stats);
        payload.put("currentMonth", LocalDate.now().getMonthValue() - 1);
        payload.put("currentYear", LocalDate.now().getYear());
        return ResponseEntity.ok(payload);
    }

    @PutMapping
    @Operation(summary = "Prolonger la conservation")
    public ResponseEntity<?> extendRetention(@RequestBody Map<String, Object> body) {
        List<String> archiveIds = stringList(body.get("archiveIds"));
        String newDate = stringValue(body.get("newDate"));
        String reason = StringUtils.hasText(stringValue(body.get("reason"))) ? stringValue(body.get("reason")) : "Prolongation de conservation";

        if (archiveIds.isEmpty() || !StringUtils.hasText(newDate)) {
            return ResponseEntity.badRequest().body(Map.of("error", "archiveIds et newDate requis"));
        }

        String now = OffsetDateTime.now().toString();
        List<Map<String, Object>> created = new ArrayList<>();
        for (String archiveId : archiveIds) {
            Map<String, Object> archive = findArchive(archiveId);
            if (archive == null) {
                continue;
            }

            LinkedHashMap<String, Object> extension = new LinkedHashMap<>();
            extension.put("id", "ext-" + System.nanoTime());
            extension.put("archiveIds", List.of(archiveId));
            extension.put("previousDate", archive.get("retentionEndDate"));
            extension.put("newDate", newDate);
            extension.put("reason", reason);
            extension.put("extendedBy", "user-admin");
            extension.put("extendedByName", "Administrateur Systeme");
            extension.put("extendedAt", now);
            extensionHistory.add(extension);
            created.add(extension);

            archive.put("retentionEndDate", newDate);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "extensions", created,
                "message", archiveIds.size() + " archive(s) prolongée(s) avec succès",
                "newRetentionDate", newDate
        ));
    }

    @GetMapping("/destruction")
    @Operation(summary = "Récupérer les demandes de destruction")
    public ResponseEntity<?> getDestruction(@RequestParam(required = false) String type) {
        if ("certificates".equals(type)) {
            return ResponseEntity.ok(Map.of("certificates", destructionCertificates.stream().toList()));
        }

        List<Map<String, Object>> pending = filterRequests("PENDING");
        List<Map<String, Object>> approved = filterRequests("APPROVED");
        List<Map<String, Object>> executed = filterRequests("EXECUTED");
        List<Map<String, Object>> ready = archivePool.stream()
                .map(this::withDaysLeft)
                .filter(item -> intValue(item.get("daysLeft")) <= 0 && !"PENDING_DESTRUCTION".equals(item.get("status")) && !"DESTROYED".equals(item.get("status")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "pendingRequests", pending,
                "approvedRequests", approved,
                "executedRequests", executed,
                "readyForDestruction", ready,
                "certificates", destructionCertificates,
                "stats", Map.of(
                        "pending", pending.size(),
                        "approved", approved.size(),
                        "executed", executed.size(),
                        "readyCount", ready.size()
                )
        ));
    }

    @PostMapping("/destruction")
    @Operation(summary = "Traiter une demande de destruction")
    public ResponseEntity<?> mutateDestruction(@RequestBody Map<String, Object> body) {
        String action = stringValue(body.get("action"));
        String requestId = stringValue(body.get("requestId"));

        if ("create".equals(action)) {
            List<String> archiveIds = stringList(body.get("archiveIds"));
            if (archiveIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "archiveIds requis"));
            }

            List<Map<String, Object>> archives = archivePool.stream()
                    .filter(item -> archiveIds.contains(item.get("id")))
                    .map(this::withDaysLeft)
                    .collect(Collectors.toList());

            LinkedHashMap<String, Object> request = new LinkedHashMap<>();
            request.put("id", "dest-" + System.currentTimeMillis());
            request.put("archiveIds", archiveIds);
            request.put("archives", archives);
            request.put("requestedBy", "user-admin");
            request.put("requestedByName", "Administrateur Systeme");
            request.put("requestedAt", OffsetDateTime.now().toString());
            request.put("reason", StringUtils.hasText(stringValue(body.get("reason"))) ? stringValue(body.get("reason")) : "Fin de durée de conservation");
            request.put("status", "PENDING");
            destructionRequests.add(request);

            archiveIds.forEach(id -> {
                Map<String, Object> archive = findArchive(id);
                if (archive != null) {
                    archive.put("status", "PENDING_DESTRUCTION");
                }
            });

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "request", request,
                    "message", "Demande de destruction créée avec succès"
            ));
        }

        Map<String, Object> request = findRequest(requestId);
        if (request == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Demande non trouvée"));
        }

        if ("approve".equals(action)) {
            request.put("status", "APPROVED");
            request.put("approvedBy", "user-admin");
            request.put("approvedByName", "Administrateur Systeme");
            request.put("approvedAt", OffsetDateTime.now().toString());
            return ResponseEntity.ok(Map.of("success", true, "request", request, "message", "Demande approuvée avec succès"));
        }

        if ("reject".equals(action)) {
            request.put("status", "REJECTED");
            @SuppressWarnings("unchecked")
            List<String> archiveIds = (List<String>) request.get("archiveIds");
            archiveIds.forEach(id -> {
                Map<String, Object> archive = findArchive(id);
                if (archive != null && "PENDING_DESTRUCTION".equals(archive.get("status"))) {
                    archive.put("status", "ACTIVE");
                }
            });
            return ResponseEntity.ok(Map.of("success", true, "request", request, "message", "Demande rejetée"));
        }

        if ("execute".equals(action)) {
            request.put("status", "EXECUTED");
            request.put("executedBy", "user-admin");
            request.put("executedByName", "Administrateur Systeme");
            request.put("executedAt", OffsetDateTime.now().toString());
            request.put("method", StringUtils.hasText(stringValue(body.get("method"))) ? stringValue(body.get("method")) : "SHRED");

            LinkedHashMap<String, Object> certificate = new LinkedHashMap<>();
            certificate.put("id", "cert-" + System.currentTimeMillis());
            certificate.put("requestId", request.get("id"));
            certificate.put("archiveIds", request.get("archiveIds"));
            certificate.put("archives", request.get("archives"));
            certificate.put("destructionDate", OffsetDateTime.now().toString());
            certificate.put("method", request.get("method"));
            certificate.put("witness", "user-audit");
            certificate.put("witnessName", "Auditeur Interne");
            certificate.put("operator", "user-admin");
            certificate.put("operatorName", "Administrateur Systeme");
            certificate.put("approvedBy", request.get("approvedBy"));
            certificate.put("approvedByName", request.get("approvedByName"));
            certificate.put("notes", request.get("reason"));
            certificate.put("createdAt", OffsetDateTime.now().toString());
            destructionCertificates.add(0, certificate);

            @SuppressWarnings("unchecked")
            List<String> archiveIds = (List<String>) request.get("archiveIds");
            archiveIds.forEach(id -> {
                Map<String, Object> archive = findArchive(id);
                if (archive != null) {
                    archive.put("status", "DESTROYED");
                }
            });

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "request", request,
                    "certificate", certificate,
                    "message", "Destruction exécutée avec succès"
            ));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Action non reconnue"));
    }

    private Map<String, Object> archive(String id, String reference, String title, String type, String typeName, int dayOffset, String status) {
        LocalDate retentionEnd = LocalDate.now().plusDays(dayOffset);
        LinkedHashMap<String, Object> archive = new LinkedHashMap<>();
        archive.put("id", id);
        archive.put("reference", reference);
        archive.put("title", title);
        archive.put("type", type);
        archive.put("typeName", typeName);
        archive.put("retentionEndDate", retentionEnd.toString());
        archive.put("status", status);
        archive.put("agencyName", "Siège Central Paris");
        archive.put("boxNumber", "BOITE-00" + ((archivePool.size() % 8) + 1));
        archive.put("locationCode", "RAYON-R" + ((archivePool.size() % 2) + 1));
        archive.put("clientName", "Client Démonstration");
        return archive;
    }

    private Map<String, Object> withDaysLeft(Map<String, Object> source) {
        LinkedHashMap<String, Object> copy = new LinkedHashMap<>(source);
        LocalDate endDate = LocalDate.parse(String.valueOf(source.get("retentionEndDate")));
        copy.put("daysLeft", (int) ChronoUnit.DAYS.between(LocalDate.now(), endDate));
        return copy;
    }

    private List<Map<String, Object>> filterByDays(List<Map<String, Object>> archives, int min, int max) {
        return archives.stream()
                .filter(item -> {
                    int daysLeft = intValue(item.get("daysLeft"));
                    return daysLeft >= min && daysLeft <= max;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> retentionRule(String id, String type, String typeName, int retentionYears, String category, String color, int archiveCount, int expiringCount) {
        return Map.of(
                "id", id,
                "type", type,
                "typeName", typeName,
                "retentionYears", retentionYears,
                "category", category,
                "color", color,
                "archiveCount", archiveCount,
                "expiringCount", expiringCount
        );
    }

    private List<Map<String, Object>> filterRequests(String status) {
        return destructionRequests.stream()
                .filter(item -> status.equals(item.get("status")))
                .collect(Collectors.toList());
    }

    private Map<String, Object> findArchive(String archiveId) {
        return archivePool.stream()
                .filter(item -> archiveId.equals(item.get("id")))
                .findFirst()
                .orElse(null);
    }

    private Map<String, Object> findRequest(String requestId) {
        return destructionRequests.stream()
                .filter(item -> requestId.equals(item.get("id")))
                .findFirst()
                .orElse(null);
    }

    @SuppressWarnings("unchecked")
    private List<String> stringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return Collections.emptyList();
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private int intValue(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(String.valueOf(value));
    }
}
