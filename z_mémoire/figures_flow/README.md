# figures_flow

Réécriture des diagrammes Merise/UML du mémoire avec React Flow.

## Objectif

Remplacer le système actuel `z_mémoire/figures_html/` (trop bugué) par une SPA moderne basée sur React Flow. Le projet est **indépendant** — pas de lien avec le front Angular du projet principal.

### Ce qui est repris de l'ancien système

- Les **noms d'entités/tables** (ex: `UTILISATEUR`, `CANDIDATURE`)
- Les **attributs/champs** (ex: `IdUtilisateur`, `Nom`, `Email`)
- Les **types SQL** pour les MPD
- Les **liens et cardinalités** entre entités

### Ce qui est réécrit de zéro

- **Tout le code** — aucune copie des fichiers HTML, CSS ou JS existants
- La logique de rendu (React Flow remplace le SVG custom + jQuery-like)
- L'éditeur (drag & drop React Flow natif au lieu du système `links.js`)
- Le style (Tailwind CSS, design carte moderne, light/dark mode)

## Projet modélisé (QuizApp)

Les diagrammes modélisent un **système de recrutement via quiz** développé par Synelia. Le projet complet est dans `quizapp_full/` avec deux sous-projets :

### Backend — `quizapp/`

| Élément | Détail |
|---------|--------|
| Stack | Java 21, Spring Boot 3.5, WAR |
| Package | `tech.synelia.quizapp` |
| BDD | MySQL (via JPA/Hibernate) |
| Code-gen | Telosys (`TelosysTools/templates/`) |
| API | REST (`POST /entity/action`, format `{user, datas[]}`) |
| Uploads | CV stockés dans `uploads/cv/` |

Le backend expose des endpoints CRUD pour chaque entité métier : `user`, `applications`, `campaigns`, `pipeline_template`, `pipeline_stage`, `application_progress`, `interviews`, `evaluations`, `decisions`, etc.

### Frontend — `quizapp_front/`

| Élément | Détail |
|---------|--------|
| Stack | Angular 20, TypeScript, SCSS |
| Style | BEM, variables CSS `:root`, pas de couleurs hardcodées |
| Routes | `src/app/app.routes.ts` — pages publiques + dashboard |
| Pages | Home, Connexion, Inscription, Quiz public, Candidatures, Dashboard (campaigns, candidates, interviews, evaluations, decisions, forms, users, settings…) |

La cartographie fonctionnelle route-first est documentée dans `cartographie-fonctionnelle-front/` (fiches page par page).

### Base de données cible

La BD modélisée dans les diagrammes correspond au **schéma cible post-migration 420** (pipeline multi-occurrences) :

- **Document de référence** : `cartographie-fonctionnelle-front/bd_actuelle/quizapp_db_cible_post_420_migration.md`
- **Principe clé** : `applications` devient une table de **synthèse et pointeurs courants** ; le runtime de chaque round vit dans `application_progress`
- **Suppression des colonnes legacy** : `quiz_score`, `application_status`, `interview_status`, etc. supprimés de `applications` — tout est déplacé dans les tables spécialisées (`application_progress`, `application_quiz_attempt`, `interviews`, `evaluations`, `decisions`)
- **Renommage** : `interview_evaluations_link` → `evaluation_room_code`

### Correspondance MCD ↔ code

Les entités du MCD mappent directement vers les tables MySQL du MPD :

| Entité MCD | Table MPD | Domaine |
|------------|-----------|---------|
| `candidature` | `applications` | Candidature & Quiz |
| `avancement` | `application_progress` | Candidature & Quiz |
| `tentative_quiz` | `application_quiz_attempt` | Candidature & Quiz |
| `reponse_candidat` | `candidate_answer` | Candidature & Quiz |
| `utilisateur` | `user` | Identité & Permissions |
| `campagne` | `campaigns` | Campagnes & Pipeline |
| `etape_pipeline` | `pipeline_stage` | Campagnes & Pipeline |
| `entretien` | `interviews` | Entretien & Évaluation |
| `evaluation` | `evaluations` | Entretien & Évaluation |
| `decision` | `decisions` | Candidature & Quiz |

Les noms sont **anglicisés** dans le passage MCD → MPD (ex: `candidature` → `applications`, `etape_pipeline` → `pipeline_stage`).

## Contenu

28 diagrammes au total — 16 Merise (MCD/MLD/MPD) + 12 diagrammes de traitements (MCT/SAT/MPT) :

### Diagrammes Merise (16)

| # | Type | Domaine | Nb entités |
|---|------|---------|-----------|
| 1 | MCD | Identité & Permissions | 3 |
| 2 | MCD | Identité & Permissions (moderne) | 3 |
| 3 | MCD | Campagnes & Pipeline | 9 |
| 4 | MCD | Candidature & Quiz | 6 |
| 5 | MCD | Entretien & Évaluation | 7 |
| 6 | MCD | Audit & Notifications | 3 |
| 7 | MLD | Identité & Permissions | 6 |
| 8 | MLD | Campagnes & Pipeline | 11 |
| 9 | MLD | Candidature & Quiz | 6 |
| 10 | MLD | Entretien & Évaluation | 7 |
| 11 | MLD | Audit & Notifications | 3 |
| 12 | MPD | Identité & Permissions | 6 |
| 13 | MPD | Campagnes & Pipeline | 11 |
| 14 | MPD | Candidature & Quiz | 6 |
| 15 | MPD | Entretien & Évaluation | 7 |
| 16 | MPD | Audit & Notifications | 3 |

### Diagrammes de traitements (12)

| # | Type | Domaine | Description |
|---|------|---------|-------------|
| 17 | MCT | Candidature & Quiz (T1+T2) | Soumission candidature + passage quiz |
| 18 | MCT | Candidature (détail T1) | Focus soumission candidature |
| 19 | MCT | Quiz (détail T2) | Focus passage du quiz |
| 20 | MCT | Entretien & Évaluation (T3) | Planification entretien + évaluation |
| 21 | MCT | Décision & Audit (T4) | Prise de décision + audit |
| 22 | MCT | Décision (détail T4a) | Focus logique de décision |
| 23 | MCT | Rollback (détail T4b) | Focus annulation/rollback |
| 24 | MCT | Audit (détail T4c) | Focus traçabilité audit |
| 25 | SAT | Setup & Préselection (S1) | Configuration pipeline + screening |
| 26 | SAT | Entretien & Audit (S2) | Sous-traitance entretien/évaluation |
| 27 | MPT | Candidature & Quiz (couche) | Vue en couches candidature/quiz |
| 28 | MPT | Entretien & Décision (couche) | Vue en couches entretien/décision |

**Légende** :
- **MCT** (Modèle Conceptuel de Traitement) : diagrammes événement/opération/ résultat décrivant les flux métier
- **SAT** (Sous-traitance) : diagrammes de décomposition des sous-traites
- **MPT** (Modèle Physique de Traitement) : diagrammes en couches montrant l'empilement technique

## Types

```typescript
Category = 'mcd' | 'mld' | 'mpd' | 'traitements' | 'reference'

ProcessVariant = 'mct-event' | 'mct-sync' | 'mct-operation' | 'mct-result'
               | 'sat-task' | 'sat-phase' | 'sat-head' | 'sat-lane'
               | 'mpt-layer'

Variant = 'mcd' | 'mld' | 'mpd' | ProcessVariant

Attribute = { name, type?, isPK?, isFK?, isNew?, isDeleted?, description? }

EntityNodeData = { label, variant, attributes?, color?, badge?, items?, meta?,
                   detail?, expression?, fail?, layer?, dimensions? }

RelationshipEdgeData = { label?, cardFrom?, cardTo?, isStrong?, isDashed?,
                         diagramId? }

DiagramDefinition = { id, title, category, domain, nodes[], edges[] }
```

## Stack

| Technologie | Usage |
|------------|-------|
| **React 19+** | Framework UI |
| **TypeScript** | Typage |
| **Vite** | Build / dev server |
| **@xyflow/react** | React Flow — rendu nœuds/liens |
| **Tailwind CSS v4** | Styles utilitaires |
| **lucide-react** | Icônes |
| **clsx** | Classes conditionnelles |
| **zustand** | State management (via React Flow) |
| **localStorage** | Persistance des positions |

Pas de Docker, pas de backend. `npm run dev` suffit.

## Architecture

```
figures_flow/
├── src/
│   ├── main.tsx              # Point d'entrée
│   ├── App.tsx               # Layout principal (sidebar + canvas)
│   ├── types/
│   │   └── index.ts          # Types EntityNode, Attribute, RelationshipEdge, DiagramDefinition
│   ├── diagrams/
│   │   ├── index.ts          # Registre de tous les diagrammes
│   │   ├── mcd/              # 5 fichiers MCD (identite, campagnes, candidature, entretien, audit)
│   │   ├── mld/              # 5 fichiers MLD
│   │   ├── mpd/              # 5 fichiers MPD
│   │   └── traitements/      # 12 fichiers MCT/SAT/MPT
│   ├── components/
│   │   ├── Nodes/
│   │   │   ├── EntityNode.tsx       # Nœud entité/table (variantes mcd|mld|mpd)
│   │   │   └── ProcessNode.tsx      # Nœud de traitement (mct-event, mct-operation, etc.)
│   │   ├── Edges/
│   │   │   ├── RelationshipEdge.tsx  # Arête avec cardinalités et label
│   │   │   └── TraitementEdge.tsx    # Arête pour diagrammes de traitements
│   │   ├── Sidebar.tsx              # Navigation par catégorie
│   │   ├── Toolbar.tsx              # Zoom, grille, export, thème
│   │   ├── ThemeToggle.tsx          # Bascule light/dark
│   │   ├── FontSelector.tsx         # Choix de la police
│   │   ├── FullscreenOverlay.tsx    # Mode plein écran
│   │   └── DiagramCanvas.tsx        # Wrapper React Flow
│   ├── hooks/
│   │   ├── useDiagramPersistence.ts # localStorage save/restore
│   │   ├── useDiagramState.ts       # État courant du diagramme
│   │   ├── useFontPreference.ts     # Police persistée
│   │   └── useSidebarState.ts       # État sidebar (ouvert/fermé)
│   └── utils/
│       ├── autoLayout.ts            # Placement initial des nœuds
│       ├── entityColors.ts          # Palette de couleurs par entité
│       └── exportSvg.ts             # Export SVG standalone
├── index.html
├── PLAN.md                 # Plan de travail détaillé
└── README.md               # Ce fichier
```

## Démarrer

```bash
cd z_mémoire/figures_flow
npm install
npm run dev
```

Ouvrir l'URL affichée (généralement `http://localhost:5173`).

## Fonctionnalités prévues

- Navigation entre les 28 diagrammes via une sidebar (Merise + Traitements)
- Drag & drop des entités (positions persistées dans localStorage)
- Zoom avant/arrière, fit to view
- Grille d'aimantation (10px)
- Export SVG du diagramme courant
- Mode clair / sombre
- Layout initial automatique (évite les chevauchements)
- Sélection de police (NT Dapper, system-ui)
- Mode plein écran pour chaque diagramme

## Design

- Chaque nœud est une carte arrondie (rounded-xl) avec header coloré
- Styles adaptés à chaque variante (MCD / MLD / MPD / traitements)
- Liens lissés avec cardinalités dans des capsules aux extrémités
- Labels de relation (verb) au centre des liens en MCD
- Palette sobre : pas de classifications "nouvelle entité" ou "pivot" — uniquement des couleurs par entité pour la lisibilité
- **Nœuds de traitements** : variantes `mct-event` (losange), `mct-sync` (parallelogramme), `mct-operation` (rectangle), `mct-result` (rectangle vert/rouge), `sat-*`, `mpt-layer` — chaque variante a un style distinct

## Principe Merise

Les trois niveaux de modélisation respectés :

- **MCD** (Modèle Conceptuel) : entités, associations, cardinalités, PK soulignée
- **MLD** (Modèle Logique) : tables, PK, FK (#), tables de jonction
- **MPD** (Modèle Physique) : tables avec types SQL, contraintes PK/FK/NN

Diagrammes de traitements :

- **MCT** (Modèle Conceptuel de Traitement) : événements (losange), synchronisations (parallelogramme), opérations (rectangle), résultats (rectangle vert/rouge). Décrivent les flux métier par traitement (T1=Soumettre candidature, T2=Passer quiz, T3=Entretien/évaluation, T4=Décision/audit)
- **SAT** (Sous-traitance) : décomposition des sous-traites en phases/tâches
- **MPT** (Modèle Physique de Traitement) : vue en couches montrant l'empilement technique (front, API, BDD)
