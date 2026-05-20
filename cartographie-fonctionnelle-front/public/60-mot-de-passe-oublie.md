# Public Mot De Passe Oublie

## 1. Identite

- Route: `/mot-de-passe-oublie`
- Guard: `noAuthGuard`
- Fichier TS: `quizapp_front/src/app/pages/mot-de-passe-oublie/mot-de-passe-oublie.ts`
- Fichier HTML: `quizapp_front/src/app/pages/mot-de-passe-oublie/mot-de-passe-oublie.html`

## 2. Objectif Produit

La route existe comme point d'entree de recuperation de mot de passe, mais n'implemente encore aucun flux fonctionnel.

## 3. Etat Constate

- [x] La page affiche seulement un message `bientot disponible`.
- [x] Aucun formulaire, aucun appel API et aucune logique metier n'y sont branches.
- [x] Un lien renvoie vers `/connexion`.
- [ ] Verifier si cette page doit etre remplacee par un vrai flux de reset ou retiree temporairement de la navigation staff.

## 4. Blocs UI Constates

- [x] titre `Recuperation de mot de passe`
- [x] message d'indisponibilite
- [x] lien retour connexion

## 5. Donnees Affichees Ou Editees

- aucune donnee dynamique

## 6. Services Et Endpoints

- aucun appel constate

## 7. Ce Que Le Backend Doit Envoyer

- Aucun contrat n'est actuellement consomme.
- Si le flux est implemente, il faudra definir au minimum: demande de reset, email sortant, validation du token et changement de mot de passe.

## 8. Entites Metier Impliquees

- aucune dans l'etat actuel

## 9. Questions Ou Ecarts A Qualifier

- [ ] La route doit-elle rester visible tant que le reset mot de passe n'est pas implemente ?
- [ ] Le reset passera-t-il par email, par invitation admin, ou par un autre canal ?

## 10. Recette Manuelle

1. Ouvrir `/mot-de-passe-oublie` sans session active.
2. Verifier l'absence de formulaire et le message d'indisponibilite.
3. Cliquer le lien de retour puis verifier la navigation vers `/connexion`.
