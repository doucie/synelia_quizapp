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
- [x] Elle filtre les réponses par caractère correct et question liée.
- [x] Elle permet création, modification et suppression.
- [x] En tant que page métier `/dashboard/answers`, elle ne charge plus que les réponses actives et n’expose plus ni vision des supprimées ni restauration; ces usages sont réservés à `/dashboard/entities/answers`.
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
- [x] filtre `correcte / incorrecte`
- [x] filtre par question associée

### 4.3 Cartes réponse

- [x] indicateur correcte / incorrecte
- [x] ordre et type
- [x] texte de la réponse
- [x] rappel tronqué de la question liée
- [x] date de création
- [x] actions `modifier`, `supprimer`

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
- `createdAt`
- `Question[]` chargé en support pour libellé de rattachement

## 6. Services Et Endpoints

- `AnswerService.getAllByCriteria()` -> `/answer/getAllByCriteria`
- `AnswerService.create()` -> `/answer/create`
- `AnswerService.update()` -> `/answer/update`
- `AnswerService.delete()` -> `/answer/delete`
- `QuestionService.getAllByCriteria()` -> `/question/getAllByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Des réponses reliées à une question valide ou explicitement orphelines si ce cas est autorisé.
- Un champ `isCorrect` stable, utilisé à la fois pour filtrer et styliser.
- Un chargement borné aux réponses actives (`isDeleted = false`) sur cette page métier; les supprimées relèvent de `/dashboard/entities/answers`.
- Un chargement des questions assez léger pour alimenter le filtre et l’affichage du rattachement.

## 8. Entites Metier Impliquees

- `answer`
- `question`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Cette page doit-elle rester séparée si la majorité des besoins sont couverts depuis `/dashboard/questions` ?
- [ ] Faut-il ajouter des contraintes métier visibles sur le nombre de réponses correctes par question ?
- [ ] L’accès lecture doit-il être resserré avec une permission dédiée ?
- [x] La règle métier est désormais figée: `/dashboard/answers` ne doit charger que les réponses actives et ne doit jamais exposer de restauration ni de vision des supprimées, même pour un utilisateur `SUPER`; ces usages appartiennent à `/dashboard/entities/answers`.
- [x] Le rendu partiel de la modale `Nouvelle réponse` venait surtout d’une erreur Angular `NG01352`: plusieurs contrôles liés avec `ngModel` étaient montés à l’intérieur d’un vrai tag `<form>` sans `name` ni configuration `standalone`, ce qui cassait l’instanciation complète de la popup à l’ouverture. La correction appliquée sur `/dashboard/answers` a consisté à retirer ce wrapper `<form>` inutile, la page pilotant déjà tous les champs via signaux et handlers manuels.
- [x] L’erreur `Le texte de la réponse est obligatoire` était un symptôme du même défaut Angular `NG01352` que le rendu partiel de la popup: tant que la modale montait des contrôles `ngModel` dans un `<form>` invalide, la saisie ne se propageait pas correctement jusqu’au signal `answerForm`, et `saveAnswer()` relisait donc un `answerText` vide. Une fois ce wrapper supprimé, la validation locale ne se déclenche plus à tort. La création restait ensuite bloquée par un second écart distinct de contrat (`answerType` envoyé en `TEXT/CODE/IMAGE` côté front alors que le backend exige `FIXED/FREE`), corrigé en alignant les options et valeurs par défaut du front.
- [x] Après requalification, aucun bug distinct n’a été confirmé sur la modale `Modifier`: le flux d’édition hydrate bien `answerForm` depuis la réponse cliquée avant l’ouverture de la popup, puis le template relit directement ce signal via des `ngModel` standalone. Le faux signal venait très probablement d’une confusion avec le défaut antérieur de la modale partagée `Création / édition` causé par Angular `NG01352`; une fois le wrapper `<form>` invalide supprimé, la modale d’édition se préremplit correctement.
- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Ajouter des tests frontend complets ciblés sur `/dashboard/answers`, couvrant au minimum l’ouverture de la modale de création, l’initialisation immédiate des champs/selects, la création et le préremplissage en édition.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/answers`.
2. Filtrer par réponses correctes puis par question.
3. Créer une réponse rattachée à une question existante.
4. Modifier son ordre et son statut `correcte`.
5. La supprimer puis vérifier qu’elle disparaît de la page métier sans possibilité de restauration ici.
6. Vérifier que la restauration éventuelle reste cantonnée à `/dashboard/entities/answers`.
7. Vérifier la cohérence avec la sous-liste de réponses visible dans `/dashboard/questions`.