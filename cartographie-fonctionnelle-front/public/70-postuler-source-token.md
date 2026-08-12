# Public Postuler (composant partage)

## 1. Identite

- Route 1: `/postuler/:sourceToken` (mode code recruteur) — Guard: `sourceTokenGuard`
- Route 2: `/postuler/campagne/:campaignId` (mode campagne ouverte) — Guard: aucun
- Fichier TS: `quizapp_front/src/app/pages/apply-position/apply-position.ts`
- Fichier HTML: `quizapp_front/src/app/pages/apply-position/apply-position.html`
- Fiche liee: [public/20-campagnes-publiques.md](./20-campagnes-publiques.md) (catalogue, bouton `Postuler` -> mode campagne ouverte)

## 2. Objectif Produit

La page permet de soumettre une candidature publique rattachee soit a un `sourceToken` valide (code recruteur), soit directement a une **campagne ouverte** (`publicApplyEnabled`), avec upload du CV, consentement legal et generation d'un code de suivi. Les deux modes partagent le meme composant `ApplyPositionComponent`, differencies par le parametre de route (`sourceToken` ou `campaignId`).

## 3. Etat Constate

### Mode source token

- [x] Le `sourceTokenGuard` verifie d'abord le format 6 caracteres puis appelle le backend avant de laisser entrer.
- [x] Le composant recharge ensuite les informations du token (`getTokenInfo`) pour afficher le nom de campagne et memoriser `sourceTokenId` (`apply-position.ts:106-127`).

### Mode campagne ouverte

- [x] Sans `sourceToken`, le composant lit `campaignId` et charge la campagne via `getPublicCampaignById` (`apply-position.ts:129-153`).
- [x] Si `publicApplyEnabled === false`, la page est bloquee avec `publicStatusMessage` (« Cette campagne requiert un code recruteur. ») (`apply-position.ts:140-141`).
- [x] Campagne introuvable / invalide -> message `Cette campagne est introuvable ou n est plus accessible.` (page bloquee) (`apply-position.ts:131,148-149`).
- [x] Aucun des deux parametres -> redirection vers `/campagnes` (`apply-position.ts:98`).

### Commun

- [x] Deux textes legaux publics charges: `candidate_consent` et `privacy_policy` (`apply-position.ts:155-204`).
- [x] Si le texte `candidate_consent` est absent ou inactif, la candidature est bloquee par `legalBlockMessage` (`apply-position.ts:168-170`).
- [x] Le formulaire collecte identite, email, telephone, date de naissance, CV (obligatoire cote front, `apply-position.ts:260-263`), lettre de motivation et deux preferences (`remoteWork`, `relocate`).
- [x] Le CV est valide cote front sur taille, MIME et extension avant upload.
- [x] La soumission se fait en deux temps: upload du CV puis creation de l'application, avec `emailVerified: false` et `sourceTokenId` ou `campaignId` (`apply-position.ts:286-298`).
- [x] Si le backend renvoie un quiz token (`searchString`), redirection immediate vers `/quiz/{id}/{quizToken}` (`apply-position.ts:310-315`).
- [x] Sinon, affichage du code de suivi et d'un lien vers `/suivre-candidature` pre-rempli.
- [x] Les preferences `remoteWork` et `relocate` sont collectees dans l'UI mais ne sont pas envoyees dans le payload `Application` final.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Postuler chez Synelia`
- [x] sous-titre de candidature
- [x] affichage du nom de campagne si disponible (token ou campagne)

### 4.2 Bloc d'entree

- [x] chargement du contexte (token ou campagne) avec `entryBlockMessage` / `legalBlockMessage` -> `platformBlockMessage` (`apply-position.ts:62-64`)

### 4.3 Section informations personnelles

- [x] prenom
- [x] nom
- [x] email
- [x] telephone
- [x] date de naissance

### 4.4 Section documents et motivation

- [x] upload CV (obligatoire)
- [x] validation locale des formats PDF/DOC/DOCX
- [x] texte libre lettre de motivation

### 4.5 Section preferences

- [x] teletravail
- [x] mobilite

### 4.6 Section consentement

- [x] case de consentement candidate
- [x] chargement dynamique du texte legal
- [x] modal de politique de confidentialite

### 4.7 Etats de soumission

- [x] erreur metier / plateforme
- [x] succes avec redirection `/quiz` si token quiz renvoye
- [x] succes avec email et code de suivi
- [x] liens de rebond vers suivi candidature, reset du formulaire et accueil

## 5. Donnees Affichees Ou Editees

- `sourceToken` / `sourceTokenId`
- `campaignId` / `campaignName`
- `firstName`, `lastName`, `email`, `phone`, `birthDate`
- `cvFile`, `motivationLetter`
- `remoteWork`, `relocate`
- `consent`
- `trackingCode`
- `entryBlockMessage` / `legalBlockMessage` / `platformBlockMessage`

## 6. Services Et Endpoints

- mode token: validation route via `SourceTokenService.validateToken()` -> `GET /sourceToken/validate/:token` (guard) ; lecture detail via `getTokenInfo()` -> `GET /sourceToken/info/:token`
- mode campagne: `CampaignService.getPublicCampaignById()` -> detail publique de la campagne (`apply-position.ts:137`)
- lecture textes legaux via `POST /legalText/getByCriteria`
- upload CV via `FileService.uploadCvFile()` -> `POST /files/upload/cv`
- creation candidature via `ApplicationService.createApplication()` -> `POST /applications/create`

## 7. Ce Que Le Backend Doit Envoyer

- Un `sourceToken` valide associe a une campagne, et eventuellement a un formulaire dedie via la strategie `SOURCE_TOKEN`.
- Pour le mode campagne ouverte: les donnees publiques de la campagne avec `publicApplyEnabled` et un `publicStatusMessage` exploitable quand la campagne est fermee / requiert un code (`apply-position.ts:141`).
- Des reponses `legalText/getByCriteria` publiques pour `candidate_consent` et `privacy_policy`, avec `isActive`, `title`, `content`.
- Un endpoint d'upload CV renvoyant `success`, `filePath`, `fileName` et un message d'erreur clair si besoin.
- Un `applications/create` capable de creer la candidature publique avec `sourceTokenId` **ou** `campaignId`, chemin CV et email non verifie, puis de renvoyer un `trackingCode` reutilisable pour `/suivre-candidature`.
- Un quiz token (`searchString`) quand le pipeline comporte une etape QUIZ, pour la redirection immediate.

## 8. Entites Metier Impliquees

- `source_token`
- `campaign`
- `application`
- `candidate_token` / code de suivi
- `legal_text`
- fichiers CV uploades

## 9. Questions Ou Ecarts A Qualifier

- [ ] Les preferences `remoteWork` et `relocate` doivent-elles etre persistees ou retirees du formulaire ?
- [ ] Le guard devrait-il rediriger vers `/campagnes` plutot que `/` pour les tokens invalides afin de garder le contexte candidat ?
- [ ] Faut-il bloquer la soumission si `getTokenInfo()` echoue alors que le guard a laisse passer la route ?
- [ ] Mode campagne ouverte: quand `publicApplyEnabled === false`, faut-il proposer la saisie d'un code recruteur sur place plutot qu'un simple blocage ?
- [ ] Le message d'erreur du guard apres redirection vers `/` reste-t-il invisible pour le candidat ?

## 10. Recette Manuelle

### Mode source token

1. Ouvrir `/postuler/:sourceToken` avec un token valide.
2. Verifier l'affichage de la campagne et du texte de consentement.
3. Soumettre un CV invalide puis verifier le message de validation.
4. Soumettre une candidature complete et verifier l'upload puis la creation de l'application.
5. Si le pipeline a un quiz: verifier la redirection vers `/quiz`. Sinon, recuperer le code de suivi et ouvrir le lien vers `/suivre-candidature`.

### Mode campagne ouverte

6. Depuis `/campagnes`, cliquer `Postuler` sur une campagne ouverte -> verifier `/postuler/campagne/:campaignId` avec le nom de campagne affiche.
7. Ouvrir la meme route sur une campagne fermee / a code requis -> verifier le message de blocage.
8. Ouvrir la route sans parametre valide -> verifier la redirection vers `/campagnes`.
