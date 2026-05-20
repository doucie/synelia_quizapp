# Public Suivre Candidature

## 1. Identite

- Route: `/suivre-candidature`
- Guard: aucun
- Parametres constates: `?code=...&email=...` pour pre-remplissage
- Fichier TS: `quizapp_front/src/app/pages/track-application/track-application.ts`
- Fichier HTML: `quizapp_front/src/app/pages/track-application/track-application.html`

## 2. Objectif Produit

La page permet au candidat de reprendre sa candidature publiquement avec son code de suivi et son email, puis d'agir sur les entretiens et sur certaines corrections de profil.

## 3. Etat Constate

- [x] Le formulaire d'entree demande `trackingCode` et `email`.
- [x] La page accepte un pre-remplissage via query params `code` et `email` puis lance automatiquement la recherche.
- [x] Le chargement principal appelle `/applications/track` et agrege candidature, progression pipeline, entretiens et demandes de correction.
- [x] Le statut candidature est traduit en libelles publics `NEW`, `IN_PROGRESS`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`.
- [x] Les entretiens peuvent etre acceptes, refuses avec motif, ou faire l'objet d'une demande de replanification.
- [x] Les demandes de correction candidat sont limitees a `IDENTITY`, `EMAIL`, `PHONE`.
- [x] La page affiche l'historique des demandes deja creees et leur statut `PENDING`, `APPROVED`, `REJECTED`.
- [x] Un lien mailto vers l'equipe recrutement apparait en cas d'erreur de reprise.
- [ ] Verifier si `TrackingInterview.id` represente toujours le `candidateInterviewId` attendu par `/applications/respond-interview`, car le DTO expose aussi `interviewId`.
- [ ] Verifier si un candidat doit aussi pouvoir retirer explicitement sa candidature depuis cette page.

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

### 4.4 Bloc entretiens

- [x] cartes entretien avec statut, type, acces et duree
- [x] confirmation de creneau
- [x] refus avec motif
- [x] demande de nouvelle date
- [x] affichage des motifs deja transmis

### 4.5 Bloc corrections candidat

- [x] historique des demandes de correction
- [x] formulaire de creation d'une nouvelle demande
- [x] messages succes / erreur dedies

## 5. Donnees Affichees Ou Editees

- `trackingCode`
- `candidateEmail`
- `applicationStatus`
- `campaignTitle`
- `createdAt`
- `stages[]` et `progress[]`
- `interviews[]` avec `responseState`, `canRespond`, `declineReason`, `alternativeDateRequested`
- `asks[]` avec `requestType`, `askStatus`, `decisionReason`

## 6. Services Et Endpoints

- reprise candidature via `POST /applications/track`
- reponse entretien via `POST /applications/respond-interview`
- demande de correction via `POST /applications/submit-ask`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse `applications/track` contenant au minimum `application`, `stages`, `progress`, `interviews`, `asks`.
- Un `trackingCode` public stable et univoque, distinct du `quizToken`.
- Des statuts candidature deja traduits ou au moins normalises pour que le front puisse les convertir vers `NEW`, `IN_PROGRESS`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`.
- Des entretiens avec une distinction claire entre l'ID du lien candidat (`candidateInterviewId`) et l'ID metier de l'entretien.
- Un endpoint `respond-interview` capable de refuser, accepter ou replanifier sans exposition d'autres donnees internes.
- Un endpoint `submit-ask` restreint aux trois types de correction publics actuellement proposes.

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
- [ ] Faut-il ajouter un veritable flux de retrait de candidature maintenant que le statut `WITHDRAWN` est expose ?

## 10. Recette Manuelle

1. Ouvrir `/suivre-candidature` puis saisir un code de suivi et un email valides.
2. Verifier la carte de statut et la timeline de progression.
3. Repondre a un entretien `canRespond=true` en acceptant puis en testant un refus ou une replanification.
4. Creer une demande de correction `EMAIL` ou `PHONE`.
5. Reouvrir la page via `?code=...&email=...` et verifier le pre-remplissage automatique.
