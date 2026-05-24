# Dashboard Interviews

## 1. Identite

- Route: `/dashboard/interviews`
- Guard: `permissionGuard(['VIEW_INTERVIEWS'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/interviews/interviews.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/interviews/interviews.html`
- Route voisine principale: `/dashboard/interviews/create`

## 2. Objectif Produit

La page sert a planifier, filtrer, lancer et suivre les entretiens des candidats, avec enrichissement par candidature, campagne, permissions et participants.

## 3. Etat Constate

- [x] La page charge `interviews`, `applications`, `campaigns` et `candidateInterviews` en parallele.
- [x] Elle enrichit localement chaque entretien avec nom candidat, email, campagne et etat de reponse candidat.
- [x] Les statuts `PENDING`, `SCHEDULED`, `POSTPONED`, `STARTED`, `OVER` ont des compteurs dedies dans le header.
- [x] Une recherche texte est disponible.
- [x] Des chips de filtre par statut sont montees.
- [x] La page bascule entre vue `list` et vue `calendar`.
- [x] Un CTA `Planifier un entretien` existe.
- [x] Les cartes listent au minimum le candidat, la date, le lieu ou lien visio, le type et la campagne.
- [x] Des actions existent pour modifier, demarrer et evaluer selon le statut.
- [x] La page recupere aussi des permissions d'entite et des participants pour certaines actions d'edition / demarrage.
- [ ] Verifier la vue calendrier complete et ses ecarts par rapport a la vue liste.
- [ ] Verifier si `openCreateModal()` redirige toujours vers la page dediee et non plus vers une vraie modale legacy.

## 4. Blocs UI Constates

### 4.1 Header

- [x] Titre `Gestion des Entretiens`
- [x] Sous-titre explicatif
- [x] Chips de stats par statut

### 4.2 Controles

- [x] Recherche texte
- [x] Filtres par statut
- [x] Bouton de bascule liste / calendrier
- [x] Bouton `Planifier un entretien`

### 4.3 Cartes d'entretien

- [x] Avatar / initiales candidat
- [x] Nom et email candidat
- [x] Badge statut entretien
- [x] Date et heure
- [x] Lieu ou lien visio
- [x] Type d'entretien
- [x] Campagne
- [x] Carte de reponse candidat si report ou refus
- [x] Badge etat email envoye / non envoye
- [x] Bouton `Modifier` hors `STARTED`
- [x] Bouton `Demarrer` pour `SCHEDULED`
- [x] Bouton `Evaluer` pour `STARTED`

### 4.4 Etats techniques

- [x] Loading overlay
- [x] Etat vide avec CTA de creation

## 5. Donnees Affichees

### 5.1 Entretien

- `id`
- `applicationId`
- `campaignId`
- `interviewDate`
- `interviewLocation`
- `meetLink`
- `interviewStatus`
- `interviewType`
- `interviewMailSent`
- `interviewNote`
- `interviewEvaluationsLink`

### 5.2 Enrichissement candidature / campagne

- `candidateFirstName`
- `candidateLastName`
- `candidateEmail`
- `campaignTitle`
- `quizScorePercent`

### 5.3 Reponse candidat

- `declineReason`
- `alternativeDateRequested`
- `candidateResponseState`

### 5.4 Permissions / participants

- permissions sur `CAMPAIGN` ou `INTERVIEW`
- participants associes a un entretien

## 6. Services Et Endpoints

### 6.1 Chargement principal

- `InterviewService.getAllInterviews()` -> `POST /interviews/getByCriteria`
- `ApplicationService.getApplicationsByCriteria()` -> `POST /applications/getByCriteria`
- `CampaignService.getAllCampaignsByCriteria()` -> `POST /campaigns/getAllByCriteria`
- `CandidateInterviewEntityService.getAllByCriteria()` -> `POST /candidateInterview/getAllByCriteria`

### 6.2 Actions et enrichissements

- `InterviewService.createInterview()` -> `POST /interviews/create`
- `InterviewService.updateInterview()` -> `POST /interviews/update`
- `EntityPermissionService.getForEntity()` -> `POST /entityPermission/getForEntity`
- `InterviewParticipantService.getByInterviewId()` / `getAllByCriteria()` -> endpoints `interviewParticipant`

## 7. Ce Que Le Backend Doit Envoyer

- Des entretiens relies proprement a `applicationId` et `campaignId`.
- Des dates parsables pour tri, vue calendrier et affichage detail.
- Un `interviewStatus` strictement normalise.
- Les champs necessaires pour distinguer presentiel / visio.
- Les infos ou liens d'evaluation si l'entretien est demarre ou termine.
- Les retours candidat de type report ou refus, avec dates et motif si disponibles.
- Les permissions d'entite suffisantes pour savoir qui peut modifier, planifier ou demarrer.
- Les participants si la composition du jury doit etre visible / modifiable.

## 8. Entites Metier Impliquees

- `interview`
- `application`
- `campaign`
- `candidateInterview`
- `interviewParticipant`
- `entityPermission`

## 9. Questions Ou Ecarts A Qualifier

- [ ] La page doit-elle charger toutes les interviews sans pagination ?
- [ ] Les permissions de modification / demarrage doivent-elles venir deja resolues par entretien ?
- [ ] Quelle est la source de verite officielle du statut de reponse candidat: `candidateInterview` seulement, ou autre endpoint possible ?
- [ ] Le bouton `Evaluer` doit-il toujours rediriger vers le plein ecran `/dashboard/evaluate/:link` ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/interviews` avec un utilisateur ayant `VIEW_INTERVIEWS`.
2. Verifier les compteurs par statut dans le header.
3. Rechercher un candidat puis filtrer `Planifies`, `A replanifier`, `En cours`, `Termines`.
4. Ouvrir un entretien `SCHEDULED` et verifier la disponibilite du bouton `Demarrer`.
5. Ouvrir un entretien `STARTED` et verifier la disponibilite du bouton `Evaluer`.
6. Verifier l'affichage d'un report candidat ou d'un refus si des donnees existent.
7. Basculer en vue calendrier et noter les ecarts de comportement / donnees.