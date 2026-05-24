# Entities Questions

## 1. Identite

- Routes: `/dashboard/entities/questions` et `/dashboard/entities/questions/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/questions/entities-questions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/questions/entities-questions.html`

## 2. Objectif Produit

La page administre la banque de questions et embarque un sous-CRUD de reponses directement au niveau de chaque ligne de question.

## 3. Etat Constate

- [x] La page n'etend pas `EntityCrudBase`; elle reimplemente son propre CRUD, detail panel, pagination et expansions.
- [x] Les filtres avances couvrent texte, type, difficulte, score, chrono, specialite, suppression et dates.
- [x] Le tableau liste les questions avec specialite, chrono, type, score et difficulte.
- [x] Chaque question peut etre expandee pour charger ses reponses via `AnswerService`.
- [x] Les reponses enfants supportent create / edit / delete / restore depuis la meme page.
- [x] Les compteurs `actifs` et `supprimes` sont recalcules cote front.
- [x] La page sauvegarde sa pagination uniquement en localStorage.
- [x] Les principaux labels et handlers visibles issus d'un copier-coller ont ete recables: ouverture de creation question, messages question/reponse, et titres de modales reponses.
- [x] Les modales question exposent maintenant `questionText`, `specialityId`, `questionType`, `difficultyLevel`, `score` et `questionChrono`, en coherence avec la liste et les filtres.
- [x] Les modales create/edit de reponse ont ete recablees sur les bons champs `answerText`, `answerOrder` et `isCorrect`, avec libelles question/reponse coherents.

## 4. Blocs UI Constates

### 4.1 Header et filtres

- [x] recherche rapide
- [x] checkbox `Afficher les questions supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau question`

### 4.2 Filtres avances

- [x] plage ID
- [x] texte de question
- [x] type de question
- [x] niveau de difficulte
- [x] score
- [x] chrono
- [x] specialite
- [x] `isDeleted`
- [x] dates creation / modification

### 4.3 Tableau principal

- [x] colonnes `id`, `question`, `speciality`, `chrono`, `type`, `score`, `difficulty`
- [x] manager de visibilite de colonnes
- [x] actions edit / delete / restore
- [x] bouton d'expansion par question

### 4.4 Sous-CRUD reponses

- [x] chargement des reponses par `questionId`
- [x] affichage `answerText`, `answerOrder`, `isCorrect`
- [x] create / edit / delete / restore d'une reponse depuis l'expansion

### 4.5 Modales

- [x] confirmation suppression / restauration question
- [x] creation / edition question avec type, difficulte, score, specialite et chrono
- [x] creation / edition / suppression / restauration reponse avec champs et libelles coherents

## 5. Donnees Affichees Ou Editees

- `questionText`
- `specialityId`
- `questionChrono`
- `questionType`
- `score`
- `difficultyLevel`
- `isDeleted`
- reponses enfants: `answerText`, `answerOrder`, `isCorrect`, `questionId`

## 6. Services Et Endpoints

- liste des questions via `QuestionService.getAllQuestionsByCriteria()` -> `POST /question/getAllByCriteria`
- creation question via `QuestionService.createQuestion()` -> `POST /question/create`
- edition question via `QuestionService.updateQuestion()` -> `POST /question/update`
- suppression question via `QuestionService.deleteQuestion()` -> `POST /question/delete`
- restauration question via `QuestionService.restoreQuestion()` -> `POST /question/update`
- chargement des reponses via `AnswerService.getQuestionAnswersByCriteria()` -> `POST /answer/getAllByCriteria`
- creation reponse via `AnswerService.createAnswer()` -> `POST /answer/create`
- edition reponse via `AnswerService.updateAnswer()` -> `POST /answer/update`
- suppression reponse via `AnswerService.deleteAnswer()` -> `POST /answer/delete`
- restauration reponse via `AnswerService.restoreAnswer()` -> `POST /answer/update`
- chargement FK specialites via `SpecialityService`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste paginee de questions avec `items` et `totalCount` ou `count`.
- Des questions enrichies avec `questionType`, `score`, `difficultyLevel` et `specialityId` de facon stable.
- Des reponses enfant normalisees par `questionId`, avec `isCorrect` et `answerOrder`.
- Une resolution FK specialites coherente, car le template alterne entre `specialityName`, `s.nom` et l'affichage brut de l'ID.
- Un contrat clair sur les champs vraiment modifiables d'une question, aujourd'hui plus large dans les filtres que dans les modales.

## 8. Entites Metier Impliquees

- `question`
- `answer`
- `speciality`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le formulaire question doit-il exposer `type`, `score` et `difficulte`, ou la liste/filter est-elle trop ambitieuse ?
- [ ] Le sous-CRUD reponses est-il partiellement corrompu suite a un copier-coller d'une autre page ?
- [ ] Faut-il afficher le nom de specialite partout au lieu de l'ID brut ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/questions`.
2. Filtrer par type, difficulte et specialite.
3. Creer puis editer une question.
4. Ouvrir l'expansion d'une question et verifier ses reponses.
5. Ajouter, modifier, supprimer puis restaurer une reponse.
6. Verifier la presence des champs `type`, `difficulte`, `score`, `ordre` et `reponse correcte` dans les modales corrigees.
