# Dashboard Specialities

## 1. Identite

- Route: `/dashboard/specialities`
- Guard: aucun guard dédié sur la route enfant; accès hérité du shell `dashboard` via `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/specialities/specialities.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/specialities/specialities.html`

## 2. Objectif Produit

La page sert à gérer les spécialités métier actives, avec rattachement optionnel à un département, filtres de consultation et CRUD restreint au mode admin.

## 3. Etat Constate

- [x] La route ne porte pas de `permissionGuard` spécifique.
- [x] Le CRUD visible dépend malgré tout de `adminMode` côté front.
- [x] La page charge à la fois les spécialités et les départements actifs pour le rattachement.
- [x] Elle permet de filtrer par département.
- [x] En tant que page métier `/dashboard/specialities`, elle ne charge plus que les spécialités actives et n’expose plus ni vision des supprimées ni restauration; ces usages sont réservés à `/dashboard/entities/specialities`.
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
- [x] filtre supplémentaire par département

### 4.3 Grille des spécialités

- [x] carte avec initiale
- [x] nom et description
- [x] mention du département rattaché
- [x] actions `modifier`, `supprimer`

### 4.4 Modales

- [x] création / édition avec sélection facultative du département
- [x] suppression

## 5. Donnees Affichees Ou Editees

- `id`
- `nom` / `name` / `specialityName`
- `description`
- `departmentId`
- `departmentName`
- `dateCreation` / `createdAt`

## 6. Services Et Endpoints

- `SpecialityService.getAll()` -> chargement spécialités
- `SpecialityService.create()` -> `/specialities/create`
- `SpecialityService.update()` -> `/specialities/update`
- `SpecialityService.delete()` -> `/specialities/delete`
- `DepartmentService.getAllDepartmentsByCriteria()` -> chargement des départements disponibles

## 7. Ce Que Le Backend Doit Envoyer

- Une liste de spécialités avec rattachement département suffisamment explicite.
- Des départements actifs pour alimenter le sélecteur de rattachement.
- Un chargement borné aux spécialités actives (`isDeleted = false`) sur cette page métier; les supprimées et la restauration relèvent de `/dashboard/entities/specialities`.
- Des validations métier empêchant une suppression incohérente si la spécialité est déjà utilisée ailleurs.

## 8. Entites Metier Impliquees

- `speciality`
- `department`
- références éventuelles depuis `campaign`, `question` ou autres écrans métier

## 9. Questions Ou Ecarts A Qualifier

- [ ] L’accès lecture devrait-il être contrôlé par une permission dédiée ?
- [ ] Une spécialité sans département doit-elle rester autorisée métier ?
- [ ] Quels objets métier doivent empêcher la suppression d’une spécialité utilisée ?
- [x] La règle métier est désormais figée: `/dashboard/specialities` ne doit charger que les spécialités actives et ne doit jamais exposer de restauration ni de vision des supprimées, même pour un utilisateur `SUPER`; ces usages appartiennent à `/dashboard/entities/specialities`.
- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/specialities`.
2. Vérifier le chargement de la liste et du filtre département.
3. Créer une spécialité avec et sans rattachement département.
4. Filtrer par département.
5. Supprimer une spécialité puis vérifier qu’elle disparaît de la page métier sans possibilité de restauration ici.
6. Vérifier que la restauration éventuelle reste cantonnée à `/dashboard/entities/specialities`.
7. Vérifier la cohérence des données sur les autres écrans qui utilisent les spécialités.