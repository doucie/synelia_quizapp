# Dashboard Departments

## 1. Identite

- Route: `/dashboard/departments`
- Guard: aucun guard dédié sur la route enfant; accès hérité du shell `dashboard` via `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/departments/departments.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/departments/departments.html`

## 2. Objectif Produit

La page sert à consulter et administrer les départements de référence actifs utilisés dans le produit, avec possibilité de création, modification et suppression.

## 3. Etat Constate

- [x] La page est montée sans `permissionGuard` spécifique.
- [x] Le CRUD visible est néanmoins protégé côté UI par `adminMode`.
- [x] Les départements affichés sur cette page métier sont désormais limités aux actifs.
- [x] Aucune restauration n’est proposée sur cette page métier; ces usages sont réservés à `/dashboard/entities/departments`.
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

### 4.3 Grille des départements

- [x] carte avec initiale
- [x] nom et description
- [x] actions `modifier`, `supprimer`
- [x] compteur de spécialités associées

### 4.4 Modales

- [x] création / édition
- [x] suppression avec rappel du nombre de spécialités associées

## 5. Donnees Affichees Ou Editees

- `id`
- `nom` / `name`
- `description`
- `associatedSpecialitiesCount`
- `dateCreation` / `createdAt`

## 6. Services Et Endpoints

- `DepartmentService.getAllDepartmentsByCriteria()` -> chargement liste
- `DepartmentService.create()` -> `/departments/create`
- `DepartmentService.update()` -> `/departments/update`
- `DepartmentService.delete()` -> `/departments/delete`
- `AuthService.getCurrentUser()` -> contrôle du `adminMode`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste bornée aux départements actifs (`isDeleted = false`) sur cette page métier; les supprimés et la restauration relèvent de `/dashboard/entities/departments`.
- Un compteur fiable des spécialités associées quand il est affiché.
- Une suppression maîtrisée quand des spécialités référencent encore le département.

## 8. Entites Metier Impliquees

- `department`
- `speciality`

## 9. Questions Ou Ecarts A Qualifier

- [ ] L’accès lecture devrait-il être limité par permission dédiée, comme pour les autres pages métier ?
- [ ] La suppression doit-elle être refusée si des spécialités restent liées, ou autoriser une cascade ?
- [ ] Faut-il afficher plus de métadonnées d’usage avant suppression ?
- [x] La règle métier est désormais figée: `/dashboard/departments` ne doit charger que les départements actifs et ne doit jamais exposer de restauration ni de vision des supprimés, même pour un utilisateur `SUPER`; ces usages appartiennent à `/dashboard/entities/departments`.
- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/departments` avec un utilisateur authentifié.
2. Vérifier l’accès effectif avec et sans mode admin.
3. Créer un département.
4. Modifier sa description.
5. Le supprimer puis vérifier qu’il disparaît de la page métier sans possibilité de restauration ici.
6. Vérifier que la restauration éventuelle reste cantonnée à `/dashboard/entities/departments`.