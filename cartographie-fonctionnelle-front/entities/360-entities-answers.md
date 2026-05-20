# Entities Answers

## 1. Identite

- Routes: `/dashboard/entities/answers` et `/dashboard/entities/answers/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/answers/entities-answers.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/answers/entities-answers.html`

## 2. Objectif Produit

La page administre les reponses de maniere transverse, hors contexte direct d'une question. Elle reprend les briques CRUD generiques, mais avec plusieurs ecarts entre ce qu'elle affiche, ce qu'elle filtre et ce qu'elle permet reellement d'editer.

Le slice BL-008 la pose maintenant plus explicitement comme surface technique et renvoie vers `/dashboard/answers` comme page metier de reference pour la consultation et l'administration quotidienne.

## 3. Etat Constate

- [x] La page n'etend pas `EntityCrudBase`; elle reimplemente localement le pattern CRUD.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/answers`.
- [x] La liste affiche texte, question, ordre, type, correcte et creation.
- [x] Les filtres avances couvrent texte, ordre, correcte, question, suppression et dates.
- [x] La route charge aussi toutes les questions actives pour alimenter le select de filtre et les modales.
- [x] La page `dashboard/answers` deja documentee reste plus orientee cartes/lecture transverse.
- [ ] Les modales create/edit n'exposent que `answerText`, `questionId` et `answerOrder`.
- [ ] `answerType` et `isCorrect` sont visibles dans le tableau et filtrables, mais pas modifiables depuis cette route.
- [x] Le tableau, les filtres et les modales resolvent desormais le libelle de question a partir du catalogue charge par `QuestionService`.
- [x] Les cles de colonnes sont alignees sur les champs DTO (`answerOrder`, `answerType`, `isCorrect`).
- [ ] `AnswerService.restore()` appelle `POST /answer/update` avec `isDeleted: false` plutot qu'un endpoint `restore` dedie.
- [x] `AnswerService` n'utilise plus de fallback utilisateur fictif: les appels exigent une session auth resolue et echouent explicitement si elle manque.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] sous-texte qui explicite le statut de surface technique
- [x] bouton `Page metier`
- [x] recherche rapide `Rechercher une reponse...`
- [x] checkbox `Afficher les reponses supprimees`
- [x] bouton `Filtres avances`
- [x] bouton `Nouvelle reponse`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `answerText`
- [x] filtre `answerOrder`
- [x] filtre `isCorrect`
- [x] filtre `questionId`
- [x] filtre `isDeleted`
- [x] dates de creation `dateCreation*`
- [x] dates de modification `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `answerText`, `questionId`, `answerOrder`, `answerType`, `isCorrect`, `createdAt`
- [x] rendu du libelle de question a la place du seul `questionId` brut
- [x] actions edit / delete / restore
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation reponse
- [x] edition reponse
- [ ] pas de champ pour `isCorrect`
- [ ] pas de champ pour `answerType`

## 5. Donnees Affichees Ou Editees

- `id`
- `answerText`
- `answerType`
- `answerOrder`
- `isCorrect`
- `questionId`
- `isDeleted`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

## 6. Services Et Endpoints

- liste via `AnswerService.getAllByCriteria()` -> `POST /answer/getAllByCriteria`
- alias legacy `getAllAnswersByCriteria()`
- chargement par question via `getQuestionAnswersByCriteria()`
- creation via `create()` -> `POST /answer/create`
- edition via `update()` -> `POST /answer/update`
- suppression via `delete()` -> `POST /answer/delete`
- restauration via `restore()` -> `POST /answer/update`
- chargement questions support via `QuestionService.getAllByCriteria()` -> `POST /question/getAllByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getAllByCriteria` pagine avec `items` ou `item`, puis compteurs stables.
- Des reponses coherentes sur `answerText`, `answerType`, `answerOrder`, `isCorrect`, `questionId`, `isDeleted`.
- Des questions accessibles pour alimenter le filtre et idealement resoudre les labels plutot que n'afficher qu'un ID brut.
- Une strategie claire de restauration si l'endpoint dedie n'existe pas.
- Une session authentifiee cote front avant tout appel admin sur `AnswerService`, faute de quoi le service echoue explicitement.

## 8. Entites Metier Impliquees

- `answer`
- `question`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il rendre `isCorrect` et `answerType` editables dans cette route ?
- [x] Le texte de la question est maintenant resolu dans la grille et les selects de la page.
- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que `/dashboard/answers` est la page metier de reference.
- [ ] Cette page a-t-elle encore du sens a cote des vues `questions` et `dashboard/answers` ?
- [x] Le fallback utilisateur `'1'` a ete supprime du service au profit d'une precondition d'auth explicite.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/answers` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/answers`.
3. Filtrer par question et par `isCorrect`.
4. Creer une reponse puis verifier son affichage dans la liste.
5. Modifier son texte et son ordre.
6. Supprimer puis restaurer la reponse, puis comparer avec les vues liees aux questions.
