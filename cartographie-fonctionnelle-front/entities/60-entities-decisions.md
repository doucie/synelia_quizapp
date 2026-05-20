# Entities Decisions

## 1. Identite

- Routes: `/dashboard/entities/decisions` et `/dashboard/entities/decisions/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/decisions/entities-decisions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/decisions/entities-decisions.html`

## 2. Objectif Produit

La page fournit le CRUD technique des decisions rattachees aux candidatures, en croisant une candidature, un utilisateur et un type de decision ou d'annulation.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] Les filtres avances exposent surtout `applicationId`, `userId`, suppression et dates.
- [x] Le tableau affiche `decisionType`, le flag `isCancel` et `pipelineStageId`, avec labels resolus pour la candidature, l'utilisateur et l'etape pipeline.
- [x] Les modales create/edit permettent de choisir la candidature, l'utilisateur, le type de decision et le flag `Annulee`.
- [x] Les listes FK candidatures et utilisateurs sont chargees au demarrage.
- [x] La page charge aussi le catalogue des etapes pipeline pour resoudre `pipelineStageId` dans la grille.
- [x] La restauration est supportee.
- [ ] Le service de liste utilise `POST /decisions/getByCriteria` au lieu d'un `getAllByCriteria`, contrairement a beaucoup d'autres CRUD `entities/*`.
- [ ] `DecisionCriteria` supporte `decisionType` et `isCancel`, mais ces deux filtres ne sont pas exposes dans l'UI avancee.
- [x] Le tableau n'affiche plus seulement des IDs: candidature, utilisateur et etape pipeline sont resolus via les catalogues front charges.

## 4. Blocs UI Constates

### 4.1 Header et filtres

- [x] recherche rapide generique
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID
- [x] candidature via select FK
- [x] utilisateur via select FK
- [x] `isDeleted`
- [x] dates creation / modification

### 4.3 Tableau principal

- [x] colonnes `id`, `applicationId`, `userId`, `decisionType`, `cancelled`, `pipelineStage`, `createdAt`
- [x] rendu des libelles candidature / utilisateur / etape pipeline a partir des catalogues frontend
- [x] badge booleen `Annulee`
- [x] actions edit / delete ou restore

### 4.4 Modales

- [x] confirmation suppression / restauration
- [x] creation decision
- [x] edition decision

## 5. Donnees Affichees Ou Editees

- `applicationId`
- `userId`
- `decisionType`
- `isCancel`
- `pipelineStageId`
- `createdAt`
- `isDeleted`

## 6. Services Et Endpoints

- liste via `DecisionService.getAllDecisionsByCriteria()` -> `POST /decisions/getByCriteria`
- creation via `DecisionService.createDecision()` -> `POST /decisions/create`
- edition via `DecisionService.updateDecision()` -> `POST /decisions/update`
- suppression via `DecisionService.deleteDecision()` -> `POST /decisions/delete`
- restauration via `DecisionService.restoreDecision()` -> `POST /decisions/update`
- chargement FK candidatures via `ApplicationService.getAllApplicationsByCriteria()` -> `POST /applications/getAllByCriteria`
- chargement FK utilisateurs via `UserService.getByCriteria()` -> `POST /user/getByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste `decisions/getByCriteria` paginee et stable.
- Des decisions avec au minimum `applicationId`, `userId`, `decisionType`, `isCancel`, `pipelineStageId`, `isDeleted`.
- Idealement des champs joints plus lisibles (`userName`, libelle candidature, etape pipeline) pour eviter une UI basee sur des IDs nus.
- Une semantique claire des `decisionType`, aujourd'hui edites en texte libre.

## 8. Entites Metier Impliquees

- `decision`
- `application`
- `user`
- `pipeline_stage`

## 9. Questions Ou Ecarts A Qualifier

- [ ] `decisionType` doit-il devenir un enum ferme plutot qu'un champ texte libre ?
- [ ] Faut-il exposer des filtres `decisionType` et `isCancel`, deja supportes par le service ?
- [x] Le tableau affiche maintenant davantage de contexte que des IDs bruts via les catalogues frontend.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/decisions`.
2. Filtrer par candidature puis par utilisateur.
3. Creer une decision et verifier son affichage dans le tableau.
4. Editer le flag `Annulee` puis verifier le badge booleen.
5. Supprimer puis restaurer une decision.
