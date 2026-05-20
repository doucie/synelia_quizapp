# Dashboard Evaluations

## 1. Identite

- Route: `/dashboard/evaluations`
- Guard: `permissionGuard(['VIEW_EVALUATIONS'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/evaluations-list/evaluations-list.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/evaluations-list/evaluations-list.html`
- Route de sortie principale: `/dashboard/evaluate/:link`

## 2. Objectif Produit

La page sert à lister les entretiens évaluables ou déjà évalués, puis à ouvrir l’écran d’évaluation détaillé en plein écran.

## 3. Etat Constate

- [x] La page charge les entretiens, les candidatures et les campagnes de l’utilisateur.
- [x] Elle n’affiche que les entretiens `STARTED` ou `OVER`.
- [x] Elle sépare les entretiens `En cours` et `Terminés` via filtres et compteurs.
- [x] Les cartes affichent candidat, campagne, type d’entretien et scores de synthèse si terminés.
- [x] L’ouverture d’une carte redirige vers `/dashboard/evaluate/:link` si `interviewEvaluationsLink` existe.
- [ ] Vérifier si le filtrage par `getMyCampaigns()` exclut des entretiens partagés mais non créés par l’utilisateur.
- [ ] Vérifier la cohérence entre ce listing et les permissions réelles sur les évaluations.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Évaluations`
- [x] sous-titre explicatif
- [x] statistiques `Total`, `En cours`, `Terminés`

### 4.2 Contrôles

- [x] recherche texte
- [x] filtres `Tous`, `En cours`, `Terminés`
- [x] bouton retour aux entretiens

### 4.3 Liste des évaluations

- [x] cartes cliquables par entretien
- [x] identité candidat
- [x] statut entretien
- [x] campagne
- [x] titre entretien
- [x] date démarrage ou fin selon statut
- [x] score, moyenne et nombre d’évaluations si terminé
- [x] état vide avec CTA retour entretiens

## 5. Donnees Affichees

### 5.1 Entretien enrichi

- `id`
- `applicationId`
- `campaignId`
- `interviewStatus`
- `startedAt`
- `endedAt`
- `interviewEvaluationsLink`
- `evaluationScore`
- `evaluationNumber`
- `evaluationPercentage`

### 5.2 Enrichissement candidat / campagne

- `candidateName`
- `candidateEmailDisplay`
- `campaignTitle`
- `quizScorePercent`
- `interviewTitle`

## 6. Services Et Endpoints

- `InterviewService.getAllInterviews()` -> `POST /interviews/getByCriteria`
- `ApplicationService.getApplicationsByCriteria()` -> `POST /applications/getByCriteria`
- `CampaignService.getMyCampaigns()` -> `POST /campaigns/getByCriteria`
- navigation vers l’évaluation détaillée via route `/dashboard/evaluate/:link`

## 7. Ce Que Le Backend Doit Envoyer

- Des entretiens avec `interviewEvaluationsLink` exploitable.
- Des statuts `STARTED` et `OVER` cohérents avec la réalité du workflow.
- Des données d’agrégat d’évaluation suffisantes pour les cartes terminées.
- Des campagnes et candidatures permettant d’enrichir lisiblement les entretiens.

## 8. Entites Metier Impliquees

- `interview`
- `application`
- `campaign`
- `evaluation`

## 9. Questions Ou Ecarts A Qualifier

- [ ] La liste devrait-elle être basée sur les campagnes suivies/partagées et non seulement `myCampaigns` ?
- [ ] Les évaluations terminées devraient-elles afficher plus de détail sans ouvrir le plein écran ?
- [ ] Faut-il une distinction visuelle entre `évaluable` et `consultation seule` ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/evaluations` avec un utilisateur ayant `VIEW_EVALUATIONS`.
2. Vérifier les compteurs `Total`, `En cours`, `Terminés`.
3. Rechercher un candidat ou une campagne.
4. Ouvrir un entretien `STARTED` puis un `OVER`.
5. Vérifier la redirection vers `/dashboard/evaluate/:link`.
6. Contrôler la cohérence entre les scores affichés ici et l’écran d’évaluation détaillé.