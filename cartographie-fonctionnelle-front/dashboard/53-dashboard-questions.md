# Dashboard Questions

## 1. Identite

- Route: `/dashboard/questions`
- Guard: aucun guard dédié sur la route enfant; accès hérité du shell `dashboard` via `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/questions/questions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/questions/questions.html`

## 2. Objectif Produit

La page sert à gérer la banque de questions de quiz et, fait important, embarque aussi une gestion inline des réponses associées à chaque question.

## 3. Etat Constate

- [x] La route ne porte pas de `permissionGuard` spécifique.
- [x] Le CRUD visible repose toutefois sur `adminMode` côté front.
- [x] La page charge à la fois les questions, les réponses et les spécialités.
- [x] Elle propose des filtres sur statut, difficulté et type de question.
- [x] Les réponses sont visibles en sous-liste pliable pour chaque question.
- [x] Le front permet de créer, modifier, supprimer et restaurer des réponses directement depuis la page questions.
- [x] Une pagination front locale de 10 questions par page est appliquée après chargement massif.
- [ ] Vérifier si l’absence de guard dédié est un choix ou une faille d’accès lecture.
- [ ] Vérifier si le chargement `questions + answers` en volume reste tenable à grande échelle.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Questions`
- [x] compteurs total / actives
- [x] bouton `Actualiser`
- [x] bouton `Nouvelle question` si admin mode

### 4.2 Filtres

- [x] recherche texte
- [x] filtres `Tous`, `Actives`, `Supprimées`
- [x] filtre difficulté
- [x] filtre type

### 4.3 Liste des questions

- [x] cartes avec `questionRef` si disponible
- [x] badges type et difficulté
- [x] texte de question
- [x] métadonnées score, chrono, spécialité, date
- [x] actions `modifier`, `supprimer`, `restaurer`

### 4.4 Réponses inline

- [x] section pliante par question
- [x] compteur de réponses
- [x] ajout de réponse depuis la question courante
- [x] affichage correcte / incorrecte
- [x] édition, suppression, restauration de réponse inline

### 4.5 Modales

- [x] création / édition question
- [x] suppression question
- [x] création / édition réponse liée
- [x] suppression réponse liée

## 5. Donnees Affichees Ou Editees

### 5.1 Questions

- `id`
- `questionRef`
- `questionText`
- `questionType`
- `difficultyLevel`
- `score`
- `questionChrono`
- `specialityId`
- `isDeleted`
- `createdAt`

### 5.2 Reponses associees

- `id`
- `answerText`
- `answerType`
- `answerOrder`
- `isCorrect`
- `questionId`
- `isDeleted`

### 5.3 Référentiel

- `Speciality[]`

## 6. Services Et Endpoints

- `QuestionService.getAllByCriteria()` -> `/question/getAllByCriteria`
- `QuestionService.create()` -> `/question/create`
- `QuestionService.update()` -> `/question/update`
- `QuestionService.delete()` -> `/question/delete`
- `QuestionService.restore()` -> `/question/restore`
- `AnswerService.getAllByCriteria()` -> `/answer/getAllByCriteria`
- `AnswerService.create()` -> `/answer/create`
- `AnswerService.update()` -> `/answer/update`
- `AnswerService.delete()` -> `/answer/delete`
- `AnswerService.restore()` -> `/answer/restore`
- `SpecialityService.getAll()` -> chargement des spécialités de rattachement

## 7. Ce Que Le Backend Doit Envoyer

- Des questions et réponses cohérentes entre elles, avec `questionId` fiable.
- Des valeurs contrôlées pour `questionType` et `difficultyLevel`.
- Une soft-delete exploitable pour questions et réponses.
- Des spécialisations valides pour enrichir ou filtrer la banque de questions.

## 8. Entites Metier Impliquees

- `question`
- `answer`
- `speciality`
- référentiel quiz

## 9. Questions Ou Ecarts A Qualifier

- [ ] L’accès lecture devrait-il être protégé par une permission dédiée ?
- [ ] Les réponses inline doivent-elles rester éditables ici si une page `answers` existe déjà ?
- [ ] Faut-il imposer côté backend des règles par type de question, par exemple nombre minimum de réponses correctes ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/questions`.
2. Filtrer par difficulté et type.
3. Créer une question avec score, chrono et spécialité.
4. Ajouter plusieurs réponses depuis la section inline.
5. Modifier puis supprimer une réponse, la restaurer si nécessaire.
6. Vérifier la pagination et la cohérence avec la page transverse `/dashboard/answers`.