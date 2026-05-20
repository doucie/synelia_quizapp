# Dashboard Answers

## 1. Identite

- Route: `/dashboard/answers`
- Guard: aucun guard dédié sur la route enfant; accès hérité du shell `dashboard` via `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/answers/answers.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/answers/answers.html`

## 2. Objectif Produit

La page sert à consulter et administrer les réponses de manière transverse, indépendamment de la vue groupée par question.

## 3. Etat Constate

- [x] La route ne porte pas de `permissionGuard` spécifique.
- [x] Le CRUD visible dépend du `adminMode` local.
- [x] La page charge les réponses et les questions pour enrichir l’affichage.
- [x] Elle filtre les réponses par statut, caractère correct et question liée.
- [x] Elle permet création, modification, suppression et restauration.
- [ ] Vérifier si cette page doit vraiment rester accessible en simple mode authentifié sans permission dédiée.
- [ ] Vérifier le recouvrement fonctionnel avec la gestion inline des réponses dans `/dashboard/questions`.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Réponses`
- [x] compteurs total / correctes
- [x] bouton `Actualiser`
- [x] bouton `Nouvelle réponse` si admin mode

### 4.2 Filtres

- [x] recherche texte
- [x] filtres `Tous`, `Actives`, `Supprimées`
- [x] filtre `correcte / incorrecte`
- [x] filtre par question associée

### 4.3 Cartes réponse

- [x] indicateur correcte / incorrecte
- [x] ordre et type
- [x] texte de la réponse
- [x] rappel tronqué de la question liée
- [x] date de création
- [x] actions `modifier`, `supprimer`, `restaurer`

### 4.4 Modales

- [x] création / édition réponse
- [x] suppression

## 5. Donnees Affichees Ou Editees

- `id`
- `answerText`
- `answerType`
- `answerOrder`
- `isCorrect`
- `questionId`
- `isDeleted`
- `createdAt`
- `Question[]` chargé en support pour libellé de rattachement

## 6. Services Et Endpoints

- `AnswerService.getAllByCriteria()` -> `/answer/getAllByCriteria`
- `AnswerService.create()` -> `/answer/create`
- `AnswerService.update()` -> `/answer/update`
- `AnswerService.delete()` -> `/answer/delete`
- `AnswerService.restore()` -> `/answer/restore`
- `QuestionService.getAllByCriteria()` -> `/question/getAllByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Des réponses reliées à une question valide ou explicitement orphelines si ce cas est autorisé.
- Un champ `isCorrect` stable, utilisé à la fois pour filtrer et styliser.
- Une soft-delete exploitable pour distinguer actives et supprimées.
- Un chargement des questions assez léger pour alimenter le filtre et l’affichage du rattachement.

## 8. Entites Metier Impliquees

- `answer`
- `question`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Cette page doit-elle rester séparée si la majorité des besoins sont couverts depuis `/dashboard/questions` ?
- [ ] Faut-il ajouter des contraintes métier visibles sur le nombre de réponses correctes par question ?
- [ ] L’accès lecture doit-il être resserré avec une permission dédiée ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/answers`.
2. Filtrer par réponses correctes puis par question.
3. Créer une réponse rattachée à une question existante.
4. Modifier son ordre et son statut `correcte`.
5. La supprimer puis la restaurer.
6. Vérifier la cohérence avec la sous-liste de réponses visible dans `/dashboard/questions`.