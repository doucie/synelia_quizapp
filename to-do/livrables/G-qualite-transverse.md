# Livrable G — Qualité transverse et résidus

**Date :** 2026-05-11
**Statut :** ✅ Complet

> Détecte les résidus (colonnes mortes, anciennes refs), conventions techniques, hygiène.

---

## G.1 — Colonnes BD potentiellement mortes / sous-utilisées

> *À auditer par grep sur le code BACK + FRONT.*

- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `applications.search_string` — toutes les tables ont cette colonne mais aucune mention claire de son population systématique. *Hypothèse : utilisée pour recherche full-text, à confirmer.*
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `applications.quiz_level` — usage ? affichage ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `applications.application_abandoned` — déclenchement automatique ? UI ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `applications.pre_screen_decision_mail_sent` / `final_decision_mail_sent` — usage ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `campaigns.is_timed` — affiché dans l'UI campaign-form ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `campaigns.max_apply` — limite appliquée backend ? affichée UI ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `campaign_crud.follow` / `is_admin` / `is_creator` / `can_planify` / `can_accept_pre_screen` / `can_accept_final` — toutes ces colonnes sont-elles éditables UI ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `interview_participant.is_online` / `has_finished` / `last_ping_at` — mécanisme online utilisé partout ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `notifications.object_table_name` / `object_table_id` — référence polymorphique. Schéma documenté ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `pipeline_stage.config_json` — schéma JSON documenté par `stage_type` ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `question.question_ref` — UUID ; utilisé pour quoi ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `user.admin_mode` — UI permet de l'activer ? sur quels écrans il a effet ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `user.page_size_preference` — pris en compte sur tous les tableaux ?
- [ ] 🟡 **À AUDITER [BD/BACK/FRONT]** : `app_config.color_scheme` (`violet`) vs `primary_color` (`#7C3AED`) — redondants ou complémentaires ?

---

## G.2 — Incohérences de typage

- [ ] 🟠 **DIVERGENT [BD]** : `is_deleted` parfois `tinyint(1)`, parfois `bit(1)` — à harmoniser.
- [ ] 🟠 **DIVERGENT [BD]** : `created_by` / `updated_by` parfois `int`, parfois `int unsigned` — à harmoniser.
- [ ] 🟠 **DIVERGENT [BD]** : `created_at` / `updated_at` parfois `datetime`, parfois `timestamp` — à clarifier.
- [ ] 🟠 **DIVERGENT [BD vs BACK]** : type Java `Boolean` vs `bit(1)` MySQL — Hibernate gère mais à vérifier sur les colonnes `bit(1)` not null.

---

## G.3 — Conventions code

### Backend
- [x] 🟢 **OK** : structure paquetage `dao.entity` / `dao.repository` / `dao.dto` / `business` / `controller`.
- [ ] 🔵 **[BACK — convention]** : harmoniser le pluriel/singulier des noms d'entités (`Decision` vs `Decisions`, `Interview` vs `Interviews`, `Notification` vs `Notifications`, etc. — actuellement les entités utilisent les noms de tables SQL pluriels). Décider d'une convention claire.
- [ ] 🔵 **[BACK — convention]** : suppression des entités/DAO Telosys non utilisées dans `TelosysTools/`.

### Frontend
- [ ] 🟠 **[FRONT — convention]** : `source-token.service.ts` est sous `src/app/services/` (pas `core/services/`).
- [ ] 🟠 **[FRONT — convention]** : models métier dispersés dans les services au lieu de `core/models/`.
- [ ] 🟠 **[FRONT — convention]** : enums dispersés inline au lieu de `core/enums/`.
- [ ] 🟠 **[FRONT — convention]** : 3 couleurs hardcodées en SCSS (cf. C.8).
- [ ] 🔵 **[FRONT — convention]** : naming inconsistant (`interview-participant.service.ts` vs `candidate-interview-entity.service.ts`).
- [ ] 🔵 **[FRONT — convention]** : doublon potentiel `entity-permission.service.ts` (deux implémentations détectées par subagent).

---

## G.4 — Migrations Flyway

- [ ] 🟡 **À AUDITER [BACK — migration]** : V1_034 absent (V1_033, V1_035, V1_036 présents) — vérifier intentionnel.
- [ ] 🔵 **[BACK — migration]** : extraire la liste des `DROP COLUMN` / `RENAME COLUMN` pour détecter colonnes mortes que le code utiliserait encore.

---

## G.5 — Tests

> *Non couvert par les subagents — section à compléter par audit ciblé.*

- [ ] 🔵 **[BACK — test]** : auditer `quizapp/src/test/` — couverture des Business et Controllers ?
- [ ] 🔵 **[FRONT — test]** : auditer `quizapp_front/src/**/*.spec.ts` — couverture des services et composants ?

---

## G.6 — Performance / N+1

> *À auditer par lecture des Business critiques.*

- [ ] 🔵 **[BACK — perf]** : auditer N+1 sur les endpoints les plus appelés (`/applications/getByCriteria`, `/campaigns/getAllByCriteria`, `/notifications/getAllByCriteria`).
- [ ] 🔵 **[BACK — perf]** : confirmer présence d'index sur les colonnes critiques (`applications.candidate_email`, `applications.quiz_token`, `application_progress.application_id`, etc.).
- [ ] 🔵 **[BACK — perf]** : `CacheConfig` — vérifier qu'il est effectivement utilisé sur les queries lourdes (config, permissions, templates).

---

## G.7 — i18n / accessibilité

- [ ] 🔵 **[FRONT — i18n]** : application probablement en français uniquement. Vérifier qu'il n'y a pas de strings hardcodées qui devraient passer par un service de traduction.
- [ ] 🔵 **[FRONT — a11y]** : audit ARIA / contrastes / navigation clavier sur pages critiques.

---

## G.8 — Synthèse hygiène

### Priorité 1
1. Harmoniser typage BD (`is_deleted`, `*_by`, `*_at`).
2. Réorganiser code FRONT : `core/models/`, `core/enums/`, déplacer `source-token.service.ts`.
3. Documenter schéma `pipeline_stage.config_json` par `stage_type`.

### Priorité 2
4. Supprimer entités/code mort Telosys non utilisé.
5. Auditer colonnes BD listées en G.1.
6. Auditer migration V1_034 manquante.

### Priorité 3
7. Couverture tests à mesurer.
8. Audit perf + N+1.
9. Audit a11y / i18n.
