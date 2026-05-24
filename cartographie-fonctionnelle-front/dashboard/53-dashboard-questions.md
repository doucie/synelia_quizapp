# Dashboard Questions

## 1. Identite

- Route: `/dashboard/questions`
- Guard: `roleGuard` + `permissionGuard(['VIEW_QUESTION'])` sur la route enfant, en plus du shell `dashboard` protégé par `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/questions/questions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/questions/questions.html`

## 2. Objectif Produit

La page sert à gérer la banque de questions de quiz et, fait important, embarque aussi une gestion inline des réponses associées à chaque question.

## 3. Etat Constate

- [x] La route porte désormais un guard dédié aligné sur l’intention du menu: `roleGuard` avec rôles `super/admin` + `permissionGuard(['VIEW_QUESTION'])`.
- [x] Le CRUD visible repose toutefois sur `adminMode` côté front.
- [x] La page charge à la fois les questions, les réponses et les spécialités.
- [x] Elle propose des filtres sur difficulté et type de question.
- [x] Les réponses actives sont visibles en sous-liste pliable pour chaque question.
- [x] Le front permet de créer, modifier et supprimer des réponses directement depuis la page questions.
- [x] La modale `Nouvelle question / Modifier la question` embarque désormais la création et l’édition primaire des réponses associées, avec synchronisation à l’enregistrement de la question.
- [x] Le contrat `questionType` de la page a été réaligné sur les valeurs backend `SINGLE_CHOICE / MULTIPLE_CHOICE / TRUE_FALSE / TEXT`, avec absorption locale des anciennes valeurs `QCM / QCU / OPEN` encore présentes en base ou en payload legacy.
- [x] En tant que page métier `/dashboard/questions`, elle ne charge plus que les questions et réponses actives et n’expose plus ni vision des supprimées ni restauration; ces usages sont réservés à `/dashboard/entities/questions` et `/dashboard/entities/answers`.
- [x] Une pagination front locale de 10 questions par page est appliquée après chargement massif.
- [x] Le décalage d’accès lecture a été corrigé: la route `/dashboard/questions` n’est plus accessible par simple héritage du `authGuard` du shell.
- [ ] Vérifier si le chargement `questions + answers` en volume reste tenable à grande échelle.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Questions`
- [x] compteurs total / actives
- [x] bouton `Actualiser`
- [x] bouton `Nouvelle question` si admin mode

### 4.2 Filtres

- [x] recherche texte
- [x] filtre difficulté
- [x] filtre type

### 4.3 Liste des questions

- [x] cartes avec `questionRef` si disponible
- [x] badges type et difficulté
- [x] texte de question
- [x] métadonnées score, chrono, spécialité, date
- [x] actions `modifier`, `supprimer`

### 4.4 Réponses inline

- [x] section pliante par question
- [x] compteur de réponses
- [x] ajout de réponse depuis la question courante
- [x] affichage correcte / incorrecte
- [x] visibilité du format de réponse et de la configuration de commentaire additionnel
- [x] édition et suppression de réponse inline

### 4.5 Modales

- [x] création / édition question avec réponses embarquées
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
- `createdAt`

### 5.2 Reponses associees

- `id`
- `answerText`
- `answerType`
- `allowAdditionalComment`
- `additionalCommentRequired`
- `additionalCommentPlaceholder`
- `answerOrder`
- `isCorrect`
- `questionId`

### 5.3 Référentiel

- `Speciality[]`

## 6. Services Et Endpoints

- `QuestionService.getAllByCriteria()` -> `/question/getAllByCriteria`
- `QuestionService.create()` -> `/question/create`
- `QuestionService.update()` -> `/question/update`
- `QuestionService.delete()` -> `/question/delete`
- `AnswerService.getAllByCriteria()` -> `/answer/getAllByCriteria`
- `AnswerService.create()` -> `/answer/create`
- `AnswerService.update()` -> `/answer/update`
- `AnswerService.delete()` -> `/answer/delete`
- `SpecialityService.getAll()` -> chargement des spécialités de rattachement

## 7. Ce Que Le Backend Doit Envoyer

- Des questions et réponses cohérentes entre elles, avec `questionId` fiable.
- Des valeurs contrôlées pour `questionType` et `difficultyLevel`.
- Un chargement borné aux questions et réponses actives (`isDeleted = false`) sur cette page métier; les supprimées et la restauration relèvent des pages `/dashboard/entities/*`.
- Des spécialisations valides pour enrichir ou filtrer la banque de questions.

## 8. Entites Metier Impliquees

- `question`
- `answer`
- `speciality`
- référentiel quiz

## 9. Questions Ou Ecarts A Qualifier

- [x] L’accès lecture est désormais protégé côté front par une permission dédiée et un filtre de rôle cohérent avec le menu; le même réalignement a été appliqué à `/dashboard/answers`, `/dashboard/departments` et `/dashboard/specialities`.
- [ ] Les réponses inline doivent-elles rester éditables ici si une page `answers` existe déjà ?
- [ ] Faut-il imposer côté backend des règles par type de question, par exemple nombre minimum de réponses correctes ?
- [x] La règle métier est désormais figée: `/dashboard/questions` ne doit charger que les questions et réponses actives et ne doit jamais exposer de restauration ni de vision des supprimées, même pour un utilisateur `SUPER`; ces usages appartiennent aux pages `/dashboard/entities/questions` et `/dashboard/entities/answers`.
- [x] Le contrat `questionType` de la page a été réaligné sur l’enum backend canonique `SINGLE_CHOICE / MULTIPLE_CHOICE / TRUE_FALSE / TEXT`, et la dépendance front aux valeurs legacy `QCM / QCU / OPEN` a été retirée des filtres, labels et payloads.
- [x] La création primaire des réponses bascule désormais dans la modale `Nouvelle question / Modifier la question`, ce qui permet de créer une question et ses réponses dans un seul flux sans devoir rouvrir une seconde modale après persistance.
- [x] La modale question a été agrandie et son body rendu scrollable, avec une section dédiée aux réponses embarquées, pour absorber proprement les cas multi-réponses et les nouveaux champs du modèle de réponses.
- [x] Le binding Angular de la modale question a été assaini avant d’y embarquer des réponses: le wrapper `<form>` a été supprimé et les contrôles `ngModel` de cette modale ont été passés en `standalone`, ce qui neutralise le risque `NG01352` sur ce flux.
- [x] Les règles UX et métier du sous-formulaire de réponses ont été câblées selon le type backend: `TEXT` sans réponses prédéfinies, `TRUE_FALSE` avec exactement deux réponses `Vrai / Faux` et une correcte, `SINGLE_CHOICE` avec exactement une correcte, `MULTIPLE_CHOICE` avec une ou plusieurs correctes.
- [x] Le sous-formulaire question et les résumés inline exposent désormais le nouveau modèle de réponses: `answerType`, `allowAdditionalComment`, `additionalCommentRequired`, `additionalCommentPlaceholder`, `answerOrder` et `isCorrect`.
- [x] Le flux de sauvegarde transverse `question + réponses` a été mis en place: création ou mise à jour de la question, synchronisation des réponses ajoutées / modifiées / supprimées, puis message d’erreur explicite si la synchronisation des réponses échoue après la sauvegarde de la question.
- [x] Le flux d’édition question précharge désormais la liste des réponses existantes dans la même modale, permet ajout / suppression / réordonnancement, et conserve les champs de commentaire additionnel jusqu’à la resynchronisation finale de la sous-liste inline.
- [ ] Ajouter une recette et des tests ciblés sur `/dashboard/questions` couvrant au minimum un cas `TEXT` sans réponses prédéfinies, un cas `TRUE_FALSE`, un cas `SINGLE_CHOICE` ou `MULTIPLE_CHOICE` avec commentaire additionnel, et la réouverture en édition avec préremplissage complet.
- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [x] La modale de suppression bloque désormais côté front la suppression d’une question qui possède encore des réponses actives et guide explicitement vers la suppression préalable des réponses ou la bascule en `TEXT` pour les purger.
- [ ] Clarifier côté backend si la suppression directe d’une question encore liée à des réponses actives doit être autorisée, ou si la suppression / désactivation préalable des réponses reste obligatoire; en validation runtime locale, la suppression directe a échoué tant que la question portait encore des réponses actives, puis a réussi après bascule en `TEXT` et purge des réponses.
- [x] La création via modale principale n’expose plus de contrôles `ngModel` montés dans un vrai tag `<form>` sans `name` ni configuration `standalone`, ce qui retire le risque Angular `NG01352` sur ce flux.
- [x] Les validations locales obligatoires de la modale question relisent désormais un state signal réellement synchronisé avec la saisie (`questionForm` + brouillon de réponses), ce qui évite de masquer un défaut de binding ou un décalage de contrat backend/front sur ce flux.
- [x] Les valeurs d’origine sont désormais réhydratées dès l’ouverture sur les flux d’édition via modale ou inline: `questionForm`, réponses embarquées et modale inline de réponse se préremplissent depuis le state courant chargé par la page.
- [x] La page `/dashboard/questions` suit désormais les mises à jour réactives de `AuthService.currentUser$` pour `adminMode`; après bascule via le switch du shell dashboard, les CTA dépendants du mode admin, dont `Nouvelle question`, se mettent à jour immédiatement sans rechargement manuel additionnel.
- [x] Une première spec ciblée `quizapp_front/src/app/pages/dashboard/questions/questions.spec.ts` couvre désormais la réactivité à `AuthService.currentUser$`, le blocage des actions admin hors `adminMode` et la resynchronisation des réponses quand le type bascule en `TRUE_FALSE`.
- [ ] Étendre encore la couverture de tests ciblés sur `/dashboard/questions` pour couvrir le cas `TEXT`, un cas multi-réponses avec commentaire additionnel, et la réouverture en édition avec préremplissage complet.

## 10. Recette Manuelle

Validation runtime locale exécutée le 24/05/2026 sur la page avec le compte de test `mdupont`.

Points validés pendant cette exécution:

1. Chargement de `/dashboard/questions` avec 10 questions actives et réponses inline cohérentes.
2. Ouverture de la modale `Nouvelle question` avec spécialité obligatoire, réponses embarquées et nouveaux champs `answerType` / commentaire additionnel visibles.
3. Bascule `TEXT` validée: aucun sous-formulaire de réponses, avec message d’information explicite.
4. Bascule `TRUE_FALSE` validée: exactement deux réponses `Vrai / Faux`, champs texte/ordre verrouillés, correction exclusive annoncée.
5. Création validée d’une question `MULTIPLE_CHOICE` avec deux réponses embarquées, dont une avec commentaire additionnel obligatoire et placeholder.
6. Réouverture en édition validée avec préremplissage complet du texte, de la spécialité, des réponses, du flag `isCorrect`, du commentaire additionnel, du caractère obligatoire et du placeholder.
7. Conversion en `TEXT` validée sur une question existante: les réponses actives ont bien disparu après enregistrement.
8. Suppression validée d’une question `TEXT` sans réponses actives.
9. Validation finale réelle du toggle `Mode Admin` via le shell dashboard: `PUT /user/update-admin-mode` répond désormais `200` sur l’environnement local redémarré, le switch sidebar active puis désactive correctement `adminMode`, et le bouton `Nouvelle question` apparaît/disparaît immédiatement sur `/dashboard/questions` selon l’état du mode admin.

1. Ouvrir `/dashboard/questions`.
2. Filtrer par difficulté et type.
3. Créer une question avec score, chrono, spécialité et réponses directement dans la même modale.
4. Vérifier qu’une question `TEXT` n’expose pas de réponses prédéfinies, puis qu’une question `TRUE_FALSE` force bien deux réponses `Vrai / Faux` avec une seule correcte.
5. Reouvrir la question en édition et vérifier le préremplissage de toutes les réponses, y compris `answerType`, ordre, correction et configuration de commentaire additionnel.
6. Modifier puis supprimer une réponse embarquée, enregistrer, puis vérifier que la sous-liste inline reflète immédiatement le résultat sans possibilité de restauration ici.
7. Vérifier que les suppressions/restaurations restent cantonnées aux pages `/dashboard/entities/questions` et `/dashboard/entities/answers`.
8. Vérifier la pagination et la cohérence avec la page transverse `/dashboard/answers`.