# Dashboard Interview Create

## 1. Identite

- Route: `/dashboard/interviews/create`
- Guard: `interviewCreateGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/interview-create/interview-create.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/interview-create/interview-create.html`

## 2. Objectif Produit

La page sert à planifier des entretiens en masse pour plusieurs candidats d’une même campagne, avec sélection des évaluateurs et gestion optionnelle de l’envoi d’email.

## 3. Etat Constate

- [x] La page charge les campagnes accessibles selon permissions ou accès campagne.
- [x] Elle supporte un préremplissage via `queryParam` de campagne et candidature.
- [x] Les candidats éligibles sont filtrés sur les candidatures `PRE_SCREEN_ACCEPTED` de la campagne choisie.
- [x] Les évaluateurs sont déduits des permissions d’entité sur la campagne, puis enrichis par fiches utilisateur.
- [x] La création est multi-candidats: un entretien par candidature sélectionnée.
- [x] Après création, la page crée aussi les participants d’entretien et copie certaines permissions d’entité vers les entretiens.
- [x] L’envoi d’email est piloté par un récapitulatif et une confirmation finale.
- [ ] Vérifier visuellement les modales de résumé, d’aperçu email et d’avertissement `sans email`.
- [ ] Vérifier la stratégie réelle de copie des permissions `INTERVIEW` et ses limites.

## 4. Blocs UI Constates

### 4.1 Header

- [x] bouton retour
- [x] titre `Planifier des entretiens`
- [x] sous-titre expliquant la création multiple

### 4.2 Étape 1: Campagne

- [x] sélection d’une campagne accessible

### 4.3 Étape 2: Candidats

- [x] liste des candidats éligibles
- [x] sélection multiple
- [x] actions `Tout sélectionner` / `Tout désélectionner`
- [x] état vide si aucun candidat n’est éligible

### 4.4 Étape 3: Détails entretien

- [x] date et heure
- [x] type `IN_PERSON` ou `ONLINE`
- [x] champ lieu ou lien selon le type
- [x] note d’entretien

### 4.5 Étape 4: Évaluateurs

- [x] évaluateurs désignés par la campagne
- [x] recherche d’évaluateurs supplémentaires
- [x] sélection multiple

### 4.6 Confirmation

- [x] résumé avant création
- [x] décision d’envoi ou non des emails
- [x] aperçu email généré côté front

## 5. Donnees Affichees Ou Editees

### 5.1 Formulaire

- `campaignId`
- `selectedCandidates[]`
- `interviewDate`
- `interviewTime`
- `interviewType`
- `interviewLocation`
- `meetLink`
- `selectedEvaluators[]`
- `interviewNote`
- `sendEmail`

### 5.2 Candidats éligibles

- `Application[]` filtrées par campagne et `PRE_SCREEN_ACCEPTED`
- `candidateFirstName`, `candidateLastName`, `candidateEmail`, `quizScorePercent`

### 5.3 Evaluateurs

- `EntityPermission[]` de la campagne
- `User[]` résolus pour les évaluateurs
- `InterviewParticipant[]` créés après création des entretiens

## 6. Services Et Endpoints

### 6.1 Préchargements

- `CampaignService.getAllCampaignsByCriteria()` -> `POST /campaigns/getAllByCriteria`
- `CampaignService.getCampaignAccessesByUser()` -> accès campagne utilisateur
- `ApplicationService.getApplicationsByCriteria()` -> `POST /applications/getByCriteria`
- `SourceTokenService.getSourceTokensByCriteria()` -> `POST /sourceToken/getByCriteria`
- `EntityPermissionService.getForEntity('CAMPAIGN', campaignId)` -> permissions campagne
- `UserService.getAllUsersByCriteria()` et `UserService.getById()` -> résolution des évaluateurs

### 6.2 Création réelle

- `InterviewService.createInterview()` -> `POST /interviews/create`
- `InterviewParticipantService.createParticipants()` -> endpoint participants entretien
- `EntityPermissionService.grant()` / `grantBulk()` -> permissions `INTERVIEW`

## 7. Ce Que Le Backend Doit Envoyer

- Des campagnes filtrables selon les droits réels de planification.
- Des `sourceToken` correctement reliés à `campaignId` pour reconstruire l’éligibilité des candidatures.
- Des candidatures avec `applicationStatus` exploitable.
- Des permissions d’entité `CAMPAIGN` suffisamment précises pour distinguer les évaluateurs désignés.
- Une création d’entretien renvoyant l’ID créé et l’état `interviewMailSent`.
- Des endpoints de permissions `INTERVIEW` permettant de copier les droits nécessaires aux évaluateurs.

## 8. Entites Metier Impliquees

- `campaign`
- `application`
- `sourceToken`
- `interview`
- `interviewParticipant`
- `entityPermission`
- `user`

## 9. Questions Ou Ecarts A Qualifier

- [ ] La création multiple doit-elle rester dans une seule page ou être découpée en assistant plus strict ?
- [ ] Les emails de convocation devraient-ils être prévisualisés via un vrai template backend plutôt qu’un corps généré côté front ?
- [ ] Les permissions copiées sur l’entretien doivent-elles toutes venir de la campagne ou être recalculées par rôle ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/interviews/create` avec un profil autorisé.
2. Sélectionner une campagne accessible.
3. Vérifier les candidats éligibles proposés.
4. Sélectionner plusieurs candidats et au moins un évaluateur.
5. Tester une création avec email puis sans email.
6. Vérifier la création des entretiens et la redirection vers `/dashboard/interviews`.
7. Contrôler ensuite les participants et permissions sur un entretien créé.

## 11. Impact Cible Multi-Occurrences

- [ ] faire entrer la page sur un round `INTERVIEW` explicite et non sur une simple candidature eligibile
- [ ] remplacer les preconditions basees sur `applicationStatus` par les preconditions du round courant dans `application_progress`
- [ ] aligner l'envoi de convocation sur les nouvelles regles de notification du stage et sur la validation manuelle eventuelle
- [ ] permettre plusieurs creations d'entretien pour une meme candidature tant qu'elles visent des rounds distincts ou des replanifications du meme round
- [ ] pre-remplir la page avec le contexte de round cible (`application_progress_id`, label de stage, ordre du round) quand l'entree vient du cockpit candidature
- [ ] clarifier si la creation multiple produit plusieurs entretiens distincts ou un entretien mutualise partage par plusieurs `candidate_interview`, selon le besoin metier retenu
