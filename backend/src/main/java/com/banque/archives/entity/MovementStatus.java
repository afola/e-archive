package com.banque.archives.entity;

public enum MovementStatus {
    PENDING("En attente"),
    APPROVED("Approuvé"),
    EXECUTED("Exécuté"),
    CANCELLED("Annulé");

    private final String label;

    MovementStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
