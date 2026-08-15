# Entities Pipeline Stages

## 1. Identite

- Routes: `/dashboard/entities/pipeline-stages` et `/dashboard/entities/pipeline-stages/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/pipeline-stages/entities-pipeline-stages.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/pipeline-stages/entities-pipeline-stages.html`

## 2. Objectif Produit

La page administre les etapes composant les templates de pipeline. C'est une route `entities/*` plus riche que la moyenne, car elle embarque une vraie validation metier sur `configJson`, les types d'etapes et le template parent, mais elle reste moins complete que l'editeur detaille de pipeline qui gere ordre, drag and drop et flags email.

Le slice BL-008 la pose maintenant plus explicitement comme surface technique et renvoie vers la page metier de reference du domaine pipeline: le catalogue `/dashboard/pipeline-templates`, ou directement l'editeur `/dashboard/pipeline-templates/:id/edit` quand la vue est deja ciblee sur un template.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec `PipelineStageService`.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a la page metier pipeline, voire a l'editeur du template courant quand la vue est ciblee.
- [x] Elle precharge les templates via `PipelineTemplateService.getAllByCriteria({ size: 999 })` pour les filtres et modales.
- [x] Les filtres avances couvrent type d'etape, template, `isRequired`, `isEliminatory`, suppression et plages de dates.
- [x] Le tableau affiche libelle, type, ordre, obligatoire, eliminatoire, template parent, presence d'un `configJson` et date de creation.
- [x] Les modales create/edit exposent `stageLabel`, `stageType`, `stageOrder`, `pipelineTemplateId`, `configJson`, `isRequired`, `isEliminatory`.
- [x] La route surcharge `validateCreate()` et `validateEdit()` pour imposer une vraie validation metier sur `configJson`.
- [x] La validation encode explicitement plusieurs regles pipeline: `TECHNICAL_TEST` et `CUSTOM` exigent un JSON non vide, `passingScore` doit etre entre 0 et 100, `allowSkip` doit etre booleen, `TECHNICAL_TEST` externe exige `externalUrl`.
- [x] `configJson` suit une normalisation claire: chaine vide -> `null`, ce qui aligne la route avec la semantique de partial update documentee dans le repo.
- [x] Le service transforme les retours snake_case / camelCase du backend en DTO front uniforme.
- [x] Le service expose aussi `getByTemplate()` et `reorder()`, absents de cette route CRUD.
- [x] Les cles de colonnes sont alignees sur le DTO reel `stageLabel`, `stageType`, `stageOrder`, `isRequired`, `isEliminatory`, `pipelineTemplateId`, `configJson`.
- [x] La route expose maintenant `getByTemplate()` comme action de ligne pour charger toutes les etapes d'un template donne dans une vue ciblee.
- [x] Le mode `template courant` est explicite et propose un retour `Voir toutes les etapes` vers la liste CRUD standard.
- [x] Les mutations directes sur une etape reellement atteinte par des candidats (`isLocked`) sont bloquees: l'edition desactives ses champs, la suppression l'archive (passe en revision inactive) au lieu de la supprimer; les etapes jamais atteintes restent mutables meme sur un template deja utilise (440 Lot B).
- [x] Les modales create/edit desactivent les champs quand l'etape editee est `isLocked` (libelle, type, ordre, template parent, `configJson`, `Obligatoire`, `Eliminatoire`, actions `Valider`/`Supprimer`); un message d'aide l'indique.
- [x] La validation locale reprend aussi le garde-fou d'unicite fonctionnelle: `QUIZ`, `PRESELECTION`, `INTERVIEW` et `EVALUATION` ne peuvent pas etre ajoutes plusieurs fois dans le meme pipeline courant — unicite retiree en cible multi-rounds (420/440 Lot A), la page CRUD affiche un badge `isActive` (revision active / archivee).
- [x] Le modele porte aussi `evaluationGridTemplateVersionId` (grille d'evaluation rattachee, INTERVIEW uniquement) et la politique email vit dans `pipeline_stage_notification_rule` (règles de notification) : ces deux configurations sont editees dans la page metier `pipeline-template-edit` (440 Lots C/D), pas dans cette surface CRUD technique.
- [ ] La route ne surface pas `emailRequired` et `emailAutomatic`, pourtant presents dans le modele et essentiels au pipeline runtime.
- [ ] La route ne propose toujours pas de reordonnancement, qui reste reserve a l'editeur detaille.
- [ ] L'UI ne montre qu'un booleen `Config` dans le tableau, pas le contenu ni un apercu exploitable de `configJson`.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] sous-texte qui explicite le statut de surface technique
- [x] bouton `Page metier` ou `Editeur du template` selon le contexte de vue
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Voir toutes les etapes` quand une vue ciblee par template est active
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `stageType`
- [x] filtre `pipelineTemplateId`
- [x] filtre `isRequired`
- [x] filtre `isEliminatory`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`
- [ ] pas de filtre dedie `stageLabel`

### 4.3 Tableau principal

- [x] colonnes `id`, `stageLabel`, `stageType`, `stageOrder`, `isRequired`, `isEliminatory`, `pipelineTemplateId`, `configJson`, `createdAt`
- [x] badges booleens pour obligatoire, eliminatoire et presence de configuration
- [x] resolution du nom de template via `getTemplateName()`
- [x] action `Voir le template` via `getByTemplate()` en plus des actions edit / delete / restore
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation etape pipeline
- [x] edition etape pipeline
- [x] aide contextuelle `config_json` selon `stageType`
- [x] message d'aide explicite quand l'etape editee est utilisee par des candidatures (`isLocked`): champ desactives, suppression = archivage (revision inactive)
- [x] colonne et badge `isActive` (revision active / archivee)

## 5. Donnees Affichees Ou Editees

- `id`
- `stageLabel`
- `stageType`
- `stageOrder`
- `isRequired`
- `isEliminatory`
- `emailRequired`
- `emailAutomatic`
- `isActive` (revision active / archivee)
- `isLocked` (etape atteinte par au moins une candidature)
- `evaluationGridTemplateVersionId` (grille d'evaluation rattachee, INTERVIEW uniquement)
- `configJson`
- `pipelineTemplateId`
- `pipelineTemplateName`
- `orderedStageIds`
- `createdAt`
- `updatedAt`
- `isDeleted`

## 6. Services Et Endpoints

- liste CRUD via `PipelineStageService.getAllByCriteria()` -> `POST /pipelineStage/getByCriteria`
- creation via `create()` -> `POST /pipelineStage/create`
- edition via `update()` -> `POST /pipelineStage/update`
- suppression via `delete()` -> `POST /pipelineStage/delete`
- restauration via `restore()` -> `POST /pipelineStage/update`
- lecture par template via `getByTemplate()` -> `POST /pipelineStage/byTemplate`
- reordonnancement via `reorder()` -> `POST /pipelineStage/reorder`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getByCriteria` pagine avec `items` ou `item`, plus `count` ou `totalCount`, compatible avec le mapping manuel du service.
- Des etapes valides en snake_case ou camelCase, puisque le service transforme les deux.
- Une validation coherente sur `configJson`, `stageType`, seuils de score et URL externes.
- Une validation coherente sur les etapes utilisees (`isLocked`): pas de reecriture d'une revision atteinte; suppression = passage en revision inactive.
- Les flags `emailRequired` et `emailAutomatic`, car ils pilotent l'avancement reel du pipeline selon les regles repo.
- `isActive` pour distinguer la revision active des revisions historiques inactives.
- Un endpoint `reorder` stable pour les ecrans specialises qui manipulent l'ordre des etapes.

## 8. Entites Metier Impliquees

- `pipelineStage`
- `pipelineTemplate`
- `applicationProgress`
- synchro interview/evaluation et regles de passage de stage
- configuration `configJson` des etapes techniques et custom

## 9. Questions Ou Ecarts A Qualifier

- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que l'editeur de template est la surface metier de reference pour l'ordre et les flags email.
- [x] Les mutations directes sur une etape `isLocked` (atteinte par des candidatures) sont maintenant bloquees ici aussi: champs desactives, suppression = archivage; les autres etapes restent mutables.
- [x] `QUIZ`, `PRESELECTION`, `INTERVIEW` et `EVALUATION` sont traites comme des singletons fonctionnels dans le modele courant; cette route empeche donc aussi l'introduction de doublons de ces types — unicite cible retiree (multi-rounds, 440 Lot A).
- [ ] Faut-il exposer `emailRequired` et `emailAutomatic` dans cette route ?
- [x] La route brute renvoie implicitement vers l'editeur detaille pour le reordonnancement; ici seul `getByTemplate()` est expose.
- [ ] Le tableau doit-il afficher un apercu lisible de `configJson` plutot qu'un simple Oui/Non ?
- [ ] Certaines combinaisons de types/flags devraient-elles etre bloquees plus explicitement dans cette UI ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/pipeline-stages` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/pipeline-templates`.
3. Utiliser l'action `Voir le template` sur une etape puis verifier que le CTA devient `Editeur du template` et ouvre `/dashboard/pipeline-templates/:id/edit`.
4. Filtrer par type d'etape, template et flags obligatoire/eliminatoire.
5. Creer une etape `TECHNICAL_TEST` avec `configJson` valide.
6. Verifier qu'un `configJson` invalide ou absent sur `TECHNICAL_TEST` et `CUSTOM` est refuse.
7. Utiliser l'action `Voir le template` sur une etape et verifier le chargement cible des etapes du meme template.
8. Revenir avec `Voir toutes les etapes` puis verifier le retour a la liste CRUD standard.
9. Modifier une etape existante puis verifier la persistence du template parent et de l'ordre.
10. Supprimer puis restaurer une etape.
11. Tenter de modifier une etape utilisee par des candidatures et verifier que la page bloque l'edition (champs desactives) et archive au lieu de supprimer.
12. Verifier qu'une etape jamais atteinte reste modifiable sur un template deja utilise, et que la colonne `isActive` distingue revision active et revision archivee.

## 11. Impact Cible Multi-Occurrences

- [ ] retirer l'unicite fonctionnelle de `QUIZ`, `PRESELECTION` et `INTERVIEW` dans la cible documentee
- [ ] retirer `EVALUATION` des types d'etape editables de premier niveau
- [ ] supprimer les colonnes `emailRequired` / `emailAutomatic` du contrat cible et les remplacer par des regles de notification de stage
- [ ] documenter le screening automatique optionnel propre a chaque stage `QUIZ`
- [ ] documenter les grilles d'evaluation propres a chaque stage `INTERVIEW`
- [ ] documenter la bibliotheque mutualisee de grilles d'evaluation et son versionnement, distincts du simple `configJson`
- [ ] limiter le role de `configJson` a la configuration locale du stage, sans lui laisser redevenir un fourre-tout pour emails, grilles et regles runtime structurees
