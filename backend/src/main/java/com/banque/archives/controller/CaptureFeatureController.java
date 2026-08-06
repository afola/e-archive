package com.banque.archives.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@RestController
@RequestMapping("/capture")
@Tag(name = "Capture Feature", description = "API de capture OCR simulée")
public class CaptureFeatureController {

    @PostMapping
    @Operation(summary = "Traiter un document OCR")
    public ResponseEntity<?> capture(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fileId") String fileId
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }
        if (!StringUtils.hasText(fileId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "No fileId provided"));
        }

        String fileName = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String lowerName = fileName.toLowerCase(Locale.ROOT);
        String extractedText = "Document analysé: " + fileName + "\n" +
                "Référence: REF-" + fileId.substring(Math.max(0, fileId.length() - 6)).toUpperCase(Locale.ROOT) + "\n" +
                "Date: 04/03/2026\n" +
                "Client: Client Démonstration\n" +
                "Compte: FR7612345678901234567890123";

        List<Map<String, Object>> entities = new ArrayList<>();
        entities.add(entity("reference", "REF-" + fileId.substring(Math.max(0, fileId.length() - 6)).toUpperCase(Locale.ROOT), 0.94));
        entities.add(entity("date", "04/03/2026", 0.91));
        entities.add(entity("name", "Client Démonstration", 0.87));
        entities.add(entity("iban", "FR7612345678901234567890123", 0.96));

        String suggestionType = "other";
        String suggestionLabel = "Autre";
        if (lowerName.contains("kyc") || lowerName.contains("identit")) {
            suggestionType = "identity";
            suggestionLabel = "Pièce d'identité";
        } else if (lowerName.contains("contrat") || lowerName.contains("credit")) {
            suggestionType = "contract";
            suggestionLabel = "Contrat";
        } else if (lowerName.contains("releve") || lowerName.contains("statement")) {
            suggestionType = "statement";
            suggestionLabel = "Relevé bancaire";
        } else if (lowerName.contains("facture")) {
            suggestionType = "invoice";
            suggestionLabel = "Facture";
        }

        LinkedHashMap<String, Object> ocr = new LinkedHashMap<>();
        ocr.put("fileId", fileId);
        ocr.put("fileName", fileName);
        ocr.put("extractedText", extractedText);
        ocr.put("entities", entities);
        ocr.put("overallConfidence", 0.89);
        ocr.put("processingTime", 320);
        ocr.put("language", "Français");
        if ("application/pdf".equalsIgnoreCase(file.getContentType())) {
            ocr.put("pageCount", 1);
        }

        LinkedHashMap<String, Object> classification = new LinkedHashMap<>();
        classification.put("fileId", fileId);
        classification.put("suggestions", List.of(Map.of(
                "type", suggestionType,
                "label", suggestionLabel,
                "confidence", 0.84
        )));
        classification.put("tags", List.of(
                Map.of("id", "financial", "name", "Financier", "category", "domain"),
                Map.of("id", "client", "name", "Client", "category", "entity")
        ));
        classification.put("metadata", Map.of(
                "title", fileName,
                "clientName", "Client Démonstration",
                "accountNumber", "FR7612345678901234567890123",
                "documentDate", "04/03/2026",
                "reference", "REF-" + fileId.substring(Math.max(0, fileId.length() - 6)).toUpperCase(Locale.ROOT),
                "agency", "Siège Central Paris",
                "confidentiality", "NORMAL",
                "retentionPeriod", 10
        ));
        classification.put("isValid", true);
        classification.put("validationErrors", List.of());

        return ResponseEntity.ok(Map.of(
                "ocr", ocr,
                "classification", classification
        ));
    }

    @GetMapping
    @Operation(summary = "Récupérer l'état d'un traitement")
    public ResponseEntity<?> getStatus(@RequestParam String fileId) {
        return ResponseEntity.ok(Map.of(
                "fileId", fileId,
                "status", "completed",
                "progress", 100
        ));
    }

    private Map<String, Object> entity(String type, String value, double confidence) {
        return Map.of(
                "id", "entity-" + type,
                "type", type,
                "value", value,
                "confidence", confidence
        );
    }
}
