# Audit Form Question Versioning

Date: 2026-05-25

## 1. Objet

Audit du fonctionnement actuel du versioning formulaire/question et de son alignement avec la cible `campaign_form` pour le scenario suivant:

1. un formulaire peut etre rattache a une ou plusieurs campagnes
2. une version de ce formulaire a deja ete utilisee par au moins un candidat
3. un utilisateur modifie ensuite le formulaire partage ou sa version brouillon
4. on veut verifier si:
  - l'ancienne version est preservee pour l'historique
  - une nouvelle version exploitable est creee
  - les questions sont correctement isolees si besoin, tout en gardant le meme `question_ref`
  - les campagnes liees utilisent ensuite correctement la bonne version publiee pour les nouvelles candidatures
  - une divergence specifique a une campagne passe par une duplication explicite du formulaire, et non par une mutation implicite du rattachement campagne-formulaire

## 2. Conclusion Courte

Le systeme actuel est partiellement bon.

- Oui, l'historique des anciennes candidatures est preserve.
- Oui, le formulaire lui-meme est versionne.
- Oui, la campagne peut basculer vers une nouvelle version, mais seulement apres publication explicite de cette nouvelle version.
- Oui, les questions heritees d'une version verrouillee peuvent maintenant etre isolees automatiquement pendant une edition contextualisee depuis une `form_version` brouillon, uniquement si un diff structurel est detecte.
- Oui, le back-office conserve aussi une action explicite `duplicateQuestion` pour isoler manuellement une question sur un brouillon si besoin.
- Les principaux chemins de mutation admin touches par le versioning (`form_version`, `form_questions`, `question`, `answer`) reappliquent maintenant les memes garde-fous metier que les chemins standards.
- Regle metier desormais implementee dans le workflow contextualise: la duplication d'une question sur formulaire verrouille n'est declenchee que par `questionText`, `questionChrono`, `questionType`, `score` et les changements structurels de reponses/correction.
- Regle metier desormais implementee dans ce meme workflow: un changement limite a `difficultyLevel`, `specialityId` et/ou au commentaire additionnel ne duplique pas la question tant que ces champs restent traites comme des metadonnees non structurelles.
- Point intermediaire deja implemente et valide cote backend: les updates directs `question`/`answer` distinguent maintenant les champs structurels des metadonnees non structurelles; les changements limites a `difficultyLevel`, `specialityId` et au commentaire additionnel peuvent etre appliques en place, alors que les mutations structurelles restent bloquees tant que la question est encore rattachee a une version verrouillee.
- Decision de planification desormais retenue: `formName`, `formDesc`, `isActive` et `isTimed` restent globaux sur `form`; `campaignId`, lui, doit sortir du modele cible et etre remplace par une liaison explicite `campaign_form`.
- Si une campagne doit diverger d'un formulaire partage sur le contenu, la publication ou le timing, cette divergence doit passer par une duplication explicite du `Form`, pas par une reassociation implicite de `campaignId`.
- Le chronometrage effectif est maintenant snapshotte au niveau candidature; `campaign.timeAllForms` reste un parametre de campagne, tandis que `form.isTimed` reste un attribut global du formulaire partage.
- Pendant la coexistence, la source de verite des rattachements campagne-formulaire est desormais `campaign_form`; `form.campaign_id` devient une simple projection de compatibilite recalculée cote backend apres mutation des liens: un seul lien actif -> cette campagne, zero ou plusieurs liens actifs -> `null`.
- Le point majeur encore ouvert n'est donc plus l'arbitrage "dupliquer ou reassigner `campaignId`", mais la migration effective du code backend/frontend qui lit, ecrit et valide encore `form.campaignId`.

En pratique, le systeme protege bien l'historique et couvre maintenant le workflow back-office principal "j'ouvre une question depuis une `form_version` brouillon et je l'edite sans reecrire l'historique". En revanche, il ne s'agit pas encore d'une commande unique de sauvegarde de toute la composition du formulaire.

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

Point complementaire desormais valide cote backend: pour la strategie `SEQUENTIAL`, `ApplicationsBusiness.getPublishedFormVersionsForCampaign(...)` conserve l'ordre de `campaign_form.assignment_order` fourni par `CampaignFormRepository.findActiveFormsByCampaignId(...)`; l'affectation stable par campagne ne retombe donc plus implicitement sur un tri par `form.id`.

### 3.5 Depublication des anciennes versions lors de la publication

Quand une version est publiee, les autres versions publiees du meme formulaire sont depubliees:

- `quizapp/src/main/java/tech/synelia/quizapp/business/FormVersionBusiness.java`
- action metier `custom("publish")` puis `applyPublishedState(...)`

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

### 5.1 Le fork recopie toujours les liens de questions, mais le workflow contextualise isole maintenant seulement les questions structurellement modifiees

Dans `createForkedVersion(...)`, le backend recopie seulement les liens `form_questions` vers la nouvelle version:

- `quizapp/src/main/java/tech/synelia/quizapp/business/FormVersionBusiness.java`
- ligne cle: `newFq.setQuestion(srcFq.getQuestion());`

Donc apres fork:

- `v1` verrouillee pointe vers la question `Q1`
- `v2` brouillon pointe encore vers la meme question `Q1`

Or les modifications de question et de reponse sont bloquees si la question est encore referencee par une version verrouillee:

- `quizapp/src/main/java/tech/synelia/quizapp/business/QuestionBusiness.java`
- `quizapp/src/main/java/tech/synelia/quizapp/business/AnswerBusiness.java`

Effet metier initial:

- le formulaire est bien versionne
- mais son contenu question/reponse reste partage avec la version verrouillee tant qu'aucune isolation n'a ete demandee

Evolution appliquee et validee:

- `QuestionBusiness` et `AnswerBusiness` bloquent maintenant uniquement les mutations structurelles sur une question encore referencee par une version verrouillee
- sont traites comme structurels: `questionText`, `questionChrono`, `questionType`, `score`, `isDeleted`, ainsi que cote reponse `questionId`, `answerText`, `answerType`, `answerOrder`, `isCorrect`, `isDeleted`
- restent autorises en place comme metadonnees non structurelles: `difficultyLevel`, `specialityId`, `allowAdditionalComment`, `additionalCommentRequired`, `additionalCommentPlaceholder`
- le back-office `form_version` ouvre maintenant l'editeur existant des questions avec le contexte `formVersionId + questionId`
- lors du save contextualise, le front compare l'etat initial et l'etat final; si aucun diff structurel n'est detecte, la question reste en place, sinon il appelle `ensureEditableQuestion` pour isoler la question seulement sur ce brouillon avant de poursuivre la sauvegarde

Verdict actuel:

- le fork de formulaire ne duplique toujours pas en masse toutes les questions, ce qui est voulu
- la duplication selective des seules questions modifiees est maintenant orchestree de bout en bout pour le workflow back-office contextualise question par question
- il ne s'agit pas encore d'une commande transactionnelle unique qui sauverait toute la composition du formulaire en une seule requete

Taches de planification:

- [x] Mettre en place une strategie de fork selectif: sur un formulaire verrouille, ne dupliquer que les questions effectivement modifiees.
- [x] Formaliser la whitelist des champs qui provoquent une duplication de question: `questionText`, `questionChrono`, `questionType`, `score`, reponses, correction.
- [x] Formaliser la blacklist des champs qui ne provoquent pas de duplication de question: `difficultyLevel`, `specialityId`, commentaire additionnel.
- [x] Conserver les `question_id` existants pour toutes les questions non modifiees du nouveau formulaire.
- [x] Decider ou vivent les champs non structurants qui ne doivent pas dupliquer la question: metadonnees globales assumees sur `question`/`answer`, et non snapshot portee par le lien/version.

### 5.2 La duplication ciblee de question est maintenant branchee dans le workflow front, avec un mode automatique contextualise

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

Branchements front desormais en place:

- la page back-office `entities-form-versions` expose toujours une action manuelle `duplicateQuestion` sur les questions d'un brouillon deverrouille
- cette meme page expose maintenant une action d'edition qui redirige vers la page `questions` avec `formVersionId` et `questionId`
- la page `questions` detecte ce contexte, ouvre automatiquement le modal de la bonne question, puis appelle `ensureEditableQuestion` uniquement si les changements sont structurels

Effet metier:

- la brique backend n'est plus orpheline
- l'utilisateur dispose d'un workflow standard pour isoler explicitement ou implicitement une question de brouillon

Taches de planification:

- [x] Brancher `duplicateQuestion` dans le workflow d'edition de composition du formulaire ou masquer cette action derriere l'enregistrement automatique du formulaire.
- [x] Faire en sorte que le workflow d'enregistrement applique la whitelist de duplication et ignore les changements non structurants (`difficultyLevel`, `specialityId`, commentaire additionnel) pour la duplication de question.

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
- constat technique utile: une contrainte base dediee garantit maintenant qu'il n'existe au plus qu'une version publiee non supprimee par formulaire, en complement de la depublishation transactionnelle cote backend

Statut intermediaire deja valide:

- dans le back-office `form_version`, l'edition standard d'une version verrouillee passe maintenant par un unique `update` backend sans pre-remplir cote front un faux `versionNumber + 1`, ni forcer artificiellement `isPublished = false` ou `isLocked = false`
- la publication n'est plus transportee par ce flux d'edition standard: elle passe desormais par une action backend explicite `publish`, qui depublie l'ancienne version et publie la nouvelle dans la meme transaction serveur
- ce point ne clot pas encore le sujet global "edition transactionnelle de toute la composition du formulaire", mais les flows `question`/`answer` embarquent maintenant bien le contexte `formVersionId` dans le workflow back-office contextualise

Taches de planification:

- [x] Apres modification effective d'un formulaire verrouille, publier la nouvelle version via une commande backend unique explicite qui depublie l'ancienne dans le meme flux serveur.
- [x] Encapsuler la depublishation des anciennes versions et la publication de la nouvelle dans une transaction serveur unique.
- [x] Conserver la regle metier selon laquelle la campagne ne sert que la version publiee du formulaire.
- [x] Ajouter au niveau base de donnees une contrainte garantissant "au plus une version publiee non supprimee par `form_id`" (index unique conditionnel ou mecanisme equivalent selon le SGBD).
- [x] En cas de timeout ou d'erreur reseau cote client apres tentative de publication, recharger l'etat serveur avant toute nouvelle action au lieu de rejouer des sous-requetes de publication.

### 5.4 Point desormais evite: fork + publication dans un seul update

Dans `FormVersionBusiness.update(...)`, quand la version source est verrouillee, le backend fait toujours un auto-fork pour l'edition standard. En revanche, la publication ne transite plus par ce meme endpoint.

L'hypothese d'audit precedente etait la suivante: si la version source etait deja publiee, et que l'utilisateur demande dans la meme operation que la nouvelle version soit publiee, la logique peut retomber sur l'etat du brouillon nouvellement cree au lieu d'honorer la demande.

Point cle releve historiquement:

- `publishedToApply = entityToSave.getIsPublished();`

Comme `entityToSave` est le nouveau brouillon cree par fork, sa valeur publiee par defaut est `false`.

Risque metier potentiel avant durcissement du workflow:

- l'utilisateur pense valider une nouvelle version publiee
- le backend peut en realite conserver cette nouvelle version non publiee

Statut de ce point:

- reproduction ciblee effectuee sur `FormVersionBusiness.update(...)`
- anomalie confirmee puis corrigee, puis surtout contournee au niveau workflow: le back-office ne publie plus via `update(...)`, mais via une action backend dediee `publish`
- le risque "fork + publication dans le meme update" n'est donc plus un chemin fonctionnel normal expose au back-office

Taches de planification:

- [x] Reproduire ce cas avec un test cible pour confirmer si la demande `isPublished = true` est bien perdue pendant l'auto-fork.
- [x] Sortir ensuite la publication du flux `update(...)` pour la faire passer par une commande metier dediee, et ne plus dependre d'un couplage implicite entre fork et publish.

### 5.5 Une version vide peut etre publiee

Dans `validateFormVersionCanBePublished(...)`, si la version n'a aucune ligne `form_questions`, la methode retourne sans erreur.

Effet metier:

- une version sans question peut devenir publiee
- elle peut alors devenir selectionnable pour les nouvelles candidatures

Ce n'est pas forcement un bug bloquant selon la strategie produit, mais c'est un risque fonctionnel net.

Taches de planification:

- [x] Interdire la publication d'une version sans aucune question active rattachee.

### 5.6 `campaignId` doit sortir de `form`; `isTimed` reste global sur le formulaire partage

Les champs `formName`, `formDesc`, `isActive`, `campaignId` et `isTimed` vivent aujourd'hui sur l'entite `form`.

Clarification produit desormais retenue:

- `formName`, `formDesc` et `isActive` restent des metadonnees globales du `Form`
- `isTimed` reste lui aussi un attribut global du formulaire partage
- le rattachement campagne-formulaire ne doit plus etre porte par `form.campaign_id`, mais par une liaison explicite `campaign_form`
- la publication reste globale par `Form`, pas par couple (`campaign`, `form`)
- si une campagne doit diverger du formulaire partage, la duplication du `Form` devient une action explicite de branche

Constat technique actuel:

- `FormBusiness` et `FormRepository` travaillent encore directement sur `form.campaignId`
- `FormBusiness` bloque maintenant la mutation directe de `campaignId` sur un `form` deja verrouille afin d'eviter une derive retroactive d'historique
- ce garde-fou est utile dans le modele actuel, mais il reste transitoire car la cible n'est plus la mutation controlee de `campaignId` ; c'est la disparition de ce champ du coeur metier

Consequences de modele:

- rattacher un `Form` existant a une nouvelle `Campaign` ne doit plus voler le formulaire a sa campagne actuelle ni creer automatiquement `Form2`
- detacher un formulaire d'une campagne doit supprimer une ligne de liaison, pas mettre `campaignId = 0` sur le `Form`
- une campagne qui veut sortir du cycle de publication partage doit dupliquer explicitement le formulaire puis lier cette copie a elle seule
- les dependances metier qui validaient historiquement `campaign -> form` par lecture directe de `form.campaignId` devront verifier l'existence du lien actif dans `campaign_form`

Statut intermediaire deja valide:

- `FormBusiness.update(...)` continue d'autoriser en place `formName`, `formDesc` et `isActive`, y compris quand le `form` porte deja une `form_version` verrouillee
- `FormBusiness` bloque maintenant les mutations directes de `campaignId` sur un `form` deja verrouille
- `FormBusiness` bloque maintenant aussi toute mutation en place du chronometrage effectif d'un `form` deja verrouille lorsqu'elle reecrirait l'historique via le modele actuel
- le back-office `campaign-form` attache et detache maintenant ses formulaires via une commande backend dediee `syncCampaignLinks` qui ecrit `campaign_form` sans reecrire `form.campaignId`
- la fiche campagne autorise maintenant la selection d'un formulaire deja lie a une autre campagne sans supprimer implicitement ses autres liens actifs
- ces garde-fous securisent l'etat present, mais ils doivent disparaitre une fois la liaison `campaign_form` devenue l'abstraction proprietaire du rattachement campagne-formulaire

Taches de planification:

- [x] Formaliser que `formName`, `formDesc` et `isActive` sont non versionnants et restent modifiables en place sur `form`.
- [x] Bloquer transitoirement toute mutation directe de `campaignId` sur un `form` deja verrouille tant que le modele cible n'est pas migre.
- [x] Bloquer transitoirement toute mutation en place du chronometrage effectif d'un `form` deja verrouille lorsqu'elle reecrirait l'historique via le modele actuel.
- [x] Sortir `campaignId` de `form` et introduire une entite de liaison explicite `campaign_form`.
- [x] Backfiller `campaign_form` depuis `form.campaign_id`, puis migrer progressivement les lectures/ecritures metier vers cette liaison.
- [x] Remplacer les operations d'attache/detache campagne <-> formulaire qui passent aujourd'hui par `FormBusiness.update(...)` et `form.campaignId` par des commandes dediees sur `campaign_form`.
- [x] Formaliser que `isTimed` reste un attribut global du `Form` partage; si une seule campagne doit diverger, elle doit dupliquer explicitement le `Form`.
- [x] Supprimer ensuite les garde-fous transitoires de `FormBusiness` lies a la mutation directe de `campaignId` quand plus aucun flux ne depend de `form.campaign_id` : les CRUD generiques `form` n'interpretent plus `campaignId` comme un champ metier et ne synchronisent plus `campaign_form`; seules les commandes dediees `syncCampaignLinks` et `duplicateForCampaign` portent maintenant les liaisons campagne-formulaire.

### 5.7 Cas no-op: l'utilisateur ouvre la modification mais ne change rien

Le comportement cible demande qu'aucun fork ne soit cree si la modification finale ne differe en rien de la version actuelle.

Taches de planification:

- [x] Calculer un diff canonique entre la version persistée et le payload final avant tout fork.
- [x] Si aucun ecart effectif n'est detecte, ne creer aucun fork et laisser la version courante intacte.

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

Statut intermediaire deja valide:

- une fois la question isolee sur un brouillon via `duplicateQuestion`, le lien `form_questions` du brouillon pointe bien vers une nouvelle copie conservant le meme `question_ref`
- tant que cette copie n'est rattachee qu'a un brouillon deverrouille, une modification structurelle ulterieure, y compris un revert du texte vers la valeur d'origine, se fait en place sur cette copie sans creer de troisieme ligne
- cela valide la regle cible `Form v2` + meme `question_ref` logique pour le cas de revert sur brouillon deja isole

Taches de planification:

- [x] Valider comme regle metier le fait qu'un revert sur brouillon non utilise reste dans `Form v2` avec le meme `question_ref` logique.
- [x] Ne creer une nouvelle copie de question que lorsqu'un nouveau diff effectif apparait sur une question deja figee par un formulaire verrouille. Le workflow contextualise compare maintenant l'etat initial et l'etat final avant d'isoler la question, puis reutilise en place la copie deja rattachee au brouillon tant qu'aucune nouvelle isolation n'est necessaire.

### 5.9 Chemins d'administration qui contournent les garde-fous standards

Constat technique:

- les endpoints standards `create/update/delete/getByCriteria` passent par `ControllerFactory` puis `BusinessFactory`, avec verification de permission fonctionnelle et transaction generique
- en revanche, `formversion/updateAll`, `formversion/updateDeleted` et `formversion/custom` appellent directement `FormVersionBusiness`
- le meme pattern existe aussi sur des surfaces qui touchent directement l'historique de quiz: `formquestions/updateAll`, `formquestions/updateDeleted`, `question/updateAll`, `question/updateDeleted`, `answer/updateAll`, `answer/updateDeleted`

Effet metier:

- un utilisateur avec le role HTTP autorise peut atteindre des chemins de mutation qui n'appliquent pas le meme controle fonctionnel fin que les routes CRUD standards
- certaines protections metier "version verrouillee" ou "question non editable" sont implementees dans `update/delete` mais pas reprises dans `updateAll/updateDeleted`
- le back-office dispose donc encore de chemins de contournement capables d'alterer des snapshots historiques que le workflow nominal cherche pourtant a proteger

Taches de planification:

- [x] Aligner `updateAll`, `updateDeleted` et `custom` sur la meme enveloppe de permission fonctionnelle et de transaction que `create/update/delete`.
- [x] Rejouer dans les chemins bulk/restore les memes garde-fous metier que dans les chemins standards pour `form_version`, `form_questions`, `question` et `answer`.
- [x] Supprimer du back-office les routes bulk dangereuses pour les entites versionnees, ou les reserver a un outillage technique tres controle. Les services front des entites versionnees (`form-version`, `form-questions`, `question`, `answer`) passent desormais par des mutations mono-element (`create/update/delete`, `restore` via `update`, et `custom` cible), sans exposition UI de `updateAll`/`updateDeleted`.

### 5.10 Numerotation de version insuffisamment protegee

Constat technique:

- `createForkedVersion(...)` cree `versionNumber + 1` sans verrou metier explicite sur le formulaire source
- `FormVersionBusiness.create(...)`, `updateAll(...)` et `updateDeleted(...)` peuvent aussi fixer un `versionNumber` arbitraire
- `form_version` ne declare aujourd'hui aucune unicite sur le couple (`form_id`, `version_number`)

Effet metier:

- deux forks concurrents ou une creation manuelle admin peuvent produire plusieurs lignes portant le meme numero de version pour un meme formulaire
- si la contrainte ne couvre que les lignes actives, une suppression logique peut aussi liberer a tort un numero de version puis creer un conflit au moment d'une restauration
- le numero de version cesse alors d'etre une reference fiable pour l'historique, l'affichage, l'audit et les operations de restauration

Taches de planification:

- [x] Ajouter une contrainte d'unicite sur (`form_id`, `version_number`) pour toutes les lignes `form_version`, y compris celles supprimees logiquement, ou un mecanisme equivalent selon le SGBD.
- [x] Considerer explicitement que la suppression logique ne libere jamais un `versionNumber` deja attribue.
- [x] Valider cote serveur l'unicite du numero de version avant toute creation ou restauration, sans renumerotation implicite lors d'un restore.
- [x] Interdire la creation manuelle libre de `form_version` hors creation initiale `v1` et hors commande de fork controlee.

Alignement d'interface deja applique:

- la page back-office `form_version` n'expose plus de creation manuelle libre ; l'admin doit passer par la version initiale creee automatiquement ou par l'action de fork controlee

### 5.11 `question_ref` n'est pas encore une identite logique suffisamment fiable

Constat technique:

- la duplication ciblee de question reutilise bien le meme `question_ref`
- mais `QuestionBusiness.create(...)` accepte un `questionRef` fourni par le client et ne genere un UUID que s'il est absent
- `QuestionBusiness.update(...)`, `updateAll(...)` et `updateDeleted(...)` autorisent encore la modification directe de `questionRef`

Effet metier:

- tant que `question_ref` reste librement editable, il ne peut pas jouer de facon fiable le role d'identifiant logique de version de question
- un admin peut casser la filiation metier d'une question sans passer par le workflow de duplication

Taches de planification:

- [x] Faire de `question_ref` un champ gere par le serveur et non editable par les CRUD generiques.
- [x] Reserver la reutilisation d'un `question_ref` existant aux seules commandes metier de duplication/versionnement.
- [x] Definir une strategie de reparation des donnees si des `question_ref` incoherents existent deja. Voir `QUESTION_REF_REPAIR_STRATEGY.md` pour le diagnostic SQL, la classification des anomalies (`ref` manquant, split artificiel, fusion parasitee) et la procedure de correction ciblee.

### 5.12 Le chronometrage n'est pas encore snapshotte au bon niveau

Constat technique:

- le temps quiz d'une candidature est recalcule a partir de `application.formVersion.form`, des `form_questions` et de la campagne courante
- `FormBusiness.calculateTotalTimeAllowed(...)` depend encore de `campaign.timeAllForms` et de `form.isTimed`
- `CampaignsBusiness` peut activer `timeAllForms`, mais le chronometrage effectif est desormais consomme au runtime via `campaign.timeAllForms` sans reecriture persistante des lignes `form`

Effet metier:

- une modification tardive de `campaign.timeAllForms` ou de `form.isTimed` peut changer retroactivement le caractere chronometre d'un quiz deja attribue
- l'historique applicatif reste bien rattache a `formVersion`, mais le comportement temporel n'est pas encore fige comme un vrai snapshot

Statut intermediaire deja valide:

- `CampaignsBusiness` bloque maintenant toute mutation en place de `campaign.timeAllForms` lorsqu'il existe deja des candidatures rattachees a une `form_version` de cette campagne
- ce garde-fou conservative empeche de reecrire retroactivement le chronometrage via la campagne, sans pretendre encore versionner ce parametre

Clarification d'architecture desormais retenue:

- `campaign.timeAllForms` reste un parametre de campagne
- `form.isTimed` reste un attribut global du formulaire partage
- si une seule campagne doit diverger sur le timing, elle doit dupliquer explicitement le `Form`

Correction appliquee sur ce point critique:

- `CampaignsBusiness` n'appelle plus `formBusiness.applyCampaignTimeAllForms(...)` lors des mutations de campagne
- `FormBusiness.applyTimingInheritance(...)` ne persiste plus `campaign.timeAllForms` dans `form.isTimed`
- le chronometrage effectif reste calcule via `campaign.timeAllForms` ou `form.isTimed`, puis snapshotte au niveau candidature/quiz

Effet metier complementaire:

- une campagne ne peut plus forcer retroactivement `form.isTimed` sur un formulaire partage simplement en activant `timeAllForms`
- la cible `campaign_form` conserve bien `campaign.timeAllForms` comme override de campagne consomme au runtime/snapshot, sans reecriture persistante du `Form` partage

Taches de planification:

- [x] Snapshotter sur la candidature ou au demarrage du quiz le mode chronometre effectif et le `totalTimeAllowed` calcule.
- [x] Choisir a minima une regle conservative pour `campaign.timeAllForms`: interdire son changement lorsqu'il existe deja des candidatures utilisant ces formulaires.
- [x] Formaliser en UX et en metier que `form.isTimed` reste partage entre toutes les campagnes liees a un meme `Form`, et que toute divergence par campagne passe par une duplication explicite du `Form`.
- [x] Supprimer la propagation persistante `campaign.timeAllForms -> form.isTimed` (`applyCampaignTimeAllForms` / `findByCampaignId`) au profit d'un override de campagne calcule sans reecrire le `Form` partage.

### 5.13 Protection serveur incomplete des versions deja utilisees

Constat technique:

- `DashboardController` considere deja qu'une `form_version` peut avoir des dependances critiques de type `applications`
- pourtant `FormVersionBusiness.delete(...)` ne verifie pas explicitement l'existence de candidatures; la protection actuelle depend surtout du fait que des `form_questions` existent encore
- de plus, `updateAll/updateDeleted` sur `form_version`, `form_questions`, `question` et `answer` ne reprennent pas les verifications de verrouillage utilisees dans les chemins standards

Effet metier:

- l'integrite de l'historique repose encore en partie sur les garde-fous du dashboard, sur la presence des lignes `form_questions`, et sur le bon usage des bons endpoints
- le serveur ne protege pas encore de facon uniforme toutes les mutations qui pourraient casser une version deja utilisee par des candidats

Taches de planification:

- [x] Interdire serveur-side toute suppression, restauration ou mutation structurelle d'une `form_version` deja referencee par au moins une candidature.
- [x] Interdire dans les endpoints bulk/restore les modifications de `form_questions`, `question` et `answer` lorsqu'ils participent a une version verrouillee ou deja utilisee.
- [x] Ne plus considerer le pre-check du dashboard comme un garde-fou suffisant: les invariants doivent etre verifies par le backend lui-meme.

### 5.14 Ordre des questions encore partiellement normalise

Constat technique:

- `form_questions` garantit maintenant l'unicite de (`form_version_id`, `question_order`) parmi les seules lignes actives
- lors d'une suppression logique d'une ligne active, le backend recompacter maintenant les `questionOrder` restants de la version pour eviter les trous persistants
- lors d'un `update(...)` sur une ligne active, le backend sait maintenant deplacer une question vers un ordre deja occupe en decalant les autres lignes actives de la meme version
- lors d'un `updateDeleted(...)` qui restaure une ligne supprimee logiquement, le backend sait maintenant la reinserer a son ordre cible en decalant les lignes actives qui occupent deja cette position
- en revanche, il n'existe pas encore de strategie homogène de normalisation pour les creations qui veulent s'inserer au milieu ou pour les mouvements cross-version plus exotiques

Effet metier:

- un delete sur une version brouillon ne laisse plus un `questionOrder` orphelin qui se propage ensuite dans la progression quiz
- un reordonnancement explicite ou une restauration ne se heurtent plus artificiellement a l'unicite d'ordre: le backend deplace maintenant les autres lignes pour conserver une sequence contigue
- mais la normalisation de l'ordre n'est pas encore completement definie pour toutes les creations avec insertion au milieu ou pour certains mouvements plus atypiques

Taches de planification:

- [x] Ajouter une contrainte d'unicite sur (`form_version_id`, `question_order`) pour les lignes non supprimees.
- [x] Faire en sorte qu'une ligne `form_questions` supprimee logiquement ne reserve plus indefiniment son `questionOrder` pour les futures lignes actives de la meme version.
- [x] Recompacter les `questionOrder` actifs apres suppression logique d'une ligne `form_questions`.
- [x] Permettre un reordonnancement explicite d'une ligne active vers un ordre deja occupe en decalant automatiquement les autres lignes actives de la meme version.
- [x] Permettre la restauration d'une ligne `form_questions` supprimee logiquement a un ordre occupe en decalant automatiquement les autres lignes actives de la meme version.
- [x] Definir une strategie de reindexation/normalisation de l'ordre lors des creations avec insertion au milieu et des mouvements cross-version plus atypiques : `FormQuestionsBusiness` reindexe maintenant aussi les creations inserees au milieu, les deplacements inter-version et les restaurations inter-version, en recompaquant la version source et en decalant la version cible pour conserver une sequence active contigue.

### 5.15 Affectation candidat et acces public bascules sur `campaign_form`

Constat technique:

- `ApplicationsBusiness.getPublishedFormVersionsForCampaign(...)` charge desormais les formulaires via `campaignFormRepository.findActiveFormsByCampaignId(...)`
- `ApplicationsBusiness.validateFormVersionMatchesCampaign(...)`, `ApplicationsBusiness.resolveSourceTokenFormVersion(...)` et `CampaignPublicAccessService.ensureFormAccessIsAvailable(...)` valident desormais l'existence d'un lien actif (`campaign_id`, `form_id`) dans `campaign_form`
- `CampaignPublicAccessService.campaignHasPublishedFormVersion(...)` repose lui aussi sur `campaign_form`

Effet metier:

- les candidatures et l'acces public peuvent maintenant consommer un `Form` partage des lors qu'un lien actif existe dans `campaign_form`
- la regle "une seule version publiee par `Form`" reste compatible avec la cible partagee et est bien conservee
- le prochain couplage a traiter pour ce domaine se situe maintenant dans `SourceTokenBusiness` et le back-office associe

Taches de planification:

- [x] Migrer les lectures `campaign -> forms` de `ApplicationsBusiness` et `CampaignPublicAccessService` vers `campaign_form`.
- [x] Valider le cas `SOURCE_TOKEN` via l'existence d'un lien actif (`campaign_id`, `form_id`) dans `campaign_form` plutot que via `form.campaignId`.
- [x] Conserver la publication au niveau `Form`, et non par campagne, pour que toutes les campagnes liees partagent la meme version publiee future.
- [x] Si la strategie `SEQUENTIAL` doit garder un ordre stable des formulaires par campagne, porter et consommer cet ordre sur `campaign_form.assignment_order`.

### 5.16 Le back-office campagne n'ecrit plus `form.campaignId` pour l'attache/detache, mais l'UX de partage reste incomplete

Constat technique:

- les lectures admin de formulaires par `campaignId` via `formService.getAllByCriteria({ campaignId })` sont maintenant compatibles avec `campaign_form`, car le critere backend `Form.campaignId` lit desormais les liens actifs `campaign_form`
- `saveCampaignForms(...)` appelle maintenant `formService.syncCampaignLinks(campaignId, formIds)`, qui delegue a une commande backend dediee `syncCampaignLinks` pour synchroniser `campaign_form`
- `isFormAvailableForSelection(...)` n'exclut plus un formulaire deja lie a une autre campagne ; seul le doublon local dans la selection courante reste filtre
- cette synchronisation renseigne aussi `campaign_form.assignment_order` suivant l'ordre courant des formulaires selectionnes

Effet metier:

- les lectures de formulaires lies n'oublient plus les formulaires partages deja rattaches via `campaign_form`
- l'attache/detache depuis la fiche campagne ne reecrit plus `form.campaignId` et ne retire plus implicitement les autres liens actifs du meme `Form`
- une campagne peut maintenant partager un formulaire existant avec une autre sans le "voler" a sa campagne precedente
- une page metier `dashboard/forms` existe maintenant pour consulter, creer, modifier, supprimer des formulaires et visualiser leurs versions sans passer par le CRUD technique
- une page technique `dashboard/entities/campaign-form` existe maintenant pour lister, creer et supprimer les liens actifs `campaign_form` via la synchronisation dediee deja en place
- l'UX n'affiche toutefois toujours pas la liste ou le nombre de campagnes liees, ni l'impact d'une publication sur un formulaire partage

Taches de planification:

- [x] Remplacer l'attache/detache formulaire <-> campagne par une commande backend et une methode service front dediees a `campaign_form`.
- [x] Autoriser la selection d'un formulaire deja lie a une autre campagne sans lui retirer ses liens existants.
- [x] Ajouter une page metier `dashboard/forms` pour la gestion courante des formulaires.
- [x] Ajouter une page technique `dashboard/entities/campaign-form` pour administrer les liens actifs `campaign_form`.
- [x] Afficher sur la fiche campagne et/ou formulaire la liste ou au moins le nombre de campagnes liees.
- [x] Conserver une action explicite `Dupliquer le formulaire` pour creer une branche independante lorsqu'une campagne doit diverger.
- [x] Ajouter une UX claire avertissant qu'une publication sur un formulaire partage impactera toutes les campagnes liees.

### 5.17 L'administration `source_token` est desormais explicite sur le couple campagne + formulaire

Constat technique:

- `SourceTokenBusiness` exige maintenant une campagne explicite pour associer un `formId` a un `source_token`
- `resolveSourceTokenForm(...)` et `ensureExistingFormMatchesCampaign(...)` valident desormais l'existence d'un lien actif (`campaign_id`, `form_id`) dans `campaign_form`
- le back-office `entities-source-tokens` expose maintenant un choix explicite de `campaignId` puis de `formId`, et charge les formulaires disponibles via `formService.getAllByCriteria({ campaignId })` desormais aligne sur `campaign_form`
- des tests cibles couvrent maintenant la creation et la mise a jour d'un `source_token` sur un `Form` partage
- `SourceTokenDto` conserve une nomenclature centree campagne (`campaignId`, `formId`), mais le CRUD n'infere plus la campagne depuis le formulaire

Effet metier:

- le backend `source_token` n'accepte plus de couple ambigu `form sans campaign` et valide correctement les couples (`campaign`, `form`) partageables via `campaign_form`
- l'ecran d'administration `source_token` peut maintenant creer et modifier un token avec un formulaire dedie partage, sans supposer qu'un formulaire "appartient" exclusivement a une campagne
- la regle metier visible devient cohérente: un token reste rattache a une campagne, et son formulaire dedie est valide via l'existence d'un lien actif dans `campaign_form`

Taches de planification:

- [x] Supprimer toute deduction implicite de `campaignId` depuis `formId` dans `SourceTokenBusiness` une fois `campaign_form` introduit.
- [x] Remplacer les validations `form -> campaign` de `SourceTokenBusiness` par une verification d'existence du lien actif (`campaign_id`, `form_id`) dans `campaign_form`.
- [x] Rendre le back-office `entities-source-tokens` compatible avec un formulaire partage via une selection explicite `campaignId` + `formId`.
- [x] Renommer ou enrichir plus explicitement `SourceTokenDto` et les criteres de recherche si l'equipe souhaite faire apparaitre le modele `campaign_form` dans le contrat d'administration : le DTO expose maintenant `campaignName`, `campaignFormLinkActive`, `linkedCampaignCount` et `formShared`, et le critere `formId` est disponible cote repository/service.
- [x] Ajouter des tests cibles couvrant la creation et la mise a jour d'un `source_token` pour un meme `Form` partage entre plusieurs campagnes.

### 5.18 Le cycle de vie campagne (publication, suppression, dependances dashboard) suppose encore une propriete exclusive des formulaires

Constat technique:

- `CampaignsBusiness.validateDraftPublication(...)` lit maintenant "au moins un formulaire rattache" via `campaign_form`
- `CampaignsBusiness.delete(...)` detache maintenant les liens actifs `campaign_form` avant soft-delete de la campagne et bloque explicitement les dependances metier restantes (`interviews`, `source_token`, historique applicatif)
- `DashboardController` construit maintenant les dependances `forms` d'une campagne via `campaign_form`, tout en gardant logiquement `sourceTokenRepository.findByCampaignId(...)` pour les tokens rattes a la campagne elle-meme

Effet metier:

- la publication d'une campagne ne declare plus a tort qu'aucun formulaire n'est lie lorsque seuls des liens `campaign_form` actifs existent
- la suppression d'une campagne n'efface plus les formulaires partages ; elle supprime leurs liens `campaign_form` et reste bloquee sur les dependances qui portent un historique ou un flux actif
- les popups de dependances dashboard et la suppression backend racontent maintenant la meme relation `campaign -> forms` via `campaign_form`

Taches de planification:

- [x] Migrer la regle "au moins un formulaire rattache" de `CampaignsBusiness` pour qu'elle lise `campaign_form` au lieu de `form.campaignId`.
- [x] Redefinir la semantique de suppression d'une campagne dans le modele partage: detacher les liens `campaign_form` sans supprimer les `Form`, puis expliciter les autres blocages restants (`source_token`, interviews, historique applicatif, etc.).
- [x] Migrer `DashboardController` et les checks de dependances campagne pour afficher les liaisons `campaign_form` au lieu d'une propriete exclusive `form -> campaign`.
- [x] Completer les tests de non-regression sur publication/suppression de campagne (cas non partages et blocages restants) : le test suite couvre maintenant la publication refusee sans lien `campaign_form` actif, ainsi que les blocages de suppression sur `interviews`, historique applicatif et `source_token`, en plus de la publication via `campaign_form` et de la suppression par detachement de liens actifs deja couvertes.

### 5.19 La phase transitoire de migration n'est pas encore suffisamment securisee

Constat technique:

- la strategie retenue passe par une phase de coexistence entre `form.campaign_id` et `campaign_form`
- pendant cette phase, plusieurs couches liront encore l'ancien champ alors que d'autres commenceront a utiliser la nouvelle liaison
- l'audit ne formalisait pas encore le controle de coherence ni le plan de validation/rollback de cette coexistence
- une partie du risque venait aussi du backfill initial: `V1_053` pouvait laisser des liens sans `assignment_order`, et `V1_054` ne reconciliat pas la projection legacy `form.campaign_id` a partir des liens actifs deja presents

Effet metier:

- sans source de verite explicite par phase, une divergence entre `form.campaign_id` et `campaign_form` peut produire des bugs discrets difficiles a diagnostiquer
- un backfill incomplet ou non idempotent peut laisser des campagnes sans formulaires visibles selon la couche qui lit les donnees
- la suppression prematuree de `form.campaign_id` sans verification de couverture risque de casser des parcours admin/publics encore residuels

Taches de planification:

- [x] Definir une source de verite explicite pour chaque phase de migration (`form.campaign_id`, double lecture, puis `campaign_form`) : dans la phase actuelle, `campaign_form` est la source de verite et `form.campaign_id` une projection de compatibilite.
- [x] Rendre le backfill `campaign_form` idempotent et ajouter des controles de coherence entre colonne legacy et nouvelle liaison tant que les deux coexistent : `V1_055__reconcile_campaign_form_backfill_and_legacy_projection.sql` reinjecte les liens actifs manquants de maniere idempotente, complete `assignment_order`/`search_string` quand necessaire, puis reprojette `form.campaign_id` depuis les liens actifs (`1` lien => campagne, `0`/`n>1` => `null`).
- [x] Prevoir une checklist de validation avant suppression de `form.campaign_id` : couverture des liens, absence d'orphelins, regression sur affectation/publication/back-office. Voir `CAMPAIGN_FORM_COEXISTENCE_CHECKLIST.md` pour les verifications SQL, les suites de tests minimales et les parcours metier a rejouer.
- [x] Prevoir un plan de rollback tant que la colonne legacy n'est pas encore retiree du schema. Voir `CAMPAIGN_FORM_COEXISTENCE_CHECKLIST.md` pour la reprojection legacy depuis `campaign_form`, le redeploiement compatible coexistence et les recontroles post-rollback.

## 6. Reponse Precise a la Question Produit

Question: si un formulaire dans une campagne a deja ete utilise par un candidat, est-ce que, quand on le modifie, le formulaire est correctement versionne, les questions dupliquees, et l'ancienne version mise a l'ecart pour que la campagne utilise la nouvelle version ?

Reponse courte sur l'etat actuel:

- formulaire correctement versionne: oui
- ancienne version preservee pour les anciennes candidatures: oui
- questions dupliquees automatiquement: non
- ancienne version mise a l'ecart pour les nouvelles candidatures: oui, mais seulement apres publication explicite de la nouvelle version; dans la cible `campaign_form`, cette publication s'appliquera ensuite a toutes les campagnes liees au meme `Form`
- bascule de publication fiable: oui via l'action backend explicite `publish`, qui depublie transactionnellement l'ancienne version avant de publier la nouvelle

## 7. Verdict Final

Le systeme actuel est bon sur la protection de l'historique et sur le versioning du formulaire lui-meme.

En revanche, il n'est pas encore transforme ni en commande unique de sauvegarde transactionnelle de toute la composition du formulaire, ni en modele de partage campagne-formulaire conforme a la cible `campaign_form`.

Le backend possede deja la bonne idee metier via `duplicateQuestionForVersion(...)` puis `ensureEditableQuestion(...)`, avec conservation du meme `question_ref`, et ce mecanisme est maintenant branche dans le workflow back-office des versions brouillon avec une whitelist metier effective sur les champs structurels.

Donc, dans l'etat actuel:

- le versioning formulaire est reel
- le versioning question au sens "meme `question_ref`, nouvelle copie isolee" existe et peut maintenant etre declenche manuellement ou automatiquement depuis le front sur un brouillon contextualise
- les parcours d'administration `source_token` et l'attache/detache du back-office campagne ne dependent plus de `form.campaign_id`, mais l'UX de partage campagne-formulaire reste encore a completer
- la divergence par campagne doit devenir une duplication explicite du formulaire partage, et non plus un arbitrage autour de la mutation directe de `campaignId`

## 8. Taches de Planification Prioritaires

- [x] Introduire `campaign_form` explicite et sortir `campaignId` de `form`.
- [x] Backfiller `campaign_form` depuis `form.campaign_id`, puis migrer les lectures backend `campaign -> forms` vers cette liaison.
- [x] Migrer `ApplicationsBusiness` et `CampaignPublicAccessService` vers `campaign_form`, y compris la validation `SOURCE_TOKEN` par lien actif (`campaign_id`, `form_id`).
- [x] Migrer `SourceTokenBusiness` pour supprimer la deduction implicite de campagne depuis le formulaire et valider le couple (`campaign`, `form`) via `campaign_form`.
- [x] Rendre le back-office `entities-source-tokens` compatible avec un formulaire partage via une selection explicite `campaign` + `form`.
- [x] Finaliser le sous-slice critique de suppression campagne via `campaign_form`: detacher les liens `campaign_form` et expliciter les blocages `interviews` / `source_token` / historique applicatif dans `CampaignsBusiness`.
- [x] Migrer `DashboardController` pour exposer les dependances `forms` d'une campagne via `campaign_form`.
- [x] Migrer le back-office campagne pour attacher/detacher via `campaign_form` et permettre le partage d'un formulaire existant.
- [x] Afficher les campagnes liees sur le back-office campagne et formaliser l'UX de partage/publication.
- [x] Faire de `campaign_form` la source de verite de la page `forms` pour l'affichage, la recherche et le filtre des campagnes liees, sans fallback silencieux sur `form.campaignId`.
- [x] Decoupler le CRUD metier de la page `forms` du rattachement campagne: la creation n'exige plus `campaignId`, l'edition n'envoie plus de mutation directe de liaison, et les liens se gerent via `campaign_form`.
- [x] Decoupler aussi le back-office technique `entities/forms` de la mutation directe `campaignId`: plus de champ d'edition, plus de colonne legacy affichee, et create/update nettoient maintenant `campaignId` des payloads envoyes au backend.
- [x] Nettoyer aussi l'etat local de `campaign-form` lors d'une duplication planifiee: la copie en attente ne reutilise plus `currentForm.campaignId` comme fallback local avant sauvegarde.
- [x] Supprimer la propagation persistante `campaign.timeAllForms -> form.isTimed` afin qu'un override de campagne n'ecrase plus un formulaire partage.
- [x] Si `SEQUENTIAL` doit etre stable par campagne, porter et consommer l'ordre sur `campaign_form.assignment_order`.
- [x] Definir la source de verite et les controles de coherence pendant la phase de coexistence entre `form.campaign_id` et `campaign_form` : `campaign_form` est prioritaire, et `form.campaign_id` est reprojete cote backend apres mutation des liens (`0`/`n>1` liens actifs => `null`, `1` lien actif => campagne correspondante).
- [x] Formaliser en UI/metier qu'une publication de formulaire partage impacte toutes les campagnes liees.
- [x] Valider la regle "pas de fork si aucun diff effectif".
- [x] Valider la regle "fork du formulaire verrouille uniquement si diff effectif".
- [x] Valider la regle "duplication selective des seules questions modifiees".
- [x] Formaliser que seuls `questionText`, `questionChrono`, `questionType`, `score`, reponses et correction provoquent une duplication de question.
- [x] Formaliser que `difficultyLevel`, `specialityId` et le commentaire additionnel ne provoquent pas de duplication de question.
- [x] Formaliser que `formName`, `formDesc` et `isActive` ne generent pas de nouvelle version.
- [x] Bloquer transitoirement tout changement du chronometrage effectif en place sur un `form` deja verrouille tant que le modele partage cible n'est pas completement migre.
- [x] Bloquer transitoirement tout changement direct de `campaignId` en place sur un `form` deja verrouille tant que le modele `campaign_form` n'est pas actif.
- [x] Formaliser que `form.isTimed` reste global au formulaire partage et que toute divergence par campagne passe par une duplication explicite du `Form` : `CampaignsBusiness` ne repropage plus `campaign.timeAllForms` vers `form.isTimed`, `FormBusiness` bloque les mutations de chronometrage effectif sur historique verrouille, l'UI signale l'impact d'un formulaire chronometre partage, et `duplicateForCampaign` cree une copie de `Form` qui emporte son propre `isTimed`.
- [x] Interdire strictement plus d'une version publiee d'un meme formulaire via le code et la base de donnees.
- [x] Interdire strictement plus d'une ligne `form_version` portant le meme `versionNumber` pour un meme `form`, y compris si l'une d'elles est supprimee logiquement.
- [x] Faire de `question_ref` un identifiant logique gere par le serveur et non modifiable par les CRUD generiques.
- [x] Definir une strategie de reparation des donnees si des `question_ref` incoherents existent deja. Voir `QUESTION_REF_REPAIR_STRATEGY.md`.
- [x] Aligner les endpoints `updateAll`, `updateDeleted` et `custom` sur les memes garde-fous de permission, de transaction et d'integrite que les endpoints standards.
- [x] Bloquer serveur-side toute mutation d'une version, d'une question, d'une reponse ou d'un lien de formulaire lorsqu'elle participe deja a un historique candidat protege.
- [x] Autoriser en place les seules metadonnees non structurelles sur `question`/`answer` (`difficultyLevel`, `specialityId`, commentaire additionnel) tout en continuant de bloquer les mutations structurelles sur contenu rattache a une version verrouillee.
- [x] Supprimer du back-office les routes bulk dangereuses pour les entites versionnees, ou les reserver a un outillage technique tres controle.
- [x] Snapshotter le chronometrage effectif (`timed`, `totalTimeAllowed`) au niveau candidature/quiz au lieu de le recalculer uniquement depuis l'etat courant `campaign/form`.
- [x] Bloquer a minima tout changement de `campaign.timeAllForms` lorsqu'il existe deja des candidatures rattachees a une `form_version` de cette campagne.
- [x] Garantir l'unicite de `questionOrder` parmi les lignes actives de chaque `form_version`, sans bloquer la reutilisation d'un ordre libere par soft-delete.
- [x] Recompacter les `questionOrder` actifs apres suppression logique d'une question de formulaire, pour conserver une progression quiz contigue.
- [x] Permettre qu'un changement explicite de `questionOrder` ou une restauration de ligne supprimee reordonnent proprement les autres lignes actives au lieu d'echouer sur une collision d'ordre.
- [x] Definir une strategie de reindexation/normalisation de l'ordre lors des creations avec insertion au milieu et des mouvements cross-version plus atypiques.
- [x] Interdire la publication d'une version vide.
- [x] Valider la regle de revert sur brouillon non utilise: resultat cible `Form v2` avec le meme `question_ref` logique.
- [x] Integrer la duplication ciblee de question dans le workflow front au lieu de laisser l'action backend orpheline.
- [x] Publier la nouvelle version via une commande backend unique transactionnelle qui depublie l'ancienne dans le meme flux serveur.
- [x] Recharger l'etat serveur apres erreur/timeout de publication cote client avant toute nouvelle action : `EntitiesFormVersionsComponent.publishVersion(...)` relance `loadItems()` aussi bien sur succes que sur erreur, et la regression frontend couvre explicitement le cas d'echec/timeout avec relecture de l'etat serveur autoritatif.

## 9. Statut

Audit initial, puis mise en oeuvre partielle des correctifs identifies.

Des modifications de code applicatif ont ete appliquees sur les points suivants:

- alignement des garde-fous bulk/admin sur les surfaces `form_version`, `form_questions`, `question` et `answer`
- durcissement de l'identite logique `question_ref` cote serveur
- snapshot du chronometrage effectif au niveau `applications`
- unicite de `versionNumber` par `form` et de `questionOrder` parmi les lignes actives de `form_version`
- unicite base et metier de la version publiee active par `form`
- interdiction de publier une version vide
- integration front de l'action `duplicateQuestion` sur les versions brouillon
- ajout du custom backend `ensureEditableQuestion` pour retourner soit la question d'origine quand aucune isolation n'est necessaire, soit une copie isolee conservee sous le meme `question_ref`
- assainissement du flow front d'edition `form_version` verrouillee pour ne plus fabriquer localement un faux fork (`versionNumber + 1`, depublish/unlock forces) avant l'appel backend
- retrait de `isPublished` du flux d'edition standard `form_version`, au profit d'une action backend explicite `publish` appelee depuis le back-office
- retrait du chemin de creation manuelle libre de `form_version` dans le back-office, avec garde-fou UI explicite vers le workflow de fork
- validation backend explicite du fait que `formName`, `formDesc` et `isActive` restent modifiables en place sur `form`, meme en presence d'une version verrouillee
- blocage serveur des mutations en place du chronometrage effectif d'un `form` lorsqu'une version verrouillee existe deja, y compris via un changement de `campaignId` qui ferait varier `campaign.timeAllForms`
- blocage serveur des mutations directes de `campaignId` sur `form` lorsqu'une version verrouillee existe deja, meme si le chronometrage effectif resterait identique
- blocage serveur des mutations en place de `campaign.timeAllForms` lorsqu'il existe deja des candidatures rattachees a une `form_version` de cette campagne
- clarification d'architecture actee: `campaignId` doit sortir de `form` vers une liaison `campaign_form`, et les garde-fous actuels de `FormBusiness` sur `campaignId` sont donc transitoires
- retrait du reliquat CRUD `form -> campaignId`: `FormBusiness.create/update/updateAll/updateDeleted` n'utilisent plus `campaignId` comme champ metier et ne reecrivent plus `campaign_form` hors commandes dediees
- clarification d'architecture actee: `form.isTimed` reste un attribut global du formulaire partage; une divergence par campagne devra passer par une duplication explicite du `Form`
- ajout de la fondation backend `campaign_form` avec migration Flyway `V1_053`, backfill depuis `form.campaign_id`, repository dedie et synchronisation transitoire depuis `FormBusiness`
- ajout d'une migration corrective `V1_054` pour backfiller les bases ou `V1_053` avait bien cree `campaign_form` mais n'avait rien insere a cause d'une comparaison SQL trop stricte entre `campaigns.is_deleted` (`tinyint`) et le litteral `b'0'`
- bascule des lectures backend `CampaignsBusiness`, `ApplicationsBusiness` et `CampaignPublicAccessService` vers `campaign_form`, y compris la validation `SOURCE_TOKEN` par lien actif (`campaign_id`, `form_id`)
- correction de `V1_053` pour aligner `campaign_form.search_string` sur le type SQL `TEXT`, suivie d'un `flyway:repair` local et d'une validation de demarrage backend jusqu'au passage effectif de la migration
- alignement du critere backend `Form.campaignId` sur `campaign_form` pour les lectures admin via `getAllByCriteria`, ce qui remet en coherence `campaign-form`, `campaign-detail` et les selecteurs `source_token` avec les formulaires partages
- bascule backend `SourceTokenBusiness` vers `campaign_form`: plus aucune deduction implicite de `campaignId` depuis `formId`, et validation du couple (`campaign`, `form`) via lien actif
- bascule du back-office `entities-source-tokens` vers une selection explicite `campagne + formulaire dedie`, avec affichage du formulaire lie dans la liste admin
- enrichissement additif du contrat admin `source_token`: `SourceTokenDto` expose maintenant aussi `campaignName`, `campaignFormLinkActive`, `linkedCampaignCount` et `formShared`, et le critere `formId` est pris en charge cote backend/service
- bascule de `DashboardController.checkDependencies(...campaigns...)` sur `campaign_form` pour les dependances `forms`
- bascule de `CampaignsBusiness.delete(...)` sur `campaign_form`: la suppression detache maintenant les liens actifs sans traiter les `Form` comme des enfants exclusifs, et bloque explicitement `interviews`, `source_token` et historique applicatif
- suppression du couplage legacy `campaign.timeAllForms -> form.isTimed`: `CampaignsBusiness` ne reecrit plus les `Form` partages et `FormBusiness` ne persiste plus l'heritage de timing depuis la campagne
- bascule du back-office `campaign-form` sur une commande backend `syncCampaignLinks` qui synchronise `campaign_form` sans passer par `FormBusiness.update(...)` ni reecrire `form.campaignId`
- ajout d'une page metier `dashboard/forms` pour le CRUD courant des formulaires et la visualisation de leurs versions
- ajout d'une page technique `dashboard/entities/campaign-form` qui agrege les liens actifs `campaign_form` depuis les APIs existantes et permet leur creation/suppression sans retour a `form.campaignId`
- constat de couplage restant: `FormRepository.findByCampaignId` expose encore un critere transitoire nomme `campaignId`, mais l'UX du partage affiche maintenant les campagnes liees, l'impact d'une publication partagee et une duplication explicite depuis la fiche campagne
- l'UX `dashboard/forms` explicite maintenant aussi que `form.isTimed` reste global aux campagnes liees et qu'une divergence de timing doit passer par une duplication explicite du formulaire
- distinction backend validee entre mutations structurelles et metadonnees non structurelles sur `question`/`answer` lies a une version verrouillee
- ajout du workflow front contextualise `form_version -> questions` avec ouverture automatique du modal, comparaison du diff structurel cote front, et appel conditionnel a `ensureEditableQuestion` avant la sauvegarde effective de la question et de ses reponses
- alignement de l'unicite `questionOrder` sur les seules lignes actives de `form_questions`, cote backend et base, afin qu'un ordre libere par soft-delete puisse etre reutilise sans conflit artificiel
- recompaction serveur des `questionOrder` actifs apres suppression logique d'une ligne `form_questions`, pour eviter qu'un trou d'ordre se propage dans les lectures triees et dans `quiz_level`
- normalisation serveur de `questionOrder` lors d'un reordonnancement explicite (`update`) ou d'une restauration (`updateDeleted`) afin de decaler automatiquement les autres lignes actives de la meme `form_version` au lieu de rejeter la mutation pour collision d'ordre

Validations ciblees deja appliquees:

- test backend du no-op sur `FormVersionBusiness.update(...)`
- test backend du rejet d'une tentative de publication via `FormVersionBusiness.update(...)` et du flux `custom publish` qui depublie l'ancienne version puis publie la nouvelle
- test backend du restore d'une version publiee supprimee logiquement sans double publication active
- tests backend cibles sur `QuestionBusiness` pour autoriser `difficultyLevel`/`specialityId` en place et continuer de bloquer `questionText` sur contenu lie a une version verrouillee
- tests backend cibles sur `AnswerBusiness` pour autoriser le commentaire additionnel en place et continuer de bloquer `answerText` sur contenu lie a une version verrouillee
- tests backend cibles sur `FormBusiness` pour valider que `formName`, `formDesc` et `isActive` restent modifiables en place, et pour bloquer un changement direct de `isTimed`, une reassociation directe de `campaignId`, ou un changement de campagne alterant le chronometrage effectif quand une version verrouillee existe deja, tout en autorisant encore les cas sans version verrouillee
- test backend cible sur `FormBusiness.custom("syncCampaignLinks")` pour verifier que la synchronisation campagne <-> formulaires met a jour `campaign_form` sans mutation du `Form` partage
- tests backend cibles sur `CampaignsBusiness` pour bloquer un changement de `timeAllForms` quand des candidatures sont deja rattachees a une `form_version` de la campagne, tout en autorisant encore le cas sans affectation candidate
- test backend du custom `duplicateQuestion` pour verifier l'isolation d'une copie de brouillon avec conservation du meme `question_ref` et duplication des reponses
- tests backend du custom `ensureEditableQuestion` pour couvrir a la fois le no-op quand aucune isolation n'est requise et la duplication lorsqu'une version verrouillee reference encore la question
- test backend du revert d'une question deja isolee sur brouillon deverrouille, en place et sans changement de `question_ref`
- test backend cible sur `FormQuestionsBusiness` pour verifier qu'un `questionOrder` deja porte par une ligne soft-delete ne bloque plus la creation d'une nouvelle ligne active dans la meme `form_version`
- test backend cible sur `FormQuestionsBusiness` pour verifier qu'une suppression logique recompacter bien les `questionOrder` actifs restants dans la meme `form_version`
- tests backend cibles sur `FormQuestionsBusiness` pour verifier qu'un `update(...)` deplace une ligne active vers un ordre occupe en decalant automatiquement les autres, et qu'un `updateDeleted(...)` restaure une ligne soft-delete a un ordre occupe en reordonnant proprement les lignes actives restantes
- specs frontend ciblees sur `entities-form-versions` pour verifier qu'une version verrouillee n'est plus pre-remplie avec un faux `versionNumber + 1`, que l'update n'envoie plus que les champs mutables hors publication (`isLocked`, `randomQuestions`), que la publication passe par l'action dediee `publish`, que l'etat serveur est recharge apres un echec de publication, que la creation manuelle est bloquee cote page, et que l'action d'edition contextualisee redirige bien vers la page `questions`
- spec frontend ciblee sur `forms` pour verifier que le warning `timing partage` n'apparait que lorsqu'un formulaire chronometre est lie a plusieurs campagnes
- spec frontend ciblee sur `forms` pour verifier que l'ecran n'infere plus de campagne liee depuis `form.campaignId` lorsqu'aucun lien `campaign_form` actif n'est charge
- specs frontend ciblees sur `forms` pour verifier que la creation et l'edition de formulaire n'exigent plus ni n'envoient `campaignId`, et deleguent les liaisons a l'ecran `campaign_form`
- spec frontend ciblee sur `entities/forms` pour verifier que les payloads create/update nettoient `campaignId` meme si un objet legacy en contient encore un
- spec frontend ciblee sur `campaign-form` pour verifier qu'une duplication planifiee ne conserve plus un `campaignId` legacy dans l'etat local quand la campagne n'est pas encore creee
- test backend cible sur `FormBusiness` pour verifier qu'un `create(...)` sans `campaignId` cree bien le formulaire et ne cree aucun lien `campaign_form` parasite
- tests backend cibles sur `FormBusiness` pour verifier qu'un `create(...)` ignore aussi un `campaignId` legacy et qu'une mise a jour de formulaire partage n'efface plus ses liens `campaign_form`
- validation SQL locale du backfill `campaign_form` apres `V1_054` : `flyway_schema_history` contient desormais `1.053` et `1.054` en succes, et les 3 formulaires legacy encore portes par `form.campaign_id` ont ete recopies dans `campaign_form`
- tests backend cibles sur `SourceTokenBusiness` pour exposer les metadonnees derivees de `campaign_form` (`campaignFormLinkActive`, `linkedCampaignCount`, `formShared`) et test repository `SourceTokenRepositoryCriteriaTest` pour le critere `formId`
- spec frontend ciblee sur `questions` pour verifier qu'une edition contextualisee depuis `form_version` appelle `ensureEditableQuestion` uniquement sur un diff structurel puis poursuit la sauvegarde sur la question isolee retournee
- build Angular cible du front apres bascule de `campaign-form` vers `formService.syncCampaignLinks(...)`
- build Angular cible du front apres ajout de `dashboard/forms` et `dashboard/entities/campaign-form`

Les points d'audit enumeres ci-dessus sont maintenant couverts. Les suites possibles relevent surtout d'un nettoyage legacy ulterieur (retrait final de la projection `form.campaign_id` quand le schema pourra l'abandonner) et d'une consolidation eventuelle vers une commande serveur unique pour sauver toute la composition d'un formulaire.
