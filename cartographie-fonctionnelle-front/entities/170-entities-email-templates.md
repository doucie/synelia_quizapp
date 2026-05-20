# Entities Email Templates

## 1. Identite

- Routes: `/dashboard/entities/email-templates` et `/dashboard/entities/email-templates/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/email-templates/entities-email-templates.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/email-templates/entities-email-templates.html`

## 2. Objectif Produit

La page fournit un CRUD admin minimal pour les modeles email, mais elle ne couvre qu'une partie du vrai systeme de templates. Le parcours principal et plus riche reste porte par `/dashboard/email-editor` et `/dashboard/email-presets`, qui gerent preset, rendu et variables editables plus finement.

Le slice BL-008 la pose maintenant plus explicitement comme surface technique et renvoie vers `/dashboard/email-editor` comme page metier de reference pour l'edition quotidienne.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` via des types ad hoc `EmailTemplateCriteria` et `PagedEmailTemplateResponse`.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/email-editor`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, `templateKey`, actif, suppression et intervalles de dates.
- [x] Le tableau expose cle, sujet, description, actif, suppression et date de creation.
- [x] Les modales create/edit permettent de saisir `templateKey`, `subjectTemplate`, `bodyTemplate`, `description`, `availableVariables` et `isActive`.
- [x] La restauration est supportee via un `update({ id, isDeleted: false })`.
- [x] Les cles de colonnes TS sont alignees sur les champs reels `templateKey`, `subjectTemplate`, `isActive`, `isDeleted`.
- [ ] La page n'expose ni `actionType`, ni `presetId`, ni `editableVariablesJson`, alors que ces champs sont centraux dans le systeme de templates automatique et dans l'editeur email dedie.
- [ ] Le service fournit `getByActionType()` et la constante `EMAIL_ACTION_TYPES`, mais cette route ne montre rien de l'association `actionType -> template actif`.
- [ ] Le CRUD reste tres brut alors que l'application a deja une vraie surface specialisee pour l'edition HTML, les presets et la preview.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] sous-texte qui explicite le statut de surface technique
- [x] bouton `Page metier`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `templateKey`
- [x] filtre `isActive`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `templateKey`, `subjectTemplate`, `description`, `isActive`, `isDeleted`, `createdAt`
- [x] troncature du sujet et de la description
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] detail panel branche en bas de page

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation modele email
- [x] edition modele email

## 5. Donnees Affichees Ou Editees

- `id`
- `templateKey`
- `subjectTemplate`
- `bodyTemplate`
- `description`
- `availableVariables`
- `editableVariablesJson`
- `actionType`
- `presetId`
- `isActive`
- `isDeleted`
- `createdAt`

## 6. Services Et Endpoints

- liste via `EmailTemplateService.getByCriteria()` -> `POST /emailTemplate/getByCriteria`
- creation via `EmailTemplateService.create()` -> `POST /emailTemplate/create`
- edition via `EmailTemplateService.update()` -> `POST /emailTemplate/update`
- suppression via `EmailTemplateService.delete()` -> `POST /emailTemplate/delete`
- restauration via `EmailTemplateService.update({ id, isDeleted: false })` -> `POST /emailTemplate/update`
- helper metier disponible mais non utilise ici: `EmailTemplateService.getByActionType()` -> `POST /emailTemplate/getByActionType`
- gestion des presets portee ailleurs dans le service via `/emailTemplatePreset/*`, mais pas par cette route

## 7. Ce Que Le Backend Doit Envoyer

- Un endpoint `getByCriteria` pagine avec `items` et `count` exploitable par le mapping custom du composant.
- Des templates contenant au minimum `templateKey`, `subjectTemplate`, `bodyTemplate`, `description`, `actionType`, `presetId`, `editableVariablesJson`, `isActive`, `isDeleted`.
- Un contrat stable entre template actif, `actionType` et envoi automatique des emails metier.

## 8. Entites Metier Impliquees

- `emailTemplate`
- `emailTemplatePreset`
- `actionType` de livraison email automatique
- editeur email dedie du dashboard

## 9. Questions Ou Ecarts A Qualifier

- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que `/dashboard/email-editor` est la page metier de reference.
- [ ] Cette route doit-elle rester un CRUD brut, ou simplement renvoyer vers l'editeur email dedie ?
- [ ] Faut-il exposer `actionType`, `presetId` et `editableVariablesJson` ici ?
- [x] Les cles de colonnes ont ete alignees sur le DTO reel dans le composant CRUD.
- [ ] L'incoherence connue entre les `actionType` exposes cote front et ceux vraiment consommes cote backend doit-elle etre visible ici ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/email-templates` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/email-editor`.
3. Filtrer par `templateKey` et statut actif.
4. Creer un template simple puis le modifier.
5. Restaurer un template supprime.
6. Comparer la route avec `/dashboard/email-editor` pour verifier ce qui manque vraiment.
