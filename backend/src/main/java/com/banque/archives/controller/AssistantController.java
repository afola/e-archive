package com.banque.archives.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/assistant")
@Tag(name = "Assistant", description = "API assistant conversationnel")
public class AssistantController {

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Répondre à une demande de l'assistant")
    public ResponseEntity<String> chat(@RequestBody Map<String, Object> body) {
        String message = stringValue(body.get("message")).trim();
        String content = buildResponse(message);
        String payload = "data: {\"content\":" + toJsonString(content) + "}\n\n";

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .header(HttpHeaders.CONNECTION, "keep-alive")
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(payload);
    }

    private String buildResponse(String message) {
        String normalized = message.toLowerCase(Locale.ROOT);

        if (normalized.isBlank()) {
            return "Je peux vous aider sur la recherche d'archives, les statistiques, les échéances, la classification des documents et les workflows.";
        }

        if (containsAny(normalized, "bonjour", "salut", "bonsoir")) {
            return "Bonjour. Je peux vous aider sur:\n\n- la recherche de documents\n- les statistiques du jour\n- les échéances de conservation\n- la classification des documents\n- les workflows d'archives\n\nEssayez par exemple: \"statistiques\", \"documents récents\" ou \"aide classification\".";
        }

        if (containsAny(normalized, "stat")) {
            return buildStatsResponse();
        }

        if (containsAny(normalized, "récent", "recent", "dernier")) {
            return "Documents récents:\n\n1. ARC-KYC-102344 - Mise à jour dossier client\n2. ARC-CREDIT-087112 - Contrat de prêt PME\n3. ARC-LEGAL-120045 - Convention de garantie\n\nUtilisez la page Archives pour consulter les détails.";
        }

        if (containsAny(normalized, "échéance", "echeance", "deadline")) {
            return "Échéances à surveiller:\n\n- 3 archives arrivent à échéance dans les 30 jours\n- 7 archives arrivent à échéance dans les 90 jours\n- 2 demandes de destruction sont en attente\n\nConsultez le module Cycle de vie pour lancer les actions nécessaires.";
        }

        if (containsAny(normalized, "classif", "catégor", "categor", "aide")) {
            return "Guide rapide de classification:\n\n- KYC: pièces d'identité et justificatifs client\n- Crédit: contrats, garanties et pièces d'analyse\n- Juridique: conventions, contentieux et procès-verbaux\n- Comptabilité: factures, journaux et pièces de clôture\n\nAjoutez toujours la référence, le client et la date du document.";
        }

        if (containsAny(normalized, "recherche", "chercher", "trouve", "archive", "document")) {
            return "Je peux vous aider à cibler une recherche. Essayez une requête précise comme:\n\n- recherche ARC-KYC-102344\n- recherche client Martin\n- recherche compte 00123456";
        }

        return "Le moteur IA externe n'est pas sollicité ici, mais l'assistant local reste disponible. Essayez:\n\n- statistiques du jour\n- documents récents\n- échéances\n- aide classification";
    }

    private String buildStatsResponse() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        return "📊 **Statistiques du jour** (" + today + ")\n\n" +
                "**Vue d'ensemble:**\n" +
                "- Total des archives: **59**\n" +
                "- Archives actives: **22** (37.3%)\n" +
                "- En prêt: **5**\n" +
                "- Échéances proches (90 jours): **3**\n" +
                "- Demandes en attente: **2**\n" +
                "- Mouvements ce mois: **5**\n\n" +
                "**Top 5 types de documents:**\n" +
                "1. Documents KYC: 12 documents\n" +
                "2. Dossiers de Crédit: 10 documents\n" +
                "3. Contrats: 8 documents\n" +
                "4. Pièces Comptables: 6 documents\n" +
                "5. Documents RH: 7 documents\n\n" +
                "💡 *Astuce: Utilisez le tableau de bord pour plus de détails.*";
    }

    private boolean containsAny(String value, String... tokens) {
        return List.of(tokens).stream().anyMatch(value::contains);
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String toJsonString(String value) {
        return "\"" + value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "") + "\"";
    }
}
