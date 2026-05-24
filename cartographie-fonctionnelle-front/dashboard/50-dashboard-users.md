# Dashboard Users

## 1. Identite

- Route: `/dashboard/users`
- Guard: `permissionGuard(['VIEW_USER'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/users/users.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/users/users.html`

## 2. Objectif Produit

La page sert à consulter l’équipe applicative et, si le mode admin est activé, à créer, modifier ou supprimer des utilisateurs.

## 3. Etat Constate

- [x] La consultation de la page repose sur `VIEW_USER`.
- [x] Les actions d’administration visibles reposent en plus sur l’état local `adminMode` du compte courant.
- [x] La liste affiche identité, pseudo, email, rôle et statut en ligne/hors ligne.
- [x] La suppression exige une confirmation par saisie exacte de l’email de l’utilisateur ciblé.
- [x] La page charge jusqu’à 100 utilisateurs sans pagination visible.
- [ ] Vérifier si `VIEW_USER` sans `adminMode` est bien le comportement attendu pour une simple consultation.
- [ ] Vérifier si 100 entrées suffisent dans les environnements plus volumineux.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Équipe`
- [x] compteur d’utilisateurs filtrés
- [x] bouton `Créer un utilisateur` si admin mode

### 4.2 Recherche et filtres

- [x] recherche par nom, prénom, pseudo, email
- [x] filtres `Tous`, `En ligne`, `Hors ligne`

### 4.3 Cartes utilisateur

- [x] avatar initiales
- [x] nom complet
- [x] pseudo
- [x] email
- [x] badge rôle
- [x] badge présence en ligne
- [x] actions modifier / supprimer si admin mode

### 4.4 Modales

- [x] création / édition utilisateur
- [x] suppression avec confirmation par email

## 5. Donnees Affichees Ou Editees

- `id`
- `prenom`
- `nom`
- `pseudo`
- `email`
- `telephone`
- `role`
- `isOnline`
- `adminMode` du compte courant pour débloquer le CRUD

## 6. Services Et Endpoints

- `UserService.getByCriteria({ size: 100, page: 0 })` -> chargement liste utilisateurs
- `UserService.create()` -> `/user/create`
- `UserService.update()` -> `/user/update`
- `UserService.delete()` -> `/user/delete`
- `AuthService.getCurrentUser()` -> détermine `adminMode`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste utilisateur cohérente avec `VIEW_USER`.
- Des champs uniformes sur identité, rôle et présence (`isOnline`).
- Des validations explicites sur email, pseudo et rôle à la création ou mise à jour.
- Une suppression sécurisée côté backend, indépendamment de la confirmation textuelle purement front.

## 8. Entites Metier Impliquees

- `user`
- rôles système
- statut de présence

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le `mode admin` doit-il être une permission backend plutôt qu’un simple flag utilisateur local ?
- [ ] Faut-il une pagination serveur et des filtres backend si la volumétrie augmente ?
- [ ] La suppression devrait-elle être soft-delete avec restauration visible ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/users` avec un compte disposant de `VIEW_USER`.
2. Vérifier les filtres de recherche et de présence.
3. Activer le mode admin si nécessaire puis créer un utilisateur.
4. Modifier un utilisateur existant.
5. Supprimer un utilisateur en confirmant avec son email exact.
6. Vérifier le rafraîchissement de la liste après chaque action.