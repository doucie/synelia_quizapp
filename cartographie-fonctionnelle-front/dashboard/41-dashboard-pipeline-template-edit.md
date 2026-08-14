# Dashboard Pipeline Template Edit

## 1. Identite

- Route: `/dashboard/pipeline-templates/:id/edit`
- Guard: `permissionGuard(['UPDATE_PIPELINE_TEMPLATE'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/pipeline-template-edit/pipeline-template-edit.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/pipeline-template-edit/pipeline-template-edit.html`

## 2. Objectif Produit

La page sert à éditer finement un modèle de pipeline: informations générales, liste ordonnée des étapes, caractéristiques métier de chaque étape et ordre d’exécution.

Le cadrage cible impose des bornes fixes `CANDIDATURE` / `DECISION` et doit empêcher les paramétrages qui n'ont pas de traduction métier réelle dans le produit.

La cible n'est plus un gel global du template au premier candidat, mais un versionning fin des `pipeline_stage` actifs/inactifs pour laisser evoluer les etapes futures sans casser l'historique des candidatures deja engages.

## 3. Etat Constate

- [x] La page charge en parallèle le template et ses étapes.
- [x] Si l’ID de route est invalide, elle redirige vers la liste des templates.
- [x] Les étapes sont éditables inline.
- [x] L’ordre peut être changé par drag and drop.
- [x] Chaque étape gère type, libellé, caractère obligatoire, éliminatoire et stratégie email.
- [x] La sauvegarde adapte maintenant son ordre selon le cas: désactivation d'abord pour pouvoir retravailler un pipeline actif, sinon étapes puis `reorder`, puis mise à jour du template afin que l'activation voie l'état final.
- [x] La suppression d’une étape renumérote les étapes restantes.
- [x] Cote backend, `PipelineTemplateBusiness.create()` cree maintenant un template `isActive=false` par defaut si l'UI ne fournit pas la valeur, puis initialise `CANDIDATURE` et `DECISION`.
- [x] Cote backend, la désactivation d'un template est refusée s'il est encore utilisé par une campagne ouverte.
- [x] Cote backend, le premier `application_progress` verrouille le template, puis les mutations sur le template, les stages et le reorder sont refusees; l'evolution se fait alors par duplication.
- [x] Cote backend, `application_progress` snapshotte deja toutes les etapes du template a la creation d'une candidature avec statut `PENDING`, ce qui fournit deja un point d'ancrage pour conserver le pipeline historique d'un candidat.
- [x] Le backend bloque deja l'ajout manuel des bornes fixes, normalise `TECHNICAL_TEST` vers `QUIZ` et refuse `CUSTOM`.
- [x] Un premier cadrage des flags est maintenant livre: `PRESELECTION` reste toujours eliminatoire; `emailRequired` / `emailAutomatic` ne sont conserves que sur les types vraiment branches (`PRESELECTION`, `INTERVIEW`, `DECISION`), et `Envoi auto` implique `Email requis`.
- [ ] Vérifier si les étapes supprimées sont soft-delete ou suppression logique dédiée.
- [x] Le produit ne retient qu'un seul type de test metier dans le pipeline editable; `TECHNICAL_TEST` doit donc fusionner dans `QUIZ`.
- [x] Le type `CUSTOM` n'a pas d'usage produit retenu et doit etre retire du contrat expose.
- [x] `CANDIDATURE` et `DECISION` sont des bornes fixes: presentes des la creation, non supprimables et non deplacables respectivement en tete et en fin.
- [x] L’ajout d’une nouvelle étape l’insère désormais entre les bornes fixes, juste avant `DECISION`.
- [ ] Finaliser la matrice complete des flags par type d'etape; un premier garde-fou est livre, le flux de skip minimal est branche et l'editeur expose maintenant `Autoriser le saut`, mais le cadrage total de `Obligatoire` reste a terminer.
- [ ] Définir une grille explicite `pipeline prêt à produire` au-delà du garde-fou minimal déjà en place (bornes, ordre, une étape intermédiaire, types supportés, cohérence email minimale).
- [x] Ajouter une activation explicite du pipeline dans cette page, au lieu de laisser le backend rendre le template actif dès sa creation.
- [x] Remplacer le verrouillage binaire du template par une strategie de revisions de stages: `pipeline_stage.isActive` persiste la revision active, tandis que le verrouillage d'etape est derive de son usage reel par les candidats.

## 4. Blocs UI Constates

### 4.1 Header

- [x] bouton retour
- [x] titre `Éditeur de pipeline`
- [x] rappel du nom du template
- [x] boutons `Annuler` et `Enregistrer`

### 4.2 Informations générales

- [x] nom du modèle
- [x] description
- [x] checkbox `Activer ce pipeline`
- [x] etat visible `Brouillon à compléter` / `Brouillon prêt` / `Activation bloquée` / `Actif` / `Verrouille`
- [x] liste visible des points bloquants avant activation quand la readiness minimale n'est pas satisfaite

### 4.3 Aperçu pipeline

- [x] visualisation séquentielle des étapes
- [x] styles distincts pour obligatoire / éliminatoire

### 4.4 Editeur d’étapes

- [x] ajout d’étape
- [x] liste draggable
- [x] libellé libre
- [x] type d’étape parmi les valeurs métier supportées (`QUIZ`, `PRESELECTION`, `INTERVIEW`, `EVALUATION`) hors bornes fixes
- [x] switches `Obligatoire`, `Éliminatoire`, `Email requis`, `Envoi auto`
- [x] switch `Autoriser le saut` visible pour une étape obligatoire editable, avec persistance dans `configJson.allowSkip`
- [x] blocage visuel des combinaisons sans effet: `PRESELECTION` garde `Éliminatoire`, les emails sont editionnables seulement pour les types raccordes, avec un hint de comportement
- [x] suppression avec confirmation

## 5. Donnees Affichees Ou Editees

### 5.1 Template

- `id`
- `templateName`
- `templateDesc`
- `isActive`
- `isLocked`

### 5.2 Etapes

- `id`
- `stageLabel`
- `stageType`
- `stageOrder`
- `isActive` cible sur `pipeline_stage`
- `isLocked` cible derivee metier si au moins une candidature a deja atteint l'etape
- `isRequired`
- `isEliminatory`
- `emailRequired`
- `emailAutomatic`
- `pipelineTemplateId`

### 5.3 Cadrage fonctionnel attendu des types et flags

- `CANDIDATURE`: borne d'entree unique, non supprimable, non deplacable; les flags non pertinents sont implicites et l'API les normalise.
- `QUIZ`: etape de test unique retenue par le produit; elle absorbe le besoin `TECHNICAL_TEST`, porte le score de test candidat et ne pilote pas de flux email metier aujourd'hui.
- `TECHNICAL_TEST`: type legacy encore tolere en lecture mais normalise en `QUIZ` a la sauvegarde; ne doit plus exister comme type expose a l'utilisateur metier.
- `Obligatoire` / skip: une etape non obligatoire est skippable cote API et cote liste candidats; une etape requise peut aussi devenir skippable si `configJson.allowSkip=true`, et ce reglage avance est maintenant expose par cette page via `Autoriser le saut`. Cette logique reste generique sur tous les types editables, sauf `CANDIDATURE` et `DECISION` qui ne doivent jamais devenir skippables. Si l'etape exige aussi un email (`emailRequired=true`), le skip ne redevient operationnel qu'apres envoi du mail requis.
- `PRESELECTION`: singleton fonctionnel dans le modele actuel; refus terminal par nature. Les flags email pilotent l'email de decision de preselection et le deblocage de l'etape suivante quand un envoi est requis.
- `INTERVIEW`: singleton fonctionnel dans le modele actuel; reliee a la creation d'entretien, aux invitations et aux transitions de progression. Les flags email pilotent l'invitation et l'attente eventuelle avant l'etape suivante.
- `EVALUATION`: singleton fonctionnel dans le modele actuel tant que le score d'evaluation reste stocke en mono-valeur sur `application`. Aucun flux email metier n'est branche sur ce type aujourd'hui.
- `DECISION`: borne de sortie unique; les flags non pertinents doivent etre bloques.
- `CUSTOM`: type legacy non propose en UI et refuse par l'API lors d'une sauvegarde.

### 5.3.1 Regle runtime sur le skip et les emails

- un skip n'est plus accepte cote API si l'etape courante attend encore un email requis non envoye (`emailRequired=true` et `mailSent=false`)
- la liste candidats masque donc `Ignorer` dans ce cas, meme si l'etape est non obligatoire ou porte `configJson.allowSkip=true`
- apres envoi du mail requis, le skip redevient possible si la regle de skippabilite du stage l'autorise toujours

### 5.3.2 Matrice actuelle `type d'etape x flag x effet reel`

- `CANDIDATURE`: borne fixe. `Obligatoire` implicite, `AllowSkip` interdit, `Éliminatoire` force a `false`, pas de flux email pilote par cette etape.
- `QUIZ`: `Obligatoire` actif, `AllowSkip` autorisable si l'etape reste requise, `Éliminatoire` actif, `Email requis` et `Envoi auto` sans effet metier et normalises a `false`.
- `PRESELECTION`: `Obligatoire` actif, `AllowSkip` autorisable, `Éliminatoire` force a `true`, `Email requis` et `Envoi auto` actifs pour le flux de decision de preselection; un skip reste bloque tant que l'email requis n'est pas marque envoye.
- `INTERVIEW`: `Obligatoire` actif, `AllowSkip` autorisable, `Éliminatoire` actif, `Email requis` et `Envoi auto` actifs pour l'invitation d'entretien; un skip reste bloque tant que l'email requis n'est pas marque envoye.
- `EVALUATION`: `Obligatoire` actif, `AllowSkip` autorisable, `Éliminatoire` actif, `Email requis` et `Envoi auto` sans effet metier et normalises a `false`.
- `DECISION`: borne fixe. `Obligatoire` implicite, `AllowSkip` interdit, `Éliminatoire` force a `false`, les flags email peuvent encore piloter l'envoi de decision cote moteur mais ne sont pas editables dans cette page.

### 5.3.4 Regle actuelle d'unicite par type metier

- `CANDIDATURE` et `DECISION` restent uniques et fixes.
- `QUIZ`, `PRESELECTION`, `INTERVIEW` et `EVALUATION` sont aussi traites comme singletons fonctionnels dans le modele actuel, car plusieurs moteurs metier resolvent ces etapes par `stageType` en supposant une seule occurrence exploitable.
- l'editeur masque donc les types deja utilises, le bouton d'ajout se desactive quand tous les types intermediaires supportes sont deja presents, et l'API refuse l'introduction d'un nouveau doublon de ces types.
- les doublons legacy eventuels restent un sujet de nettoyage separe; le garde-fou current bloque surtout l'introduction de nouveaux doublons et la readiness les signale comme invalides pour l'activation.

### 5.3.3 Regles transverses sur `AllowSkip`

- `AllowSkip` reste generique sur tous les types editables, sans restriction supplementaire par type a ce stade.
- `AllowSkip` ne s'applique jamais aux bornes fixes `CANDIDATURE` et `DECISION`, meme si une config legacy contient encore cette cle.
- une etape non obligatoire est deja skippable sans stocker `AllowSkip`; la cle `configJson.allowSkip` sert donc uniquement a autoriser le skip sur une etape qui reste marquee `Obligatoire`.

### 5.4 Cycle de vie d'activation attendu

- creation via la popup `Nouveau modele`: saisie `nom` + `description`, puis redirection vers cette page
- initialisation automatique des bornes `CANDIDATURE` et `DECISION`
- le pipeline n'est donc jamais vide des sa creation, meme avant configuration des etapes intermediaires
- creation du template en brouillon inactif (`isActive=false`)
- completion de la configuration tant que la grille `pipeline pret a produire` n'est pas satisfaite
- activation explicite par l'utilisateur via une checkbox ou action equivalente sur cette page
- un garde-fou minimal bloque deja l'activation tant que le pipeline n'a pas `CANDIDATURE` en tete, `DECISION` en fin, au moins une etape intermediaire, des types supportes, des libelles non vides et une coherence email minimale
- la desactivation doit maintenant aussi respecter l'usage operationnel existant: un template rattaché a une campagne ouverte ne peut plus repasser en brouillon tant que cette campagne n'est pas fermee ou reassignee
- une fois le template utilise par un candidat, le verrouillage n'est plus global: seules les etapes reellement atteintes sont verrouillees et evoluent par revisions actives/inactives; les etapes futures restent editables sur place
- l'editeur reste donc pleinement utilisable sur un template verrouille: les champs d'une etape utilisee sont desactives (badge `Utilisee`), les autres restent modifiables et la sauvegarde passe par un unique `saveTemplateStages` qui applique le diff ordre par ordre cote backend

### 5.5 Cible versionning des stages (livré avec la 440, Lot B)

- la version visible d'un pipeline correspond a la liste des `pipeline_stage` avec `isActive=true`, ordonnes par `stageOrder`
- un stage est considere `locked` non pas parce qu'il existe dans `application_progress`, mais parce qu'au moins une candidature l'a reellement atteint: statut `IN_PROGRESS`, `PASSED`, `FAILED` ou `SKIPPED` (`findUsedStageIds` du `ApplicationProgressRepository`)
- un stage actif non locke peut etre modifie sur place
- un stage actif locke ne doit plus etre reecrit: en cas de changement, il devient `isActive=false` et une revision active de remplacement est creee ou reactivee
- si un ordre disparait du pipeline cible et que son stage actif n'est pas locke, il est soft-delete; s'il est locke, il devient seulement inactif (historique conserve)
- si la configuration cible demandee par l'utilisateur correspond a une revision inactive deja presente pour le meme `pipeline_template_id` et `stageOrder`, le backend la reactive automatiquement au lieu d'en creer une nouvelle
- les pages metier n'exposent jamais les revisions inactives: le front envoie seulement la configuration cible visible (`POST /pipelineStage/saveTemplateStages`), puis le backend (`PipelineStageBusiness.applyTargetConfig`) decide seul s'il faut modifier, creer, desactiver ou reactiver une revision existante
- le verrou du template (`is_locked`) est conserve en base mais ne bloque plus l'edition: seules les etapes utilisees sont verrouillees dans l'editeur
- readiness, activation et reorder sont evalues sur les revisions actives uniquement

### 5.6 Limite structurelle a arbitrer (résolue via `active_slot`)

- la regle metier cible n'est pas `UNIQUE (pipeline_template_id, stage_order, is_active)`; elle est `au plus une revision active` pour un couple `(pipeline_template_id, stageOrder)`
- les revisions inactives doivent pouvoir coexister en plusieurs exemplaires pour un meme ordre si l'historique le necessite
- solution retenue: colonne generee `active_slot = IF(is_active, stage_order, NULL)` + index unique `UNIQUE(pipeline_template_id, active_slot)` — la colonne generee vaut `NULL` sur les lignes inactives (non unicisees), et `stage_order` sur les actives (unicite garantie)

## 6. Services Et Endpoints

- `PipelineTemplateService.getAllByCriteria()` -> `/pipelineTemplate/getAllByCriteria`
- `PipelineTemplateService.update()` -> `/pipelineTemplate/update`
- `PipelineStageService.getByTemplate()` -> `/pipelineStage/getByTemplate`
- `PipelineStageService.saveTemplateStages(templateId, stages)` -> `POST /pipelineStage/saveTemplateStages` — diff ordre par ordre entre actifs courants et configuration cible (revisions)
- `PipelineStageService.create()` -> `/pipelineStage/create`
- `PipelineStageService.update()` -> `/pipelineStage/update`
- `PipelineStageService.delete()` -> `/pipelineStage/delete`
- `PipelineStageService.reorder(templateId, ids)` -> endpoint de réordonnancement des étapes (non utilisé par l'éditeur Lot B)

## 7. Ce Que Le Backend Doit Envoyer

- Le template demandé par ID, avec une réponse stable même si l’API de chargement passe encore par `getAllByCriteria` borné sur l’ID.
- Une liste d’étapes ordonnée, ou au minimum réordonnable via `stageOrder`.
- Des endpoints capables de supporter un mix `update/create/delete/reorder` dans une même session d’édition.
- Une validation métier cohérente des flags email et des types d’étape.
- Une validation qui impose les bornes fixes, refuse les flags non supportés selon le type et expose un état de readiness exploitable par la liste des templates.
- Une mutation d'activation explicite qui refuse `isActive=true` tant que les invariants structurels et la readiness ne sont pas satisfaits.
- Une resolution d'edition par comparaison ordre par ordre entre la version active actuelle et la version cible, avec mutation sur place des stages non lockes et revisions actives/inactives pour les stages lockes.

## 8. Entites Metier Impliquees

- `pipelineTemplate`
- `pipelineStage`
- règles de workflow recrutement

## 9. Questions Ou Ecarts A Qualifier

- [x] `CANDIDATURE` et `DECISION` sont uniques dans un pipeline.
- [x] Le modele actuel traite `QUIZ`, `PRESELECTION`, `INTERVIEW` et `EVALUATION` comme des singletons fonctionnels; `QUIZ` et `EVALUATION` restent donc uniques tant que les moteurs resolvent ces etapes par `stageType` unique.
- [x] Un pipeline sans etape ou avec une premiere etape non conforme doit etre impossible: `CANDIDATURE` et `DECISION` doivent exister des la creation.
- [x] Le front doit afficher une erreur backend detaillee lorsqu'elle est utile a la comprehension ou a l'action de l'utilisateur.
- [x] `TECHNICAL_TEST` est traite comme alias legacy de `QUIZ` dans les surfaces pipeline et a la sauvegarde API.
- [x] `CANDIDATURE` et `DECISION` doivent etre presentes par defaut, non supprimables et non deplacables respectivement en tete et en fin.
- [x] `CUSTOM` n'est plus propose dans les surfaces pipeline metier/admin et l'API refuse sa creation ou sa mise a jour.
- [x] Une étape non obligatoire expose maintenant un vrai parcours de saut cote UI et API; le cas `allowSkip=true` sur une etape requise est aussi honore par la liste candidats et configurable depuis l'editeur pipeline.
- [ ] Quels autres flags, au-dela du premier garde-fou deja livre sur `PRESELECTION`, les emails et la borne `allowSkip` reservee aux etapes non fixes, doivent encore etre visibles, masques ou bloques selon le type d’etape ?
- [ ] Le verrouillage actuel au premier `application_progress` suffit-il, ou faut-il verrouiller plus tot des qu'un template est rattache a une campagne active ?
- [x] L'editeur affiche deja un etat visible, une checkbox d'activation et la liste des blocages minimaux; il reste a definir la readiness detaillee avant de parler de `Pret a produire` complet.
- [x] Le lock d'etape doit etre derive de `progressStatus != PENDING`.
- [x] Quel mecanisme technique porte l'invariant `un seul stage actif par (pipeline_template_id, stageOrder)` sans bloquer plusieurs revisions inactives du meme slot ? — colonne generee `active_slot` + `UNIQUE(pipeline_template_id, active_slot)` (V1_082).

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/pipeline-templates/:id/edit` avec un template existant.
2. Modifier le nom et la description.
3. Ajouter plusieurs étapes et varier leurs flags.
4. Réordonner les étapes par glisser-déposer.
5. Supprimer une étape puis sauvegarder.
6. Recharger la page et vérifier la persistance de l’ordre et des attributs.

## 11. Backlog Produit Ouvert

- [ ] Finaliser la fusion `TECHNICAL_TEST` -> `QUIZ` hors surfaces pipeline deja alignees: seeds, emails, migrations et contrats annexes.
- [ ] Finaliser la suppression de `CUSTOM` hors surfaces pipeline deja securisees: seeds, nettoyages de donnees et contrats annexes.
- [ ] Finaliser la garantie `CANDIDATURE` / `DECISION` sur les templates legacy et le nettoyage de donnees; les creations, suppressions et reordonnancements courants sont deja bornes.
- [x] Clarifier puis implémenter l'unicité fonctionnelle de `QUIZ` et `EVALUATION` dans le modele actuel; le meme garde-fou couvre aussi `PRESELECTION` et `INTERVIEW`, deja resolus comme singletons par plusieurs services metier.
- [x] Modifier l’ajout d’étape pour insérer la nouvelle étape entre `CANDIDATURE` et `DECISION` au lieu de l’ajouter en fin de liste.
- [ ] Finaliser la matrice `type d'etape x flag x effet reel` pour couvrir explicitement `Obligatoire` et les autres effets restants; le premier verrou est deja livre sur `PRESELECTION`, les flags email et le flux de skip minimal plus son reglage `allowSkip` et sa garde runtime sur `mailSent`.
- [x] Formaliser dans cette fiche une matrice `type d'etape x flag x effet reel` cote front et cote API, afin de garder un seul cadrage fonctionnel a jour dans `cartographie-fonctionnelle-front/dashboard`.
- [x] Rendre implicites ou non editables les flags sans sens sur `CANDIDATURE` et `DECISION`, et refuser cote API les valeurs incoherentes pour les bornes fixes; `PRESELECTION` garde aussi `Éliminatoire` de facon implicite.
- [x] Vérifier qu’une étape non obligatoire dispose bien d’un vrai flux de saut dans l’UI et l’API; la liste candidats expose maintenant `Ignorer`, honore `configJson.allowSkip=true` et l’editeur pipeline permet aussi de piloter ce réglage.
- [x] `allowSkip` reste autorise sur tous les types d’etape editables, sauf `CANDIDATURE` et `DECISION`; les bornes fixes ne doivent jamais devenir skippables, meme via une config legacy.
- [ ] Etablir une grille `pipeline prêt à produire` avant mise en service: transitions, mails, scoring, skip, quick actions et cohérence front/back.
- [ ] Étendre le garde-fou d'activation au-delà de la readiness minimale déjà livrée pour couvrir la grille métier complète de mise en service.
- [ ] Etendre les garde-fous `isActive=false` au-dela de ce qui est deja bloque (`setDefault`, campagnes ouvertes, acces candidat/public) pour couvrir les autres points d'entree restants.
- [x] Ajouter `isActive` sur `pipeline_stage`, faire evoluer l'unicite de `stageOrder` et definir si le verrouillage d'etape est calcule ou persiste.
- [x] Implementer l'algorithme d'edition ordre par ordre: inchange -> conserver, change non locke -> modifier, change locke -> desactiver puis creer/reactiver la revision cible.
- [x] Definir la politique de suppression d'etape: suppression reelle uniquement pour stage non locke, sinon bascule inactive.
- [x] Definir la politique backend de reactivation automatique d'une ancienne revision: si la configuration cible visible correspond a un stage inactif deja existant pour le meme slot, le reactiver plutot qu'en creer un autre, sans jamais exposer les revisions a l'utilisateur metier.

## 12. Impact Cible Multi-Occurrences

La cible actee par l'audit du 2026-05-30 invalide une partie du cadrage actuel de cette page.

- [ ] autoriser plusieurs rounds `QUIZ`, `PRESELECTION` et `INTERVIEW` dans un meme template
- [ ] retirer `EVALUATION` de la liste des types d'etape editables de premier niveau
- [ ] retirer toute exposition de `allowSkip` sur un round obligatoire
- [ ] remplacer les flags `emailRequired` / `emailAutomatic` par un vrai modele de regles de notification de round
- [ ] permettre a chaque stage `QUIZ` de porter un screening automatique optionnel, independant des autres quiz du meme pipeline
- [ ] permettre a chaque stage `INTERVIEW` de definir sa propre grille d'evaluation et ses criteres
- [ ] permettre a un stage `INTERVIEW` de reutiliser une grille mutualisee versionnee ou d'en figer un snapshot, sans reecrire retroactivement les campagnes deja ouvertes
