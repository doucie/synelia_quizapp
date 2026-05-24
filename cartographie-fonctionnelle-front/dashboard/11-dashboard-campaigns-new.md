# Dashboard Campaigns New

## 1. Identite

- Route: `/dashboard/campaigns/new`
- Guard: `permissionGuard(['CREATE_CAMPAIGNS'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/campaign-form/campaign-form.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/campaign-form/campaign-form.component.html`
- Particularite: même composant que l’édition, mais en mode création sans `campaignId`

## 2. Objectif Produit

La page sert à créer une campagne complète avec spécialité, pipeline, paramètres de quiz, liste de recruteurs autorisés et formulaires associés, puis à synchroniser les accès et notifications associés.

## 3. Etat Constate

- [x] Le formulaire réactif couvre les informations générales, le pipeline et la configuration métier.
- [x] La spécialité est obligatoire et se choisit via recherche instantanée.
- [x] Le pipeline template est obligatoire et peut être prérempli par le template par défaut.
- [x] La page peut rechercher et ajouter des recruteurs, admins et super admins sauf l’utilisateur connecté.
- [x] La recherche recruteur peut maintenant proposer des suggestions dès le focus, y compris avec requête vide, tant que `allCanEvaluate` n'est pas coché.
- [x] La création de campagne déclenche ensuite une synchronisation des accès recruteurs et des notifications.
- [x] Les champs de stratégie d’affectation de formulaires et politique d’épuisement sont déjà exposés.
- [x] Le bloc UI de sélection recruteurs expose bien les permissions fines, le toggle `Administrateur`, et la sauvegarde propage maintenant réellement ce statut via les accès campagne.
- [x] Quand `allCanEvaluate` est coché, la recherche de `Recruteurs autorisés` est verrouillée et vidée pour éviter une configuration contradictoire.
- [x] La page permet désormais de rechercher et associer un ou plusieurs formulaires existants à la campagne pendant la création.
- [x] Les formulaires déjà associés peuvent aussi être retirés depuis l'écran, la sauvegarde envoyant désormais un détachement explicite au backend.
- [x] Si aucune spécialité active n’existe, le formulaire remplace la recherche par un état vide explicite avec redirection vers la gestion des spécialités.
- [x] Après sauvegarde, la page revient vers `/dashboard/campaigns`, y compris si la synchronisation secondaire des accès, notifications ou formulaires échoue ensuite.

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
- [x] état vide bloquant si aucune spécialité active n'est disponible

### 4.3 Pipeline

- [x] sélection d’un `pipelineTemplate`
- [x] aperçu des étapes du pipeline
- [x] bouton de personnalisation du template
- [x] modal de migration déjà prévue en cas de changement futur de template

### 4.4 Configuration campagne

- [x] `maxApply`
- [x] `formAssignmentStrategy`
- [x] `formAssignmentExhaustionPolicy`
- [x] `allCanEvaluate`
- [x] `timeAllForms`
- [x] `isArchived`

### 4.5 Recruteurs et accès

- [x] recherche instantanée d’utilisateurs
- [x] ajout d’utilisateurs compatibles par rôle
- [x] verrouillage de la recherche explicite si `allCanEvaluate` est activé
- [x] permissions fines par recruteur
- [x] toggle `Administrateur` qui active les droits forts et persiste l'accès `ADMIN`
- [x] exclusion de l’utilisateur connecté de la recherche

### 4.6 Formulaires de campagne

- [x] recherche instantanée de formulaires existants
- [x] ajout d’un ou plusieurs formulaires disponibles pour la campagne
- [x] affichage des formulaires déjà associés en édition
- [x] persistance des nouvelles associations de formulaires à la sauvegarde
- [x] retrait des formulaires déjà associés et persistance du détachement à la sauvegarde

## 5. Donnees Affichees Ou Editees

La création requiert au minimum:

- `campaignTitle`
- `campaignDesc`
- `campaignStatus`
- `campaignStart`, `campaignEnd`
- `maxApply`
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

Pour les formulaires associés:

- `id`
- `formName`
- `formDesc`
- `isActive`
- `campaignId`

## 6. Services Et Endpoints

### 6.1 Préchargements

- `PipelineTemplateService.getAllByCriteria()` -> endpoint pipeline template de liste
- `SpecialityService.getAll()` -> endpoint spécialités
- `UserService.getAllUsersByCriteria()` -> endpoint utilisateurs pour recherche
- `FormService.getAllByCriteria()` -> endpoint formulaires pour recherche et chargement des formulaires déjà liés

### 6.2 Création et suites

- `CampaignService.createCampaign()` -> `POST /campaigns/create`
- `CampaignService.saveCampaignAccess()` -> synchronisation via `POST /entityPermission/grant` et `POST /entityPermission/revoke`, y compris le droit `ADMIN` si le toggle recruteur correspondant est coché
- `CampaignService.createNotification()` -> `POST /notifications/create`

### 6.3 Dépendances annexes

- `AuthService.getCurrentUser()` pour `createdBy`
- `FormService.update()` pour rattacher ou détacher explicitement les formulaires sélectionnés à la campagne créée ou éditée
- `PipelineStageService` et `ApplicationProgressService` pour personnalisation / migration de pipeline

## 7. Ce Que Le Backend Doit Envoyer

- Une réponse de création contenant l’ID de campagne (`items[0].id` ou `id`).
- Un contrat spécialité cohérent pour recherche et chargement.
- Des templates pipeline actifs exploitables en liste.
- Des résultats utilisateurs suffisamment riches pour filtrer par rôle et afficher nom / email.
- Des formulaires disponibles filtrables par texte avec `campaignId` exploitable pour rattachement.
- Une synchronisation fiable des permissions d’entité `CAMPAIGN`.
- Une création de notification robuste pour chaque nouveau recruteur ajouté.

## 8. Entites Metier Impliquees

- `campaign`
- `speciality`
- `pipelineTemplate`
- `pipelineStage`
- `form`
- `user`
- `entityPermission`
- `notification`

## 9. Questions Ou Ecarts A Qualifier

- [x] La création redirige actuellement vers la liste `/dashboard/campaigns`; il n'y a pas de redirection automatique vers le détail de campagne créé.
- [ ] Les permissions fines recruteur sont-elles toutes voulues dès la création ou certaines devraient être gérées seulement dans le détail ?
- [ ] Le backend doit-il exposer une réponse plus explicite sur les notifications réellement envoyées ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/campaigns/new` avec un utilisateur ayant `CREATE_CAMPAIGNS`.
2. Vérifier les validations obligatoires: titre, spécialité, pipeline.
3. Vérifier que si aucune spécialité active n’existe, un état vide explique le blocage et renvoie vers `/dashboard/specialities`.
4. Cocher `Autoriser tous les recruteurs à évaluer les candidatures` et vérifier que la recherche de recruteurs autorisés se désactive immédiatement.
5. Décocher cette option, puis ajouter au moins un recruteur avec permissions spécifiques et tester aussi le toggle `Administrateur`.
6. Rechercher et associer un ou plusieurs formulaires existants.
7. En édition, retirer aussi au moins un formulaire déjà lié puis sauvegarder.
8. Vérifier la redirection vers la liste et l’apparition de la campagne.
9. Contrôler que les accès campagne ont bien été créés pour les recruteurs ajoutés, y compris le statut `ADMIN` si coché.
10. Contrôler que les formulaires ajoutés remontent sur le détail de la campagne.
11. Contrôler qu’un formulaire retiré n’est plus rattaché à la campagne après sauvegarde.