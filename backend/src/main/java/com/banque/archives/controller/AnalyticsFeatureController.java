package com.banque.archives.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@Tag(name = "Analytics Feature", description = "API d'analytics et prédictif")
public class AnalyticsFeatureController {

    @GetMapping
    @Operation(summary = "Récupérer les données d'analytics")
    public ResponseEntity<?> getAnalytics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        int rangeFactor = computeRangeFactor(startDate, endDate);
        List<Map<String, Object>> volumeData = volumeData(rangeFactor);
        List<Map<String, Object>> predictions = predictions(volumeData);

        return ResponseEntity.ok(Map.of(
                "metrics", metrics(rangeFactor),
                "volumeData", volumeData,
                "predictions", predictions,
                "typeDistribution", typeDistribution(),
                "volumePredictions", volumePredictions(predictions),
                "storageRecommendations", storageRecommendations(),
                "workloadPredictions", workloadPredictions(rangeFactor),
                "staffingSuggestions", staffingSuggestions(),
                "activityData", activityData(rangeFactor),
                "archiveTypes", archiveTypes()
        ));
    }

    private int computeRangeFactor(String startDate, String endDate) {
        if (startDate == null || startDate.isBlank() || endDate == null || endDate.isBlank()) {
            return 12;
        }

        try {
            LocalDate start = LocalDate.parse(startDate.substring(0, 10));
            LocalDate end = LocalDate.parse(endDate.substring(0, 10));
            long days = Math.max(1, ChronoUnit.DAYS.between(start, end) + 1);
            return (int) Math.max(1, Math.min(12, Math.round(days / 30.0)));
        } catch (RuntimeException ignored) {
            return 12;
        }
    }

    private Map<String, Object> metrics(int rangeFactor) {
        int totalArchives = 948 + rangeFactor * 6;
        int archivesThisMonth = 42 + rangeFactor;
        int pendingWorkflows = 9 + Math.max(0, rangeFactor / 3);
        int storageUsed = 148_000_000 + rangeFactor * 3_000_000;
        int documentsExpiring = 17 + rangeFactor;
        int activeUsers = 8 + Math.min(4, Math.max(1, rangeFactor / 3));

        return Map.of(
                "totalArchives", totalArchives,
                "archivesThisMonth", archivesThisMonth,
                "pendingWorkflows", pendingWorkflows,
                "storageUsed", storageUsed,
                "documentsExpiring", documentsExpiring,
                "activeUsers", activeUsers,
                "trends", Map.of(
                        "totalArchives", 12,
                        "archivesThisMonth", 8,
                        "pendingWorkflows", -5,
                        "storageUsed", 15,
                        "documentsExpiring", -3,
                        "activeUsers", 5
                ),
                "sparklines", Map.of(
                        "totalArchives", List.of(totalArchives - 48, totalArchives - 36, totalArchives - 28, totalArchives - 19, totalArchives - 12, totalArchives - 5, totalArchives),
                        "archivesThisMonth", List.of(Math.max(5, archivesThisMonth - 13), Math.max(8, archivesThisMonth - 9), Math.max(10, archivesThisMonth - 6), Math.max(12, archivesThisMonth - 4), archivesThisMonth - 2, archivesThisMonth - 1, archivesThisMonth),
                        "pendingWorkflows", List.of(pendingWorkflows + 4, pendingWorkflows + 3, pendingWorkflows + 2, pendingWorkflows + 2, pendingWorkflows + 1, pendingWorkflows, pendingWorkflows),
                        "storageUsed", List.of(storageUsed - 18_000_000, storageUsed - 12_000_000, storageUsed - 9_000_000, storageUsed - 6_000_000, storageUsed - 4_000_000, storageUsed - 2_000_000, storageUsed),
                        "documentsExpiring", List.of(documentsExpiring + 8, documentsExpiring + 6, documentsExpiring + 4, documentsExpiring + 3, documentsExpiring + 2, documentsExpiring + 1, documentsExpiring),
                        "activeUsers", List.of(Math.max(2, activeUsers - 3), Math.max(3, activeUsers - 2), Math.max(4, activeUsers - 2), Math.max(5, activeUsers - 1), activeUsers - 1, activeUsers, activeUsers)
                )
        );
    }

    private List<Map<String, Object>> volumeData(int rangeFactor) {
        List<Map<String, Object>> data = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 11; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            int base = 48 + (11 - i) * 3;
            int actual = base + Math.max(0, rangeFactor - 4);
            data.add(Map.of(
                    "period", monthLabel(date),
                    "actual", actual
            ));
        }
        return data;
    }

    private List<Map<String, Object>> predictions(List<Map<String, Object>> volumeData) {
        List<Map<String, Object>> predictions = new ArrayList<>();
        int lastActual = (int) volumeData.get(volumeData.size() - 1).get("actual");
        LocalDate now = LocalDate.now();
        for (int i = 1; i <= 3; i++) {
            LocalDate date = now.plusMonths(i);
            int predicted = lastActual + (i * 4);
            predictions.add(Map.of(
                    "period", monthLabel(date),
                    "predicted", predicted,
                    "lower", Math.max(0, predicted - 8),
                    "upper", predicted + 8
            ));
        }
        return predictions;
    }

    private List<Map<String, Object>> typeDistribution() {
        return List.of(
                typeEntry("Compte", "ACCOUNT", 310, 32.0, "#2563eb"),
                typeEntry("Client", "CLIENT", 245, 25.0, "#16a34a"),
                typeEntry("Transaction", "TXN", 186, 19.0, "#ea580c"),
                typeEntry("Conformité", "COMPLIANCE", 128, 13.0, "#7c3aed"),
                typeEntry("Juridique", "LEGAL", 103, 11.0, "#dc2626")
        );
    }

    private Map<String, Object> typeEntry(String name, String code, int value, double percentage, String color) {
        return Map.of(
                "name", name,
                "code", code,
                "value", value,
                "percentage", percentage,
                "color", color
        );
    }

    private List<Map<String, Object>> volumePredictions(List<Map<String, Object>> predictions) {
        List<Map<String, Object>> entries = new ArrayList<>();
        for (int i = 0; i < predictions.size(); i++) {
            Map<String, Object> prediction = predictions.get(i);
            int predicted = (int) prediction.get("predicted");
            entries.add(Map.of(
                    "month", prediction.get("period"),
                    "predictedVolume", predicted,
                    "confidenceInterval", Map.of(
                            "lower", prediction.get("lower"),
                            "upper", prediction.get("upper")
                    ),
                    "trend", i == 1 ? "stable" : "up",
                    "trendPercent", 4 + (i * 2)
            ));
        }
        return entries;
    }

    private List<Map<String, Object>> storageRecommendations() {
        return List.of(
                Map.of(
                        "type", "warning",
                        "title", "Capacité bientôt saturée",
                        "description", "Le stockage primaire atteindra 80% dans moins de 6 mois.",
                        "action", "Planifier une extension"
                ),
                Map.of(
                        "type", "info",
                        "title", "Optimisation possible",
                        "description", "Les documents inactifs depuis plus de 24 mois peuvent être déplacés vers l'archive froide.",
                        "action", "Préparer le transfert"
                ),
                Map.of(
                        "type", "success",
                        "title", "Sauvegardes conformes",
                        "description", "Les sauvegardes et réplications de la semaine sont conformes."
                )
        );
    }

    private List<Map<String, Object>> workloadPredictions(int rangeFactor) {
        return List.of(
                workload("Cette semaine", 110 + rangeFactor * 2, "high", 5),
                workload("Semaine prochaine", 86 + rangeFactor, "medium", 4),
                workload("Dans 2 semaines", 64 + rangeFactor, "low", 3)
        );
    }

    private Map<String, Object> workload(String period, int expectedWorkload, String category, int staffNeeded) {
        return Map.of(
                "period", period,
                "expectedWorkload", expectedWorkload,
                "category", category,
                "staffNeeded", staffNeeded
        );
    }

    private List<Map<String, Object>> staffingSuggestions() {
        return List.of(
                Map.of(
                        "role", "Archivistes",
                        "currentCount", 3,
                        "suggestedCount", 4,
                        "reason", "Pic d'entrées prévu sur les prochaines semaines."
                ),
                Map.of(
                        "role", "Agents de numérisation",
                        "currentCount", 2,
                        "suggestedCount", 2,
                        "reason", "Charge stable sur le canal de numérisation."
                ),
                Map.of(
                        "role", "Gestionnaires workflow",
                        "currentCount", 2,
                        "suggestedCount", 3,
                        "reason", "Réduire les délais d'approbation en période haute."
                )
        );
    }

    private List<Map<String, Object>> activityData(int rangeFactor) {
        List<Map<String, Object>> activity = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 365; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            int weekdayBoost = date.getDayOfWeek().getValue() >= 6 ? 3 : 11;
            int seasonalBoost = (i % 9);
            int count = weekdayBoost + seasonalBoost + Math.max(0, rangeFactor / 2);
            activity.add(Map.of(
                    "date", date.toString(),
                    "count", count,
                    "details", Map.of(
                            "created", Math.max(1, count / 5),
                            "viewed", Math.max(1, count / 2),
                            "downloaded", Math.max(1, count / 6),
                            "moved", Math.max(1, count / 7)
                    )
            ));
        }
        return activity;
    }

    private List<Map<String, Object>> archiveTypes() {
        return List.of(
                archiveType("ACCOUNT", "Compte", "#2563eb"),
                archiveType("CLIENT", "Client", "#16a34a"),
                archiveType("TXN", "Transaction", "#ea580c"),
                archiveType("COMPLIANCE", "Conformité", "#7c3aed"),
                archiveType("LEGAL", "Juridique", "#dc2626")
        );
    }

    private Map<String, Object> archiveType(String code, String name, String color) {
        LinkedHashMap<String, Object> type = new LinkedHashMap<>();
        type.put("code", code);
        type.put("name", name);
        type.put("color", color);
        return type;
    }

    private String monthLabel(LocalDate date) {
        String raw = date.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, Locale.FRANCE);
        return raw.endsWith(".") ? raw.substring(0, raw.length() - 1) : raw;
    }
}
