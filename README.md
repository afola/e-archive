# Projet AFOLA e-ARCHIVE

Système d'archivage bancaire — gestion du cycle de vie documentaire (capture, indexation, classification, archivage, workflows, recherche).

## Stack technique

### Core
- **Next.js 16** — App Router
- **TypeScript 5**
- **Tailwind CSS 4**

### UI
- **shadcn/ui** (Radix UI)
- **Lucide React**
- **Framer Motion**
- **Next Themes**

### Formulaires & Validation
- **React Hook Form**
- **Zod**

### État & Données
- **Zustand**
- **TanStack Query**
- **TanStack Table**

### Backend & Données
- **Prisma** (ORM)
- **NextAuth.js**
- **Backend Java/Spring** (`backend/`)

### Fonctionnalités avancées
- **DND Kit** — drag and drop
- **Recharts** — visualisation de données
- **Sharp** — traitement d'image
- **pdf-lib / pdf-parse / jspdf** — génération et lecture de PDF
- **Next Intl** — internationalisation

## Démarrage

```bash
# Installer les dépendances
bun install

# Lancer le serveur de développement
bun run dev

# Build pour la production
bun run build

# Démarrer en production
bun start
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure du projet

```
src/
├── app/                 # Pages Next.js (App Router)
├── components/          # Composants React réutilisables
│   └── ui/              # Composants shadcn/ui
├── hooks/               # Hooks React personnalisés
└── lib/                 # Fonctions utilitaires et configuration
backend/                 # Backend Java/Spring
prisma/                  # Schéma et migrations de base de données
```

## Fonctionnalités principales

- Dashboard avec KPIs et graphiques
- Gestion des archives (CRUD complet)
- Upload et traitement de documents (OCR, PDF)
- Recherche avancée avec filtres
- Workflows avec vue Kanban
- Gestion des utilisateurs et des rôles
- Journalisation des audits
- Authentification (NextAuth.js)
- Mode sombre / clair

---

Projet AFOLA e-ARCHIVE
