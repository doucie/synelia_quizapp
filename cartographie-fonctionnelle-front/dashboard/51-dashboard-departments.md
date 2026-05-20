# Dashboard Departments

## 1. Identite

- Route: `/dashboard/departments`
- Guard: aucun guard dédié sur la route enfant; accès hérité du shell `dashboard` via `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/departments/departments.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/departments/departments.html`

## 2. Objectif Produit

La page sert à consulter et administrer les départements de référence utilisés dans le produit, avec possibilité de création, modification, suppression et restauration.

## 3. Etat Constate

- [x] La page est montée sans `permissionGuard` spécifique.
- [x] Le CRUD visible est néanmoins protégé côté UI par `adminMode`.
- [x] Les départements peuvent être filtrés entre actifs et supprimés.
- [x] Une restauration est proposée pour les départements supprimés.
- [x] La carte remonte aussi le nombre de spécialités associées quand disponible.
- [ ] Vérifier si l’absence de guard dédié est volontaire ou un écart de sécurité.
- [ ] Vérifier la stratégie de suppression en cascade avec les spécialités associées.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Départements`
- [x] compteurs total / actifs
- [x] bouton `Actualiser`
- [x] bouton `Nouveau département` si admin mode

### 4.2 Filtres

- [x] recherche texte
- [x] filtres `Tous`, `Actifs`, `Supprimés`

### 4.3 Grille des départements

- [x] carte avec initiale
- [x] nom et description
- [x] badge `Supprimé` si soft-delete
- [x] actions `modifier`, `supprimer`, `restaurer` selon état
- [x] compteur de spécialités associées

### 4.4 Modales

- [x] création / édition
- [x] suppression avec rappel du nombre de spécialités associées

## 5. Donnees Affichees Ou Editees

- `id`
- `nom` / `name`
- `description`
- `isDeleted`
- `associatedSpecialitiesCount`
- `dateCreation` / `createdAt`

## 6. Services Et Endpoints

- `DepartmentService.getAllDepartmentsByCriteria()` -> chargement liste
- `DepartmentService.create()` -> `/departments/create`
- `DepartmentService.update()` -> `/departments/update`
- `DepartmentService.delete()` -> `/departments/delete`
- `DepartmentService.restore()` -> `/departments/restore`
- `AuthService.getCurrentUser()` -> contrôle du `adminMode`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste de départements y compris le statut `isDeleted` si le front doit gérer actifs et supprimés.
- Un compteur fiable des spécialités associées quand il est affiché.
- Une suppression maîtrisée quand des spécialités référencent encore le département.
- Une restauration compatible avec les relations existantes.

## 8. Entites Metier Impliquees

- `department`
- `speciality`

## 9. Questions Ou Ecarts A Qualifier

- [ ] L’accès lecture devrait-il être limité par permission dédiée, comme pour les autres pages métier ?
- [ ] La suppression doit-elle être refusée si des spécialités restent liées, ou autoriser une cascade ?
- [ ] Faut-il afficher plus de métadonnées d’usage avant suppression ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/departments` avec un utilisateur authentifié.
2. Vérifier l’accès effectif avec et sans mode admin.
3. Créer un département.
4. Modifier sa description.
5. Le supprimer puis vérifier son apparition dans `Supprimés`.
6. Restaurer le département et vérifier sa réapparition dans `Actifs`.