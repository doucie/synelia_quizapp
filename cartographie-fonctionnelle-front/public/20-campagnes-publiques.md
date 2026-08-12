# Public Campagnes

## 1. Identite

- Route: `/campagnes`
- Alias: `/campaigns` redirige vers `/campagnes`
- Guard: aucun
- Fichier TS: `quizapp_front/src/app/pages/campaigns/campaigns.ts`
- Fichier HTML: `quizapp_front/src/app/pages/campaigns/campaigns.html`
- Fiche liee: [public/70-postuler-source-token.md](./70-postuler-source-token.md) pour le composant `ApplyPositionComponent` (mode campagne ouverte)

## 2. Objectif Produit

La page est le **catalogue public des campagnes ouvertes** : le candidat voit les campagnes visibles et **postule directement** sur celles qui sont en acces libre (`publicApplyEnabled`), ou saisit un code recruteur s'il en a reçu un. Elle sert aussi de porte d'entree pour les candidats deja inscrits vers `/suivre-candidature`.

## 3. Etat Constate

- [x] La page **liste les campagnes publiques** chargees via `CampaignService.getPublicCampaigns()` -> `POST /campaigns/public/getAvailable`.
- [x] Les campagnes sont **triees** : acces libre (`publicApplyEnabled`) en tete, puis par titre (`campaigns.ts:41-49`).
- [x] Chaque carte affiche : titre, specialite, badge `Ouverte` / `Code requis` (`requiresSourceToken`), description, dates d'ouverture/cloture, `maxApply` (`campaigns.html:29-59`).
- [x] Carte a acces libre -> bouton `Postuler` -> `/postuler/campagne/:campaignId` (`campaigns.html:62-63`).
- [x] Carte a code requis -> bouton `Entrer un code` -> ancre `#token-entry` du panneau lateral (`campaigns.html:65`).
- [x] Panneau lateral `Code recruteur` : saisie 6 caracteres normalises (majuscules alphanumeriques), validation locale, validation backend, redirection vers `/postuler/:sourceToken` (`campaigns.ts:61-90`).
- [x] Carte `Vous avez déjà postulé ?` -> lien `/suivre-candidature` (`campaigns.html:102-106`).
- [x] Etats : chargement (placeholders), erreur de chargement, liste vide (`Aucune campagne visible pour le moment`).

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Campagnes ouvertes`
- [x] sous-titre `Postulez directement sur une campagne active, ou saisissez un code recruteur si vous en avez un.`

### 4.2 Catalogue

- [x] cartes campagne (titre, specialite, badge, description, meta dates / postes)
- [x] bouton `Postuler` si `publicApplyEnabled`
- [x] bouton `Entrer un code` sinon (ancre token)
- [x] etat vide / chargement / erreur

### 4.3 Colonne d'information

- [x] panneau `Code recruteur` (champ 6 caracteres + bouton `Acceder au formulaire`)
- [x] message d'erreur de validation du code
- [x] carte `Vous avez déjà postulé ?` -> `/suivre-candidature`

## 5. Donnees Affichees Ou Editees

- `campaigns` : liste de campagnes publiques (id, title, desc, speciality, dates, maxApply, `publicApplyEnabled`, `requiresSourceToken`)
- `sourceToken` (saisie)
- `errorMessage`, `campaignsErrorMessage`, etats de chargement

## 6. Services Et Endpoints

- liste publique via `CampaignService.getPublicCampaigns()` -> `POST /campaigns/public/getAvailable` (`campaign.service.ts:249-263`)
- detail campagne publique via `CampaignService.getPublicCampaign(id)` -> `POST /campaigns/public/getById` ou equivalent (`campaign.service.ts:266-282`), consomme par `/postuler/campagne/:campaignId`
- validation du code via `SourceTokenService.validateToken()` -> `GET /sourceToken/validate/:token`
- navigation vers `/postuler/:sourceToken` apres validation positive

## 7. Ce Que Le Backend Doit Envoyer

- Pour chaque campagne publique : titre, description, specialite, dates, `maxApply`, et surtout `publicApplyEnabled` (bouton Postuler) et `requiresSourceToken` (badge Code requis).
- Un message exploitable quand une campagne publique est introuvable / cloturee (`publicStatusMessage` gere dans `apply-position.ts:141`).
- Une logique de validation de code strictement coherente avec le `sourceTokenGuard`, pour eviter les divergences entre saisie manuelle et acces direct par URL.

## 8. Entites Metier Impliquees

- `campaign` (disponibilite publique, `public_apply_enabled`, `requires_source_token`)
- `source_token` (code recruteur)
- `application` / `candidate_token` (via le flux de postulation)

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il traiter les query params `error` / `message` dans cette page pour mieux absorber les redirections d'echec du `sourceTokenGuard` ?
- [ ] Le `sourceTokenGuard` devrait-il rediriger vers `/campagnes` plutot que `/` pour un token invalide, afin de garder le contexte candidat ?
- [ ] Verifier que `requiresSourceToken` est bien alimente par le backend pour distinguer les deux etats de badge.

## 10. Recette Manuelle

1. Ouvrir `/campagnes` sans etre connecte : verifier l'affichage du catalogue (campagnes libres en tete).
2. Cliquer `Postuler` sur une campagne libre -> verifier la page `/postuler/campagne/:campaignId`.
3. Verifier qu'une campagne `Code requis` affiche bien `Entrer un code` et non `Postuler`.
4. Saisir un code invalide puis verifier le message local.
5. Saisir un code valide et verifier la redirection vers `/postuler/:sourceToken`.
6. Ouvrir le lien `Suivre ma candidature` depuis la colonne secondaire.
