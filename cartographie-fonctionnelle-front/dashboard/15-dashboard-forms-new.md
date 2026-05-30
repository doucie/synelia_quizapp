# Dashboard Forms New

## 1. Identite

- Route: `/dashboard/forms/new`
- Guard: `roleGuard` + `permissionGuard(['CREATE_FORM'])` sur la route enfant, en plus du shell `/dashboard` protege par `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/forms/form-editor-page.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/forms/form-editor-page.html`
- Statut: page montee et reliee au workflow de creation dedie

## 2. Objectif Produit

La page doit permettre de creer un formulaire dans un seul flux comprehensible: informations du formulaire, premiere composition de questions, puis creation ou edition des reponses associees, sans demander a l'utilisateur de passer par plusieurs CRUD techniques.

## 3. Etat Constate

- [x] La route est montee; la creation passe maintenant par une vraie page dediee au lieu d'une modale locale sur `/dashboard/forms`.
- [x] La cible fonctionnelle retenue est d'embarquer la composition `formulaire -> questions -> reponses` directement dans le flux de creation, sur le meme principe que `/dashboard/questions` embarque deja ses reponses.
- [x] La page de creation ne doit pas exposer l'entite technique `campaign_form` ni la gestion des rattachements campagne-formulaire.
- [x] L'ajout d'un formulaire a une campagne doit etre fait plus tard depuis `/dashboard/campaigns/new` ou `/dashboard/campaigns/:id/edit`.
- [x] Le formulaire cree doit continuer de demarrer avec une premiere version brouillon, editable, avant toute publication.
- [x] Le front propose maintenant un flux dedie: la premiere sauvegarde cree le formulaire parent puis enchaine sur l'editeur dedie du meme composant pour poursuivre la composition du brouillon.

## 4. Blocs UI Cibles

### 4.1 Header

- [x] bouton retour vers `/dashboard/forms`
- [x] titre `Nouveau formulaire`
- [x] resume du statut initial `Brouillon`

### 4.2 Informations generales du formulaire

- [x] `formName`
- [x] `formDesc`
- [x] `isActive`
- [x] `isTimed`
- [x] affichage du temps maximal theorique du formulaire calcule depuis les chronos des questions, avec un indicateur visuel qui reagit a `isTimed`
- [x] message explicite indiquant que le rattachement a une campagne se fera plus tard depuis la page campagne

### 4.3 Composition des questions

- [x] liste ordonnable des questions de la version brouillon
- [x] ajout d'une question existante depuis une popup de banque de questions
- [x] creation d'une nouvelle question sans quitter la page
- [x] edition d'une question deja ajoutee depuis le meme ecran
- [x] suppression ou retrait d'une question du brouillon courant
- [x] filtre de la banque de questions par specialite pour retrouver plus vite les questions pertinentes
- [x] selection multiple de questions existantes avant ajout au brouillon
- [x] ajout en lot des questions selectionnees, sans imposer un cycle `1 question -> ajouter -> recommencer`
- [x] exclusion automatique des questions deja liees au formulaire dans la popup d'ajout
- [x] cartes de questions liees retravaillees avec un rendu plus premium, plus proche des `question-card` de `/dashboard/questions`

### 4.4 Reponses embarquees par question

- [x] creation ou edition inline des reponses dans le meme flux
- [x] adaptation de l'UI selon `questionType`
- [x] gestion de `isCorrect`, ordre, type de reponse et commentaire additionnel
- [x] modale de creation/edition de question alignee sur celle de `/dashboard/questions` pour la difficulte, la correction manuelle, la justification globale et le placeholder texte libre

### 4.5 Actions de sortie

- [x] `Enregistrer le brouillon`
- [x] `Annuler`
- [x] eventuelle action de publication explicite a clarifier separement du simple enregistrement

## 5. Donnees A Afficher Ou Editer

### 5.1 Formulaire

- `formName`
- `formDesc`
- `isActive`
- `isTimed`

### 5.2 Version brouillon de travail

- `formVersionId`
- `versionNumber`
- `isPublished`
- `isLocked`

### 5.3 Questions et reponses embarquees

- `questionText`
- `questionType`
- `difficultyLevel`
- `specialityId`
- `score`
- `questionChrono`
- `allAnswersJustificationRequired`
- `manualCorrectionRequired`
- `freeTextResponsePlaceholder`
- `answerText`
- `answerType`
- `allowAdditionalComment`
- `additionalCommentRequired`
- `additionalCommentPlaceholder`
- `answerOrder`
- `isCorrect`

## 6. Services Et Endpoints

- `FormService.create()` -> creation du formulaire parent
- `FormVersionService` -> chargement ou pilotage de la version brouillon initiale
- `FormQuestionsService` -> rattachement ordonne des questions a la version brouillon
- `QuestionService` et `AnswerService` -> creation ou edition des questions et reponses embarquees
- Option cible a qualifier: endpoint composite dedie capable de persister la composition complete du formulaire dans un seul workflow metier

## 7. Ce Que Le Backend Doit Envoyer

- Une creation de formulaire qui garantit l'existence d'une premiere version brouillon editable.
- Des regles stables sur la distinction brouillon / publie / verrouille.
- Un support fiable des questions et reponses selon `questionType`.
- Une orchestration assez robuste pour eviter de laisser un formulaire cree sans composition intelligible en cas d'erreur partielle pendant la sauvegarde de la structure.

## 8. Entites Metier Impliquees

- `form`
- `formVersion`
- `formQuestions`
- `question`
- `answer`

## 9. Questions Ou Ecarts A Qualifier

- [x] La page conserve un premier enregistrement oriente `brouillon`, puis expose une action explicite `Publier` uniquement quand une version editable existe deja sur l'ecran d'edition.
- [x] L'ecran retient deux sous-flux cohabitants dans la meme page: une popup filtrable pour les questions existantes et une modale dediee pour creer ou editer une question sans quitter le composeur.
- [ ] Le front doit-il continuer d'orchestrer plusieurs endpoints, ou faut-il une commande backend unique pour sauver toute la composition ?
- [x] La banque de questions combine maintenant filtre texte + filtre de specialite + selection multiple persistante jusqu'a ajout ou remise a zero de la selection.
- [x] La modale de question reutilise maintenant les memes champs et garde-fous que `/dashboard/questions`, afin d'eviter deux experiences divergentes.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/forms/new` avec un compte autorise.
2. Renseigner les metadonnees du formulaire.
3. Enregistrer le brouillon initial et verifier la redirection vers `/dashboard/forms/:id/edit`.
4. Depuis l'editeur dedie, ajouter au moins une question existante et une question nouvelle.
5. Creer ou modifier les reponses depuis le meme flux d'edition.
6. Verifier qu'aucun rattachement a une campagne n'est demande pendant ce parcours et que ce rattachement reste reserve aux pages campagne.
7. Verifier que la popup "Ajouter des questions" peut etre filtree par texte et specialite, qu'elle exclut les questions deja liees, puis qu'elle se ferme apres ajout de la selection.
8. Verifier que la modale de question expose bien les presets de difficulte, la correction manuelle, la justification globale et le placeholder des questions texte libre comme sur `/dashboard/questions`.
9. Verifier que le header de creation annonce bien un statut initial `Brouillon`, que l'action de sortie `Annuler` ramene a la liste des formulaires et que le temps maximal theorique du formulaire se recolore quand `Formulaire chronometre` est coche.
10. Sur un formulaire deja cree avec version editable, verifier la presence puis le fonctionnement de l'action explicite `Publier`.