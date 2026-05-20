# Entities Pipeline Templates

## 1. Identite

- Routes: `/dashboard/entities/pipeline-templates` et `/dashboard/entities/pipeline-templates/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/pipeline-templates/entities-pipeline-templates.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/pipeline-templates/entities-pipeline-templates.html`

## 2. Objectif Produit

La page administre les templates de pipeline sous forme de CRUD generique. Elle permet de consulter, creer, modifier, supprimer et restaurer des templates, mais reste nettement plus pauvre que les ecrans pipeline specialises du dashboard qui gerent duplication, template par defaut, apercu des etapes et edition detaillee.

Le premier slice BL-008 pose maintenant explicitement cette route comme surface technique et renvoie vers la page metier de reference `/dashboard/pipeline-templates` pour la gestion quotidienne.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec `PipelineTemplateService`.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/pipeline-templates`.
- [x] Les filtres avances couvrent nom, `isDefault`, `isActive`, `isLocked`, suppression et plages de dates.
- [x] Le tableau affiche nom, description, template par defaut, actif, verrouille et date de creation.
- [x] Les modales create/edit permettent de saisir `templateName`, `templateDesc`, `isDefault` et `isActive`.
- [x] Le detail panel et le popup de dependances FK sont montes en bas de page.
- [x] Le service expose deux helpers pipeline absents de cette route: `setDefault()` et `duplicate()`.
- [x] Le repo indique qu'un template utilise est verrouille puis duplique pour evoluer, sans vrai versioning multi-revisions.
- [x] Des ecrans plus riches existent deja ailleurs: `dashboard/pipeline-templates` et `dashboard/pipeline-templates/:id/edit`.
- [x] Les cles de colonnes sont alignees sur le DTO reel `templateName`, `templateDesc`, `isActive`, `isLocked`.
- [x] La route expose maintenant une action `Dupliquer` et une modale de duplication pre-remplie avec le suffixe `(copie)`.
- [x] La route expose maintenant une action `Definir par defaut` avec confirmation explicite.
- [x] Les templates verrouilles n'affichent plus les actions d'edition et suppression directes dans la grille ni dans le detail panel; la duplication devient le chemin d'evolution assume.
- [ ] La route ne montre ni le nombre d'etapes ni un apercu de la sequence d'etapes, contrairement a la page catalogue specialisee.
- [ ] La guard `MANAGE_APP_CONFIG` ne reflète pas les permissions pipeline specialisees documentees sur les ecrans dashboard (`VIEW_PIPELINE_TEMPLATE`, `UPDATE_PIPELINE_TEMPLATE`).

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] sous-texte qui explicite le statut de surface technique
- [x] bouton `Page metier`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `templateName`
- [x] filtre `isDefault`
- [x] filtre `isActive`
- [x] filtre `isLocked`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `templateName`, `templateDesc`, `isDefault`, `isActive`, `isLocked`, `createdAt`
- [x] badges booleens pour par defaut, actif et verrouille
- [x] actions `Dupliquer`, `Definir par defaut`, `Modifier`, `Supprimer`, `Restaurer` selon l'etat metier reel du template
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] confirmation `Definir par defaut`
- [x] modale `Dupliquer`
- [x] creation template pipeline
- [x] edition template pipeline

## 5. Donnees Affichees Ou Editees

- `id`
- `templateName`
- `templateDesc`
- `isDefault`
- `isActive`
- `isLocked`
- `createdAt`
- `updatedAt`
- `isDeleted`
- `stages[]`

## 6. Services Et Endpoints

- liste CRUD via `PipelineTemplateService.getAllByCriteria()` -> `POST /pipelineTemplate/getByCriteria`
- creation via `create()` -> `POST /pipelineTemplate/create`
- edition via `update()` -> `POST /pipelineTemplate/update`
- suppression via `delete()` -> `POST /pipelineTemplate/delete`
- restauration via `restore()` -> `POST /pipelineTemplate/update`
- definition du template par defaut disponible via `setDefault()` -> `POST /pipelineTemplate/setDefault`
- duplication disponible via `duplicate()` -> `POST /pipelineTemplate/duplicate`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getByCriteria` pagine avec `items` ou `item`, plus `count` ou `totalCount`, compatible avec le mapping du service.
- Des flags fiables `isDefault`, `isActive`, `isLocked`, cruciaux pour l'administration pipeline.
- Une politique coherente de verrouillage pour les templates deja utilises par des campagnes ou candidatures.
- Des mutations distinctes pour la duplication et la definition du template par defaut, si le produit continue a les traiter comme actions metier a part entiere.

## 8. Entites Metier Impliquees

- `pipelineTemplate`
- `pipelineStage`
- campagnes actives rattachees a un template pipeline
- strategie de duplication sur template verrouille

## 9. Questions Ou Ecarts A Qualifier

- [x] Un template verrouille n'est plus editable directement depuis cette route CRUD; la duplication est le chemin assume.
- [x] `duplicate()` et `setDefault()` sont exposes ici comme actions metier dediees.
- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que la page metier de reference est `/dashboard/pipeline-templates`.
- [ ] La route doit-elle afficher le nombre d'etapes ou un lien vers l'editeur detaille ?
- [ ] La guard devrait-elle etre alignee sur les permissions pipeline specialisees ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/pipeline-templates` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/pipeline-templates`.
3. Filtrer par nom, statut par defaut et verrouillage.
4. Creer un template puis verifier son apparition dans la liste.
5. Dupliquer un template et verifier la creation d'une copie pre-remplie.
6. Definir un template non par defaut comme modele par defaut et verifier le retour de succes.
7. Verifier qu'un template verrouille ne propose plus d'edition ou suppression directe mais reste duplicable.
8. Modifier nom, description et flags d'activation sur un template non verrouille.
9. Supprimer puis restaurer un template.
