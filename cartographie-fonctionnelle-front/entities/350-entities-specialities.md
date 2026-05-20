# Entities Specialities

## 1. Identite

- Routes: `/dashboard/entities/specialities` et `/dashboard/entities/specialities/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/specialities/entities-specialities.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/specialities/entities-specialities.html`

## 2. Objectif Produit

La page administre les specialites avec rattachement obligatoire a un departement. En pratique, elle expose un CRUD tabulaire plus brut que `dashboard/specialities`, tout en souffrant d'un fort decalage entre les formulaires front et le payload reel envoye par `SpecialityService`.

Le slice BL-008 la pose maintenant plus explicitement comme surface technique et renvoie vers `/dashboard/specialities` comme page metier de reference pour la gestion quotidienne.

## 3. Etat Constate

- [x] La page n'etend pas `EntityCrudBase`; elle reimplemente localement le pattern CRUD.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/specialities`.
- [x] La liste affiche nom, description, departement, creation et suppression logique.
- [x] Les modales create/edit imposent un departement.
- [x] Le composant charge les departements actifs pour alimenter un select custom.
- [x] La page `dashboard/specialities` deja documentee offre une experience plus metier, avec filtre par departement et presentation cartes.
- [x] `SpecialityService.create()` et `update()` propagent bien `departmentId`, coherent avec l'obligation imposee par l'UI.
- [x] Le mapping front remonte `departmentId` et `departmentName`, ce qui stabilise l'affichage et les relations avec les autres ecrans.
- [ ] La route affiche `departmentName`, mais n'offre aucun filtre avance par departement.
- [x] La suppression/restauration s'appuie sur les methodes dediees `delete()` / `restore()`, coherent avec le service.
- [x] Les cles de colonnes sont alignees sur les champs DTO reels (`nom`, `departmentName`, `dateCreation`).

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] sous-texte qui explicite le statut de surface technique
- [x] bouton `Page metier`
- [x] recherche rapide `Rechercher une specialite...`
- [x] checkbox `Afficher les specialites supprimees`
- [x] bouton `Filtres avances`
- [x] bouton `Nouvelle specialite`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `nom`
- [x] filtre `description`
- [x] filtre `isDeleted`
- [x] dates de creation `dateCreation*`
- [x] dates de modification `dateModification*`
- [ ] pas de filtre visible par `departmentId`

### 4.3 Tableau principal

- [x] colonnes `id`, `nom`, `description`, `departmentName`, `dateCreation`
- [x] actions edit / delete / restore
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation specialite
- [x] edition specialite
- [x] select de departement charge depuis `DepartmentService`

## 5. Donnees Affichees Ou Editees

- `id`
- `nom`
- `specialityName`
- `description`
- `departmentId`
- `departmentName`
- `isDeleted`
- `dateCreation`
- `dateModification`
- `createdAt`
- `updatedAt`

## 6. Services Et Endpoints

- liste via `SpecialityService.getAll()` -> `POST /specialities/getAllByCriteria`
- detail via `getById()` -> `POST /specialities/getByCriteria`
- creation via `create()` -> `POST /specialities/create`
- edition via `update()` -> `POST /specialities/update`
- suppression via `delete()` -> `POST /specialities/delete`
- restauration via `restore()` -> `POST /specialities/updateAll`
- chargement departements actifs via `DepartmentService.getAllDepartmentsByCriteria({ isDeleted: false })`

## 7. Ce Que Le Backend Doit Envoyer

- Des specialites avec rattachement departement exploitable (`departmentId`, `departmentName`).
- Une compatibilite claire entre `specialityName` / `name` / `nom` cote backend et frontend.
- Une relation departement stable, sinon les ecrans `entities-specialities` et `entities-departments` divergent immediatement.
- Une strategie unique de suppression/restauration, idealement coherente avec les methodes dediees du service.

## 8. Entites Metier Impliquees

- `speciality`
- `department`
- dependances transverses depuis campagnes, questions ou autres referentiels

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le payload create/update doit-il absolument inclure `departmentId` ?
- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que `/dashboard/specialities` est la page metier de reference.
- [ ] `mapBackendToFrontend()` doit-il remonter `departmentId` et `departmentName` partout ?
- [ ] Pourquoi cette route utilise-t-elle `update(isDeleted)` plutot que `delete()` / `restore()` ?
- [ ] Le guard `MANAGE_APP_CONFIG` est-il le bon niveau d'acces pour ce referentiel ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/specialities` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/specialities`.
3. Creer une specialite en choisissant un departement.
4. Verifier l'affichage du departement dans la ligne creee.
5. Modifier la specialite et changer le departement.
6. Supprimer puis restaurer la specialite et verifier la coherence avec `/dashboard/specialities` et les expansions departements.
