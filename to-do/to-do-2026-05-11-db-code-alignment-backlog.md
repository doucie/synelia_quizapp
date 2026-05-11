# Backlog Z — Alignement BD ↔ Code (final actionnable)

**Date :** 2026-05-11
**Statut :** ✅ Consolidé à partir des livrables A→I

> Agrège l'ensemble des actions identifiées dans les 9 livrables précédents. Priorisation P0 (critique) → P3 (mineur).
> Format : `[ID] [PRIO] [ZONE] action — *réf. livrable*`

---

## P0 — CRITIQUE (sécurité ou bloquant fonctionnel)

- [ ] **Z-001** [P0][SÉCURITÉ] Harmoniser `UserRole` (enum Java, `@PreAuthorize`, FRONT, BD) — choisir : `SUPER` / `ADMIN` / `RECRUITER` / `CANDIDATE`. *(I.1, H.1)*
- [ ] **Z-002** [P0][SÉCURITÉ] `QuestionController` autorise `UTILISATEUR` (valeur fantôme) — corriger. *(B.7, I.1)*
- [ ] **Z-003** [P0][SÉCURITÉ] Supprimer ou wrap POST le `GET /userDebug/roles-debug`. *(B.5, D.3, I.5)*
- [ ] **Z-004** [P0][SÉCURITÉ] Découper la permission `MANAGE_APP_CONFIG` en perms par entité pour les routes `/dashboard/entities/*`. *(C.6, I.1)*
- [ ] **Z-005** [P0][SÉCURITÉ] Audit escape Thymeleaf des variables candidat dans templates emails (XSS). *(H.4, I.3)*
- [ ] **Z-006** [P0][API] Résoudre divergences singulier/pluriel URLs (`/notification` ↔ `/notifications`, `/decision` ↔ `/decisions`, `/evaluation` ↔ `/evaluations`, `/department` ↔ `/departments`, `/speciality` ↔ `/specialities`). *(D.2)*
- [ ] **Z-007** [P0][ENUM] Aligner `StageType` BACK (6) ↔ FRONT (8). *(B.6, C.2, H.6)*

---

## P1 — HAUTE (cohérence structurelle et features critiques)

### Enums manquants BACK (12)
- [ ] **Z-010** [P1][ENUM-BACK] Créer `ApplicationStatus` (Applications). *(B.6)*
- [ ] **Z-011** [P1][ENUM-BACK] Créer `InterviewStatus` (Applications + Interviews). *(B.6)*
- [ ] **Z-012** [P1][ENUM-BACK] Créer `CampaignStatus`. *(B.6)*
- [ ] **Z-013** [P1][ENUM-BACK] Créer `RequestType` (CandidateAsk). *(B.6)*
- [ ] **Z-014** [P1][ENUM-BACK] Créer `DecisionType` (Decision). *(B.6)*
- [ ] **Z-015** [P1][ENUM-BACK] Créer `InterviewType` (Interviews). *(B.6)*
- [ ] **Z-016** [P1][ENUM-BACK] Créer `EntityType` (EntityPermission). *(B.6)*
- [ ] **Z-017** [P1][ENUM-BACK] Créer `EmailTemplatePresetCategory`. *(B.6, H.4)*
- [ ] **Z-018** [P1][ENUM-BACK] Créer `GroupChangeRequestStatus`. *(B.6)*
- [ ] **Z-019** [P1][ENUM-BACK] Créer `NotificationType`. *(B.6, H.3)*
- [ ] **Z-020** [P1][ENUM-BACK] Créer `DifficultyLevel` (Question). *(B.6, H.7)*

### Enums incomplets BACK
- [ ] **Z-021** [P1][ENUM-BACK] Ajouter `NOT_REQUIRED` à `ManualCorrectionStatus` (valeur par défaut BD). *(B.6)*
- [ ] **Z-022** [P1][ENUM-BACK] Ajouter `PENDING` à `ProgressStatus` (valeur par défaut BD). *(B.6, H.6)*

### Pages métier manquantes (FRONT)
- [ ] **Z-030** [P1][FRONT-PAGE] Créer `/dashboard/forms` (gestion métier formulaires). *(C.5, E.3)*
- [ ] **Z-031** [P1][FRONT-PAGE] Créer `/dashboard/form-versions` (versionning + publish/lock). *(C.5, E.3)*
- [ ] **Z-032** [P1][FRONT-PAGE] Créer `/dashboard/form-questions` (sélection + ordre + chrono). *(C.5, E.3)*
- [ ] **Z-033** [P1][FRONT-PAGE] Créer `/dashboard/source-tokens` (recruteur génère + suit). *(C.5, E.3, H.5)*
- [ ] **Z-034** [P1][FRONT-PAGE] Créer `/dashboard/manual-correction` (correction quiz par recruteur). *(C.5, E.3)*
- [ ] **Z-035** [P1][FRONT-PAGE] Créer `/dashboard/candidate-asks` (workflow APPROVE/REJECT recruteur). *(C.5, E.3)*
- [ ] **Z-036** [P1][FRONT-PAGE] Créer `/dashboard/notifications` (feed utilisateur). *(C.5, E.3, H.3)*
- [ ] **Z-037** [P1][FRONT-PAGE] Créer `/dashboard/group-change-requests` (workflow admin). *(C.5, E.1)*
- [ ] **Z-038** [P1][FRONT-PAGE] Créer `/dashboard/email-template-presets`. *(C.5, E.1, H.4)*
- [ ] **Z-039** [P1][FRONT-PAGE] Créer `/dashboard/legal-texts` métier. *(C.5, E.1)*
- [ ] **Z-040** [P1][FRONT-PAGE] Créer `/dashboard/invitation-codes` métier. *(C.5, E.1, H.5)*

### Pages CRUD brutes manquantes
- [ ] **Z-041** [P1][FRONT-CRUD] Créer `/dashboard/entities/solo/email-template-presets`. *(C.4)*
- [ ] **Z-042** [P1][FRONT-CRUD] Créer `/dashboard/entities/solo/group-change-requests`. *(C.4)*

### Service FRONT manquant
- [ ] **Z-043** [P1][FRONT-SERVICE] Créer `email-template-preset.service.ts`. *(C.3, D.1)*

### Divergences enums FRONT
- [ ] **Z-050** [P1][ENUM-FRONT] Aligner `ProgressStatus` FRONT avec BACK. *(C.2, H.6)*
- [ ] **Z-051** [P1][ENUM-FRONT] Aligner `FormAssignmentStrategy` (4 vs 3 valeurs divergentes). *(C.2)*
- [ ] **Z-052** [P1][ENUM-FRONT] Aligner `FormAssignmentExhaustionPolicy` FRONT ↔ BACK. *(C.2)*
- [ ] **Z-053** [P1][ENUM-FRONT] Aligner `CandidateAskStatus` (FRONT manque `REVIEWED`). *(C.2)*

### Sécurité tokens
- [ ] **Z-060** [P1][SÉCURITÉ] Audit complet quiz_token (CSPRNG, anti-rejeu, rate-limit, single-use). *(H.5, I.4, I.7)*
- [ ] **Z-061** [P1][SÉCURITÉ] Audit hash password + JWT algo + rotation secrets. *(I.2)*
- [ ] **Z-062** [P1][SÉCURITÉ] Rate-limiting sur `/auth/authenticate`, `/applications/get-quiz`, `/invitationCode/validate`. *(I.4)*

---

## P2 — MOYENNE (qualité, conventions, complétude)

### DTOs manquants
- [ ] **Z-070** [P2][BACK-DTO] Créer `_BusinessGroupPermissionDto`. *(B.3)*
- [ ] **Z-071** [P2][BACK-DTO] Créer `_DecisionDto`. *(B.3)*
- [ ] **Z-072** [P2][BACK-DTO] Créer `_EmailTemplatePresetDto`. *(B.3)*
- [ ] **Z-073** [P2][BACK-DTO] Créer `_EmailVerificationTokenDto`. *(B.3)*
- [ ] **Z-074** [P2][BACK-DTO] Créer `_GroupChangeRequestDto`. *(B.3)*
- [ ] **Z-075** [P2][BACK-DTO] Créer `_UserBusinessGroupDto`. *(B.3)*

### Business incomplets
- [ ] **Z-080** [P2][BACK-BUSINESS] Compléter `AppConfigBusiness` (updateAll, getAllByCriteria, getFullInfos — sauf si singleton justifie). *(B.4)*
- [ ] **Z-081** [P2][BACK-BUSINESS] Compléter `BusinessGroupBusiness`. *(B.4)*
- [ ] **Z-082** [P2][BACK-BUSINESS] Compléter `BusinessGroupPermissionBusiness`. *(B.4)*
- [ ] **Z-083** [P2][BACK-BUSINESS] Compléter `CandidateTokenBusiness`. *(B.4)*
- [ ] **Z-084** [P2][BACK-BUSINESS] Compléter `FormQuestionsBusiness`. *(B.4)*
- [ ] **Z-085** [P2][BACK-BUSINESS] Compléter `GroupChangeRequestBusiness`. *(B.4)*
- [ ] **Z-086** [P2][BACK-BUSINESS] Compléter `InterviewParticipantBusiness`. *(B.4)*
- [ ] **Z-087** [P2][BACK-BUSINESS] Compléter `SourceTokenBusiness`. *(B.4)*
- [ ] **Z-088** [P2][BACK-BUSINESS] Compléter `UserBusinessGroupBusiness`. *(B.4)*

### Services FRONT incomplets
- [ ] **Z-090** [P2][FRONT-SERVICE] Compléter les ~30 services avec les 7 méthodes standards (create/update/updateAll/delete/getByCriteria/getAllByCriteria/getFullInfos). *(C.3)*
- [ ] **Z-091** [P2][FRONT-SERVICE] Implémenter `getFullInfos` côté FRONT pour applications, campaigns, interviews (principales). *(D.1)*
- [ ] **Z-092** [P2][FRONT-SERVICE] Implémenter `updateAll` côté FRONT pour les batchs (permissions). *(D.1)*

### Réorganisation FRONT
- [ ] **Z-100** [P2][FRONT-ORG] Créer `core/enums/` et y centraliser tous les enums. *(C.2, G.3)*
- [ ] **Z-101** [P2][FRONT-ORG] Centraliser les modèles métier sous `core/models/` (38 fichiers). *(C.1, G.3)*
- [ ] **Z-102** [P2][FRONT-ORG] Déplacer `source-token.service.ts` vers `core/services/`. *(C.3, G.3)*
- [ ] **Z-103** [P2][FRONT-ORG] Vérifier doublon `entity-permission.service.ts`. *(C.3)*

### Conventions style
- [ ] **Z-110** [P2][FRONT-CSS] Remplacer `#166534` (entities-users.scss:87, entities-specialities.scss:87) par variable CSS. *(C.8)*
- [ ] **Z-111** [P2][FRONT-CSS] Remplacer `#1e3a5f` (merise.scss:245) par variable CSS. *(C.8)*

### Typage BD
- [ ] **Z-120** [P2][BD-TYPE] Harmoniser `is_deleted` (tinyint(1) ou bit(1)) sur toutes les tables. *(G.2)*
- [ ] **Z-121** [P2][BD-TYPE] Harmoniser `created_by` / `updated_by` (int vs int unsigned). *(G.2)*
- [ ] **Z-122** [P2][BD-TYPE] Harmoniser `created_at` / `updated_at` (datetime vs timestamp). *(G.2)*

### Sécurité
- [ ] **Z-130** [P2][SÉCURITÉ] Headers HTTP sécurité (HSTS, X-Frame-Options, CSP). *(I.5)*
- [ ] **Z-131** [P2][SÉCURITÉ] CORS strict (origines explicites en prod). *(I.5)*
- [ ] **Z-132** [P2][SÉCURITÉ] Validation upload CV (extension whitelist, taille max, no path traversal). *(I.3)*
- [ ] **Z-133** [P2][SÉCURITÉ] Logs sécurité (login échec, élévation, suppression, accès données sensibles). *(I.9)*
- [ ] **Z-134** [P2][SÉCURITÉ] RGPD — suppression effective + chiffrement at-rest CV. *(I.11)*
- [ ] **Z-135** [P2][SÉCURITÉ] Spring `actuator` — endpoints sensibles protégés. *(I.5)*
- [ ] **Z-136** [P2][SÉCURITÉ] `smtp_config.password` stocké chiffré. *(I.2)*
- [ ] **Z-137** [P2][SÉCURITÉ] `merise` désactivée en prod. *(I.5)*

---

## P3 — MINEURE (audit, perfectionnement, hygiène)

- [ ] **Z-150** [P3][BD] Investiguer migration V1_034 manquante. *(B.8, G.4)*
- [ ] **Z-151** [P3][BACK] Confirmer / supprimer `/qeel/*` controller si plus utilisé. *(D.3)*
- [ ] **Z-152** [P3][BACK] Audit doublon `MinioConfig` ↔ `uploads/cv/` local. *(B.9)*
- [ ] **Z-153** [P3][AUDIT] Documenter schéma JSON `pipeline_stage.config_json` par `stage_type`. *(G.1, H.6)*
- [ ] **Z-154** [P3][AUDIT] Documenter schéma polymorphique `notifications.object_table_name`. *(G.1, H.3)*
- [ ] **Z-155** [P3][AUDIT] Auditer colonnes BD potentiellement mortes (`quiz_level`, `application_abandoned`, `is_timed`, `max_apply`, `is_online`, `question_ref`, `admin_mode`, `page_size_preference`, `color_scheme` vs `primary_color`). *(G.1)*
- [ ] **Z-156** [P3][PERF] Audit N+1 sur `/applications/getByCriteria`, `/campaigns/getAllByCriteria`, `/notifications/getAllByCriteria`. *(G.6)*
- [ ] **Z-157** [P3][PERF] Vérifier index BD sur colonnes critiques (`candidate_email`, `quiz_token`, `application_id` dans application_progress). *(G.6)*
- [ ] **Z-158** [P3][PERF] Confirmer `CacheConfig` actif sur queries lourdes (permissions, templates). *(G.6)*
- [ ] **Z-159** [P3][TEST] Mesurer couverture tests BACK (`src/test/`) et FRONT (`*.spec.ts`). *(G.5)*
- [ ] **Z-160** [P3][A11Y] Audit accessibilité (ARIA, contrastes, navigation clavier) sur pages critiques. *(G.7)*
- [ ] **Z-161** [P3][CONVENTION] Harmoniser noms entités JPA (singulier/pluriel — `Decision` vs `Decisions`, `Interview` vs `Interviews`). *(G.3)*
- [ ] **Z-162** [P3][CONVENTION] Nettoyer Telosys `TelosysTools/` non utilisé. *(G.3)*
- [ ] **Z-163** [P3][DEPENDENCY] Lancer `mvn dependency-check` + `npm audit`. *(I.6)*
- [ ] **Z-164** [P3][CONFIG] Auditer profils Spring (`dev`/`prod`/`test`) et secrets via variables d'environnement. *(B.9, I.5)*
- [ ] **Z-165** [P3][BACK] Auditer entités sans `@Column(name="...")` explicite. *(B.1)*
- [ ] **Z-166** [P3][BACK] Compléter `_<Entity>Repository` customs là où le `_Dto` existe. *(B.2)*
- [ ] **Z-167** [P3][FRONT] Vérifier appel systématique de `cleanFormData()` dans tous les formulaires. *(C.8)*
- [ ] **Z-168** [P3][FRONT] Auditer héritage `EntityCrudBase` sur toutes les pages `entities/solo/*`. *(C.8)*
- [ ] **Z-169** [P3][FULL-STACK] `InterviewResponseAction` (ACCEPT/DECLINE/REQUEST_RESCHEDULE) — vérifier endpoint BACK. *(E.4, H.8)*
- [ ] **Z-170** [P3][FULL-STACK] Confirmer activation comptes candidats (`candidate_accounts_enabled`). *(E.4, H.9)*
- [ ] **Z-171** [P3][BACK] Documenter algorithme de scoring `evaluations`. *(H.7)*
- [ ] **Z-172** [P3][BACK] Documenter sémantique `form_questions.chrono_override`. *(H.7)*

---

## Statistiques

| Priorité | Compte |
|---|---:|
| P0 — CRITIQUE | 7 |
| P1 — HAUTE | 36 |
| P2 — MOYENNE | 34 |
| P3 — MINEURE | 23 |
| **Total** | **100** |

---

## Légende livrables

- [A-inventaire-bd.md](livrables/A-inventaire-bd.md)
- [B-inventaire-backend.md](livrables/B-inventaire-backend.md)
- [C-inventaire-frontend.md](livrables/C-inventaire-frontend.md)
- [D-reconciliation-apis.md](livrables/D-reconciliation-apis.md)
- [E-personas-parcours.md](livrables/E-personas-parcours.md)
- [F-matrice-traceabilite.md](livrables/F-matrice-traceabilite.md)
- [G-qualite-transverse.md](livrables/G-qualite-transverse.md)
- [H-sous-systemes.md](livrables/H-sous-systemes.md)
- [I-securite-owasp.md](livrables/I-securite-owasp.md)
