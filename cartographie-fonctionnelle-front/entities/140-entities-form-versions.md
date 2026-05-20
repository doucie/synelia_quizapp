# Entities Form Versions

## 1. Identite

- Routes: `/dashboard/entities/form-versions` et `/dashboard/entities/form-versions/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/form-versions/entities-form-versions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/form-versions/entities-form-versions.html`

## 2. Objectif Produit

La page administre les versions d'un formulaire, avec publication, verrouillage, mode aleatoire et un vrai comportement de fork. C'est le coeur du cycle de vie des quiz/formulaires: une version peut etre brouillon, publiee, verrouillee, dupliquee et enrichie par des questions enfants.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, numero de version, formulaire, publication, verrouillage, mode aleatoire, suppression et intervalles de dates.
- [x] Le tableau expose `versionNumber`, `formId`, `isPublished`, `isLocked`, `randomQuestions` et `createdAt`.
- [x] Chaque ligne peut s'etendre pour afficher les questions enfants de la version.
- [x] Une ligne verrouillee propose un bouton explicite `fork`.
- [x] Ouvrir l'edition d'une version verrouillee prepare deja une nouvelle version brouillon incrementee.
- [x] Les modales create/edit exposent le formulaire, le numero de version et les drapeaux clefs.
- [x] La restauration est supportee.
- [ ] Les cles de colonnes TS restent `version`, `published`, `locked`, alors que les donnees reelles sont `versionNumber`, `isPublished`, `isLocked`.
- [ ] Le front porte deux logiques proches pour le fork d'une version verrouillee: un bouton `custom('fork')` et un `openEditDialog()` qui preconfigure deja une copie; la lisibilite du comportement reel depend fortement du backend.
- [ ] La create modal ne permet pas de regler `isPublished` ou `isLocked`, contrairement a l'edit modal.
- [ ] Les questions enfants sont affichees surtout par IDs et ordre, avec peu de contexte textuel.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `versionNumber`
- [x] filtre `formId`
- [x] filtre `isPublished`
- [x] filtre `isLocked`
- [x] filtre `randomQuestions`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `version`, `formId`, `published`, `locked`, `randomQuestions`, `createdAt`
- [x] badges booleens pour publication, verrouillage et questions aleatoires
- [x] bouton `Fork (nouvelle version)` sur les lignes verrouillees
- [x] bouton d'expansion `Voir les questions`
- [x] actions edit / delete ou restore selon `isDeleted`

### 4.4 Expansion enfant

- [x] liste des questions enfants de la version
- [x] affichage `questionId`, `questionOrder`, `chronoOverride`

### 4.5 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation version formulaire
- [x] edition version formulaire
- [x] message specifique quand la version editee est verrouillee

## 5. Donnees Affichees Ou Editees

- `id`
- `versionNumber`
- `formId`
- `isPublished`
- `isLocked`
- `randomQuestions`
- `isDeleted`
- `createdAt`
- questions enfants chargees par `formVersionId`

## 6. Services Et Endpoints

- liste via `FormVersionService.getAllByCriteria()` -> `POST /formversion/getAllByCriteria`
- creation via `FormVersionService.create()` -> `POST /formversion/create`
- edition via `FormVersionService.update()` -> `POST /formversion/update`
- suppression via `FormVersionService.delete()` -> `POST /formversion/delete`
- restauration via `FormVersionService.restore()` -> `POST /formversion/update`
- fork explicite via `FormVersionService.custom('fork', id)` -> `POST /formversion/custom`
- chargement des questions enfants via `FormQuestionsService.getAllByCriteria()` -> `POST /formquestions/getAllByCriteria`
- chargement des formulaires FK via `FormService.getAllByCriteria()` -> `POST /form/getAllByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Des versions normalisables depuis camelCase ou snake_case vers `versionNumber`, `isPublished`, `isLocked`, `randomQuestions`, `formId`.
- Un endpoint `custom` capable de forker proprement une version verrouillee.
- Un comportement `update` coherent avec la regle metier de fork automatique des versions verrouillees.
- Des questions enfants chargeables par `formVersionId` pour que l'expansion soit pertinente.

## 8. Entites Metier Impliquees

- `formVersion`
- `form`
- `formQuestions`
- cycle de vie brouillon / publication / verrouillage

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il conserver deux chemins de fork visibles cote front ?
- [ ] Les cles de colonnes doivent-elles etre alignees sur le DTO reel ?
- [ ] La create modal doit-elle exposer davantage de drapeaux de cycle de vie ?
- [ ] Les questions enfants doivent-elles afficher plus de contexte fonctionnel que des IDs ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/form-versions` avec un compte autorise.
2. Filtrer par formulaire, publication, verrouillage et mode aleatoire.
3. Creer une version brouillon.
4. Ouvrir une version verrouillee en edition puis verifier le comportement de fork.
5. Utiliser aussi le bouton `fork` explicite.
6. Ouvrir l'expansion `questions` puis supprimer/restaurer une ligne si besoin.
