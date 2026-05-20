# Dashboard Profile

## 1. Identite

- Route: `/dashboard/profile`
- Guard: page fille du shell `dashboard`, protégée par `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/profile/profile.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/profile/profile.html`

## 2. Objectif Produit

La page permet à l’utilisateur connecté de gérer ses informations personnelles, son mot de passe et sa relation aux groupes métiers.

## 3. Etat Constate

- [x] La page affiche l’identité utilisateur de base avec avatar initiales, email et rôle.
- [x] L’édition du profil gère séparément nom/prénom et changement d’email.
- [x] Le changement d’email demande une confirmation par mot de passe actuel.
- [x] Le changement de mot de passe utilise un endpoint dédié distinct du service utilisateur standard.
- [x] Les groupes métiers actuels sont chargés et affichés.
- [x] L’utilisateur peut demander à rejoindre un nouveau groupe via une modal.
- [x] Un avertissement est affiché si l’utilisateur a encore son mot de passe par défaut.
- [ ] Vérifier si la politique `mustChangePassword` bloque réellement d’autres pages ou sert seulement d’alerte.
- [ ] Vérifier si les demandes de groupe doivent être visibles ailleurs côté managers/admins.

## 4. Blocs UI Constates

### 4.1 Identité

- [x] titre `Mon profil`
- [x] avatar avec initiales
- [x] nom complet
- [x] email
- [x] badge rôle

### 4.2 Informations personnelles

- [x] vue lecture seule
- [x] bascule `Modifier / Annuler`
- [x] édition de prénom, nom, email
- [x] demande du mot de passe actuel si l’email change
- [x] message de succès/erreur

### 4.3 Groupes métier

- [x] liste des groupes actuels
- [x] badges de demandes en attente
- [x] bouton `Rejoindre un groupe`
- [x] modal de demande avec groupe cible et raison

### 4.4 Mot de passe

- [x] formulaire dédié
- [x] affichage/masquage des mots de passe
- [x] validations longueur et confirmation

## 5. Donnees Affichees

### 5.1 Utilisateur

- `id`
- `firstName`
- `lastName`
- `email`
- `role`
- `isDefaultPassword`

### 5.2 Groupes métier

- `BusinessGroup[]` de l’utilisateur
- `GroupChangeRequest[]` en attente
- liste de tous les groupes disponibles pour demande

## 6. Services Et Endpoints

### 6.1 Profil utilisateur

- `UserService.update()` -> `POST /user/update`
- `UserService.changeEmail()` -> `POST /userManager/changerEmail`
- changement de mot de passe direct via `POST /userManager/changerMotDePasse`

### 6.2 Groupes métier

- `UserBusinessGroupService.getAllByCriteria()` -> `POST /userBusinessGroup/getAllByCriteria`
- `BusinessGroupCrudService.getAllByCriteria()` -> `POST /businessGroup/getAllByCriteria`
- `GroupChangeRequestService.getAllByCriteria()` -> `POST /groupChangeRequest/getAllByCriteria`
- `GroupChangeRequestService.create()` -> `POST /groupChangeRequest/create`

### 6.3 Contexte local

- `AuthService.currentUser$` et `updateCurrentUser()` pour refléter immédiatement les changements côté UI

## 7. Ce Que Le Backend Doit Envoyer

- Un profil utilisateur fiable, cohérent avec la session JWT / locale.
- Des erreurs explicites pour email déjà utilisé, mot de passe invalide ou règle de sécurité non respectée.
- Des groupes métiers et demandes de groupe filtrés sur l’utilisateur courant.
- Un booléen ou équivalent de type `isDefaultPassword` / `mustChangePassword` exploitable côté front.

## 8. Entites Metier Impliquees

- `user`
- `businessGroup`
- `userBusinessGroup`
- `groupChangeRequest`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le changement de mot de passe par défaut doit-il forcer une redirection vers une page dédiée ?
- [ ] Les demandes de groupe doivent-elles être approuvées dans une autre page admin dédiée ?
- [ ] Le rôle affiché doit-il être enrichi par permissions ou groupes métier ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/profile` avec un utilisateur connecté.
2. Modifier prénom/nom puis sauvegarder.
3. Modifier l’email en fournissant le mot de passe actuel.
4. Changer le mot de passe et vérifier la disparition de l’état `default password` si applicable.
5. Vérifier les groupes métier affichés.
6. Envoyer une demande pour rejoindre un autre groupe.