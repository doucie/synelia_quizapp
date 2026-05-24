# Note - Evolution du modele des reponses et commentaires additionnels

**Date :** 2026-05-21
**Statut :** Slice 1 backend + admin lance
**Perimetre :** question, answer, candidate_answer, rendu du quiz, administration des reponses

## 1. Decisions retenues

- [x] `question.questionType` conserve le mode global de la question.
- [x] `answer.answerType` est reutilise pour le format de contenu et non plus pour le mode de saisie candidat.
- [x] Les valeurs cibles de `answerType` deviennent `TEXT`, `IMAGE`, `CODE`.
- [x] Une question `TEXT` reste une question totalement libre, sans obligation de creer des lignes `answer`.
- [x] Le cas `Autre : preciser` est porte par une ligne `answer` precise, pas par la question entiere.
- [x] `candidate_answer.free_text_response` reste le support de la saisie libre et du commentaire additionnel.
- [x] Le nommage retenu est `allowAdditionalComment`, `additionalCommentRequired`, `additionalCommentPlaceholder`.

## 2. Probleme cible

Le modele actuel melange deux sujets differents :

- la nature du contenu d'une reponse ;
- le mode de saisie attendu du candidat.

Ce melange cree plusieurs ambiguities :

- une question `TEXT` stocke deja la vraie saisie candidat dans `candidate_answer.free_text_response` ;
- une ligne `answer` de type `FREE` devient redondante pour une question totalement libre ;
- le cas `Autre : preciser` n'est pas un type de reponse autonome, mais une option qui ouvre un commentaire additionnel.

## 3. Checklist base de donnees

- [x] Reinterpreter `answer.answer_type` en format de contenu `TEXT/IMAGE/CODE`.
- [x] Normaliser les anciennes valeurs `FIXED/FREE` vers `TEXT` pendant la migration.
- [x] Ajouter `answer.allow_additional_comment` en booleen par defaut a `false`.
- [x] Ajouter `answer.additional_comment_required` en booleen par defaut a `false`.
- [x] Ajouter `answer.additional_comment_placeholder` en texte nullable.
- [ ] Garantir que `additional_comment_required = true` n'a de sens que si `allow_additional_comment = true`.
- [ ] Laisser `candidate_answer.free_text_response` sans changement de schema pour le premier slice.

## 4. Checklist backend

- [x] Remplacer l'enum `AnswerType` par `TEXT/IMAGE/CODE`.
- [x] Garder une compatibilite legacy temporaire pour les payloads `FIXED/FREE` encore en circulation.
- [x] Exposer les nouveaux champs de commentaire dans `Answer`, `AnswerDto` et `AnswerTransformer`.
- [x] Valider la coherence `allowAdditionalComment` / `additionalCommentRequired` dans `AnswerBusiness`.
- [x] Propager les nouveaux champs lors de la duplication des questions et reponses dans `FormVersionBusiness`.
- [ ] Verifier que la recherche et la serialisation ne cassent pas avec les nouveaux attributs.

## 5. Checklist frontend

- [x] Revenir aux valeurs `TEXT/IMAGE/CODE` dans les formulaires admin de reponses.
- [x] Ajouter les champs de configuration du commentaire additionnel sur `/dashboard/answers`.
- [x] Ajouter les memes champs dans la modal de reponses inline de `/dashboard/questions`.
- [x] Normaliser cote UI les anciennes valeurs `FIXED/FREE` encore renvoyees par une API non migree.
- [x] Etendre les interfaces TypeScript et le service Angular `answer.service.ts`.
- [ ] Prevoir un affichage conditionnel du placeholder et du caractere obligatoire uniquement si le commentaire est active.

## 6. Checklist rendu quiz et compatibilite

- [ ] Continuer a traiter `QuestionType.TEXT` comme une saisie libre native.
- [ ] Ajouter ensuite le rendu conditionnel d'un commentaire libre lorsqu'une option `allowAdditionalComment = true` est selectionnee.
- [ ] Reutiliser `candidate_answer.free_text_response` pour stocker le texte saisi dans ce cas.
- [ ] Verifier que la correction manuelle et la consultation des reponses restent lisibles avec ce double usage.

## 7. Checklist tests et recette

- [ ] Ajouter un test backend cible sur la normalisation `FIXED/FREE -> TEXT`.
- [ ] Ajouter un test backend sur la validation `additionalCommentRequired` sans `allowAdditionalComment`.
- [ ] Ajouter des tests frontend complets sur `/dashboard/answers` pour les nouveaux champs admin.
- [ ] Ajouter une recette manuelle sur `/dashboard/questions` pour la creation, edition et duplication de reponses.
- [ ] Ajouter ensuite une recette fonctionnelle sur le rendu candidat quand le slice quiz sera cable.

## 8. Exemple cible

Question : `Quelles sont vos aspirations ?`

Configuration cible :

- `questionType = MULTIPLE_CHOICE`
- `R1`: `answerText = Reussir dans la vie`, `answerType = TEXT`, `allowAdditionalComment = false`
- `R2`: `answerText = Etre epanoui`, `answerType = TEXT`, `allowAdditionalComment = false`
- `R3`: `answerText = Autre`, `answerType = TEXT`, `allowAdditionalComment = true`, `additionalCommentRequired = true`, `additionalCommentPlaceholder = Precisez votre aspiration`

Si le candidat selectionne `R3`, on enregistre :

- `candidate_answer.answer_id = R3`
- `candidate_answer.free_text_response = texte saisi`

## 9. Ordre recommande de mise en oeuvre

- [x] 1. Ajouter la migration Flyway du schema `answer` et normaliser les donnees legacy.
- [x] 2. Aligner le backend Java sur `TEXT/IMAGE/CODE` et exposer les nouveaux champs.
- [x] 3. Aligner les formulaires admin Angular sur ce contrat.
- [ ] 4. Cablage du rendu candidat pour le commentaire additionnel.
- [ ] 5. Completer les tests et la recette transverse.

## 10. Conclusion

La direction retenue est donc :

- garder `questionType` pour le mode global de la question ;
- redonner a `answerType` son role de format de contenu ;
- sortir le comportement `Autre : preciser` vers des attributs explicites sur `answer` ;
- reutiliser `candidate_answer.free_text_response` pour la saisie libre pure et pour les commentaires complementaires.

Cette approche couvre le cas simple, couvre le cas `Autre : preciser`, et evite de surcharger inutilement la table `answer` pour les questions entierement libres.