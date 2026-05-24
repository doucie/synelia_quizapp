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
- [x] Le CTA `Nouvelle campagne` et le CTA vide `Creer une campagne` sont masques si l'utilisateur n'a pas `CREATE_CAMPAIGNS`, meme si la page liste reste accessible via `VIEW_CAMPAIGNS`.
- [x] La liste affiche maintenant un badge d'acces coherent (`Proprietaire`, `Edition`, `Consultation`, `Admin requis`) et n'expose l'action d'edition que si elle est compatible avec le guard d'edition ou le passage par le detail pour activer `adminMode`.

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
- [x] Badge d'acces `Proprietaire` / `Edition` / `Consultation` / `Admin requis` selon `myCampaigns`, les acces campagne et `adminMode`
- [x] Titre, description, specialite, createur
- [x] Date de debut
- [x] Extension locale `Voir details`
- [x] Bouton `Ouvrir la page complete`
- [x] Bouton `Modifier` visible seulement quand l'acces d'edition est coherent avec le routing

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
- `CampaignService.getCampaignAccessesByUser()` + `buildCampaignAccessMap()` -> derive les badges d'acces et l'exposition de l'action `Modifier` dans la liste

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

- [x] Le bouton `Nouvelle campagne` est maintenant masque sans permission `CREATE_CAMPAIGNS`; la route `/dashboard/campaigns/new` reste guardee cote routing.
- [ ] La notion de `campagne partagee` doit-elle etre exposee explicitement par le backend au lieu d'etre reconstruite cote front ?
- [ ] La liste doit-elle etre paginee serveur a terme au lieu d'etre chargee en masse (`size: 100` / `1000`) ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/campaigns` avec un utilisateur ayant `VIEW_CAMPAIGNS`.
2. Verifier le chargement des trois onglets et leurs compteurs.
3. Rechercher une campagne par titre, description et specialite.
4. Changer le filtre statut et verifier que le compteur correspond aux cartes visibles.
5. Basculer `grid/list`.
6. Verifier qu'une campagne propre affiche `Proprietaire`, qu'une campagne modifiable affiche `Edition`, et qu'une campagne non modifiable reste en `Consultation`.
7. Verifier que `Modifier` n'apparait que si l'utilisateur peut editer directement, ou propose le passage par le detail si `adminMode` est requis.
8. Ouvrir `Voir details`, puis naviguer vers `/dashboard/campaigns/:id`.
9. Tester l'etat vide sur un onglet sans donnees.