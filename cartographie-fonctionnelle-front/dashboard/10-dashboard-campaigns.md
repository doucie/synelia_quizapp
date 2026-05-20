# Dashboard Campaigns

## 1. Identite

- Route: `/dashboard/campaigns`
- Guard: `permissionGuard(['VIEW_CAMPAIGNS'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/campaigns/campaigns.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/campaigns/campaigns.html`
- Routes voisines: `/dashboard/campaigns/new`, `/dashboard/campaigns/:id`, `/dashboard/campaigns/:id/edit`

## 2. Objectif Produit

La page sert a piloter la liste des campagnes accessibles a l'utilisateur, avec separation entre toutes les campagnes, celles creees par lui et celles partagees.

## 3. Etat Constate

- [x] La page charge trois ensembles distincts: `allCampaigns`, `myCampaigns`, `sharedCampaigns`.
- [x] Les onglets `Toutes`, `Mes campagnes`, `Campagnes partagees` sont montes et relies a des compteurs.
- [x] La recherche texte filtre le jeu deja selectionne par onglet.
- [x] Les chips de statut `all/active/pending/closed` sont derives du meme sous-ensemble visible.
- [x] La vue bascule entre `grid` et `list`.
- [x] La carte campagne peut s'etendre localement et ouvrir la page detail.
- [x] La page contient un CTA `Nouvelle campagne`.
- [ ] Verifier le comportement exact du CTA si l'utilisateur a `VIEW_CAMPAIGNS` sans `CREATE_CAMPAIGNS`.
- [ ] Verifier la coherence entre les droits de detail, d'edition et les badges visibles dans la liste.

## 4. Blocs UI Constates

### 4.1 Header

- [x] Titre `Campagnes de recrutement`
- [x] Sous-titre de gestion
- [x] Bouton `Actualiser`
- [x] Bouton `Nouvelle campagne`

### 4.2 Navigation et filtres

- [x] Onglets `Toutes`, `Mes campagnes`, `Campagnes partagees`
- [x] Champ de recherche texte
- [x] Filtres statut `Toutes`, `En cours`, `En attente`, `Terminees`
- [x] Toggle de vue `grid/list`

### 4.3 Cartes de campagne

- [x] Badge statut
- [x] Badge `Proprietaire` quand la campagne est dans `myCampaigns`
- [x] Titre, description, specialite, createur
- [x] Date de debut
- [x] Extension locale `Voir details`
- [x] Bouton `Ouvrir la page complete`

### 4.4 Etats techniques

- [x] Etat loading
- [x] Etat vide contextualise selon recherche / onglet
- [x] CTA de creation dans l'etat vide quand aucun filtre n'est actif

## 5. Donnees Affichees

La page attend au minimum, par campagne:

- `id`
- `campaignTitle`
- `campaignDesc`
- `campaignStatus`
- `campaignStart`
- `campaignEnd`
- `specialityLibelle`
- `creatorName`
- `isDeleted`

Compteurs derives cote front:

- `allCount`, `myCount`, `sharedCount`
- `currentTabCount`
- `activeCount`, `pendingCount`, `closedCount`

## 6. Services Et Endpoints

- `CampaignService.getAllCampaignsByCriteria()` -> `POST /campaigns/getAllByCriteria`
- `CampaignService.getMyCampaigns()` -> `POST /campaigns/getByCriteria` avec `createdBy = currentUserId`
- `CampaignService.getSharedCampaigns()` -> derive les campagnes partagees via acces utilisateur puis recharge les campagnes par `getAllCampaignsByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste stable de campagnes non supprimees quand `isDeleted = false`.
- Un `campaignStatus` normalise, exploitable par les constantes front.
- Des champs textuels non obligatoires mais coherents (`campaignTitle`, `campaignDesc`, `specialityLibelle`, `creatorName`).
- Des dates parsables cote front (`campaignStart`, `campaignEnd`).
- Des IDs de campagne stables pour la navigation vers detail / edition.
- Assez d'information ou un endpoint d'acces pour distinguer creation personnelle et partage.

## 8. Entites Metier Impliquees

- `campaign`
- `speciality`
- `user` / createur
- acces ou permissions de campagne (`entityPermission` / acces campagne)

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le bouton `Nouvelle campagne` doit-il etre masque sans permission de creation ?
- [ ] La notion de `campagne partagee` doit-elle etre exposee explicitement par le backend au lieu d'etre reconstruite cote front ?
- [ ] La liste doit-elle etre paginee serveur a terme au lieu d'etre chargee en masse (`size: 100` / `1000`) ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/campaigns` avec un utilisateur ayant `VIEW_CAMPAIGNS`.
2. Verifier le chargement des trois onglets et leurs compteurs.
3. Rechercher une campagne par titre, description et specialite.
4. Changer le filtre statut et verifier que le compteur correspond aux cartes visibles.
5. Basculer `grid/list`.
6. Ouvrir `Voir details`, puis naviguer vers `/dashboard/campaigns/:id`.
7. Tester l'etat vide sur un onglet sans donnees.