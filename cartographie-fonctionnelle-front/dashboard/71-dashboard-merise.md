# Dashboard Merise

## 1. Identite

- Route: `/dashboard/merise`
- Guard route: `permissionGuard(['MANAGE_APP_CONFIG'])`
- Menu dashboard: entree visible cote UI avec `permissions: ['VIEW_APP_CONFIG']`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/merise/merise.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/merise/merise.html`

## 2. Objectif Produit

La page fournit une visualisation interactive du modele de donnees de l'application pour faciliter l'exploration des tables, colonnes et relations.

## 3. Etat Constate

- [x] Le schema est entierement embarque dans le frontend via des definitions statiques de tables, colonnes et relations.
- [x] Un champ de recherche filtre la sidebar par table ou colonne.
- [x] La page affiche des statistiques de schema: nombre de tables, colonnes et relations.
- [x] La sidebar permet de centrer la vue sur une table et de la selectionner.
- [x] La zone principale est un canevas SVG avec panning, zoom, reset de vue et plein ecran.
- [x] Un toggle masque ou affiche les colonnes communes pour reduire le bruit visuel.
- [x] La selection d'une table met en avant ses relations directes et attenue le reste du schema.
- [x] Aucun appel backend n'est effectue pour cette page: elle montre un snapshot frontend du modele.
- [x] Le menu demande `VIEW_APP_CONFIG` alors que la route demande `MANAGE_APP_CONFIG`.
- [ ] Verifier si la page doit etre informative seule ou veritablement reservee a l'administration de configuration.
- [ ] Verifier si le schema doit etre genere depuis la base/migrations plutot que maintenu a la main.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Modelisation Merise`
- [x] sous-titre avec stats du schema

### 4.2 Controles superieurs

- [x] recherche table/colonne
- [x] toggle `Afficher/Masquer colonnes communes`
- [x] bouton `Plein ecran / Reduire`

### 4.3 Sidebar tables

- [x] liste des tables filtrees
- [x] badge couleur par table
- [x] nombre de colonnes par table
- [x] legende PK / FK / nullable / relation

### 4.4 Canevas SVG

- [x] rectangles de tables avec entete coloree
- [x] affichage des colonnes et types
- [x] tracage des relations avec cardinalites
- [x] mise en evidence table selectionnee / tables liees

### 4.5 Controles de navigation visuelle

- [x] zoom in
- [x] zoom out
- [x] pourcentage de zoom
- [x] reset de vue
- [x] lock/unlock du zoom molette

## 5. Donnees Affichees Ou Editees

- `tables[]` avec `name`, `displayName`, `color`, `x`, `y`, `columns[]`
- `columns[]` avec `name`, `type`, `pk`, `fk`, `nullable`
- `relationships[]` avec `from`, `to`, `fromColumn`, `toColumn`, `cardinality`, `label`
- etat de vue `selectedTable`, `zoom`, `panX`, `panY`, `showCommonColumns`

## 6. Services Et Endpoints

- aucun service backend requis pour le rendu courant
- interactions purement frontend dans `MeriseComponent`

## 7. Ce Que Le Backend Doit Envoyer

- Aucun payload n'est attendu aujourd'hui: le schema est maintenu cote front.
- En revanche, si cette page devient une reference technique fiable, il faudra un contrat genere depuis les metadonnees reelles ou les migrations pour eviter les derives.
- La securisation serveur doit rester coherente avec le guard de route retenu, surtout si la page expose des informations sensibles sur la structure des donnees.

## 8. Entites Metier Impliquees

- snapshot du modele de donnees global
- tables coeur metier recrutement, quiz, permissions, notifications et configuration

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le guard doit-il etre `VIEW_APP_CONFIG` pour coller au menu, ou le menu doit-il monter a `MANAGE_APP_CONFIG` ?
- [ ] Faut-il generer automatiquement cette vue depuis le schema reeel pour eviter les oublis de migration ?
- [ ] Cette page doit-elle afficher un avertissement explicite indiquant qu'il s'agit d'une representation documentaire et non d'une source de verite runtime ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/merise` avec un compte autorise.
2. Rechercher une table puis verifier le filtrage de la sidebar.
3. Cliquer une table et confirmer la mise en evidence de ses relations.
4. Tester zoom, pan, reset et plein ecran.
5. Basculer l'option colonnes communes et verifier l'impact sur la lisibilite du schema.
