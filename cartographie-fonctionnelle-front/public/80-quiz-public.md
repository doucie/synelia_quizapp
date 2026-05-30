# Quiz Public

## 1. Identite

- Route: `/quiz/:applicationId/:quizToken`
- Guard: aucune garde front dediee; l'acces repose sur la validite du token cote backend
- Fichier TS: `quizapp_front/src/app/pages/quiz/quiz.ts`
- Fichier HTML: `quizapp_front/src/app/pages/quiz/quiz.html`

## 2. Objectif Produit

La page permet a un candidat de passer ou reprendre une tentative de quiz public securise a partir d'un lien tokenise. Elle gere le chargement du questionnaire, la navigation question par question, la sauvegarde des reponses, le timing eventuel et la cloture du quiz.

## 3. Etat Constate

- [x] la route lit `applicationId` et `quizToken` depuis l'URL
- [x] `ApplicationService.getQuiz()` charge le quiz via `POST /applications/get-quiz`
- [x] le composant parse un JSON de quiz depuis `response.items[0].searchString`
- [x] la page gere un ecran d'erreur si le lien est invalide ou si le chargement echoue
- [x] la page gere un demarrage explicite du quiz
- [x] la navigation est pilotee question par question avec validation locale de la reponse courante
- [x] les reponses sont sauvegardees via `ApplicationService.saveQuizAnswer()` -> `POST /applications/save-quiz-answer`
- [x] la fin de quiz passe par `ApplicationService.completeQuiz()` -> `POST /applications/complete-quiz`
- [x] un ping d'activite `touchQuiz()` est maintenu pour les quiz chronometres ou surveilles
- [ ] le contrat actuel suppose encore un quiz unique global par candidature, alors que la cible multi-occurrences demandera une tentative de quiz explicite par round

## 4. Blocs UI Constates

### 4.1 Etats globaux

- [x] chargement initial
- [x] message d'erreur sur lien invalide ou quiz introuvable
- [x] ecran de demarrage
- [x] ecran de completion

### 4.2 Zone de quiz

- [x] titre campagne / quiz
- [x] progression courante
- [x] timer si le quiz est chronometre
- [x] question courante
- [x] reponses simples ou multiples
- [x] reponse libre si necessaire
- [x] commentaires additionnels sur certaines reponses
- [x] navigation precedent / suivant
- [x] action de soumission finale

## 5. Donnees Affichees

- `applicationId`
- `quizToken`
- `campaignId`
- `campaignTitle`
- `quizStatus`
- `isTimed`
- `totalTimeAllowed`
- `timeElapsed`
- `remainingTime`
- `questions[]`
- `question.id`
- `question.questionContent`
- `question.questionType`
- `answers[]`
- `answer.id`
- `answer.answerContent`
- `allowAdditionalComment`
- `additionalCommentRequired`

## 6. Services Et Endpoints

- chargement via `ApplicationService.getQuiz()` -> `POST /applications/get-quiz`
- sauvegarde de reponse via `ApplicationService.saveQuizAnswer()` -> `POST /applications/save-quiz-answer`
- completion via `ApplicationService.completeQuiz()` -> `POST /applications/complete-quiz`
- ping d'activite via `ApplicationService.touchQuiz()` -> `POST /applications/touch-quiz`

## 7. Ce Que Le Backend Doit Envoyer

- un quiz resolu par token securise, sans exposition d'autres candidatures
- un `quizToken` qui identifie une tentative `application_quiz_attempt` unique rattachee au bon `application_progress`, et non un quiz global porte par `applications`
- si le candidat arrive depuis `/suivre-candidature` ou depuis un email, une action deja resolue sur cette tentative explicite, sans re-deduction cote front a partir d'un singleton par candidature
- un payload coherent pour questions, reponses, timing et statut du quiz
- une validation forte du token cote serveur
- une sauvegarde idempotente et incrementalement robuste des reponses candidat
- une cloture fiable du quiz, y compris quand un timer force la soumission

## 8. Entites Metier Impliquees

- `application`
- `application_progress`
- `application_quiz_attempt`
- `candidate_answer`
- questionnaire / reponses publiees
- token de quiz public

## 9. Questions Ou Ecarts A Qualifier

- [x] la cible multi-occurrences doit faire porter le lien public sur une tentative `application_quiz_attempt` explicite; le couple `(applicationId, quizToken)` peut etre conserve si `quizToken` identifie deja cette tentative et si `applicationId` reste un garde de coherence
- [ ] faut-il exposer au candidat le libelle du round quiz en plus du titre de campagne
- [ ] quelle politique appliquer si plusieurs liens de quiz existent pour une meme candidature et qu'un ancien lien est encore ouvert
- [ ] `ApplicationService` envoie encore `user: 1` sur ces appels publics; verifier si ce contrat doit etre nettoye cote backend/front

## 10. Recette Manuelle

1. Ouvrir un lien `/quiz/:applicationId/:quizToken` valide.
2. Verifier le chargement du quiz et du timer si la campagne est chronometree.
3. Repondre a plusieurs questions, dont une reponse libre si disponible.
4. Recharger la page et verifier la restauration de l'etat sauvegarde si le backend la supporte.
5. Finaliser le quiz puis verifier le message de completion et la mise a jour du statut.

## 11. Impact Cible Multi-Occurrences

- [x] faire de cette fiche la reference publique de la tentative `application_quiz_attempt`
- [x] documenter un token de quiz rattache a un round precis, et non a un quiz global unique par candidature
- [x] permettre des comportements differents selon le round: screening automatique optionnel, timing optionnel, formulaire cible distinct
- [x] aligner les retours publics du quiz avec la chronologie `application_progress` et le suivi candidat
- [x] clarifier la politique de coexistence ou d'invalidation des anciens liens de quiz lorsqu'une meme candidature porte plusieurs tentatives ou plusieurs rounds
- [x] exiger que les flux publics amont qui redirigent vers le quiz transmettent le token de tentative explicite deja resolu
