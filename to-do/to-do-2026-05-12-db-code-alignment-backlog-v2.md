# Backlog Z (révision 2026-05-12) — Compléments suite au feedback utilisateur

**Date :** 2026-05-12
**Statut :** ✅ Compléments au backlog Z initial

> Ce fichier **complète** [to-do-2026-05-11-db-code-alignment-backlog.md](../to-do-2026-05-11-db-code-alignment-backlog.md). Numérotation reprend à `Z-200`.
> Les items dégradés / annulés sont listés en [J.4](livrables/J-decisions-et-arbitrages.md#j4--items-annulés--dégradés-en-priorité).

---

## Nouveaux items P0 (CRITIQUE)

- [ ] **Z-200** [P0][SÉCURITÉ] Validation backend stricte des enums sur **tous** les endpoints (`@Pattern` ou type Enum natif Jackson) — retour 400 sur valeur hors enum. *(D-013, K.8)*
- [ ] **Z-201** [P0][AUTH] Auditer la chaîne **récupération de mot de passe** (forgot-password / reset-password) — endpoint, email, page, token. *(K.7)*
- [ ] **Z-220** [P0][FRONT] Créer un **composant pagination réutilisable** et l'appliquer aux pages métier (campaigns, applications, decisions, evaluations, interviews, notifications, etc.). *(K.4)*

---

## Nouveaux items P1 (HAUTE)

### Enums & statuts
- [ ] **Z-210** [P1][ENUM-BACK] `CampaignStatus` doit inclure la valeur **`DRAFT`**. Valeurs finales : `DRAFT`, `ACTIVE`, `PENDING`, `CLOSED`. *(D-001)*
- [ ] **Z-211** [P1][BD/BACK] Ajouter `applications.is_archived` (boolean) + logique d'archivage post-abandon prolongé. *(J.1 application_abandoned)*
- [ ] **Z-212** [P1][BD/BACK] Ajouter `campaigns.random_questions` (boolean) si pas déjà — pour permettre la politique de reprise quiz. *(J.3 Q-001)*

### `search_string`
- [ ] **Z-202** [P1][BD/BACK] Vérifier que **toutes** les colonnes `search_string` sont de type `TEXT` (pas `VARCHAR`). Migration si besoin. *(J.1)*
- [ ] **Z-203** [P1][BACK] Mécanisme `search_string` : à chaque création/update entité, **régénérer intégralement** (pas append). Concaténer tous les champs séparés par virgules. *(J.1)*
- [ ] **Z-204** [P1][BACK] Gestion overflow `search_string` : si taille générée > `TEXT` max → **tronquer + log warning** OU **stratégie de réduction** (skip certains champs longs). À documenter. *(J.1)*

### Pages métier (reformulées vs Z initial)
- [ ] **Z-230** [P1][FRONT-PAGE] Refondre Z-030 : page `forms` (recruteur) avec **onglet "Historique versions"** + bouton **restaurer une version**. *(D-002)*
- [ ] **Z-231** [P1][FRONT-PAGE] Refondre Z-035 : intégrer **workflow `candidate-ask`** (APPROVE/REJECT) **dans la page candidat** (`/dashboard/applications` détail) ou page dédiée recruteur — à confirmer. *(D-006, E.3)*
- [ ] **Z-232** [P1][FRONT-PAGE] Refondre Z-034 : intégrer **correction manuelle** comme **onglet dans détail candidat** (`/dashboard/applications/:id`). *(D-006)*
- [ ] **Z-233** [P1][FRONT-PAGE] Refondre Z-037 : **page détail business-group** avec onglets Membres + Admins + **Demandes d'adhésion** (visible aux admins du groupe). *(D-005)*
- [ ] **Z-234** [P1][FRONT-PAGE] Refondre Z-038 : pages métier **emails + email-template-presets couplées** (templates + presets dans même flow). *(D-007)*
- [ ] **Z-235** [P1][FRONT-PAGE] **Page candidat** "Campagnes en cours / à venir / récemment terminées" (`/campagnes` ou nom à définir). *(D-008, E.4)*

### Système notifications
- [ ] **Z-240** [P1][BACK/FRONT] **Audit complet des notifications** : tableau événement métier × notif générée × destinataires. *(K.6)*
- [ ] **Z-241** [P1][FRONT] Page feed notifications utilisateur (`/dashboard/notifications`) — déjà Z-036 mais aussi badge non-lu dans header.

### Audits UI
- [ ] **Z-250** [P1][FRONT] Audit **routes orphelines** (cf. K.2).
- [ ] **Z-251** [P1][FRONT] Audit **boutons / liens morts** (cf. K.3).
- [ ] **Z-252** [P1][FRONT] Audit **filtres de recherche fonctionnels** (cf. K.5).

### Page Merise (vraie API)
- [ ] **Z-260** [P1][BACK] Créer endpoint `POST /merise/getSchema` retournant tables + relations + positions calculées algorithmiquement.
- [ ] **Z-261** [P1][FRONT] Refondre page `merise` pour consommer cette API au lieu de tout hardcoder. *(D-014)*

### Permissions read-only ADMIN/RECRUITER
- [ ] **Z-270** [P1][FULL-STACK] `smtp_config` et `app_config` : **lecture seule** pour ADMIN/RECRUITER, modif réservée SUPER. UI + backend. *(D-009)*

### Endpoints non-utilisés à câbler (cf. D.1 révisé)
- [ ] **Z-280** [P1][FRONT] Câbler `getAllByCriteria` + `updateAll` + `updateDeleted` sur **toutes** les pages `/dashboard/entities/*` (super-admin : voir + restaurer enregistrements logiquement supprimés). *(D.1 révisé)*
- [ ] **Z-281** [P1][FRONT] Câbler `getByCriteria` + `update` (VOIR/MODIFIER par défaut) sur les autres pages métier où ce n'est pas déjà le cas. *(D.1 révisé)*
- [ ] **Z-282** [P1][AUDIT] Pour chaque API non consommée FRONT (cf. D.1) : **déterminer où elle doit être appelée**. Ne pas supprimer si endpoint utile.

### Invitation code & comptes candidats
- [ ] **Z-290** [P1][BACK] Validation email **obligatoire après inscription via invitation_code**. *(D-010)*
- [ ] **Z-291** [P1][BD/BACK] Ajouter `app_config.invitation_code_expiration_days` (numeric). Backend lit cette valeur à la création du code. *(D-011)*
- [ ] **Z-292** [P1][BD/BACK/FRONT] **Table comptes candidats** (`candidate_account` ou équivalent) + activation par admin via `candidate_accounts_enabled`. Permet suivi multi-candidatures + abonnement campagnes. *(J.1, E.4)*

---

## Nouveaux items P2 (MOYENNE)

### Pipeline emails (suite Q-002)
- [ ] **Z-300** [P2][BD] Ajouter `pipeline_stage.email_required` (boolean) + `pipeline_stage.email_automatic` (boolean) — *si décision = option B*. *(J.3 Q-002)*
- [ ] **Z-301** [P2][BD/BACK] Mécanisme **`mail_log`** générique (audit RGPD) OU `application_progress.mail_sent` — *à trancher Q-007*. *(J.3 Q-007)*
- [ ] **Z-302** [P2][FRONT] UI : si `email_required && !email_automatic`, bouton "Envoyer email" + zone note libre avant signature. *(J.3 Q-002)*
- [ ] **Z-303** [P2][BACK] Supprimer / déprécier `applications.pre_screen_decision_mail_sent` + `final_decision_mail_sent`. Migration vers Z-301. *(J.1)*

### `is_timed` + chronométrage
- [ ] **Z-310** [P2][BD/BACK/FRONT] Cadrer le chronométrage selon Q-003 : UI checkbox + champ durée + politique application backend. *(J.3 Q-003)*

### `max_apply`
- [ ] **Z-320** [P2][BACK] Appliquer la limite `campaigns.max_apply` côté backend lors de `applications/create`. Retour erreur claire si atteinte. *(G.1, J.1)*

### `application_abandoned`
- [ ] **Z-330** [P2][FRONT] Bouton "Abandonner ma candidature" sur page suivi candidat. *(J.1)*
- [ ] **Z-331** [P2][BACK] Tâche planifiée : marquer candidatures abandonnées si étape pipeline non franchie depuis X jours (X configurable `app_config`). *(J.1)*

### `campaign_crud` vs `entity_permission`
- [ ] **Z-340** [P2][BD/BACK] **Q-004 à trancher** : refonte `campaign_crud` → `entity_permission` étendu (FunctionalityEnum `CAMPAIGN_PLANIFY_INTERVIEW`, etc.) ou cohabitation. *(J.3 Q-004)*

### `entity_permission` enrichi
- [ ] **Z-350** [P2][BD/BACK] **Q-005 à trancher** : ajouter `entity_permission.business_group_id` + `entity_permission.role_id` (nullable) — 1 enregistrement pour un groupe entier. Documenter ordre d'évaluation. *(J.3 Q-005)*

### Badges / tooltips formulaires
- [ ] **Z-360** [P2][FRONT] Ajouter **badges (?) avec tooltip** sur les champs formulaires complexes (création/modification). Tooltip apparaît après ~1s de survol. *(feedback)*

### Lien "Connexion" voilé
- [ ] **Z-370** [P2][FRONT] **Q-006 à trancher** : ajouter un accès voilé à `/connexion` depuis `/` (footer discret, icône, ou autre). *(J.3 Q-006)*

### `EntityPermission` row-level
- [ ] **Z-380** [P2][BACK] Confirmer filtrage `is_deleted=false` par défaut sur tous les `getByCriteria` (sinon IDOR sur lignes supprimées). *(I.1)*

---

## Nouveaux items P3 (MINEURE)

- [ ] **Z-400** [P3][AUDIT] K.1 Colonnes BD mortes (audit cadré).
- [ ] **Z-401** [P3][AUDIT] K.9 Héritage `EntityCrudBase`.
- [ ] **Z-402** [P3][AUDIT] K.10 `cleanFormData()` systématique.
- [ ] **Z-403** [P3][AUDIT] K.11 `legal_text` settings fonctionnement.
- [ ] **Z-404** [P3][AUDIT] K.12 source-tokens dans campaign-form.
- [ ] **Z-405** [P3][AUDIT] K.13 `/qeel/*` toujours utilisé ?
- [ ] **Z-406** [P3][AUDIT] K.14 Minio vs uploads local.
- [ ] **Z-407** [P3][AUDIT] K.15 Quiz reprise (Q-001 prérequis).
- [ ] **Z-408** [P3][BACK] Créer placeholder V1_034 si on veut rétablir le fichier (sinon laisser comme tel, BD enregistrée). *(J.1)*

---

## Items annulés / dégradés (rappel)

Voir [J.4](livrables/J-decisions-et-arbitrages.md#j4--items-annulés--dégradés-en-priorité) :
- Z-031 (page form-versions), Z-033 (page source-tokens), Z-039 (page legal-texts) → annulés
- Z-161 (harmoniser pluriel) → dégradé P4
- Z-038, Z-037, Z-034 → reformulés (Z-234, Z-233, Z-232)

---

## Synthèse mise à jour

| Priorité | Compte Z initial | Compléments 2026-05-12 | Total |
|---|---:|---:|---:|
| P0 | 7 | 3 | 10 |
| P1 | 36 | ~30 | ~66 |
| P2 | 34 | ~13 | ~47 |
| P3 | 23 | 9 | 32 |
| **Total** | 100 | ~55 | **~155** |

---

## Questions ouvertes à trancher (synthèse)

Voir [J.3](livrables/J-decisions-et-arbitrages.md#j3--questions-ouvertes-à-trancher) :
- **Q-001** : politique reprise quiz quand aléa.
- **Q-002** : envoi mails pipeline (auto vs manuel par étape).
- **Q-003** : mode chronométrage campagne.
- **Q-004** : `campaign_crud` à fusionner avec `entity_permission` ?
- **Q-005** : `entity_permission` + `business_group_id`/`role_id` ?
- **Q-006** : lien "Connexion" voilé sur `/` — quel format ?
- **Q-007** : où tracer `mail_sent` (per-step / per-entity / mail_log) ?
