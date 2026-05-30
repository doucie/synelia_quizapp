# Audit pipeline multi-occurrences

Date: 2026-05-30

## 1. Objet

Ce document répond à la question suivante:

- qu'est-ce qui empêche aujourd'hui d'avoir plusieurs entretiens, plusieurs évaluations ou plusieurs pré-sélections pour une même candidature
- qu'est-ce qui est déjà partiellement multi-occurrence dans le modèle
- quelle cible technique permettrait de rendre le pipeline réellement personnalisable, avec plusieurs événements et plusieurs scores

Conclusion courte:

- le produit sait déjà stocker plusieurs entretiens et plusieurs évaluations au niveau des tables métier
- en revanche, le moteur pipeline, l'éditeur de pipeline et plusieurs snapshots sur `applications` restent structurés autour d'une seule occurrence exploitable par `stageType`
- aujourd'hui, un pipeline personnalisé ne peut pas vraiment modéliser plusieurs rounds de même nature, car `INTERVIEW`, `EVALUATION` et `PRESELECTION` sont traités comme des singletons fonctionnels

## 2. Résumé exécutif

### 2.1 Ce qui est déjà possible

- plusieurs lignes `interviews` peuvent déjà exister pour une même candidature via `interviews.application_id`
- plusieurs liens `candidate_interview` peuvent déjà exister pour une même candidature via `candidate_interview.application_id`
- plusieurs lignes `evaluations` peuvent déjà exister pour un même `candidate_interview`
- le suivi candidature sait déjà retourner une liste de plusieurs entretiens

### 2.2 Ce qui bloque réellement le pipeline personnalisé

- l'éditeur pipeline interdit actuellement plusieurs étapes `INTERVIEW`, `EVALUATION` ou `PRESELECTION`
- la readiness front et backend rejette ces doublons
- l'API `pipelineStage` rejette aussi ces doublons
- le moteur runtime retrouve les progressions et les stages par `stageType` et prend le premier match
- les mises à jour de score et de mail sur le pipeline passent elles aussi par `stageType`
- la dérivation du statut application suppose une seule pré-sélection et une seule décision finale
- les snapshots `applications.interview_date`, `applications.interview_status` et certains agrégats de score restent mono-valeur

### 2.3 Conséquence produit

Le système supporte aujourd'hui plusieurs événements opérationnels de type entretien, mais pas plusieurs rounds pipeline de type entretien, évaluation ou pré-sélection.

Autrement dit:

- plusieurs entretiens peuvent exister dans les tables
- mais ils retombent tous sur la même étape pipeline `INTERVIEW`
- plusieurs évaluations peuvent exister sur un entretien
- mais elles sont agrégées dans un score unique côté interview, puis dans un score global unique côté application, puis dans un seul `ApplicationProgress` de type `INTERVIEW` ou `EVALUATION`

## 3. État actuel par couche

## 3.1 Éditeur pipeline et règles front

Les types intermédiaires sont explicitement marqués comme singletons côté front.

Preuves:

- `quizapp_front/src/app/core/models/pipeline.interfaces.ts`
  - `SINGLETON_INTERMEDIATE_STAGE_TYPES = ['QUIZ', 'PRESELECTION', 'INTERVIEW', 'EVALUATION']`
  - `getPipelineReadinessIssues(...)` remonte une erreur si l'un de ces types est présent plusieurs fois
- `quizapp_front/src/app/pages/dashboard/pipeline-template-edit/pipeline-template-edit.ts`
  - `addStage()` bloque l'ajout si tous les types intermédiaires singleton sont déjà utilisés
  - `getEditableStageTypeOptions(...)` masque les types déjà utilisés
- `quizapp_front/src/app/pages/dashboard/entities/solo/pipeline-stages/entities-pipeline-stages.ts`
  - la surface admin brute applique le même garde-fou

Impact:

- plusieurs rounds `INTERVIEW` sont impossibles à modéliser depuis l'éditeur
- idem pour plusieurs `EVALUATION`
- idem pour plusieurs `PRESELECTION`

## 3.2 Validation backend du pipeline

Le backend bloque aussi les doublons de type au niveau des `pipeline_stage`.

Preuves:

- `quizapp/src/main/java/tech/synelia/quizapp/business/PipelineStageBusiness.java`
  - `ensureSingletonStageTypeNotDuplicated(...)`
  - `isSingletonIntermediateStageType(...)` considère `QUIZ`, `PRESELECTION`, `INTERVIEW`, `EVALUATION` comme uniques
- `quizapp/src/main/java/tech/synelia/quizapp/business/PipelineTemplateBusiness.java`
  - `collectTemplateReadinessIssues(...)` remonte explicitement:
    - `QUIZ ne peut etre presente qu'une seule fois...`
    - `PRESELECTION ne peut etre presente qu'une seule fois...`
    - `INTERVIEW ne peut etre presente qu'une seule fois...`
    - `EVALUATION ne peut etre presente qu'une seule fois...`

Impact:

- même si l'UI était assouplie, l'API refuserait encore plusieurs rounds

## 3.3 Moteur pipeline runtime

Le point bloquant principal est ici: plusieurs services retrouvent un `ApplicationProgress` ou un `PipelineStage` par `stageType`, puis prennent le premier match.

### 3.3.1 Résolution du progrès par type

Preuves:

- `quizapp/src/main/java/tech/synelia/quizapp/business/ApplicationProgressBusiness.java`
  - `findProgressByStageType(Integer, String)` parcourt les progressions et retourne le premier `pipelineStage.stageType` correspondant
- `quizapp/src/main/java/tech/synelia/quizapp/business/ApplicationsBusiness.java`
  - même logique dans un autre helper `findProgressByStageType(Integer, String)`

Conséquence:

- si demain plusieurs `INTERVIEW` existent dans le pipeline d'une candidature, le moteur ne saura pas quel round manipuler
- il prendra le premier `INTERVIEW` trouvé
- idem pour `EVALUATION` et `PRESELECTION`

### 3.3.2 Synchronisation interview / évaluation

Preuve clé:

- `ApplicationProgressBusiness.syncInterviewEvaluationStages(...)`
  - charge `interviewProgress = findProgressByStageType(applicationId, 'INTERVIEW')`
  - charge `evaluationProgress = findProgressByStageType(applicationId, 'EVALUATION')`
  - met à jour un seul score d'entretien ou d'évaluation
  - résout ensuite une seule étape scorée

Conséquence:

- plusieurs entretiens terminés pour une même candidature ne peuvent pas alimenter plusieurs `ApplicationProgress` distincts de type `INTERVIEW`
- plusieurs rounds d'évaluation ne peuvent pas être distingués
- le score pipeline reste mono-instance par type

### 3.3.3 Emails de stage par type

Preuves:

- `ApplicationProgressBusiness.markStageMailSentByStageType(...)`
- `ApplicationProgressBusiness.clearStageMailSentByStageType(...)`
- ces méthodes retombent elles aussi sur `findProgressByStageType(...)`

Conséquence:

- si plusieurs rounds `INTERVIEW` existent un jour, le marquage du mail envoyé deviendra ambigu

## 3.4 Services métier entretien / décision

### 3.4.1 Entretiens

Preuves:

- `InterviewsBusiness.resolveInterviewPipelineStage(...)`
  - retourne `pipelineStageRepository.findByTemplateIdAndStageType(templateId, 'INTERVIEW')`
- `PipelineStageRepository.findByTemplateIdAndStageType(...)`
  - retourne un seul `PipelineStage`

Conséquence:

- toutes les invitations et tous les mails d'entretien sont actuellement rattachés à une seule étape `INTERVIEW` par template
- même si plusieurs lignes `interviews` existent, elles pointent conceptuellement vers la même étape pipeline

### 3.4.2 Pré-sélections et décisions

Preuves:

- `DecisionType.java`
  - seulement quatre types: `PRE_SCREEN_ACCEPTED`, `PRE_SCREEN_REJECTED`, `FINAL_ACCEPTED`, `FINAL_REJECTED`
  - `getPipelineStageType()` renvoie seulement `PRESELECTION` ou `DECISION`
- `DecisionBusiness.resolveDecisionPipelineStage(...)`
  - résout un unique `PipelineStage` via `findByTemplateIdAndStageType(...)`

Conséquence:

- le modèle décisionnel actuel n'a pas la notion de pré-sélection round 1, round 2, round 3
- plusieurs décisions peuvent être stockées en table `decisions`, mais elles sont toutes rabattues sur une seule étape `PRESELECTION` ou `DECISION`

## 3.5 Modèle de données

## 3.5.1 Ce qui est déjà multi-occurrence

### Entretiens

- `Interviews` contient un `ManyToOne` vers `Applications`
- `CandidateInterview` contient un `ManyToOne` vers `Applications`
- `CandidateInterviewRepository.findByApplicationId(...)` renvoie bien une liste
- `ApplicationsBusiness.buildTrackedInterviews(...)` renvoie déjà une liste d'entretiens pour une candidature

Conclusion:

- le domaine sait déjà représenter plusieurs événements entretien pour une candidature

### Évaluations

- `Evaluations` contient un `ManyToOne` vers `CandidateInterview`
- `EvaluationsRepository.findByCandidateInterviewId(...)` renvoie une liste
- `EvaluationsBusiness.create(...)` accepte plusieurs évaluations pour un même `candidateInterview`

Conclusion:

- le domaine sait déjà représenter plusieurs notes / évaluations pour un même entretien

## 3.5.2 Ce qui reste mono-valeur ou agrégé

### ApplicationProgress

- `application_progress.score` est une seule valeur par ligne de progression
- tant qu'il n'existe qu'une seule ligne `INTERVIEW` / `EVALUATION` / `PRESELECTION` exploitable, il n'y a qu'un score pipeline par type

### Applications

`Applications` contient encore des snapshots mono-valeur ou des agrégats globaux:

- `interviewDate`
- `interviewStatus`
- `totalEvaluationScore`
- `totalEvaluationNumber`
- `totalEvaluationPercentage`
- `quizScore`, `quizScorePercent`

Conséquence:

- plusieurs entretiens n'ont pas un historique pipeline par round au niveau `applications`
- plusieurs évaluations sont réduites à un agrégat global candidature
- si le produit veut plusieurs scores par étape répétée, il faut arrêter d'utiliser `applications` comme source métier détaillée

### Interviews

`Interviews` contient aussi des agrégats:

- `evaluationScore`
- `evaluationNumber`
- `evaluationPercentage`

Conclusion:

- plusieurs évaluations pour un même entretien sont déjà supportées, mais elles sont consolidées en un score d'entretien unique
- c'est utile, mais insuffisant pour un pipeline à rounds multiples si chaque round doit avoir sa propre progression et sa propre décision

## 3.6 Statut application dérivé

Preuve:

- `ApplicationProgressBusiness` dérive le statut application ainsi:
  - si échec terminal sur `DECISION` -> `FINAL_REJECTED`
  - si échec terminal sur `PRESELECTION` -> `PRE_SCREEN_REJECTED`
  - si toutes les étapes sont résolues -> `FINAL_ACCEPTED`
  - si pré-sélection passée -> `PRE_SCREEN_ACCEPTED`
  - si étape courante `INTERVIEW` ou `EVALUATION` -> `INTERVIEWING`

Conséquence:

- la sémantique produit actuelle suppose un seul passage de pré-sélection puis une phase d'entretien/évaluation puis une décision finale
- plusieurs rounds de pré-sélection ou plusieurs familles de décision ne sont pas distingués

## 4. Ce qui empêche actuellement plusieurs entretiens

Réponse précise:

Ce n'est pas la base `interviews` qui empêche plusieurs entretiens. Elle les permet déjà.

Ce qui bloque réellement plusieurs entretiens utiles dans le pipeline, c'est:

- l'interdiction de mettre plusieurs étapes `INTERVIEW` dans le pipeline
- la résolution d'une seule progression `INTERVIEW` par candidature
- la résolution d'une seule étape `INTERVIEW` par template pour les mails et l'orchestration
- l'agrégation de toutes les évaluations et de tous les entretiens vers un score global unique côté pipeline

En pratique, aujourd'hui:

- on peut créer plusieurs interviews
- mais on ne peut pas dire clairement quel interview correspond à quel round pipeline
- on ne peut pas avoir `Entretien RH`, `Entretien manager`, `Entretien CTO` comme trois étapes `INTERVIEW` distinctes pilotées proprement par le moteur

## 5. Ce qui empêche actuellement plusieurs évaluations

Il faut distinguer deux cas.

### Cas A: plusieurs évaluations sur un même entretien

C'est déjà largement supporté:

- plusieurs `Evaluations` pour un même `CandidateInterview`
- agrégation vers `Interviews.evaluation*`
- puis agrégation vers `Applications.totalEvaluation*`

### Cas B: plusieurs rounds d'évaluation dans le pipeline

Ce n'est pas correctement supporté aujourd'hui:

- le pipeline n'autorise qu'une seule étape `EVALUATION`
- `syncInterviewEvaluationStages(...)` ne manipule qu'un seul `evaluationProgress`
- le modèle `Evaluations` exige un `candidateInterviewId`, donc l'évaluation reste structurellement liée à un entretien

Conséquence:

- une `EVALUATION` standalone non liée à un entretien n'a pas de vraie entité opérationnelle dédiée
- répéter `EVALUATION` comme étape pipeline demanderait de rattacher les scores à un `ApplicationProgress` spécifique ou d'introduire une entité de session d'évaluation dédiée

## 6. Ce qui empêche actuellement plusieurs pré-sélections

Les blocages sont plus forts ici.

- le pipeline n'autorise qu'une seule étape `PRESELECTION`
- `DecisionType` ne connaît qu'une seule famille `PRE_SCREEN_*`
- `DecisionBusiness` rattache toute décision de pré-sélection à l'unique étape `PRESELECTION`
- le statut application (`PRE_SCREEN_ACCEPTED`, `PRE_SCREEN_REJECTED`) suppose une seule phase de pré-sélection

Conséquence:

- plusieurs décisions de pré-sélection peuvent être enregistrées en table `decisions`
- mais il n'existe pas de notion stable de round de pré-sélection 1, 2, 3
- le pipeline ne sait pas les distinguer ni les scorer séparément

## 7. Cible produit consolidee

Les arbitrages BA recus le 2026-05-30 changent sensiblement la cible initiale.

La refonte ne doit pas seulement couvrir plusieurs entretiens. Elle doit couvrir un pipeline structurellement capable d'enchainer plusieurs `QUIZ`, plusieurs `PRESELECTION` et plusieurs `INTERVIEW` dans un meme template, pour toutes les campagnes.

En revanche, l'evaluation n'est pas souhaitee comme une etape pipeline autonome. Le besoin produit est le suivant:

- un entretien reste un entretien
- chaque entretien est obligatoirement associe a une logique d'evaluation
- cette evaluation peut exiger un score, un avis texte, ou les deux
- plusieurs evaluateurs peuvent intervenir sur un meme entretien
- plusieurs evaluations detaillees peuvent donc exister pour un meme entretien

Autrement dit, la cible produit n'est pas "plusieurs etapes `EVALUATION`" mais plutot "un sous-workflow d'evaluation embarque dans chaque etape `INTERVIEW`".

## 7.1 Portee fonctionnelle cible

- plusieurs `QUIZ` dans un meme pipeline
- plusieurs `PRESELECTION` dans un meme pipeline
- plusieurs `INTERVIEW` dans un meme pipeline
- plusieurs evaluations detaillees par entretien
- aucune creation de round supplementaire hors pipeline pour un candidat isole
- un meme moteur doit supporter des campagnes simples et des campagnes complexes

Exemple de pipeline explicitement souhaite:

- `QUIZ 1`
- `screening automatique` base sur le score du quiz
- `INTERVIEW manager` avec evaluation et validation humaine
- `QUIZ 2`
- `PRESELECTION humaine`
- `INTERVIEW M. Konan` avec evaluation
- `DECISION finale`

## 7.2 Definition d'un round

Le round est principalement defini par son ordre dans le pipeline, pas par un type fonctionnel propre a la plateforme.

Regles cibles:

- l'ordre (`stageOrder`) porte la notion de round
- le libelle sert a la comprehension metier, mais ne doit pas etre la cle fonctionnelle du round
- il n'existe pas de nomenclature standard de types d'entretien a gerer par la plateforme
- le nombre de rounds doit etre libre
- les libelles de stages actifs d'un meme template devraient idealement rester distincts pour eviter les ambiguities UX, meme si le round n'est pas defini par ce libelle

## 7.3 Politique de modification du pipeline

Le besoin exprime n'inclut pas l'ajout manuel d'un round au runtime pour un seul candidat.

Le produit veut rester structurel:

- on modifie le pipeline du template ou de la campagne
- on ne cree pas un round supplementaire ad hoc sur un candidat seul
- le produit penche plutot vers un durcissement du verrouillage des pipelines utilises par des campagnes en cours

Cela renforce le besoin de definir une politique claire sur les templates rattaches a des campagnes ouvertes ou deja utilisees.

## 8. Proposition de cible technique ajustee

## 8.1 Matrice cible de repetabilite

Singleton conserves:

- `CANDIDATURE`
- `DECISION`

Repeatable a autoriser:

- `QUIZ`
- `PRESELECTION`
- `INTERVIEW`

Traitement specifique:

- `EVALUATION` ne doit plus etre pensee comme une etape pipeline autonome de premier niveau dans la cible produit
- l'evaluation devient un sous-modele rattache a l'entretien

## 8.2 Principe d'architecture

Il faut sortir de la logique "je retrouve une etape par `stageType`" et passer a la logique "je manipule une occurrence precise d'etape/progression".

Cible:

- `pipeline_stage` reste la definition d'une etape de template
- `application_progress` represente l'occurrence precise de cette etape pour une candidature
- tout objet metier runtime doit se rattacher a cette occurrence precise, pas seulement a un type generique

## 8.3 Changement structurel cle

Introduire un rattachement explicite des objets metier a `application_progress`.

Recommandation:

- ajouter `application_progress_id` dans `interviews`
- ajouter `application_progress_id` dans `decisions`
- conserver `evaluations -> candidateInterview -> interview`, mais garantir que l'entretien lui-meme pointe vers l'occurrence pipeline exacte

Pourquoi `application_progress_id` est la bonne cle:

- elle identifie la candidature et l'occurrence exacte du round
- elle supprime les ambiguities quand plusieurs `QUIZ`, `PRESELECTION` ou `INTERVIEW` existent
- elle permet de suivre correctement la chronologie du candidat sans s'appuyer sur un `stageType` unique

## 8.4 Quiz multiples

La cible produit inclut plusieurs quiz dans un meme pipeline.

Implications:

- il faut autoriser plusieurs `QUIZ` dans le template
- chaque quiz garde sa propre config (`passingScore`, quiz associe, mode de screening)
- un screening automatique fonde sur le score du quiz doit etre traite comme la regle de passage du round quiz, pas forcement comme un nouveau `stageType`
- le produit peut donc enchaîner plusieurs quiz a des moments differents du pipeline

## 8.5 Pre-selections multiples

Chaque `PRESELECTION` est un vrai round de decision humaine.

Implications:

- plusieurs `PRESELECTION` doivent etre autorisees dans le pipeline
- chaque decision de preselection doit etre liee a l'occurrence precise `application_progress`
- `PRE_SCREEN_ACCEPTED` et `PRE_SCREEN_REJECTED` peuvent rester comme issues de decision, mais plus comme statut global mono-valeur sur `applications`
- une preselection refusee reste eliminatoire par defaut
- une annulation de decision ou un contournement doit exiger une justification et etre audite

## 8.6 Entretien + evaluation integree

L'entretien devient une etape composee avec sous-workflow operationnel.

Cible:

- l'etape pipeline est de type `INTERVIEW`
- elle porte la planification, la notification candidat, la tenue de l'entretien, la collecte d'evaluations et la validation humaine de cloture
- plusieurs evaluations detaillees peuvent exister pour un meme entretien
- chaque evaluation peut etre de type texte seul, score seul ou texte + score
- chaque round d'entretien peut definir sa propre grille d'evaluation et ses propres criteres

Implication majeure:

- le produit ne veut pas d'evaluation autonome hors entretien
- le modele cible doit donc rapprocher fortement `INTERVIEW` et `EVALUATION`, voire faire de l'evaluation un sous-objet de l'entretien plutot qu'une etape pipeline a part

## 8.7 Scores et agregats

Le besoin produit ne demande pas un score global candidat unique.

La cible est:

- un ou plusieurs scores detail par evaluation
- un agregat automatique par entretien lorsque l'entretien contient des notes chiffrees
- eventuellement des sous-scores par critere si la grille le demande
- pas d'obligation de score sur tous les entretiens
- des commentaires libres toujours possibles

## 8.8 Emails et notifications

La logique email cible devient plus fine que le modele actuel.

Attendus exprimes:

- lors de la planification d'un entretien, le candidat doit etre notifie
- soit le mail est envoye automatiquement
- soit le recruteur doit valider/rediger/confirmer l'envoi pendant la planification
- un round peut exister sans email par defaut, mais certaines transitions rendent l'email obligatoire
- une preselection refusee doit pouvoir generer un mail automatique de refus
- l'acceptation d'une preselection peut ne pas envoyer d'email
- chaque occurrence de round doit pouvoir utiliser son propre template d'email

Conclusion:

- un simple couple `emailRequired` / `emailAutomatic` au niveau du stage devient probablement insuffisant pour couvrir les besoins asymetriques selon l'issue (`accept` vs `reject`) et selon le contexte (`planning`, `fin de parcours`, etc.)

## 8.9 Auditabilite

Le produit veut tracer tout ce qui merite de l'etre.

Il faut donc prevoir au minimum l'audit des operations suivantes:

- creation / modification / suppression logique d'un template pipeline
- changement de configuration ou de version d'un pipeline rattache a une campagne
- transitions `application_progress`
- decisions de preselection et decision finale
- annulation / revert / rollback avec justification
- planification, report, annulation et cloture d'entretien
- saisie et modification d'evaluations
- envois ou validations d'emails critiques

## 9. Refactoring concret a prevoir

## 9.1 Editeur pipeline et readiness

A faire:

- retirer `QUIZ`, `PRESELECTION` et `INTERVIEW` de `SINGLETON_INTERMEDIATE_STAGE_TYPES`
- reevaluer le maintien de `EVALUATION` comme type editable autonome
- adapter la readiness front et backend aux repetitions de rounds
- ajouter un controle de clarte sur les libelles des stages actifs d'un meme template
- revoir la politique actuelle de `allowSkip` car le produit demande maintenant qu'un round obligatoire ne soit jamais skippable

## 9.2 Regle de skip

Le nouveau besoin produit contredit le cadrage recent "required + allowSkip=true".

Cible produit demandee:

- un round obligatoire ne doit pas etre skippable
- un round skippable doit donc etre non obligatoire
- le skip reste soumis aux autres preconditions metier, notamment sur les emails et validations humaines

Implication:

- la logique actuelle `configJson.allowSkip=true` sur une etape requise doit etre reouverte dans le cadre de cette refonte

## 9.3 Services runtime

A faire:

- supprimer la dependance a `findProgressByStageType(...)` pour tous les flux multi-round
- introduire des helpers par occurrence explicite, par exemple:
  - `findProgressById(...)`
  - `findProgressByStageIdAndApplicationId(...)`
  - `findCurrentProgressForApplication(...)`
- remplacer les mises a jour par `stageType` unique (`INTERVIEW`, `QUIZ`, `PRESELECTION`) par des mises a jour scopees a une occurrence precise

## 9.4 Quiz

A faire:

- autoriser plusieurs quiz dans un template
- rattacher chaque score et chaque resultat au bon `application_progress`
- traiter le screening automatique comme un effet de la config du quiz et de son `passingScore`
- ne plus utiliser `applications.quizScore*` comme unique resume metier du parcours quiz complet

## 9.5 Entretiens et evaluations

A faire:

- `InterviewsBusiness.resolveInterviewPipelineStage(...)` ne doit plus resoudre un unique `INTERVIEW` par template
- la creation d'entretien doit cibler explicitement l'occurrence `application_progress` concernee
- le `mailSent` du pipeline doit etre aligne sur cet entretien precis
- l'entretien doit disposer de statuts operationnels internes couvrant au moins planification, tenue, evaluation, validation humaine et cloture
- les evaluations doivent rester liees a l'entretien, avec possibilite de plusieurs evaluateurs
- la definition des criteres d'evaluation doit devenir configurable par round d'entretien

## 9.6 Pre-selections et decisions

A faire:

- `DecisionBusiness.resolveDecisionPipelineStage(...)` ne doit plus passer par une resolution unique par type
- chaque decision doit etre liee a `application_progress_id`
- une annulation ou une decision forcee doit exiger une justification
- `PRE_SCREEN_ACCEPTED` / `PRE_SCREEN_REJECTED` doivent devenir des issues historisees par round, pas un simple etat global mono-valeur sur `applications`
- la politique email par outcome (`accept` vs `reject`) doit etre explicitee

## 9.7 Applications et snapshots

A faire:

- reduire le role de `applications.applicationStatus` comme source de verite principale
- preferer une logique de position courante dans le pipeline: `currentApplicationProgressId`, `currentPipelineStageId`, ou equivalent denormalise
- conserver `applications.*` seulement comme resumes de lecture rapide si necessaire
- afficher la chronologie complete a partir de `application_progress` et des objets metier lies

## 9.8 Audit et journalisation

A faire:

- definir une strategie d'audit transverse
- tracer les justifications de rollback, annulation de decision et contournements
- tracer les mises a jour d'evaluation et les validations humaines de cloture d'entretien
- prevoir des tables ou une mecanique d'audit suffisamment riches pour reconstituer l'historique d'une candidature

## 9.9 Politique de verrouillage et de migration de pipeline

Le besoin metier pousse plutot vers un verrouillage plus fort, pas plus faible.

A faire:

- clarifier si un pipeline rattache a une campagne ouverte devient strictement non modifiable
- privilegier une evolution par duplication/version plutot que par reecriture en place
- definir explicitement la politique de migration des candidatures si un pipeline de campagne change
- garantir que les donnees deja produites (quiz, decisions, entretiens, evaluations) ne soient jamais perdues par une mise a jour du pipeline

## 10. Proposition de plan de livraison avant fin du mois

Le besoin est urgent et ne doit pas etre reporte. En revanche, l'implementation doit rester sequencee.

## Phase 1 - Fondations de repetabilite pipeline

Objectif:

- autoriser plusieurs `QUIZ`, `PRESELECTION` et `INTERVIEW`
- supprimer les resolutions runtime par `stageType` unique
- introduire les liaisons `application_progress_id` sur les objets runtime critiques
- reouvrir la politique `allowSkip`

## Phase 2 - Refonte entretien / evaluation

Objectif:

- faire de l'entretien une etape composee avec evaluation integree
- gerer plusieurs evaluateurs
- supporter texte seul, score seul, ou texte + score
- introduire la personnalisation des grilles / criteres par round

## Phase 3 - Decisions, emails et audit

Objectif:

- rendre les pre-selections pleinement multi-round
- revoir les politiques d'emails selon issue et contexte
- ajouter les journaux d'audit obligatoires
- clarifier les validations humaines et les justifications requises

## Phase 4 - Chronologie candidat et politique de migration

Objectif:

- afficher la chronologie complete du candidat
- produire un resume imprimable de la fiche candidat
- definir le comportement en cas de changement de pipeline pour une campagne ou une candidature deja engagee

## 11. Decisions produit deja arbitrees

Les reponses BA recues permettent de considerer les points suivants comme actés.

- le besoin concerne toutes les campagnes
- il s'agit d'un besoin structurel de pipeline, pas d'ajout ad hoc d'un round sur un candidat isole
- plusieurs `QUIZ`, `PRESELECTION` et `INTERVIEW` doivent etre possibles
- un entretien reste un entretien, sans typologie standard geree par la plateforme
- le round est principalement defini par son ordre dans le pipeline
- les evaluations sont toujours rattachees a un entretien
- plusieurs evaluateurs peuvent evaluer un meme entretien
- l'evaluation peut demander un score, un texte, ou les deux
- il ne faut pas de score global unique au niveau candidature comme verite metier centrale
- un round obligatoire ne doit pas etre skippable
- la progression vers l'etape suivante demande une vraie cloture humaine du round
- les statuts candidature actuels ne suffisent plus; la chronologie `application_progress` doit redevenir centrale
- les operations critiques doivent etre auditees
- les pipelines sont administres par le super admin; le recruteur opère les decisions et peut annuler avec justification
- si une migration lourde est necessaire pour remettre la base au bon niveau de besoin, elle est acceptable

## 12. Questions ouvertes restantes

Les points suivants restent ouverts ou partiellement flous, malgre les arbitrages ci-dessus.

- faut-il imposer techniquement l'unicite des libelles de stages actifs au sein d'un meme template
- faut-il verrouiller strictement tout pipeline rattache a une campagne ouverte, sans edition en place
- si un pipeline change pour une campagne en cours, quelle politique de migration applique-t-on aux candidatures deja engagees
- lorsqu'on rollback de l'etape 3 vers l'etape 1, reinitialise-t-on aussi l'etape 2, ou la conserve-t-on comme historique clos tout en reouvrant 1
- le `screening automatique` est-il seulement un effet de `passingScore` sur un quiz, ou faut-il lui donner une visibilite propre dans l'UX
- quelles actions de saisie/correction d'evaluation doivent rester ouvertes aux recruteurs simples par rapport aux super admins
- faut-il conserver `EVALUATION` comme type legacy tolere en lecture pendant une phase transitoire, ou le migrer tout de suite hors des templates cibles

## 13. Recommandations BA par defaut pour fermer les zones grises

Si aucun arbitrage supplementaire n'est donne immediatement, je recommande les decisions suivantes pour pouvoir implementer sans bloquer.

- imposer des libelles distincts pour les stages actifs d'un meme template
- interdire toute modification en place d'un pipeline rattache a une campagne ouverte; l'evolution passe par duplication / nouvelle version
- en cas de rollback vers une etape anterieure, reinitialiser les etapes suivantes pour l'etat courant tout en conservant l'historique et les audits des executions precedentes
- traiter le `screening automatique` comme une regle de passage du quiz, pas comme un nouveau type d'etape
- faire de l'email de refus de preselection un cas explicitement supporte et prioritaire
- rendre obligatoire un email ou une confirmation d'envoi quand le candidat sort du parcours ou quand un entretien est planifie
- deprecier `EVALUATION` comme etape pipeline cible et la maintenir seulement en compatibilite de migration si necessaire

## 14. Reponses BA consolidees du 2026-05-30

## 14.1 Portee produit

- on veut pouvoir faire plusieurs quiz, plusieurs pre-selections, plusieurs entretiens et plusieurs evaluations par entretien
- les evaluations sont toujours liees a un entretien; elles ne doivent pas exister comme evaluations autonomes sans entretien
- le besoin concerne toutes les campagnes, avec des pipelines plus ou moins simples selon les cas
- il s'agit d'un besoin structurel de pipeline, pas d'un ajout de round special sur un candidat isole
- l'objectif est une refonte qui puisse se terminer avant la fin du mois, sans repousser artificiellement les vrais besoins de schema

## 14.2 Definition d'un round d'entretien

- le round est principalement porte par l'ordre du pipeline
- le libelle n'est pas la definition fonctionnelle du round, meme s'il doit aider a comprendre l'etape
- la plateforme ne doit pas imposer une taxonomie de types d'entretien
- le nombre de rounds est libre
- on ne veut pas inserer un round intermediaire au runtime pour un candidat; au mieux on change le pipeline de la campagne ou son template, avec une politique de verrouillage/migration a definir

## 14.3 Modele de score attendu

- un entretien est toujours lie a une evaluation, mais cette evaluation ne demande pas toujours un score
- un entretien peut n'exiger qu'un avis redige, qu'une note, ou les deux
- il peut y avoir un ou plusieurs evaluateurs par entretien
- il n'est pas souhaite de score global candidat unique comme verite metier principale
- les agregats de score doivent etre calcules automatiquement au bon niveau
- des criteres de notation personnalisables par evaluation seraient souhaitables

## 14.4 Regle de progression pipeline

- chaque round doit etre termine ou skippe seulement si ce round est autorise a l'etre avant de passer au suivant
- un round obligatoire ne doit pas etre skippable
- un entretien comprenant une evaluation a score ne peut pas laisser passer le candidat sans cette validation si le round l'exige
- l'entretien est lui-meme un petit workflow: planification, evaluation, validation de fin d'evaluation, validation de fin d'entretien
- la cloture du round demande une validation humaine

## 14.5 Pre-selections multiples

- chaque `PRESELECTION` est un vrai round de decision humaine
- ce n'est pas une simple collection d'avis preparatoires
- une preselection refusee doit pouvoir envoyer un mail automatique
- l'acceptation peut ne pas envoyer d'email
- la preselection est eliminatoire par defaut
- une annulation de decision ou un forçage doit etre possible avec justification
- `PRE_SCREEN_ACCEPTED` / `PRE_SCREEN_REJECTED` peuvent etre conserves, mais plus comme statut mono-valeur stocke sur `applications`

## 14.6 Evaluations multiples

- une evaluation est toujours rattachee a un entretien
- plusieurs evaluations sont possibles pour un meme entretien
- on veut voir le detail de chaque note/evaluation, pas seulement l'agregat
- on peut vouloir une grille differente pour chaque round d'evaluation lie a un entretien
- il n'y a pas de besoin clair exprime de versionner les evaluations; la priorite est plutot l'audit que le versioning formel des fiches d'evaluation

## 14.7 Statut global candidature

- les statuts candidature actuels sont juges insuffisants pour la cible produit
- il serait plus pertinent de savoir a quelle etape ou a quelle occurrence d'etape se trouve la candidature
- l'ecran doit montrer la chronologie issue de `application_progress`
- les changements de statut, decisions et avancements doivent etre audites

## 14.8 Emails et notifications

- un entretien planifie doit donner lieu a une notification candidat
- soit l'envoi est automatique
- soit le recruteur doit confirmer ou realiser l'envoi au moment de la planification
- certaines etapes peuvent exister sans email par defaut, mais il faut cadrer les cas ou l'email devient obligatoire
- chaque occurrence de round multiple peut avoir son propre template d'email
- un resume global imprimable dans la fiche candidat serait utile

## 14.9 UX attendue

- la fiche candidat doit afficher une chronologie complete
- le round courant et les rounds passes doivent etre identifies clairement
- les statuts, scores, evaluateurs et decisions doivent etre visibles round par round
- il ne faut pas ajouter de rounds directement depuis la fiche candidat
- si on change le pipeline d'une campagne ou d'un template, il faut une vraie politique de mise a jour des candidatures sans perte de donnees

## 14.10 Reporting et exploitation

- la priorite immediate n'est pas le reporting avance
- en revanche, il faut pouvoir voir les scores et details existants
- il n'y a pas de besoin d'introduire des types de rounds analytiques autres qu'un entretien reste un entretien
- les statistiques dashboard pourront etre retravaillees apres la refonte du modele metier

## 14.11 Migration et compatibilite

- s'il faut une migration lourde pour assainir le modele, mieux vaut la faire maintenant
- l'utilisateur exprime une preference forte pour repartir sur une base propre plutot que conserver un modele mal adapte
- il n'y a pas de volonte de reporter des pans entiers du besoin a plus tard
- les choix de migration doivent donc prioriser la coherence cible plutot qu'une compatibilite legacy maximale a tout prix

## 14.12 Permissions et operations

- aucun acteur metier ne doit creer un round supplementaire au runtime pour un candidat
- le super admin gere la creation et la modification des pipelines
- un recruteur peut annuler une decision, avec justification obligatoire
- tout ce qui merite d'etre trace doit l'etre
- le rollback est souhaitable, mais sa semantique exacte sur les etapes intermediaires reste a definir

## 15. Version BA exploitable de l'audit

Sur la base des reponses recues, la cible projet recommandee devient la suivante.

## 15.1 Perimetre de refonte a considerer comme en scope

- repetabilite de `QUIZ`, `PRESELECTION` et `INTERVIEW`
- suppression de l'hypothese runtime "une seule occurrence exploitable par `stageType`"
- evaluation integree a l'entretien
- multi-evaluateurs par entretien
- grilles d'evaluation configurables par round d'entretien
- politique email plus riche par round et par issue
- chronologie candidat fondee sur `application_progress`
- auditabilite transverse du parcours candidat

## 15.2 Hors-scope recommande a ce stade

- ajout libre de rounds hors pipeline pour un candidat isole
- typologie standardisee des entretiens geree par la plateforme
- priorite immediate au reporting dashboard avance avant remise a plat du modele metier

## 15.3 Risque principal si la refonte reste partielle

Si la refonte se limite a autoriser plusieurs `INTERVIEW` sans traiter aussi les quiz multiples, les pre-selections multiples, la reecriture de `allowSkip`, l'integration de l'evaluation dans l'entretien et l'auditabilite, alors le schema cible restera incoherent avec le besoin produit formule.

La refonte doit donc etre pensee comme une remise a plat du modele pipeline et de ses objets runtime, meme si sa livraison est sequencee sur quelques phases techniques.