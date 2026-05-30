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
- [x] Retirer le libellé purement technique `Ordre géré automatiquement`, qui n’apporte pas de valeur utilisateur maintenant que l’ordre se pilote déjà par actions dédiées.
- [x] Le sélecteur de spécialité de la modale question doit afficher les spécialités par ordre alphabétique et proposer une recherche texte.
- [x] Le référentiel `difficultyLevel` doit évoluer vers 6 niveaux métier avec description discrète, badge `difficulty--*` dédié et score par défaut associé.
- [x] La question doit porter un booléen `correction manuelle requise`; dans ce cas, aucun point n’est attribué automatiquement et la correction finale doit être saisie manuellement dans l’intervalle fermé `[0 ; score]`.
- [x] La question doit porter un booléen `justification obligatoire pour toutes les réponses`, disponible uniquement pour `SINGLE_CHOICE`, `MULTIPLE_CHOICE` et `TRUE_FALSE`.
- [x] Les questions `TEXT` doivent porter un champ de placeholder pour la réponse libre, stocké sur la table `question` et demandé uniquement quand `questionType = TEXT`.
- [ ] Le support des réponses de format `IMAGE` et `CODE` est identifié, mais explicitement repoussé hors du lot courant.
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
- [x] badge ou indicateur `correction manuelle` quand la question ne peut pas être notée automatiquement
- [x] actions `modifier`, `supprimer`

### 4.4 Réponses inline

- [x] section pliante par question
- [x] compteur de réponses
- [x] ajout de réponse depuis la question courante
- [x] affichage correcte / incorrecte
- [x] visibilité du format de réponse et de la configuration de commentaire additionnel
- [x] édition et suppression de réponse inline
- [x] réordonnancement des réponses sans saisie manuelle de `answerOrder`, via actions `monter` / `descendre` ou drag and drop
- [x] regroupement plus guidé des champs de réponse pour réduire la charge visuelle pendant la création / édition
- [x] affichage d’un placeholder de réponse libre configuré par la question quand `questionType = TEXT`
- [x] bascule `Justification obligatoire pour toutes les réponses` disponible au niveau de la question pour `SINGLE_CHOICE`, `MULTIPLE_CHOICE` et `TRUE_FALSE`, avec propagation automatique vers toutes les réponses
- [x] quand on désactive `Justification obligatoire pour toutes les réponses`, une confirmation demande si l’on veut aussi désactiver l’autorisation des commentaires additionnels sur toutes les réponses
- [x] suppression du texte d’aide `Ordre géré automatiquement`
- [x] suppression du texte redondant `La justification est imposée au niveau de la question.` au niveau de chaque réponse
- [x] second bouton `Ajouter une réponse` en bas de la section embarquée pour éviter un retour forcé en haut de la modale

### 4.5 Modales

- [x] création / édition question avec réponses embarquées
- [x] suppression question
- [x] création / édition réponse liée
- [x] suppression réponse liée
- [x] densification et réorganisation de la modale question pour éviter l'effet de formulaire trop massif
- [x] préremplissage automatique de `score` et `questionChrono` selon `difficultyLevel`, avec surcharge manuelle toujours possible
- [x] sélecteur de spécialité trié alphabétiquement avec recherche texte intégrée
- [x] 6 niveaux de difficulté avec description discrète, badge `difficulty--facile|moyen-bas|moyen|difficile|tres-difficile|expert` et scores par défaut `1 / 3 / 5 / 7 / 10 / 15`
- [x] booléen `Correction manuelle requise` sur la question, désactivant la notation automatique
- [x] champ `Placeholder de la réponse libre` visible et requis uniquement pour `TEXT`, absent pour les autres types
- [x] aides `form-help form-help--compact` de `Correction manuelle requise` et `Justification obligatoire pour toutes les réponses` accentuées visuellement en teintes `success` quand elles sont actives
- [x] la carte de preset de difficulté embarque désormais aussi la description métier et applique un code couleur distinct par niveau

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
- `manualCorrectionRequired`
- `allAnswersJustificationRequired`
- `freeTextResponsePlaceholder`
- `createdAt`

### 5.1.1 Référentiel de difficulté attendu

- `Facile`: badge `difficulty--facile`, description discrète `Mémoriser: rappeler des faits, des définitions ou des données brutes.`, score par défaut `1`
- `Moyen-Bas`: badge `difficulty--moyen-bas`, description discrète `Comprendre: saisir le sens d'une information ou l'expliquer avec ses propres mots.`, score par défaut `3`
- `Moyen`: badge `difficulty--moyen`, description discrète `Appliquer: utiliser des règles, des formules ou des concepts dans une situation concrète.`, score par défaut `5`
- `Difficile`: badge `difficulty--difficile`, description discrète `Analyser: décomposer une information pour identifier les causes, les motifs ou les liens logiques.`, score par défaut `7`
- `Très Difficile`: badge `difficulty--tres-difficile`, description discrète `Évaluer: porter un jugement critique, valider une méthode ou justifier une décision.`, score par défaut `10`
- `Expert`: badge `difficulty--expert`, description discrète `Créer: combiner plusieurs éléments pour concevoir un projet, un plan ou une solution nouvelle.`, score par défaut `15`

### 5.2 Reponses associees

- `id`
- `answerText`
- `answerType`
- `allowAdditionalComment`
- `additionalCommentRequired`
- `additionalCommentPlaceholder`
- `answerOrder` (piloté automatiquement au niveau de la question, non saisi manuellement par l’utilisateur sur les pages métier)
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
- Des valeurs contrôlées pour `questionType` et `difficultyLevel`, y compris la nouvelle grille métier à 6 niveaux.
- Un chargement borné aux questions et réponses actives (`isDeleted = false`) sur cette page métier; les supprimées et la restauration relèvent des pages `/dashboard/entities/*`.
- Des spécialisations valides pour enrichir ou filtrer la banque de questions, avec un libellé stable permettant tri alphabétique et recherche texte dans le sélecteur.
- Un booléen question `correction manuelle requise` permettant de désactiver la notation automatique et d’autoriser une note finale comprise dans `[0 ; score]`.
- Un champ question `freeTextResponsePlaceholder` pour guider la saisie des réponses libres, présent et pertinent uniquement quand `questionType = TEXT`.
- Un indicateur de candidature post-quiz `correction manuelle requise` quand au moins une question soumise attend encore une correction recruteur.

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
- [x] Ajouter au contrat question un champ `freeTextResponsePlaceholder` utilisé exclusivement pour `TEXT`, avec UI de saisie côté dashboard et affichage côté passage de quiz; le nom retenu est `freeTextResponsePlaceholder`.
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
- [x] Le sous-flux de réponses n'impose plus la saisie manuelle de `answerOrder`: la modale question pilote désormais l'ordre avec des actions `Monter` / `Descendre`, retire les trous d'indexation après suppression et resynchronise automatiquement les positions avant sauvegarde.
- [x] Le choix de `difficultyLevel` propose désormais une aide à la saisie `score + chrono` avec table de correspondance locale, sans écraser les valeurs que l'utilisateur modifie volontairement, et avec action explicite pour réappliquer la suggestion.
- [x] Définir la table de correspondance métier `difficultyLevel -> score par défaut` et `difficultyLevel -> questionChrono par défaut`, puis l'appliquer comme aide à la saisie sans bloquer l'override manuel.
- [x] Aligner le contrat backend/front pour la nouvelle grille à 6 niveaux `Facile / Moyen-Bas / Moyen / Difficile / Très Difficile / Expert`, ses badges `difficulty--*` et les scores par défaut `1 / 3 / 5 / 7 / 10 / 15`; le lot courant étend aussi la suggestion `questionChrono` avec une progression `30 / 45 / 60 / 90 / 120 / 150`.
- [x] Aligner le contrat backend/front pour exposer un flag question `correction manuelle requise` et un indicateur candidature post-quiz `correction manuelle requise`, sans perdre un éventuel statut métier plus fin si le backend porte déjà `NOT_REQUIRED / PENDING / COMPLETED`.
- [x] Ajouter le mode `Justification obligatoire pour toutes les réponses` pour `SINGLE_CHOICE / MULTIPLE_CHOICE / TRUE_FALSE`, avec propagation automatique de `allowAdditionalComment = true`, `additionalCommentRequired = true` et `additionalCommentPlaceholder = "Justifiez votre réponse"` sur toutes les réponses de la question.
- [x] Ajouter le champ question `freeTextResponsePlaceholder`, le rendre obligatoire pour `TEXT`, le masquer pour les autres types et vérifier qu’il n’est pas dupliqué au niveau `answer`.
- [x] Retirer du flux question tout texte d’aide redondant de type `Ordre géré automatiquement` dès lors que les actions de réordonnancement suffisent à rendre le comportement compréhensible.
- [ ] Le support des réponses `IMAGE` et `CODE` est identifié mais explicitement reporté hors du lot courant.
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
9. Vérifier que le choix d'un niveau de difficulté peut préremplir automatiquement score et chrono tout en laissant ces deux champs éditables.
10. Vérifier que l'ordre des réponses peut se piloter sans saisie manuelle de `answerOrder`.
11. Vérifier que le texte `Ordre géré automatiquement` n’apparaît plus dans le flux question.
12. Vérifier que le sélecteur de spécialité est trié alphabétiquement et permet une recherche texte.
13. Vérifier les 6 niveaux de difficulté, leur description discrète, leur badge `difficulty--*` et leurs scores par défaut `1 / 3 / 5 / 7 / 10 / 15`.
14. Cocher `Correction manuelle requise`, répondre au quiz puis vérifier qu’aucun score n’est attribué automatiquement sur cette question et qu’une correction recruteur bornée à `[0 ; score]` devient nécessaire.
15. Cocher `Justification obligatoire pour toutes les réponses` sur une question `SINGLE_CHOICE`, `MULTIPLE_CHOICE` puis `TRUE_FALSE`, et vérifier la propagation automatique de `allowAdditionalComment`, `additionalCommentRequired` et du placeholder `Justifiez votre réponse` sur toutes les réponses.
16. Décocher `Justification obligatoire pour toutes les réponses`, vérifier que la popup propose bien de désactiver aussi les commentaires additionnels de toutes les réponses, puis tester les deux choix `oui / non`.
17. Vérifier qu’un second bouton `Ajouter une réponse` reste disponible en bas de la section embarquée après avoir rempli plusieurs réponses.
18. Vérifier que les aides de `Correction manuelle requise` et `Justification obligatoire pour toutes les réponses` passent visuellement en teintes vertes quand elles sont actives, et que la carte de preset de difficulté change de couleur selon le niveau choisi.
19. Créer une question `TEXT`, renseigner un `Placeholder de la réponse libre`, puis vérifier que ce placeholder est demandé seulement pour `TEXT`, prérempli en édition et affiché côté réponse libre candidat.