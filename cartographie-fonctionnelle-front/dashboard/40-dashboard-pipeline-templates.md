# Dashboard Pipeline Templates

## 1. Identite

- Route: `/dashboard/pipeline-templates`
- Guard: `permissionGuard(['VIEW_PIPELINE_TEMPLATE'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/pipeline-templates/pipeline-templates.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/pipeline-templates/pipeline-templates.html`

## 2. Objectif Produit

La page sert à gérer le catalogue des modèles de pipeline de recrutement: visualisation, création, duplication, suppression, définition du modèle par défaut et accès à l’éditeur détaillé.

## 3. Etat Constate

- [x] La page charge la liste des templates actifs et les étapes associées pour chaque template.
- [x] Elle affiche un aperçu compact du pipeline via une barre d’étapes.
- [x] Un template peut être marqué `par défaut`, `verrouillé` ou `inactif`.
- [x] Un template verrouillé n’est plus modifiable directement, mais peut être dupliqué.
- [x] La création redirige vers l’éditeur du nouveau template si l’ID est renvoyé.
- [x] La duplication et la définition du template par défaut passent par des modales dédiées.
- [ ] Vérifier comment le backend détermine `isLocked` et si ce verrouillage couvre tous les cas métier attendus.
- [ ] Vérifier si la suppression est logique ou physique côté backend.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Modèles de pipeline`
- [x] bouton `Actualiser`
- [x] bouton `Nouveau modèle`

### 4.2 Filtres

- [x] recherche texte par nom et description
- [x] compteur de résultats

### 4.3 Grille des templates

- [x] cartes avec badges `Par défaut`, `Verrouillé`, `Inactif`
- [x] aperçu du nombre d’étapes
- [x] visualisation de la séquence d’étapes
- [x] menu d’actions `dupliquer`, `supprimer`
- [x] action footer `Définir par défaut`
- [x] action `Modifier` ou `Dupliquer pour modifier` selon verrouillage

### 4.4 Modales

- [x] confirmation `Définir par défaut`
- [x] duplication avec nouveau nom
- [x] création avec nom et description
- [x] suppression

## 5. Donnees Affichees

### 5.1 Template

- `id`
- `templateName`
- `templateDesc`
- `isDefault`
- `isLocked`
- `isActive`
- `createdAt`

### 5.2 Etapes liées

- `PipelineStage[]` par template
- `stageLabel`
- `stageOrder`
- `isRequired`
- `isEliminatory`

## 6. Services Et Endpoints

- `PipelineTemplateService.getAllByCriteria()` -> `/pipelineTemplate/getAllByCriteria`
- `PipelineTemplateService.create()` -> `/pipelineTemplate/create`
- `PipelineTemplateService.delete()` -> `/pipelineTemplate/delete`
- `PipelineTemplateService.setDefault()` -> `/pipelineTemplate/setDefault`
- `PipelineTemplateService.duplicate()` -> `/pipelineTemplate/duplicate`
- `PipelineStageService.getByTemplate(templateId)` -> `/pipelineStage/getByTemplate`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste de templates cohérente avec les permissions de consultation.
- Un indicateur fiable `isDefault` et un indicateur métier `isLocked` quand un pipeline n’est plus modifiable.
- Les étapes d’un template dans un ordre stable et exploitable.
- Lors d’une création, un ID immédiatement réutilisable pour rediriger vers l’éditeur.

## 8. Entites Metier Impliquees

- `pipelineTemplate`
- `pipelineStage`
- règles de verrouillage liées aux candidatures ou campagnes existantes

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le verrouillage doit-il aussi empêcher de changer le template par défaut ?
- [ ] La suppression devrait-elle être remplacée par une simple désactivation ?
- [ ] Faut-il afficher davantage d’informations de dépendance avant suppression ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/pipeline-templates` avec un utilisateur autorisé.
2. Vérifier le chargement des templates et des étapes associées.
3. Créer un nouveau modèle puis contrôler la redirection vers son édition.
4. Définir un modèle par défaut.
5. Dupliquer un modèle verrouillé et vérifier qu’il redevient modifiable.
6. Tenter une suppression sur un modèle non verrouillé.