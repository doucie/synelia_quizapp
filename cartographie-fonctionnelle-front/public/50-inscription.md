# Public Inscription

## 1. Identite

- Route: `/inscription`
- Guard: `noAuthGuard`
- Parametre constate: `?code=...` pour pre-remplir le code d'invitation
- Fichier TS: `quizapp_front/src/app/pages/inscription/inscription.ts`
- Fichier HTML: `quizapp_front/src/app/pages/inscription/inscription.html`

## 2. Objectif Produit

La page permet de creer un compte staff via un code d'invitation prealablement emis par Synelia.

## 3. Etat Constate

- [x] Le parcours est multi-etapes: `code`, `register`, `success`, `error`.
- [x] Le query param `code` pre-remplit le formulaire et declenche directement la verification.
- [x] L'etape 1 verifie le code d'invitation via API.
- [x] L'etape 2 affiche l'email invite et le role cible (`admin` ou `recruteur`) issus de l'invitation.
- [x] Le formulaire de creation demande prenom, nom, mot de passe et confirmation.
- [x] Les validations client couvrent presence des champs, confirmation du mot de passe et longueur minimale de 8 caracteres.
- [x] Le succes final renvoie vers `/connexion`.
- [ ] Verifier si l'etape `error` est encore utilisee, car le flux actuel remonte surtout les erreurs dans `errorMessage` sans basculer explicitement sur cet etat.

## 4. Blocs UI Constates

### 4.1 Etape code

- [x] champ `Code d'invitation`
- [x] bouton `Verifier le code`
- [x] lien retour connexion

### 4.2 Etape creation de compte

- [x] rappel de l'email invite
- [x] rappel du role cible
- [x] champs prenom / nom
- [x] champs mot de passe / confirmation
- [x] toggle afficher/masquer mot de passe
- [x] bouton `Creer mon compte`

### 4.3 Etapes terminales

- [x] ecran succes avec bouton `Se connecter`
- [x] ecran erreur prevu avec bouton `Reessayer`

## 5. Donnees Affichees Ou Editees

- `code`
- `invitation.email`
- `invitation.role`
- `firstName`
- `lastName`
- `password`
- `confirmPassword`

## 6. Services Et Endpoints

- validation du code via `InvitationCodeService.validateCode()` -> `POST /invitationCode/validate`
- creation du compte via `InvitationCodeService.registerWithCode()` -> `POST /userManager/registerWithCode`
- redirection garde via `noAuthGuard`

## 7. Ce Que Le Backend Doit Envoyer

- Un `invitationCode/validate` renvoyant au minimum l'email cible, le role, l'expiration et l'etat d'usage du code.
- Un `registerWithCode` qui consomme le code une seule fois, cree le compte attendu et renvoie une erreur metier claire si le code est deja utilise ou expire.
- Une coherence stricte entre l'email transporte par l'invitation et le compte cree.

## 8. Entites Metier Impliquees

- `invitation_code`
- `user`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il exposer plus clairement la date d'expiration ou le statut `isUsed` au candidat interne ?
- [ ] L'etape `error` morte doit-elle etre retiree ou remise en service ?

## 10. Recette Manuelle

1. Ouvrir `/inscription` sans session active.
2. Tester un code invalide puis verifier le message d'erreur.
3. Tester `/inscription?code=...` avec un code valide et verifier le saut direct vers l'etape d'inscription.
4. Completer le formulaire, creer le compte puis verifier l'ecran succes.
5. Tenter de reutiliser le meme code pour verifier le comportement backend.
