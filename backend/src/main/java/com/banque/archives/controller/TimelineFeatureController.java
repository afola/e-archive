package com.banque.archives.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/timeline")
@Tag(name = "Timeline Feature", description = "API timeline et traçabilité")
public class TimelineFeatureController {

    @GetMapping
    @Operation(summary = "Récupérer les événements timeline")
    public ResponseEntity<?> getTimeline(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String eventTypes,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        String effectiveEntityType = StringUtils.hasText(entityType) ? entityType : "archive";
        String effectiveEntityId = StringUtils.hasText(entityId) ? entityId : "arch-demo";
        String reference = "archive".equals(effectiveEntityType) ? "ARC-" + effectiveEntityId.toUpperCase() : effectiveEntityId;
        String title = switch (effectiveEntityType) {
            case "client" -> "Historique du client";
            case "account" -> "Historique du compte";
            case "workflow" -> "Workflow documentaire";
            case "movement" -> "Mouvement d'archive";
            default -> "Archive suivie";
        };

        List<Map<String, Object>> events = new ArrayList<>();
        events.add(event("document_created", effectiveEntityType, effectiveEntityId, reference, title, "Administrateur Systeme", OffsetDateTime.now().minusDays(10), "Document créé"));
        events.add(event("document_modified", effectiveEntityType, effectiveEntityId, reference, title, "Sophie Petit", OffsetDateTime.now().minusDays(7), "Document modifié"));
        events.add(event("workflow_started", "workflow", "wf-" + effectiveEntityId, reference, "Validation documentaire", "Luc Moreau", OffsetDateTime.now().minusDays(5), "Workflow initié"));
        events.add(event("workflow_approved", "workflow", "wf-" + effectiveEntityId, reference, "Validation documentaire", "Sophie Petit", OffsetDateTime.now().minusDays(4), "Workflow approuvé"));
        events.add(event("movement_created", "movement", "mov-" + effectiveEntityId, reference, title, "Administrateur Systeme", OffsetDateTime.now().minusDays(2), "Mouvement demandé"));
        events.add(event("document_viewed", effectiveEntityType, effectiveEntityId, reference, title, "Auditeur Interne", OffsetDateTime.now().minusHours(12), "Document consulté"));

        if (StringUtils.hasText(actor)) {
            String loweredActor = actor.toLowerCase();
            events = events.stream()
                    .filter(item -> String.valueOf(((Map<?, ?>) item.get("actor")).get("name")).toLowerCase().contains(loweredActor))
                    .collect(Collectors.toList());
        }

        if (StringUtils.hasText(eventTypes)) {
            List<String> accepted = List.of(eventTypes.split(","));
            events = events.stream()
                    .filter(item -> accepted.contains(item.get("type")))
                    .collect(Collectors.toList());
        }

        int total = events.size();
        int fromIndex = Math.min(offset, total);
        int toIndex = Math.min(offset + limit, total);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "events", events.subList(fromIndex, toIndex),
                        "total", total,
                        "limit", limit,
                        "offset", offset
                )
        ));
    }

    private Map<String, Object> event(
            String type,
            String entityType,
            String entityId,
            String entityReference,
            String entityTitle,
            String actorName,
            OffsetDateTime timestamp,
            String description
    ) {
        LinkedHashMap<String, Object> event = new LinkedHashMap<>();
        event.put("id", type + "-" + entityId + "-" + timestamp.toEpochSecond());
        event.put("type", type);
        event.put("entityType", entityType);
        event.put("entityId", entityId);
        event.put("entityReference", entityReference);
        event.put("entityTitle", entityTitle);
        event.put("actor", Map.of(
                "id", "user-" + actorName.toLowerCase().replace(" ", "-"),
                "name", actorName
        ));
        event.put("timestamp", timestamp.toString());
        event.put("description", description);
        event.put("metadata", Map.of("source", "springboot"));
        return event;
    }
}
