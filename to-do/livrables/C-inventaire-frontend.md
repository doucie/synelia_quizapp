# Livrable C — Inventaire exhaustif du frontend Angular

**Date :** 2026-05-11
**Source :** subagent Explore + lectures directes
**Statut :** ✅ Complet

> Consolide les sections C.1 → C.8 du plan.

---

## C.1 — Modèles TypeScript

**Bilan : 38/38 tables BD ont un modèle TS. Couverture 100%.**

- [x] 🟢 **OK** : couverture complète des entités.
- [ ] 🟠 **INCONSISTANT [FRONT — modèles]** : les modèles métier ne sont **pas centralisés** dans `core/models/`. Seuls 3 fichiers existent :
  - `core/models/spring-boot.interfaces.ts` (génériques)
  - `core/models/permission.interfaces.ts` (7 interfaces de permissions)
  - `core/models/pipeline.interfaces.ts` (3 interfaces pipeline)
  Les autres modèles sont définis **inline dans chaque service**. **À harmoniser** : créer un fichier modèle par table sous `core/models/`.
- [ ] 🔵 **[FRONT — modèles]** : `permission.interfaces.ts` contient un champ `AuthPermissionsData` qui n'a pas de table BD — c'est un agrégat, **OK**.
- [ ] 🔵 **[FRONT — modèles]** : vérifier que toutes les interfaces incluent les champs techniques (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `isDeleted`, `searchString`) en cohérence avec la BD.

---

## C.2 — Énumérations TypeScript

**Bilan : 20+ types union détectés, AUCUN fichier `core/enums/` dédié.**

| Type | Valeurs FRONT | Comparaison BACK |
|---|---|---|
| `StageType` | CANDIDATURE, QUIZ, PRESELECTION, INTERVIEW, TECHNICAL_TEST, EVALUATION, DECISION, CUSTOM | 🔴 DIVERGENT (BACK : APPLICATION, PRE_SCREEN, INTERVIEW, EVALUATION, FINAL_DECISION, OFFER) |
| `ProgressStatus` | PENDING, IN_PROGRESS, PASSED, FAILED, SKIPPED | 🔴 DIVERGENT (BACK : NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED) |
| `CampaignStatus` | ACTIVE, PENDING, CLOSED | 🔴 MANQUANT côté BACK (pas d'enum Java identifié) |
| `FormAssignmentStrategy` | RANDOM, RANDOM_NO_REPEAT, SOURCE_TOKEN, SEQUENTIAL | 🟠 DIVERGENT (BACK : SEQUENTIAL, RANDOM, BALANCED) |
| `FormAssignmentExhaustionPolicy` | BLOCK, RESET, LOOP | 🔴 DIVERGENT (BACK : REPEAT, STOP, RANDOM) |
| `AccessType` | GRANT, DENY | ✅ OK (côté BACK : booléen `is_allowed`) |
| `CandidateAskReviewAction` | APPROVE, REJECT | ✅ OK (utilisé pour action UI) |
| `InterviewResponseAction` | ACCEPT, DECLINE, REQUEST_RESCHEDULE | 🔵 utilisé pour candidat ; vérifier endpoint correspondant |
| `CandidateAskRequestType` | IDENTITY, EMAIL, PHONE | 🔴 MANQUANT côté BACK |
| `CandidateAskStatus` | PENDING, APPROVED, REJECTED | ⚠️ BACK a aussi `REVIEWED` |
| `UserRole` (implicite) | ADMIN, UTILISATEUR | 🔴 DIVERGENT (BACK : SUPER, ADMIN, RECRUITER, CANDIDATE) |

### UI-only (pas BD)
`ThemeMode` (light/dark/auto), `EmailEditorMode`, `EmailEditorTarget`, `EditableVariableKey`, `SortOrder`, `ViewMode`, `CampaignTab`, `RoleTab`, `SettingsTab`, `EditTab` — **OK**, conventions internes.

### Actions
- [ ] 🟠 **[FRONT — enum]** : créer un dossier `core/enums/` et centraliser tous les enums alignés avec le BACK (un fichier par enum BACK).
- [ ] 🔴 **[FULL-STACK — enum]** : aligner valeurs BACK ↔ FRONT pour `StageType`, `ProgressStatus`, `FormAssignmentStrategy`, `FormAssignmentExhaustionPolicy`, `CampaignStatus`, `UserRole`, `CandidateAskStatus`.

---

## C.3 — Services (`core/services/`)

**Bilan : ~44 services. Pattern CRUD partiellement respecté.**

### Services COMPLETS (7 méthodes standards ou équivalents)
- `campaign.service.ts` ✓
- `answer.service.ts` ✓
- `question.service.ts` ✓
- `application.service.ts` ✓
- `interview.service.ts` ✓
- `decision.service.ts` ✓
- `department.service.ts` ✓ *(seul service avec `updateAll` explicite)*
- `application-progress.service.ts` ✓ (avec custom endpoints)

### Services INCOMPLETS — généralement il manque `getByCriteria`, `updateAll`, `getFullInfos`
- [ ] 🟠 **[FRONT — service]** : `user.service.ts` — il ne reste que `getByCriteria` (pas de CRUD complet, étrange !)
- [ ] 🟠 **[FRONT — service]** : `form.service.ts`, `evaluation.service.ts`, `speciality.service.ts`, `notification.service.ts`, `form-version.service.ts`, `form-questions.service.ts`
- [ ] 🟠 **[FRONT — service]** : `candidate-answers.service.ts`, `candidate-ask.service.ts`, `candidate-interview-entity.service.ts`, `candidate-token.service.ts`, `interview-participant.service.ts`
- [ ] 🟠 **[FRONT — service]** : `invitation-code.service.ts`, `legal-text.service.ts`, `smtp-config.service.ts`, `app-config.service.ts`
- [ ] 🟠 **[FRONT — service]** : `pipeline-template.service.ts`, `pipeline-stage.service.ts`, `email-template.service.ts`, `email-verification-token.service.ts`
- [ ] 🟠 **[FRONT — service]** : `entity-permission.service.ts`, `group-change-request.service.ts`, `business-group-crud.service.ts`, `business-group-permission.service.ts`
- [ ] 🟠 **[FRONT — service]** : `user-business-group.service.ts`, `user-permission-override-crud.service.ts`, `system-role-permission-crud.service.ts`, `campaign-crud.service.ts`

### Anomalies de path
- [ ] 🔴 **[FRONT — service]** : `source-token.service.ts` est sous `src/app/services/` (PAS `core/services/`) — à déplacer.
- [ ] 🔵 **[FRONT — service]** : doublons potentiels — `entity-permission.service.ts` existe avec deux implémentations (à vérifier).

### Services manquants par rapport au BACK
- [ ] 🔵 **[FRONT — service]** : pas de service pour `EmailTemplatePreset` mais le BACK a `/emailTemplatePreset/...` — service à créer (sauf si consommé directement via `email-template.service.ts`).

---

## C.4 — Pages dashboard CRUD brutes (`pages/dashboard/entities/solo/`)

**Bilan : 36/38 pages CRUD présentes (94,7%).**

- [ ] 🔴 **MANQUANT [FRONT — page]** : `entities/solo/email-template-presets/` — pas de page pour gérer les presets email.
- [ ] 🔴 **MANQUANT [FRONT — page]** : `entities/solo/group-change-requests/` — pas de page CRUD pour les demandes de changement de groupe (le service existe).
- [x] 🟢 **OK** : 36 pages CRUD présentes (toutes les autres tables BD couvertes).
- [ ] 🔵 **[FRONT — page CRUD]** : auditer chaque page CRUD pour vérifier que **tous les champs BD sont affichés** dans le tableau et le formulaire d'édition (à confronter avec C.5/Phase A).
- [ ] 🔵 **[FRONT — page CRUD]** : `campaign-crud/` est marquée *deprecated* — clarifier le statut (supprimer ? renommer ?).

---

## C.5 — Pages dashboard métier (`pages/dashboard/<feature>/`)

**Bilan : 24 features métier.**

### Pages métier présentes ✅
`overview`, `campaigns`, `campaign-detail`, `campaign-form`, `applications`, `interviews`, `interview-create`, `evaluations`, `evaluations-list`, `decisions`, `email-editor`, `pipeline-templates`, `pipeline-template-edit`, `departments`, `specialities`, `questions`, `answers`, `users`, `business-groups`, `user-permissions`, `system-role-permissions`, `settings`, `profile`, `merise`.

### Pages métier MANQUANTES (par rapport aux fonctionnalités BD)
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **forms** dédiée (gestion des formulaires métier) — ils sont uniquement dans `entities/solo/forms/` (CRUD brut). *Or `form` est un concept métier central (1 campagne → N formulaires).*
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **form-versions** (gestion versionning + publication + lock).
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **form-questions** (sélection/ordre/chrono override des questions par version).
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **invitation-codes** métier (génération + suivi codes recruteurs).
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **legal-texts** métier (lecture publique + édition admin).
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **source-tokens** métier (génération + suivi par campagne).
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **candidate-asks** métier recruteur (gestion des demandes candidats avec workflow APPROVE/REJECT).
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **notifications** centre côté utilisateur (feed de notifs lues/non-lues).
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **group-change-requests** métier (workflow approbation par admin).
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **manual-correction** (interface correction manuelle quiz `quiz_manual_correction_status`).
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas d'interface dédiée à **`app_config` / `smtp_config`** (intégrées à `/dashboard/settings` — *OK* mais à confirmer que tous les champs BD sont éditables).
- [ ] 🔴 **MANQUANT [FRONT — page métier]** : pas de page **email-template-presets** (le BACK a un controller dédié).

---

## C.6 — Routes (`app.routes.ts`)

**Bilan : ~100+ routes.**

- [x] 🟢 **OK** : routes principales déclarées avec `authGuard`/`noAuthGuard`/`permissionGuard`.
- [ ] 🔴 **INCOHÉRENT [FRONT — routes]** : toutes les pages `/dashboard/entities/*` exigent **`MANAGE_APP_CONFIG`** — *mais cette permission est très large alors que certaines entités sont publiques (e.g. notifications)*. À redécouper par `<ENTITY>_VIEW`.
- [ ] 🔵 **[FRONT — routes]** : `MeriseComponent` est en debug uniquement — confirmer qu'elle est protégée et qu'on ne l'expose pas en prod.
- [ ] 🔵 **[FRONT — routes]** : pas de route pour `forms`, `form-versions`, `form-questions`, `notifications`, etc. (cf. C.5).

---

## C.7 — Guards & permissions

**Bilan : 7 guards.**

- [x] 🟢 **OK** : `authGuard`, `noAuthGuard`, `permissionGuard`, `campaignViewGuard`, `campaignEditGuard`, `interviewCreateGuard`, `sourceTokenGuard`.
- [ ] 🔴 **DIVERGENT [FRONT — guard]** : `permissionGuard` bypasse `SUPER_ADMIN` (string) alors que le BACK enum est `SUPER`. Confirmer la cohérence (probablement OK via mapping de Spring Security).
- [ ] 🔵 **[FRONT — guard]** : pas de guard pour les routes `manual-correction` ou `decisions` (à confirmer).

### Mapping permission Front ↔ Back
- [x] 🟢 **OK** : `permissions.constants.ts` mappe `FunctionalityEnum` 1:1 (à vérifier exhaustivité).
- [ ] 🔵 **[FRONT — permission]** : auditer que toutes les ~152 valeurs de `FunctionalityEnum` sont exposées côté Front (ou au moins celles routées).

---

## C.8 — Conventions

### POST-only
- [x] 🟢 **OK** : tous les appels HTTP des services sont en `POST`.
- [ ] 🔵 **[FRONT — convention]** : auditer `api.service.ts` (service legacy) pour confirmer qu'aucun GET résiduel n'est utilisé en production.

### `""` → `null` (update partiel)
- [x] 🟢 **OK** : `form.utils.ts > cleanFormData()` implémente la conversion.
- [ ] 🔵 **[FRONT — convention]** : auditer que **tous** les formulaires appellent `cleanFormData()` avant `http.post()`.

### Couleurs hardcodées
- [ ] 🟠 **DIVERGENT [FRONT — convention]** : 3 couleurs hardcodées trouvées :
  - `entities-users.scss` ligne 87 : `color: #166534`
  - `entities-specialities.scss` ligne 87 : `color: #166534`
  - `merise.scss` ligne 245 : `color: #1e3a5f`
- [ ] 🔵 **[FRONT — convention]** : remplacer par des CSS variables (cf. `RULES.md`).

### Pattern `EntityCrudBase`
- [ ] 🔵 **[FRONT — convention]** : vérifier que toutes les pages CRUD `entities/solo/*` héritent ou utilisent le composant `EntityCrudBase` (cf. `RULES.md`).

### Responsive
- [ ] 🔵 **[FRONT — convention]** : auditer mobile-first sur les pages métier critiques (`campaigns`, `applications`, `decisions`).

---

## C.9 — Synthèse des actions frontend à mener

### Priorité 1 — Pages manquantes
1. Créer pages métier : `forms`, `form-versions`, `form-questions`, `invitation-codes`, `legal-texts`, `source-tokens`, `candidate-asks` (recruteur), `notifications` (feed), `group-change-requests`, `manual-correction`, `email-template-presets`.
2. Créer pages CRUD brutes manquantes : `email-template-presets`, `group-change-requests`.

### Priorité 2 — Alignement enums
3. Créer `core/enums/` et y centraliser tous les enums alignés avec le BACK.
4. Résoudre les 6 divergences enum identifiées (cf. C.2).

### Priorité 3 — Standardisation
5. Centraliser les modèles métier sous `core/models/` (un fichier par table).
6. Compléter les 7 méthodes standards dans les ~30 services incomplets.
7. Déplacer `source-token.service.ts` vers `core/services/`.

### Priorité 4 — Conventions
8. Remplacer les 3 couleurs hardcodées par des CSS variables.
9. Redécouper les permissions de routes `/entities/*` (trop large actuellement).
10. Auditer l'utilisation systématique de `cleanFormData()`.
