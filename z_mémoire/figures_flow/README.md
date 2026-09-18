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
- **Entités hors-scope** : `EVENEMENT_AUDIT`, `PERMISSION_ENTITE` exclus du MCD (voir `plans/audit/20260819_hors_scope_mcd.md`)

### Correspondance MCD ↔ code

Les entités du MCD mappent vers les tables MySQL du MPD. Les noms sont **anglicisés** dans le passage MCD → MPD.

| Entité MCD | Table BD | Domaine |
|------------|----------|---------|
| `UTILISATEUR` | `users` | Utilisateurs & droits |
| `GROUPE_METIER` | `business_groups` | Utilisateurs & droits |
| `PERMISSION_GROUPE` | `group_permissions` | Utilisateurs & droits |
| `NOTIFICATION` | `notifications` | Utilisateurs & droits |
| `CAMPAGNE` | `campaigns` | Campagnes & pipeline |
| `MODELE_PIPELINE` | `pipeline_templates` | Campagnes & pipeline |
| `ETAPE_PIPELINE` | `pipeline_stages` | Campagnes & pipeline |
| `FORMULAIRE` | `forms` | Campagnes & pipeline |
| `VERSION_FORMULAIRE` | `form_versions` | Campagnes & pipeline |
| `QUESTION` | `questions` | Campagnes & pipeline |
| `REPONSE` | `answers` | Campagnes & pipeline |
| `CANDIDATURE` | `applications` | Candidatures & suivi |
| `AVANCEMENT` | `application_progress` | Candidatures & suivi |
| `TOKEN_CANDIDAT` | `candidate_tokens` | Candidatures & suivi |
| `TOKEN_VERIFICATION_EMAIL` | `email_verification_tokens` | Candidatures & suivi |
| `DEMANDE_CANDIDAT` | `candidate_requests` | Candidatures & suivi |
| `DECISION` | `decisions` | Candidatures & suivi |
| `ENTRETIEN` | `interviews` | Entretiens & évaluation |
| `CANDIDAT_ENTRETIEN` | `interview_candidates` | Entretiens & évaluation |
| `EVALUATEUR_ENTRETIEN` | `interview_participants` | Entretiens & évaluation |
| `EVALUATION` | `evaluations` | Entretiens & évaluation |
| `NOTE_CRITERE` | `evaluation_items` | Entretiens & évaluation |
| `GRILLE_MODELE` | `evaluation_grids` | Entretiens & évaluation |
| `MODELE_EMAIL` | `email_templates` | Communication |
| `PRESET_MODELE_EMAIL` | `email_template_presets` | Communication |
| `JOURNAL_EMAIL` | `email_logs` | Communication |
| `CONFIGURATION` | `configurations` | Config système |
| `CONFIGURATION_SMTP` | `smtp_configurations` | Config système |
| `TEXTE_JURIDIQUE` | `legal_texts` | Config système |

## Contenu

### Diagrammes Merise — Nouveau (18)

6 domaines × 3 niveaux (MCD/MLD/MPD) = 18 diagrammes dans `src/diagrams/nouveau/` :

| # | Type | Domaine | Nb entités |
|---|------|---------|-----------|
| 1 | MCD | Utilisateurs & droits | 5 |
| 2 | MCD | Campagnes & pipeline | 8 |
| 3 | MCD | Candidatures & suivi | 6 |
| 4 | MCD | Entretiens & évaluation | 6 |
| 5 | MCD | Communication | 3 |
| 6 | MCD | Config système | 3 |
| 7–12 | MLD | (mêmes domaines) | — |
| 13–18 | MPD | (mêmes domaines) | — |

### Diagrammes archivés (30)

Les anciens diagrammes (MCD/MLD/MPD v1, traitements v1, MOT v1) sont conservés dans `src/diagrams/archive/` avec `// @ts-nocheck` et `category: 'archive'`.

### Diagrammes de traitements v2 (7)

Disponibles dans `src/diagrams/traitements/v2/` :

| # | Type | Traitement | Description |
|---|------|-----------|-------------|
| 1 | MCT | T0 | Création de campagne |
| 2 | MCT | T1 | Soumission candidature |
| 3 | MCT | T2 | Passage du quiz |
| 4 | MCT | T3 | Entretien & évaluation |
| 5 | MCT | T4 | Décision |
| 6 | MCT | T5 | Rollback |
| 7 | MCT | T6 | Audit |

> **Note** : `plans/mct/nouveaux_mct.md` est la **source de vérité** pour les MCT :
> conventions Merise corrigées + parcours en 9 traitements (T0–T8). Les MCT v2
> actuels couvrent T0–T6. La version cible détaille T0–T8 (planification /
> conduite / évaluation séparés). **Le code n'est pas encore aligné sur le plan.**

### Diagrammes supplémentaires

| Type | Fichier | Description |
|------|---------|-------------|
| Palette | `src/diagrams/palette/` | Couleurs et styles des entités |
| MOT v2 | `src/diagrams/mot/` | Matrice acteurs × traitements |

**Légende** :
- **MCT** (Modèle Conceptuel de Traitement) : diagrammes événement/opération/résultat décrivant les flux métier
- **MPT** (Modèle Physique de Traitement) : diagrammes en couches montrant l'empilement technique
- **MOT** (Modèle Organisationnel de Traitement) : matrice acteurs × traitements

### Entités hors-scope du MCD

Certaines tables présentes en BD ne figurent pas dans le MCD. Voir `plans/audit/20260819_hors_scope_mcd.md` pour la justification détaillée.

| Entité/Attribut | Raison |
|-----------------|--------|
| `EVENEMENT_AUDIT` | Audit = détail d'implémentation, `id_entite` polymorphique |
| `PERMISSION_ENTITE` | `id_entite` polymorphique, doublon avec PERMISSION_UTILISATEUR |
| `PERMISSION_UTILISATEUR` | Permissions individuelles = détail d'implémentation |
| `DEMANDE_CHANGEMENT_GROUPE` | Workflow d'approbation = détail d'implémentation |
| `NOTIFICATION.utilisateur` | FK interdite en MCD (portée par l'association) |
| `TOKEN_VERIFICATION_EMAIL.email` | Redondant avec CANDIDATURE.email |

## MOT : versions

| Version | Fichier | Statut |
|---------|---------|--------|
| MOT v1 | `src/diagrams/archive/` | Supprimé (archivé) |
| **MOT v2** | `src/diagrams/mot/mot_organisationnel_v2.ts` | **Version courante** — matrice acteurs × traitements basée sur les MCT v1 |
| MOT v3 | — | **À créer** — nouveau MOT basé sur les MCT v2 |

> **Action à faire** : créer le MOT v3 à partir des MCT v2 (`src/diagrams/traitements/v2/`).

## Types

```typescript
Category = 'mcd' | 'mld' | 'mpd' | 'traitements' | 'archive' | 'palette' | 'mot'

ProcessVariant = 'mct-event' | 'mct-sync' | 'mct-operation' | 'mct-result'
               | 'sat-task' | 'sat-phase' | 'sat-head' | 'sat-lane'
               | 'mpt-layer'

Variant = 'mcd' | 'mld' | 'mpd' | ProcessVariant

Attribute = { name, isPK?, description? }

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
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   └── index.ts          # Category, DiagramDefinition, EntityNodeData, etc.
│   ├── diagrams/
│   │   ├── index.ts          # Registre de tous les diagrammes
│   │   ├── nouveau/          # Nouveaux diagrammes MCD/MLD/MPD (6 domaines)
│   │   │   ├── mcd/          # 6 fichiers MCD
│   │   │   ├── mld/          # 6 fichiers MLD
│   │   │   └── mpd/          # 6 fichiers MPD
│   │   ├── archive/          # Anciens diagrammes (30 fichiers, @ts-nocheck)
│   │   ├── traitements/      # MCT/SAT/MPT v1 (archivés) et v2 (actifs)
│   │   │   └── v2/           # 7 fichiers MCT (T0–T6)
│   │   ├── mot/              # MOT v2 (matrice acteurs × traitements)
│   │   └── palette/          # Diagramme de couleurs
│   ├── components/
│   │   ├── Nodes/
│   │   │   ├── EntityNode.tsx
│   │   │   └── ProcessNode.tsx
│   │   ├── Edges/
│   │   │   ├── RelationshipEdge.tsx
│   │   │   ├── TraitementEdge.tsx
│   │   │   └── edgeAnchors.ts    # Helpers : ancrage résolu des arêtes
│   │   ├── Sidebar.tsx
│   │   ├── Toolbar.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── FontSelector.tsx
│   │   ├── FullscreenOverlay.tsx
│   │   └── DiagramCanvas.tsx
│   ├── hooks/
│   │   ├── useDiagramPersistence.ts
│   │   ├── useDiagramState.ts
│   │   ├── useFontPreference.ts
│   │   └── useSidebarState.ts
│   └── utils/
│       ├── autoLayout.ts
│       ├── edgeDebug.ts         # Store overlay debug edges (figures_flow:debug_edges)
│       ├── entityColors.ts
│       └── exportSvg.ts
├── plans/
│   ├── audit/               # Audits et documentations
│   ├── implementations/     # Plans d'implémentation (YYYYMMDD_<sujet>.md)
│   ├── mct/                 # Plans MCT
│   ├── mot/                 # Plans MOT
│   └── rules/               # Règles Merise
├── index.html
└── README.md
```

## Démarrer

```bash
cd z_mémoire/figures_flow
npm install
npm run dev
```

Ouvrir l'URL affichée (généralement `http://localhost:5173`).

## Fonctionnalités

- Navigation entre les diagrammes via une sidebar (Merise + Traitements + Archive)
- Drag & drop des entités (positions persistées dans localStorage)
- Zoom avant/arrière, fit to view
- Grille d'aimantation (10px)
- Export SVG du diagramme courant
- Mode clair / sombre
- **Debug edges** : bouton flottant haut-droite → overlay de debug des arêtes
  (ancrage déclaré→résolu, taille de groupe, offset en px), persisté dans
  `localStorage['figures_flow:debug_edges']` (défaut off). Utile pour diagnostiquer
  le spacing/offset des arêtes partageant un même point d'ancrage.
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

## Couleurs : rotation SAFE_HUES

Chaque diagramme reçoit ses couleurs via `applyEntityColors()` (`src/utils/entityColors.ts`), appelé dans `DiagramCanvas.tsx` avant le rendu. Deux régimes coexistent.

### Entités (MCD / MLD / MPD) — rotation

La palette de référence est la constante `SAFE_HUES` (`src/utils/entityColors.ts`) :

```ts
const SAFE_HUES = [15, 225, 330, 285, 0, 240, 345, 300, 210, 315, 15, 270, 30, 255, 335, 275]
```

La couleur est attribuée par **rotation** selon la **position du nœud dans le tableau `nodes`** du diagramme :

```ts
const hue = SAFE_HUES[i % SAFE_HUES.length]   // i = index du nœud dans diagram.nodes
```

- Le hue n'est pas une propriété de l'entité : **réordonner les `nodes` change les couleurs de tout le diagramme**.
- Si le `label` du nœud commence par `hsl(`, ce hue est extrait et utilisé à la place de la rotation (cas des swatches de la palette).
- Le résultat final est `hsl(hue, 100%, 40%)`, consommé par `EntityNode.tsx` (bordure, header, badges via déclinaisons `hsla`).

### Process (MCT / SAT / MPT) — pas de rotation

Les variantes de traitements utilisent des **couleurs fixes** par variante, définies dans `PROCESS_HUES` (`src/utils/entityColors.ts`) : événement = 270, sync/syncop = 330, opération = 166, résultat = 128 (OK) / 0 (échec), puis des mappings par `meta`/`layer`/`badge` pour `sat-*` et `mpt-layer`. Le MOT (variante `mot-matrix`) n'étant pas dans `PROCESS_VARIANTS`, il passe par la rotation `SAFE_HUES`.

### Note — copies divergentes

Le diagramme « Palette de couleurs » (`src/diagrams/palette/color_palette.ts`) embarque sa **propre copie allongée** de `SAFE_HUES` (19 valeurs, ajoutant `128`, `166`, `100`). `entityColors.ts` reste la source de vérité ; la copie du fichier palette est une divergence à connaître.
