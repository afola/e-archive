# Backend - Système de Gestion des Archives Bancaires

## 🏗️ Architecture

Backend Java Spring Boot pour le système de gestion des archives bancaires.

### Stack Technique

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Java** | 17 | Runtime |
| **Spring Boot** | 3.2.2 | Framework |
| **Spring Security** | - | Sécurité et authentification |
| **Spring Data JPA** | - | Accès aux données |
| **PostgreSQL** | 15+ | Base de données |
| **Flyway** | - | Migrations |
| **JWT** | 0.12.3 | Tokens d'authentification |
| **Lombok** | - | Réduction de boilerplate |
| **MapStruct** | 1.5.5 | Mapping DTO/Entity |
| **Swagger/OpenAPI** | 2.3.0 | Documentation API |

## 🚀 Démarrage rapide

### Prérequis

- Java 17+
- Maven 3.8+ ou Gradle
- PostgreSQL 15+

### Configuration

1. **Base de données PostgreSQL**

```sql
CREATE DATABASE archives_bancaires;
CREATE USER archives_user WITH PASSWORD 'archives_password';
GRANT ALL PRIVILEGES ON DATABASE archives_bancaires TO archives_user;
```

2. **Variables d'environnement**

```bash
export DB_USERNAME=archives_user
export DB_PASSWORD=archives_password
export JWT_SECRET=your-256-bit-secret-key-here
```

3. **Lancer l'application**

```bash
cd backend
mvn spring-boot:run
```

### Endpoints principaux

| Endpoint | Description |
|----------|-------------|
| `/api/auth/login` | Authentification |
| `/api/archives` | Gestion des archives |
| `/api/movements` | Mouvements physiques |
| `/api/workflows` | Demandes et validations |
| `/api/users` | Gestion utilisateurs |
| `/api/audit-logs` | Journal d'audit |
| `/api/kpis` | Indicateurs |

### Documentation API

Une fois l'application démarrée:
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api/api-docs

## 📁 Structure du projet

```
src/main/java/com/banque/archives/
├── config/                 # Configuration Spring
│   ├── SecurityConfig.java
│   ├── OpenApiConfig.java
│   └── ...
├── controller/            # Contrôleurs REST
│   ├── ArchiveController.java
│   ├── AuthController.java
│   ├── UserController.java
│   ├── WorkflowController.java
│   └── ...
├── dto/                   # Data Transfer Objects
│   ├── ArchiveDTO.java
│   ├── UserDTO.java
│   ├── LoginRequest.java
│   └── ...
├── entity/                # Entités JPA
│   ├── Archive.java
│   ├── User.java
│   ├── Role.java
│   ├── Movement.java
│   ├── WorkflowRequest.java
│   └── ...
├── exception/             # Gestion des erreurs
│   ├── BusinessException.java
│   ├── EntityNotFoundException.java
│   ├── GlobalExceptionHandler.java
│   └── ...
├── mapper/                # MapStruct mappers
├── repository/            # Repositories Spring Data
│   ├── ArchiveRepository.java
│   ├── UserRepository.java
│   └── ...
├── security/              # Sécurité
│   ├── JwtService.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
├── service/               # Services métier
│   ├── ArchiveService.java
│   ├── UserService.java
│   ├── WorkflowService.java
│   └── ...
└── ArchivesBancairesApplication.java
```

## 🔐 Authentification

### JWT Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@banque.fr",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "id": "...",
    "email": "user@banque.fr",
    "name": "Jean Dupont",
    "roleName": "ADMIN"
  }
}
```

### Utilisation du token

```http
GET /api/archives
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📊 Modèles de données

### Archive

```json
{
  "id": "uuid",
  "reference": "ARC-KYC-000001",
  "title": "Dossier KYC - Client SARL Martin",
  "typeId": "uuid",
  "typeName": "Documents KYC",
  "clientName": "SARL Martin",
  "accountNumber": "FR76 1234 5678 9012 3456",
  "agencyId": "uuid",
  "agencyName": "Agence Paris Centre",
  "status": "ACTIVE",
  "confidentiality": "CONFIDENTIAL",
  "archiveDate": "2024-01-15",
  "retentionEndDate": "2034-01-15",
  "version": 1
}
```

### WorkflowRequest

```json
{
  "id": "uuid",
  "type": "BORROW",
  "title": "Demande d'emprunt pour instruction crédit",
  "description": "Consultation du dossier pour analyse...",
  "priority": "HIGH",
  "status": "IN_VALIDATION",
  "currentStep": 2,
  "totalSteps": 3,
  "requesterId": "uuid",
  "requesterName": "Thomas Leroy"
}
```

## 🧪 Tests

```bash
# Tests unitaires
mvn test

# Tests d'intégration
mvn verify

# Couverture de code
mvn jacoco:report
```

## 📝 Endpoints API

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/refresh` | Rafraîchir token |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Profil utilisateur |

### Archives

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/archives` | Liste paginée |
| GET | `/api/archives/search` | Recherche avancée |
| GET | `/api/archives/{id}` | Détail |
| POST | `/api/archives` | Créer |
| PUT | `/api/archives/{id}` | Modifier |
| DELETE | `/api/archives/{id}` | Supprimer |
| PATCH | `/api/archives/{id}/status` | Changer statut |
| GET | `/api/archives/expiring` | Archives à échéance |
| GET | `/api/archives/expired` | Archives expirées |

### Workflows

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/workflows` | Liste demandes |
| GET | `/api/workflows/{id}` | Détail demande |
| POST | `/api/workflows` | Créer demande |
| POST | `/api/workflows/{id}/submit` | Soumettre |
| POST | `/api/workflows/{id}/approve` | Approuver |
| POST | `/api/workflows/{id}/reject` | Rejeter |
| POST | `/api/workflows/{id}/execute` | Exécuter |

### Utilisateurs (Admin)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users` | Liste utilisateurs |
| GET | `/api/users/{id}` | Détail utilisateur |
| POST | `/api/users` | Créer utilisateur |
| PUT | `/api/users/{id}` | Modifier |
| POST | `/api/users/{id}/reset-password` | Reset password |

## 🔧 Configuration

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/archives_bancaires
    username: ${DB_USERNAME:archives_user}
    password: ${DB_PASSWORD:archives_password}

jwt:
  secret: ${JWT_SECRET:your-secret-key}
  expiration: 86400000

logging:
  level:
    com.banque.archives: DEBUG
```

## 🚢 Déploiement

### Docker

```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/archives-backend.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
docker build -t archives-backend .
docker run -p 8080:8080 archives-backend
```

## 📖 Documentation complémentaire

- [Documentation API complète](./API.md)
- [Guide de contribution](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
