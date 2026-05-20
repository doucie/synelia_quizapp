# Dashboard Evaluate Fullscreen

## 1. Identite

- Route montee: `/dashboard/evaluate`
- Contrat d'entree constate: utilisation effective avec `?interviewId=<id>`
- Guard: `authGuard`
- Shell: page plein ecran hors layout dashboard classique
- Fichier TS: `quizapp_front/src/app/pages/dashboard/evaluations/evaluations.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/evaluations/evaluations.html`

## 2. Objectif Produit

La page sert d'espace d'evaluation temps reel en plein ecran pour un entretien donne, lorsqu'on ouvre l'evaluation par identifiant interne plutot que par lien court partageable.

## 3. Etat Constate

- [x] La route monte le composant `EvaluationsComponent` sans header/sidebar du dashboard.
- [x] L'entree utile passe par `queryParamMap` avec `interviewId`.
- [x] Le composant charge l'entretien via `InterviewService.getInterviewById()` quand `?interviewId=` est present.
- [x] Une fois l'entretien charge, le composant recupere permissions d'entite, participants et acces campagne avant d'autoriser l'evaluation.
- [x] Si l'utilisateur courant n'a ni permission `VIEW_EVALUATIONS` sur l'entite `INTERVIEW`, ni ligne `interviewParticipant`, la page se bloque sur un message d'acces refuse.
- [x] Le flux cree ou recharge le `candidateInterview`, puis charge les evaluations existantes comme un fil de discussion.
- [x] La page gere la presence en ligne par polling, avec ping regulier et mise a jour du statut `hasFinished` des evaluateurs.
- [x] Le formulaire permet de creer, modifier et supprimer sa propre evaluation.
- [x] Les admins/createurs de campagne peuvent cloturer l'entretien via l'endpoint `finish`.
- [x] La route nue `/dashboard/evaluate` sans `interviewId` ne charge rien de utile et ne semble pas fournir d'etat d'erreur explicite.
- [ ] Verifier si l'acces par ID doit rester un fallback interne seulement ou etre formalise comme route supportee.
- [ ] Verifier si le guard route doit etre plus restrictif qu'un simple `authGuard`.

## 4. Blocs UI Constates

### 4.1 Header plein ecran

- [x] bouton retour vers les entretiens
- [x] titre `Evaluations`
- [x] date / lieu de l'entretien
- [x] bloc candidat avec email et score quiz si disponible
- [x] score moyen global si au moins une evaluation existe

### 4.2 Sidebar evaluateurs

- [x] liste des evaluateurs
- [x] indicateur online/offline
- [x] badges createur / admin
- [x] score individuel si l'evaluateur a deja note
- [x] case `J'ai termine mon evaluation` pour l'utilisateur courant
- [x] bouton `Conclure l'entretien`

### 4.3 Zone centrale evaluations

- [x] fil de discussion des evaluations existantes
- [x] edition inline de sa propre evaluation
- [x] suppression de sa propre evaluation
- [x] etat vide si aucune evaluation n'existe encore

### 4.4 Formulaire d'evaluation

- [x] champ note /100
- [x] champ commentaire
- [x] bouton de soumission
- [x] message `Vous avez deja soumis votre evaluation` si applicable

### 4.5 Modal de cloture

- [x] resume des evaluateurs non termines
- [x] recap nombre d'evaluations / score total / score moyen
- [x] action `Terminer quand meme` ou `Cloturer l'entretien`

## 5. Donnees Affichees Ou Editees

- `interview.id`
- `interviewDate`
- `interviewLocation`
- `campaignId`
- `applicationsId` / `applicationId`
- `candidateInterviewId`
- `candidateMark`
- `recruiterComment`
- statut session evaluateur `isOnline`, `hasFinished`
- agregats `evaluationScore`, `evaluationNumber`, `evaluationPercentage`

## 6. Services Et Endpoints

- chargement entretien par ID via `POST /interviews/getByCriteria`
- lecture permissions interview via `POST /entityPermission/getForEntity`
- lecture participants via `POST /interviewParticipant/getByCriteria`
- lecture acces campagne via `CampaignService.getCampaignAccess(...)`
- lecture candidature via `POST /applications/getByCriteria`
- lecture `candidateInterview` via `POST /candidateInterview/getByCriteria`
- creation `candidateInterview` via `POST /candidateInterview/create`
- lecture evaluations via `POST /evaluations/getByCriteria`
- creation evaluation via `POST /evaluations/create`
- mise a jour evaluation via `POST /evaluations/update`
- suppression evaluation via `POST /evaluations/delete`
- ping presence / statut evaluateur via `POST /interviewParticipant/update`
- cloture entretien via `POST /interviews/finish`

## 7. Ce Que Le Backend Doit Envoyer

- Un `POST /interviews/getByCriteria` capable de retrouver exactement un entretien sur `id` avec ses champs de contexte utiles a l'evaluation.
- Des permissions d'entite et/ou des participants suffisants pour distinguer les evaluateurs autorises du reste des utilisateurs authentifies.
- Un `candidateInterview` unique et coherent pour le couple entretien/candidature, ou a minima un comportement idempotent cote creation.
- Des evaluations filtrees par `candidateInterviewId` avec `createdBy`, `candidateMark`, `recruiterComment`, `createdAt` et `isDeleted`.
- Un endpoint `interviews/finish` qui passe l'entretien a `OVER`, renseigne `endedAt`, recalcule les scores d'entretien et propage les agregats candidature.
- Une enforcement serveur forte: la route frontend n'est protegee que par `authGuard`, donc l'autorisation metier doit etre decidee cote backend.

## 8. Entites Metier Impliquees

- `interview`
- `entity_permission`
- `interview_participant`
- `candidate_interview`
- `evaluation`
- `application`

## 9. Questions Ou Ecarts A Qualifier

- [ ] La route nue sans `interviewId` doit-elle rediriger vers `/dashboard/interviews` au lieu de laisser un ecran incomplet ?
- [ ] L'acces par ID interne doit-il rester reserve aux utilisateurs authentifies internes alors que l'acces par lien court existe en parallele ?
- [ ] Plusieurs appels de ce flux utilisent encore `user: 1` dans `EvaluationService` et `InterviewParticipantService`; verifier que cela n'introduit ni faux positifs ni faux refus en production.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/evaluate?interviewId=<id>` avec un evaluateur autorise.
2. Verifier le chargement de l'entretien, du candidat et de la liste des evaluateurs.
3. Soumettre une evaluation puis verifier son apparition immediate dans le fil.
4. Modifier puis supprimer cette evaluation et verifier la remise a zero de `hasFinished` pour l'utilisateur courant.
5. Tester la cloture de l'entretien avec et sans evaluateurs encore en attente.
