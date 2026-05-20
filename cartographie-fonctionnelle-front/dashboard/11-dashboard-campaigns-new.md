# Dashboard Campaigns New

## 1. Identite

- Route: `/dashboard/campaigns/new`
- Guard: `permissionGuard(['CREATE_CAMPAIGNS'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/campaign-form/campaign-form.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/campaign-form/campaign-form.component.html`
- Particularite: même composant que l’édition, mais en mode création sans `campaignId`

## 2. Objectif Produit

La page sert à créer une campagne complète avec spécialité, pipeline, paramètres de quiz et liste de recruteurs autorisés, puis à synchroniser les accès et notifications associés.

## 3. Etat Constate

- [x] Le formulaire réactif couvre les informations générales, le pipeline et la configuration métier.
- [x] La spécialité est obligatoire et se choisit via recherche instantanée.
- [x] Le pipeline template est obligatoire et peut être prérempli par le template par défaut.
- [x] La page peut rechercher et ajouter des recruteurs, admins et super admins sauf l’utilisateur connecté.
- [x] La création de campagne déclenche ensuite une synchronisation des accès recruteurs et des notifications.
- [x] Les champs de stratégie d’affectation de formulaires et politique d’épuisement sont déjà exposés.
- [ ] Vérifier tout le bloc UI de sélection recruteurs et les permissions fines affichées dans le formulaire complet.
- [ ] Vérifier les cas réels où aucune spécialité active n’existe.

## 4. Blocs UI Constates

### 4.1 Header

- [x] Bouton retour vers la liste des campagnes
- [x] Titre `Nouvelle campagne`

### 4.2 Informations générales

- [x] `campaignTitle`
- [x] `campaignDesc`
- [x] recherche et sélection de `speciality`
- [x] `campaignStatus`
- [x] `campaignStart`, `campaignEnd`
- [x] validation de cohérence des dates

### 4.3 Pipeline

- [x] sélection d’un `pipelineTemplate`
- [x] aperçu des étapes du pipeline
- [x] bouton de personnalisation du template
- [x] modal de migration déjà prévue en cas de changement futur de template

### 4.4 Configuration campagne

- [x] `maxApply`
- [x] `markedOutOf`
- [x] `formAssignmentStrategy`
- [x] `formAssignmentExhaustionPolicy`
- [x] `allCanEvaluate`
- [x] `timeAllForms`
- [x] `isArchived`

### 4.5 Recruteurs et accès

- [x] recherche instantanée d’utilisateurs
- [x] ajout d’utilisateurs compatibles par rôle
- [x] permissions fines par recruteur
- [x] exclusion de l’utilisateur connecté de la recherche

## 5. Donnees Affichees Ou Editees

La création requiert au minimum:

- `campaignTitle`
- `campaignDesc`
- `campaignStatus`
- `campaignStart`, `campaignEnd`
- `maxApply`
- `markedOutOf`
- `formAssignmentStrategy`
- `formAssignmentExhaustionPolicy`
- `allCanEvaluate`
- `timeAllForms`
- `isArchived`
- `specialityId`
- `pipelineTemplateId`
- `createdBy` / `creatorId`

Pour les recruteurs ajoutés:

- `userId`
- flags `canEvaluate`, `canUpdate`, `canDelete`, `canPlanify`, `canAcceptPreScreen`, `canAcceptFinal`, `follow`, `isAdmin`

## 6. Services Et Endpoints

### 6.1 Préchargements

- `PipelineTemplateService.getAllByCriteria()` -> endpoint pipeline template de liste
- `SpecialityService.getAll()` -> endpoint spécialités
- `UserService.getAllUsersByCriteria()` -> endpoint utilisateurs pour recherche

### 6.2 Création et suites

- `CampaignService.createCampaign()` -> `POST /campaigns/create`
- `CampaignService.saveCampaignAccess()` -> synchronisation via `POST /entityPermission/grant` et `POST /entityPermission/revoke`
- `CampaignService.createNotification()` -> `POST /notifications/create`

### 6.3 Dépendances annexes

- `AuthService.getCurrentUser()` pour `createdBy`
- `PipelineStageService` et `ApplicationProgressService` pour personnalisation / migration de pipeline

## 7. Ce Que Le Backend Doit Envoyer

- Une réponse de création contenant l’ID de campagne (`items[0].id` ou `id`).
- Un contrat spécialité cohérent pour recherche et chargement.
- Des templates pipeline actifs exploitables en liste.
- Des résultats utilisateurs suffisamment riches pour filtrer par rôle et afficher nom / email.
- Une synchronisation fiable des permissions d’entité `CAMPAIGN`.
- Une création de notification robuste pour chaque nouveau recruteur ajouté.

## 8. Entites Metier Impliquees

- `campaign`
- `speciality`
- `pipelineTemplate`
- `pipelineStage`
- `user`
- `entityPermission`
- `notification`

## 9. Questions Ou Ecarts A Qualifier

- [ ] La création doit-elle rediriger vers la liste ou vers le détail de campagne créé ?
- [ ] Les permissions fines recruteur sont-elles toutes voulues dès la création ou certaines devraient être gérées seulement dans le détail ?
- [ ] Le backend doit-il exposer une réponse plus explicite sur les notifications réellement envoyées ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/campaigns/new` avec un utilisateur ayant `CREATE_CAMPAIGNS`.
2. Vérifier les validations obligatoires: titre, spécialité, pipeline.
3. Ajouter au moins un recruteur avec permissions spécifiques.
4. Sauvegarder la campagne.
5. Vérifier la redirection et l’apparition de la campagne dans la liste.
6. Contrôler que les accès campagne ont bien été créés pour les recruteurs ajoutés.