# PLAN — Passage MLD → MPD (règles Merise `plans/rules/regles_mpd.md`)

Date : 2026-09-28
Référence : règles de transformation MLD → MPD, en continuité avec `plans/rules/regles_mld.md`
(§7.6 du mémoire) et `plans/rules/regles_mcd.md` (§7.5).
Précédent : `plans/implementations/20260919_passage_mcd_mld.md` (MCD → MLD).

## Statut

- Plan créé le 2026-09-28. **Aucune implémentation tant que le plan n'est pas validé.**
- Périmètre volontairement **resserré** : 2 figures, **21 tables** sur les 34 relations du MLD
  (la BD ne tient pas entièrement en une figure, cf. règle 10 de `regles_mld.md`).
- Les **4 MPD existants** (`nouveau/mpd/{utilisateurs_droits,campagnes_pipeline,candidatures_suivi,entretiens_evaluation}.ts`)
  sont **remplacés** : ils étaient dérivés de la BD physique, désynchronisés du MLD
  (tables hors-scope MCD, domaine « Structure & configuration » absent) et **sans aucune arête**.
- Règles 7, 8, 9 et 10 **appliquées mais non affichées colonne par colonne** dans les figures :
  elles sont déléguées à un script SQL unique (`plans/mpd/colonnes_techniques.sql`). Voir
  §3 de `regles_mpd.md` (« Note de projet »).

## Contexte & décisions

- Conversion réalisée **à partir des MLD actuels** (`src/diagrams/nouveau/mld/*.ts`), **pas à
  partir d'un dump** de la BD physique. Le MLD est la source de vérité (principe acté le
  20260922 : « le MCD/MLD constitue la vraie `bd_cible` »).
- Le MLD est **volontairement borné par sous-domaines** (5 domaines, 5 figures) ; le MPD, lui,
  reste borné lui aussi mais **par périmètre de lecture** : on ne dessine que la chaîne de
  recrutement, pas les 34 relations. C'est un choix de lisibilité, pas une règle Merise.
- **Nommage** : noms de la **BD physique réelle**, avec **3 arbitrages** validés (§4) et
  **1 divergence assumée** (§5).
- **Colonnes** : exactement les attributs du MLD, avec un **type MySQL concret** et la
  **nullabilité** du MLD reconduite à l'identique (`nullable: true`).
- **Aucune colonne d'audit** (`created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`),
  **aucun index**, **aucune colonne dénormalisée** dans les figures : script SQL séparé
  (`plans/mpd/`).
- **Rendu** : grille 3 colonnes `[PK|FK] nom | type SQL | NOT NULL/NULL`, **identique au MLD**.

## Résultat implémenté (2026-09-28)

- [x] `plans/rules/regles_mpd.md` : 12 règles + note de projet + notation graphique + table de
      correspondance MCD↔MPD (21 tables) + 10 vérifications finales.
- [x] `EntityNode.tsx` : constante `isTable = variant === 'mld' || variant === 'mpd'`, utilisée aux
      6 endroits qui testaient la variante (grille 3 colonnes, badges `PK`/`FK`, badge `TABLE`,
      colonne `type`, colonne `NOT NULL`/`NULL`). Aucun changement de type ni de donnée MLD.
- [x] 4 anciens MPD supprimés (`git rm`) → 2 nouveaux : `campagnes_candidatures.ts` (12 tables,
      93 colonnes, 13 arêtes) et `entretiens_utilisateurs.ts` (9 tables, 69 colonnes, 9 arêtes).
- [x] `diagrams/index.ts` : 4 entrées `mpd` → 2.
- [x] `npx tsc --noEmit` : **70 erreurs**, exactement le compte pré-existant (vérifié par `git
      stash` sur les 2 fichiers modifiés) — **0 nouvelle erreur**, aucune ne porte sur les 2
      nouveaux diagrammes. Les 70 sont une cascade de typage React Flow v12
      (`NodeProps<EntityNodeData>`, `src/types/index.ts:51`).
- [x] `npx vite build` : **OK** en 4.39 s.
- [x] Contrôle d'intégrité automatisé : 21 tables, 0 doublon de nom, chaque cible de FK
      résolue **ou** explicitement identifiée comme hors figure (voir ci-dessous).

### FK hors figure — décompte des 5 références non résolues (attendu et documenté)

| Figure | Colonne | Cible | Nature |
|---|---|---|---|
| 1 | `campaigns.speciality_id` | `specialities` | `SPECIALITE` écartée du périmètre MPD |
| 1 | `questions.speciality_id` | `specialities` | idem |
| 1 | `campaigns.creator_id` | `user` | **cross-figure** (figure 2) |
| 1 | `pipeline_stage.evaluation_grid_template_version_id` | `evaluation_grid_template_version` | **cross-figure** (figure 2) |
| 1 | `applications.source_token_id` | `source_token` | `TOKEN_SOURCE` écartée → **FK pendante** |
| 2 | `interviews.application_progress_id` | `application_progress` | **cross-figure** (figure 1) |
| 2 | `user.company_id` | `companies` | `ENTREPRISE` écartée |

> La colonne est **conservée** dans tous les cas : elle provient d'un attribut du MLD, la supprimer
> ferait perdre l'information. Seule la **cible** n'est pas dessinée (règle 10 de `regles_mld.md`).
> `applications.source_token_id` est la seule FK **pendante** (table cible écartée et sans
> équivalent dans les figures) — à lever quand `TOKEN_SOURCE` sera rejoué.

### Écarts constatés pendant l'implémentation

- **Comptages initiaux faux** : le plan annonçait 191 colonnes et 34 arêtes ; les comptes réels
  sont **162 colonnes** et **22 arêtes**. Les colonnes par table du tableau de périmètre ont été
  corrigées (`CAMPAGNE` 12→13, `ETAPE_PIPELINE` 8→9, `ENTRETIEN` 9→10, `EVALUATION` 7→8 — les
  4 tables porteuses d'une FK cross-domaines).
- **L'arête `e-evaluations-evaluator` n'existait pas** dans le décompte initial : `EVALUATION` porte
  2 FK, donc 2 arêtes dans la figure 2.
- **`VERSION_GRILLE.contenu_hashé`** (faute de frappe du MLD) → `content_hash` au MPD. **Correction
  du MLD/MCD encore à faire** (`contenu_hashé` → `contenu_hash`), non faite ici pour ne pas
  étendre le périmètre.

---

## Étapes

### Documentation (fais, commité en premier)

- [x] Créer ce plan.
- [x] `plans/rules/regles_mpd.md` : 12 règles + note de projet (§3) + notation graphique
      (§4) + table de correspondance MCD↔MPD (§5) + vérifications finales (§6).
- [ ] `plans/mpd/README.md` : ce que contient le script, pourquoi c'est hors figures.

### Rendu (`src/components/Nodes/EntityNode.tsx`)

- [x] Étendre la grille 3 colonnes de la variante `mld` à la variante `mpd` : la classe
      `grid grid-cols-[minmax(0,1fr)_auto_auto]` et les deux spans `NOT NULL`/`NULL` passent de
      `variant === 'mld'` à `variant === 'mld' || variant === 'mpd'`.
- [x] Le flag `nullable` existe déjà sur `Attribute` (`src/types/index.ts`) → **aucun changement
      de type ni de donnée MLD**.
- [x] Retour arrière trivial si le rendu ne convient pas (revert du diff de ce composant).

### Figures (`src/diagrams/nouveau/mpd/`)

- [x] Supprimer les 4 fichiers MPD actuels.
- [x] Créer `campagnes_candidatures.ts` (`mpd-campagnes-candidatures`, 12 tables).
- [x] Créer `entretiens_utilisateurs.ts` (`mpd-entretiens-utilisateurs`, 9 tables).
- [x] `src/diagrams/index.ts` : imports + tableau `diagrams` (4 entrées `mpd` → 2).

### Script SQL (`plans/mpd/`)

- [ ] `colonnes_techniques.sql` : en-tête `ENGINE=InnoDB / utf8mb4 / utf8mb4_unicode_ci`
      (règle 10), `ALTER TABLE` des 21 tables pour les 5 colonnes d'audit (règle 7), index
      (règle 8), bloc des colonnes dénormalisées de `applications` (règle 9), chaque section
      séparée par un en-tête en commentaire.

### Documentation projet

- [ ] `README.md` (figures_flow) : table de correspondance MCD↔MPD (21 lignes, pluriel
      `users`/`business_groups` **corrigé**), compteurs (5 MCD / 5 MLD / **2** MPD), arborescence
      (`mpd/` = 2 fichiers, nouveau `plans/mpd/`), section Types, paragraphe « Principe Merise ».

## Périmètre retenu — 21 tables sur 34

### Figure 1 — « Campagnes & candidatures » (`mpd-campagnes-candidatures`, 12 tables)

| # | Table MPD | Relation MLD | Domaine MLD | Attributs |
|---|-----------|--------------|-------------|-----------|
| 1 | `campaigns` | CAMPAGNE | Campagnes & pipeline | 13 |
| 2 | `pipeline_template` | MODELE_PIPELINE | Campagnes & pipeline | 5 |
| 3 | `pipeline_stage` | ETAPE_PIPELINE | Campagnes & pipeline | 9 |
| 4 | `campaign_form` | PROPOSER (jonction) | Campagnes & pipeline | 3 |
| 5 | `form` | FORMULAIRE | Campagnes & pipeline | 5 |
| 6 | `form_version` | VERSION_FORMULAIRE | Campagnes & pipeline | 6 |
| 7 | `form_questions` | REGROUPER (jonction) | Campagnes & pipeline | 4 |
| 8 | `question` | QUESTION | Campagnes & pipeline | 8 |
| 9 | `answer` | REPONSE | Campagnes & pipeline | 7 |
| 10 | `applications` | CANDIDATURE | Candidatures & suivi | 12 |
| 11 | `application_progress` | AVANCEMENT | Candidatures & suivi | 14 |
| 12 | `decisions` | DECISION | Candidatures & suivi | 7 |

### Figure 2 — « Entretiens & utilisateurs » (`mpd-entretiens-utilisateurs`, 9 tables)

| # | Table MPD | Relation MLD | Domaine MLD | Attributs |
|---|-----------|--------------|-------------|-----------|
| 13 | `interviews` | ENTRETIEN | Entretiens & évaluation | 10 |
| 14 | `convocation` ⚠ | CONVOCATION | Entretiens & évaluation | 8 |
| 15 | `interview_evaluator` ⚠ | EVALUATEUR_ENTRETIEN | Entretiens & évaluation | 11 |
| 16 | `evaluations` | EVALUATION | Entretiens & évaluation | 8 |
| 17 | `evaluation_item` | NOTE_CRITERE | Entretiens & évaluation | 7 |
| 18 | `evaluation_grid_template` | GRILLE_MODELE | Entretiens & évaluation | 4 |
| 19 | `evaluation_grid_template_version` | VERSION_GRILLE | Entretiens & évaluation | 6 |
| 20 | `evaluation_grid_criterion` ⚠ | CRITERE | Entretiens & évaluation | 8 |
| 21 | `user` | UTILISATEUR | Utilisateurs & droits | 7 |

> **21 tables, 162 colonnes** (93 + 69), 22 arêtes (13 + 9). Les 2 jonctions (`campaign_form`,
> `form_questions`) gardent leur **clé primaire composite** du MLD → pas d'`id` inventé, donc
> **pas d'`AUTO_INCREMENT`**. Les 19 autres tables ont `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`.

### Relations MLD écartées (13 sur 34) — motif

| Relation MLD | Domaine | Motif de l'exclusion |
|---|--------------|----------------------|
| `REGLE_NOTIFICATION` | Campagnes & pipeline | règles d'envoi = comportement applicatif, exécution déjà portée par `REGLE_NOTIFICATION` côté code |
| `TOKEN_SOURCE` | Candidatures & suivi | porte d'entrée technique, pas un concept du parcours candidat |
| `TOKEN_VERIFICATION_EMAIL` | Candidatures & suivi | jeton technique (statut « à statuer » dans `plans/audit/20260819_hors_scope_mcd.md` §2.2) |
| `NOTIFICATION` | Utilisateurs & droits | notification **polymorphique** (`object_table_name` + `object_table_id`), écartée du MCD |
| `GROUPE_METIER` | Utilisateurs & droits | référentiel de permissions, hors de la chaîne de recrutement |
| `PERMISSION_GROUPE` | Utilisateurs & droits | idem |
| `APPARTENIR` (jonction) | Utilisateurs & droits | idem |
| `BENEFICIER` (jonction) | Utilisateurs & droits | idem |
| `ENTREPRISE` | Structure & configuration | domaine de référentiel, sans FK entrante depuis la chaîne de recrutement |
| `DEPARTEMENT` | Structure & configuration | idem |
| `SPECIALITE` | Structure & configuration | seul lien : `campaigns.speciality_id` / `questions.speciality_id`, optionnel |
| `CONFIGURATION` | Structure & configuration | paramétrage applicatif |
| `MODELE_EMAIL` | Structure & configuration | gabarits d'email, idem |

> Les 13 restent **dans les figures MCD/MLD**. Le MPD est un extrait de lecture, pas un
> inventaire exhaustif — c'est la seule entorse au principe « une table par relation », et elle
> est assumée et documentée ici.

## Nommage — conventions de traduction (règle 12)

| MLD (français) | MPD (anglais, aligné code) |
|---|---|
| `id_campagne` (PK) | `id` |
| `#id_modele_pipeline` | `pipeline_template_id` |
| `est_publiee` | `is_published` |
| `date_debut` / `date_fin` | `start_date` / `end_date` |
| `libelle_modele` / `libelle_etape` / `libelle` | `template_name` / `stage_label` / `label` |
| `type_etape` / `type_critere` | `stage_type` / `criterion_type` |
| `ordre_etape` / `ordre` / `ordre_question` | `stage_order` / `criterion_order` / `question_order` |
| `enonce` | `statement` |
| `prenom_candidat` / `nom_candidat` | `candidate_first_name` / `candidate_last_name` |
| `date_naissance` | `candidate_birthdate` |
| `statut_progression` | `progress_status` |
| `statut_reponse` | `response_status` |
| `valeur_score` / `valeur_texte` | `score_value` / `text_value` |
| `coefficient_fige` / `note_max_figee` | `weight_snapshot` / `max_score_snapshot` |
| `coefficient` (CRITERE) | `weight` |
| `contenu_hashé` (sic) | `content_hash` |
| `peut_modifier` / `peut_supprimer` / `peut_evaluer` | `can_modify` / `can_delete` / `can_evaluate` |
| `a_termine` | `has_finished` |
| `date_soumission` / `date_validation` | `submitted_at` / `validated_at` |
| `verrouillee_le` | `locked_at` |
| `chaine_token` | `token_string` |

### Arbitrages validés (3)

| Relation MLD | Nom physique | Nom retenu | Motif |
|---|---|---|---|
| `CONVOCATION` | `candidate_interview` | **`convocation`** | la table porte une **convocation**, pas « un candidat entretien » ; le nom du MLD (cible théorique 420) est plus juste |
| `EVALUATEUR_ENTRETIEN` | `interview_participant` | **`interview_evaluator`** | les participants portent `can_evaluate` / `evaluation_status` : ce sont des **évaluateurs** |
| `CRITERE` | `evaluation_grid_template_item` | **`evaluation_grid_criterion`** | « template_item » est ambigu ; le critère est défini par une **version** de grille, pas par le modèle |

### Divergence assumée (1)

| Cas | Nom physique | Nom retenu | Motif |
|---|---|---|---|
| `DECISION.#id_decision_annulee` | `decisions.cancels_decision_id` | **`annulled_decision_id`** | le nom physique est **inversé** : la colonne stocke la décision **annulée**, pas l'annulatrice. `cancels_decision_id` se lirait comme la décision *qui annule*. Le MLD est correct (nom de rôle explicite, règle 5 de `regles_mld.md`) : on aligne le MPD sur lui. |

> Conséquence : le code Java devra renommer la colonne lors de l'alignement de la BD sur la cible
> (coût faible, une seule table). Documenté ici pour mémoire.

## Typage et contraintes (règles 2, 3, 5, 6)

- **PK** : `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY` (jonctions : PK composite `(a_id, b_id)`).
- **FK** : `INT UNSIGNED` (même type que la PK référencée) + cible et politique de suppression
  dans la colonne `type` : `int unsigned FK → applications.id ON DELETE CASCADE`.
- **Booléens** : `TINYINT(1)` — **uniformisation** (le physique melande `bit(1)` et `tinyint(1)`,
  incohérence relevée dans la règle 2).
- **Énumérations métier** : `VARCHAR(n)` — le MLD a des attributs `VARCHAR`, on ne réécrit pas le
  domaine en `ENUM` (les valeurs vivantes sont applicatives, cf. `campaigns.status`).
- **Scores** : `DECIMAL(5,2)`.
- **Dates** : `DATETIME` (date de naissance seule : `DATE`).
- **Textes** : `VARCHAR(n)` court, `TEXT` long, `LONGTEXT` pour la lettre de motivation.
- **UNIQUE** : `UNI` en suffixe du type (règle 6) — aucun candidat `UNIQUE` dans le MLD actuel
  (les unicités métier comme `email` de `user` sont un choix applicatif, cf. note de projet).

### Politique `ON DELETE` par famille de FK

| Famille | Politique | Tables concernées |
|---|---|---|
| Enfant sans existence propre | `CASCADE` | `answer`→`question`, `application_progress`→`applications`, `evaluation_item`→`evaluations`, `form_version`→`form`, `pipeline_stage`→`pipeline_template`, `interview_evaluator`→`interviews`, `convocation`→`interviews`, `campaign_form`→`campaigns`/`form`, `form_questions`→`form_version`/`question` |
| Lien structurel (cycle de vie métier) | `RESTRICT` | `applications.form_version_id`→`form_version`, `application_progress.pipeline_stage_id`→`pipeline_stage`, `decisions.application_progress_id`→`application_progress` |
| Pointeur optionnel (rôle_ctx) | `SET NULL` | `campaigns.pipeline_template_id`, `interviews.application_progress_id`, `evaluations.evaluator_id`, `decisions.user_id`, `decisions.annulled_decision_id` |

## Arêtes (convention MLD)

- Liens de **référencement** (FK) : `type: 'relationship'`, **ni verbe ni cardinalité** — même
  convention que le MLD (règle 8 de `regles_mld.md`).
- Le nom de la FK porte déjà la cible (`pipeline_template_id`) : l'arête est un **doublure
  graphique** de l'information, elle sert à la lisibilité, pas à la définir.
- Réflexive : `decisions.annulled_decision_id` → boucle sur le nœud `decisions`,
  `data: { reflexSpread: 60 }`.
- **FK inter-figures** : une seule, `decisions.user_id → user.id` (figure 1 → figure 2) ; notée
  ici, l'entité cible reste dans son propre domaine (règle 10 de `regles_mld.md`).

## Colonnes physiques écartées (présentes en BD, absentes du MLD)

Rappel : le MPD est dérivé du MLD, donc ces colonnes **n'apparaissent pas** dans les figures. Elles
sont recensées dans `plans/audit/20260819_hors_scope_mcd.md` §5 (≈ 80 colonnes).

| Table | Colonnes écartées |
|---|---|
| `campaigns` | `is_timed`, `all_can_evaluate`, `total_questions`, `time_all_forms`, `anti_cheat_enabled`, `form_assignment_strategy`, `form_assignment_exhaustion_policy` |
| `campaign_form` | `active_campaign_id`, `active_form_id` (pointeurs techniques) |
| `applications` | `current_*` (12 pointeurs), `current_application_progress_id`, `current_pipeline_stage_id`, `aggregated_*` (4 scores), `abandoned_at`, `abandon_reason`, `abandoned_from_application_progress_id`, `last_progressed_at` |
| `application_progress` | `validated_by`, `skipped_by`, `reopened_by` (acteurs d'audit) |
| `interviews` | `evaluation_room_code`, `evaluation_date`, `evaluation_completed_at`, `evaluation_completed_by`, `closure_date`, `closure_comment` |
| `interview_evaluator` | `evaluation_submitted_at`, `last_ping_at` |
| `question` | `question_ref`, `all_answers_justification_required`, `free_text_response_placeholder` |
| `answer` | `additional_comment_required`, `additional_comment_placeholder` |
| `form_version` | `published_form_id` |
| `pipeline_template` | `template_desc` |
| `pipeline_stage_notification_rule` | `requires_manual_confirmation` |
| `evaluation_grid_criterion` | `config_json` → voir règle 11, reporté au script |
| toutes | `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` |

## Colonnes MLD ajoutées (absentes de la BD physique)

| Table | Colonne | Motif |
|---|---|---|
| `convocation` | `proposed_at DATETIME NOT NULL` | cible théorique 420 : snapshot de la date à la convocation (`CONVOCATION.date_proposee`) |
| `interviews` | `scheduled_at DATETIME NOT NULL` | `ENTRETIEN.date_planifiee` |
| `campaign_form` | `assignment_order INT NOT NULL` | `PROPOSER.ordre_affectation` (attribut propre de l'association N,N) |
| `interview_evaluator` | `follows_application TINYINT(1) NOT NULL` | `EVALUATEUR_ENTRETIEN.suit` |

> Anomalie relevée au passage : `VERSION_GRILLE.contenu_hashé` est une **faute de frappe** dans le
> MLD (le MCD a été corrigé en `contenu_hash` par le commit `d731780`, pas le MLD). Le MPD écrit
> `content_hash` ; **le MLD devrait être corrigé** (`contenu_hashé` → `contenu_hash`).

## Vérifications

- [ ] `npx tsc --noEmit` : pas de nouvel échec au-delà des erreurs pré-existantes connues.
- [ ] `npx vite build` : build OK (artefacts `dist/` à committer — le dossier est versionné).
- [ ] Test manuel `npm run dev` : les 2 figures MPD s'affichent, grille 3 colonnes, badges
      `PK`/`FK`, `TABLE` dans l'en-tête, arêtes non superposées.
- [ ] Comptages : **21 tables**, **191 colonnes**, **34 arêtes** (dont 1 réflexive).
- [ ] Aucune colonne dans les figures qui ne soit pas dans le MLD.
- [ ] Aucun `#` ni nom en majuscules dans les figures MPD.
- [ ] Chaque table (hors `user`) porte au moins une arête.
- [ ] Les 2 jonctions n'ont ni `id` ni `AUTO_INCREMENT`.
- [ ] Chaque FK pointe vers une PK existante d'une table **présente en figure** (hors
      `decisions.user_id`, inter-figures documentée).

## Commits proposés (conventional commits)

1. `docs(plan): plan passage MLD → MPD (2 figures, 21 tables, arbitrages de nommage)`
2. `docs(rules): règles de passage MLD → MPD (12 règles, note projet, notation, correspondance)`
3. `feat(mpd): MPD depuis le MLD — 2 figures, 21 tables, types MySQL et ON DELETE`
4. `feat(diagrams): grille 3 colonnes pour la variante mpd (nullabilité affichée)`
5. `docs(mpd): script SQL colonnes techniques et index + README plans/mpd`
6. `docs(readme): MPD dérivé du MLD (2 figures, arbitrages de nommage)`
7. `build(diagrams): artefacts dist (MPD depuis le MLD)`

## Pièges / rappels

- **Ne pas récupérer de dump** : toute colonne du nouveau MPD doit être traçable à un attribut
  du MLD (`nouveau/mld/*.ts`). C'est le critère d'arbitrage en cas de doute.
- **Ne pas réintroduire les tables hors-scope MCD** que portaient les 4 anciens MPD
  (`entity_permission`, `user_permission_override`, `group_change_request`, `invitation_code`,
  `system_role_permission`, `candidate_ask`, `candidate_token`) : elles sont documentées comme
  écartées dans `plans/audit/20260819_hors_scope_mcd.md` §2.
- `nullable` sur `Attribute` est déjà typé (`src/types/index.ts`) : ne pas le redéfinir.
- Le rendu 3 colonnes du MPD réutilise la grille existante du MLD — ne pas créer un second
  composant `MpdNode`.
- Positions des nœuds : ces fichiers définissent des `position` explicites ; `autoLayout.ts`
  (`src/utils/`) est appliqué par `DiagramCanvas` et la persistance localStorage prime sur
  `figures_flow:diagram:<id>`.
- Les arêtes MPD doivent rester **nues** (pas de `label`, `cardFrom`, `cardTo`) : le MPD est le
  dernier niveau, la sémantique est portée par les contraintes, pas par les arêtes.
