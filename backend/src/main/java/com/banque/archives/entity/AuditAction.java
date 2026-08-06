package com.banque.archives.entity;

public enum AuditAction {
    CREATE("Création"),
    READ("Lecture"),
    UPDATE("Modification"),
    DELETE("Suppression"),
    DOWNLOAD("Téléchargement"),
    PRINT("Impression"),
    MOVE("Déplacement"),
    BORROW("Emprunt"),
    RETURN("Retour"),
    APPROVE("Approbation"),
    REJECT("Rejet"),
    LOGIN("Connexion"),
    LOGOUT("Déconnexion");

    private final String label;

    AuditAction(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public boolean isSensitive() {
        return this == DELETE || this == DOWNLOAD || this == APPROVE || this == REJECT;
    }
}
