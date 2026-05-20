# Public Postuler Source Token

## 1. Identite

- Route: `/postuler/:sourceToken`
- Guard: `sourceTokenGuard`
- Fichier TS: `quizapp_front/src/app/pages/apply-position/apply-position.ts`
- Fichier HTML: `quizapp_front/src/app/pages/apply-position/apply-position.html`

## 2. Objectif Produit

La page permet de soumettre une candidature publique rattachee a un `sourceToken` valide, avec upload du CV, consentement legal et generation d'un code de suivi.

## 3. Etat Constate

- [x] Le `sourceTokenGuard` verifie d'abord le format 6 caracteres puis appelle le backend avant de laisser entrer.
- [x] Le composant recharge ensuite les informations du token pour afficher le nom de campagne et memoriser `sourceTokenId`.
- [x] Deux textes legaux publics sont charges: `candidate_consent` et `privacy_policy`.
- [x] Si le texte `candidate_consent` est absent ou inactif, la candidature est bloquee par `platformBlockMessage`.
- [x] Le formulaire collecte identite, email, telephone, date de naissance, CV, lettre de motivation et deux preferences (`remoteWork`, `relocate`).
- [x] Le CV est valide cote front sur taille, MIME et extension avant upload.
- [x] La soumission se fait en deux temps: upload du CV puis creation de l'application.
- [x] En cas de succes, la page affiche un code de suivi et un lien direct vers `/suivre-candidature` pre-rempli.
- [x] Les preferences `remoteWork` et `relocate` sont collecteess dans l'UI mais ne sont pas envoyees dans le payload `Application` final.
- [ ] Verifier si l'absence d'affichage du message d'erreur du guard apres redirection vers `/` est acceptable pour un lien token invalide.
- [ ] Verifier si `user: 1` dans `ApplicationService.createApplication()` est encore compatible avec les controles backend publics.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Postuler chez Synelia`
- [x] sous-titre de candidature
- [x] affichage du nom de campagne si disponible

### 4.2 Section informations personnelles

- [x] prenom
- [x] nom
- [x] email
- [x] telephone
- [x] date de naissance

### 4.3 Section documents et motivation

- [x] upload CV
- [x] validation locale des formats PDF/DOC/DOCX
- [x] texte libre lettre de motivation

### 4.4 Section preferences

- [x] teletravail
- [x] mobilite

### 4.5 Section consentement

- [x] case de consentement candidate
- [x] chargement dynamique du texte legal
- [x] modal de politique de confidentialite

### 4.6 Etats de soumission

- [x] erreur metier / plateforme
- [x] succes avec email et code de suivi
- [x] liens de rebond vers suivi candidature, reset du formulaire et accueil

## 5. Donnees Affichees Ou Editees

- `sourceToken`
- `sourceTokenId`
- `campaignName`
- `firstName`
- `lastName`
- `email`
- `phone`
- `birthDate`
- `cvFile`
- `motivationLetter`
- `remoteWork`
- `relocate`
- `consent`
- `trackingCode`

## 6. Services Et Endpoints

- validation route via `SourceTokenService.validateToken()` -> `GET /sourceToken/validate/:token`
- lecture detail token via `SourceTokenService.getTokenInfo()` -> `GET /sourceToken/info/:token`
- lecture textes legaux via `POST /legalText/getByCriteria`
- upload CV via `FileService.uploadCvFile()` -> `POST /files/upload/cv`
- creation candidature via `ApplicationService.createApplication()` -> `POST /applications/create`

## 7. Ce Que Le Backend Doit Envoyer

- Un `sourceToken` valide associe a une campagne, et eventuellement a un formulaire dedie via la strategie `SOURCE_TOKEN`.
- Des reponses `legalText/getByCriteria` publiques pour `candidate_consent` et `privacy_policy`, avec `isActive`, `title`, `content`.
- Un endpoint d'upload CV renvoyant `success`, `filePath`, `fileName` et un message d'erreur clair si besoin.
- Un `applications/create` capable de creer la candidature publique avec `sourceTokenId`, chemin CV et email non verifie, puis de renvoyer un `trackingCode` reutilisable pour `/suivre-candidature`.
- Une attribution de formulaire/version cohérente a la creation si le token porte un formulaire specifique.

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

## 10. Recette Manuelle

1. Ouvrir `/postuler/:sourceToken` avec un token valide.
2. Verifier l'affichage de la campagne et du texte de consentement.
3. Soumettre un CV invalide puis verifier le message de validation.
4. Soumettre une candidature complete et verifier l'upload puis la creation de l'application.
5. Recuperer le code de suivi affiche et ouvrir le lien vers `/suivre-candidature`.
