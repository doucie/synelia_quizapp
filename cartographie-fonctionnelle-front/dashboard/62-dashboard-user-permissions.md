# Dashboard User Permissions

## 1. Identite

- Route: `/dashboard/user-permissions`
- Guard: `permissionGuard(['MANAGE_SYSTEM_ROLES'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/user-permissions/user-permissions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/user-permissions/user-permissions.html`

## 2. Objectif Produit

La page sert a gerer les surcharges de permissions individuelles d'un utilisateur et ses rattachements aux groupes metiers.

## 3. Etat Constate

- [x] La page commence par une liste d'utilisateurs filtrable par recherche.
- [x] La selection d'un utilisateur ouvre une vue detaillee avec ses surcharges et ses groupes metiers.
- [x] `SUPER_ADMIN` est traite comme un bypass complet: aucune surcharge n'est possible.
- [x] `ADMIN` dispose d'un plancher immuable: certaines permissions de base ne peuvent pas etre refusees individuellement.
- [x] Le front gere trois etats de surcharge par permission: `default`, `GRANT`, `DENY`.
- [x] Les groupes metiers de l'utilisateur peuvent etre ajoutes ou retires depuis la meme page.
- [x] La page recharge aussi les permissions de base `ADMIN` pour savoir quels `DENY` doivent etre interdits.
- [ ] Verifier que la precedence effective des overrides reste bien `DENY/GRANT` individuel avant heritage par role/groupe, conformement au backend.
- [ ] Verifier la volumetrie si la liste d'utilisateurs devient importante, car aucune pagination n'est visible ici.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Permissions utilisateurs`
- [x] sous-titre explicatif
- [x] recherche utilisateur en vue liste
- [x] bouton retour en vue detail

### 4.2 Vue liste utilisateurs

- [x] cartes utilisateur avec avatar initiales
- [x] nom, email, badge role

### 4.3 Vue detail utilisateur

- [x] bloc identite avec role badge
- [x] bandeau special `SUPER_ADMIN`
- [x] onglets `Surcharges` et `Groupes metiers`

### 4.4 Onglet Surcharges

- [x] bandeau d'aide `Par defaut / Accorder / Refuser`
- [x] bandeau listant les refus individuels actifs
- [x] bandeau specifique `ADMIN` rappelant le plancher non retirable
- [x] grille par categories de permissions
- [x] boutons d'etat `Par defaut`, `Accorder`, `Refuser`

### 4.5 Onglet Groupes metiers

- [x] select d'ajout de groupe
- [x] liste des groupes rattaches
- [x] retrait individuel d'un groupe

## 5. Donnees Affichees Ou Editees

### 5.1 Utilisateur

- `id`
- `userFirstName`
- `userLastName`
- `userEmail`
- `userRole`

### 5.2 Overrides

- `userId`
- `functionality`
- `accessType` (`GRANT` / `DENY`)
- fallback legacy `isAllowed`

### 5.3 Groupes rattaches

- `businessGroupId`
- `groupName`

### 5.4 Catalogue support

- `PERMISSION_CATEGORIES`
- base permissions `ADMIN` chargees a part depuis `systemRolePermission`

## 6. Services Et Endpoints

- chargement utilisateurs via `POST /userManager/getAllByCriteria`
- chargement des overrides via `POST /userPermissionOverride/getByUser`
- chargement des groupes utilisateur via `POST /userBusinessGroup/getByUser`
- chargement des permissions de base `ADMIN` via `POST /systemRolePermission/getByRole`
- chargement des groupes disponibles via `POST /businessGroup/getByCriteria`
- retrait d'une surcharge via `POST /userPermissionOverride/removeOverride`
- creation ou mise a jour d'une surcharge via `POST /userPermissionOverride/setOverride`
- ajout ou retrait d'un utilisateur dans un groupe via `POST /businessGroup/assignUser` et `POST /businessGroup/removeUser`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste d'utilisateurs administrables avec identite et role systeme stables.
- Des overrides normalises en `GRANT` / `DENY`, avec compatibilite legacy possible via `isAllowed` tant que necessaire.
- Un calcul backend effectif ou les overrides individuels prevalent sur l'heritage role/groupe, tout en preservant le plancher `ADMIN` si c'est la regle produit retenue.
- Des rattachements groupes et permissions de base suffisamment explicites pour expliquer l'etat visible de chaque bouton.

## 8. Entites Metier Impliquees

- `user`
- `userPermissionOverride`
- `userBusinessGroup`
- `businessGroup`
- `systemRolePermission`
- catalogue `Functionality`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il afficher le resultat effectif final d'une permission, et pas seulement la surcharge individuelle ?
- [ ] Le plancher immuable `ADMIN` doit-il etre documente officiellement cote produit et backend ?
- [ ] La page doit-elle aussi montrer de quel groupe vient un droit herite pour faciliter le debug des acces ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/user-permissions` avec un utilisateur autorise.
2. Rechercher puis selectionner un utilisateur `RECRUITER`.
3. Poser une surcharge `GRANT`, puis une surcharge `DENY`, puis revenir a `Par defaut`.
4. Ajouter l'utilisateur a un groupe metier puis le retirer.
5. Tester ensuite les droits effectifs avec le compte cible.
6. Verifier qu'un `SUPER_ADMIN` reste non modifiable et qu'un `ADMIN` ne peut pas perdre ses permissions plancher.