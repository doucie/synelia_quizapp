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
- Decision de planification proposee: la duplication d'une question sur formulaire verrouille doit etre declenchee uniquement par `questionText`, `questionChrono`, `questionType`, `score` et les changements structurels de reponses/correction.
- Decision de planification proposee: un changement limite a `difficultyLevel`, `specialityId` et/ou au commentaire additionnel ne doit pas dupliquer la question tant que ces champs sont traites comme des metadonnees non structurelles.
- Decision de planification proposee: `formName`, `formDesc` et `isActive` restent globaux sur `form` et ne generent pas de nouvelle version; `campaignId` et `isTimed`, eux, doivent etre traites comme structurants.

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

Decision proposee pour la planification:

- la duplication d'une question ne doit etre declenchee que par un changement de `questionText`, `questionChrono`, `questionType`, `score`, des reponses, ou de la correction
- un changement limite a `difficultyLevel`, `specialityId` et/ou au commentaire additionnel ne doit pas dupliquer la question
- attention: comme `difficultyLevel` et `specialityId` vivent aujourd'hui sur `question`, il faut expliciter si ces champs sont assumes comme globaux non versionnes ou s'ils doivent etre deplaces vers un support versionne pour ne pas reecrire l'historique

Taches de planification:

- [ ] Mettre en place une strategie de fork selectif: sur un formulaire verrouille, ne dupliquer que les questions effectivement modifiees.
- [ ] Formaliser la whitelist des champs qui provoquent une duplication de question: `questionText`, `questionChrono`, `questionType`, `score`, reponses, correction.
- [ ] Formaliser la blacklist des champs qui ne provoquent pas de duplication de question: `difficultyLevel`, `specialityId`, commentaire additionnel.
- [ ] Conserver les `question_id` existants pour toutes les questions non modifiees du nouveau formulaire.
- [ ] Decider ou vivent les champs non structurants qui ne doivent pas dupliquer la question: metadonnees globales assumees, ou snapshot porte par le lien/version.

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
- [ ] Faire en sorte que le workflow d'enregistrement applique la whitelist de duplication et ignore les changements non structurants (`difficultyLevel`, `specialityId`, commentaire additionnel) pour la duplication de question.

### 5.3 La campagne ne bascule pas automatiquement vers la nouvelle version apres modification

Le fork de version cree un brouillon non publie.

Ensuite, pour les nouvelles candidatures, le backend ne prend que des versions publiees.

Effet metier:

- apres modification d'un formulaire deja utilise, la campagne continue d'utiliser l'ancienne version tant que la nouvelle n'est pas publiee
- la bascule existe, mais elle n'est pas automatique

Conclusion:

- si l'attendu est "modifier => nouvelle version immediatement utilisee", alors non, ce n'est pas le fonctionnement actuel
- si l'attendu est "modifier => brouillon, puis publication explicite", alors oui, c'est coherent

Risque operationnel a traiter explicitement:

- si le front enchaine deux requetes distinctes du type "depublier l'ancienne" puis "publier la nouvelle", une coupure reseau entre les deux peut laisser un formulaire sans version publiee
- ce risque ne doit pas etre gere par le client mais elimine par une commande backend unique qui effectue toute la bascule
- constat technique utile: `form_version` ne declare aujourd'hui aucune contrainte d'unicite equivalente a "une seule version publiee par formulaire", contrairement a `form_questions` qui declare deja une `UniqueConstraint`

Taches de planification:

- [ ] Apres modification effective d'un formulaire verrouille, declencher une commande backend unique qui publie la nouvelle version et depublie l'ancienne.
- [ ] Encapsuler la depublishation des anciennes versions et la publication de la nouvelle dans une transaction serveur unique.
- [ ] Conserver la regle metier selon laquelle la campagne ne sert que la version publiee du formulaire.
- [ ] Ajouter au niveau base de donnees une contrainte garantissant "au plus une version publiee non supprimee par `form_id`" (index unique conditionnel ou mecanisme equivalent selon le SGBD).
- [ ] En cas de timeout ou d'erreur reseau cote client apres tentative de publication, recharger l'etat serveur avant toute nouvelle action au lieu de rejouer des sous-requetes de publication.

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

### 5.6 Champs portes par `form` et non par `form_version`

Les champs `formName`, `formDesc`, `isActive`, `campaignId` et `isTimed` vivent aujourd'hui sur l'entite `form`, pas sur `form_version`.

Decision proposee pour la planification:

- `formName`, `formDesc` et `isActive` sont des metadonnees globales et ne doivent pas generer de nouvelle version
- `campaignId` et `isTimed` sont des champs structurants: si le `form` source est verrouille, leur modification doit produire un nouveau parent `form`, pas seulement une nouvelle `form_version`
- pour `campaignId`, l'operation metier correcte ne doit pas etre "deplacer Form1 de Campaign1 vers Campaign2", mais "creer Form2 pour Campaign2 a partir de Form1"

Affinage propose sur `campaignId`:

- il faut distinguer deux cas metier differents
- cas A, reutilisation dans une autre campagne: si l'utilisateur est en train de creer ou modifier une campagne et veut y rattacher un `Form` deja rattache a une autre campagne, il faut dupliquer le parent `Form` et sa version courante meme si `Form1` n'est pas verrouille
- cas B, reassociation explicite: si l'utilisateur edite directement le `Form` lui-meme et decide qu'il ne doit plus appartenir a `Campaign1` mais a `Campaign2`, on peut accepter la mutation en place de `campaignId`, y compris si des `form_version` sont verrouillees, parce que l'historique candidat reste porte par `form_version`
- la duplication sur changement de campagne ne sert donc pas a proteger l'historique candidat; elle sert surtout a eviter qu'un meme `Form` doive etre utilise simultanement par plusieurs campagnes alors que le modele actuel n'autorise qu'un seul `campaignId`

Recommendation de solution:

- a court et moyen terme, la meilleure solution est de conserver le modele actuel "un `Form` appartient a une seule campagne" et d'ajouter une regle de duplication uniquement pour le cas A de reutilisation cross-campaign
- cette solution preserve les invariants existants: recherche des formulaires par `campaignId`, validation `source_token -> form -> campaign`, et unicite de publication par `form`
- la solution alternative "table de liaison campagne-form + `campaign_id` dans `form_version`" serait une refonte plus profonde qui change la semantique du produit: on ne versionnerait plus seulement un formulaire, mais un couple formulaire-campagne
- cette refonte ne vaut le coup que si le besoin produit cible est reellement: "un meme formulaire logique peut etre partage simultanement par plusieurs campagnes avec des versions publiees potentiellement differentes par campagne"
- en l'etat des besoins exprimes ici, cette refonte parait surdimensionnee par rapport au probleme a resoudre

Consequences de modele:

- tant que `campaignId` et `isTimed` restent portes par `form`, un simple fork de `form_version` ne suffit pas a isoler l'historique de ces champs
- si l'on veut versionner `campaignId` et `isTimed`, il faut donc dupliquer le parent `form` puis initialiser sa version courante
- en cas de reassociation directe du `Form` vers une autre campagne, il faut aussi traiter proprement les dependances de campagne existantes, en particulier les `source_token` et tout autre ecran qui suppose encore que le `Form` appartient a l'ancienne campagne

Taches de planification:

- [ ] Formaliser que `formName`, `formDesc` et `isActive` sont non versionnants et restent modifiables en place sur `form`.
- [ ] Si `isTimed` change sur un formulaire verrouille, creer un nouveau `form` puis une version initiale clonee de la version courante au lieu de muter le `form` historique.
- [ ] Distinguer explicitement le cas "reutiliser un formulaire existant dans une autre campagne" du cas "reassocier un formulaire existant a une autre campagne".
- [ ] Si une campagne tente de rattacher un `Form` deja utilise par une autre campagne, creer `Form2` rattache a `Campaign2`, puis creer `Form2_V1` comme duplicat de la version courante de `Form1`, meme si `Form1` n'est pas verrouille.
- [ ] Si l'utilisateur modifie directement un `Form` et change volontairement son `campaignId`, autoriser la reassociation en place, y compris si des versions sont verrouillees, tant que l'on accepte que l'ancienne campagne perde ce `Form` pour les usages futurs.
- [ ] Garantir qu'un rattachement a une nouvelle campagne ne retire jamais retroactivement `Form1` de sa campagne d'origine.
- [ ] Lors d'une reassociation directe de `campaignId`, verifier ou migrer les dependances encore liees a l'ancienne campagne, notamment les `source_token` qui valident deja la coherence entre `form` et `campaign`.
- [ ] Ne considerer une refonte vers une table de liaison `campaign_form` et une publication par couple (`form`, `campaign`) que si le besoin produit officiel devient le partage simultane d'un meme formulaire logique entre plusieurs campagnes.

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
- [ ] Formaliser que seuls `questionText`, `questionChrono`, `questionType`, `score`, reponses et correction provoquent une duplication de question.
- [ ] Formaliser que `difficultyLevel`, `specialityId` et le commentaire additionnel ne provoquent pas de duplication de question.
- [ ] Formaliser que `formName`, `formDesc` et `isActive` ne generent pas de nouvelle version.
- [ ] Formaliser que `campaignId` et `isTimed` exigent une duplication du parent `form` si la source est verrouillee.
- [ ] Pour `campaignId`, distinguer l'ajout a une autre campagne (duplication `Form2` + `Form2_V1`) de la reassociation explicite du `Form` (mutation en place acceptee avec controles de dependances).
- [ ] Publier la nouvelle version via une commande backend unique transactionnelle qui depublie l'ancienne dans le meme flux serveur.
- [ ] Interdire strictement plus d'une version publiee d'un meme formulaire via le code et la base de donnees.
- [ ] Interdire la publication d'une version vide.
- [ ] Valider la regle de revert sur brouillon non utilise: resultat cible `Form v2` avec le meme `question_ref` logique.
- [ ] Integrer la duplication ciblee de question dans le workflow front au lieu de laisser l'action backend orpheline.

## 9. Statut

Audit documentaire et document de planification.

Aucune modification de code applicatif n'a ete appliquee dans le cadre de ce document.
