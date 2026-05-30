# Dashboard Evaluate Link

## 1. Identite

- Route montee: `/dashboard/evaluate/:link`
- Guard: `authGuard`
- Shell: page plein ecran hors layout dashboard classique
- Fichier TS: `quizapp_front/src/app/pages/dashboard/evaluations/evaluations.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/evaluations/evaluations.html`

## 2. Objectif Produit

La page sert d'entree principale vers l'evaluation plein ecran a partir du lien court `interviewEvaluationsLink`, utilise depuis les listes d'entretiens, la page d'evaluations et les notifications.

## 3. Etat Constate

- [x] La route ecoute `paramMap` et charge l'entretien via `interviewEvaluationsLink`.
- [x] Le meme composant que `/dashboard/evaluate` est reutilise, mais avec un contrat d'entree different centre sur le lien court.
- [x] Le listing `/dashboard/evaluations` ouvre cette route quand `interview.interviewEvaluationsLink` existe.
- [x] La page `interviews` ouvre aussi cette route pour les entretiens `STARTED` ou `OVER` evaluables.
- [x] Les notifications d'entretien demarre pointent egalement vers cette URL.
- [x] Une fois le lien resolu, le composant recupere l'ID d'entretien puis enchaine exactement le meme flux de chargement que l'entree par `interviewId`.
- [x] Le lien court agit comme cle de resolution applicative, mais la route reste quand meme protegee par authentification.
- [x] Si aucun entretien n'est trouve pour ce lien, la page affiche `Entretien non trouve`.
- [ ] Verifier si ce lien doit rester permanent ou s'il doit expirer / tourner periodiquement.
- [ ] Verifier si l'acces par lien devrait pouvoir fonctionner sans session authentifiee, ou si la protection `authGuard` est le comportement voulu.

## 4. Blocs UI Constates

### 4.1 Surface partagee avec l'entree par ID

- [x] header candidat / entretien
- [x] sidebar evaluateurs et presence
- [x] fil de discussion des evaluations
- [x] formulaire de soumission
- [x] modal de cloture d'entretien

### 4.2 Points specifiques a l'entree par lien

- [x] resolution initiale via `:link`
- [x] message d'erreur explicite si le lien ne correspond a aucun entretien
- [x] usage preferentiel depuis les routes dashboard et les notifications

## 5. Donnees Affichees Ou Editees

- `interviewEvaluationsLink`
- `interview.id`
- `candidateInterviewId`
- `candidateMark`
- `recruiterComment`
- statuts evaluateurs `isOnline`, `hasFinished`
- metriques d'agregat d'entretien et de candidature apres cloture

## 6. Services Et Endpoints

- resolution du lien via `POST /interviews/getByCriteria` avec `data.interviewEvaluationsLink`
- ensuite meme chaine que l'entree par ID:
- `POST /entityPermission/getForEntity`
- `POST /interviewParticipant/getByCriteria`
- `POST /applications/getByCriteria`
- `POST /candidateInterview/getByCriteria`
- `POST /candidateInterview/create`
- `POST /evaluations/getByCriteria`
- `POST /evaluations/create`
- `POST /evaluations/update`
- `POST /evaluations/delete`
- `POST /interviewParticipant/update`
- `POST /interviews/finish`

## 7. Ce Que Le Backend Doit Envoyer

- Un `interviewEvaluationsLink` unique, suffisamment aleatoire et resoluble via `interviews/getByCriteria`.
- Un entretien trouve par lien avec son `id`, afin que le front puisse poursuivre le chargement complet par permissions, participants et candidature.
- Une protection serveur sur la lecture de l'entretien par lien pour eviter qu'un lien connu suffise seul a contourner les droits metier.
- Une politique explicite sur la duree de vie du lien: persistant, regenere au passage `STARTED`, ou rotatif.
- Des notifications / liens ouverts depuis le dashboard toujours alignes avec la valeur courante de `interviewEvaluationsLink`.

## 8. Entites Metier Impliquees

- `interview.interviewEvaluationsLink`
- `interview`
- `interview_participant`
- `evaluation`
- `candidate_interview`
- `notification`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le lien `interviewEvaluationsLink` doit-il expirer, etre revoque ou regenere apres cloture de l'entretien ?
- [ ] `EvaluationService.getInterviewByEvaluationsLink()` envoie encore `user: 1`; verifier si cela contourne ou casse des controles cote backend.
- [ ] Le fait que la route reste sous `authGuard` est-il compatible avec l'idee produit d'un lien direct partage aux evaluateurs ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Depuis `/dashboard/evaluations` ou `/dashboard/interviews`, ouvrir un entretien ayant `interviewEvaluationsLink`.
2. Verifier l'ouverture sur `/dashboard/evaluate/:link` et le chargement complet de la session.
3. Recharger la page directement avec l'URL tokenisee et verifier que le meme entretien est retrouve.
4. Tester un lien invalide et verifier le message `Entretien non trouve`.
5. Cloturer l'entretien puis verifier le retour vers `/dashboard/evaluations`.

## 11. Impact Cible Multi-Occurrences

- [ ] faire resoudre le lien court vers un round d'entretien precis, pas vers une evaluation globale implicite
- [ ] documenter la coexistence de plusieurs evaluateurs et de plusieurs soumissions pour un meme entretien
- [ ] clarifier la politique de regeneration, revocation ou expiration du lien au niveau du round d'entretien
- [ ] aligner cette entree avec la disparition d'une etape pipeline `EVALUATION` autonome
- [ ] recadrer `interviewEvaluationsLink` comme code ou lien de salon partage au niveau `interviews`, et non comme token porte par `candidate_interview`
