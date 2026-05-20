# Dashboard Specialities

## 1. Identite

- Route: `/dashboard/specialities`
- Guard: aucun guard dédié sur la route enfant; accès hérité du shell `dashboard` via `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/specialities/specialities.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/specialities/specialities.html`

## 2. Objectif Produit

La page sert à gérer les spécialités métier, avec rattachement optionnel à un département, filtres de consultation et CRUD restreint au mode admin.

## 3. Etat Constate

- [x] La route ne porte pas de `permissionGuard` spécifique.
- [x] Le CRUD visible dépend malgré tout de `adminMode` côté front.
- [x] La page charge à la fois les spécialités et les départements actifs pour le rattachement.
- [x] Elle permet de filtrer par statut et par département.
- [x] Elle supporte la restauration des spécialités supprimées.
- [ ] Vérifier si l’absence de guard dédié est un choix ou un oubli de sécurité.
- [ ] Vérifier si la suppression d’une spécialité liée à des campagnes/questions reste cohérente côté backend.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Spécialités`
- [x] compteurs total / actives
- [x] bouton `Actualiser`
- [x] bouton `Nouvelle spécialité` si admin mode

### 4.2 Filtres

- [x] recherche texte
- [x] filtres `Tous`, `Actives`, `Supprimées`
- [x] filtre supplémentaire par département

### 4.3 Grille des spécialités

- [x] carte avec initiale
- [x] nom et description
- [x] mention du département rattaché
- [x] badge `Supprimée`
- [x] actions `modifier`, `supprimer`, `restaurer`

### 4.4 Modales

- [x] création / édition avec sélection facultative du département
- [x] suppression

## 5. Donnees Affichees Ou Editees

- `id`
- `nom` / `name` / `specialityName`
- `description`
- `departmentId`
- `departmentName`
- `isDeleted`
- `dateCreation` / `createdAt`

## 6. Services Et Endpoints

- `SpecialityService.getAll()` -> chargement spécialités
- `SpecialityService.create()` -> `/specialities/create`
- `SpecialityService.update()` -> `/specialities/update`
- `SpecialityService.delete()` -> `/specialities/delete`
- `SpecialityService.restore()` -> `/specialities/restore`
- `DepartmentService.getAllDepartmentsByCriteria()` -> chargement des départements disponibles

## 7. Ce Que Le Backend Doit Envoyer

- Une liste de spécialités avec rattachement département suffisamment explicite.
- Des départements actifs pour alimenter le sélecteur de rattachement.
- Un statut `isDeleted` fiable pour séparer consultation active et éléments restaurables.
- Des validations métier empêchant une suppression incohérente si la spécialité est déjà utilisée ailleurs.

## 8. Entites Metier Impliquees

- `speciality`
- `department`
- références éventuelles depuis `campaign`, `question` ou autres écrans métier

## 9. Questions Ou Ecarts A Qualifier

- [ ] L’accès lecture devrait-il être contrôlé par une permission dédiée ?
- [ ] Une spécialité sans département doit-elle rester autorisée métier ?
- [ ] Quels objets métier doivent empêcher la suppression d’une spécialité utilisée ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/specialities`.
2. Vérifier le chargement de la liste et du filtre département.
3. Créer une spécialité avec et sans rattachement département.
4. Filtrer par département et par statut.
5. Supprimer une spécialité puis la restaurer.
6. Vérifier la cohérence des données sur les autres écrans qui utilisent les spécialités.