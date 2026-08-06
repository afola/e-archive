package com.banque.archives.entity;

public enum ArchiveStatus {
    ACTIVE("Active"),
    ON_LOAN("En prêt"),
    IN_TRANSFER("En transfert"),
    PENDING_DESTRUCTION("Destruction en attente"),
    DESTROYED("Détruite"),
    ARCHIVED("Archivée"),
    EXPIRED("Expirée");

    private final String label;

    ArchiveStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
