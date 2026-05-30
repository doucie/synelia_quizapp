# Dashboard Candidate Detail

## 1. Identite

- Route cible: `/dashboard/candidates/:id`
- Guard cible: `permissionGuard(['VIEW_APPLICATIONS'])`
- Statut: page a creer; la route n'est pas montee aujourd'hui dans `app.routes.ts`
- Source fonctionnelle actuelle: le detail candidat reste pilote depuis `quizapp_front/src/app/pages/dashboard/applications/applications.ts`
- Source template actuelle: le rendu detail/focus reste embarque dans `quizapp_front/src/app/pages/dashboard/applications/applications.html`
- Particularite: la page doit etre deep-linkable, ne jamais etre une popup et permettre un retour propre vers la liste filtree `/dashboard/candidates`

## 2. Objectif Produit

La page doit devenir le cockpit unique de gestion d'une candidature: lecture du profil candidat, comprehension immediate de la position dans le pipeline, et declenchement des actions metier autorisees sans surcharger la liste.

## 3. Etat Constate

- [x] La route `/dashboard/candidates/:id` n'est pas montee aujourd'hui; seule la liste `/dashboard/candidates` existe.
- [x] L'action `Voir les details` de la liste navigue encore vers `/dashboard/candidates#application-<id>`.
- [x] La liste charge deja les briques dont la future page a besoin: candidature, campagnes, source tokens, `PipelineStage` et `ApplicationProgress`.
- [x] Le focus actuel repose sur `focusedApplicationId`, le scroll vers la carte et un rendu embarque dans la liste.
- [x] Certaines actions pipeline existent deja inline sur la carte: validation, refus, skip, planification d'entretien.
- [x] Cote backend, `application_progress` snapshotte deja toutes les etapes du pipeline a la creation de la candidature; la future politique de versionning peut donc s'appuyer sur cet historique par candidat.
- [ ] Extraire ces capacites dans une page dediee et alleger la carte liste en consequence.
- [ ] Definir le contrat de retour vers la liste: filtres, campagne verrouillee, recherche et tri a restaurer.
- [ ] Clarifier quelles actions restent sur la liste et lesquelles basculent exclusivement dans le detail.
- [ ] Definir quand proposer une action `Mettre a jour le pipeline du candidat` si certaines etapes de sa progression pointent vers des revisions inactives.

## 4. Blocs UI Cibles

### 4.1 Header

- [ ] bouton retour vers `/dashboard/candidates`
- [ ] identite candidat + email + telephone
- [ ] rappel campagne / source / ID candidature
- [ ] statut global de la candidature

### 4.2 Synthese pipeline

- [ ] frise complete des etapes avec statuts `PENDING / IN_PROGRESS / PASSED / FAILED / SKIPPED`
- [ ] mise en avant de l'etape courante
- [ ] blocages eventuels: email requis, correction manuelle, dependance etape precedente
- [ ] historique utile: debut, fin, decideur, score, notes

### 4.3 Actions contextuelles

- [ ] `valider l'etape`
- [ ] `refuser l'etape`
- [ ] `sauter l'etape` si autorise
- [ ] `planifier un entretien`
- [ ] `ouvrir l'evaluation`
- [ ] `ouvrir la decision`
- [ ] `declencher / constater l'envoi d'email requis`
- [ ] `mettre a jour le pipeline du candidat` si la progression actuelle reference des revisions de stage devenues inactives

### 4.4 Donnees complementaires

- [ ] apercu CV et ouverture dans un nouvel onglet
- [ ] statuts email / quiz / entretien / evaluation
- [ ] informations utiles de campagne et source
- [ ] liens vers les ecrans metier existants pre-remplis

## 5. Donnees Affichees

### 5.1 Candidature

- `id`
- `candidateFirstName`
- `candidateLastName`
- `candidateEmail`
- `candidatePhone`
- `candidateCvPath`
- `applicationStatus`
- `emailVerified`
- `quizStatus`
- `quizScorePercent`
- `evaluationScore`
- `campaignId`
- `campaignTitle`
- `sourceTokenId`
- `sourceTokenLabel`

### 5.2 Progression pipeline

- `PipelineStage[]`
- `ApplicationProgress[]`
- `currentStageId`
- `currentStageType`
- `currentStageLabel`
- `progressStatus`
- `score`
- `notes`
- `startedAt`
- `completedAt`
- `decidedBy`
- `pipelineStage.isActive` ou indicateur equivalent cote detail
- `stageLocked` ou indicateur equivalent si l'etape historique ne doit plus etre reecrite

### 5.3 Capacites d'action

- `canAdvanceCurrentStage`
- `canRejectCurrentStage`
- `canSkipCurrentStage`
- `canScheduleInterview`
- `nextAllowedActions[]`
- contexte de retour liste: filtres / campagne / tri / recherche

## 6. Services Et Endpoints

### 6.1 Chargement principal

- `ApplicationService.getApplicationsByCriteria()` -> `POST /applications/getByCriteria`
- `PipelineStageService.getAllByCriteria()` ou `getByTemplate()` selon la strategie retenue
- `ApplicationProgressService.getAllByCriteria()` -> `POST /applicationProgress/getAllByCriteria`

### 6.2 Actions pipeline

- `ApplicationProgressService.advance()` -> validation etape courante
- `ApplicationProgressService.fail()` -> refus etape courante
- `ApplicationProgressService.skip()` -> saut etape courante si autorise
- redirections metier existantes vers entretien, evaluation, decision et quiz/test

## 7. Ce Que Le Backend Doit Envoyer

- Une candidature chargeable par ID avec les enrichissements campagne/source necessaires a l'ecran detail.
- Les progressions pipeline completes de cette candidature, ordonnees et coherentes avec les etapes du template.
- Les progressions pipeline completes de cette candidature, ordonnees et coherentes avec les etapes du template, y compris lorsque certaines revisions de stage ne sont plus actives dans le pipeline courant.
- Les contraintes reelles de mutation: etape courante, blocages, permissions, possibilite de skip, email requis, correction manuelle.
- Un comportement stable si l'URL est ouverte directement sans passer par la liste.
- Idealement un indicateur plus riche que les heuristiques front pour les quick actions autorisees.
- Une information claire quand la candidature suit un pipeline historique qui diverge de la version active du template.

## 8. Entites Metier Impliquees

- `application`
- `campaign`
- `sourceToken`
- `pipelineStage`
- `applicationProgress`
- `interview`
- `evaluation`
- `decision`
- permissions / acces campagne

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il un endpoint detail dedie agregateur plutot que plusieurs chargements front paralleles ?
- [ ] Quels filtres et quel contexte de retour doivent etre preserves quand on revient a la liste ?
- [ ] Quelles actions doivent rester inline sur la liste pour les traitements de masse, et lesquelles doivent basculer dans cette page detail ?
- [ ] Le CV reste-t-il dans un apercu embarque ou bascule-t-il vers un panneau / onglet dedie ?
- [ ] Les pages `interview-create`, `decision` et `evaluation` doivent-elles accepter un pre-remplissage standardise depuis ce detail ?
- [ ] Quelle est la politique de migration d'un candidat vers la version active du pipeline: uniquement les etapes futures `PENDING`, jamais l'etape courante, ou autre regle ?
- [ ] Faut-il interdire toute migration automatique si l'etape courante du candidat appartient deja a une revision inactive ?

## 10. Recette Manuelle

1. Ouvrir directement `/dashboard/candidates/:id` avec une candidature existante.
2. Verifier le chargement du candidat, de la campagne, de la source et de la progression pipeline.
3. Verifier l'action retour vers la liste avec restauration du contexte attendu.
4. Tester les actions rapides autorisees sur l'etape courante.
5. Ouvrir un CV, un entretien, une evaluation ou une decision depuis la page.
6. Verifier le comportement sur une candidature inexistante ou inaccessible.

## 11. Backlog Produit Ouvert

- [ ] Monter la route `/dashboard/candidates/:id` et extraire le focus actuel hors de la liste.
- [ ] Remplacer `viewApplicationDetails()` qui pointe aujourd'hui vers le fragment `#application-<id>` par une vraie navigation de page.
- [ ] Restaurer proprement les filtres, la campagne verrouillee et le tri lors du retour vers `/dashboard/candidates`.
- [ ] Transferer les actions pipeline detaillees de la carte liste vers cette page quand elles depassent le besoin de traitement rapide.
- [ ] Garder la liste concise: progression compacte et CTA `Voir les details`, sans recreer une popup de cockpit candidat.
- [ ] Afficher un avertissement quand la candidature suit des revisions de stage inactives par rapport a la version active du template.
- [ ] Ajouter une action recruteur `Mettre a jour le pipeline du candidat` avec une politique explicite: ne jamais reecrire l'historique passe, ne remapper que les etapes futures `PENDING` quand le mapping est non ambigu.
- [ ] Definir le cas bloquant ou l'etape courante du candidat est deja historique/inactive: aucune migration automatique, decision manuelle requise.

## 12. Impact Cible Multi-Occurrences

- [ ] faire de cette page la lecture de reference de la chronologie `application_progress`, et non du seul `applicationStatus`
- [ ] afficher plusieurs tentatives de quiz, plusieurs rounds de preselection et plusieurs entretiens sur une meme candidature
- [ ] rattacher chaque action detaillee a une occurrence precise de round (`application_progress_id`)
- [ ] retirer les resumes mono-valeur de score et d'entretien comme source principale d'explication du parcours
- [ ] afficher les scores globaux `aggregatedQuizScore*` et `aggregatedEvaluationScore*` uniquement dans le header de synthese, comme resumes derives de la chronologie
- [ ] exposer l'abandon candidature comme un etat global bloquant, distinct des rounds, avec son round d'origine et la traçabilite associee
- [ ] rendre visibles les reponses candidat aux entretiens (`candidateResponseStatus`, refus, demande d'autre date) au niveau des rounds concernes et non dans un bloc global ambigu
