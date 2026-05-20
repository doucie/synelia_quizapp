# Livrable F — Matrice de traçabilité globale BD ↔ BACK ↔ FRONT

**Date :** 2026-05-11
**Statut :** ✅ Complet

> Vue unique : par table BD, état de chaque couche (entité / repo / DTO / business / controller / model FRONT / service FRONT / page CRUD / page métier). Légende :  
> ✅ OK · ⚠️ INCOMPLET · 🔴 MANQUANT · 🟡 À CONFIRMER · 🟠 DIVERGENT

---

## F.1 — Matrice principale (38 tables BD métier)

| Table BD | Entité | Repo | DTO | _DTO | Business | Controller | Model FRONT | Service FRONT | Page CRUD | Page métier |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `answer` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (`answers`) |
| `app_config` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ✅ (settings) |
| `application_progress` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (decisions) |
| `applications` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (`applications`) |
| `business_group` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ✅ (`business-groups`) |
| `business_group_permission` | ✅ | ✅ | ✅ | 🔴 | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ (intégré business-groups) |
| `campaign_crud` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (deprecated?) | ⚠️ intégré campaign-detail |
| `campaigns` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (`campaigns` + `campaign-form` + `campaign-detail`) |
| `candidate_answer` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🔴 (manual-correction) |
| `candidate_ask` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🔴 (workflow recruteur) |
| `candidate_interview` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ (intégré interviews) |
| `candidate_token` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ✅ (track-application) |
| `decisions` | ✅ | ✅ | ✅ | 🔴 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (`decisions`) |
| `departments` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (`departments`) |
| `email_template` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ (`email-editor`) |
| `email_template_preset` | ✅ | ✅ | ✅ | 🔴 | ✅ | ✅ | ✅ | 🔴 | 🔴 | 🔴 |
| `email_verification_tokens` | ✅ | ✅ | ✅ | 🔴 | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ (intégré applications) |
| `entity_permission` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ (`user-permissions`) |
| `evaluations` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ (`evaluations`) |
| `form` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🔴 (page métier dédiée) |
| `form_questions` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | 🔴 |
| `form_version` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🔴 |
| `group_change_request` | ✅ | ✅ | ✅ | 🔴 | ⚠️ | ✅ | ✅ | ⚠️ | 🔴 | 🔴 |
| `interview_participant` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ (intégré interviews) |
| `interviews` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (`interviews` + `interview-create`) |
| `invitation_code` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ (intégré settings) |
| `legal_text` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ (intégré settings) |
| `notifications` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 🔴 (feed utilisateur) |
| `pipeline_stage` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ (intégré pipeline-template-edit) |
| `pipeline_template` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ (`pipeline-templates`) |
| `question` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (`questions`) |
| `smtp_config` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ (intégré settings) |
| `source_token` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ (chemin incorrect) | ✅ | 🔴 (page recruteur) |
| `specialities` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ (`specialities`) |
| `system_role_permission` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ (`system-role-permissions`) |
| `user` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ (`users`) |
| `user_business_group` | ✅ | ✅ | ✅ | 🔴 | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ (intégré business-groups) |
| `user_permission_override` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ (`user-permissions`) |

---

## F.2 — Statistiques globales

| Niveau | Statut | Compte | % |
|---|---|---:|---:|
| Entités JPA | ✅ | 38/38 | 100% |
| Repositories | ✅ | 38/38 | 100% |
| DTOs standards | ✅ | 38/38 | 100% |
| `_<Entity>Dto` | ⚠️ | 30/38 | 79% |
| Business COMPLET | ⚠️ | 29/38 | 76% |
| Controllers | ✅ | 38/38 | 100% |
| Models FRONT | ✅ | 38/38 | 100% |
| Services FRONT 7-méthodes | ⚠️ | ~10/38 | ~26% |
| Pages CRUD brutes | ⚠️ | 36/38 | 95% |
| Pages métier dédiées | 🔴 | 25/38 | 66% |

---

## F.3 — Vue par sévérité

### 🔴 MANQUANT (action obligatoire)
- DTOs `_<Entity>Dto` : 8 manquants.
- Pages CRUD brutes : 2 manquantes (`email_template_preset`, `group_change_request`).
- Pages métier dédiées : 11 manquantes (cf. C.5 et E.6).
- Service FRONT `email-template-preset.service.ts` manquant.

### ⚠️ INCOMPLET (action recommandée)
- 9 services Business à compléter (cf. B.4).
- ~30 services FRONT à compléter avec les 7 méthodes standards.

### 🟠 DIVERGENT (à harmoniser)
- 7 enums à aligner BACK ↔ FRONT (cf. B.6 + C.2).
- 5 URLs singulier/pluriel (cf. D.2).
- `UserRole` valeurs incohérentes (3 sources : enum Java, Spring Security, FRONT).

### 🟡 À CONFIRMER (audit nécessaire — cf. livrable K)
- ~~Migration V1_034 manquante~~ → ✅ **confirmée suppression involontaire** ; toujours enregistrée en BD (pas de conflit checksum). Aucune action.
- `qeel/*` controller — voir audit K.13.
- `MinioConfig` vs `quizapp/uploads/cv/` local — voir audit K.14.
- `candidate_accounts_enabled` — ✅ **feature prévue mais non implémentée** ; activable par admin (cf. J.1).
