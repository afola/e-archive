package com.banque.archives.entity;

public enum WorkflowType {
    BORROW("Emprunt"),
    CONSULTATION("Consultation"),
    DESTRUCTION("Destruction"),
    TRANSFER("Transfert"),
    MODIFICATION("Modification");

    private final String label;

    WorkflowType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
