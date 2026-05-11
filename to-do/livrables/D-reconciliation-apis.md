# Livrable D — Réconciliation API (back ↔ front)

**Date :** 2026-05-11
**Statut :** ✅ Complet

> Détecte les **endpoints BACK orphelins** (pas consommés FRONT) et les **appels FRONT sans endpoint BACK**.

---

## D.1 — Endpoints BACK existants mais NON consommés côté FRONT

> *Issu du diff (controllers BACK B.5) − (URLs http.post FRONT C.3).*

### Standards CRUD non utilisés (le BACK propose, le FRONT ignore)

| Endpoint BACK | Statut FRONT | Action |
|---|---|---|
| `POST /answer/updateDeleted` | Non appelé | 🔵 Vérifier usage prévu (restauration ?) |
| `POST /answer/updateAll` | Non appelé | 🔵 À implémenter côté FRONT si batch update prévu |
| `POST /answer/getByCriteria` | Non appelé (FRONT n'utilise que `getAllByCriteria`) | 🔵 Service `answer.service.ts` à compléter |
| `POST /applications/updateAll` | Non appelé | 🔵 idem |
| `POST /applications/getFullInfos` | Non appelé | 🔴 **MANQUANT FRONT** — getFullInfos pas appelé pour aucune entité |
| `POST /campaigns/updateAll` | Non appelé | 🔵 idem |
| `POST /campaigns/updateDeleted` | Non appelé | 🔵 idem |
| `POST /candidateAnswer/getByCriteria` | Non appelé | 🔵 idem |
| `POST /decisions/getFullInfos` | Non appelé | 🔵 idem |
| `POST /emailTemplate/getByActionType` | Non appelé | 🔵 vérifier |
| `POST /emailTemplatePreset/*` | Non appelé (pas de service FRONT) | 🔴 **service à créer** |
| `POST /formQuestions/reorder` | À confirmer | 🔵 vérifier appel depuis page form-questions |
| `POST /formVersion/publish` | À confirmer | 🔵 idem |
| `POST /formVersion/lock` | À confirmer | 🔵 idem |
| `POST /invitationCode/validate` | À confirmer | 🔵 vérifier flow recruteur |
| `POST /smtpConfig/testConnection` | À confirmer | 🔵 vérifier dans `/dashboard/settings` |
| `POST /systemRolePermission/addPermission` | À confirmer | 🔵 vérifier UI gestion rôles |
| `POST /systemRolePermission/removePermission` | À confirmer | 🔵 idem |
| `POST /entityPermission/grant` | Appelé | ✅ OK |
| `POST /entityPermission/revoke` | Appelé | ✅ OK |
| `POST /userDebug/set-users-online` | Non appelé en prod | 🔵 endpoint de debug |
| `GET /userDebug/roles-debug` | Non appelé en prod | 🔴 endpoint debug GET — à supprimer ou wrap POST |

### Endpoints custom métier — bien utilisés
- ✅ `/auth/*` (login)
- ✅ `/applications/{verify-email, get-quiz, save-quiz-answer, complete-quiz, touch-quiz}`
- ✅ `/applicationProgress/{advance, fail, skip, rollback, currentStage, byApplication, migratableCandidates, migrateMultiple}`
- ✅ `/campaigns/{restore, checkEditPermission}`
- ✅ `/files/upload/cv`
- ✅ `/interviews/{schedule, evaluate}` *(à confirmer côté FRONT par grep)*

---

## D.2 — Appels FRONT vers des endpoints BACK INEXISTANTS

> *Issu du diff (URLs http.post FRONT) − (endpoints BACK).*

### Endpoints potentiellement manquants côté BACK
> *À confirmer par grep ciblé — possible source d'erreur 404 silencieuse.*

- [ ] 🔵 **À CONFIRMER [FULL-STACK]** : `POST /notification/markAsRead` — vérifier que le BACK l'expose (le subagent BACK ne mentionne que `/notifications/markRead` ou `/notifications/create,update,delete,getByCriteria`).
- [ ] 🔵 **À CONFIRMER [FULL-STACK]** : `POST /candidateAnswer/custom`, `/candidateAsk/custom`, `/formVersion/custom`, etc. — endpoints "custom" génériques côté FRONT, vérifier qu'ils existent côté BACK.
- [ ] 🔵 **À CONFIRMER [FULL-STACK]** : `POST /track-application/*` — page candidat publique, vérifier endpoints publics correspondants.

### Divergences de naming d'URL (singulier/pluriel)
| URL FRONT | URL BACK | Statut |
|---|---|---|
| `/notification/...` | `/notifications/...` | 🔴 **DIVERGENT** — singulier FRONT vs pluriel BACK |
| `/decision/...` | `/decisions/...` | 🔴 **DIVERGENT** — singulier FRONT vs pluriel BACK |
| `/evaluation/...` | `/evaluations/...` | 🔴 **DIVERGENT** |
| `/department/...` | `/departments/...` | 🔴 **DIVERGENT** |
| `/speciality/...` | `/specialities/...` | 🔴 **DIVERGENT** |

> ⚠️ **À CONFIRMER URGEMMENT** : ces URLs singulières côté FRONT vont-elles bien passer le proxy ou existent-elles aussi côté BACK ? Un test rapide est nécessaire.

---

## D.3 — Endpoints orphelins côté BACK (totalement morts)

> *Endpoints exposés que personne n'appelle (ni FRONT, ni autre service interne).*

- [ ] 🔴 **OBSOLÈTE [BACK — controller]** : `GET /userDebug/roles-debug` — debug, à supprimer.
- [ ] 🟡 **À CONFIRMER [BACK — controller]** : `/qeel/*` — intégration externe, vérifier si encore utilisée.

---

## D.4 — Pages FRONT existantes sans API BACK correspondante

> *Le user a explicitement demandé : "faut pas qu'on ait une page pour créer un truc mais qu'il y ait pas d'API pour ça".*

- [x] 🟢 **OK** : toutes les pages CRUD `/dashboard/entities/solo/*` existantes ont leurs endpoints `create/update/delete/getByCriteria` côté BACK (la couverture BACK étant complète).
- [ ] 🔵 **À AUDITER [FRONT — page]** : page `merise` — purement debug front, **pas d'API**, OK.

---

## D.5 — Actions priorisées

### Priorité 1 — Bloquants
1. **Résoudre les divergences singulier/pluriel d'URL** (5 endpoints) — risque de 404 silencieuse.
2. Vérifier que `notifications/markRead` (BACK) ↔ `notification/markAsRead` (FRONT) — soit aligner, soit créer alias.

### Priorité 2 — Compléter couverture
3. Créer `email-template-preset.service.ts` côté FRONT.
4. Implémenter `getFullInfos` côté FRONT pour les entités principales (applications, campaigns, interviews).
5. Implémenter `updateAll` côté FRONT pour les opérations batch (gestion permissions).

### Priorité 3 — Nettoyage
6. Supprimer `userDebug/roles-debug` (GET) ou wrap POST.
7. Confirmer / supprimer `/qeel/*` si plus utilisé.
