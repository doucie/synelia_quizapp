# 480 - Evolution : Cycle de vie automatique des statuts de campagne

## Contexte

Les campagnes ont 5 statuts (`DRAFT`, `PENDING`, `OPEN`, `PAUSED`, `CLOSED`) avec une matrice de transitions autorisees dans `CampaignStatus.canTransitionTo()`. Actuellement, **toutes les transitions sont manuelles** : aucun scheduler ne met a jour les statuts automatiquement.

**Probleme concret** : une campagne avec `campaign_end < date du jour` reste `OPEN` dans la base. Elle est invisible sur `/campagnes` (condition 6 rejetee silencieusement par `CampaignPublicAccessService`) mais reste visible dans l'admin → incoherence.

**Contrat 450 (anti-triche)** : les 3 taches `@Scheduled` existantes (WebSocket stats 10s, user online 60s, abandon quiz 60s) ne touchent pas les campagnes. Leur pattern est la reference pour la nouvelle tache.

## Objectif

1. Remplacer la selection manuelle du statut par un booleen `isPublished`
2. Le statut est derive automatiquement de `isPublished` + `campaignStart`
3. Les actions de transition (publier, ouvrir, fermer, pauser, etc.) sont des boutons contextuels avec popups de confirmation
4. Un scheduler gere les transitions automatiques basees sur les dates
5. Les campagnes archivees ont leur propre onglet
6. La vue detaillee et l'edition passent en onglets

---

## Chantier A — Modele de donnees

- [x] A.1 Migration SQL `V1_085__add_campaigns_is_published.sql` : ajouter colonne `is_published BOOLEAN NOT NULL DEFAULT FALSE` + initialiser selon statut existant
- [x] A.2 Entite `Campaigns.java` : ajouter champ `isPublished` (Boolean, column `is_published`, NOT NULL, default `false`)
- [x] A.3 DTO `CampaignsDto.java` : ajouter champ `isPublished` (Boolean), `campaignStatus` reste en lecture (derive) plus en ecriture
- [x] A.4 Transformer `CampaignsTransformer.java` : mapper `isPublished` dans les deux sens

---

## Chantier B — Logique backend (statut derive)

### B.1 Methode `resolveCampaignStatus`

- [x] Creer methode `resolveCampaignStatus(isPublished, campaignStart)` → retourne DRAFT/PENDING/OPEN
- [x] Integrer dans `create()` : statut derive de `isPublished` + `campaignStart`
- [x] Integrer dans `update()` : recalculer statut via `resolveCampaignStatus()` avant validation

### B.2 `create()` — modifications

- [x] Supprimer `validateCampaignStatusOnCreate()`
- [x] Pas de validation dates pour brouillons (`isPublished=false`)
- [x] Avertissements (pas erreurs) si `isPublished=true` et `campaignStart` vide
- [x] Avertissements (pas erreurs) si `isPublished=true` et `campaignEnd` vide

### B.3 `update()` — modifications

- [x] Archiver : requiert `isPublished=false`
- [x] Desarchiver : `isArchived=false`, `isPublished` reste inchange

### B.4 Nouvelles actions backend

- [x] `publishCampaign(id)` : verifie prerequis (speciality, pipeline, form), passe `isPublished=true`, derive statut
- [x] `openCampaign(id)` : passe `isPublished=true`, met `campaignStart=today`, statut→OPEN
- [x] `closeCampaign(id)` : met `campaignEnd=today`, `isPublished=false`, statut→CLOSED
- [x] `pauseCampaign(id, resumeDate?)` : valide resumeDate si fournie, `isPublished=true` reste, statut→PAUSED
- [x] `resumeCampaign(id)` : `isPublished=true`, statut→OPEN
- [x] `unpublishCampaign(id)` : `isPublished=false`, statut→DRAFT
- [x] `archiveCampaign(id)` : verifie `isPublished=false`, `isArchived=true`
- [x] `unarchiveCampaign(id)` : `isArchived=false`

### B.5 Validations

- [x] Validation pause : si `resumeDate` fournie, `campaignStart` (si existe) ≤ maintenant < `resumeDate` < `campaignEnd` (si existe)
- [x] Validation "Ouvrir" : met `campaignStart = now()`, passe en OPEN
- [x] Validation "Publier" (depuis CLOSED) : demande `campaignStart` et `campaignEnd` (optionnels), passe `isPublished=true`

### B.6 `CampaignStatus.canTransitionTo()` — mise a jour

- [x] Appliquer la nouvelle matrice : DRAFT→PENDING/OPEN/CLOSED, PENDING→OPEN/DRAFT/CLOSED, OPEN→PAUSED/DRAFT/CLOSED, PAUSED→OPEN/DRAFT/CLOSED, CLOSED→DRAFT/PENDING/OPEN

### B.7 `CampaignLifecycleScheduler` — mise a jour

- [x] OPEN/PAUSED→CLOSED : mettre `isPublished=false`
- [x] PENDING→OPEN : `isPublished=true` (inchange)

### B.8 `CampaignPublicAccessService` — inchange

- [x] Verifier que le filtre public fonctionne toujours (verifie `campaignStatus=OPEN` + dates + maxApply)

### B.9 Controller endpoints

- [x] 8 endpoints REST ajoutes dans `CampaignsController.java` : `/publish`, `/open`, `/close`, `/pause`, `/resume`, `/unpublish`, `/archive`, `/unarchive`

---

## Chantier C — Frontend : formulaire campagne

### C.1 Toggle `isPublished` remplace dropdown statut

- [x] Supprimer le champ `campaignStatus` du formulaire reactif
- [x] Ajouter checkbox/toggle "Publie" / "Brouillon" (`isPublished`)
- [x] Adapter le template HTML (remplacer `<app-filter-select>` par un toggle)

### C.2 Avertissements dates

- [x] Quand `isPublished=true` et `campaignStart` vide → afficher avertissement
- [x] Quand `isPublished=true` et `campaignEnd` vide → afficher avertissement

### C.3 Soumission

- [x] Envoie `isPublished: true/false` au lieu de `campaignStatus`
- [x] Backend derive le statut

---

## Chantier D — Frontend : liste `/campaigns`

### D.1 Onglet "Archivees"

- [x] Ajouter type `CampaignTab = 'all' | 'my-campaigns' | 'shared' | 'archived'`
- [x] Ajouter bouton onglet "Archivees" dans le template

### D.2 Exclure archivees des autres onglets

- [x] Filtrer `isArchived=true` hors des onglets "Toutes", "Mes campagnes", "Partagees"

---

## Chantier E — Frontend : vue detaillee `/campaigns/:id`

### E.1 5 onglets

- [x] Onglet "General" : titre, description, dates, specialite, statut, isArchived, meta
- [x] Onglet "Pipeline" : pipeline template, stages visuels avec compteurs candidats
- [x] Onglet "Formulaires & Attribution" : formulaires rattaches, strategie, politique
- [x] Onglet "Candidatures & Tokens" : liens de candidature, tokens source, gestion des acces
- [x] Onglet "Recruteurs & Permissions" : recruteurs participants, matrice de permissions

### E.2 Actions par statut (barre d'actions)

- [x] DRAFT : boutons Publier, Archiver
- [x] PENDING : boutons Ouvrir, Depublier, Fermer
- [x] OPEN : boutons Pauser, Fermer
- [x] PAUSED : boutons Reprendre, Fermer
- [x] CLOSED : boutons Publier, Archiver
- [x] Archive : bouton Desarchiver

### E.3 Popups de confirmation

- [x] Popup Publier : "Mettre la campagne en ligne ?"
- [x] Popup Ouvrir : "Ouvrir la campagne maintenant ? La date de debut sera aujourd'hui."
- [x] Popup Fermer : "Fermer la campagne maintenant ? La date de fin sera aujourd'hui."
- [x] Popup Pauser : formulaire avec champ date de reprise (optionnel) + validation
- [x] Popup Reprendre : "Reprendre la campagne ?"
- [x] Popup Depublier : "Remettre en brouillon ? La campagne ne sera plus visible."
- [x] Popup Archiver : "Archiver cette campagne ? Elle sera deplacee dans l'onglet Archivees."
- [x] Popup Desarchiver : "Desarchiver cette campagne ? Elle redeviendra accessible."
- [x] Popup Brouillon : "Remettre en brouillon ?"

---

## Chantier F — Frontend : edition `/campaigns/:id/edit`

### F.1 Memes 5 onglets

- [x] Onglet "General" : champs editables generaux (titre, description, specialite, isPublished, dates, config)
- [x] Onglet "Pipeline" : selection template, configuration stages, migration modal
- [x] Onglet "Formulaires & Attribution" : strategie, politique, gestion formulaires
- [x] Onglet "Candidatures & Tokens" : placeholder (géré dans le détail)
- [x] Onglet "Recruteurs & Permissions" : allCanEvaluate, recruteurs, permissions
- [x] Bouton "Sauvegarder" global (hors onglets, toujours visible)

---

## Verification

- [x] `mvnw compile` : OK
- [x] `ng build` : OK
- [x] `ApplicationsBusinessTest` : 20/20 OK
- [ ] Tests manuels : creer brouillon, publier, ouvrir, pauser, reprendre, fermer, archiver, desarchiver
