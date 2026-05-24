# Dashboard Decisions

## 1. Identite

- Route: `/dashboard/decisions`
- Guard: `permissionGuard(['VIEW_DECISIONS'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/decisions/decisions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/decisions/decisions.html`

## 2. Objectif Produit

La page sert à prendre et annuler des décisions sur les candidatures le long du pipeline, surtout pour les étapes de pré-sélection et de décision finale.

## 3. Etat Constate

- [x] La page charge candidatures, source tokens, campagnes et accès campagne avant d’enrichir localement les candidatures.
- [x] Elle recharge ensuite les décisions réelles de la candidature sélectionnée.
- [x] Les filtres `ALL`, `SUBMITTED`, `PRE_SCREEN`, `FINAL` sont centralisés et les compteurs dérivent de la même logique.
- [x] La page est organisée en trois colonnes: liste candidats, détail candidat, historique / actions.
- [x] Les étapes du pipeline sont visualisées dynamiquement avec statut, badges et descriptions.
- [x] Les boutons de décision apparaissent selon l’étape du pipeline et l’état courant.
- [x] L’annulation de décision est supportée.
- [ ] Vérifier visuellement la troisième colonne complète et l’historique des décisions, non entièrement couvert par l’extrait HTML lu ici.
- [ ] Vérifier le niveau exact de contrôle par permissions sur les actions de décision.

## 4. Blocs UI Constates

### 4.1 Header

- [x] Titre `Gestion des Décisions`
- [x] sous-titre de gestion
- [x] stats compactes pour candidatures soumises, pré-sélection, décisions finales

### 4.2 Recherche et filtres

- [x] recherche candidat
- [x] chips `Toutes`, `En attente`, `Pré-sélectionnés`, `Décisions finales`

### 4.3 Colonne candidats

- [x] liste des candidatures filtrées
- [x] nom candidat
- [x] campagne
- [x] date de candidature
- [x] indicateur de statut candidature

### 4.4 Colonne détail candidature

- [x] identité candidat
- [x] campagne et date
- [x] statut candidature
- [x] étapes pipeline dynamiques
- [x] informations quiz, entretien ou évaluation selon le type d’étape
- [x] boutons `APPROVE` / `CANCEL` sur étapes décisionnelles
- [x] annulation de décision déjà possible

## 5. Donnees Affichees

### 5.1 Candidature enrichie

- `id`
- `candidateFirstName`
- `candidateLastName`
- `candidateEmail`
- `applicationStatus`
- `createdAt`
- `campaignTitle`
- `campaignId`
- `sourceTokenLabel`
- `emailVerified`
- `quizScorePercent`
- `interviewDate`
- `interviewStatus`
- `evaluationScore`

### 5.2 Décision

- `id`
- `applicationId`
- `userId`
- `decisionType`
- `decisionLabel`
- `decisionComment`
- `createdAt`
- `isDeleted`

### 5.3 Pipeline

- `PipelineStage[]`
- `ApplicationProgress[]`
- `progressStatus` par candidature / étape

## 6. Services Et Endpoints

### 6.1 Chargement principal

- `ApplicationService.getApplicationsByCriteria()` -> `POST /applications/getByCriteria`
- `SourceTokenService.getSourceTokensByCriteria()` -> `POST /sourceToken/getByCriteria`
- `CampaignService.getAllCampaignsByCriteria()` -> `POST /campaigns/getAllByCriteria`
- `CampaignService.getCampaignAccessesByUser()` -> accès campagne de l’utilisateur

### 6.2 Chargement décisionnel

- `DecisionService.getDecisionsByApplicationId()` -> `POST /decisions/getByCriteria` avec `applicationId`
- `DecisionService.createDecision()` -> `POST /decisions/create`
- `DecisionService.deleteDecision()` -> `POST /decisions/delete`

### 6.3 Enrichissements pipeline

- `PipelineStageService.getAllByCriteria()` -> `POST /pipelineStage/getAllByCriteria`
- `ApplicationProgressService.getAllByCriteria()` -> `POST /applicationProgress/getAllByCriteria`
- `UserService` pour résoudre les auteurs de décisions

## 7. Ce Que Le Backend Doit Envoyer

- Des décisions liées à `applicationId` avec dates et auteur exploitables.
- Des candidatures suffisamment enrichies ou enrichissables côté front via `sourceToken` et `campaign`.
- Des statuts pipeline normalisés pour chaque étape.
- Une cohérence stricte entre `applicationStatus`, décisions prises et progression pipeline.
- Des contrôles serveur empêchant la prise de décision sur des étapes ou profils non autorisés.

## 8. Entites Metier Impliquees

- `application`
- `decision`
- `campaign`
- `sourceToken`
- `pipelineStage`
- `applicationProgress`
- `user`
- accès / permissions campagne

## 9. Questions Ou Ecarts A Qualifier

- [ ] Les types de décision doivent-ils être documentés formellement dans une table de référence ?
- [ ] L’annulation de décision doit-elle être une suppression logique, un nouveau type de décision ou les deux selon les cas ?
- [ ] Le backend devrait-il exposer directement le dernier état décisionnel agrégé d’une candidature ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/decisions` avec un utilisateur ayant `VIEW_DECISIONS`.
2. Rechercher un candidat et appliquer chaque filtre principal.
3. Sélectionner une candidature avec pipeline renseigné.
4. Prendre une décision sur une étape autorisée.
5. Vérifier la mise à jour de l’historique et des compteurs.
6. Annuler la décision et contrôler l’état résultant.