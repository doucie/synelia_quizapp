# Dashboard Campaign Detail

## 1. Identite

- Route: `/dashboard/campaigns/:id`
- Guard: `campaignViewGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/campaign-detail/campaign-detail.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/campaign-detail/campaign-detail.html`

## 2. Objectif Produit

La page sert à consulter une campagne en profondeur: métadonnées, pipeline, recruteurs participants, tokens sources, formulaires associés et permissions d’entité.

## 3. Etat Constate

- [x] La page charge la campagne puis enchaîne sur les recruteurs, tokens, formulaires et permissions.
- [x] Le header expose des actions directes `Voir les candidatures` et `Modifier`.
- [x] Le pipeline est visualisé avec un compteur de candidats `IN_PROGRESS` par étape.
- [x] Les recruteurs affichent leurs rôles et permissions.
- [x] Les tokens sources et les formulaires de campagne sont aussi pilotés depuis cette page côté TS.
- [x] Les permissions d’entité `CAMPAIGN` sont exploitées pour construire les accès.
- [ ] Vérifier tout le bloc UI sous la ligne de coupe fournie par le template, notamment la gestion complète des tokens et permissions détaillées.
- [ ] Vérifier si toutes les actions visibles sont correctement conditionnées par les permissions.

## 4. Blocs UI Constates

### 4.1 Header et identité campagne

- [x] Bouton retour vers la liste
- [x] Titre campagne
- [x] Badge statut
- [x] Bouton `Voir les candidatures`
- [x] Bouton `Modifier`

### 4.2 Métadonnées de campagne

- [x] créateur
- [x] spécialité
- [x] département
- [x] dates début / fin
- [x] durée quiz
- [x] candidatures max
- [x] gestion du temps
- [x] archivage
- [x] note maximale
- [x] nombre de questions
- [x] nombre de candidatures
- [x] date de création

### 4.3 Pipeline

- [x] visualisation séquentielle des étapes
- [x] type d’étape
- [x] compteur de candidats par étape
- [x] tag `Éliminatoire`
- [x] action de filtrage vers les candidatures par étape

### 4.4 Recruteurs participants

- [x] carte par recruteur
- [x] nom, email, rôle
- [x] permissions opérationnelles visibles

### 4.5 Sections pilotées côté TS mais à confirmer visuellement

- [~] tokens sources
- [~] formulaires de campagne
- [~] permissions d’entité détaillées
- [~] configuration d’affectation des formulaires

## 5. Donnees Affichees

### 5.1 Campagne

- `campaignTitle`
- `campaignDesc`
- `campaignStatus`
- `campaignStart`, `campaignEnd`
- `campaignDuration`
- `maxApply`
- `markedOutOf`
- `questionsCount`
- `applicationsCount`
- `creatorName`
- `departmentName`
- `specialityLibelle`
- `formAssignmentStrategy`
- `formAssignmentExhaustionPolicy`
- `timeAllForms`
- `isArchived`
- `pipelineTemplateId`

### 5.2 Recruteurs / accès

- `userId`
- `userName`
- `userEmail`
- `userRole`
- `canUpdate`, `canDelete`, `canEvaluate`, `isAdmin`, `follow`

### 5.3 Pipeline

- `PipelineStage[]`
- compteur candidat par étape via `ApplicationProgress`

### 5.4 Annexes

- `SourceToken[]`
- `Form[]`
- permissions d’entité `CAMPAIGN`

## 6. Services Et Endpoints

### 6.1 Chargement principal

- `CampaignService.getCampaignById()` -> `POST /campaigns/getAllByCriteria` avec `data.id`
- `CampaignService.getCampaignAccess()` -> reconstruit les accès via `POST /entityPermission/getForEntity`
- `SourceTokenService.getSourceTokensByCampaign()` -> endpoint source token par campagne
- `FormService.getAllByCriteria({ campaignId })` -> endpoint formulaires

### 6.2 Pipeline et permissions

- `PipelineStageService.getByTemplate()` -> endpoint pipeline stages par template
- `ApplicationProgressService.getAllByCriteria()` -> `POST /applicationProgress/getAllByCriteria`
- `EntityPermissionService` / `campaignService` -> permissions `CAMPAIGN`

### 6.3 Mutations secondaires visibles côté TS

- création de source token via `SourceTokenService.createSourceTokens()`
- modifications d’assignation de formulaire sur token
- navigation vers édition campagne et candidatures filtrées

## 7. Ce Que Le Backend Doit Envoyer

- Une campagne suffisamment enrichie pour la vue détail, pas seulement les champs CRUD minimum.
- Des accès recruteurs cohérents reconstruits depuis `entityPermission`.
- Des étapes pipeline triables avec `stageOrder`, `stageLabel`, `stageType`, `isEliminatory`.
- Des compteurs de progression fiables ou des `ApplicationProgress` requêtables par étape.
- Des tokens source déjà reliés à la campagne.
- Des formulaires reliés à la campagne.

## 8. Entites Metier Impliquees

- `campaign`
- `entityPermission`
- `sourceToken`
- `form`
- `pipelineStage`
- `applicationProgress`
- `user`

## 9. Questions Ou Ecarts A Qualifier

- [ ] La page devrait-elle afficher explicitement les permissions du viewer courant sur la campagne ?
- [ ] Le détail doit-il permettre davantage d’édition inline des tokens et de la configuration campagne ?
- [ ] Les compteurs de candidats par étape doivent-ils rester calculés par appels multiples côté front ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/campaigns/:id` sur une campagne existante.
2. Vérifier les métadonnées principales et le badge de statut.
3. Contrôler le pipeline et les compteurs par étape.
4. Vérifier la liste des recruteurs et leurs permissions.
5. Tester `Voir les candidatures` puis `Modifier`.
6. Contrôler la présence des tokens et formulaires liés si disponibles.