# Dashboard Forms Edit

## 1. Identite

- Route: `/dashboard/forms/:id/edit`
- Guard: `roleGuard` + `permissionGuard(['UPDATE_FORM'])` sur la route enfant, en plus du shell `/dashboard` protege par `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/forms/form-editor-page.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/forms/form-editor-page.html`
- Statut: page montee et reliee au workflow d'edition dedie

## 2. Objectif Produit

La page doit permettre de modifier un formulaire existant dans un flux unique: metadonnees, version brouillon editable, composition des questions et edition des reponses, sans renvoyer l'utilisateur vers les CRUD techniques `form_version`, `form_questions`, `question` et `answer`.

## 3. Etat Constate

- [x] La route est montee; l'edition passe maintenant par une vraie page dediee au lieu d'une modale locale sur `/dashboard/forms`.
- [x] La cible fonctionnelle retenue est que l'edition partage le meme modele mental que la creation: un formulaire se modifie avec ses questions et ses reponses dans le meme ecran.
- [x] Les liaisons campagne-formulaire restent hors du perimetre de cette page; elles se gerent depuis la creation ou la modification de campagne.
- [x] Si une campagne doit diverger d'un formulaire partage, la duplication fonctionnelle reste un flux de page campagne via `duplicateForCampaign`, pas un rattachement implicite modifie ici.
- [x] L'edition doit respecter le versioning: si la version servie est deja verrouillee ou publiee, l'utilisateur doit travailler sur un brouillon coherent sans reecrire l'historique candidat.
- [x] Le front propose maintenant un ecran metier unique pour cette edition contextualisee de composition, sans renvoyer vers les CRUD techniques.

## 4. Blocs UI Cibles

### 4.1 Header

- [x] bouton retour vers `/dashboard/forms`
- [x] titre `Modifier le formulaire`
- [x] badges de contexte: brouillon, publie, verrouille

### 4.2 Informations generales

- [x] `formName`
- [x] `formDesc`
- [x] `isActive`
- [x] `isTimed`
- [x] contexte des campagnes liees en lecture seule, sans exposer un CRUD technique de liaison

### 4.3 Contexte de version

- [x] identification de la version de travail courante
- [x] message clair si l'edition ouvre ou poursuit un brouillon derive d'une version verrouillee
- [x] publication explicite separee de l'enregistrement standard

### 4.4 Composition des questions

- [x] ajout, retrait, reordonnancement et edition des questions de la version de travail
- [x] ajout depuis la banque existante ou creation inline
- [x] signaux d'impact si une modification structurelle va isoler une question sur le brouillon
- [ ] filtre de la banque de questions par specialite pour accelerer la recherche dans les grands catalogues
- [ ] selection multiple de questions existantes avant ajout a la version de travail
- [ ] ajout en lot des questions selectionnees avec retour visuel clair sur la selection retenue

### 4.5 Reponses embarquees

- [x] edition inline des reponses par question
- [x] regles UX selon `questionType`
- [x] preservation du commentaire additionnel et de l'ordre des reponses

### 4.6 Actions de sortie

- [x] `Enregistrer`
- [x] `Publier cette version` via une action explicite distincte
- [x] retour a la liste sans CRUD technique de liaison

## 5. Donnees A Afficher Ou Editer

### 5.1 Formulaire

- `id`
- `formName`
- `formDesc`
- `isActive`
- `isTimed`

### 5.2 Version de travail

- `formVersionId`
- `versionNumber`
- `isPublished`
- `isLocked`
- `randomQuestions`

### 5.3 Questions et reponses embarquees

- `questionId`
- `questionRef`
- `questionText`
- `questionType`
- `difficultyLevel`
- `specialityId`
- `score`
- `questionChrono`
- `questionOrder`
- `answerText`
- `answerType`
- `allowAdditionalComment`
- `additionalCommentRequired`
- `additionalCommentPlaceholder`
- `answerOrder`
- `isCorrect`

## 6. Services Et Endpoints

- `FormService.getAllByCriteria()` ou lecture equivalente pour charger le formulaire et ses metadonnees
- `FormVersionService.getAllByCriteria()` et action metier de publication explicite pour piloter la version de travail
- `FormQuestionsService` pour charger et sauver l'ordonnancement des questions
- `QuestionService` et `AnswerService` pour les mutations embarquees
- `CampaignFormService` ou donnees enrichies equivalentes uniquement pour afficher le contexte de partage en lecture seule
- Option cible a qualifier: orchestration front transverse vs endpoint backend composite pour sauver toute la composition

## 7. Ce Que Le Backend Doit Envoyer

- Un chargement clair de la version de travail editable sans ambiguite sur le brouillon courant.
- Une publication explicite transactionnelle qui depublie l'ancienne version et publie la nouvelle sans laisser d'etat intermediaire bancal.
- Des garde-fous cohérents quand une question est encore referencee par une version verrouillee.
- Un contexte de partage lisible pour afficher l'impact potentiel sur plusieurs campagnes, sans renvoyer l'utilisateur vers `campaign_form`.

## 8. Entites Metier Impliquees

- `form`
- `formVersion`
- `formQuestions`
- `question`
- `answer`
- `campaignForm`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il exposer la publication sur cette page, ou conserver une action distincte plus explicite encore ?
- [ ] Comment presenter au mieux l'impact d'un formulaire partage sur plusieurs campagnes sans reintroduire une UX technique de liaison ?
- [ ] L'edition doit-elle proposer un raccourci vers la duplication campagne-specifique, ou laisser ce flux exclusivement aux pages campagne ?
- [ ] La banque de questions de l'edition doit-elle conserver une selection multiple persistante quand l'utilisateur alterne entre filtres texte / specialite et modifications du brouillon ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/forms/:id/edit` sur un formulaire existant.
2. Verifier le chargement des metadonnees, de la version de travail et des questions deja composees.
3. Modifier une question et ses reponses depuis le meme ecran.
4. Enregistrer puis verifier que l'historique d'une version verrouillee n'est pas reecrit.
5. Publier explicitement la nouvelle version si ce flux est expose.
6. Verifier que le rattachement ou le retrait de ce formulaire a une campagne reste renvoye vers les pages campagne.
7. Verifier que la banque de questions peut etre filtree par specialite et qu'un ajout multiple de questions existantes reste fluide sur un formulaire deja charge.