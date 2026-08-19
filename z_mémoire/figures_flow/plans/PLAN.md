# Plan — figures_flow

Réécriture des diagrammes Merise/UML avec React Flow (@xyflow/react).

---

## Phase 0 — Initialisation du projet ✅

- [x] Initialiser le projet Vite + React + TypeScript
- [x] Installer dépendances
- [x] Configurer Tailwind CSS (via Vite plugin), couleurs custom, mode dark
- [x] Créer la structure de dossiers
- [x] Configurer tsconfig (strict, paths)
- [x] Créer l'index.html SPA basique

## Phase 1 — Types & données ✅

### 1.1 Modèles (src/types/)
- [x] `EntityNode`, `Attribute`, `RelationshipEdge`, `DiagramDefinition`

### 1.2 Déclarations (src/diagrams/)
- [x] MCD — 6 diagrammes
- [x] MLD — 5 diagrammes
- [x] MPD — 5 diagrammes

## Phase 2 — Composants de base ✅

- [x] `EntityNode.tsx` — nœud adaptable (mcd|mld|mpd)
- [x] `RelationshipEdge.tsx` — arête SVG lissée avec cardinalités
- [x] `Sidebar.tsx` — navigation par catégorie
- [x] `Toolbar.tsx` — zoom, theme, export
- [x] `DiagramCanvas.tsx` — wrapper React Flow

## Phase 3 — Logique applicative ✅

- [x] Persistance localStorage (positions nœuds)
- [x] Drag & drop, grille, zoom
- [x] Export SVG
- [x] Auto-layout

## Phase 4 — Styles & thèmes ✅

- [x] Variables CSS, dark mode, thème Svelte Flow
- [x] Arêtes smoothstep, cardinalités, handles

## Phase 5 — Tests & finitions (partiel)

- [ ] Vérifier les 16 diagrammes v1
- [ ] Tester l'export SVG
- [ ] Tester la persistance
- [ ] Nettoyer la console
- [ ] Vérifier l'inspectabilité DevTools

## Phase 6 — Corrections bugs ✅

- [x] Bug changement de diagramme (useEffect reset)
- [x] Bug stale closure persistence (loadPositions synchrone)
- [x] Réécriture thème (shadcn/neutre)

---

## Phase 7 — Réorganisation des diagrammes (alignement BD réelle)

### Contexte

La BD a évolué depuis la création des diagrammes v1. L'audit `plans/audit_bd_vs_diagrammes.md`
a révélé ~130 colonnes manquantes, 9 tables absentes et 4 erreurs structurelles.
On crée une **nouvelle génération** basée sur la BD réelle (`quizapp_db_described_20260818.md`).
Les anciens diagrammes sont préservés dans une catégorie `archive`.

### 7.0 Fix build

- [ ] Ajouter `"ignoreDeprecations": "6.0"` dans `tsconfig.json` (erreur `baseUrl` TS 6.0)
- [ ] Vérifier `npm run build`

### 7.1 Déplacer les anciens diagrammes vers `archive`

Déplacer tous les diagrammes existants dans une catégorie **`archive`** pour les préserver
sans polluer la navigation.

- [ ] Ajouter `'archive'` au type `Category` dans `src/types/index.ts`
- [ ] Créer `src/diagrams/archive/` et y déplacer :
  - `mcd/*.ts` → `archive/mcd_*.ts`
  - `mld/*.ts` → `archive/mld_*.ts`
  - `mpd/*.ts` → `archive/mpd_*.ts`
  - `traitements/mct_*.ts` (v1) → `archive/mct_*.ts`
  - `traitements/sat_*.ts` → `archive/sat_*.ts`
  - `traitements/mpt_*.ts` → `archive/mpt_*.ts`
  - `mot/mot_organisationnel.ts` → supprimé (inutile)
  - `mot/mot_organisationnel_v2.ts` → `archive/mot_v2.ts`
  - `palette/color_palette.ts` → `archive/color_palette.ts`
- [ ] Mettre à jour `src/diagrams/index.ts` : tous les imports archive avec `category: 'archive'`
- [ ] Les traitements v2 restent en place (`traitements/v2/`)

### 7.2 Nouveaux domaines — 8 domaines × 3 niveaux = 24 diagrammes

**Source de vérité** : `quizapp_db_described_20260818.md` (BD réelle)
**Audit de référence** : `plans/audit_bd_vs_diagrammes.md`

#### Domaine 1 — Utilisateurs & droits

**Tables** : `user`, `business_group`, `business_group_permission`, `entity_permission`,
`system_role_permission`, `user_business_group`, `user_permission_override`,
`group_change_request`, `invitation_code`

| # | Type | Fichier | Nb entités |
|---|------|---------|------------|
| 1 | MCD | `nouveau/mcd/utilisateurs_droits.ts` | 6 |
| 2 | MLD | `nouveau/mld/utilisateurs_droits.ts` | 9 |
| 3 | MPD | `nouveau/mpd/utilisateurs_droits.ts` | 9 |

#### Domaine 2 — Campagnes & pipeline de recrutement

**Tables** : `campaigns`, `pipeline_template`, `pipeline_stage`,
`pipeline_stage_notification_rule`, `departments`, `specialities`,
`source_token`, `campaign_form`

| # | Type | Fichier | Nb entités |
|---|------|---------|------------|
| 4 | MCD | `nouveau/mcd/campagnes_pipeline.ts` | 8 |
| 5 | MLD | `nouveau/mld/campagnes_pipeline.ts` | 8 |
| 6 | MPD | `nouveau/mpd/campagnes_pipeline.ts` | 8 |

#### Domaine 3 — Candidatures & suivi

**Tables** : `applications`, `application_progress`, `candidate_token`,
`candidate_ask`, `decisions`

| # | Type | Fichier | Nb entités |
|---|------|---------|------------|
| 7 | MCD | `nouveau/mcd/candidatures_suivi.ts` | 5 |
| 8 | MLD | `nouveau/mld/candidatures_suivi.ts` | 5 |
| 9 | MPD | `nouveau/mpd/candidatures_suivi.ts` | 5 |

#### Domaine 4 — Contenu du quiz

**Tables** : `form`, `form_version`, `form_questions`, `question`, `answer`

| # | Type | Fichier | Nb entités |
|---|------|---------|------------|
| 10 | MCD | `nouveau/mcd/contenu_quiz.ts` | 5 |
| 11 | MLD | `nouveau/mld/contenu_quiz.ts` | 5 |
| 12 | MPD | `nouveau/mpd/contenu_quiz.ts` | 5 |

#### Domaine 5 — Passation du quiz

**Tables** : `application_quiz_attempt`, `candidate_answer`, `quiz_anti_cheat_event`

| # | Type | Fichier | Nb entités |
|---|------|---------|------------|
| 13 | MCD | `nouveau/mcd/passation_quiz.ts` | 3 |
| 14 | MLD | `nouveau/mld/passation_quiz.ts` | 3 |
| 15 | MPD | `nouveau/mpd/passation_quiz.ts` | 3 |

#### Domaine 6 — Entretiens & évaluation

**Tables** : `interviews`, `interview_participant`, `candidate_interview`,
`evaluations`, `evaluation_item`, `evaluation_grid_template`,
`evaluation_grid_template_version`, `evaluation_grid_template_item`

| # | Type | Fichier | Nb entités |
|---|------|---------|------------|
| 16 | MCD | `nouveau/mcd/entretiens_evaluation.ts` | 6 |
| 17 | MLD | `nouveau/mld/entretiens_evaluation.ts` | 8 |
| 18 | MPD | `nouveau/mpd/entretiens_evaluation.ts` | 8 |

#### Domaine 7 — Communication

**Tables** : `email_template`, `email_template_preset`, `mail_log`,
`notifications`, `email_verification_tokens`, `legal_text`

| # | Type | Fichier | Nb entités |
|---|------|---------|------------|
| 19 | MCD | `nouveau/mcd/communication.ts` | 6 |
| 20 | MLD | `nouveau/mld/communication.ts` | 6 |
| 21 | MPD | `nouveau/mpd/communication.ts` | 6 |

#### Domaine 8 — Config système

**Tables** : `app_config`, `smtp_config`, `audit_event`

| # | Type | Fichier | Nb entités |
|---|------|---------|------------|
| 22 | MCD | `nouveau/mcd/config_systeme.ts` | 3 |
| 23 | MLD | `nouveau/mld/config_systeme.ts` | 3 |
| 24 | MPD | `nouveau/mpd/config_systeme.ts` | 3 |

### 7.3 Structure des dossiers

```
src/diagrams/
├── archive/                    # Anciens diagrammes (category: 'archive')
│   ├── mcd_*.ts
│   ├── mld_*.ts
│   ├── mpd_*.ts
│   ├── mct_*.ts
│   ├── sat_*.ts
│   ├── mpt_*.ts
│   ├── mot_v2.ts
│   └── color_palette.ts
├── nouveau/                    # Nouveaux diagrammes alignés BD
│   ├── mcd/                    # 8 fichiers MCD
│   │   ├── utilisateurs_droits.ts
│   │   ├── campagnes_pipeline.ts
│   │   ├── candidatures_suivi.ts
│   │   ├── contenu_quiz.ts
│   │   ├── passation_quiz.ts
│   │   ├── entretiens_evaluation.ts
│   │   ├── communication.ts
│   │   └── config_systeme.ts
│   ├── mld/                    # 8 fichiers MLD
│   │   └── (même structure)
│   └── mpd/                    # 8 fichiers MPD
│       └── (même structure)
├── traitements/                # MCT/SAT/MPT (v1 + v2)
│   ├── v2/                     # MCT v2 (T0-T6, à étendre en T0-T8)
│   └── *.ts                    # v1 (conservés)
├── mot/                        # MOT (v2 uniquement, v1 à supprimer)
└── index.ts                    # Registre central
```

### 7.4 Ordre d'implémentation

1. **Fix build** — `tsconfig.json` ignoreDeprecations
2. **Archive** — déplacer les anciens fichiers, ajouter catégorie `archive`
3. **Domaine 1** — Utilisateurs & droits (MCD → MLD → MPD)
4. **Domaine 2** — Campagnes & pipeline (MCD → MLD → MPD)
5. **Domaine 3** — Candidatures & suivi (MCD → MLD → MPD)
6. **Domaine 4** — Contenu du quiz (MCD → MLD → MPD)
7. **Domaine 5** — Passation du quiz (MCD → MLD → MPD)
8. **Domaine 6** — Entretiens & évaluation (MCD → MLD → MPD)
9. **Domaine 7** — Communication (MCD → MLD → MPD)
10. **Domaine 8** — Config système (MCD → MLD → MPD)
11. **Registre** — mise à jour `src/diagrams/index.ts`
12. **Tests** — `npm run build`, vérification sidebar, export SVG

### 7.5 Conventions Merise par niveau

> **Principe fondamental** : les diagrammes du mémoire modélisent le système tel qu'il
> *devrait* être selon les règles Merise, pas tel qu'il *est* physiquement. La BD réelle
> contient des dénormalisations légitimes (performance, audit) qui n'ont pas leur place
> au niveau conceptuel. Un paragraphe "Écarts MCD vs MPD" dans le mémoire documente
> ces choix d'ingénierie — c'est un signe de maturité, pas un défaut.

#### Langue

- **MCD** : français — lisible par un non-informaticien (métier)
- **MLD** : français — découle directement du MCD par transformation
- **MPD** : anglais/snake_case — schéma physique réel (Spring Boot / MySQL)

Ce switch de langue illustre la distinction conceptuel/physique que Merise formalise.

#### Style d'écriture (convention Merise classique)

| Élément | Convention | Exemple |
|---------|------------|---------|
| Entités | MAJUSCULES, singulier | `CANDIDAT`, `CAMPAGNE`, `UTILISATEUR` |
| Attributs | minuscules, snake_case, français | `nom_candidat`, `date_naissance`, `statut_progression` |
| Associations (verbes) | MAJUSCULES ou capitalisées | `POSTULE`, `PARTICIPE_A`, `EVALUE` |
| Identifiant (PK) | souligné, préfixé `id_` ou `num_` | `id_candidat`, `num_campagne` |

> Pas de camelCase en Merise — c'est du registre "analyse", pas "développement".

#### MCD — Modèle Conceptuel (purement Merise)

- **Noms francisés** : `CANDIDAT`, `CAMPAGNE`, `UTILISATEUR`, `ETAPE_PIPELINE`
- **Attributs conceptuels** : uniquement les faits métier, pas de types SQL
- **PK** : `id_*` souligné
- **Pas de FK** : les liens sont les associations (arêtes), pas des colonnes
- **Cardinalités** : `0,n` / `1,1` / `1,n` (Merise standard)

**Exclus du MCD** (à documenter dans le mémoire) :

| Catégorie | Exemples | Justification |
|-----------|----------|---------------|
| Champs techniques d'audit | `created_at`, `updated_at`, `created_by`, `is_deleted`, `search_string` | Implémentation, pas concept |
| Attributs dérivés/agrégés | `aggregated_quiz_score`, `current_pipeline_stage_type`, `score_percent` | Calculables à partir d'autres entités |
| Pointeurs cycliques | `current_application_progress_id`, `active_campaign_id` | Optimisation physique, pas concept |
| Colonnes JSON techniques | `before_state_json`, `after_state_json`, `metadata` | Structure physique, pas conceptuelle |
| Colonnes JSON métier | `config_json` | Représenté comme attribut simple si conceptuel, sinon omis |

**Autorisé au MCD** :
- Associations réflexives (`annule` : DECISION → DECISION)
- Clés candidates multiples (`email` UNI, `username` UNI)
- Attributs optionnels (nullable = cardinalité `0,1`)

#### MLD — Modèle Logique (traduction relationnelle)

- **Même langue que le MCD** : français
- **Noms de colonnes** : traduits du MCD, snake_case français
- **FK** : représentées via les arêtes + badge FK
- **Tables de jonction** : badge `JONCTION`, PK composite
- **Types SQL omis** (c'est le MLD, pas le MPD)

**Inclus au MLD mais pas au MCD** :
- FK techniques (points de retour cycliques) → en commentaires ou omises si trop dénormalisées
- `search_string` → omis
- Champs d'audit → omis

#### MPD — Modèle Physique (BD réelle complète)

- **Langue anglaise** : noms de tables et colonnes = schéma MySQL réel
- **Types SQL complets** : `int unsigned`, `varchar(255)`, `tinyint(1)`, `text`, etc.
- **Contraintes** : PK, FK, UNI, NOT NULL
- **Valeurs défaut** quand pertinentes
- **Source de vérité** : `quizapp_db_described_20260818.md`

**Inclus au MPD mais pas au MCD/MLD** :
- `search_string` (indexation full-text)
- `created_at`, `updated_at`, `created_by`, `updated_by`, `is_deleted` (audit technique)
- Champs dérivés/agrégés (`aggregated_*`, `current_*` pointer columns)
- Colonnes JSON (`config_json`, `metadata`, `before_state_json`)
- Pointeurs cycliques (`current_application_progress_id`, `active_campaign_id`)

### 7.6 Section mémoire — Écarts MCD vs MPD

Une sous-section dans le mémoire (après la présentation du MCD global) documente les
4 catégories d'écarts :

1. **Attributs dérivés stockés** — snapshots pour performance (ex: `aggregated_quiz_score`)
2. **Colonnes JSON** — structures non atomiques pour flexibilité (ex: `config_json`)
3. **Redondances cycliques** — pointeurs retour pour éviter des jointures coûteuses (ex: `current_application_progress_id`)
4. **Champs techniques d'audit** — traçabilité implémentation (ex: `search_string`, `is_deleted`)

> *"Le schéma physique intègre volontairement des redondances contrôlées (attributs dérivés,
> snapshots d'état courant) à des fins de performance et de traçabilité, non représentées
> dans le MCD conceptuel qui respecte les règles de normalisation strictes."*

### 7.7 Table de correspondance MCD ↔ MPD

Un tableau en annexe ou en fin de chapitre modélisation, prouvant la traçabilité entre
les niveaux conceptuel et physique :

| Entité MCD | Attribut MCD | Table réelle | Colonne réelle |
|------------|--------------|--------------|----------------|
| CANDIDAT | prenom_candidat | applications | candidate_first_name |
| CANDIDAT | nom_candidat | applications | candidate_last_name |
| CAMPAGNE | titre | campaigns | campaign_title |
| ... | ... | ... | ... |

> Ce tableau est généré automatiquement à partir des définitions de diagrammes.
> Il couvre au minimum les entités et attributs des 8 domaines.

### 7.8 Données de référence

| Ressource | Chemin |
|-----------|--------|
| BD réelle | `cartographie-fonctionnelle-front/bd_actuelle/quizapp_db_described_20260818.md` |
| Audit écarts BD vs diagrammes | `z_mémoire/figures_flow/plans/audit_bd_vs_diagrammes.md` |
| BD cible post-420 | `cartographie-fonctionnelle-front/bd_actuelle/quizapp_db_cible_post_420_migration.md` |

---

## Notes techniques

- **Framework** : React 19 + TypeScript
- **Build** : Vite
- **Styling** : Tailwind CSS v4 + variables CSS (thème Svelte Flow)
- **Diagram** : @xyflow/react (React Flow v12)
- **Icons** : lucide-react
- **Persistence** : localStorage
- **Thème** : light/dark via classe `.dark`
- **Pas de Docker** — `npm run dev` suffit
