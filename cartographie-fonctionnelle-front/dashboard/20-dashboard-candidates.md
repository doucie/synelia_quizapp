# Dashboard Candidates

## 1. Identite

- Route: `/dashboard/candidates`
- Guard: `permissionGuard(['VIEW_APPLICATIONS'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/applications/applications.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/applications/applications.html`
- Particularite actuelle: la page supporte des fragments `#campaign<id>` et `#application-<id>`
- Cible produit: le detail candidature doit sortir du fragment `#application-<id>` pour devenir une vraie page `/dashboard/candidates/:id`, documentee dans `21-dashboard-candidate-detail.md`, distincte de la liste et sans popup de fiche candidat.

## 2. Objectif Produit

La page sert a suivre les candidatures reliees aux campagnes accessibles, avec filtres transverses par campagne, source, partage et etape pipeline.

Le parcours cible separe la liste `/dashboard/candidates` du cockpit de detail `/dashboard/candidates/:id`, afin de piloter une candidature sur une page dediee plutot que dans une popup ou un focus embarque.

La cartographie de la page detail dediee est maintenant portee par `21-dashboard-candidate-detail.md`; cette fiche conserve la responsabilite de la liste, des filtres et du passage vers le detail.

## 3. Etat Constate

- [x] La page charge un jeu composite de donnees: campagnes, acces campagne, candidatures, source tokens, pipeline et progression.
- [x] Un bandeau `campagne verrouillee` est prevu quand l'URL contient un fragment `#campaign<id>`.
- [x] La page expose des cartes de statistiques `Total`, `En attente`, `Verifies`, `Quiz completes`.
- [x] Une recherche globale est disponible.
- [x] Des filtres existent pour `Campagnes partagees uniquement`, `Campagne`, `Source` et `Etape pipeline`.
- [x] Les suggestions de campagnes et de sources sont interactives.
- [x] La page peut reconstruire les campagnes suivies a partir des candidatures reelles.
- [x] Les cartes candidature exposent deja des actions rapides inline sur l'etape courante: `Valider`, `Refuser` et maintenant `Ignorer` quand l'etape est reellement skippable.
- [x] La logique front de skip est alignee sur l'API: une etape peut etre ignoree si elle n'est pas requise, ou si `configJson.allowSkip=true` meme quand `isRequired=true`.
- [x] Une etape avec `emailRequired=true` n'affiche plus `Ignorer` tant que l'email requis n'a pas ete marque envoye, pour eviter un pipeline bloque apres skip.
- [x] L'action `Voir les details` pointe encore vers `/dashboard/candidates#application-<id>` et non vers une vraie route dediee.
- [ ] La page doit faire remonter un indicateur visible `Correction manuelle requise` sur la candidature quand le quiz est termine mais qu’au moins une question attend encore une correction recruteur.
- [ ] Verifier visuellement toute la partie preview CV / focus candidature qui existe cote TS.
- [ ] Sortir le focus candidature actuellement pilote par `#application-<id>` vers une vraie route `/dashboard/candidates/:id`.
- [ ] Le detail candidat doit devenir un cockpit dedie de gestion pipeline sur une page distincte, pas une popup locale ni un panneau ouvert dans la liste.
- [ ] Definir la frise complete et les blocs obligatoires de la page `/dashboard/candidates/:id`: progression, blocages, historique utile et actions disponibles.
- [ ] Definir quelles actions rapides restent inline sur la page detail et lesquelles redirigent vers les ecrans metier existants deja pre-remplis.

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

### 4.5 Actions pipeline inline

- [x] action rapide `Valider` sur l'etape courante quand le statut et les droits campagne le permettent
- [x] action rapide `Refuser` sur l'etape courante quand le statut et les droits campagne le permettent
- [x] action rapide `Ignorer` sur l'etape courante quand l'etape est skippable selon `isRequired` ou `configJson.allowSkip`, et qu'aucun email requis n'est encore en attente

### 4.6 Indicateurs quiz

- [ ] badge ou indicateur `Correction manuelle requise` sur la candidature quand le quiz n'est pas entierement note automatiquement
- [ ] distinction visible entre `Correction manuelle requise` et `Correction manuelle terminee` si le backend expose un statut plus riche qu'un simple booléen

### 4.7 Cible detail candidature

- [ ] route dediee `/dashboard/candidates/:id` avec chargement direct par `applicationId`
- [ ] header avec identite candidat, campagne, statut global, et action de retour vers la liste
- [ ] frise pipeline complete avec etape courante, etapes passees, etapes bloquees et prochaines actions
- [ ] zone d'actions contextuelles pour `planifier un entretien`, `ouvrir l'evaluation`, `ouvrir la decision`, `declencher un email`, `passer ou sauter une etape`
- [ ] liens ou redirections pre-remplis vers les pages metier existantes quand l'action sort du cockpit
- [ ] absence de popup de detail: la liste ouvre la page dediee et la page dediee reste deep-linkable

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
- `quizManualCorrectionRequired` ou derive front equivalent depuis un statut backend plus riche
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

### 5.5 Contexte detail candidature

- `applicationId`
- `campaignId`
- `currentStageId`
- `currentStageType`
- `currentStageLabel`
- `nextAllowedActions[]`
- `canSkipCurrentStage` calcule selon `isRequired=false` ou `configJson.allowSkip=true`, puis bloque tant que `emailRequired=true` et `mailSent=false`

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
- Un indicateur exploitable de correction manuelle du quiz sur la candidature apres soumission, idealement assez riche pour distinguer `non requise`, `requise` et `terminee` meme si le front n'affiche d'abord qu'un booléen.

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
- [ ] Le fragment `#campaign<id>` reste-t-il pertinent pour verrouiller la liste une fois le detail deplace sur `/dashboard/candidates/:id` ?
- [ ] La page doit-elle etre paginee serveur quand le volume augmente ?
- [ ] Le front doit-il afficher seulement un booléen `correction manuelle requise`, ou exploiter un statut plus fin cote backend pour distinguer `requise` et `terminee` ?
- [ ] Quel niveau de detail doit afficher la frise pipeline sur `/dashboard/candidates/:id` avec les statuts `PENDING / IN_PROGRESS / PASSED / FAILED / SKIPPED` ?
- [ ] Quelles actions restent inline sur `/dashboard/candidates/:id` et lesquelles redirigent vers les pages metier existantes deja pre-remplies ?
- [ ] Quelles actions rapides sont autorisees par type d’etape et par permission campagne/pipeline ?

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
8. Sur une candidature dont le quiz contient au moins une question a correction manuelle, verifier qu'un indicateur `Correction manuelle requise` apparait apres la soumission du test.
9. Sur une candidature avec etape courante skippable, verifier que le bouton `Ignorer` apparait, que l'action passe l'etape en `SKIPPED` et que la progression avance bien vers l'etape suivante.
10. Sur une etape courante avec `emailRequired=true`, verifier que `Ignorer` reste masque tant que l'email n'est pas marque envoye, puis reapparait une fois l'envoi enregistre si la configuration autorise encore le skip.

## 11. Backlog Produit Ouvert

- [ ] Creer la page dediee `/dashboard/candidates/:id` pour le detail candidature, avec vue complete de l’avancement pipeline: etapes, statut courant, etapes passees, prochaines actions et blocages.
- [ ] Faire de `/dashboard/candidates` une vraie liste maitre et remplacer le focus `#application-<id>` par une navigation vers la page detail dediee.
- [ ] Ajouter des actions rapides contextuelles depuis la page detail selon l’etape courante (`planifier un entretien`, `ouvrir le quiz/test`, `envoyer l’email requis`, `passer ou sauter l’etape`, `ouvrir la decision`).
- [ ] Definir pour chaque action si elle se traite inline sur `/dashboard/candidates/:id` ou via redirection vers l’ecran existant deja pre-rempli; la fiche candidat elle-meme ne doit jamais etre une popup.
- [ ] Pre-remplir la creation d’entretien depuis `/dashboard/candidates` avec la campagne, la candidature et l’etape pipeline ciblee.
- [ ] Preserver ou restaurer les filtres de la liste lors du retour depuis `/dashboard/candidates/:id` vers `/dashboard/candidates`.
- [ ] Verifier les permissions pour que seules les actions autorisees apparaissent selon les droits campagne et pipeline.
- [ ] Transformer le parcours candidats en cockpit unifie de gestion candidature: liste filtrable + page detail dediee, sans perdre la lisibilite des filtres, stats et recherches existants.

## 12. Impact Cible Multi-Occurrences

- [ ] remplacer les heuristiques de liste basees sur `applicationStatus`, `quizStatus` et les scores globaux par le round courant issu de `application_progress`
- [ ] afficher plusieurs rounds `QUIZ`, `PRESELECTION` et `INTERVIEW` sur une meme candidature sans les ecraser en un statut unique
- [ ] faire partir les quick actions du round courant et de ses preconditions reelles, pas d'un snapshot global de candidature
- [ ] remplacer le resume quiz unique par des resumes de tentatives `application_quiz_attempt`
- [ ] exposer `aggregatedQuizScore*` et `aggregatedEvaluationScore*` seulement comme indicateurs calcules de synthese, jamais comme moteur de lecture du parcours
- [ ] rendre visible `applicationAbandoned` comme verrou global de candidature distinct de la chronologie fine des rounds, avec blocage des quick actions quand ce verrou est actif
