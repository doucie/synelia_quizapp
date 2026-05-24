# Audit Form Question Versioning

Date: 2026-05-24

## 1. Objet

Audit du fonctionnement actuel du versioning formulaire/question pour le scenario suivant:

1. un formulaire est rattache a une campagne
2. une version de ce formulaire a deja ete utilisee par au moins un candidat
3. un utilisateur modifie ensuite le formulaire
4. on veut verifier si:
   - l'ancienne version est preservee pour l'historique
   - une nouvelle version exploitable est creee
   - les questions sont correctement isolees si besoin, tout en gardant le meme `question_ref`
   - la campagne utilise ensuite correctement la bonne version pour les nouvelles candidatures

## 2. Conclusion Courte

Le systeme actuel est partiellement bon.

- Oui, l'historique des anciennes candidatures est preserve.
- Oui, le formulaire lui-meme est versionne.
- Oui, la campagne peut basculer vers une nouvelle version, mais seulement apres publication explicite de cette nouvelle version.
- Non, les questions heritees d'une version verrouillee ne sont pas dupliquees automatiquement lors du fork de version.
- Non, le workflow utilisateur actuel ne permet pas de faire facilement cette duplication de question, meme si l'API backend existe.
- Point de modelisation a clarifier: `formName` et `formDesc` sont portes par `form`, pas par `form_version`, donc leur versioning metier n'est pas encore tranche.

En pratique, le systeme protege bien l'historique, mais il ne couvre pas correctement de bout en bout le cas "je modifie un formulaire deja utilise, et tout le contenu question/reponse devient automatiquement editable dans une nouvelle version isolee".

## 3. Ce Qui Fonctionne Correctement

### 3.1 Creation initiale de version

Lors de la creation d'un formulaire, une version initiale brouillon `v1` est creee automatiquement:

- `quizapp/src/main/java/tech/synelia/quizapp/business/FormBusiness.java`
- appel a `createInitialDraftVersions(...)`
- la version initiale est creee avec:
  - `versionNumber = 1`
  - `isPublished = false`
  - `isLocked = false`

Effet metier: un formulaire a des le depart une premiere version editable.

### 3.2 Preservation de l'historique candidat

Chaque candidature stocke explicitement la `formVersion` utilisee:

- `quizapp/src/main/java/tech/synelia/quizapp/dao/entity/Applications.java`
- champ `private FormVersion formVersion;`

Effet metier: une ancienne candidature reste rattachee a l'ancienne version, meme si une nouvelle version du formulaire est creee ensuite.

### 3.3 Verrouillage apres premiere utilisation

Quand une candidature est creee ou finalisee, la version du formulaire peut etre verrouillee:

- `quizapp/src/main/java/tech/synelia/quizapp/business/ApplicationsBusiness.java`
- methode `lockFormVersionIfNeeded(...)`

Effet metier: une version deja servie a un candidat est protegee contre les modifications directes.

### 3.4 Selection des versions pour les nouvelles candidatures

Pour les nouvelles candidatures, le backend ne choisit que des versions publiees:

- `quizapp/src/main/java/tech/synelia/quizapp/business/ApplicationsBusiness.java`
- `selectFormVersionForCandidate(...)`
- `getPublishedFormVersionsForCampaign(...)`
- `resolveSourceTokenFormVersion(...)`

Effet metier: une campagne ne bascule pas par accident vers un brouillon; seules les versions publiees sont candidates pour les nouvelles affectations.

### 3.5 Depublication des anciennes versions lors de la publication

Quand une version est publiee, les autres versions publiees du meme formulaire sont depubliees:

- `quizapp/src/main/java/tech/synelia/quizapp/business/FormVersionBusiness.java`
- logique dans `update(...)`

Effet metier: a terme, un formulaire ne garde qu'une version publiee active pour les nouvelles candidatures.

## 4. Chronologie Reelle du Systeme

### 4.1 Avant utilisation candidat

Etat normal:

- une version existe
- elle est editable si `isLocked = false`
- si elle est publiee, elle peut etre selectionnee pour de nouvelles candidatures

### 4.2 Apres premiere utilisation candidat

La version rattachee a la candidature est verrouillee.

Effet:

- l'ancienne version est preservee
- elle ne doit plus etre modifiee directement

### 4.3 Quand on modifie une version verrouillee

Le backend cree un fork de version:

- `quizapp/src/main/java/tech/synelia/quizapp/business/FormVersionBusiness.java`
- `update(...)`
- `createForkedVersion(...)`

Le fork cree:

- une nouvelle `form_version`
- `versionNumber + 1`
- `isPublished = false`
- `isLocked = false`

Effet:

- une nouvelle version brouillon editable existe bien
- l'ancienne version reste intacte

## 5. Problemes Identifies

### 5.1 Probleme principal: le fork de formulaire ne duplique pas automatiquement les questions

Dans `createForkedVersion(...)`, le backend recopie seulement les liens `form_questions` vers la nouvelle version:

- `quizapp/src/main/java/tech/synelia/quizapp/business/FormVersionBusiness.java`
- ligne cle: `newFq.setQuestion(srcFq.getQuestion());`

Donc apres fork:

- `v1` verrouillee pointe vers la question `Q1`
- `v2` brouillon pointe encore vers la meme question `Q1`

Or les modifications de question et de reponse sont bloquees si la question est encore referencee par une version verrouillee:

- `quizapp/src/main/java/tech/synelia/quizapp/business/QuestionBusiness.java`
- `quizapp/src/main/java/tech/synelia/quizapp/business/AnswerBusiness.java`

Effet metier:

- le formulaire est bien versionne
- mais son contenu question/reponse reste partage avec la version verrouillee
- donc les questions heritees ne deviennent pas automatiquement editables dans la nouvelle version

Verdict: c'est le principal trou fonctionnel du systeme actuel.

Taches de planification:

- [ ] Mettre en place une strategie de fork selectif: sur un formulaire verrouille, ne dupliquer que les questions effectivement modifiees.
- [ ] Conserver les `question_id` existants pour toutes les questions non modifiees du nouveau formulaire.
- [ ] Definir le diff canonique d'une question modifiee: texte, type, score, chrono, specialite, ordre, reponses, correction et champs de commentaire additionnel.

### 5.2 La duplication ciblee de question existe, mais elle n'est pas branchee dans le workflow front

Le backend expose une action custom `duplicateQuestion`:

- `quizapp/src/main/java/tech/synelia/quizapp/business/FormVersionBusiness.java`
- methode `duplicateQuestionForVersion(...)`

Cette action:

1. cree une nouvelle question
2. conserve le meme `question_ref` si present
3. duplique les reponses
4. remplace le lien `form_questions` pour la version cible

La ligne cle sur le `question_ref` est:

- `newQuestion.setQuestionRef(originalQuestion.getQuestionRef() != null ? originalQuestion.getQuestionRef() : UUID...)`

Donc selon ta definition metier de "version de question" (meme `question_ref`, nouvelle ligne dupliquee), le mecanisme backend est coherent.

Probleme:

- le front n'appelle actuellement que l'action `fork`
- je n'ai pas trouve de branchement front actif pour `duplicateQuestion`

Effet metier:

- la brique backend existe
- mais l'utilisateur n'a pas de workflow standard pour l'utiliser

Taches de planification:

- [ ] Brancher `duplicateQuestion` dans le workflow d'edition de composition du formulaire ou masquer cette action derriere l'enregistrement automatique du formulaire.
- [ ] Faire en sorte que, si l'utilisateur ne modifie qu'une seule question sur un formulaire verrouille, seule cette question soit dupliquee pendant le save.

### 5.3 La campagne ne bascule pas automatiquement vers la nouvelle version apres modification

Le fork de version cree un brouillon non publie.

Ensuite, pour les nouvelles candidatures, le backend ne prend que des versions publiees.

Effet metier:

- apres modification d'un formulaire deja utilise, la campagne continue d'utiliser l'ancienne version tant que la nouvelle n'est pas publiee
- la bascule existe, mais elle n'est pas automatique

Conclusion:

- si l'attendu est "modifier => nouvelle version immediatement utilisee", alors non, ce n'est pas le fonctionnement actuel
- si l'attendu est "modifier => brouillon, puis publication explicite", alors oui, c'est coherent

Taches de planification:

- [ ] Apres modification effective d'un formulaire verrouille, publier automatiquement la nouvelle version et depublier l'ancienne dans la meme transaction metier.
- [ ] Conserver la regle metier selon laquelle la campagne ne sert que la version publiee du formulaire.
- [ ] Verifier puis renforcer l'interdiction d'avoir plus d'une version publiee par formulaire, y compris au niveau base de donnees si necessaire.

### 5.4 Point a verifier: fork + publication dans un seul update

Dans `FormVersionBusiness.update(...)`, quand la version source est verrouillee, le backend fait un auto-fork.

L'hypothese d'audit precedente etait la suivante: si la version source etait deja publiee, et que l'utilisateur demande dans la meme operation que la nouvelle version soit publiee, la logique peut retomber sur l'etat du brouillon nouvellement cree au lieu d'honorer la demande.

Point cle releve:

- `publishedToApply = entityToSave.getIsPublished();`

Comme `entityToSave` est le nouveau brouillon cree par fork, sa valeur publiee par defaut est `false`.

Risque metier potentiel:

- l'utilisateur pense valider une nouvelle version publiee
- le backend peut en realite conserver cette nouvelle version non publiee

Statut de ce point:

- point a confirmer par reproduction ciblee
- pas encore retenu comme anomalie fonctionnelle fermee

Taches de planification:

- [ ] Reproduire ce cas avec un test cible pour confirmer si la demande `isPublished = true` est bien perdue pendant l'auto-fork.
- [ ] Si le probleme est confirme, conserver l'intention de publication demandee sur la nouvelle version issue du fork.

### 5.5 Une version vide peut etre publiee

Dans `validateFormVersionCanBePublished(...)`, si la version n'a aucune ligne `form_questions`, la methode retourne sans erreur.

Effet metier:

- une version sans question peut devenir publiee
- elle peut alors devenir selectionnable pour les nouvelles candidatures

Ce n'est pas forcement un bug bloquant selon la strategie produit, mais c'est un risque fonctionnel net.

Taches de planification:

- [ ] Interdire la publication d'une version sans aucune question active rattachee.

### 5.6 Metadonnees de formulaire non versionnees

Les champs de metadonnees `formName` et `formDesc` sont portes par l'entite `form`, pas par `form_version`.

Effet metier:

- si l'utilisateur ne modifie que le titre ou la description, il n'existe pas aujourd'hui de snapshot versionne de ces informations au niveau `form_version`
- une mise a jour du `form` peut potentiellement impacter toutes les versions qui le referencent

Question de conception ouverte:

- faut-il versionner aussi le titre et la description du formulaire, ou les considerer comme des metadonnees globales hors snapshot ?

Taches de planification:

- [ ] Decider si `formName` et `formDesc` font partie du snapshot versionne que l'on souhaite figer dans le temps.
- [ ] Solution proposee si oui: creer une nouvelle version de formulaire meme si seul le titre ou la description changent, sans dupliquer les questions inchangées.
- [ ] Solution proposee si oui et si le modele actuel reste insuffisant: snapshotter ces metadonnees sur `form_version` ou dupliquer aussi le parent `form` pour isoler l'historique.
- [ ] Solution proposee si non: documenter explicitement que le titre et la description sont globaux au `form` et peuvent donc varier retroactivement sur toutes les versions.

### 5.7 Cas no-op: l'utilisateur ouvre la modification mais ne change rien

Le comportement cible demande qu'aucun fork ne soit cree si la modification finale ne differe en rien de la version actuelle.

Taches de planification:

- [ ] Calculer un diff canonique entre la version persistée et le payload final avant tout fork.
- [ ] Si aucun ecart effectif n'est detecte, ne creer aucun fork et laisser la version courante intacte.

### 5.8 Cas de revert d'une question sur un brouillon non utilise

Scenario de planification:

1. `Form v1`, question logique `QREF1 = "Qu'est ce que Java"`
2. un candidat utilise `Form v1`
3. l'utilisateur modifie le formulaire et obtient un brouillon `Form v2`
4. dans ce brouillon, la question est modifiee
5. avant toute utilisation candidat de `Form v2`, l'utilisateur remet finalement le texte d'origine `"Qu'est ce que Java"`

Question ouverte:

- le resultat attendu doit-il etre `Form v1, QREF1`, `Form v2, QREF1` ou `Form v2, QREF3` ?

Solution proposee pour la planification:

- tant que `Form v2` n'a jamais ete utilise par un candidat et reste deverrouille, conserver `Form v2`
- conserver le meme `question_ref` logique (`QREF1`)
- conserver la meme copie de question deja associee au brouillon, en restaurant simplement son contenu
- ne pas relier `Form v2` a la ligne historique de `Form v1`
- ne pas creer une troisieme copie inutile

Taches de planification:

- [ ] Valider comme regle metier le fait qu'un revert sur brouillon non utilise reste dans `Form v2` avec le meme `question_ref` logique.
- [ ] Ne creer une nouvelle copie de question que lorsqu'un nouveau diff effectif apparait sur une question deja figee par un formulaire verrouille.

## 6. Reponse Precise a la Question Produit

Question: si un formulaire dans une campagne a deja ete utilise par un candidat, est-ce que, quand on le modifie, le formulaire est correctement versionne, les questions dupliquees, et l'ancienne version mise a l'ecart pour que la campagne utilise la nouvelle version ?

Reponse courte sur l'etat actuel:

- formulaire correctement versionne: oui
- ancienne version preservee pour les anciennes candidatures: oui
- questions dupliquees automatiquement: non
- ancienne version mise a l'ecart pour les nouvelles candidatures: oui, mais seulement apres publication explicite de la nouvelle version
- bascule immediatement fiable lors d'un fork + publication dans la meme action: a confirmer

## 7. Verdict Final

Le systeme actuel est bon sur la protection de l'historique et sur le versioning du formulaire lui-meme.

En revanche, il n'est pas encore bon de bout en bout sur l'isolation des questions dans une nouvelle version de formulaire deja utilisee.

Le backend possede deja la bonne idee metier via `duplicateQuestionForVersion(...)`, avec conservation du meme `question_ref`, mais ce mecanisme n'est pas integre dans le workflow utilisateur courant.

Donc, dans l'etat actuel:

- le versioning formulaire est reel
- le versioning question au sens "meme `question_ref`, nouvelle copie isolee" existe partiellement
- mais le fonctionnement global n'est pas encore totalement correct ni fluide pour l'utilisateur final

## 8. Taches de Planification Prioritaires

- [ ] Valider la regle "pas de fork si aucun diff effectif".
- [ ] Valider la regle "fork du formulaire verrouille uniquement si diff effectif".
- [ ] Valider la regle "duplication selective des seules questions modifiees".
- [ ] Valider la regle "si seul le titre ou la description changent, aucune question n'est dupliquee".
- [ ] Trancher si un changement de `formName` ou `formDesc` doit, a lui seul, creer une nouvelle version publiee du formulaire.
- [ ] Publier automatiquement la nouvelle version apres modification effective d'un formulaire verrouille et depublier l'ancienne.
- [ ] Interdire strictement plus d'une version publiee d'un meme formulaire.
- [ ] Interdire la publication d'une version vide.
- [ ] Valider la regle de revert sur brouillon non utilise: resultat cible `Form v2` avec le meme `question_ref` logique.
- [ ] Integrer la duplication ciblee de question dans le workflow front au lieu de laisser l'action backend orpheline.

## 9. Statut

Audit documentaire et document de planification.

Aucune modification de code applicatif n'a ete appliquee dans le cadre de ce document.
