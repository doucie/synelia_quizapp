# Entities Forms

## 1. Identite

- Routes: `/dashboard/entities/forms` et `/dashboard/entities/forms/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/forms/entities-forms.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/forms/entities-forms.html`

## 2. Objectif Produit

La page administre les formulaires rattaches aux campagnes. Elle est la porte d'entree du sous-systeme de quiz/formulaires et sert de parent a la chaine `formulaire -> version -> question`, qui alimente ensuite l'assignation de formulaires sur les candidatures.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, nom du formulaire, campagne, actif, suppression et intervalles de dates.
- [x] Le tableau expose `formName`, `formDesc`, `isActive`, `campaignId` et `createdAt`.
- [x] Chaque ligne peut s'etendre pour afficher les versions du formulaire.
- [x] Les modales create/edit permettent de saisir nom, description, campagne et statut actif.
- [x] La restauration est supportee.
- [ ] Les cles de colonnes TS restent `name`, `description`, `active`, alors que les donnees reelles sont `formName`, `formDesc`, `isActive`.
- [ ] Le filtre campagne affiche `campaignTitle`, mais les modales create/edit affichent `campaignName`; la surface est heterogene sur le libelle principal d'une campagne.
- [ ] `FormService.create/update/delete/restore` envoie encore `user: 1` en dur.
- [ ] La page ne montre rien des strategies d'assignation de formulaires portees par la campagne (`RANDOM`, `SOURCE_TOKEN`, etc.), alors que le lien formulaire-campagne a un impact metier reel sur les candidatures.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `formName`
- [x] filtre `campaignId`
- [x] filtre `isActive`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `name`, `description`, `active`, `campaignId`, `createdAt`
- [x] badge booleen `Oui` / `Non` sur l'etat actif
- [x] bouton d'expansion `Voir les versions`
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] detail panel branche en bas de page

### 4.4 Expansion enfant

- [x] liste des versions du formulaire
- [x] affichage `versionNumber`, badges `Publie` / `Brouillon` et `Verrouille`

### 4.5 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation formulaire
- [x] edition formulaire

## 5. Donnees Affichees Ou Editees

- `id`
- `formName`
- `formDesc`
- `isActive`
- `campaignId`
- `isDeleted`
- `createdAt`
- versions enfants chargees par `formId`

## 6. Services Et Endpoints

- liste via `FormService.getAllByCriteria()` -> `POST /form/getAllByCriteria`
- creation via `FormService.create()` -> `POST /form/create`
- edition via `FormService.update()` -> `POST /form/update`
- suppression via `FormService.delete()` -> `POST /form/delete`
- restauration via `FormService.restore()` -> `POST /form/update`
- chargement des versions enfants via `FormVersionService.getAllByCriteria()` -> `POST /formversion/getAllByCriteria`
- chargement des campagnes FK via `CampaignService.getAllCampaignsByCriteria()` -> `POST /campaigns/getAllByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse paginee `getAllByCriteria` avec `items` ou `item`, plus `totalCount` ou `count`.
- Des formulaires contenant `formName`, `formDesc`, `isActive`, `campaignId`, l'etat de suppression et les dates.
- Des campagnes avec un libelle exploitable de facon coherente dans tous les selects (`campaignTitle` et/ou `campaignName`).
- Des versions enfants chargeables par `formId` pour que l'expansion reste utile.
- Un lien coherent entre formulaire, campagne et strategie d'assignation des formulaires au moment de la creation d'une candidature.

## 8. Entites Metier Impliquees

- `form`
- `formVersion`
- `campaign`
- assignation de formulaires sur les candidatures

## 9. Questions Ou Ecarts A Qualifier

- [ ] Les cles de colonnes doivent-elles etre renommees pour coller au DTO reel ?
- [ ] Faut-il normaliser le libelle campagne entre `campaignTitle` et `campaignName` ?
- [ ] Les mutations doivent-elles reutiliser l'utilisateur courant au lieu de `1` ?
- [ ] La route doit-elle rendre plus visibles les consequences metier du couple `campagne <-> formulaire` ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/forms` avec un compte autorise.
2. Filtrer par nom de formulaire, campagne et statut actif.
3. Creer un formulaire rattache a une campagne.
4. Ouvrir l'expansion `versions` pour verifier le chainage.
5. Modifier puis supprimer/restaurer un formulaire.
