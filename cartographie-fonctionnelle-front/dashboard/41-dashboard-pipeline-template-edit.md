# Dashboard Pipeline Template Edit

## 1. Identite

- Route: `/dashboard/pipeline-templates/:id/edit`
- Guard: `permissionGuard(['UPDATE_PIPELINE_TEMPLATE'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/pipeline-template-edit/pipeline-template-edit.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/pipeline-template-edit/pipeline-template-edit.html`

## 2. Objectif Produit

La page sert à éditer finement un modèle de pipeline: informations générales, liste ordonnée des étapes, caractéristiques métier de chaque étape et ordre d’exécution.

## 3. Etat Constate

- [x] La page charge en parallèle le template et ses étapes.
- [x] Si l’ID de route est invalide, elle redirige vers la liste des templates.
- [x] Les étapes sont éditables inline.
- [x] L’ordre peut être changé par drag and drop.
- [x] Chaque étape gère type, libellé, caractère obligatoire, éliminatoire et stratégie email.
- [x] La sauvegarde met à jour le template, puis les étapes existantes et nouvelles, puis demande un `reorder`.
- [x] La suppression d’une étape renumérote les étapes restantes.
- [ ] Vérifier si le backend bloque certains types ou combinaisons d’étapes interdites.
- [ ] Vérifier si les étapes supprimées sont soft-delete ou suppression logique dédiée.

## 4. Blocs UI Constates

### 4.1 Header

- [x] bouton retour
- [x] titre `Éditeur de pipeline`
- [x] rappel du nom du template
- [x] boutons `Annuler` et `Enregistrer`

### 4.2 Informations générales

- [x] nom du modèle
- [x] description

### 4.3 Aperçu pipeline

- [x] visualisation séquentielle des étapes
- [x] styles distincts pour obligatoire / éliminatoire

### 4.4 Editeur d’étapes

- [x] ajout d’étape
- [x] liste draggable
- [x] libellé libre
- [x] type d’étape parmi plusieurs valeurs métier
- [x] switches `Obligatoire`, `Éliminatoire`, `Email requis`, `Envoi auto`
- [x] suppression avec confirmation

## 5. Donnees Affichees Ou Editees

### 5.1 Template

- `id`
- `templateName`
- `templateDesc`

### 5.2 Etapes

- `id`
- `stageLabel`
- `stageType`
- `stageOrder`
- `isRequired`
- `isEliminatory`
- `emailRequired`
- `emailAutomatic`
- `pipelineTemplateId`

## 6. Services Et Endpoints

- `PipelineTemplateService.getAllByCriteria()` -> `/pipelineTemplate/getAllByCriteria`
- `PipelineTemplateService.update()` -> `/pipelineTemplate/update`
- `PipelineStageService.getByTemplate()` -> `/pipelineStage/getByTemplate`
- `PipelineStageService.create()` -> `/pipelineStage/create`
- `PipelineStageService.update()` -> `/pipelineStage/update`
- `PipelineStageService.delete()` -> `/pipelineStage/delete`
- `PipelineStageService.reorder(templateId, ids)` -> endpoint de réordonnancement des étapes

## 7. Ce Que Le Backend Doit Envoyer

- Le template demandé par ID, avec une réponse stable même si l’API de chargement passe encore par `getAllByCriteria` borné sur l’ID.
- Une liste d’étapes ordonnée, ou au minimum réordonnable via `stageOrder`.
- Des endpoints capables de supporter un mix `update/create/delete/reorder` dans une même session d’édition.
- Une validation métier cohérente des flags email et des types d’étape.

## 8. Entites Metier Impliquees

- `pipelineTemplate`
- `pipelineStage`
- règles de workflow recrutement

## 9. Questions Ou Ecarts A Qualifier

- [ ] Certaines étapes devraient-elles être uniques dans un pipeline, par exemple `DECISION` ?
- [ ] Faut-il interdire des pipelines sans étape ou avec une première étape non conforme ?
- [ ] Le front doit-il afficher les erreurs de validation détaillées renvoyées par le backend ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/pipeline-templates/:id/edit` avec un template existant.
2. Modifier le nom et la description.
3. Ajouter plusieurs étapes et varier leurs flags.
4. Réordonner les étapes par glisser-déposer.
5. Supprimer une étape puis sauvegarder.
6. Recharger la page et vérifier la persistance de l’ordre et des attributs.