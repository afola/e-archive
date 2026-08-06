# Documentation Technique - Système de Gestion des Archives Bancaires

## 📋 Table des matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Stack technologique](#stack-technologique)
3. [Architecture de l'application](#architecture-de-lapplication)
4. [Structure des dossiers](#structure-des-dossiers)
5. [Base de données](#base-de-données)
6. [Modules fonctionnels](#modules-fonctionnels)
7. [Composants UI réutilisables](#composants-ui-réutilisables)
8. [État global (State Management)](#état-global-state-management)
9. [Données mock](#données-mock)
10. [Guide de développement](#guide-de-développement)
11. [Points d'extension et APIs à implémenter](#points-dextension-et-apis-à-implémenter)
12. [Conventions de code](#conventions-de-code)

---

## Vue d'ensemble du projet

### Objectif métier

Cette application est un système complet de gestion des archives bancaires (documents physiques et numériques) permettant de gérer tout le cycle de vie des archives :

- **Création / Enregistrement** d'archives
- **Indexation et classification** (par type, catégorie, client, compte)
- **Recherche multicritère** rapide et avancée
- **Consultation / Téléchargement** des documents numériques
- **Suivi des mouvements physiques** (entrée, sortie, transfert)
- **Gestion des emprunts / restitutions**
- **Workflow de validation / approbation**
- **Gestion des durées de conservation** (retention)
- **Alertes d'échéance / destruction / transfert**
- **Traçabilité complète** (audit trail)
- **Gestion des accès par rôle** (RBAC)

### Utilisateurs cibles

- Archivistes centraux et d'agence
- Responsables conformité
- Auditeurs internes
- Personnel bancaire (crédits, service clientèle, juridique)
- Administrateurs système

---

## Stack technologique

### Framework & Runtime

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Next.js** | 16.x | Framework React avec App Router |
| **React** | 19.x | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Bun** | - | Runtime et gestionnaire de paquets |

### UI & Styling

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Tailwind CSS** | 4.x | Framework CSS utilitaire |
| **shadcn/ui** | - | Composants UI basés sur Radix UI |
| **Lucide Icons** | - | Icônes SVG cohérentes |
| **Framer Motion** | 12.x | Animations fluides et professionnelles |

### State Management & Data

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Zustand** | 5.x | State management léger |
| **TanStack Table** | 8.x | Tableaux avancés (tri, filtres, pagination) |
| **TanStack Query** | 5.x | Cache et gestion des requêtes serveur (disponible) |
| **Prisma** | 6.x | ORM pour la base de données |
| **SQLite** | - | Base de données (configurable pour PostgreSQL) |

### Visualisation

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Recharts** | 2.x | Graphiques et visualisations |

### Formulaires & Validation

| Technologie | Version | Description |
|-------------|---------|-------------|
| **React Hook Form** | 7.x | Gestion des formulaires |
| **Zod** | 4.x | Validation de schémas |

### Utilitaires

| Technologie | Version | Description |
|-------------|---------|-------------|
| **date-fns** | 4.x | Manipulation des dates |
| **clsx** | - | Concaténation de classes |
| **tailwind-merge** | - | Fusion intelligente de classes Tailwind |

---

## Architecture de l'application

### Pattern architectural

L'application suit une architecture **modulaire** avec séparation des préoccupations :

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│  (Pages Next.js + Composants React + Animations Framer)     │
├─────────────────────────────────────────────────────────────┤
│                      STATE MANAGEMENT                        │
│              (Zustand Store + TanStack Query)               │
├─────────────────────────────────────────────────────────────┤
│                      API LAYER                               │
│          (Routes API Next.js + Server Actions)              │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│                  (Prisma ORM + SQLite)                      │
└─────────────────────────────────────────────────────────────┘
```

### Flux de données

```
User Action → Component → Zustand Store → API Route → Prisma → Database
                    ↓
              Mock Data (actuellement)
```

---

## Structure des dossiers

```
src/
├── app/                          # Routes Next.js (App Router)
│   ├── layout.tsx               # Layout principal avec AppLayout
│   ├── page.tsx                 # Dashboard (page d'accueil)
│   ├── globals.css              # Styles globaux + variables CSS
│   │
│   ├── archives/                # Module Gestion des Archives
│   │   └── page.tsx
│   │
│   ├── search/                  # Module Centre de Recherche
│   │   └── page.tsx
│   │
│   ├── movements/               # Module Mouvements Physiques
│   │   └── page.tsx
│   │
│   ├── workflows/               # Module Workflows & Demandes
│   │   └── page.tsx
│   │
│   ├── retention/               # Module Conservation & Conformité
│   │   └── page.tsx
│   │
│   ├── audit/                   # Module Audit & Traçabilité
│   │   └── page.tsx
│   │
│   ├── reports/                 # Module Rapports & Statistiques
│   │   └── page.tsx
│   │
│   ├── users/                   # Module Gestion Utilisateurs
│   │   └── page.tsx
│   │
│   └── settings/                # Module Paramètres
│       └── page.tsx
│
├── components/
│   ├── ui/                      # Composants shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── ... (autres composants UI)
│   │
│   ├── layout/                  # Composants de layout
│   │   ├── sidebar.tsx          # Sidebar navigation
│   │   ├── topbar.tsx           # Barre supérieure
│   │   └── app-layout.tsx       # Layout wrapper
│   │
│   └── archive/                 # Composants métier archives
│       ├── kpi-card.tsx         # Cartes KPI animées
│       ├── status-badge.tsx     # Badges de statut
│       ├── confidentiality-badge.tsx
│       ├── archive-table.tsx    # Tableau avancé
│       ├── filter-panel.tsx     # Panneau de filtres
│       ├── archive-timeline.tsx # Timeline d'événements
│       ├── workflow-stepper.tsx # Stepper de validation
│       ├── retention-alert-card.tsx
│       ├── document-preview.tsx
│       └── activity-feed.tsx
│
├── store/
│   └── archive-store.ts         # Store Zustand global
│
├── data/
│   └── mock-data.ts             # Données mock réalistes
│
├── lib/
│   ├── utils.ts                 # Fonctions utilitaires
│   └── db.ts                    # Client Prisma
│
├── hooks/
│   ├── use-toast.ts             # Hook notifications toast
│   └── use-mobile.ts            # Hook détection mobile
│
└── prisma/
    └── schema.prisma            # Schéma base de données
```

---

## Base de données

### Modèle Entité-Association

Le schéma Prisma définit les entités suivantes :

#### Gestion des utilisateurs et RBAC

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  firstName     String?
  lastName      String?
  avatar        String?
  phone         String?
  department    String?
  position      String?
  agencyId      String?
  roleId        String
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  role          Role      @relation(...)
  agency        Agency?   @relation(...)
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  code        String   @unique
  description String?
  level       Int      @default(0)
  permissions String   // JSON array of permission codes
  isSystem    Boolean  @default(false)
}

model Agency {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  address     String?
  city        String?
  region      String?
  phone       String?
  isActive    Boolean  @default(true)
}
```

#### Gestion des archives

```prisma
model Archive {
  id                String   @id @default(cuid())
  reference         String   @unique
  title             String
  description       String?
  typeId            String
  
  // Client/Account info
  clientName        String?
  clientNumber      String?
  accountNumber     String?
  dossierNumber     String?
  
  // Ownership
  agencyId          String
  department        String?
  
  // Dates
  documentDate      DateTime?
  archiveDate       DateTime  @default(now())
  retentionEndDate  DateTime
  destructionDate   DateTime?
  
  // Status & Classification
  status            String   @default("ACTIVE")
  confidentiality   String   @default("NORMAL")
  version           Int      @default(1)
  
  // Physical location
  locationId        String?
  boxNumber         String?
  
  // Digital
  hasDigitalCopy    Boolean  @default(false)
  filePath          String?
  fileSize          Int?
  
  // Metadata
  keywords          String?  // JSON array
  customFields      String?  // JSON object
  tags              String?  // JSON array
}

model ArchiveType {
  id             String   @id @default(cuid())
  code           String   @unique
  name           String
  description    String?
  retentionYears Int
  category       String?
  subCategory    String?
  color          String?
  icon           String?
  isActive       Boolean  @default(true)
}

model Location {
  id          String   @id @default(cuid())
  agencyId    String
  site        String
  building    String?
  room        String?
  shelf       String?
  box         String?
  code        String   @unique
  description String?
  capacity    Int?
  currentLoad Int      @default(0)
}

model ArchiveFile {
  id            String   @id @default(cuid())
  archiveId     String
  name          String
  originalName  String
  mimeType      String
  size          Int
  path          String
  checksum      String?
  uploadedBy    String
  uploadedAt    DateTime @default(now())
  version       Int      @default(1)
}
```

#### Mouvements et Workflow

```prisma
model Movement {
  id              String   @id @default(cuid())
  archiveId       String
  type            String   // ENTRY, EXIT, RETURN, TRANSFER, DESTRUCTION, QUARANTINE
  fromLocationId  String?
  toLocationId    String?
  fromAgencyId    String?
  toAgencyId      String?
  reason          String?
  notes           String?
  requestedBy     String
  requestedAt     DateTime @default(now())
  approvedBy      String?
  approvedAt      DateTime?
  executedBy      String?
  executedAt      DateTime?
  status          String   @default("PENDING")
  receiptNumber   String?  @unique
  expectedReturnDate DateTime?
  actualReturnDate DateTime?
}

model WorkflowRequest {
  id              String   @id @default(cuid())
  archiveId       String?
  type            String   // BORROW, CONSULTATION, DESTRUCTION, TRANSFER, MODIFICATION
  title           String
  description     String?
  priority        String   @default("NORMAL")
  
  requesterId     String
  requestedAt     DateTime @default(now())
  currentStep     Int      @default(1)
  totalSteps      Int      @default(3)
  status          String   @default("DRAFT")
  
  // Approval chain
  approvedByN1    String?
  approvedAtN1    DateTime?
  commentN1       String?
  
  approvedByCompliance String?
  approvedAtCompliance DateTime?
  commentCompliance String?
  
  approvedByManager   String?
  approvedAtManager   DateTime?
  commentManager      String?
  
  // SLA
  dueDate         DateTime?
  completedAt     DateTime?
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  archiveId   String?
  action      String   // CREATE, READ, UPDATE, DELETE, DOWNLOAD, PRINT, MOVE, BORROW, RETURN, APPROVE, REJECT
  entityType  String
  entityId    String
  details     String?  // JSON object
  ipAddress   String?
  userAgent   String?
  sessionId   String?
  isSensitive Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

### Statuts d'archive

| Statut | Description |
|--------|-------------|
| `ACTIVE` | Archive active et accessible |
| `ON_LOAN` | Actuellement empruntée |
| `IN_TRANSFER` | En cours de transfert |
| `PENDING_DESTRUCTION` | En attente de destruction |
| `DESTROYED` | Détruite |
| `ARCHIVED` | Archivée (archives historiques) |
| `EXPIRED` | Durée de conservation dépassée |

### Niveaux de confidentialité

| Niveau | Description | Restrictions |
|--------|-------------|--------------|
| `PUBLIC` | Public | Aucune restriction |
| `NORMAL` | Normal | Accès authentifié |
| `CONFIDENTIAL` | Confidentiel | Accès restreint par service |
| `SECRET` | Secret | Accès sur validation |
| `TOP_SECRET` | Très Secret | Accès hautement restreint |

---

## Modules fonctionnels

### 1. Tableau de bord (Dashboard)

**Route:** `/`

**Fonctionnalités:**
- KPI cards animées avec tendances
- Graphiques Recharts interactifs
- Alertes de conservation
- Activité récente en temps réel
- Demandes en attente de validation
- Top utilisateurs consommateurs

**Composants utilisés:**
- `KPICard`
- `RetentionAlertCard`
- `ActivityFeed`
- Graphiques Recharts (AreaChart, PieChart, BarChart)

**Données:**
```typescript
interface KPIData {
  totalArchives: number
  activeArchives: number
  onLoanArchives: number
  expiringArchives: number
  pendingValidation: number
  destroyedArchives: number
  transferredArchives: number
}
```

### 2. Gestion des Archives

**Route:** `/archives`

**Fonctionnalités:**
- Tableau dense avec tri multi-colonnes
- Pagination configurable (10, 20, 50, 100)
- Filtres multicritères empilables
- Vue tableau et vue cartes
- Actions contextuelles (voir, modifier, télécharger, déplacer, emprunter)
- Indicateur de jours restants avant échéance

**Colonnes du tableau:**
- Référence archive
- Titre
- Type
- Agence
- Date archive
- Fin conservation
- Statut
- Confidentialité
- Version
- Actions

**Filtres disponibles:**
- Recherche full-text
- Statut
- Type d'archive
- Agence
- Confidentialité
- Période (date début/fin)
- Nom client
- Numéro de compte

### 3. Centre de Recherche

**Route:** `/search`

**Fonctionnalités:**
- Recherche globale full-text
- Filtres avancés avec logique AND/OR
- Sauvegarde de recherches favorites
- Historique des recherches récentes
- Export des résultats (CSV, Excel, PDF)
- Vue résultats en tableau ou cartes

**Critères de recherche:**
- Référence archive
- Nom client
- Numéro compte
- Type document
- Date document
- Agence
- Mots-clés
- Code boîte / emplacement

### 4. Mouvements Physiques

**Route:** `/movements`

**Fonctionnalités:**
- Suivi des entrées/sorties
- Gestion des transferts inter-sites
- Mise en quarantaine
- Restitution d'emprunts
- Destruction autorisée
- Génération de bons de mouvement
- Interface prête pour scan code-barres/QR

**Types de mouvements:**
| Type | Description |
|------|-------------|
| `ENTRY` | Entrée en stock |
| `EXIT` | Sortie temporaire |
| `RETURN` | Retour / restitution |
| `TRANSFER` | Transfert entre sites |
| `DESTRUCTION` | Destruction autorisée |
| `QUARANTINE` | Mise en quarantaine |

### 5. Workflows & Demandes

**Route:** `/workflows`

**Fonctionnalités:**
- Création de demandes (emprunt, consultation, destruction, transfert)
- Circuit de validation multi-niveaux
- Vue liste et Kanban
- Statuts et priorités
- Commentaires d'approbation/rejet
- SLA et délais de traitement
- Notifications visuelles

**Circuit de validation type:**
```
1. Validation N+1 → 2. Validation Conformité → 3. Validation Manager → Exécution
```

**Statuts de workflow:**
| Statut | Description |
|--------|-------------|
| `DRAFT` | Brouillon |
| `SUBMITTED` | Soumis |
| `IN_VALIDATION` | En cours de validation |
| `APPROVED` | Approuvé |
| `REJECTED` | Rejeté |
| `EXECUTED` | Exécuté |
| `CLOSED` | Clôturé |

### 6. Conservation & Conformité

**Route:** `/retention`

**Fonctionnalités:**
- Règles de conservation par type d'archive
- Alertes d'échéance (90, 60, 30 jours)
- Archives expirées
- Propositions de destruction/transfert
- Validation des destructions
- Historique des destructions
- Rapports de conformité
- Indicateurs de respect des règles

**Données clés:**
```typescript
interface RetentionRule {
  archiveTypeId: string
  retentionYears: number
  alertDays: number      // Jours avant alerte
  autoDestroy: boolean
  transferDestination?: string
}
```

### 7. Audit & Traçabilité

**Route:** `/audit`

**Fonctionnalités:**
- Journal complet des actions
- Filtres avancés (utilisateur, date, action, archive, IP)
- Vue timeline et vue tableau
- Export d'audit
- Indicateurs d'actions sensibles
- Alertes sur comportements anormaux

**Actions tracées:**
| Action | Description | Sensible |
|--------|-------------|----------|
| `CREATE` | Création | Non |
| `READ` / `VIEW` | Consultation | Non |
| `UPDATE` | Modification | Oui |
| `DELETE` | Suppression | Oui |
| `DOWNLOAD` | Téléchargement | Oui |
| `PRINT` | Impression | Oui |
| `MOVE` | Déplacement | Non |
| `BORROW` | Emprunt | Non |
| `RETURN` | Retour | Non |
| `APPROVE` | Approbation | Oui |
| `REJECT` | Rejet | Oui |

### 8. Rapports & Statistiques

**Route:** `/reports`

**Fonctionnalités:**
- Volumétrie par période
- Répartition par agence/service
- Répartition par type
- Mouvements physiques
- Délais de validation
- Archives expirées
- Destructions réalisées
- Taux de restitution dans les délais
- Export PDF/Excel

**Graphiques disponibles:**
- Évolution mensuelle (Area chart)
- Répartition par statut (Pie chart)
- Volumétrie par type (Bar chart)
- Délais de validation (Bar chart horizontal)
- Taux de restitution (Progress bars)

### 9. Gestion Utilisateurs (RBAC)

**Route:** `/users`

**Fonctionnalités:**
- CRUD utilisateurs
- Gestion des rôles et permissions
- Profils types prédéfinis
- Assignation agence/département

**Rôles prédéfinis:**

| Rôle | Code | Permissions |
|------|------|-------------|
| Administrateur SI | `ADMIN` | Tous les droits |
| Archiviste Central | `ARCHIVIST_CENTRAL` | Lecture, écriture, approbation, export |
| Archiviste Agence | `ARCHIVIST_AGENCY` | Lecture, écriture, emprunt |
| Contrôle Interne / Audit | `AUDITOR` | Lecture, audit, export |
| Utilisateur Consultation | `USER` | Lecture, emprunt |
| Responsable Conformité | `COMPLIANCE` | Lecture, approbation, audit |

### 10. Paramètres

**Route:** `/settings`

**Fonctionnalités:**
- Configuration générale de l'entité
- Gestion des sites et emplacements
- Types d'archives
- Catégories et sous-catégories
- Niveaux de confidentialité
- Règles de conservation
- Matrice de validation workflow
- Paramètres de notification
- Configuration email (SMTP)
- Logs système

---

## Composants UI réutilisables

### KPICard

Carte KPI animée avec icône, valeur, tendance et couleur.

```tsx
interface KPICardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: { value: number; isPositive: boolean }
  subtitle?: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal'
  className?: string
}

// Usage
<KPICard
  title="Total Archives"
  value={1523}
  icon={Archive}
  trend={{ value: 12, isPositive: true }}
  color="blue"
/>
```

### StatusBadge

Badge de statut coloré pour les archives.

```tsx
interface StatusBadgeProps {
  status: ArchiveStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Status disponibles: ACTIVE, ON_LOAN, IN_TRANSFER, PENDING_DESTRUCTION, DESTROYED, ARCHIVED, EXPIRED
```

### ConfidentialityBadge

Badge de niveau de confidentialité.

```tsx
interface ConfidentialityBadgeProps {
  level: ConfidentialityLevel
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

// Niveaux: PUBLIC, NORMAL, CONFIDENTIAL, SECRET, TOP_SECRET
```

### ArchiveTable

Tableau avancé avec TanStack Table.

```tsx
interface ArchiveTableProps {
  data: Archive[]
  onView?: (archive: Archive) => void
  onEdit?: (archive: Archive) => void
  onDownload?: (archive: Archive) => void
  onMove?: (archive: Archive) => void
  onBorrow?: (archive: Archive) => void
  className?: string
}
```

**Fonctionnalités intégrées:**
- Tri multi-colonnes
- Pagination
- Actions contextuelles
- Animations de ligne

### AdvancedFilterPanel

Panneau de filtres avancés.

```tsx
interface AdvancedFilterPanelProps {
  filters: ArchiveFilters
  onFiltersChange: (filters: ArchiveFilters) => void
  onReset: () => void
  className?: string
}
```

### WorkflowStepper

Stepper de validation workflow.

```tsx
interface WorkflowStepperProps {
  steps: WorkflowStep[]
  currentStep: number
  className?: string
}

interface WorkflowStep {
  id: string
  label: string
  status: 'pending' | 'current' | 'completed' | 'rejected'
  date?: string
  user?: string
  comment?: string
}
```

### ArchiveTimeline

Timeline d'événements d'archive.

```tsx
interface ArchiveTimelineProps {
  events: TimelineEvent[]
  className?: string
}

interface TimelineEvent {
  id: string
  type: 'create' | 'update' | 'view' | 'download' | 'move' | 'borrow' | 'return' | ...
  title: string
  description?: string
  user: string
  timestamp: string
}
```

### RetentionAlertCard

Carte d'alerte de conservation.

```tsx
interface RetentionAlertCardProps {
  alerts: RetentionAlert[]
  onAction?: (alert: RetentionAlert) => void
  className?: string
}

interface RetentionAlert {
  id: string
  archiveRef: string
  title: string
  daysLeft: number
  action: 'DESTRUCTION' | 'TRANSFER' | 'REVIEW'
}
```

### ActivityFeed

Flux d'activité récente.

```tsx
interface ActivityFeedProps {
  activities: Activity[]
  maxItems?: number
  className?: string
}
```

---

## État global (State Management)

### Store Zustand

Le store global est défini dans `src/store/archive-store.ts` :

```typescript
interface ArchiveState {
  // Archives
  archives: Archive[]
  selectedArchive: Archive | null
  archiveFilters: ArchiveFilters
  archivePagination: { page: number; pageSize: number; total: number }
  
  // Mouvements
  movements: Movement[]
  selectedMovement: Movement | null
  
  // Workflows
  workflows: WorkflowRequest[]
  selectedWorkflow: WorkflowRequest | null
  
  // Audit
  auditLogs: AuditLog[]
  
  // Notifications
  notifications: Notification[]
  
  // User
  currentUser: User | null
  
  // KPIs
  kpiData: KPIData | null
  
  // UI State
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  activeModule: string
  
  // Actions
  setArchives: (archives: Archive[]) => void
  setSelectedArchive: (archive: Archive | null) => void
  setArchiveFilters: (filters: ArchiveFilters) => void
  // ... autres actions
}
```

### Usage

```tsx
import { useArchiveStore } from '@/store/archive-store'

function MyComponent() {
  const { archives, setArchives, sidebarCollapsed, toggleSidebar } = useArchiveStore()
  
  // Utilisation...
}
```

### Persistance

Le store persiste automatiquement les préférences UI :
- `sidebarCollapsed`
- `theme`

---

## Données mock

### Emplacement

`src/data/mock-data.ts`

### Données disponibles

```typescript
// Utilisateurs
export const mockUsers: User[]

// Agences
export const mockAgencies

// Types d'archives
export const archiveTypes

// Archives (générées dynamiquement)
export const mockArchives: Archive[]

// Mouvements
export const mockMovements: Movement[]

// Workflows
export const mockWorkflows: WorkflowRequest[]

// Logs d'audit
export const mockAuditLogs: AuditLog[]

// Notifications
export const mockNotifications: Notification[]

// KPIs
export const mockKPIData: KPIData

// Données pour graphiques
export const archiveVolumeByType
export const monthlyMovements
export const archivesByAgency
export const archivesByStatus
export const topUsers
export const retentionAlerts
```

### Génération d'archives

Les archives sont générées automatiquement avec des données réalistes :
- Références uniques
- Clients français
- Comptes bancaires formatés
- Dates cohérentes
- Statuts variés
- Localisations physiques

---

## Guide de développement

### Démarrage

```bash
# Installer les dépendances
bun install

# Pousser le schéma DB
bun run db:push

# Lancer le serveur de développement
bun run dev

# Vérifier le lint
bun run lint
```

### Ajouter un nouveau module

1. Créer le dossier dans `src/app/[module]/`
2. Créer `page.tsx`
3. Ajouter l'entrée dans la sidebar (`src/components/layout/sidebar.tsx`)
4. Ajouter les types dans le store si nécessaire
5. Créer les composants métier dans `src/components/[module]/`

### Créer un nouveau composant UI

1. Vérifier si shadcn/ui a le composant : `bunx shadcn@latest add [component]`
2. Sinon, créer dans `src/components/ui/`
3. Utiliser `cn()` pour les classes conditionnelles

### Ajouter une donnée mock

1. Modifier `src/data/mock-data.ts`
2. Créer une fonction de génération si nécessaire
3. Exporter et utiliser dans les pages

---

## Points d'extension et APIs à implémenter

### APIs REST à créer

```typescript
// Archives
GET    /api/archives           // Liste avec pagination/filtres
GET    /api/archives/:id       // Détail
POST   /api/archives           // Création
PUT    /api/archives/:id       // Modification
DELETE /api/archives/:id       // Suppression (soft)
GET    /api/archives/:id/files // Fichiers associés
GET    /api/archives/:id/timeline // Historique

// Mouvements
GET    /api/movements
POST   /api/movements
PUT    /api/movements/:id/approve
PUT    /api/movements/:id/execute

// Workflows
GET    /api/workflows
POST   /api/workflows
PUT    /api/workflows/:id/approve
PUT    /api/workflows/:id/reject

// Audit
GET    /api/audit-logs
GET    /api/audit-logs/export

// Users
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

// Search
POST   /api/search             // Recherche avancée
GET    /api/search/saved       // Recherches sauvegardées
POST   /api/search/saved       // Sauvegarder recherche

// Reports
GET    /api/reports/:type      // Générer rapport
GET    /api/reports/export     // Export

// Retention
GET    /api/retention/alerts
GET    /api/retention/expired
POST   /api/retention/destroy  // Demander destruction
```

### Authentification à implémenter

- Intégrer NextAuth.js (déjà installé)
- Configurer les providers (LDAP, OIDC, etc.)
- Implémenter le middleware de protection des routes
- Gérer les sessions

### Stockage de fichiers

- Configurer le stockage (S3, local, etc.)
- Implémenter l'upload de fichiers
- Gérer les versions de documents
- Implémenter la prévisualisation

### Notifications temps réel

- Configurer WebSocket (exemple disponible dans `examples/websocket/`)
- Notifications push pour les validations
- Alertes de conservation

---

## Conventions de code

### Nommage

- **Fichiers composants:** `kebab-case.tsx`
- **Composants:** `PascalCase`
- **Fonctions utilitaires:** `camelCase`
- **Types/Interfaces:** `PascalCase`
- **Constantes:** `SCREAMING_SNAKE_CASE`

### Imports

```typescript
// 1. React/Next
import { useState } from 'react'
import { motion } from 'framer-motion'

// 2. Librairies externes
import { format } from 'date-fns'

// 3. Composants UI
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Composants métier
import { StatusBadge } from '@/components/archive/status-badge'

// 5. Store et données
import { useArchiveStore } from '@/store/archive-store'
import { mockData } from '@/data/mock-data'

// 6. Types
import type { Archive } from '@/store/archive-store'

// 7. Utilitaires
import { cn, formatDate } from '@/lib/utils'
```

### Structure des composants

```tsx
'use client' // Si composant client

// Imports...

interface ComponentProps {
  // Props typées
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks (useState, useEffect, etc.)
  const [state, setState] = useState()
  
  // 2. Store
  const { data, setData } = useArchiveStore()
  
  // 3. Dérivés
  const filtered = useMemo(() => ..., [deps])
  
  // 4. Handlers
  const handleClick = () => { ... }
  
  // 5. Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  )
}
```

### Tailwind CSS

- Utiliser les variables CSS (`bg-primary`, `text-muted-foreground`)
- Regrouper les classes par catégorie
- Utiliser `cn()` pour les classes conditionnelles

```tsx
<div className={cn(
  'flex items-center gap-2 p-4',
  'rounded-lg border',
  isActive && 'bg-primary/10 border-primary',
  className
)}>
```

### Animations Framer Motion

```tsx
// Animations subtiles et professionnelles
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.05 }}
>
  {/* Contenu */}
</motion.div>
```

---

## Checklist de continuation

### Priorité Haute

- [ ] Implémenter l'authentification (NextAuth.js)
- [ ] Créer les API routes pour le CRUD
- [ ] Configurer le stockage de fichiers
- [ ] Brancher les données réelles (remplacer les mocks)

### Priorité Moyenne

- [ ] Implémenter les notifications temps réel
- [ ] Ajouter l'export PDF/Excel
- [ ] Créer les tests unitaires
- [ ] Optimiser les performances (pagination serveur)

### Priorité Basse

- [ ] Internationalisation (i18n)
- [ ] Mode hors ligne (PWA)
- [ ] Application mobile
- [ ] Intégration scan code-barres

---

## Backend Java Spring Boot

### Stack Backend

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Java** | 17 | Runtime |
| **Spring Boot** | 3.2.2 | Framework backend |
| **Spring Security** | - | Sécurité et authentification |
| **Spring Data JPA** | - | ORM et accès aux données |
| **PostgreSQL** | 15+ | Base de données relationnelle |
| **Flyway** | - | Migrations de base de données |
| **JWT (jjwt)** | 0.12.3 | Authentification stateless |
| **MapStruct** | 1.5.5 | Mapping DTO/Entity |
| **Lombok** | - | Réduction du boilerplate |
| **Swagger/OpenAPI** | 2.3.0 | Documentation API |

### Structure du Backend

```
backend/
├── pom.xml                              # Maven dependencies
├── src/
│   ├── main/
│   │   ├── java/com/banque/archives/
│   │   │   ├── ArchivesBancairesApplication.java
│   │   │   │
│   │   │   ├── config/                  # Configuration
│   │   │   │   ├── OpenApiConfig.java
│   │   │   │   └── SecurityConfig.java
│   │   │   │
│   │   │   ├── controller/              # REST Controllers
│   │   │   │   ├── ArchiveController.java
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── UserController.java
│   │   │   │   ├── WorkflowController.java
│   │   │   │   └── KpiController.java
│   │   │   │
│   │   │   ├── dto/                     # Data Transfer Objects
│   │   │   │   ├── ArchiveDTO.java
│   │   │   │   ├── ArchiveCreateRequest.java
│   │   │   │   ├── ArchiveSearchRequest.java
│   │   │   │   ├── UserDTO.java
│   │   │   │   ├── WorkflowRequestDTO.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── AuthResponse.java
│   │   │   │   └── PageResponse.java
│   │   │   │
│   │   │   ├── entity/                  # JPA Entities
│   │   │   │   ├── User.java
│   │   │   │   ├── Role.java
│   │   │   │   ├── Agency.java
│   │   │   │   ├── Archive.java
│   │   │   │   ├── ArchiveType.java
│   │   │   │   ├── ArchiveStatus.java
│   │   │   │   ├── ArchiveFile.java
│   │   │   │   ├── Location.java
│   │   │   │   ├── Movement.java
│   │   │   │   ├── MovementType.java
│   │   │   │   ├── MovementStatus.java
│   │   │   │   ├── WorkflowRequest.java
│   │   │   │   ├── WorkflowType.java
│   │   │   │   ├── WorkflowStatus.java
│   │   │   │   ├── WorkflowPriority.java
│   │   │   │   ├── AuditLog.java
│   │   │   │   ├── AuditAction.java
│   │   │   │   ├── Notification.java
│   │   │   │   ├── NotificationType.java
│   │   │   │   ├── Comment.java
│   │   │   │   ├── RetentionRule.java
│   │   │   │   └── ConfidentialityLevel.java
│   │   │   │
│   │   │   ├── exception/               # Exception handling
│   │   │   │   ├── BusinessException.java
│   │   │   │   ├── EntityNotFoundException.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ErrorResponse.java
│   │   │   │
│   │   │   ├── repository/              # Spring Data Repositories
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── RoleRepository.java
│   │   │   │   ├── AgencyRepository.java
│   │   │   │   ├── ArchiveRepository.java
│   │   │   │   ├── ArchiveTypeRepository.java
│   │   │   │   ├── LocationRepository.java
│   │   │   │   ├── MovementRepository.java
│   │   │   │   ├── WorkflowRequestRepository.java
│   │   │   │   ├── AuditLogRepository.java
│   │   │   │   ├── NotificationRepository.java
│   │   │   │   ├── CommentRepository.java
│   │   │   │   ├── ArchiveFileRepository.java
│   │   │   │   └── RetentionRuleRepository.java
│   │   │   │
│   │   │   ├── security/                # Security components
│   │   │   │   ├── JwtService.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   │
│   │   │   └── service/                 # Business logic
│   │   │       ├── ArchiveService.java
│   │   │       ├── UserService.java
│   │   │       ├── WorkflowService.java
│   │   │       ├── AuditLogService.java
│   │   │       ├── NotificationService.java
│   │   │       └── KpiService.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml          # Application configuration
│   │       └── db/migration/            # Flyway migrations
│   │           ├── V1__Initial_Schema.sql
│   │           └── V2__Seed_Data.sql
│   │
│   └── test/                            # Tests
│
└── README.md                            # Documentation backend
```

### API REST Endpoints

#### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion utilisateur |
| POST | `/api/auth/refresh` | Rafraîchir token JWT |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Profil utilisateur courant |

#### Archives

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/archives` | Liste paginée des archives |
| GET | `/api/archives/search` | Recherche avec filtres |
| GET | `/api/archives/{id}` | Détail d'une archive |
| GET | `/api/archives/reference/{ref}` | Archive par référence |
| POST | `/api/archives` | Créer une archive |
| PUT | `/api/archives/{id}` | Modifier une archive |
| DELETE | `/api/archives/{id}` | Supprimer une archive |
| PATCH | `/api/archives/{id}/status` | Changer le statut |
| GET | `/api/archives/expiring` | Archives à échéance |
| GET | `/api/archives/expired` | Archives expirées |

#### Workflows

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/workflows` | Liste des demandes |
| GET | `/api/workflows/{id}` | Détail demande |
| GET | `/api/workflows/pending` | Demandes en attente |
| GET | `/api/workflows/my-requests` | Mes demandes |
| POST | `/api/workflows` | Créer demande |
| POST | `/api/workflows/{id}/submit` | Soumettre |
| POST | `/api/workflows/{id}/approve` | Approuver |
| POST | `/api/workflows/{id}/reject` | Rejeter |
| POST | `/api/workflows/{id}/execute` | Exécuter |

#### Utilisateurs (Admin)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users` | Liste utilisateurs |
| GET | `/api/users/{id}` | Détail utilisateur |
| POST | `/api/users` | Créer utilisateur |
| PUT | `/api/users/{id}` | Modifier |
| POST | `/api/users/{id}/reset-password` | Reset password |
| POST | `/api/users/{id}/deactivate` | Désactiver |
| POST | `/api/users/{id}/activate` | Activer |

#### KPIs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/kpis` | Tous les KPIs |

### Configuration Backend

#### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/archives_bancaires
    username: ${DB_USERNAME:archives_user}
    password: ${DB_PASSWORD:archives_password}
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  
  flyway:
    enabled: true
    baseline-on-migrate: true

jwt:
  secret: ${JWT_SECRET:your-secret-key-min-256-bits}
  expiration: 86400000 # 24h
  refresh-expiration: 604800000 # 7 jours

server:
  port: 8080
  servlet:
    context-path: /api
```

### Commandes Maven

```bash
# Compiler
mvn clean compile

# Package
mvn clean package

# Run
mvn spring-boot:run

# Tests
mvn test
```

### Docker

```bash
# Build
docker build -t archives-backend .

# Run
docker run -p 8080:8080 \
  -e DB_USERNAME=archives_user \
  -e DB_PASSWORD=archives_password \
  -e JWT_SECRET=your-secret-key \
  archives-backend
```

---

## Contact et support

Pour toute question technique sur ce projet, référez-vous à cette documentation et au code source commenté.

**Dernière mise à jour:** Janvier 2024
**Version:** 1.0.0
