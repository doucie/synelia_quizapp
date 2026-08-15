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
- [x] Un template verrouillé n'est plus gelé en bloc: seules les étapes réellement atteintes par des candidats sont verrouillées (versionnage fin par révisions actives/inactives, 440 Lot B).
- [x] La création redirige vers l’éditeur du nouveau template si l’ID est renvoyé.
- [x] La creation actuelle ne demande que `nom` et `description`, puis renvoie vers l'editeur detaille pour configurer les etapes.
- [x] La duplication et la définition du template par défaut passent par des modales dédiées.
- [x] Cote backend, `PipelineTemplateBusiness.create()` cree maintenant un template `isActive=false` par defaut si la valeur n'est pas fournie, puis initialise `CANDIDATURE` et `DECISION`.
- [x] Cote backend, `setAsDefault()` refuse maintenant un template inactif et bloque aussi un template actif mais structurellement incomplet (bornes, ordre, au moins une étape intermédiaire, types supportés, cohérence email minimale).
- [x] Cote backend, la désactivation d'un template est maintenant refusée s'il est encore rattaché à une campagne ouverte.
- [x] Cote backend, le verrouillage n'est plus binaire: le template reste modifiable une fois utilisé, seules les étapes réellement atteintes passent en révision inactive et une nouvelle révision active est créée/réactivée (`saveTemplateStages`, `applyTargetConfig`); la suppression d'un template utilisé reste bloquée.
- [x] Cote backend, `application_progress` snapshotte deja toutes les etapes du template lors de la creation d'une candidature, avec statut `PENDING` avant activation de la premiere etape.
- [x] Cote backend, l'accès candidat/public a une campagne ouverte est maintenant bloqué si le pipeline configuré n'est pas actif.
- [x] Cote frontend, la liste expose maintenant un état de readiness minimale par carte (`Prêt à activer`, `À compléter`, `Incomplet`) calculé sur les étapes chargées, avec le même garde-fou structurel que l’éditeur.
- [x] Cote frontend, la liste propose désormais toujours `Modifier`: un template utilisé s'ouvre directement dans l'éditeur qui verrouille les étapes atteintes et laisse les autres éditables.
- [x] Le backend détermine le verrou d'étape par usage réel (`findUsedStageIds`, statut `!= PENDING` dans `application_progress`); le verrou template (`is_locked`) est conservé en base mais ne bloque plus l'édition.
- [x] Les configurations détaillées d'une étape (règles de notification et grille d'évaluation des étapes INTERVIEW) sont désormais éditables depuis l'éditeur (`pipeline-template-edit`, 440 Lots C/D) ; cette liste reste l'accès au catalogue et au niveau de readiness.
- [x] Vérifier si la suppression est logique ou physique côté backend — suppression logique (soft-delete) via `deleted=1`; un template utilisé reste bloqué en suppression.
- [x] Bloquer `Definir par defaut` tant qu'un template actif ne respecte pas les invariants structurels minimaux; la grille complète `pipeline pret a produire` reste à formaliser.
- [x] Créer les nouveaux templates en brouillon inactif tant que l'utilisateur n'a pas explicitement termine la configuration et active le pipeline.
- [x] Faire evoluer le catalogue vers un versionning par `pipeline_stage` actif/inactif, afin d'eviter le gel complet du template au premier candidat.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Modèles de pipeline`
- [x] bouton `Actualiser`
- [x] bouton `Nouveau modèle`

### 4.2 Filtres

- [x] recherche texte par nom et description
- [x] compteur de résultats

### 4.3 Grille des templates

- [x] cartes avec badges `Par défaut`, `Verrouillé`, `Brouillon`
- [x] badge de readiness minimale `Prêt à activer` / `À compléter` / `Incomplet` selon la structure du pipeline
- [x] aperçu du nombre d’étapes
- [x] visualisation de la séquence d’étapes
- [x] menu d’actions `dupliquer`, `supprimer`
- [x] action footer `Définir par défaut`, désactivée pour un template inactif ou structurellement incomplet avec motif lisible
- [x] action `Modifier` proposée pour tous les templates; un template utilisé affiche un badge `Utilisé` et s'ouvre directement dans l'éditeur (verrou par étape)
- [x] un template utilisé mais legacy incomplet remonte désormais un libellé explicite `Legacy à nettoyer` sur la carte

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
- `isActive` cible sur `pipeline_stage`
- `isLocked` cible calculee par usage reel de l'etape, pas par simple appartenance au template

## 6. Services Et Endpoints

- `PipelineTemplateService.getAllByCriteria()` -> `/pipelineTemplate/getAllByCriteria`
- `PipelineTemplateService.create()` -> `/pipelineTemplate/create`
- `PipelineTemplateService.delete()` -> `/pipelineTemplate/delete`
- `PipelineTemplateService.setDefault()` -> `/pipelineTemplate/setDefault`
- `PipelineTemplateService.duplicate()` -> `/pipelineTemplate/duplicate`
- `PipelineStageService.getByTemplate(templateId)` -> `/pipelineStage/getByTemplate`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste de templates cohérente avec les permissions de consultation.
- Un indicateur fiable `isDefault` et un indicateur métier `isLocked` (template) / par étape (`isLocked` dérivée de l'usage réel).
- Un indicateur fiable `isActive` permettant de distinguer un brouillon inactif d'un pipeline effectivement utilisable.
- Un resume exploitable de la version active des etapes et des etapes historiques inactives lorsqu'un template a deja evolue.
- Les étapes d’un template dans un ordre stable et exploitable.
- Lors d’une création, un ID immédiatement réutilisable pour rediriger vers l’éditeur, sans rendre le template utilisable tant qu'il n'a pas ete active explicitement.

## 8. Entites Metier Impliquees

- `pipelineTemplate`
- `pipelineStage`
- règles de verrouillage liées aux candidatures ou campagnes existantes

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le verrouillage doit-il aussi empêcher de changer le template par défaut ?
- [ ] La suppression devrait-elle être remplacée par une simple désactivation ?
- [ ] Faut-il afficher davantage d’informations de dépendance avant suppression ?
- [x] La liste expose déjà un état visible de readiness minimale avant autorisation de `Definir par defaut`; il reste à définir la vraie sémantique `pret a produire` complète.
- [x] Un template verrouillé s'ouvre désormais directement dans l'éditeur (verrou par étape atteinte, revisions); la duplication reste un chemin de copie, plus l'unique chemin de correction.
- [ ] Le verrouillage doit-il partir des le premier candidat actuel, ou plus tot des qu'un template est rattache a une campagne active ?
- [x] Quel mecanisme technique garantit `un seul stage actif` par couple `(pipeline_template_id, stage_order)` sans limiter le nombre de revisions inactives historiques sur ce meme slot ? — colonne generee `active_slot` + `UNIQUE(pipeline_template_id, active_slot)` (V1_082).

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/pipeline-templates` avec un utilisateur autorisé.
2. Vérifier le chargement des templates et des étapes associées.
3. Créer un nouveau modèle puis contrôler la redirection vers son édition.
4. Définir un modèle par défaut.
5. Dupliquer un modèle verrouillé et vérifier qu’il redevient modifiable.
6. Tenter une suppression sur un modèle non verrouillé.

## 11. Backlog Produit Ouvert

- [x] Interdire `Definir par defaut` sur un template actif mais structurellement incomplet, avec remontée du motif backend dans la modale/notification.
- [x] Afficher sur la liste un etat de readiness minimale aligne sur le garde-fou structurel de l'editeur (`Prêt à activer` / `À compléter` / `Incomplet`).
- [ ] Faire evoluer cet etat minimal vers une vraie grille `pret a produire` / `a completer` couvrant toute la readiness metier.
- [ ] Lors de `Nouveau modele` ou `Dupliquer pour modifier`, initialiser systematiquement `CANDIDATURE` et `DECISION` avant ouverture de l'editeur.
- [x] Creer tout nouveau template en `isActive=false` par defaut, meme si `CANDIDATURE` et `DECISION` sont injectees automatiquement a la creation.
- [x] Empêcher tout usage operationnel d'un template inactif au-dela du `setDefault` deja bloque: impossible pour une campagne active, impossible cote candidat.
- [x] Exposer sur la carte ou la modale un motif lisible `Brouillon inactif` / `Configuration incomplete` tant que l'utilisateur n'a pas active explicitement le template depuis l'editeur.
- [x] Exposer aussi dans la liste les templates utilisés encore legacy incomplets, avec une orientation claire vers l'éditeur (verrou par étape) puis `Dupliquer` si nécessaire.
- [ ] Exposer dans la liste la difference entre `template brouillon`, `template pret`, `template avec revisions historiques` et `template avec candidats a migrer`.

## 12. Impact Cible Multi-Occurrences

La cible BA du 2026-05-30 change le role de cette page: elle ne doit plus presenter un pipeline mono-occurrence, mais un catalogue capable d'assumer plusieurs rounds `QUIZ`, `PRESELECTION` et `INTERVIEW`.

- [ ] afficher explicitement que `QUIZ`, `PRESELECTION` et `INTERVIEW` sont repetables dans un meme template
- [ ] retirer `EVALUATION` des apercus d'etapes configurables de premier niveau
- [ ] distinguer visuellement `template legacy mono-occurrence a migrer`, `template multi-round pret` et `template en transition`
- [ ] remonter dans la readiness catalogue les nouveaux objets de config: notifications de stage, screening quiz optionnel par round, grille d'evaluation d'entretien
- [ ] signaler les templates dont la structure impose une migration de candidatures avant activation ou duplication
- [ ] rendre visible l'usage d'une bibliotheque mutualisee de grilles d'evaluation et le besoin de versionnement/snapshot pour les rounds d'entretien
