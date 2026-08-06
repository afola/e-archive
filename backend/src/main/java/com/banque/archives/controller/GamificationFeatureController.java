package com.banque.archives.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gamification")
@Tag(name = "Gamification Feature", description = "API de gamification")
public class GamificationFeatureController {

    @GetMapping
    @Operation(summary = "Récupérer les données de gamification")
    public ResponseEntity<?> getGamification(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String userId
    ) {
        List<Map<String, Object>> leaderboard = leaderboard();
        Map<String, Object> progress = progress(userId == null ? "user-admin" : userId);
        List<Map<String, Object>> badges = badges(progress);
        List<Map<String, Object>> challenges = challenges();

        if ("leaderboard".equals(type)) {
            return ResponseEntity.ok(Map.of("leaderboard", leaderboard));
        }
        if ("badges".equals(type)) {
            return ResponseEntity.ok(Map.of("badges", badges));
        }
        if ("progress".equals(type)) {
            return ResponseEntity.ok(Map.of("progress", progress));
        }
        if ("challenges".equals(type)) {
            return ResponseEntity.ok(Map.of("challenges", challenges));
        }

        return ResponseEntity.ok(Map.of(
                "leaderboard", leaderboard,
                "badges", badges,
                "progress", progress,
                "challenges", challenges
        ));
    }

    private List<Map<String, Object>> leaderboard() {
        return List.of(
                userEntry("user-admin", "Administrateur Systeme", "DSI", "Siège Central Paris", 4200, 12, 6, 380, 1200, 1),
                userEntry("user-ops", "Sophie Petit", "Conformité", "Siège Central Paris", 3600, 10, 5, 300, 980, 2),
                userEntry("user-arch", "Luc Moreau", "Archives", "Agence Lyon Centre", 3150, 9, 4, 260, 820, 3)
        );
    }

    private Map<String, Object> progress(String userId) {
        LinkedHashMap<String, Object> progress = new LinkedHashMap<>();
        progress.put("user", Map.of(
                "id", userId,
                "name", "Administrateur Systeme",
                "avatar", "https://api.dicebear.com/7.x/initials/svg?seed=Administrateur",
                "department", "Direction des Systèmes d'Information",
                "agency", "Siège Central Paris"
        ));
        progress.put("xp", 4200);
        progress.put("level", 12);
        progress.put("xpProgress", 200);
        progress.put("xpNeeded", 1000);
        progress.put("totalPoints", 4200);
        progress.put("earnedBadges", List.of("first-archive", "archive-10", "search-10", "workflow-5"));
        progress.put("totalBadges", 6);
        progress.put("stats", Map.of(
                "archivesCreated", 18,
                "searches", 73,
                "workflowsApproved", 14,
                "destructions", 3,
                "exports", 11,
                "consecutiveDays", 9
        ));
        progress.put("recentActivity", List.of(
                Map.of("type", "archive_created", "points", 25, "description", "Archive créée", "timestamp", OffsetDateTime.now().minusHours(2).toString()),
                Map.of("type", "workflow_approved", "points", 50, "description", "Workflow approuvé", "timestamp", OffsetDateTime.now().minusDays(1).toString())
        ));
        return progress;
    }

    private List<Map<String, Object>> badges(Map<String, Object> progress) {
        @SuppressWarnings("unchecked")
        List<String> earned = (List<String>) progress.get("earnedBadges");
        return List.of(
                badge("first-archive", "Premier Pas", "Créer votre première archive", "archives", 50, "common", earned.contains("first-archive"), 100),
                badge("archive-10", "Archiviste Novice", "Créer 10 archives", "archives", 100, "common", earned.contains("archive-10"), 100),
                badge("search-10", "Chercheur", "Effectuer 10 recherches", "search", 75, "common", earned.contains("search-10"), 100),
                badge("workflow-5", "Collaborateur", "Approuver 5 workflows", "workflow", 100, "common", earned.contains("workflow-5"), 100),
                badge("destruction-1", "Nettoyeur", "Exécuter une destruction", "lifecycle", 100, "uncommon", earned.contains("destruction-1"), 60),
                badge("legendary", "Légende", "Obtenir tous les badges d'une catégorie", "special", 1000, "legendary", false, 20)
        );
    }

    private List<Map<String, Object>> challenges() {
        List<Map<String, Object>> challenges = new ArrayList<>();
        challenges.add(challenge("weekly-archives", "Marathon Archives", "Créer 15 archives cette semaine", "weekly", 15, 200, 9, 21, 8));
        challenges.add(challenge("weekly-approvals", "Validateur de la Semaine", "Approuver 10 workflows cette semaine", "weekly", 10, 150, 6, 18, 7));
        challenges.add(challenge("monthly-search", "Explorateur du Mois", "Effectuer 50 recherches ce mois", "monthly", 50, 300, 27, 34, 12));
        return challenges;
    }

    private Map<String, Object> userEntry(String id, String name, String department, String agency, int points, int level, int badges, int weeklyPoints, int monthlyPoints, int rank) {
        LinkedHashMap<String, Object> entry = new LinkedHashMap<>();
        entry.put("id", id);
        entry.put("name", name);
        entry.put("avatar", "https://api.dicebear.com/7.x/initials/svg?seed=" + name.replace(" ", ""));
        entry.put("department", department);
        entry.put("agency", agency);
        entry.put("points", points);
        entry.put("level", level);
        entry.put("badges", badges);
        entry.put("weeklyPoints", weeklyPoints);
        entry.put("monthlyPoints", monthlyPoints);
        entry.put("rank", rank);
        return entry;
    }

    private Map<String, Object> badge(String id, String name, String description, String category, int points, String rarity, boolean earned, int progress) {
        return Map.of(
                "id", id,
                "name", name,
                "description", description,
                "icon", "🏆",
                "category", category,
                "requirement", Map.of("type", category, "count", 1),
                "points", points,
                "rarity", rarity,
                "earned", earned,
                "progress", progress
        );
    }

    private Map<String, Object> challenge(String id, String name, String description, String type, int target, int reward, int progress, int participants, int completed) {
        LinkedHashMap<String, Object> challenge = new LinkedHashMap<>();
        challenge.put("id", id);
        challenge.put("name", name);
        challenge.put("description", description);
        challenge.put("type", type);
        challenge.put("target", target);
        challenge.put("reward", reward);
        challenge.put("deadline", OffsetDateTime.now().plusDays(7).toString());
        challenge.put("category", "productivity");
        challenge.put("progress", progress);
        challenge.put("participants", participants);
        challenge.put("completed", completed);
        return challenge;
    }
}
