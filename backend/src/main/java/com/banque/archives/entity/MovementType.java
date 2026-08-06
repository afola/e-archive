package com.banque.archives.entity;

public enum MovementType {
    ENTRY("Entrée en stock"),
    EXIT("Sortie temporaire"),
    BORROW("Emprunt"),
    RETURN("Retour / Restitution"),
    TRANSFER("Transfert entre sites"),
    DESTRUCTION("Destruction autorisée"),
    QUARANTINE("Mise en quarantaine");

    private final String label;

    MovementType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
