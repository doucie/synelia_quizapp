# Dashboard Candidates

## 1. Identite

- Route: `/dashboard/candidates`
- Guard: `permissionGuard(['VIEW_APPLICATIONS'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/applications/applications.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/applications/applications.html`
- Particularite: la page supporte des fragments `#campaign<id>` et `#application-<id>`

## 2. Objectif Produit

La page sert a suivre les candidatures reliees aux campagnes accessibles, avec filtres transverses par campagne, source, partage et etape pipeline.

## 3. Etat Constate

- [x] La page charge un jeu composite de donnees: campagnes, acces campagne, candidatures, source tokens, pipeline et progression.
- [x] Un bandeau `campagne verrouillee` est prevu quand l'URL contient un fragment `#campaign<id>`.
- [x] La page expose des cartes de statistiques `Total`, `En attente`, `Verifies`, `Quiz completes`.
- [x] Une recherche globale est disponible.
- [x] Des filtres existent pour `Campagnes partagees uniquement`, `Campagne`, `Source` et `Etape pipeline`.
- [x] Les suggestions de campagnes et de sources sont interactives.
- [x] La page peut reconstruire les campagnes suivies a partir des candidatures reelles.
- [ ] Verifier visuellement toute la partie preview CV / focus candidature qui existe cote TS.
- [ ] Verifier le comportement exact du fragment `#application-<id>` dans l'UI finale.

## 4. Blocs UI Constates

### 4.1 Header

- [x] Titre `Candidatures`
- [x] Badge de total
- [x] Bouton `Reinitialiser`
- [x] Bouton `Actualiser`

### 4.2 Statistiques

- [x] Total candidatures
- [x] Candidatures en attente
- [x] Emails verifies
- [x] Quiz completes

### 4.3 Filtres

- [x] Recherche texte par nom / email / campagne
- [x] Checkbox `Campagnes partagees uniquement`
- [x] Recherche campagne avec suggestions
- [x] Recherche source avec suggestions
- [x] Filtre `Etape pipeline` si des etapes sont disponibles

### 4.4 Cas particulier d'entree

- [x] Bandeau `Campagne verrouillee`
- [x] Possibilite de deverrouiller et revenir a la vue globale

## 5. Donnees Affichees

La page a besoin au minimum de:

### 5.1 Candidature

- `id`
- `candidateFirstName`
- `candidateLastName`
- `candidateEmail`
- `applicationStatus`
- `emailVerified`
- `quizStatus`
- `sourceTokenId`

### 5.2 Enrichissement campagne / source

- `campaignId`
- `campaignTitle`
- `sourceTokenLabel`

### 5.3 Progression pipeline

- liste des `PipelineStage`
- liste des `ApplicationProgress`
- relation entre candidature, etape et `progressStatus`

### 5.4 Acces campagne

- droits ou acces permettant de savoir si une campagne est partagee et exploitable

## 6. Services Et Endpoints

### 6.1 Chargement principal

- `CampaignService.getAllCampaignsByCriteria()` -> `POST /campaigns/getAllByCriteria`
- `CampaignService.getMyCampaigns()` -> `POST /campaigns/getByCriteria`
- `CampaignService.getSharedCampaigns()` -> derive les campagnes partagees a partir des acces campagne
- `CampaignService.getCampaignAccessesByUser()` -> endpoint d'acces campagne cote service
- `ApplicationService.getApplicationsByCriteria()` -> `POST /applications/getByCriteria`
- `SourceTokenService.getSourceTokensByCriteria()` -> `POST /sourceToken/getByCriteria`

### 6.2 Enrichissements secondaires

- `PipelineStageService.getAllByCriteria()` -> `POST /pipelineStage/getAllByCriteria`
- `ApplicationProgressService.getAllByCriteria()` -> `POST /applicationProgress/getAllByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Des candidatures avec identite candidat stable et etat d'avancement exploitable.
- Des `sourceToken` relies a une `campaignId` exploitable pour l'enrichissement.
- Des campagnes non supprimees pour resoudre `campaignTitle` et les suggestions.
- Des acces campagne ou permissions permettant de distinguer `partagee` vs `createur`.
- Des etapes pipeline et des progressions dont les IDs correspondent reellement aux candidatures chargees.
- Des enums `applicationStatus`, `quizStatus`, `progressStatus` coherents et normalises.

## 8. Entites Metier Impliquees

- `application`
- `campaign`
- `sourceToken`
- `pipelineStage`
- `applicationProgress`
- acces / permissions de campagne

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le backend doit-il fournir directement `campaignTitle` et `sourceTokenLabel` sur la candidature pour alleger l'enrichissement front ?
- [ ] La notion de `campagnes suivies` doit-elle etre explicite serveur plutot que reconstruite depuis les candidatures ?
- [ ] Quelle est la regle officielle sur les fragments `#campaign<id>` et `#application-<id>` ?
- [ ] La page doit-elle etre paginee serveur quand le volume augmente ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/candidates` avec un utilisateur ayant `VIEW_APPLICATIONS`.
2. Verifier les stats `Total`, `En attente`, `Verifies`, `Quiz completes`.
3. Taper une recherche par nom, email et campagne.
4. Activer `Campagnes partagees uniquement` et verifier la reduction du jeu.
5. Ouvrir la page avec `#campaign<id>` puis deverrouiller.
6. Choisir une campagne, une source et une etape pipeline, puis verifier que la liste suit bien ces filtres.
7. Noter les champs backend manquants qui obligent encore le front a enrichir localement.