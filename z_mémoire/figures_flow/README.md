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

### Correspondance MCD ↔ MPD

Les entités du MCD mappent vers les tables MySQL du MPD. Les noms sont **anglicisés** dans le passage MCD → MPD. Les 21 tables **figurées** sont marquées ✅ ; les 13 autres restent modélisées au MCD/MLD mais ne sont pas dessinées au MPD (périmètre de lecture, voir `plans/implementations/20260928_passage_mld_mpd.md`).

| Entité MCD | Table MPD | Statut | Domaine |
|------------|------------|--------|---------|
| `CAMPAGNE` | `campaigns` | ✅ | Campagnes & pipeline |
| `MODELE_PIPELINE` | `pipeline_template` | ✅ | Campagnes & pipeline |
| `ETAPE_PIPELINE` | `pipeline_stage` | ✅ | Campagnes & pipeline |
| — (association `proposer`) | `campaign_form` | ✅ | Campagnes & pipeline |
| `FORMULAIRE` | `form` | ✅ | Campagnes & pipeline |
| `VERSION_FORMULAIRE` | `form_version` | ✅ | Campagnes & pipeline |
| — (association `contenir`) | `form_questions` | ✅ | Campagnes & pipeline |
| `QUESTION` | `question` | ✅ | Campagnes & pipeline |
| `REPONSE` | `answer` | ✅ | Campagnes & pipeline |
| `CANDIDATURE` | `applications` | ✅ | Candidatures & suivi |
| `AVANCEMENT` | `application_progress` | ✅ | Candidatures & suivi |
| `DECISION` | `decisions` | ✅ | Candidatures & suivi |
| `ENTRETIEN` | `interviews` | ✅ | Entretiens & évaluation |
| `CONVOCATION` | `convocation` | ✅ ⚠ | Entretiens & évaluation |
| `EVALUATEUR_ENTRETIEN` | `interview_evaluator` | ✅ ⚠ | Entretiens & évaluation |
| `EVALUATION` | `evaluations` | ✅ | Entretiens & évaluation |
| `NOTE_CRITERE` | `evaluation_item` | ✅ | Entretiens & évaluation |
| `GRILLE_MODELE` | `evaluation_grid_template` | ✅ | Entretiens & évaluation |
| `VERSION_GRILLE` | `evaluation_grid_template_version` | ✅ | Entretiens & évaluation |
| `CRITERE` | `evaluation_grid_criterion` | ✅ ⚠ | Entretiens & évaluation |
| `UTILISATEUR` | `user` | ✅ | Utilisateurs & droits |
| `GROUPE_METIER` | `business_groups` | — | Utilisateurs & droits |
| `PERMISSION_GROUPE` | `group_permissions` | — | Utilisateurs & droits |
| `NOTIFICATION` | `notifications` | — | Utilisateurs & droits |
| `ENTREPRISE` | `companies` | — | Structure & configuration |
| `DEPARTEMENT` | `departments` | — | Structure & configuration |
| `SPECIALITE` | `specialities` | — | Structure & configuration |
| `CONFIGURATION` | `app_configs` | — | Structure & configuration |
| `MODELE_EMAIL` | `email_templates` | — | Structure & configuration |
| `TOKEN_SOURCE` | `source_token` | — | Candidatures & suivi |
| `TOKEN_VERIFICATION_EMAIL` | `email_verification_tokens` | — | Candidatures & suivi |
| `DEMANDE_CANDIDAT` | `candidate_requests` | — | Candidatures & suivi |
| `PRESET_MODELE_EMAIL` | `email_template_presets` | — | Communication |
| `JOURNAL_EMAIL` | `email_logs` | — | Communication |
| `CONFIGURATION` | `configurations` | — | Config système |
| `CONFIGURATION_SMTP` | `smtp_configurations` | — | Config système |
| `TEXTE_JURIDIQUE` | `legal_texts` | — | Config système |

> **3 arbitrages** (⚠) : le nom physique retenu s'écarte de la table existante en base, parce que
> le nom physique **décrivait mal l'entité**. La base cible reste la `bd_cible` post-420 :
> `CONVOCATION` n'est pas une candidature, `EVALUATEUR_ENTRETIEN` n'est pas un simple participant,
> `CRITERE` est un critère de grille (pas un élément de modèle de grille).
> Voir `plans/rules/regles_mpd.md` § Table de correspondance.
>
> **Attention** : `CONFIGURATION` apparaît 2 fois (`app_configs` et `configurations`) — doublon
> de la cartographie fonctionnelle, à arbitrer.

## Contenu

### Diagrammes Merise — Nouveau (14)

14 diagrammes dans `src/diagrams/nouveau/`, répartis sur 6 familles :

| # | Type | Domaine | Fichier | Nb tables |
|---|------|---------|---------|-----------|
| 1 | MCD | Utilisateurs & droits | `utilisateurs_droits.ts` | 5 |
| 2 | MCD | Campagnes & pipeline | `campagnes_pipeline.ts` | 8 |
| 3 | MCD | Candidatures & suivi | `candidatures_suivi.ts` | 6 |
| 4 | MCD | Entretiens & évaluation | `entretiens_evaluation.ts` | 6 |
| 5 | MCD | Structure & configuration | `structure_configuration.ts` | 5 |
| 6 | MLD | Utilisateurs & droits | `utilisateurs_droits.ts` | — |
| 7 | MLD | Campagnes & pipeline | `campagnes_pipeline.ts` | — |
| 8 | MLD | Candidatures & suivi | `candidatures_suivi.ts` | — |
| 9 | MLD | Entretiens & évaluation | `entretiens_evaluation.ts` | — |
| 10 | MLD | Structure & configuration | `structure_configuration.ts` | — |
| 11 | MPD (tables) | Campagnes & candidatures | `campagnes_candidatures.ts` | 12 |
| 12 | MPD (tables) | Entretiens & utilisateurs | `entretiens_utilisateurs.ts` | 9 |
| 13 | MPD (script SQL) | Campagnes & candidatures | `mpd_sql/script_campagnes.ts` | 12 |
| 14 | MPD (script SQL) | Entretiens & utilisateurs | `mpd_sql/script_entretiens.ts` | 9 |

> Les domaines **Communication** et **Config système** sont modélisés au MCD dans
> `cartographie-fonctionnelle-front/` mais n'ont pas encore de fichier dans `nouveau/`.

> **Le MPD est un extrait de lecture, pas un inventaire** : les 2 figures de tables couvrent
> **21 tables sur les 34 relations du MLD** (162 colonnes, 22 arêtes), choisies pour couvrir la
> chaîne de recrutement de bout en bout. Les 13 relations non figurées restent modélisées au MCD
> et au MLD — voir `plans/rules/regles_mpd.md` et
> `plans/implementations/20260928_passage_mld_mpd.md`.
>
> **Chaque figure MPD existe en deux vues générées depuis une source unique**
> (`src/diagrams/nouveau/mpd/schema.ts`) : la vue « tables » ci-dessus et la vue « script SQL »
> (`mpd_sql/`) qui rend un `CREATE TABLE` complet par bloc — types, PK/FK, politiques `ON
> DELETE`, unicités, index, colonnes techniques et moteur/charset (règles 2, 3, 4, 5, 6, 7, 8 et
> 10 de `plans/rules/regles_mpd.md`). Les deux vues ne peuvent pas diverger.

### Diagrammes de traitements — figures de parcours (4)

Le cycle de vie du MCT est rendu par **4 figures de parcours**, et non par une figure unique :
assemblées côte à côte, elles tombaient à un zoom `fitView` d'environ 0.16, illisible. Le
découpage est fonctionnel, pas décoratif.

Disponibles dans `src/diagrams/traitements/v2/mct_combine.ts` :

| # | Figure | Traitements | Contenu |
|---|--------|-------------|---------|
| 1 | `mct-v2-parcours-1` | T0, T1, T2 | Amont : de la campagne au quiz |
| 2 | `mct-v2-parcours-2` | T3, T4, T5 | Cycle d'entretien : planification, conduite, évaluation |
| 3 | `mct-v2-parcours-3` | T6, T7 | Décision et annulation |
| 4 | `mct-v2-parcours-4` | T8 | Audit seul — transverse, sans lien entrant ni sortant |

`mct_combine.ts` est une fabrique `buildCombine({ id, title, domain, entries, crossLinks })` : elle
préfixe les nœuds par traitement (`t0-`, `t1-`…), réindexe les rangées à partir de 0, et pose les
arêtes croisées entre traitements. Chaque figure expose `sections`, qui active l'encadrement et le
verrou de glissement groupé.

Un **résultat de T*n* déclenche la synchronisation de T*n+1***, pas son événement : la couture entre
traitements arrive en `targetHandle: 'top'` sur le nœud `mct-syncop`. Un lien ne peut pas traverser
deux figures, donc **deux coutures ne sont pas représentées** (T2→T3 et T5→T6) : `buildCombine` les
retire et les signale via `console.error`. La continuité entre figures est portée par les titres
« 1/4 » … « 4/4 ».

### Les 9 traitements individuels

Les MCT ne sont plus des figures lisibles isolément : les 9 traitements vivent dans
`src/diagrams/archive/mct_[0-8]_*.ts` avec `category: 'archive'` et leurs ids `mct-v2-N-*` conservés.
Ils restent **la seule définition du modèle** que les figures de parcours assemblent — même
arrangement que le MOT v2, qui importe ses MCT depuis `archive/`.

| T | Fichier | Traitement | Événement propre |
|---|---------|-----------|------------------|
| T0 | `mct_0_creation_campagne.ts` | Créer la campagne | Besoin d'un nouveau recrutement |
| T1 | `mct_1_candidature.ts` | Candidature | Formulaire envoyé |
| T2 | `mct_2_quiz.ts` | Quiz | Quiz soumis par le candidat |
| T3 | `mct_3_planification.ts` | Planification de l'entretien | Candidat accepté pour l'évaluation |
| T4 | `mct_4_conduite_entretien.ts` | Conduire l'entretien | Date et heure de l'entretien atteintes |
| T5 | `mct_5_evaluation.ts` | Évaluation | Fiches d'évaluation renseignées |
| T6 | `mct_6_decision.ts` | Décision | *(aucun)* |
| T7 | `mct_7_annulation.ts` | Annulation | Demande d'annulation |
| T8 | `mct_8_audit.ts` | Audit | Toute opération métier réalisée |

> **Note** : `plans/mct/nouveaux_mct.md` est la **source de vérité** pour les MCT — conventions
> Merise corrigées + parcours en 9 traitements (T0–T8). **Le code est aligné sur le plan depuis le
> 2026-10-01** : T3 Planification et T4 Conduire l'entretien, absents du code, ont été créés, et les
> 4 autres renumérotés. Détail dans `plans/implementations/20261001_mct_t0_t8_alignment.md`.

### Diagrammes archivés (43)

| Famille | Nb | Remarque |
|---------|-----|----------|
| MCD / MLD / MPD v1 | 21 | anciens diagrammes relationnels (7 par niveau) |
| MCT v1 | 9 | anciens MCT, importés par le MOT v2 |
| MCT v2 (T0–T8) | 9 | définition du modèle, voir ci-dessus |
| SAT v1 | 2 | sous-traitance |
| MPT v1 | 2 | vue en couches techniques |

Tous dans `src/diagrams/archive/`, avec `// @ts-nocheck` et `category: 'archive'`.

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
Category = 'mcd' | 'mld' | 'mpd' | 'mpd-sql' | 'traitements' | 'archive' | 'palette' | 'mot'

ProcessVariant = 'mct-event' | 'mct-sync' | 'mct-syncop' | 'mct-operation' | 'mct-result'
               | 'sat-task' | 'sat-phase' | 'sat-head' | 'sat-lane'
               | 'mpt-layer' | 'mot-matrix'

Variant = 'mcd' | 'mld' | 'mpd' | 'mpd-sql' | ProcessVariant

Attribute = { name, type?, isPK?, isFK?, nullable?, description? }

EntityNodeData = { label, variant, attributes?, color?, badge?, items?, meta?,
                   detail?, expression?, fail?, layer?, dimensions?
                   /* MCT */ syncLabel?, emissionRules?, rule?
                   /* MOT */ motMatrix?
                   /* vue script MPD */ sql?, lineCount?, mcd?, auditNote?,
                   sqlLegend? }

RelationshipEdgeData = { label?, cardFrom?, cardTo?, isStrong?, isDashed?,
                         straight?, diagramId? }

DiagramDefinition = { id, title, category, domain, nodes[], edges[], sections? }
```

> `Attribute.nullable` existe déjà pour le MLD. Il est aussi utilisé au MPD, où il pilote la
> 3ᵉ colonne du bloc (`NOT NULL` / `NULL`) : les deux niveaux partagent le même rendu en grille
> 3 colonnes, seule la 2ᵉ colonne change (types Merise → types SQL).
>
> La variante `mpd-sql` est **déléguée** par `EntityNode` à `SqlScriptBlock` (aucun nouveau type
> de nœud React Flow) : `EntityNodeData` reste le type de données commun, et `loadPositions` /
> `applyEntityColors` / `autoLayout` n'ont pas à connaître la vue script.
>
> `sections?` n'existe que sur les figures qui contiennent **plusieurs traitements** — c'est-à-dire
> les 4 figures de parcours du MCT, construites par `mct_combine.ts`. Son absence désactive
> complètement l'encadrement et le verrou de glissement groupé.

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
│   │   ├── nouveau/          # Nouveaux diagrammes MCD/MLD/MPD
│   │   │   ├── mcd/          # 5 fichiers MCD
│   │   │   ├── mld/          # 5 fichiers MLD
│   │   │   ├── mpd/          # Source unique (schema.ts) + 2 figures en tables
│   │   │   └── mpd_sql/      # Vue « script » — 2 figures CREATE TABLE (layout + figures)
│   │   ├── archive/          # 43 fichiers (@ts-nocheck) — dont les 9 MCT v2 (T0–T8)
│   │   ├── traitements/
│   │   │   └── v2/           # mct_combine.ts — fabrique des 4 figures de parcours
│   │   ├── mot/              # MOT v2 (matrice acteurs × traitements)
│   │   └── palette/          # Diagramme de couleurs
│   ├── components/
│   │   ├── Nodes/
│   │   │   ├── EntityNode.tsx
│   │   │   ├── SqlScriptBlock.tsx  # Bloc CREATE TABLE (variante mpd-sql)
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
│       ├── exportSvg.ts         # exportSvg (figure) + exportNodeSvg (bloc isolé)
│       └── sqlTokens.ts         # Tokeniseur SQL maison (8 classes de jetons)
├── plans/
│   ├── audit/               # Audits et documentations
│   ├── implementations/     # Plans d'implémentation (YYYYMMDD_<sujet>.md)
│   ├── mct/                 # Plans MCT
│   ├── mpd/                 # Choix physiques hors figures (colonnes_techniques.sql)
│   ├── mot/                 # Plans MOT
│   └── rules/               # Règles Merise (MCD / MLD / MPD)
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
- Export SVG **par bloc** (figures script MPD : bouton `⤓` en tête de chaque `CREATE TABLE` ; le bouton lui-même est exclu du SVG exporté via `data-no-export`)
- Mode clair / sombre
- **Debug edges** : bouton `DEBUG` dans la barre d'outils → overlay de debug des arêtes
  (ancrage déclaré→résolu, taille de groupe, offset en px), persisté dans
  `localStorage['figures_flow:debug_edges']` (défaut off). Utile pour diagnostiquer
  le spacing/offset des arêtes partageant un même point d'ancrage.
- Layout initial automatique (évite les chevauchements)
- Sélection de police (NT Dapper, system-ui)
- Mode plein écran pour chaque diagramme
- **Polices auto-hébergées** (`src/assets/fonts/` + `@font-face` dans `index.css`) : indispensable
  aux exports SVG — `html-to-image` ne peut pas lire les feuilles remotes (Google Fonts/Fontshare :
  `SecurityError cssRules`) donc sans fichiers locaux les cartes exportées seraient rendues en police
  de fallback et la bordure-bas ne tombe pas (métriques ≠ live).
- **Export complet (figure ou bloc)** : raster positionné d'après la boîte de l'élément réellement
  rasterisé (invariant + contrat `[data-export-root]` pour les nœuds composites comme `mct-syncop`),
  bordure des cartes repeinte au raster (Plan C) — règles et approches écartées dans
  `plans/rules/regles_export_svg.md`.

## Design

- Chaque nœud est une carte arrondie (rounded-xl) avec header coloré
- Styles adaptés à chaque variante (MCD / MLD / MPD / traitements)
- Liens lissés avec cardinalités dans des capsules aux extrémités (MCD)
- **MPD** : même rendu en grille 3 colonnes que le MLD (`[PK|FK] nom | type SQL | NOT NULL/NULL`),
  badges `PK`/`FK`, `TABLE`/`JONCTION`, et des liens **sans cardinalité ni verbe** — un lien entre
  deux tables est un simple lien de référencement, la sémantique est portée par le badge `FK` et
  la colonne `type` (cf. `plans/rules/regles_mpd.md` § Notation graphique)
- **MPD — vue script** : chaque bloc est un `CREATE TABLE` complet, disposé en grille 2 colonnes
  (ordre d'exécution du script), coloré par un tokeniseur SQL maison sans dépendance, avec une
  légende et un export SVG individuel. Sa surface (`sql-block`) est indépendante du thème
  clair/sombre pour un export mémoire reproductible
- Labels de relation (verb) au centre des liens en MCD
- Palette sobre : pas de classifications "nouvelle entité" ou "pivot" — uniquement des couleurs par entité pour la lisibilité
- **Nœuds de traitements** : variantes `mct-event` (losange), `mct-sync` (**pentagone**), `mct-syncop` (pentagone + rectangle d'opération fusionnés), `mct-operation` (rectangle), `mct-result` (rectangle vert/rouge), `sat-*`, `mpt-layer` — chaque variante a un style distinct. Le pentagone est un `clip-path` `polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)`, posé en ligne dans `ProcessNode.tsx` par les trois composants `MctSync`, `MctSyncop` et `MotSync`
- **Arêtes MCT en segment droit** : les 22 figures MCT sont tracées en diagonale plutôt qu'en escalier. Le drapeau `data.straight` est posé **uniquement** par `DiagramCanvas.tsx` d'après `diagram.id.startsWith('mct')`, puis consommé par `TraitementEdge.tsx` (qui bascule entre `getStraightPath` et `getSmoothStepPath`) — la règle « quelles figures sont droites » est ainsi écrite à un seul endroit. SAT, MPT, MOT, MCD, MLD et MPD gardent l'escalier et passent par `RelationshipEdge.tsx`

## Principe Merise

Les trois niveaux de modélisation respectés :

- **MCD** (Modèle Conceptuel) : entités, associations, cardinalités, PK soulignée
- **MLD** (Modèle Logique) : tables, PK, FK (#), tables de jonction
- **MPD** (Modèle Physique) : tables avec types SQL, contraintes PK/FK/NN

> **Principe du passage MLD → MPD** : le MPD est une **traduction + un ajout de décisions
> physiques**, jamais une réécriture. Ce qui est reconduit à l'identique : le nombre de tables,
> les colonnes, les PK (y compris composites), les FK et leur nullabilité. Ce qui est ajouté : les
> types SQL, les `NOT NULL` / `UNIQUE` / `FOREIGN KEY`, les politiques `ON DELETE`, le moteur, le
> charset, les index, les colonnes techniques. Ce qui change : la **convention de nommage**
> (français conceptuel → anglais aligné code), seule transformation de forme autorisée.
> Le MPD **n'invente jamais** de colonne métier absente du MLD.
>
> Règles détaillées : `plans/rules/regles_mpd.md` (12 règles).

Diagrammes de traitements :

- **MCT** (Modèle Conceptuel de Traitement) : événements (losange), synchronisations (**pentagone**), opérations (rectangle), résultats (rectangle vert/rouge). Décrivent les flux métier par traitement. La numérotation fait foi dans `plans/mct/nouveaux_mct.md`, source de vérité : T0 Créer la campagne, T1 Candidature, T2 Quiz, T3 Planification de l'entretien, T4 Conduire l'entretien, T5 Évaluation, T6 Décision, T7 Annulation, T8 Audit
- **`syncLabel` = l'opérateur qui combine les flèches entrantes réellement dessinées** sur la synchronisation. Un `event-result` en compte une, puisqu'il arrive directement sur le pentagone : T1, T2, T4 et T5 reçoivent 2 flèches → `ET` ; T7 en reçoit 4 (les 3 résultats de T6 + son propre événement) → la formule complète `(RET OU ATT OU REF) ET DA`. T0, T3, T6 et T8 n'en reçoivent qu'une, donc restent vides
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
