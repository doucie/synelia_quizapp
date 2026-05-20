# Entities Invitation Codes

## 1. Identite

- Routes: `/dashboard/entities/invitation-codes` et `/dashboard/entities/invitation-codes/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/invitation-codes/entities-invitation-codes.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/invitation-codes/entities-invitation-codes.html`

## 2. Objectif Produit

La page administre les codes d'invitation utilises pour onboarder des comptes via email et role cible. Elle ressemble a un CRUD `entities/*`, mais c'est en pratique une surface de creation, consultation et suppression, pas une vraie edition complete du cycle de vie du code.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec `InvitationCodeService`.
- [x] Les filtres avances couvrent email, role, `isUsed`, suppression et plages de dates.
- [x] Le tableau expose email, role, code tronque, usage, expiration, suppression et date de creation.
- [x] La modale de creation permet de saisir `email` et `role` avec une liste fermee `ADMIN`, `RECRUITER`, `CANDIDATE`.
- [x] Le service expose des helpers metier absents de la route: `resend()`, `validateCode()`, `registerWithCode()`.
- [x] La creation et la suppression sont supportees.
- [x] `performUpdate()` et `performRestore()` levent explicitement une erreur: mise a jour et restauration non supportees, et la route assume maintenant cette absence au lieu de laisser des affordances trompeuses.
- [x] Le bloc mort de confirmation de restauration a ete retire du template, coherent avec l'absence de support metier de `restore()`.
- [x] La route affiche maintenant l'action `resend()` pour les codes actifs non utilises.
- [x] Le detail panel est conserve en lecture seule sur cette page: il n'expose plus de faux mode edition pour une entite non editable.
- [x] La colonne est alignee sur `expiredAt`, ce qui supprime l'incoherence de nommage `expiresAt` / DTO.

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
- [x] filtre `role`
- [x] filtre `isUsed`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `email`, `role`, `code`, `used`, `expiresAt`, `deleted`, `createdAt`
- [x] code tronque a l'affichage
- [x] badge booleen d'utilisation et suppression
- [x] action suppression seulement sur les lignes actives
- [x] action `Renvoyer` sur les lignes encore reutilisables (`!isDeleted`, `!isUsed`, email present)
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche

### 4.4 Modales

- [x] confirmation suppression
- [x] absence de confirmation restauration, conforme au contrat metier reel
- [x] creation code d'invitation
- [ ] pas de modale d'edition

## 5. Donnees Affichees Ou Editees

- `id`
- `email`
- `role`
- `code`
- `isUsed`
- `expiredAt`
- `isDeleted`
- `createdAt`
- `updatedAt`

## 6. Services Et Endpoints

- liste via `InvitationCodeService.getByCriteria()` -> `POST /invitationCode/getByCriteria`
- creation via `create()` -> `POST /invitationCode/create`
- suppression via `delete()` -> `POST /invitationCode/delete`
- reenvoi disponible via `resend()` -> `POST /invitationCode/resend`
- validation publique via `validateCode()` -> `POST /invitationCode/validate`
- inscription via code via `registerWithCode()` -> `POST /userManager/registerWithCode`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getByCriteria` pagine avec `items` et `count` pour alimenter la grille.
- Des codes stables sur `email`, `role`, `code`, `isUsed`, `expiredAt` et `isDeleted`.
- Une enforcement claire du caractere non editable d'un code deja cree si le produit confirme cette regle.
- Des endpoints metier fiables pour `resend`, `validate` et `registerWithCode`, puisque la route admin n'expose que `resend()` et laisse les deux autres helpers sur leurs parcours specialises.

## 8. Entites Metier Impliquees

- `invitationCode`
- onboarding utilisateur par invitation
- `userManager/registerWithCode`
- role cible du compte invite

## 9. Questions Ou Ecarts A Qualifier

- [x] `resend()` est expose dans cette route pour les codes encore exploitables.
- [x] La restauration est assumee hors scope et retiree du template.
- [x] Le detail panel reste en lecture seule plutot que de simuler une edition inexistante.
- [x] Le nom de champ `expiredAt` est aligne dans le composant et son template.
- [x] `validateCode()` et `registerWithCode()` restent volontairement hors de cette route admin, car ils appartiennent au parcours d'onboarding et non au CRUD technique.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/invitation-codes` avec un compte autorise.
2. Filtrer par email, role et usage.
3. Creer un nouveau code d'invitation.
4. Utiliser l'action `Renvoyer` sur un code actif non utilise et verifier le retour de succes.
5. Verifier son apparition avec code tronque et date d'expiration.
6. Supprimer le code et verifier son retrait logique.
