package com.banque.archives.entity;

public enum NotificationType {
    ALERT("Alerte"),
    INFO("Information"),
    WARNING("Avertissement"),
    SUCCESS("Succès");

    private final String label;

    NotificationType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
