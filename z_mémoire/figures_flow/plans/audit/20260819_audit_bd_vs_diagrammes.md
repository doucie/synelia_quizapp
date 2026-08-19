# Audit — Écart BD réelle vs Diagrammes figures_flow

> Fichier de référence : `quizapp_db_described_20260818.md`
> Date de l'audit : 18 août 2026

---

## Résumé

| Catégorie | Nombre |
|-----------|--------|
| Tables entièrement absentes des diagrammes | 9 |
| Entités existantes avec colonnes manquantes | 20 |
| Erreurs structurelles (FK fantôme, mauvais liens) | 4 |
| Colonnes manquantes au total | ~130 |

---

## 1. Tables entièrement ABSENTES

Ces tables existent dans la BD mais n'ont aucune entité dans les diagrammes MCD/MLD/MPD.

### 1.1 `candidate_token` — Domaine : Candidature & Quiz

| Colonne | Type | PK | FK |
|---------|------|----|----|
| id | int unsigned | PRI | |
| token_string | varchar(6) | | |
| application_id | int unsigned | | MUL → applications |

> **Impact** : Absent des 3 diagrammes candidature_quiz (MCD, MLD, MPD).
> **Lien** : `candidate_token.application_id` → `applications.id`

### 1.2 `email_template` — Domaine : Notifications

| Colonne | Type | PK | FK |
|---------|------|----|----|
| id | int unsigned | PRI | |
| template_key | varchar(50) | UNI | |
| subject_template | varchar(500) | | |
| body_template | text | | |
| editable_variables_json | text | | |
| description | varchar(500) | | |
| available_variables | text | | |
| action_type | varchar(50) | MUL | |
| preset_id | int | | |
| is_active | bit(1) | | |

> **Impact** : Absent des 3 diagrammes audit_notifications.

### 1.3 `email_template_preset` — Domaine : Notifications

| Colonne | Type | PK | FK |
|---------|------|----|----|
| id | int | PRI | |
| name | varchar(100) | | |
| category | enum(...) | | |
| html_structure | text | | |
| preview_image | varchar(500) | | |
| description | varchar(500) | | |

> **Impact** : Absent des 3 diagrammes audit_notifications.

### 1.4 `legal_text` — Domaine : Config

| Colonne | Type | PK | FK |
|---------|------|----|----|
| id | int unsigned | PRI | |
| text_key | varchar(50) | UNI | |
| title | varchar(255) | | |
| content | text | | |
| description | varchar(500) | | |
| is_active | bit(1) | | |

> **Impact** : Non modélisé dans aucun diagramme. À placer dans un domaine "Config" ou "Audit".

### 1.5 `smtp_config` — Domaine : Config

| Colonne | Type | PK | FK |
|---------|------|----|----|
| id | int unsigned | PRI | |
| host | varchar(255) | | |
| port | int | | |
| username | varchar(255) | | |
| password_encrypted | varchar(500) | | |
| smtp_auth | bit(1) | | |
| starttls_enable | bit(1) | | |
| starttls_required | bit(1) | | |
| connection_timeout | int | | |
| timeout | int | | |
| write_timeout | int | | |
| sender_name | varchar(255) | | |
| sender_email | varchar(255) | | |
| is_active | bit(1) | | |

> **Impact** : Non modélisé dans aucun diagramme.

### 1.6 `quiz_anti_cheat_event` — Domaine : Candidature & Quiz

| Colonne | Type | PK | FK |
|---------|------|----|----|
| id | int unsigned | PRI | |
| application_quiz_attempt_id | int unsigned | MUL | → application_quiz_attempt |
| event_type | varchar(30) | | |
| occurred_at | datetime | | |
| metadata | varchar(500) | | |

> **Impact** : Absent des 3 diagrammes candidature_quiz.
> **Lien** : `quiz_anti_cheat_event.application_quiz_attempt_id` → `application_quiz_attempt.id`

### 1.7 `group_change_request` — Domaine : Permissions

| Colonne | Type | PK | FK |
|---------|------|----|----|
| id | int | PRI | |
| user_id | int unsigned | MUL | → user |
| target_group_id | int | MUL | → business_group |
| reason | text | | |
| status | enum('PENDING','APPROVED','REJECTED') | | |
| requested_at | timestamp | | |
| processed_at | timestamp | | |
| processed_by | int unsigned | MUL | → user |

> **Impact** : Absent des 3 diagrammes identite_permissions.

### 1.8 `user_permission_override` — Domaine : Permissions

| Colonne | Type | PK | FK |
|---------|------|----|----|
| id | int | PRI | |
| user_id | int unsigned | MUL | → user |
| functionality | varchar(100) | | |
| is_allowed | tinyint(1) | | |

> **Impact** : Absent des 3 diagrammes identite_permissions.

### 1.9 `invitation_code` — Domaine : Permissions

| Colonne | Type | PK | FK |
|---------|------|----|----|
| id | bigint | PRI | |
| email | varchar(255) | MUL | |
| role | varchar(30) | | |
| code | varchar(50) | UNI | |
| is_used | bit(1) | | |
| expired_at | datetime | MUL | |
| created_by | int unsigned | MUL | → user |

> **Impact** : Absent des 3 diagrammes identite_permissions.

---

## 2. Colonnes manquantes par entité

### 2.1 `campaigns` — manque 10 colonnes

**Fichiers impactés** : `mld/campagnes_pipeline.ts`, `mpd/campagnes_pipeline.ts`, `mcd/campagnes_pipeline.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| campaign_desc | text | Description de la campagne |
| is_published | tinyint(1) | **Ajouté chantier 480** — cycle de vie auto |
| is_archived | tinyint(1) | Archivage |
| all_can_evaluate | tinyint(1) | Tous les recruteurs peuvent évaluer |
| total_questions | int | Nombre total de questions |
| time_all_forms | tinyint(1) | Chronométrage global |
| anti_cheat_enabled | tinyint(1) | Anti-triche activé |
| form_assignment_strategy | varchar(30) | Stratégie d'assignation des formulaires |
| form_assignment_exhaustion_policy | varchar(20) | Politique d'épuisement |
| speciality_id | int unsigned | FK → specialities |

> Le MCD a `chronométrée` qui mappe `is_timed` — OK.
> Le MLD et MPD n'ont pas `is_archived`, `is_published`, etc.

### 2.2 `applications` — manque 15 colonnes

**Fichiers impactés** : `mld/candidature_quiz.ts`, `mpd/candidature_quiz.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| email_verified | tinyint(1) | Email vérifié |
| candidate_birth_date | date | Date de naissance |
| current_interview_evaluation_score | int | Pointeur courant |
| current_interview_evaluation_number | int | Pointeur courant |
| current_interview_evaluation_percentage | double | Pointeur courant |
| current_preselection_decision_type | varchar(50) | Pointeur courant |
| current_preselection_decision_date | datetime | Pointeur courant |
| current_final_decision_type | varchar(50) | Pointeur courant |
| current_final_decision_date | datetime | Pointeur courant |
| current_pipeline_stage_type | varchar(50) | Pointeur courant |
| current_pipeline_stage_label | varchar(255) | Pointeur courant |
| current_pipeline_progress_status | varchar(20) | Pointeur courant |
| application_abandoned | tinyint(1) | Abandon |
| abandoned_at | datetime | Date d'abandon |
| abandon_reason | text | Raison d'abandon |
| abandoned_from_application_progress_id | int unsigned | FK |
| aggregated_quiz_score | double | Score agrégé quiz |
| aggregated_quiz_score_percent | double | % agrégé quiz |
| aggregated_evaluation_score | double | Score agrégé évaluation |
| aggregated_evaluation_score_percent | double | % agrégé évaluation |
| last_progressed_at | datetime | Dernière progression |

> Le MCD candidature est très simplifié (nom, prénom, email, téléphone, cv, lettre) — il manque aussi `candidate_birth_date` et `email_verified` au MCD.

### 2.3 `application_progress` — manque 9 colonnes

**Fichiers impactés** : `mld/candidature_quiz.ts`, `mpd/candidature_quiz.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| notes | text | Notes |
| validated_at | datetime | Validation |
| validated_by | int unsigned | FK → user |
| validation_comment | text | Commentaire validation |
| skipped_at | datetime | Saut |
| skipped_by | int unsigned | FK → user |
| skip_reason | text | Raison du saut |
| reopened_at | datetime | Réouverture |
| reopened_by | int unsigned | FK → user |
| reopen_reason | text | Raison réouverture |

### 2.4 `application_quiz_attempt` — manque 14 colonnes

**Fichiers impactés** : `mld/candidature_quiz.ts`, `mpd/candidature_quiz.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| screening_mode | varchar(30) | Mode de screening |
| screening_threshold | double | Seuil de screening |
| screening_result | varchar(30) | Résultat screening |
| tab_switch_count | int unsigned | **Anti-triche** — changements d'onglet |
| fullscreen_exit_count | int unsigned | **Anti-triche** — sorties plein écran |
| cheat_flag_count | int unsigned | **Anti-triche** — drapeaux |
| manual_correction_status | varchar(20) | Correction manuelle |
| total_questions | int | Total questions |
| time_elapsed | int | Temps écoulé |
| timed_snapshot | tinyint(1) | Snapshot chronométré |
| total_time_allowed_snapshot | int | Temps total autorisé snapshot |
| last_activity_at | datetime | Dernière activité |
| started_at | datetime | Début |
| completed_at | datetime | Fin |

### 2.5 `interviews` — manque 10 colonnes + FK fantôme

**Fichiers impactés** : `mld/entretien_evaluation.ts`, `mpd/entretien_evaluation.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| evaluation_room_code | varchar(8) | Code salle d'évaluation |
| interview_note | text | Notes d'entretien |
| started_at | datetime | Début entretien |
| ended_at | datetime | Fin entretien |
| evaluation_completed_at | datetime | Évaluation terminée |
| evaluation_completed_by | int unsigned | FK → user |
| closed_at | datetime | Fermeture |
| closed_by | int unsigned | FK → user |
| closure_comment | text | Commentaire fermeture |

**Erreur** : Le MLD/MPD ont `campaign_id` FK → `campaigns`. **Cette colonne n'existe pas dans la BD réelle.** La FK correcte est `application_progress_id` (déjà présente).

### 2.6 `interview_participant` — manque 7 colonnes

**Fichiers impactés** : `mld/entretien_evaluation.ts`, `mpd/entretien_evaluation.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| can_delete | tinyint(1) | Permission suppression |
| is_admin | tinyint(1) | Administrateur entretien |
| follow | tinyint(1) | Suit l'entretien |
| is_online | tinyint(1) | En ligne |
| has_finished | tinyint(1) | A terminé |
| evaluation_submitted_at | datetime | Soumission évaluation |
| last_ping_at | datetime | Dernier ping |

### 2.7 `candidate_interview` — manque 3 colonnes

**Fichiers impactés** : `mld/entretien_evaluation.ts`, `mpd/entretien_evaluation.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| interview_duration | int | Durée |
| responded_at | datetime | Date de réponse |
| alternative_date_requested | datetime | Demande de nouvelle date |

### 2.8 `evaluations` — manque 3 colonnes

**Fichiers impactés** : `mld/entretien_evaluation.ts`, `mpd/entretien_evaluation.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| validated_at | datetime | Validation |
| validated_by | int unsigned | FK → user |
| global_comment | text | Commentaire global |

### 2.9 `evaluation_item` — manque 2 colonnes

**Fichiers impactés** : `mld/entretien_evaluation.ts`, `mpd/entretien_evaluation.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| max_score_snapshot | double | Snapshot score max |
| evaluation_grid_template_item_id | int unsigned | FK → evaluation_grid_template_item |

### 2.10 `decisions` — manque 2 colonnes

**Fichiers impactés** : `mld/candidature_quiz.ts`, `mpd/candidature_quiz.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| decision_mode | varchar(20) | Mode (STANDARD, CANCELLATION) |
| cancels_decision_id | int unsigned | FK → decisions (auto-référence) |

### 2.11 `candidate_answer` — manque 5 colonnes

**Fichiers impactés** : `mld/candidature_quiz.ts`, `mpd/candidature_quiz.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| manual_is_correct | tinyint(1) | Correction manuelle |
| manual_correction_comment | text | Commentaire correction |
| manual_correction_score | int | Score correction |
| manual_corrected_at | timestamp | Date correction |
| manual_corrected_by | int | FK → user |

### 2.12 `candidate_ask` — manque 5 colonnes

**Fichiers impactés** : `mld/candidature_quiz.ts`, `mpd/candidature_quiz.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| is_verified | tinyint(1) | Vérifié |
| first_name | varchar(100) | Prénom |
| last_name | varchar(100) | Nom |
| new_phone | varchar(20) | Nouveau téléphone |
| decision_reason | varchar(500) | Raison décision |

### 2.13 `pipeline_stage` — manque 3 colonnes

**Fichiers impactés** : `mld/campagnes_pipeline.ts`, `mpd/campagnes_pipeline.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| is_active | bit(1) | Étape active |
| evaluation_grid_template_version_id | int unsigned | FK → evaluation_grid_template_version |
| active_slot | int | Slot actif |

### 2.14 `pipeline_stage_notification_rule` — manque 3 colonnes

**Fichiers impactés** : `mld/campagnes_pipeline.ts`, `mpd/campagnes_pipeline.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| outcome_code | varchar(80) | Code résultat |
| email_template_id | int unsigned | FK → email_template |
| requires_manual_confirmation | tinyint(1) | Confirmation manuelle requise |

### 2.15 `question` — manque 7 colonnes

**Fichiers impactés** : `mld/campagnes_pipeline.ts`, `mpd/campagnes_pipeline.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| question_ref | varchar(36) | Référence |
| question_chrono | int | Chronomètre (défaut 10) |
| difficulty_level | varchar(20) | Niveau de difficulté |
| speciality_id | int unsigned | FK → specialities |
| all_answers_justification_required | bit(1) | Justification requise |
| manual_correction_required | bit(1) | Correction manuelle requise |
| free_text_response_placeholder | varchar(255) | Placeholder texte libre |

### 2.16 `answer` — manque 4 colonnes

**Fichiers impactés** : `mld/campagnes_pipeline.ts`, `mpd/campagnes_pipeline.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| answer_type | varchar(20) | Type de réponse (défaut TEXT) |
| allow_additional_comment | tinyint(1) | Commentaire additionnel autorisé |
| additional_comment_required | tinyint(1) | Commentaire obligatoire |
| additional_comment_placeholder | varchar(255) | Placeholder |

### 2.17 `source_token` — manque 3 colonnes

**Fichiers impactés** : `mld/campagnes_pipeline.ts`, `mpd/campagnes_pipeline.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| source_token_name | varchar(100) | Nom du token |
| form_id | int unsigned | FK → form |
| is_public | tinyint(1) | Token public |

### 2.18 `form_version` — manque 1 colonne

**Fichiers impactés** : `mld/campagnes_pipeline.ts`, `mpd/campagnes_pipeline.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| published_form_id | int unsigned | UNI — formulaire publié associé |

### 2.19 `user` — manque 8 colonnes

**Fichiers impactés** : `mld/identite_permissions.ts`, `mpd/identite_permissions.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| phone | varchar(20) | Téléphone |
| password | varchar(255) | Mot de passe |
| is_default_password | tinyint(1) | Mot de passe par défaut |
| is_online | tinyint(1) | En ligne |
| is_locked | tinyint(1) | Verrouillé |
| last_connection_date | datetime | Dernière connexion |
| admin_mode | tinyint(1) | Mode admin |
| page_size_preference | int | Préférence pagination |

### 2.20 `audit_event` — manque 5 colonnes

**Fichiers impactés** : `mld/audit_notifications.ts`, `mpd/audit_notifications.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| application_id | int unsigned | FK → applications |
| application_progress_id | int unsigned | FK → application_progress |
| actor_user_id | int unsigned | FK → user |
| justification | text | Justification |
| before_state_json | longtext | État avant |
| after_state_json | longtext | État après |

### 2.21 `mail_log` — manque 14 colonnes

**Fichiers impactés** : `mld/audit_notifications.ts`, `mpd/audit_notifications.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| application_id | int unsigned | FK → applications |
| application_progress_id | int unsigned | FK → application_progress |
| interview_id | int unsigned | FK → interviews |
| decision_id | int unsigned | FK → decisions |
| notification_rule_id | int unsigned | FK → pipeline_stage_notification_rule |
| requires_confirmation | tinyint(1) | Confirmation requise |
| confirmed_at | datetime | Date confirmation |
| confirmed_by | int unsigned | FK → user |
| recipient_user_id | int unsigned | FK → user |
| sender_user_id | int unsigned | FK → user |
| email_template_id | int unsigned | FK → email_template |
| body_preview | text | Aperçu du corps |
| error_message | text | Message d'erreur |
| sent_at | datetime | Date d'envoi |

### 2.22 `notifications` — manque 2 colonnes

**Fichiers impactés** : `mld/audit_notifications.ts`, `mpd/audit_notifications.ts`

| Colonne manquante | Type | Notes |
|-------------------|------|-------|
| notif_actor | int | Acteur |
| user_id | int unsigned | FK → user |

---

## 3. Erreurs structurelles

### 3.1 FK fantôme : `interviews.campaign_id`

**Fichiers** : `mld/entretien_evaluation.ts` (ligne 19), `mpd/entretien_evaluation.ts`

Le MLD/MPD affichent une colonne `campaign_id` FK → `campaigns` sur la table `interviews`. **Cette colonne n'existe pas dans la BD réelle.** La seule FK de `interviews` vers le pipeline est `application_progress_id` (déjà présente).

**Action** : Supprimer `campaign_id` des diagrammes MLD et MPD entretien_evaluation.

### 3.2 Entité manquante : `evaluation_grid_template_version`

Le système de versioning des grilles d'évaluation (`evaluation_grid_template` → `evaluation_grid_template_version` → `evaluation_grid_template_item`) n'est pas modélisé.

La BD a :
- `evaluation_grid_template` (template_name, template_desc, is_active)
- `evaluation_grid_template_version` (version_number, version_label, is_published, published_at, content_hash, locked_at)
- `evaluation_grid_template_item` (criterion_order, label, criterion_type, max_score, weight, is_required, config_json)

Les diagrammes ont :
- `grille_evaluation` avec `libellé` et `version_courante` — **incomplet et erroné** (pas de `version_courante` dans la BD)
- `critere_etape` liée directement à `pipeline_stage` — **devrait passer par `evaluation_grid_template_version`**

### 3.3 Mauvais lien : `evaluation_item` → `pipeline_stage_criterion`

Le MLD/MPD ont `evaluation_item.criterion_id` FK → `pipeline_stage_criterion`. Dans la BD réelle, la FK est `evaluation_grid_template_item_id` → `evaluation_grid_template_item.id`.

Le nom `pipeline_stage_criterion` est incorrect — l'entité s'appelle `evaluation_grid_template_item` dans la BD.

### 3.4 `evaluation_grid` ≠ `evaluation_grid_template`

Le nom `grille_evaluation` / `evaluation_grid` ne correspond pas à `evaluation_grid_template`. Les colonnes affichées (`name`, `description`, `is_active`) sont approximatives — les vraies colonnes sont `template_name`, `template_desc`, `is_active`.

---

## 4. Champs MCDconceptuels à ajouter

Le MCD est une abstraction conceptuelle — il ne liste pas toutes les colonnes mais les attributs métier significatifs. Cependant, certains attributs conceptuels importants manquent :

### MCD campagnes_pipeline
- `campagne` : ajouter `max_tentatives`, `est_archivée`, `est_publiée`, `spécialité`
- `etape_pipeline` : ajouter `est_active`, `libellé`
- `reponse_possible` : ajouter `type_réponse`, `commentaire_autorisé`
- `question` : ajouter `difficulté`, `spécialité`, `correction_manuelle`

### MCD candidature_quiz
- `candidature` : ajouter `email_vérifié`, `date_naissance`, `est_abandonnée`
- `tentative_quiz` : ajouter `mode_screening`, `compteurs_anti_triche`, `correction_manuelle`
- `reponse_candidat` : ajouter `correction_manuelle`
- `decision` : ajouter `mode_décision`, `annule_décision`
- `demande_candidat` : ajouter `vérifié`, `prénom`, `nom`, `téléphone`, `raison_décision`

### MCD entretien_evaluation
- `entretien` : ajouter `code_salle`, `notes`, `dates_début_fin`, `fermeture`
- `entretien_candidat` : ajouter `durée`, `date_réponse`, `date_alternative`
- `participant_entretien` : ajouter `est_admin`, `est_en_ligne`, `a_terminé`
- `evaluation` : ajouter `date_validation`, `commentaire`
- `item_evaluation` : ajouter `score_max_instantané`

### MCD identite_permissions
- `utilisateur` : ajouter `téléphone`, `est_en_ligne`, `est_verrouillé`, `dernière_connexion`

### MCD audit_notifications
- `evenement_audit` : ajouter `justification`, `état_avant/après`
- `mail_log` : ajouter `corps_aperçu`, `erreur`, `date_envoi`
- `notification` : ajouter `acteur`, `utilisateur`

---

## 5. Actions par fichier

### MCD (5 fichiers)

| Fichier | Actions |
|---------|---------|
| `mcd/identite_permissions.ts` | Ajouter attributs manquants à `utilisateur`. Entités absentes : `system_role_permission`, `group_change_request`, `user_permission_override`, `invitation_code` — ajouter si souhaité (optionnel au MCD) |
| `mcd/campagnes_pipeline.ts` | Ajouter attributs manquants à `campagne`, `etape_pipeline`, `question`, `reponse_possible`. Ajouter `candidate_token` |
| `mcd/candidature_quiz.ts` | Ajouter attributs manquants à toutes les entités. Ajouter `quiz_anti_cheat_event`, `candidate_token` |
| `mcd/entretien_evaluation.ts` | Ajouter attributs manquants. Ajouter `evaluation_grid_template_version`. Corriger `grille_evaluation` → `grille_modèle_évaluation` |
| `mcd/audit_notifications.ts` | Ajouter attributs manquants. Ajouter `email_template` |

### MLD (5 fichiers)

| Fichier | Actions |
|---------|---------|
| `mld/identite_permissions.ts` | Ajouter colonnes manquantes à `user`. Ajouter `system_role_permission`, `user_permission_override`, `group_change_request`, `invitation_code` |
| `mld/campagnes_pipeline.ts` | Ajouter 10 colonnes à `campaigns`. Ajouter colonnes à `pipeline_stage`, `notification_rule`, `question`, `answer`, `source_token`, `form_version`. Ajouter `evaluation_grid_template`, `evaluation_grid_template_version`, `evaluation_grid_template_item`, `pipeline_stage_notification_rule` (corriger nom). Ajouter FK `speciality_id` |
| `mld/candidature_quiz.ts` | Ajouter 15+ colonnes à `applications`. Ajouter 9 colonnes à `application_progress`. Ajouter 14 colonnes à `quiz_attempt`. Ajouter 5 colonnes à `candidate_answer`. Ajouter 2 colonnes à `decisions`. Ajouter 5 colonnes à `candidate_ask`. Ajouter `candidate_token` |
| `mld/entretien_evaluation.ts` | Supprimer FK fantôme `campaign_id`. Ajouter 10 colonnes à `interviews`. Ajouter 7 colonnes à `interview_participant`. Ajouter 3 colonnes à `candidate_interview`. Ajouter 3 colonnes à `evaluations`. Ajouter 2 colonnes à `evaluation_item`. Corriger `pipeline_stage_criterion` → `evaluation_grid_template_item`. Ajouter `evaluation_grid_template_version`. Corriger `evaluation_grid` → `evaluation_grid_template` |
| `mld/audit_notifications.ts` | Ajouter 5 colonnes à `audit_event`. Ajouter 14 colonnes à `mail_log`. Ajouter 2 colonnes à `notifications`. Ajouter `email_template`, `email_template_preset` |

### MPD (5 fichiers)

Les MPD doivent suivre exactement les mêmes ajouts que les MLD, avec les types SQL en plus.

| Fichier | Actions |
|---------|---------|
| `mpd/identite_permissions.ts` | Idem MLD + types SQL |
| `mpd/campagnes_pipeline.ts` | Idem MLD + types SQL |
| `mpd/candidature_quiz.ts` | Idem MLD + types SQL |
| `mpd/entretien_evaluation.ts` | Idem MLD + types SQL |
| `mpd/audit_notifications.ts` | Idem MLD + types SQL |

---

## 6. Estimation de la charge

| Scope | Fichiers | Entités à ajouter | Colonnes à ajouter |
|-------|----------|-------------------|-------------------|
| MCD | 5 | ~5 | ~40 attributs |
| MLD | 5 | ~10 | ~100 colonnes |
| MPD | 5 | ~10 | ~100 colonnes + types SQL |
| **Total** | **15** | **~15 uniques** | **~130** |
