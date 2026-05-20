# Livrable E — Personas et parcours utilisateurs

**Date :** 2026-05-11
**Statut :** ✅ Complet

> Mappe les 4 personas (super-admin, admin, recruteur, candidat) avec leurs parcours et la couverture front/back actuelle.

---

## E.1 — Persona : SUPER-ADMIN (`UserRole.SUPER`)

### Parcours attendus
1. Configuration plateforme : `app_config`, `smtp_config`, `legal_text`, `email_template`, `email_template_preset`.
2. Gestion utilisateurs et rôles : `user`, `system_role_permission`, `user_permission_override`, `business_group`, `business_group_permission`.
3. Workflow approbations : `group_change_request`.
4. Audit transverse : `entity_permission`.
5. Génération codes d'invitation : `invitation_code`.

### Couverture actuelle
- [x] 🟢 **OK** : `/dashboard/settings` couvre SMTP, legal, config, invitations, emails.
- [x] 🟢 **OK** : `/dashboard/users`, `/dashboard/business-groups`, `/dashboard/system-role-permissions`, `/dashboard/user-permissions`.
- [ ] 🔴 **MANQUANT [FRONT — page]** : page de workflow **`group_change_request`** (PENDING / APPROVED / REJECTED).
- [ ] 🔴 **MANQUANT [FRONT — page]** : page dédiée **`email_template_preset`** (presets visuels).
- [ ] 🔴 **MANQUANT [FRONT — page]** : page **`legal_text`** métier (édition versionnée des textes légaux).
- [ ] 🔵 **[FRONT — page]** : page **`invitation_code`** métier (génération + suivi).

---

## E.2 — Persona : ADMIN

### Parcours attendus
- Idem super-admin sauf : pas de gestion de `smtp_config`, `app_config` complète, ni `system_role_permission` (réservés `SUPER`).
- Gestion campagnes globales : approuver, suivre, modifier.
- Gestion départements / spécialités.

### Couverture actuelle
- [x] 🟢 **OK** : `/dashboard/campaigns`, `/dashboard/departments`, `/dashboard/specialities`.
- [ ] � **À IMPLÉMENTER [FULL-STACK — droits]** : ADMIN/RECRUITER doivent voir `smtp_config` + `app_config` en **lecture seule** (pas de modification ; réservé SUPER). *(cf. J.2 D-009, Z-270)*

---

## E.3 — Persona : RECRUTEUR (`UserRole.RECRUITER` ou `UTILISATEUR`)

### Parcours attendus
1. **Création campagne** : `campaigns/create` + assignation pipeline_template + spécialité + créateur.
2. **Création formulaire** : `form/create` (1 campagne → N forms).
3. **Versionning formulaire** : `form_version/create` + `form_version/publish` + `form_version/lock`.
4. **Sélection questions** : `form_questions/create` + `reorder` + `chrono_override`.
5. **Génération source tokens** : `source_token/create` (lien partageable).
6. **Suivi candidatures** : `applications/getByCriteria` filtré + tri.
7. **Pipeline candidat** : `application_progress/advance|fail|skip|rollback`.
8. **Planification entretien** : `interviews/schedule` + `candidate_interview/create` + `interview_participant/create`.
9. **Évaluation** : `evaluations/create`.
10. **Décision** : `decisions/create` (PRE_SCREEN / FINAL).
11. **Correction manuelle quiz** : `candidate_answer/update` (manual_*).
12. **Gestion demandes candidat** : `candidate_ask` (APPROVE/REJECT).
13. **Réception notifications** : `notifications` feed personnel.

### Couverture actuelle
- [x] 🟢 **OK** : `/dashboard/campaigns`, `/dashboard/campaign-form`, `/dashboard/campaign-detail`.
- [x] 🟢 **OK** : `/dashboard/applications` (filtrage + tri).
- [x] 🟢 **OK** : `/dashboard/interviews`, `/dashboard/interview-create`.
- [x] 🟢 **OK** : `/dashboard/evaluations`, `/dashboard/evaluations-list`.
- [x] 🟢 **OK** : `/dashboard/decisions`.
- [x] 🟢 **OK** : `/dashboard/questions`, `/dashboard/answers`.
- [ ] 🔴 **MANQUANT [FRONT — page]** : **`/dashboard/forms`** (gestion métier des formulaires d'une campagne).
- [ ] 🔴 **MANQUANT [FRONT — page]** : **`/dashboard/form-versions`** (versionning + publish/lock).
- [ ] 🔴 **MANQUANT [FRONT — page]** : **`/dashboard/form-questions`** (sélection + ordre + chrono).
- [ ] 🔴 **MANQUANT [FRONT — page]** : **`/dashboard/source-tokens`** (génération + suivi).
- [ ] 🔴 **MANQUANT [FRONT — page]** : **`/dashboard/manual-correction`** (correction manuelle quiz par recruteur).
- [ ] 🔴 **MANQUANT [FRONT — page]** : **`/dashboard/candidate-asks`** (workflow validation demandes candidats côté recruteur).
- [ ] 🔴 **MANQUANT [FRONT — page]** : **`/dashboard/notifications`** (centre de notifications utilisateur).

### Workflow décisions et statuts
- [ ] 🟠 **INCOMPLET [FULL-STACK — workflow]** : vérifier que les transitions `applications.application_status` / `quiz_status` / `interview_status` ont bien des endpoints dédiés (au-delà du simple `update`).
- [ ] 🔵 **[BACK — workflow]** : auditer les pré-conditions / post-conditions de chaque transition d'état (ex : on ne peut passer à `interview_status=DONE` que si entretien terminé).

---

## E.4 — Persona : CANDIDAT (`UserRole.CANDIDATE`)

### Parcours attendus
1. **Postulation** : `applications/create` via source_token ou form direct.
2. **Vérification email** : `applications/verify-email` + `email_verification_tokens`.
3. **Passation quiz** : `applications/get-quiz` → `save-quiz-answer` → `touch-quiz` → `complete-quiz`.
4. **Demandes** : `candidate_ask/create` (changement email/phone/identity).
5. **Suivi candidature** : page `/suivre-candidature` (sans auth, via `candidate_token`).
6. **Réponse entretien** : `candidate_interview/update` (accept/decline/reschedule).

### Couverture actuelle
- [x] 🟢 **OK** : page `/suivre-candidature` ↔ `TrackApplicationComponent`.
- [x] 🟢 **OK** : flow quiz complet (get/save/complete/touch).
- [x] 🟢 **OK** : vérification email.
- [ ] � **MANQUANT [FRONT — candidat]** : page publique listant **campagnes en cours / à venir / récemment terminées** (`/campagnes`). *(cf. J.2 D-008, Z-235)*
- [ ] 🔴 **MANQUANT [FRONT — candidat]** : bouton **"Abandonner ma candidature"** sur page suivi. *(cf. Z-330)*
- [ ] 🟠 **INCOMPLET [BD/BACK — candidat]** : table **comptes candidats** à créer ; activation via `candidate_accounts_enabled` (admin) ; permet suivi multi-candidatures + abonnement. *(cf. Z-292)*
- [ ] 🔵 **[FRONT — candidat]** : vérifier la page de candidature publique (entrée via source_token).
- [ ] 🟠 **INCOMPLET [FRONT — candidat]** : l'action `InterviewResponseAction` (ACCEPT/DECLINE/REQUEST_RESCHEDULE) est définie côté FRONT — vérifier endpoint BACK correspondant.

---

## E.5 — Persona transverse : ÉVALUATEUR (rôle métier, pas système)

> *L'évaluateur n'est pas un UserRole distinct ; c'est un RECRUITER avec `interview_participant.can_evaluate=true` OU campagne avec `all_can_evaluate=true`.*

### Parcours attendus
- Voir entretiens où il est participant.
- Évaluer un candidat (`evaluations/create`).
- Voir scoring agrégé.

### Couverture
- [x] 🟢 **OK** : `/dashboard/evaluations`, `/dashboard/evaluations-list`.
- [ ] 🔵 **[FRONT — évaluateur]** : vérifier filtrage par `interview_participant.user_id = currentUser` et par `campaigns.all_can_evaluate=true`.

---

## E.6 — Synthèse parcours manquants

### Pages métier critiques absentes (cumul C.5 + E)
1. `forms` (recruteur)
2. `form-versions` (recruteur)
3. `form-questions` (recruteur)
4. `source-tokens` (recruteur)
5. `manual-correction` (recruteur)
6. `candidate-asks` (recruteur)
7. `notifications` (tous)
8. `group-change-requests` (admin)
9. `email-template-presets` (super-admin)
10. `legal-texts` métier (super-admin)
11. `invitation-codes` métier (super-admin)
