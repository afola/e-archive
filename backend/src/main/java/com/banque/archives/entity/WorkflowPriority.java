package com.banque.archives.entity;

public enum WorkflowPriority {
    LOW("Basse"),
    NORMAL("Normale"),
    HIGH("Haute"),
    URGENT("Urgente");

    private final String label;

    WorkflowPriority(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
