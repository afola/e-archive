package com.banque.archives.entity;

public enum WorkflowStatus {
    DRAFT("Brouillon"),
    SUBMITTED("Soumis"),
    IN_VALIDATION("En validation"),
    APPROVED("Approuvé"),
    REJECTED("Rejeté"),
    EXECUTED("Exécuté"),
    CLOSED("Clôturé");

    private final String label;

    WorkflowStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
