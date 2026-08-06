package com.banque.archives.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/fraud")
@Tag(name = "Fraud Feature", description = "API de détection de fraude")
public class FraudFeatureController {

    private final List<Map<String, Object>> anomalies = new CopyOnWriteArrayList<>();

    @PostConstruct
    void init() {
        if (!anomalies.isEmpty()) {
            return;
        }

        anomalies.add(anomaly("anomaly-0001", "ARC-KYC-102344", "Dossier KYC - Client Martin", "DUPLICATE", "HIGH", 86, "NEW"));
        anomalies.add(anomaly("anomaly-0002", "ARC-CREDIT-087112", "Contrat de prêt PME", "MODIFIED", "CRITICAL", 94, "INVESTIGATING"));
        anomalies.add(anomaly("anomaly-0003", "ARC-LEGAL-120045", "Convention de garantie", "SUSPICIOUS", "MEDIUM", 58, "NEEDS_REVIEW"));
        anomalies.add(anomaly("anomaly-0004", "ARC-RH-332010", "Dossier RH - Employé", "MISSING", "LOW", 24, "FALSE_POSITIVE"));
        anomalies.add(anomaly("anomaly-0005", "ARC-COMP-550018", "Pièce comptable clôture", "INCONSISTENT", "HIGH", 79, "CONFIRMED_FRAUD"));
    }

    @GetMapping
    @Operation(summary = "Lister les anomalies")
    public ResponseEntity<?> getFraud(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> filtered = anomalies.stream()
                .filter(item -> !StringUtils.hasText(status) || status.equals(item.get("status")))
                .filter(item -> !StringUtils.hasText(type) || type.equals(item.get("type")))
                .filter(item -> !StringUtils.hasText(riskLevel) || riskLevel.equals(item.get("riskLevel")))
                .filter(item -> {
                    if (!StringUtils.hasText(search)) {
                        return true;
                    }
                    String haystack = (item.get("archiveReference") + " " + item.get("archiveTitle") + " " + item.get("description"))
                            .toString()
                            .toLowerCase(Locale.ROOT);
                    return haystack.contains(search.toLowerCase(Locale.ROOT));
                })
                .sorted((left, right) -> Integer.compare(intValue(right.get("score")), intValue(left.get("score"))))
                .collect(Collectors.toList());

        int total = filtered.size();
        int fromIndex = Math.min(page * size, total);
        int toIndex = Math.min(fromIndex + size, total);

        return ResponseEntity.ok(Map.of(
                "content", filtered.subList(fromIndex, toIndex),
                "totalElements", total,
                "totalPages", Math.max(1, (int) Math.ceil(total / (double) size)),
                "size", size,
                "number", page,
                "first", page == 0,
                "last", toIndex >= total,
                "statistics", statistics()
        ));
    }

    @PostMapping
    @Operation(summary = "Enregistrer une investigation")
    public ResponseEntity<?> updateFraud(@RequestBody Map<String, Object> body) {
        String anomalyId = stringValue(body.get("anomalyId"));
        String status = stringValue(body.get("status"));

        if (!StringUtils.hasText(anomalyId) || !StringUtils.hasText(status)) {
            return ResponseEntity.badRequest().body(Map.of("message", "anomalyId et status sont requis"));
        }

        Map<String, Object> anomaly = anomalies.stream()
                .filter(item -> anomalyId.equals(item.get("id")))
                .findFirst()
                .orElse(null);

        if (anomaly == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Anomalie non trouvée"));
        }

        anomaly.put("status", status);
        anomaly.put("notes", stringValue(body.get("notes")));
        anomaly.put("investigatedBy", StringUtils.hasText(stringValue(body.get("investigatedBy"))) ? stringValue(body.get("investigatedBy")) : "Utilisateur actuel");
        anomaly.put("investigatedAt", OffsetDateTime.now().toString());
        anomaly.put("resolution", switch (status) {
            case "CONFIRMED_FRAUD" -> "Fraude confirmée et document bloqué";
            case "FALSE_POSITIVE" -> "Faux positif validé";
            case "NEEDS_REVIEW" -> "En attente de révision supplémentaire";
            default -> anomaly.get("resolution");
        });

        return ResponseEntity.ok(anomaly);
    }

    private Map<String, Object> anomaly(String id, String reference, String title, String type, String riskLevel, int score, String status) {
        LinkedHashMap<String, Object> item = new LinkedHashMap<>();
        item.put("id", id);
        item.put("archiveId", "arch-" + id.substring(id.length() - 4));
        item.put("archiveReference", reference);
        item.put("archiveTitle", title);
        item.put("type", type);
        item.put("riskLevel", riskLevel);
        item.put("score", score);
        item.put("description", "Anomalie détectée sur le document " + reference);
        item.put("detectedAt", OffsetDateTime.now().minusDays(score % 7 + 1).toString());
        item.put("status", status);
        item.put("factors", List.of("Checksum incohérent", "Variation inhabituelle"));
        if (!"NEW".equals(status)) {
            item.put("investigatedBy", "Analyste conformité");
            item.put("investigatedAt", OffsetDateTime.now().minusDays(1).toString());
        }
        return item;
    }

    private Map<String, Object> statistics() {
        int total = anomalies.size();
        int totalScore = anomalies.stream().mapToInt(item -> intValue(item.get("score"))).sum();

        LinkedHashMap<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalAnomalies", total);
        stats.put("newAnomalies", countBy("status", "NEW"));
        stats.put("investigatingAnomalies", countBy("status", "INVESTIGATING"));
        stats.put("confirmedFrauds", countBy("status", "CONFIRMED_FRAUD"));
        stats.put("falsePositives", countBy("status", "FALSE_POSITIVE"));
        stats.put("averageRiskScore", total == 0 ? 0 : Math.round(totalScore / (float) total));
        stats.put("riskDistribution", Map.of(
                "low", countBy("riskLevel", "LOW"),
                "medium", countBy("riskLevel", "MEDIUM"),
                "high", countBy("riskLevel", "HIGH"),
                "critical", countBy("riskLevel", "CRITICAL")
        ));

        List<Map<String, Object>> trend = new ArrayList<>();
        for (int index = 6; index >= 0; index--) {
            trend.add(Map.of(
                    "date", LocalDate.now().minusDays(index).toString(),
                    "count", 1 + ((index + total) % 4)
            ));
        }
        stats.put("trendData", trend);
        return stats;
    }

    private long countBy(String key, String value) {
        return anomalies.stream().filter(item -> value.equals(item.get(key))).count();
    }

    private int intValue(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(String.valueOf(value));
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}
