# Public Connexion

## 1. Identite

- Route: `/connexion`
- Guard: `noAuthGuard`
- Fichier TS: `quizapp_front/src/app/pages/connexion/connexion.ts`
- Fichier HTML: `quizapp_front/src/app/pages/connexion/connexion.html`

## 2. Objectif Produit

La page permet au personnel Synelia authentifie de se connecter au back-office, tout en bloquant l'acces si une session valide existe deja.

## 3. Etat Constate

- [x] Le formulaire demande un identifiant `email ou nom d'utilisateur` et un mot de passe.
- [x] Le `noAuthGuard` refuse l'acces aux utilisateurs deja connectes et les redirige vers leur route d'accueil authentifiee.
- [x] La page detecte `?expired=true` pour afficher un message de session expiree puis nettoie l'URL.
- [x] Une validation client simple exige que les deux champs soient renseignes.
- [x] L'appel de login passe par `ConnexionService.login()` puis `AuthService.authenticate()`.
- [x] En cas de succes, la navigation repart vers la home authentifiee calculee par `AuthService`.
- [x] Des liens renvoient vers `/inscription`, `/mot-de-passe-oublie` et `/`.
- [ ] Verifier si le libelle `email ou nom d'utilisateur` est vraiment compatible avec ce que le backend attend dans le champ `email`.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Connexion Personnel`
- [x] sous-titre `Acces reserve au personnel de Synelia`

### 4.2 Formulaire

- [x] champ identifiant
- [x] champ mot de passe
- [x] toggle afficher/masquer le mot de passe
- [x] erreurs champ par champ
- [x] erreur globale de connexion
- [x] message info session expiree

### 4.3 Liens secondaires

- [x] creation de compte via code d'invitation
- [x] mot de passe oublie
- [x] retour a l'accueil

## 5. Donnees Affichees Ou Editees

- `email`
- `password`
- etats `loading`, `error`, `info`

## 6. Services Et Endpoints

- login via `ConnexionService.login()` -> `POST /userManager/connexion`
- authentification locale/session via `AuthService.authenticate(...)`
- redirection de garde via `noAuthGuard`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse de login compatible avec `AuthService.authenticate()`, contenant les informations utilisateur necessaires a la session frontend.
- Des messages d'erreur exploitables en cas d'identifiants invalides.
- Une politique claire sur le champ `email`: email reel uniquement, ou email/username polyvalent.
- Une session/token qui permet ensuite de resoudre `getAuthenticatedHomeRoute()` sans etat incoherent.

## 8. Entites Metier Impliquees

- `user`
- session / token d'authentification

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le login accepte-t-il vraiment les usernames si le backend recoit toujours `data.email` ?
- [ ] Faut-il exposer des messages d'erreur plus precis (compte bloque, mot de passe expire, etc.) ?

## 10. Recette Manuelle

1. Ouvrir `/connexion` sans session active.
2. Soumettre le formulaire vide puis verifier les erreurs requises.
3. Se connecter avec un compte valide et verifier la redirection vers la zone authentifiee.
4. Revenir sur `/connexion` avec une session ouverte et verifier le blocage par `noAuthGuard`.
5. Ouvrir `/connexion?expired=true` et verifier le message de session expiree.
