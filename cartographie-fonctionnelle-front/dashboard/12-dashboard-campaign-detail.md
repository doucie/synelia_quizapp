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
- [x] Les formulaires de campagne, la stratégie d’attribution et les tokens sources sont bien rendus et pilotés depuis la page.
- [x] Les permissions d’entité `CAMPAIGN` sont exploitées pour construire les accès.
- [x] La matrice de permissions détaillées est bien visible et permet de toggler `UPDATE`, `DELETE`, `EVALUATE`, `CORRECT_TEST`, `PLANIFY`, `ADVANCE_PIPELINE` et `FOLLOW`.
- [x] Les actions visibles ne sont pas toutes conditionnées dans le template: l’entrée en édition vérifie les droits au clic via `checkEditPermission()`, tandis que les mutations secondaires (tokens, affectation de formulaire par token, matrice de permissions) restent directement exposées dans l’UI.

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
- [x] badge administrateur local et indicateur `Peut corriger les tests`

### 4.5 Formulaires de campagne

- [x] liste des formulaires associés
- [x] badge actif / inactif
- [x] état vide contextualisé si aucun formulaire n'est lié

### 4.6 Attribution des formulaires

- [x] sélection de la stratégie d’attribution
- [x] sélection de la politique d’épuisement
- [x] résumé textuel de la stratégie choisie
- [x] enregistrement dédié de cette configuration

### 4.7 Tokens sources

- [x] liste des tokens existants
- [x] création d’un token depuis la page détail
- [x] copie du lien public de candidature
- [x] suppression d’un token
- [x] affectation ou retrait d’un formulaire dédié par token

### 4.8 Permissions d’entité détaillées

- [x] table utilisateur x permission
- [x] toggles `UPDATE`, `DELETE`, `EVALUATE`, `CORRECT_TEST`, `PLANIFY`, `ADVANCE_PIPELINE`, `FOLLOW`
- [x] fusion visuelle des recruteurs et des utilisateurs portant déjà des permissions d’entité

## 5. Donnees Affichees

### 5.1 Campagne

- `campaignTitle`
- `campaignDesc`
- `campaignStatus`
- `campaignStart`, `campaignEnd`
- `campaignDuration`
- `maxApply`
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
- `canUpdate`, `canDelete`, `canEvaluate`, `isAdmin`, `isCreator`, `follow`

Permissions détaillées exposées dans la page:

- `UPDATE`
- `DELETE`
- `EVALUATE`
- `CORRECT_TEST`
- `PLANIFY`
- `ADVANCE_PIPELINE`
- `FOLLOW`

### 5.3 Pipeline

- `PipelineStage[]`
- compteur candidat par étape via `ApplicationProgress`

### 5.4 Annexes

- `SourceToken[]` avec `sourceTokenName`, `tokenString`, `formId`, `formName`, `createdAt`
- `Form[]` avec `formName`, `formDesc`, `isActive`
- permissions d’entité `CAMPAIGN` chargées et mutées depuis la page

## 6. Services Et Endpoints

### 6.1 Chargement principal

- `CampaignService.getCampaignById()` -> `POST /campaigns/getAllByCriteria` avec `data.id`
- `CampaignService.getCampaignAccess()` -> reconstruit les accès via `POST /entityPermission/getForEntity`
- `SourceTokenService.getSourceTokensByCampaign()` -> wrapper sur `POST /sourceToken/getByCriteria` avec `campaignId`
- `FormService.getAllByCriteria({ campaignId })` -> endpoint formulaires

### 6.2 Pipeline et permissions

- `PipelineStageService.getByTemplate()` -> endpoint pipeline stages par template
- `ApplicationProgressService.getAllByCriteria()` -> `POST /applicationProgress/getAllByCriteria`, un appel par étape pour les compteurs
- `EntityPermissionService.getForEntity()` / `grant()` / `revoke()` -> permissions `CAMPAIGN`
- `CampaignService.checkEditPermission()` -> `POST /campaigns/checkEditPermission`
- `UserService.updateAdminMode()` -> activation du mode admin avant redirection vers l’édition si nécessaire

### 6.3 Mutations secondaires visibles côté TS

- création de source token via `SourceTokenService.createSourceTokens()` -> `POST /sourceToken/create`
- modification d’assignation de formulaire sur token via `SourceTokenService.updateSourceToken()` -> `POST /sourceToken/update`
- suppression de token via `SourceTokenService.deleteSourceToken()` -> `POST /sourceToken/delete`
- mise à jour de la stratégie d’attribution via `CampaignService.updateCampaign()` -> `POST /campaigns/update`
- navigation vers édition campagne et candidatures filtrées

## 7. Ce Que Le Backend Doit Envoyer

- Une campagne suffisamment enrichie pour la vue détail, pas seulement les champs CRUD minimum.
- Des accès recruteurs cohérents reconstruits depuis `entityPermission`.
- Des étapes pipeline triables avec `stageOrder`, `stageLabel`, `stageType`, `isEliminatory`.
- Des compteurs de progression fiables ou des `ApplicationProgress` requêtables par étape.
- Des tokens source reliés à la campagne avec identifiant stable, `tokenString` et éventuel `formId` / `formName`.
- Des formulaires reliés à la campagne.
- Des permissions d’entité suffisamment enrichies pour afficher le nom, l’email et le rôle des utilisateurs dans la matrice.

## 8. Entites Metier Impliquees

- `campaign`
- `entityPermission`
- `sourceToken`
- `form`
- `pipelineStage`
- `applicationProgress`
- `user`

## 9. Questions Ou Ecarts A Qualifier

- [x] La page n’affiche pas explicitement les permissions du viewer courant; elle montre surtout les permissions attribuées sur la campagne et laisse le contrôle d’édition principale au clic sur `Modifier`.
- [x] Le détail permet déjà une édition inline secondaire: tokens, formulaire par token, stratégie d’attribution et matrice de permissions.
- [x] Les compteurs de candidats par étape sont actuellement calculés par appels multiples côté front, un appel `ApplicationProgressService.getAllByCriteria()` par étape pipeline.
- [ ] Faut-il masquer dans le template les actions tokens / permissions pour un viewer sans droit de mutation, au lieu de s’appuyer surtout sur les contrôles de service et backend ?
- [ ] La matrice doit-elle aussi exposer `ADMIN` et `CREATOR`, aujourd’hui visibles surtout via les cartes recruteurs ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/campaigns/:id` sur une campagne existante.
2. Vérifier les métadonnées principales et le badge de statut.
3. Contrôler le pipeline et les compteurs par étape.
4. Vérifier la liste des recruteurs et leurs permissions.
5. Contrôler la présence des formulaires liés et la section d’attribution des formulaires.
6. Créer un token, lui associer un formulaire puis vérifier le lien de candidature généré.
7. Tester `Voir les candidatures` puis `Modifier`, y compris le cas où `adminMode` doit être activé.
8. Modifier une permission dans la matrice et vérifier sa persistance après rechargement.