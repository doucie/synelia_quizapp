# Public Suivre Candidature

## 1. Identite

- Route: `/suivre-candidature`
- Guard: aucun
- Parametres constates: `?code=...&email=...` pour pre-remplissage
- Fichier TS: `quizapp_front/src/app/pages/track-application/track-application.ts`
- Fichier HTML: `quizapp_front/src/app/pages/track-application/track-application.html`

## 2. Objectif Produit

La page permet au candidat de reprendre sa candidature publiquement avec son code de suivi et son email, puis d'agir sur les entretiens, sur certaines corrections de profil et, tant que le dossier reste actif, de retirer explicitement sa candidature.

## 3. Etat Constate

- [x] Le formulaire d'entree demande `trackingCode` et `email`.
- [x] La page accepte un pre-remplissage via query params `code` et `email` puis lance automatiquement la recherche.
- [x] Le chargement principal appelle `/applications/track` et agrege candidature, progression pipeline, entretiens et demandes de correction.
- [x] Le statut candidature est traduit en libelles publics `NEW`, `IN_PROGRESS`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`.
- [x] Les entretiens peuvent etre acceptes, refuses avec motif, ou faire l'objet d'une demande de replanification.
- [x] Les demandes de correction candidat sont limitees a `IDENTITY`, `EMAIL`, `PHONE`.
- [x] La page affiche l'historique des demandes deja creees et leur statut `PENDING`, `APPROVED`, `REJECTED`.
- [x] Quand une tentative de quiz est encore actionnable, la page affiche maintenant une carte quiz dediee avec le bon round (`application_progress`) et un lien direct vers `/quiz/:applicationId/:quizToken` resolu cote backend.
- [x] Un lien mailto vers l'equipe recrutement apparait en cas d'erreur de reprise.
- [x] Le contrat public distingue maintenant explicitement `candidateInterviewId` (lien candidat utilise par `/applications/respond-interview`) et `interviewId` (entretien metier), tout en conservant `id` pour compatibilite ascendante.
- [x] Le candidat peut retirer explicitement sa candidature depuis cette page tant que le dossier est encore public-actionnable.
- [x] Quand `applicationAbandoned=true`, la page affiche maintenant un verrou public transversal qui bloque les reponses entretien, les nouvelles demandes de correction et tout nouveau retrait.

## 4. Blocs UI Constates

### 4.1 Formulaire de reprise

- [x] champ `Code de suivi`
- [x] champ `Adresse e-mail`
- [x] bouton `Suivre ma candidature`

### 4.2 Etat global candidature

- [x] badge de statut candidature
- [x] identite candidat
- [x] nom de campagne
- [x] date de soumission
- [x] rappel du code de suivi

### 4.3 Progression pipeline

- [x] timeline des etapes
- [x] libelle d'etat par etape
- [x] dates de debut / fin si disponibles
- [x] score d'etape si disponible
- [x] carte `Etape en cours`

### 4.3 bis Verrou global candidature

- [x] banniere de verrou public quand la candidature est retiree
- [x] message explicite de blocage transversal des actions publiques
- [x] conservation de la consultation du suivi meme apres retrait

### 4.4 Bloc quiz

- [x] carte quiz publique avec statut de tentative
- [x] rattachement au bon round quiz via `applicationQuizAttemptId` et `applicationProgressId`
- [x] lien de reprise vers `/quiz/:applicationId/:quizToken` quand la tentative est `PENDING` ou `STARTED`

### 4.5 Bloc entretiens

- [x] cartes entretien avec statut, type, acces et duree
- [x] confirmation de creneau
- [x] refus avec motif
- [x] demande de nouvelle date
- [x] affichage des motifs deja transmis

### 4.6 Bloc corrections candidat

- [x] historique des demandes de correction
- [x] formulaire de creation d'une nouvelle demande
- [x] messages succes / erreur dedies
- [x] verrou du formulaire quand la candidature est retiree

### 4.7 Bloc retrait de candidature

- [x] CTA `Retirer ma candidature` visible tant que `canWithdraw=true`
- [x] confirmation utilisateur avant retrait
- [x] message de succes / erreur dedie au retrait

## 5. Donnees Affichees Ou Editees

- `trackingCode`
- `candidateEmail`
- `applicationStatus`
- `applicationAbandoned`
- `publicActionsLocked`
- `publicLockReason`
- `canWithdraw`
- `campaignTitle`
- `createdAt`
- `stages[]` et `progress[]`
- `quiz` avec `applicationQuizAttemptId`, `applicationProgressId`, `quizToken`, `quizStatus`, `canResume`
- `interviews[]` avec `candidateInterviewId`, `interviewId`, `responseState`, `canRespond`, `declineReason`, `alternativeDateRequested`
- `asks[]` avec `requestType`, `askStatus`, `decisionReason`

## 6. Services Et Endpoints

- reprise candidature via `POST /applications/track`
- reponse entretien via `POST /applications/respond-interview`
- demande de correction via `POST /applications/submit-ask`
- retrait candidature via `POST /applications/withdraw`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse `applications/track` contenant au minimum `application`, `stages`, `progress`, `interviews`, `asks`.
- Un `trackingCode` public stable et univoque, distinct du `quizToken`.
- Quand un round `QUIZ` est actionnable publiquement, une action deja resolue sur la bonne tentative `application_quiz_attempt`, avec son `quizToken` dedie et l'occurrence `application_progress` concernee.
- Des statuts candidature deja traduits ou au moins normalises pour que le front puisse les convertir vers `NEW`, `IN_PROGRESS`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`.
- Un verrou public explicite au niveau candidature (`publicActionsLocked`, `publicLockReason`, `canWithdraw`) distinct du detail des occurrences.
- Des entretiens avec une distinction claire entre l'ID du lien candidat (`candidateInterviewId`) et l'ID metier de l'entretien (`interviewId`).
- Un endpoint `respond-interview` capable de refuser, accepter ou replanifier sans exposition d'autres donnees internes.
- Un endpoint `submit-ask` restreint aux trois types de correction publics actuellement proposes.
- Un endpoint `withdraw` capable de basculer `applicationAbandoned`, de renvoyer le suivi recalcule et de verrouiller les autres actions publiques.

## 8. Entites Metier Impliquees

- `application`
- `candidate_token` / code de suivi public
- `pipeline_stage` et progression candidature
- `candidate_interview`
- `interview`
- `candidate_ask`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le candidat doit-il voir plus de contexte campagne (intitule de poste, recruteur, prochaine action attendue) ?
- [ ] Les types de correction publics doivent-ils s'etendre au CV ou a d'autres pieces jointes ?
- [ ] Faut-il exposer une raison de retrait libre ou un motif standardise plutot qu'un simple abandon public ?

## 10. Recette Manuelle

1. Ouvrir `/suivre-candidature` puis saisir un code de suivi et un email valides.
2. Verifier la carte de statut et la timeline de progression.
3. Repondre a un entretien `canRespond=true` en acceptant puis en testant un refus ou une replanification.
4. Creer une demande de correction `EMAIL` ou `PHONE`.
5. Retirer la candidature depuis la page puis verifier l'etat `WITHDRAWN`, la banniere de verrou et le blocage des actions publiques.
6. Reouvrir la page via `?code=...&email=...` et verifier le pre-remplissage automatique.

## 11. Impact Cible Multi-Occurrences

- [ ] remplacer la lecture de `applicationStatus` par une chronologie de rounds issue de `application_progress`
- [ ] afficher plusieurs quiz et plusieurs entretiens potentiels pour une meme candidature quand le pipeline le prevoit
- [x] faire pointer chaque action publique vers une occurrence precise: tentative de quiz, invitation d'entretien, demande de correction
- [x] conserver une separation nette entre `trackingCode` public et les tokens de tentative de quiz
- [x] quand la page propose de reprendre un quiz, utiliser le `quizToken` de `application_quiz_attempt` deja resolu par le backend et rattache au bon `application_progress`
- [x] formaliser les reponses entretien sur `candidate_interview` avec un vrai statut (`PENDING`, `ACCEPTED`, `DECLINED`, `RESCHEDULE_REQUESTED`) et une date de reponse exploitable
- [x] ajouter un flux public explicite de retrait de candidature pilotant `applicationAbandoned`, le blocage de l'avancement et la notification des recruteurs concernes
- [x] exposer clairement l'etat global de candidature abandonnee comme un verrou transversal distinct de la chronologie fine des rounds
