# Livrable H — Analyse par sous-systèmes (cross-cutting)

**Date :** 2026-05-11
**Statut :** ✅ Complet

> Analyse des 9 sous-systèmes transverses du quizapp.

---

## H.1 — Sous-système : Authentification & JWT

### Acteurs
- BACK : `AuthController`, `SecurityConfig`, `JwtService`, `UserDetailsService`.
- FRONT : `auth.service.ts`, `authGuard`, `permissionGuard`, intercepteur HTTP.

### État
- [x] 🟢 **OK** : Spring Security configuré ; JWT généré + refresh + verify-token.
- [ ] 🔴 **INCOHÉRENT [BACK]** : nom de rôle entre enum (`SUPER`) et `@PreAuthorize('SUPER_ADMIN')`. Vérifier mapping.
- [ ] 🔴 **INCOHÉRENT [FRONT]** : `UserRole` FRONT contient `UTILISATEUR` (FR) au lieu de `RECRUITER`.
- [ ] 🔵 **[BACK — auth]** : durée de vie JWT, rotation des secrets, expiration refresh — à confirmer dans `application.properties`.

---

## H.2 — Sous-système : Permissions

### Acteurs
- BD : `system_role_permission`, `business_group`, `business_group_permission`, `user_business_group`, `user_permission_override`, `entity_permission`.
- BACK : `FunctionalityEnum` (~152 valeurs), `PermissionService`, `EntityPermissionBusiness`, `@PreAuthorize`.
- FRONT : `permissions.constants.ts`, `permissionGuard`, `*.directive.ts` éventuelles.

### Modèle de calcul de permissions
1. `system_role_permission` (rôle système) — base.
2. `business_group_permission` (groupe) — peut affiner par `business_group`.
3. `user_business_group` — rattache user à groupe.
4. `user_permission_override` — override individuel (GRANT / DENY).
5. `entity_permission` — permission par entité spécifique (row-level).

### État
- [x] 🟢 **OK** : modèle de permissions présent à tous les niveaux.
- [ ] 🔴 **INCOHÉRENT [FRONT]** : routes `/dashboard/entities/*` toutes gardées par `MANAGE_APP_CONFIG` — trop large.
- [ ] 🔵 **[FULL-STACK — permissions]** : confirmer que `EntityPermission` est bien vérifié dans **chaque** Business (pas seulement ceux avec `@PreAuthorize`).
- [ ] 🔵 **[BACK — permissions]** : auditer l'ordre d'évaluation : override > group > role > entity-level.
- [ ] 🔵 **[FRONT — permissions]** : utiliser directives de masquage UI partout où une permission est requise (cacher boutons selon perm).

---

## H.3 — Sous-système : Notifications

### Acteurs
- BD : `notifications` (avec polymorphisme `object_table_name` + `object_table_id`), `notif_user`.
- BACK : `NotificationsBusiness`, `NotificationsController`, `WebSocketConfig` (probable push).
- FRONT : `notification.service.ts`.

### État
- [ ] 🔴 **MANQUANT [FRONT — UI]** : pas de page **feed des notifications** côté utilisateur (`/dashboard/notifications`).
- [ ] 🔴 **INCOHÉRENT [FULL-STACK]** : URL `/notification/markAsRead` (FRONT singulier) vs `/notifications/markRead` (BACK pluriel) — à confirmer.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `Notifications.notifType` (varchar(100)) sans enum Java — risque de typos.
- [ ] 🟡 **À AUDITER [FULL-STACK]** : push WebSocket réellement actif ? Sinon polling. Configuration `WebSocketConfig` à valider.
- [ ] 🔵 **[BACK — notif]** : documenter le schéma de `object_table_name` / `object_table_id` (quelles tables peuvent être référencées).

---

## H.4 — Sous-système : Emails

### Acteurs
- BD : `email_template`, `email_template_preset`, `smtp_config`, `email_verification_tokens`.
- BACK : `EmailBusiness`, `EmailTemplateBusiness`, `EmailTemplatePresetBusiness`, `EmailOperationalAlertService`, `EmailVerificationTokenBusiness`, `MailConfig`, `ThymeleafConfig`.
- FRONT : `email-template.service.ts`, `email-editor` page.

### Modèle d'envoi
- Templates Thymeleaf typés par `EmailActionType` (APPLICATION_VERIFICATION, PASSWORD_RESET, etc.).
- SMTP configuré dynamiquement via `smtp_config` (override de la conf statique ?).
- Presets visuels pour faciliter l'édition.

### État
- [x] 🟢 **OK** : 9 valeurs `EmailActionType` couvrent les cas métier.
- [x] 🟢 **OK** : `/smtpConfig/testConnection` permet de tester la conf SMTP.
- [ ] 🔴 **MANQUANT [FRONT — page]** : page `email-template-presets`.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `EmailTemplatePresetCategory` (15 valeurs BD documentées, pas reflété Java).
- [ ] 🔴 **OWASP A03 (Injection)** : Thymeleaf — vérifier escape XSS pour les variables candidat (`{{ candidate.name }}`).
- [ ] 🔵 **[FULL-STACK — email]** : flags `pre_screen_decision_mail_sent` / `final_decision_mail_sent` — qui les positionne ? UI permet de "renvoyer" ?

---

## H.5 — Sous-système : Tokens / liens publics

### Acteurs
- BD : `candidate_token`, `source_token`, `invitation_code`, `email_verification_tokens`.
- BACK : `CandidateTokenBusiness`, `SourceTokenBusiness`, `InvitationCodeBusiness`, `EmailVerificationTokenBusiness`.
- FRONT : `track-application` page (candidate_token), source-token guards.

### État
- [x] 🟢 **OK** : 4 mécanismes de tokens distincts, chacun pour son usage.
- [ ] 🔴 **MANQUANT [FRONT — page]** : `/dashboard/source-tokens` (recruteur génère + suit).
- [ ] 🔴 **MANQUANT [FRONT — page]** : `/dashboard/invitation-codes` métier (admin génère codes recruteurs).
- [ ] 🔴 **OWASP A07 (Identification & Auth Failures)** : `quiz_token` — vérifier :
  - Génération CSPRNG (`SecureRandom`) et non `Random`.
  - Longueur ≥ 16 bytes.
  - Anti-rejeu (validité limitée + invalidation).
  - Rate-limiting brute-force.
- [ ] 🔵 **[BACK — token]** : `application.timer_lock_expires_at` — empêche bien la reprise après expiration ?

---

## H.6 — Sous-système : Pipeline & progression candidat

### Acteurs
- BD : `pipeline_template`, `pipeline_stage`, `application_progress`.
- BACK : `PipelineTemplateBusiness`, `PipelineStageBusiness`, `ApplicationProgressBusiness`, custom endpoints (advance/fail/skip/rollback).
- FRONT : `pipeline-templates`, `pipeline-template-edit`, `application-progress.service.ts`.

### État
- [x] 🟢 **OK** : modèle complet (template → stages → progression candidat).
- [x] 🟢 **OK** : endpoints transitions (advance/fail/skip/rollback) bien isolés.
- [ ] 🟠 **DIVERGENT [FULL-STACK]** : `StageType` BACK (6 valeurs) ≠ FRONT (8 valeurs). À aligner urgemment.
- [ ] 🟠 **INCOMPLET [BACK — enum]** : `ProgressStatus` ne contient pas `PENDING` (valeur par défaut BD).
- [ ] 🔵 **[BACK — pipeline]** : valider les transitions autorisées (state machine) — empêcher rollback si déjà décidé final.
- [ ] 🔵 **[FULL-STACK — pipeline]** : documenter `pipeline_stage.config_json` par `stage_type`.

---

## H.7 — Sous-système : Quiz / Évaluations

### Acteurs
- BD : `applications` (quiz_*), `candidate_answer`, `question`, `answer`, `form`, `form_version`, `form_questions`, `evaluations`.
- BACK : flow `/applications/{get-quiz, save-quiz-answer, complete-quiz, touch-quiz}`, `EvaluationsBusiness`.
- FRONT : page candidat quiz (publique), `/dashboard/questions`, `/dashboard/evaluations`.

### État
- [x] 🟢 **OK** : flow quiz candidat complet.
- [x] 🟢 **OK** : versionning formulaires + lock/publish.
- [ ] 🔴 **MANQUANT [FRONT — page]** : pages métier `forms`, `form-versions`, `form-questions`, `manual-correction`.
- [ ] 🟠 **INCOMPLET [BACK — enum]** : `ManualCorrectionStatus` ne contient pas `NOT_REQUIRED`.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `DifficultyLevel` (Question), pas d'enum Java.
- [ ] 🔵 **[BACK — quiz]** : algorithme de scoring documenté ? `evaluations` agrège comment ?
- [ ] 🔵 **[BACK — quiz]** : `form_questions.chrono_override` — semantics ?

---

## H.8 — Sous-système : Entretiens

### Acteurs
- BD : `interviews`, `candidate_interview`, `interview_participant`.
- BACK : `InterviewsBusiness`, `CandidateInterviewBusiness`, `InterviewParticipantBusiness`, endpoints `/interviews/schedule` + `/evaluate`.
- FRONT : `/dashboard/interviews`, `/dashboard/interview-create`.

### État
- [x] 🟢 **OK** : modèle 3 niveaux (entretien → candidat-entretien → participants).
- [x] 🟢 **OK** : flag `all_can_evaluate` campaign + `can_evaluate` participant pour gérer la matrice d'évaluation.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `InterviewStatus` + `InterviewType` (varchar BD sans enum Java).
- [ ] 🟠 **INCOMPLET [BACK — business]** : `InterviewParticipantBusiness` manque `updateAll`, `getAllByCriteria`, `getFullInfos`.
- [ ] 🔵 **[FULL-STACK — interview]** : `InterviewResponseAction` (FRONT) — endpoint BACK existe ?
- [ ] 🔵 **[BACK — interview]** : pings online (`is_online`, `last_ping_at`) — déclenchement WebSocket ?

---

## H.9 — Sous-système : Configuration applicative

### Acteurs
- BD : `app_config`, `legal_text`, `smtp_config`.
- BACK : `AppConfigBusiness`, `LegalTextBusiness`, `SmtpConfigBusiness`.
- FRONT : `/dashboard/settings`.

### État
- [x] 🟢 **OK** : page settings centralisée.
- [ ] 🟠 **INCOMPLET [BACK — business]** : `AppConfigBusiness` manque méthodes standards (mais le pattern n'a peut-être pas de sens pour un singleton — *À CONFIRMER*).
- [ ] 🔵 **[FULL-STACK — config]** : éditeur de `legal_text` versionné côté UI ?
- [ ] 🔵 **[FULL-STACK — config]** : `app_config.candidate_accounts_enabled` — fonctionnalité activée ?
- [ ] 🔵 **[FULL-STACK — config]** : `app_config.theme_mode` (light/dark/auto) — UI permet le choix ?

---

## H.10 — Synthèse sous-systèmes

| # | Sous-système | Sévérité | Priorité |
|---|---|---|:-:|
| Notifications | Page UI absente, URL divergence | 🔴 | P1 |
| Permissions | Routes trop larges, ordre éval à valider | 🟠 | P1 |
| Auth/JWT | Naming rôles incohérent | 🟠 | P1 |
| Emails | Page presets absente, enum manquant | 🟠 | P2 |
| Quiz/Évaluations | Pages forms/versions absentes | 🔴 | P1 |
| Pipeline | Divergence enum StageType | 🟠 | P1 |
| Entretiens | Enums manquants, business incomplet | 🟠 | P2 |
| Tokens | Pages source/invitation absentes, audit sécurité | 🔴 | P1 |
| Config | Mineur | 🔵 | P3 |
