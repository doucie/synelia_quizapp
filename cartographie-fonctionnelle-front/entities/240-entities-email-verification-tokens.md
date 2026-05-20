# Entities Email Verification Tokens

## 1. Identite

- Routes: `/dashboard/entities/email-verification-tokens` et `/dashboard/entities/email-verification-tokens/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/email-verification-tokens/entities-email-verification-tokens.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/email-verification-tokens/entities-email-verification-tokens.html`

## 2. Objectif Produit

La page administre les tokens de verification email. Elle sert a auditer et corriger des jetons sensibles lies a la verification d'adresse, mais l'UI reste minimaliste et expose quand meme directement une partie du secret applicatif.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec `EmailVerificationTokenService`.
- [x] La recherche avancee couvre l'email, la suppression et les plages de dates.
- [x] Le tableau expose email, token, type, expiration calculee, usage et date de creation.
- [x] La date d'expiration est evaluee uniquement cote front via `isExpired(item)` a partir de `expiresAt`.
- [x] Les modales create/edit permettent de modifier `email`, `tokenType`, `isUsed`, et en creation le `token` brut.
- [x] Le service supporte aussi des filtres `tokenType` et `isUsed`, absents de l'UI.
- [ ] Les cles de colonnes restent `type`, `expired`, `used`, alors que les champs reels sont `tokenType`, `expiresAt`, `isUsed`.
- [ ] Le tableau tronque le token mais l'affiche quand meme partiellement, ce qui reste sensible pour un jeton de verification.
- [ ] Le rendu du token ajoute toujours `...`, meme si la valeur est vide ou tres courte.
- [ ] Les champs `applicationId`, `userId`, `expiresAt` et `usedAt` existent dans le modele mais ne sont ni affiches ni editables dans cette route.
- [ ] La route ne propose aucune action metier specialisee de regeneration, consommation ou revocation autre que le CRUD brut.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `email`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`
- [ ] pas de filtre `tokenType`
- [ ] pas de filtre `isUsed`

### 4.3 Tableau principal

- [x] colonnes `id`, `email`, `token`, `type`, `expired`, `used`, `createdAt`
- [x] badge booleen pour expiration et utilisation
- [x] token tronque a l'affichage
- [x] actions edit / delete / restore
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation token de verification
- [x] edition token de verification

## 5. Donnees Affichees Ou Editees

- `id`
- `email`
- `token`
- `tokenType`
- `expiresAt`
- `isUsed`
- `createdAt`
- `usedAt`
- `applicationId`
- `userId`
- `isDeleted`

## 6. Services Et Endpoints

- liste CRUD via `EmailVerificationTokenService.getAllByCriteria()` -> `POST /emailVerificationToken/getByCriteria`
- creation via `create()` -> `POST /emailVerificationToken/create`
- edition via `update()` -> `POST /emailVerificationToken/update`
- suppression via `delete()` -> `POST /emailVerificationToken/delete`
- restauration via `restore()` -> `POST /emailVerificationToken/update`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getByCriteria` pagine avec `items` et `count` pour alimenter la grille.
- Des jetons contenant `email`, `tokenType`, `expiresAt`, `isUsed`, `applicationId`, `userId` quand ces rattachements existent.
- Un contrat stable sur l'expiration, puisque le front calcule localement `expired` a partir de `expiresAt`.
- Des mutations securisees, car cette route autorise encore la creation et l'edition directe de tokens.

## 8. Entites Metier Impliquees

- `emailVerificationToken`
- verification email candidat ou utilisateur
- rattachement optionnel a `application` et `user`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il masquer completement le token au lieu d'en afficher un extrait ?
- [ ] Faut-il exposer `tokenType` et `isUsed` dans les filtres avances ?
- [ ] Faut-il rendre visibles `expiresAt`, `usedAt`, `applicationId` et `userId` pour l'audit ?
- [ ] Cette route devrait-elle etre uniquement en lecture ou offrir une action de revocation dediee plutot qu'un CRUD complet ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/email-verification-tokens` avec un compte autorise.
2. Filtrer par email puis verifier l'etat expire/non expire.
3. Creer un token de verification et verifier son apparition dans la liste.
4. Modifier `tokenType` ou `isUsed` puis controler l'impact visuel.
5. Supprimer puis restaurer un token.
