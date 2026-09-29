# `plans/mpd/` — Choix physiques hors figures

Ce dossier accompagne les **2 figures MPD** du projet. Il ne contient pas de
modèle : il contient ce que la méthode MPD ajoute **par nature** et qui, pour
cette raison, n'a pas sa place dans un diagramme.

| Fichier | Contenu |
|---|---|
| `colonnes_techniques.sql` | Colonnes d'audit, index, unicités, dénormalisation assumée, JSON, moteur/charset |

## Pourquoi ces règles sont hors figures

Les règles **6, 7, 8, 9, 10 et 11** de `plans/rules/regles_mpd.md` **sont
appliquées** au projet. Elles ne sont pas répétées colonne par colonne sur les
figures, pour deux raisons :

1. **Lisibilité** — répéter 5 colonnes d'audit sur 21 tableaux noierait la
   lecture du diagramme sous une information identique partout. Au MPD, ce qui
   est pédagogique, c'est le **typage** et les **contraintes de suppression**, pas
   l'horodatage.
2. **Cohérence de principe** — le MCD/MLD constitue la `bd_cible` (principe acté
   le 20260922). Une colonne absente du MLD n'a pas sa place **dans la figure** :
   elle est documentée, pas illustrée.

> **Conséquence de lecture**
> Une figure MPD = le MLD, avec ses types et ses contraintes.
> Ce script = le MLD, plus ce que la méthode physique ajoute par nature.
> Rien n'est perdu, tout est à un seul endroit.

## Ce que chaque règle donne

| Règle | Dans les figures | Ici |
|---|---|---|
| 6 — unicité | ❌ | `UNIQUE KEY` : `user.email`, `user.username`, `(interview_id, user_id)`, `(form_version_id, candidate_email)` |
| 7 — colonnes techniques | ❌ | `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted` sur les 21 tables |
| 8 — index | ❌ | index sur les colonnes réellement interrogées (statuts, dates de flux, FK) |
| 9 — dénormalisation | ❌ | `applications.current_*` / `aggregated_*`, justifiés par les 3 questions de la règle |
| 10 — moteur / charset | ❌ | `InnoDB` + `utf8mb4` + `utf8mb4_unicode_ci`, posés une fois |
| 11 — JSON | ❌ | `evaluation_grid_criterion.config_json`, `pipeline_stage.config_json` |

## Contenu du script

`colonnes_techniques.sql` est organisé en **une section par règle**, dans
l'ordre de `regles_mpd.md`, avec le contexte à chaque fois :

1. **Règle 10** en tête (variables `SET` + rappel) : c'est la seule partie non
   commentée, parce que c'est la seule qui s'applique uniformément.
2. **Règle 7** — les 5 colonnes d'audit, avec le `ALTER TABLE` complet développé
   une fois (`campaigns`) puis abrégé pour les 20 autres.
3. **Règle 6** — `UNIQUE KEY`, dont une sur clé étrangère composite **sans**
   colonne surrogate.
4. **Règle 8** — index, avec un commentaire sur ce qu'on n'indexe **pas**
   (ce qui est déjà couvert par une PK composite) et pourquoi.
5. **Règle 9** — dénormalisation, chaque colonne répondant aux 3 questions :
   *quelle requête évite-t-elle ? à quel coût de cohérence ? qui la rafraîchit ?*
6. **Règle 11** — JSON, avec la contrepartie assumée (pas de contrainte, pas de
   jointure, index seulement via colonnes générées).

Deux sections de vigilance ferment le fichier :

- **`user` est quasi-réservé** — toutes les occurrences sont backtick-ées ; la
  table est au singulier quand le reste du schéma est au pluriel (arbitrage
  assumé, tracé dans `regles_mpd.md`).
- **FK pendante `applications.source_token_id`** — voir ci-dessous.

## Statut du script

C'est un **document de conception**, pas une migration.

- Il est en **pur additif** (`ALTER TABLE … ADD`) : il ne détruit rien.
- Il est **commenté** sauf les `SET` d'en-tête, donc non exécutable tel quel.
- Il n'est **pas** un fichier Flyway (`quizapp/src/main/resources/db/migration/`) :
  il décrit le MPD pédagogique, la migration réelle a son propre cycle de vie.
- Les 3 questions de la règle 9 sont des **arbitrages ouverts**, pas des
  décisions figées : elles sont à valider avec l'équipe avant d'être matérialisées.

## Points ouverts à trancher

| Point | État |
|---|---|
| `applications.source_token_id` → `source_token` (hors figure) | **pendant** — soit 3ᵉ figure MPD, soit colonne transverse assumée. Actuellement : colonne transverse documentée |
| Unicité `applications (form_version_id, candidate_email)` | **à valider** — le MLD ne porte aucune unicité |
| Suppression d'un `user` (règle 4) | `SET NULL` sur les liens optionnels, `CASCADE` sur `interview_evaluator` (l'évaluateur n'existe pas hors entretien), `RESTRICT` sur `campaigns.creator_id` (une campagne a besoin de son créateur) |
| Dénormalisation `applications` (règle 9) | **à valider** — arbitrage performance / cohérence de données |
| `search_string` (règle 7) | **optionnel** — index FULLTEXT, pertinent seulement si la recherche plein texte est une fonctionnalité réelle |

## Références

- Règles : `plans/rules/regles_mpd.md`
- Plan d'implémentation : `plans/implementations/20260928_passage_mld_mpd.md`
- Figures : `src/diagrams/nouveau/mpd/campagnes_candidatures.ts`,
  `src/diagrams/nouveau/mpd/entretiens_utilisateurs.ts`
- Entités hors-scope : `plans/audit/20260819_hors_scope_mcd.md`
