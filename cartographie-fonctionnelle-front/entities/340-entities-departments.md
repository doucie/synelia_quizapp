# Entities Departments

## 1. Identite

- Routes: `/dashboard/entities/departments` et `/dashboard/entities/departments/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/departments/entities-departments.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/departments/entities-departments.html`

## 2. Objectif Produit

La page administre les departements de reference dans une grille tabulaire avec expansion vers les specialites rattachees. Elle est plus brute que la page `dashboard/departments`, mais embarque aussi une mini-gestion inline des specialites par departement.

Le slice BL-008 la pose maintenant plus explicitement comme surface technique et renvoie vers `/dashboard/departments` comme page metier de reference pour la gestion quotidienne.

## 3. Etat Constate

- [x] La page n'etend pas `EntityCrudBase`; elle reimplemente localement le pattern CRUD.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/departments`.
- [x] Les departements peuvent etre crees, modifies, supprimes et restaures.
- [x] Une ligne peut etre expandee pour lister, creer, modifier, supprimer ou restaurer les specialites du departement.
- [x] Le service `DepartmentService` expose aussi `checkAssociatedSpecialities()` et `deleteWithCascade()`, non surfaces dans l'UI.
- [x] La suppression passe par `DashboardStatsService.checkDependencies()` avant confirmation.
- [x] La restauration passe par `checkParent()` avant confirmation.
- [x] La page `dashboard/departments` documentee ailleurs reste plus orientee produit avec cartes et `adminMode`, sans cette table brute ni ce guard.
- [x] La suppression expose maintenant l'option de cascade quand des specialites associees sont detectees via `checkAssociatedSpecialities()`.
- [x] La modale de suppression affiche le nombre de specialites associees et un apercu de leurs noms quand le backend les fournit.
- [ ] L'expansion charge toutes les specialites avec `size: 10000`, puis filtre cote front sur `departmentId`, ce qui est couteux et fragile.
- [ ] Cette logique depend fortement de la presence correcte de `departmentId` dans `SpecialityService`, alors que le mapping service est incomplet sur ce point.
- [ ] Le texte de pagination est corrompu par copier-coller: `sur X utilisateurs` et `Nombre d'utilisateurs par page` pour une page departements.
- [ ] Les champs `associatedSpecialitiesCount` et `associatedSpecialitiesNames` existent cote service mais ne sont pas exploites par la route.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] sous-texte qui explicite le statut de surface technique
- [x] bouton `Page metier`
- [x] recherche rapide `Rechercher un departement...`
- [x] checkbox `Afficher les departements supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau departement`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `nom`
- [x] filtre `description`
- [x] filtre `isDeleted`
- [x] dates de creation `dateCreation*`
- [x] dates de modification `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `name`, `description`, `createdAt`
- [x] actions edit / delete / restore
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche
- [x] bouton d'expansion par departement
- [x] suppression en cascade explicitement activable depuis la confirmation de suppression

### 4.4 Expansion specialites

- [x] compteur de specialites chargees
- [x] bouton `Ajouter une specialite`
- [x] edition inline de specialites du departement
- [x] suppression / restauration inline des specialites du departement
- [ ] duplication partielle de la route `entities/specialities`

### 4.5 Modales

- [x] confirmation suppression departement
- [x] confirmation suppression en cascade quand des specialites associees existent
- [x] confirmation restauration departement
- [x] creation departement
- [x] edition departement
- [x] creation / edition / suppression / restauration des specialites enfants

## 5. Donnees Affichees Ou Editees

- `id`
- `nom`
- `description`
- `isDeleted`
- `dateCreation`
- `dateModification`
- `createdAt`
- `updatedAt`
- enfants `speciality` relies au `departmentId`
- champs service non exploites: `associatedSpecialitiesCount`, `associatedSpecialitiesNames`, `cascadeDelete`

## 6. Services Et Endpoints

- liste via `DepartmentService.getAllDepartmentsByCriteria()` -> `POST /departments/getAllByCriteria`
- creation via `create()` -> `POST /departments/create`
- edition via `update()` -> `POST /departments/update`
- suppression via `delete()` -> `POST /departments/delete`
- restauration via `restore()` -> `POST /departments/updateAll`
- helpers non exposes: `checkAssociatedSpecialities()` -> `POST /departments/checkAssociatedSpecialities`, `deleteWithCascade()`
- chargement specialites inline via `SpecialityService.getAll()` puis filtrage client

## 7. Ce Que Le Backend Doit Envoyer

- Un `getAllByCriteria` pagine avec `items` et compteurs stables.
- Des departements mappables sur `nom`, `description`, `dateCreation`, `isDeleted`.
- Une relation departement -> specialites suffisamment fiable pour l'expansion inline.
- Si la suppression en cascade est un vrai cas produit, un contrat clair pour l'exposer proprement.
- Des dependances verifiables avant suppression/restauration via le popup shared.

## 8. Entites Metier Impliquees

- `department`
- `speciality`
- verification de dependances / parents supprimes

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il remplacer le chargement `size: 10000` par un endpoint cible par departement ?
- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que `/dashboard/departments` est la page metier de reference.
- [x] La suppression en cascade devient une option explicite dans l'UI lorsque des specialites associees sont detectees.
- [ ] Les compteurs et noms de specialites associes doivent-ils etre fournis directement par le backend plutot que recalcules ?
- [ ] Le guard `MANAGE_APP_CONFIG` est-il volontaire pour une table de referentiel RH ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/departments` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/departments`.
3. Creer puis modifier un departement.
4. Deplier la ligne et verifier la liste des specialites rattachees.
5. Creer, modifier, supprimer puis restaurer une specialite depuis l'expansion.
6. Supprimer un departement avec specialites associees, verifier l'affichage de l'option de cascade puis confirmer la suppression en cascade.
7. Restaurer le departement et verifier les dependances affichees.
