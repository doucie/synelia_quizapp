# Public Campagnes

## 1. Identite

- Route: `/campagnes`
- Alias: `/campaigns` redirige vers `/campagnes`
- Guard: aucun
- Fichier TS: `quizapp_front/src/app/pages/campaigns/campaigns.ts`
- Fichier HTML: `quizapp_front/src/app/pages/campaigns/campaigns.html`

## 2. Objectif Produit

La page sert de porte d'entree publique vers une campagne via un `sourceToken`, plutot que d'afficher une liste ouverte de campagnes.

## 3. Etat Constate

- [x] La page ne liste aucune campagne; elle joue un role de portail de saisie de code source.
- [x] Le code saisi est normalise en majuscules alphanumeriques sur 6 caracteres.
- [x] Une validation locale refuse immediatement les formats invalides.
- [x] Une validation backend verifie ensuite que le token existe encore et reste utilisable.
- [x] En cas de succes, la page redirige vers `/postuler/:sourceToken`.
- [x] En cas d'echec, elle affiche un message d'erreur local sous le formulaire.
- [x] Une carte secondaire renvoie vers `/suivre-candidature` pour les candidats deja inscrits.
- [ ] Verifier si le nom `campagnes` reste pertinent alors que la page ne montre aucun catalogue.
- [ ] Verifier si les erreurs de token invalide issues du `sourceTokenGuard` devraient revenir ici plutot que sur `/`.

## 4. Blocs UI Constates

### 4.1 Hero

- [x] titre d'acces par code source
- [x] texte explicatif sur l'entree publique par invitation

### 4.2 Panneau principal

- [x] champ `Code source a 6 caracteres`
- [x] bouton `Acceder au formulaire`
- [x] aide contextuelle sur l'origine du code
- [x] message d'erreur si le token n'est pas valide

### 4.3 Colonne d'information

- [x] carte `Vous avez deja postule ?`
- [x] lien vers `/suivre-candidature`
- [x] carte informative `Pas encore de code ?`

## 5. Donnees Affichees Ou Editees

- `sourceToken`
- `errorMessage`
- etat de chargement de verification

## 6. Services Et Endpoints

- validation du token via `SourceTokenService.validateToken()` -> `GET /sourceToken/validate/:token`
- navigation vers `/postuler/:sourceToken` apres validation positive

## 7. Ce Que Le Backend Doit Envoyer

- Un endpoint `GET /sourceToken/validate/:token` renvoyant `isValid`, et idealement `campaignId` / `campaignName` quand le token est valide.
- Un message d'erreur exploitable quand le token est invalide, expire ou supprime.
- Une logique de validation strictement coherente avec le `sourceTokenGuard`, pour eviter les divergences entre saisie manuelle et acces direct par URL.

## 8. Entites Metier Impliquees

- `source_token`
- `campaign`

## 9. Questions Ou Ecarts A Qualifier

- [ ] La page doit-elle afficher des informations de campagne apres validation locale du token avant la redirection ?
- [ ] Faut-il traiter les query params `error` / `message` dans cette page pour mieux absorber les redirections d'echec du `sourceTokenGuard` ?

## 10. Recette Manuelle

1. Ouvrir `/campagnes` sans etre connecte.
2. Tenter un code invalide puis verifier le message local.
3. Saisir un code valide et verifier la redirection vers `/postuler/:sourceToken`.
4. Ouvrir le lien `Suivre ma candidature` depuis la colonne secondaire.
