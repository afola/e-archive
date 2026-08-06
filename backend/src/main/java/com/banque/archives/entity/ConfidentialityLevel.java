package com.banque.archives.entity;

public enum ConfidentialityLevel {
    PUBLIC("Public", 1),
    NORMAL("Normal", 2),
    CONFIDENTIAL("Confidentiel", 3),
    SECRET("Secret", 4),
    TOP_SECRET("Très Secret", 5);

    private final String label;
    private final int level;

    ConfidentialityLevel(String label, int level) {
        this.label = label;
        this.level = level;
    }

    public String getLabel() {
        return label;
    }

    public int getLevel() {
        return level;
    }
}
