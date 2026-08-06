package com.banque.archives.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/storage")
@Tag(name = "Storage Feature", description = "API de gestion des emplacements")
public class StorageFeatureController {

    private final List<Map<String, Object>> locations = new CopyOnWriteArrayList<>();

    @PostConstruct
    void init() {
        if (!locations.isEmpty()) {
            return;
        }

        String now = OffsetDateTime.now().toString();
        locations.add(location("site-001", "SITE-PARIS", "Site Paris - Archives Centrales", "SITE", null, "AG001", "Siège Central Paris", "Site Paris - Archives Centrales", null, null, null, 0, 0, true, false, now));
        locations.add(location("bld-001", "BAT-A", "Bâtiment A", "BUILDING", "site-001", "AG001", "Siège Central Paris", "Site Paris - Archives Centrales", "Bâtiment A", null, null, 0, 0, true, false, now));
        locations.add(location("room-001", "SALLE-A1", "Salle A1 - Archives Courantes", "ROOM", "bld-001", "AG001", "Siège Central Paris", "Site Paris - Archives Centrales", "Bâtiment A", "Salle A1 - Archives Courantes", null, 180, 36, true, true, now));
        locations.add(location("shelf-001", "RAYON-R1", "Rayon R1", "SHELF", "room-001", "AG001", "Siège Central Paris", "Site Paris - Archives Centrales", "Bâtiment A", "Salle A1 - Archives Courantes", "Rayon R1", 50, 22, true, true, now));
        locations.add(location("shelf-002", "RAYON-R2", "Rayon R2", "SHELF", "room-001", "AG001", "Siège Central Paris", "Site Paris - Archives Centrales", "Bâtiment A", "Salle A1 - Archives Courantes", "Rayon R2", 50, 18, true, true, now));

        locations.add(box("box-001", "BOITE-001", "Boîte 001", "shelf-001", 25, 22, now));
        locations.add(box("box-002", "BOITE-002", "Boîte 002", "shelf-001", 25, 19, now));
        locations.add(box("box-003", "BOITE-003", "Boîte 003", "shelf-001", 25, 11, now));
        locations.add(box("box-004", "BOITE-004", "Boîte 004", "shelf-001", 25, 7, now));
        locations.add(box("box-005", "BOITE-005", "Boîte 005", "shelf-002", 25, 21, now));
        locations.add(box("box-006", "BOITE-006", "Boîte 006", "shelf-002", 25, 17, now));
        locations.add(box("box-007", "BOITE-007", "Boîte 007", "shelf-002", 25, 9, now));
        locations.add(box("box-008", "BOITE-008", "Boîte 008", "shelf-002", 25, 4, now));
    }

    @GetMapping
    @Operation(summary = "Récupérer les emplacements")
    public ResponseEntity<?> getStorage(
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String parentId,
            @RequestParam(defaultValue = "false") boolean includeArchives
    ) {
        if (StringUtils.hasText(id)) {
            Map<String, Object> location = findLocation(id);
            if (location == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Location not found"));
            }
            LinkedHashMap<String, Object> payload = new LinkedHashMap<>(location);
            if (includeArchives && "BOX".equals(location.get("type"))) {
                payload.put("archives", sampleArchivesForBox(id));
            }
            return ResponseEntity.ok(payload);
        }

        if (StringUtils.hasText(type)) {
            return ResponseEntity.ok(locations.stream()
                    .filter(item -> type.equals(item.get("type")))
                    .collect(Collectors.toList()));
        }

        if (StringUtils.hasText(parentId)) {
            return ResponseEntity.ok(locations.stream()
                    .filter(item -> Objects.equals(parentId, item.get("parentId")))
                    .collect(Collectors.toList()));
        }

        List<Map<String, Object>> tree = buildTree();
        return ResponseEntity.ok(Map.of(
                "tree", tree,
                "stats", buildStats()
        ));
    }

    @PostMapping
    @Operation(summary = "Créer un emplacement")
    public ResponseEntity<?> createLocation(@RequestBody Map<String, Object> body) {
        String type = stringValue(body.get("type"));
        String name = stringValue(body.get("name"));
        String code = stringValue(body.get("code"));
        String parentId = nullableString(body.get("parentId"));

        if (!StringUtils.hasText(type) || !StringUtils.hasText(name) || !StringUtils.hasText(code)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }

        boolean duplicate = locations.stream().anyMatch(item -> code.equals(item.get("code")));
        if (duplicate) {
            return ResponseEntity.badRequest().body(Map.of("error", "Location code already exists"));
        }

        Map<String, Object> parent = findLocation(parentId);
        String now = OffsetDateTime.now().toString();
        String newId = type.toLowerCase(Locale.ROOT) + "-" + System.currentTimeMillis();

        LinkedHashMap<String, Object> location = new LinkedHashMap<>();
        location.put("id", newId);
        location.put("code", code);
        location.put("name", name);
        location.put("type", type);
        location.put("parentId", parentId);
        location.put("agencyId", parent != null ? parent.get("agencyId") : "AG001");
        location.put("agencyName", parent != null ? parent.get("agencyName") : "Siège Central Paris");
        location.put("site", parent != null ? parent.get("site") : name);
        location.put("building", deriveHierarchyValue(type, "BUILDING", parent, name));
        location.put("room", deriveHierarchyValue(type, "ROOM", parent, name));
        location.put("shelf", deriveHierarchyValue(type, "SHELF", parent, name));
        location.put("description", "");
        int capacity = intValue(body.get("capacity"), "BOX".equals(type) || "SHELF".equals(type) || "ROOM".equals(type) ? 25 : 0);
        location.put("capacity", capacity);
        location.put("currentLoad", 0);
        location.put("fillLevel", 0);
        location.put("isActive", true);
        location.put("hasQrCode", !"SITE".equals(type) && !"BUILDING".equals(type));
        location.put("qrCodeData", "QR-" + code);
        location.put("createdAt", now);
        location.put("updatedAt", now);

        locations.add(location);
        return ResponseEntity.status(HttpStatus.CREATED).body(location);
    }

    @DeleteMapping
    @Operation(summary = "Supprimer un emplacement")
    public ResponseEntity<?> deleteLocation(@RequestParam String id) {
        Map<String, Object> location = findLocation(id);
        if (location == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Location not found"));
        }

        boolean hasChildren = locations.stream().anyMatch(item -> Objects.equals(id, item.get("parentId")));
        if (hasChildren) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot delete location with children. Remove children first."));
        }

        locations.removeIf(item -> id.equals(item.get("id")));
        return ResponseEntity.ok(Map.of("success", true, "message", "Location deleted"));
    }

    @GetMapping("/qrcode")
    @Operation(summary = "Générer un QR code simple pour un emplacement")
    public ResponseEntity<?> getQrCode(
            @RequestParam(required = false) String locationId,
            @RequestParam(required = false) String code,
            @RequestParam(defaultValue = "200") int size
    ) {
        if (!StringUtils.hasText(locationId) && !StringUtils.hasText(code)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Location ID or code required"));
        }

        String qrData = StringUtils.hasText(code) ? code : "BOX-" + locationId;
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + size + "\" height=\"" + size + "\" viewBox=\"0 0 100 100\">"
                + "<rect width=\"100\" height=\"100\" fill=\"white\"/>"
                + "<rect x=\"8\" y=\"8\" width=\"24\" height=\"24\" fill=\"black\"/>"
                + "<rect x=\"68\" y=\"8\" width=\"24\" height=\"24\" fill=\"black\"/>"
                + "<rect x=\"8\" y=\"68\" width=\"24\" height=\"24\" fill=\"black\"/>"
                + "<rect x=\"38\" y=\"38\" width=\"24\" height=\"24\" fill=\"black\"/>"
                + "<text x=\"50\" y=\"96\" text-anchor=\"middle\" font-size=\"8\" fill=\"black\">" + escapeXml(qrData) + "</text>"
                + "</svg>";
        String encoded = Base64.getEncoder().encodeToString(svg.getBytes(StandardCharsets.UTF_8));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "qrCode", "data:image/svg+xml;base64," + encoded,
                "data", qrData,
                "format", "svg",
                "size", size
        ));
    }

    private Map<String, Object> buildStats() {
        long totalBoxes = locations.stream().filter(item -> "BOX".equals(item.get("type"))).count();
        int totalArchives = sampleArchivesForBox("box-001").size() * (int) totalBoxes;
        int averageFillLevel = (int) Math.round(locations.stream()
                .filter(item -> "BOX".equals(item.get("type")))
                .mapToInt(item -> intValue(item.get("fillLevel"), 0))
                .average()
                .orElse(0));

        LinkedHashMap<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalSites", locations.stream().filter(item -> "SITE".equals(item.get("type"))).count());
        stats.put("totalBuildings", locations.stream().filter(item -> "BUILDING".equals(item.get("type"))).count());
        stats.put("totalRooms", locations.stream().filter(item -> "ROOM".equals(item.get("type"))).count());
        stats.put("totalShelves", locations.stream().filter(item -> "SHELF".equals(item.get("type"))).count());
        stats.put("totalBoxes", totalBoxes);
        stats.put("totalArchives", totalArchives);
        stats.put("averageFillLevel", averageFillLevel);
        stats.put("lowCapacity", locations.stream().filter(item -> "BOX".equals(item.get("type")) && intValue(item.get("fillLevel"), 0) >= 80).count());
        stats.put("availableSpace", locations.stream().filter(item -> "BOX".equals(item.get("type")) && intValue(item.get("fillLevel"), 0) < 30).count());
        return stats;
    }

    private List<Map<String, Object>> buildTree() {
        Map<String, LinkedHashMap<String, Object>> byId = new LinkedHashMap<>();
        for (Map<String, Object> location : locations) {
            LinkedHashMap<String, Object> copy = new LinkedHashMap<>(location);
            copy.put("children", new ArrayList<Map<String, Object>>());
            byId.put(String.valueOf(location.get("id")), copy);
        }

        List<Map<String, Object>> roots = new ArrayList<>();
        for (Map<String, Object> location : locations) {
            String id = String.valueOf(location.get("id"));
            String parentId = nullableString(location.get("parentId"));
            LinkedHashMap<String, Object> node = byId.get(id);
            if (StringUtils.hasText(parentId) && byId.containsKey(parentId)) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> children = (List<Map<String, Object>>) byId.get(parentId).get("children");
                children.add(node);
            } else if ("SITE".equals(location.get("type"))) {
                roots.add(node);
            }
        }
        return roots;
    }

    private List<Map<String, Object>> sampleArchivesForBox(String boxId) {
        List<Map<String, Object>> archives = new ArrayList<>();
        for (int index = 1; index <= 4; index++) {
            LinkedHashMap<String, Object> archive = new LinkedHashMap<>();
            archive.put("id", "arch-" + boxId + "-" + index);
            archive.put("reference", "ARC-KYC-" + (1000 + index));
            archive.put("title", "Document " + index + " - Dossier client");
            archive.put("type", "KYC");
            archive.put("typeName", "Documents KYC");
            archive.put("status", index % 2 == 0 ? "ACTIVE" : "ON_LOAN");
            archive.put("confidentiality", "NORMAL");
            archive.put("clientName", "Client Démonstration");
            archive.put("archiveDate", "2025-01-15");
            archive.put("retentionEndDate", "2030-01-15");
            archives.add(archive);
        }
        return archives;
    }

    private String deriveHierarchyValue(String type, String targetType, Map<String, Object> parent, String name) {
        if (targetType.equals(type)) {
            return name;
        }
        if (parent == null) {
            return null;
        }
        if ("BUILDING".equals(targetType)) {
            return "SITE".equals(type) ? null : String.valueOf(parent.get("building"));
        }
        if ("ROOM".equals(targetType)) {
            return "ROOM".equals(type) ? name : String.valueOf(parent.get("room"));
        }
        if ("SHELF".equals(targetType)) {
            return "SHELF".equals(type) ? name : String.valueOf(parent.get("shelf"));
        }
        return null;
    }

    private Map<String, Object> findLocation(String id) {
        if (!StringUtils.hasText(id)) {
            return null;
        }
        return locations.stream()
                .filter(item -> id.equals(item.get("id")))
                .findFirst()
                .orElse(null);
    }

    private LinkedHashMap<String, Object> location(
            String id,
            String code,
            String name,
            String type,
            String parentId,
            String agencyId,
            String agencyName,
            String site,
            String building,
            String room,
            String shelf,
            int capacity,
            int currentLoad,
            boolean active,
            boolean hasQrCode,
            String now
    ) {
        LinkedHashMap<String, Object> item = new LinkedHashMap<>();
        item.put("id", id);
        item.put("code", code);
        item.put("name", name);
        item.put("type", type);
        item.put("parentId", parentId);
        item.put("agencyId", agencyId);
        item.put("agencyName", agencyName);
        item.put("site", site);
        item.put("building", building);
        item.put("room", room);
        item.put("shelf", shelf);
        item.put("description", "");
        item.put("capacity", capacity);
        item.put("currentLoad", currentLoad);
        item.put("fillLevel", capacity > 0 ? Math.round((currentLoad * 100f) / capacity) : 0);
        item.put("isActive", active);
        item.put("hasQrCode", hasQrCode);
        item.put("qrCodeData", hasQrCode ? "QR-" + code : null);
        item.put("createdAt", now);
        item.put("updatedAt", now);
        return item;
    }

    private LinkedHashMap<String, Object> box(String id, String code, String name, String parentId, int capacity, int currentLoad, String now) {
        return location(
                id, code, name, "BOX", parentId, "AG001", "Siège Central Paris",
                "Site Paris - Archives Centrales", "Bâtiment A", "Salle A1 - Archives Courantes", parentId.startsWith("shelf-001") ? "Rayon R1" : "Rayon R2",
                capacity, currentLoad, true, true, now
        );
    }

    private String nullableString(Object value) {
        String normalized = stringValue(value).trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private int intValue(Object value, int defaultValue) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(stringValue(value));
        } catch (NumberFormatException exception) {
            return defaultValue;
        }
    }

    private String escapeXml(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}
