# Entities Campaigns

## 1. Identite

- Routes: `/dashboard/entities/campaigns` et `/dashboard/entities/campaigns/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/campaigns/entities-campaigns.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/campaigns/entities-campaigns.html`

## 2. Objectif Produit

La page administre les campagnes via une grille tabulaire avec expansion enfants. Elle parait proche d'un CRUD generique, mais elle est en realite une version reduite des pages metier `dashboard/campaigns`, `dashboard/campaigns/new`, `dashboard/campaigns/:id` et `dashboard/campaigns/:id/edit`, sans la plupart des champs structurants ni la gestion complete des acces recruteurs.

Le premier slice BL-008 la pose maintenant plus explicitement comme surface technique: le header renvoie vers la page metier de reference `/dashboard/campaigns` pour le pilotage quotidien.

## 3. Etat Constate

- [x] La page n'etend pas `EntityCrudBase`; elle reimplemente localement le pattern CRUD.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/campaigns`.
- [x] La liste principale couvre nom, description, statut, specialite, template pipeline, dates et creation.
- [x] Les modales create/edit restent partielles, mais elles propagent maintenant un vocabulaire coherent sur `campaignName`, `campaignDesc` et `specialityId`.
- [x] L'expansion d'une ligne charge trois onglets enfants: formulaires, tokens source et permissions.
- [x] L'onglet `Permissions` s'appuie maintenant sur `CampaignService.getCampaignAccess()` au lieu de recalculer localement un sous-ensemble de droits.
- [x] Le service `CampaignService` porte des helpers bien plus riches que cette route: `getCampaignAccess()`, `saveCampaignAccess()`, `createNotification()`, `checkEditPermission()`.
- [x] Le service gere un catalogue de permissions campagne plus large (`ADMIN`, `CREATOR`, `UPDATE`, `DELETE`, `EVALUATE`, `CORRECT_TEST`, `PLANIFY`, `ADVANCE_PIPELINE`, `FOLLOW`).
- [x] Une experience produit beaucoup plus complete existe deja dans les pages dashboard dediees, avec specialite, pipeline, duree, recrutement, droits recruteurs et migrations.
- [x] L'UI avancee expose maintenant `campaignDesc`, `campaignStart*` et `campaignEnd*` en plus des autres criteres declares.
- [x] Les badges de l'onglet `Permissions` exposent maintenant aussi `FOLLOW`, le role `CREATOR` et le droit `ADVANCE_PIPELINE` sous forme de badge `Pipeline`.
- [x] Les cles de colonnes sont alignees sur les champs DTO front reels (`campaignName`, `campaignDesc`, `campaignStatus`, `specialityName`, `pipelineTemplateName`, `campaignStart`, `campaignEnd`).
- [ ] La guard `MANAGE_APP_CONFIG` est tres decalee par rapport au domaine reel de gestion des campagnes.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] sous-texte qui explicite le statut de surface technique
- [x] bouton `Page metier`
- [x] recherche rapide `Rechercher une campagne...`
- [x] checkbox `Afficher les campagnes supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau campagne`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `campaignName`
- [x] filtre `campaignDesc`
- [x] filtre `specialityId`
- [x] filtre `isActive`
- [x] filtre `isDeleted`
- [x] dates de campagne `campaignStart*` et `campaignEnd*`
- [x] dates de creation `dateCreation*`
- [x] dates de modification `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `campaignName`, `campaignDesc`, `campaignStatus`, `specialityName`, `pipelineTemplateName`, `campaignStart`, `campaignEnd`, `createdAt`
- [x] actions edit / delete / restore
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche
- [x] bouton d'expansion par campagne

### 4.4 Enfants expandes

- [x] onglet `Formulaires`
- [x] onglet `Tokens Source`
- [x] onglet `Permissions`
- [x] chargement paresseux a l'ouverture
- [x] badges d'acces recruteur issus du helper service (`Modifier`, `Supprimer`, `Evaluer`, `Planifier`, `Suivi`, `Pipeline`, `Admin`, `Createur`)
- [ ] affichage seulement informatif, sans edition directe des enfants

### 4.5 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation campagne
- [x] edition campagne

## 5. Donnees Affichees Ou Editees

- `id`
- `campaignName`
- `campaignDesc`
- `campaignStatus`
- `specialityId`
- `specialityName`
- `pipelineTemplateId`
- `pipelineTemplateName`
- `campaignStart`
- `campaignEnd`
- `isActive`
- `isDeleted`
- `createdAt`
- `createdBy`
- `updatedAt`
- `creatorId`
- enfants: formulaires, source tokens, entity permissions agregees

## 6. Services Et Endpoints

- liste via `CampaignService.getAllCampaignsByCriteria()` -> `POST /campaigns/getAllByCriteria`
- creation via `createCampaign()` -> `POST /campaigns/create`
- edition via `updateCampaign()` -> `POST /campaigns/update`
- suppression via `deleteCampaign()` -> `POST /campaigns/delete`
- restauration via `restoreCampaign()` -> `POST /campaigns/updateAll`
- chargement formulaires enfants via `FormService.getAllByCriteria()`
- chargement tokens source via `SourceTokenService.getAllSourceTokensByCriteria()`
- chargement permissions via `CampaignService.getCampaignAccess()`
- helpers metier non exposes: `saveCampaignAccess()`, `createNotification()`, `checkEditPermission()`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getAllByCriteria` pagine avec `items` ou `content`, plus compteurs fiables.
- Des campagnes coherentes sur nom, statut, specialite, pipeline et dates, meme si la route n'edite qu'un sous-ensemble.
- Des enfants recuperables separement pour formulaires, tokens et acces recruteurs.
- Une restitution stable des permissions campagne via `getCampaignAccess()` pour ne pas masquer `FOLLOW`, `CREATOR` ou `ADVANCE_PIPELINE`.
- Une compatibilite avec les pages dashboard plus riches, qui restent la vraie surface metier campagne.

## 8. Entites Metier Impliquees

- `campaign`
- `form`
- `sourceToken`
- `entityPermission`
- `speciality`
- `pipelineTemplate`
- `notification`

## 9. Questions Ou Ecarts A Qualifier

- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que la page metier de reference est `/dashboard/campaigns`.
- [ ] Faut-il retirer cette route au profit des pages campagnes specialisees ?
- [ ] La route doit-elle exposer la configuration campagne reelle: pipeline, dates, statut, recrutement ?
- [x] Les badges de permissions couvrent maintenant `FOLLOW` et `ADVANCE_PIPELINE`; `CORRECT_TEST` reste encore non expose dans cette route brute.
- [ ] La guard doit-elle etre alignee sur une permission campagne plus explicite ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/campaigns` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/campaigns`.
3. Filtrer par nom, specialite et actif/supprime.
4. Creer une campagne minimale puis la modifier.
5. Ouvrir l'expansion et verifier les onglets `Formulaires`, `Tokens Source` et `Permissions`.
6. Dans `Permissions`, verifier l'affichage des badges `Suivi`, `Pipeline`, `Admin` et `Createur` pour les recruteurs concernes.
7. Comparer le niveau de detail avec `/dashboard/campaigns` et `/dashboard/campaigns/:id/edit`.
