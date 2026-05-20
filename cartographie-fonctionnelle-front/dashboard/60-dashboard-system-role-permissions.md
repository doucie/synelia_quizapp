# Dashboard System Role Permissions

## 1. Identite

- Route: `/dashboard/system-role-permissions`
- Guard: `permissionGuard(['MANAGE_SYSTEM_ROLES'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/system-role-permissions/system-role-permissions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/system-role-permissions/system-role-permissions.html`

## 2. Objectif Produit

La page sert a definir les permissions globales de base attribuees aux roles systeme configurables, en pratique `ADMIN` et `RECRUITER`.

## 3. Etat Constate

- [x] La page affiche un rappel explicite que `SUPER_ADMIN` n'est pas configurable et conserve un bypass complet.
- [x] Deux onglets pilotent la configuration des roles `ADMIN` et `RECRUITER`.
- [x] Les permissions sont structurees a partir du catalogue frontend `PERMISSION_CATEGORIES`.
- [x] Chaque permission est activee ou retiree immediatement, sans bouton global `Enregistrer`.
- [x] Le chargement et le rafraichissement relisent les permissions des deux roles depuis le backend.
- [x] Les permissions sont regroupees par blocs fonctionnels derives du prefixe ou du domaine de la fonctionnalite.
- [ ] Verifier s'il faut historiser ou journaliser chaque changement de role systeme.
- [ ] Verifier si certaines permissions doivent rester des planchers immuables pour `ADMIN`, comme c'est deja le cas plus loin dans la page `user-permissions`.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Permissions par role systeme`
- [x] sous-titre d'explication
- [x] bouton `Actualiser`

### 4.2 Bandeau d'information

- [x] rappel `SUPER_ADMIN` non configurable

### 4.3 Navigation par role

- [x] onglet `ADMIN`
- [x] onglet `RECRUITER`

### 4.4 Grille de permissions

- [x] sections par categorie
- [x] sous-groupes dans certaines categories: pipeline, administration, questions/reponses, groupes/permissions
- [x] compteur d'elements actifs par categorie et par groupe
- [x] case a cocher par permission
- [x] affichage du code technique de la permission

## 5. Donnees Affichees Ou Editees

- `systemRole`
- `functionality`
- catalogue frontend `PERMISSION_CATEGORIES`
- etat actif ou non de chaque permission pour `ADMIN` et `RECRUITER`

## 6. Services Et Endpoints

- chargement par role via `POST /systemRolePermission/getByRole`
- ajout d'une permission via `POST /systemRolePermission/add`
- retrait d'une permission via `POST /systemRolePermission/remove`
- utilisateur courant recupere via `AuthService.getCurrentUserId()` pour remplir le champ `user` des requetes

## 7. Ce Que Le Backend Doit Envoyer

- Une liste de lignes `systemRolePermission` contenant au minimum `systemRole` et `functionality`.
- Des reponses coherentes avec le catalogue frontend: si une permission n'existe plus cote backend, elle ne doit pas produire d'etat fantome dans l'UI.
- Des endpoints atomiques `add` et `remove` qui renvoient un succes ou une erreur sans exiger de sauvegarde differree cote front.
- Une enforcement serveur forte sur `MANAGE_SYSTEM_ROLES`, independamment du simple affichage de la page.

## 8. Entites Metier Impliquees

- `systemRolePermission`
- catalogue `Functionality`
- roles systeme `ADMIN`, `RECRUITER`, `SUPER_ADMIN`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Certaines permissions de base `ADMIN` devraient-elles etre verrouillees aussi dans cette page ?
- [ ] Faut-il exposer un mode `lecture seule + diff` avant application des changements ?
- [ ] Le regroupement des permissions doit-il etre derive du backend plutot que du catalogue frontend ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/system-role-permissions` avec un utilisateur autorise.
2. Verifier le chargement des onglets `ADMIN` et `RECRUITER`.
3. Activer puis retirer une permission sur chaque role.
4. Rafraichir la page et verifier la persistance.
5. Controler l'effet reel sur un compte ayant le role cible.