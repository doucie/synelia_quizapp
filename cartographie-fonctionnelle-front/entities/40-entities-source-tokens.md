# Entities Source Tokens

## 1. Identite

- Routes: `/dashboard/entities/source-tokens` et `/dashboard/entities/source-tokens/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/source-tokens/entities-source-tokens.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/source-tokens/entities-source-tokens.html`

## 2. Objectif Produit

La page administre les `sourceToken` relies aux campagnes, c'est-a-dire la porte d'entree du flux public `/campagnes` -> `/postuler/:sourceToken`.

## 3. Etat Constate

- [x] La page n'etend pas `EntityCrudBase`; elle embarque son propre CRUD, detail panel, pagination et restauration.
- [x] La recherche rapide repose sur `search_string`.
- [x] Les filtres avances couvrent ID, nom de token, `campaignId`, suppression et date de creation.
- [x] Le tableau expose a la fois le nom fonctionnel du token et la valeur brute `tokenString`.
- [x] Les modales create/edit n'autorisent que `sourceTokenName` et `campaignId`; la valeur brute du token n'est jamais editee manuellement.
- [x] Les campagnes FK sont chargees pour les modales create/edit via `CampaignService`.
- [x] La restauration est supportee pour les tokens supprimes.
- [ ] Le message de suppression affirme que l'action est definitive, alors que la restauration existe ensuite.
- [ ] Le filtre avance demande un `campaignId` numerique libre alors que les modales utilisent un select de campagnes chargees.

## 4. Blocs UI Constates

### 4.1 Header et filtres

- [x] recherche rapide `Rechercher un token...`
- [x] checkbox `Afficher les tokens supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau token`

### 4.2 Filtres avances

- [x] plage ID
- [x] nom du token
- [x] `campaignId`
- [x] `isDeleted`
- [x] date de creation

### 4.3 Tableau principal

- [x] colonnes `id`, `name`, `token`, `campaignId`, `expiration`, `createdAt`
- [x] affichage du `tokenString` en clair
- [x] actions edit / delete ou restore selon `isDeleted`

### 4.4 Modales

- [x] confirmation suppression / restauration
- [x] edition token source
- [x] creation token source

## 5. Donnees Affichees Ou Editees

- `id`
- `sourceTokenName`
- `tokenString`
- `campaignId` ou `campaigns_id`
- `expirationDate`
- `createdAt`
- `isDeleted`

## 6. Services Et Endpoints

- liste restreinte via `SourceTokenService.getSourceTokensByCriteria()` -> `POST /sourceToken/getByCriteria`
- validation publique d'un token via `SourceTokenService.validateToken()` -> `GET /sourceToken/validate/:token`
- lecture publique detaillee via `SourceTokenService.getTokenInfo()` -> `GET /sourceToken/info/:token`
- creation admin via `SourceTokenService.createSourceTokens()` -> `POST /sourceToken/create`
- edition admin via `SourceTokenService.updateSourceToken()` -> `POST /sourceToken/update`
- suppression admin via `SourceTokenService.deleteSourceToken()` -> `POST /sourceToken/delete`
- liste admin incluant supprimes via `SourceTokenService.getAllSourceTokensByCriteria()` -> `POST /sourceToken/getAllByCriteria`
- restauration admin via `SourceTokenService.restoreSourceToken()` -> `POST /sourceToken/update`
- chargement FK campagnes via `CampaignService.getAllCampaignsByCriteria()`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste paginee de tokens avec `items` et `totalCount` ou `count`.
- Les champs `sourceTokenName`, `tokenString`, `campaignId` et `expirationDate` de facon stable.
- Des reponses publiques `validate` et `info` coherentes avec l'administration backend du token.
- Une suppression logique compatible avec la restauration front, sinon le wording `definitif` doit etre corrige.

## 8. Entites Metier Impliquees

- `source_token`
- `campaign`
- flux public de candidature par token

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le `tokenString` doit-il rester visible en clair dans le tableau admin ?
- [ ] Le filtre campagne doit-il migrer vers un select charge comme les modales ?
- [ ] Le wording de suppression doit-il etre aligne sur une suppression logique plutot que definitive ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/source-tokens`.
2. Filtrer par `campaignId` et par nom.
3. Creer un token relie a une campagne puis verifier son apparition dans la liste.
4. Modifier son nom ou sa campagne.
5. Supprimer puis restaurer le token.
6. Verifier ensuite son comportement dans le flux public `/campagnes` / `/postuler/:sourceToken`.
