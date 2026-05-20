# Entities Legal Texts

## 1. Identite

- Routes: `/dashboard/entities/legal-texts` et `/dashboard/entities/legal-texts/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/legal-texts/entities-legal-texts.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/legal-texts/entities-legal-texts.html`

## 2. Objectif Produit

La page administre les textes legaux et conditions affiches par la plateforme. Elle agit comme un CRUD de contenu support, mais sans outillage de preview ni indication explicite des surfaces publiques consommatrices.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` via des types ad hoc `LegalTextCriteria` et `PagedLegalTextResponse`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, `textKey`, actif, suppression et intervalles de dates.
- [x] Le tableau expose cle, titre, description, actif, suppression et date de creation.
- [x] Les modales create/edit permettent de saisir `textKey`, `title`, `content`, `description` et `isActive`.
- [x] La restauration est supportee via un `update({ id, isDeleted: false })`.
- [ ] Les cles de colonnes TS restent `key`, `active`, `deleted`, alors que les champs reels sont `textKey`, `isActive`, `isDeleted`.
- [ ] Le contenu principal `content` n'apparait pas dans le tableau et n'a ni preview ni rendu riche dans cette route.
- [ ] Le service n'expose pas de helper de restauration dedie; la route reutilise l'update brut.
- [ ] La page ne dit rien des ecrans publics ou formulaires qui consomment effectivement ces textes.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `textKey`
- [x] filtre `isActive`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `key`, `title`, `description`, `active`, `deleted`, `createdAt`
- [x] troncature de la description
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] detail panel branche en bas de page

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation texte legal
- [x] edition texte legal

## 5. Donnees Affichees Ou Editees

- `id`
- `textKey`
- `title`
- `content`
- `description`
- `isActive`
- `isDeleted`
- `createdAt`
- `updatedAt`

## 6. Services Et Endpoints

- liste via `LegalTextService.getByCriteria()` -> `POST /legalText/getByCriteria`
- creation via `LegalTextService.create()` -> `POST /legalText/create`
- edition via `LegalTextService.update()` -> `POST /legalText/update`
- suppression via `LegalTextService.delete()` -> `POST /legalText/delete`
- restauration via `LegalTextService.update({ id, isDeleted: false })` -> `POST /legalText/update`

## 7. Ce Que Le Backend Doit Envoyer

- Un endpoint `getByCriteria` pagine avec `items` et `count` exploitable par le mapping custom du composant.
- Des textes legaux contenant au minimum `textKey`, `title`, `content`, `description`, `isActive`, `isDeleted`.
- Un contrat stable sur la cle `textKey` pour les surfaces publiques ou formulaires qui consomment ces textes.

## 8. Entites Metier Impliquees

- `legalText`
- pages publiques et formulaires consommateurs de textes legaux
- activation d'une version de texte par cle

## 9. Questions Ou Ecarts A Qualifier

- [ ] Les cles de colonnes doivent-elles etre alignees sur le DTO reel ?
- [ ] Faut-il ajouter une vraie preview du contenu legal ?
- [ ] La route doit-elle montrer ou chaque `textKey` est utilisee dans le produit ?
- [ ] Un helper de restauration dedie serait-il preferable a l'update brut ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/legal-texts` avec un compte autorise.
2. Filtrer par `textKey` et statut actif.
3. Creer un texte legal avec titre, contenu et description.
4. Modifier le contenu puis verifier la persistence.
5. Supprimer puis restaurer un texte legal.
