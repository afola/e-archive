package com.banque.archives.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(servers())
                .components(securityComponents())
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"));
    }

    private Info apiInfo() {
        return new Info()
                .title("API Archives Bancaires")
                .description("""
                        API REST complète pour la gestion des archives bancaires.
                        
                        ## Fonctionnalités principales
                        
                        - **Gestion des archives**: CRUD complet avec recherche avancée
                        - **Mouvements physiques**: Entrées, sorties, transferts, destructions
                        - **Workflows**: Demandes, validations, approbations
                        - **Conformité**: Règles de conservation, alertes d'échéance
                        - **Audit**: Traçabilité complète des actions
                        - **RBAC**: Gestion des rôles et permissions
                        
                        ## Authentification
                        
                        L'API utilise JWT (JSON Web Tokens) pour l'authentification.
                        Incluez le token dans l'en-tête `Authorization: Bearer <token>`.
                        """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("Equipe Archives")
                        .email("archives@banque.fr"))
                .license(new License()
                        .name("Propriétaire")
                        .url("https://www.banque.fr"));
    }

    private List<Server> servers() {
        return List.of(
                new Server()
                        .url("http://localhost:" + serverPort + "/api")
                        .description("Serveur de développement"),
                new Server()
                        .url("https://archives.banque.fr/api")
                        .description("Serveur de production")
        );
    }

    private Components securityComponents() {
        return new Components()
                .addSecuritySchemes("Bearer Authentication", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Entrez le token JWT"));
    }
}
