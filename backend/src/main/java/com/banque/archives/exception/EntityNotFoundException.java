package com.banque.archives.exception;

import lombok.Getter;

@Getter
public class EntityNotFoundException extends RuntimeException {
    
    private final String entityType;
    private final String identifier;

    public EntityNotFoundException(String entityType, String identifier) {
        super(String.format("%s non trouvé avec l'identifiant: %s", entityType, identifier));
        this.entityType = entityType;
        this.identifier = identifier;
    }
}
