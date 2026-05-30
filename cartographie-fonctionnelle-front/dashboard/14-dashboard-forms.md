# Dashboard Forms

## 1. Identite

- Route: `/dashboard/forms`
- Guard: `roleGuard` + `permissionGuard(['VIEW_FORM'])` sur la route enfant, en plus du shell `/dashboard` protege par `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/forms/forms.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/forms/forms.html`

## 2. Objectif Produit

La page doit etre l'entree metier simple des formulaires.

L'utilisateur doit pouvoir y:

- retrouver ses formulaires et comprendre rapidement leur etat
- voir, a titre de contexte, dans quelles campagnes un formulaire est utilise
- ouvrir la creation ou la modification d'un formulaire sans passer par des CRUD techniques annexes

La page ne doit pas lui demander de comprendre ni de manipuler l'entite technique `campaign_form`. L'ajout ou le retrait d'un formulaire a une campagne doit rester un sous-flux des pages campagne.

## 3. Etat Constate

- [x] La route existe et charge les formulaires, les campagnes, les liens `campaign_form` et les versions pour produire une vue consolidee.
- [x] La liste est filtrable par texte, campagne et statut actif.
- [x] Les cartes affichent deja le nombre de campagnes liees, les versions connues et des alertes de partage utiles (`publication partagee`, `timing partage`).
- [x] La creation et l'edition ouvrent maintenant des pages dediees `/dashboard/forms/new` et `/dashboard/forms/:id/edit` au lieu d'une modale locale.
- [x] Le bouton technique `Liaisons campagne-formulaire` a ete retire et le bandeau d'aide renvoie maintenant vers les pages campagne pour les rattachements.
- [x] Le composant agit maintenant comme une page catalogue et un point d'entree de navigation vers le workflow dedie de formulaire.
- [x] La creation et l'edition sont sorties de la modale locale pour ouvrir des pages dediees `/dashboard/forms/new` et `/dashboard/forms/:id/edit`.
- [x] La composition du formulaire est maintenant integree au parcours dedie de creation / edition: questions et reponses se gerent depuis l'editeur formulaire, sans renvoyer l'utilisateur vers les CRUD techniques.
- [x] La liste est redevenue un catalogue lisible et un point d'entree de navigation, sans demander a l'utilisateur de comprendre `campaign_form`.
- [x] La cible produit retenue est que l'ajout ou le retrait d'un formulaire a une campagne se fasse depuis `/dashboard/campaigns/new` et `/dashboard/campaigns/:id/edit`, pas depuis `/dashboard/forms`.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Formulaires`
- [x] sous-titre avec compteurs total / actifs / partages
- [x] bouton `Actualiser`
- [x] bouton `Nouveau formulaire` conditionne par `adminMode`
- [x] bandeau d'aide reoriente vers le bon parcours metier: edition du contenu via les pages formulaire, rattachement via les pages campagne
- [x] le bouton technique `Liaisons campagne-formulaire` a disparu de cette page
- [x] le bandeau d'aide est reoriente vers le bon parcours: gestion du contenu du formulaire ici, rattachement a une campagne depuis les pages campagne

### 4.2 Filtres

- [x] recherche texte sur formulaire ou campagne liee
- [x] filtre campagne via `filterCampaignId`
- [x] filtre statut `ALL / ACTIVE / INACTIVE`

### 4.3 Catalogue principal

- [x] cartes formulaire avec badges actif / inactif et contexte campagne
- [x] compteur de versions et de versions publiees
- [x] liste des campagnes liees en contexte de lecture
- [x] panneau pliable `Voir les versions`
- [x] actions `modifier` / `supprimer`
- [x] l'action `modifier` ouvre une page dediee plutot qu'une modale locale
- [x] l'action `Nouveau formulaire` ouvre une page dediee plutot qu'une modale locale
- [x] la carte reste une vue de synthese; la composition question / reponse est renvoyee vers la page dediee

### 4.4 Navigation et sorties

- [x] la creation cible navigue vers `/dashboard/forms/new`
- [x] l'edition cible navigue vers `/dashboard/forms/:id/edit`
- [ ] la page peut proposer un acces simple vers les campagnes liees, mais sans exposer un CRUD technique de liaison
- [x] la gestion structurelle des liens campagne-formulaire est deleguee aux pages campagne
- [x] la suppression peut rester un flux local de confirmation tant qu'elle ne reintroduit pas la logique de liaison technique

## 5. Donnees Affichees

### 5.1 Formulaire

- `id`
- `formName`
- `formDesc`
- `isActive`
- `isTimed`
- `createdAt`

### 5.2 Contexte campagne

- `linkedCampaignNames[]`
- `linkedCampaignCount`
- libelle principal de campagne quand un seul lien actif est visible

### 5.3 Resume de versioning

- `versionCount`
- `publishedVersionCount`
- etat publie / brouillon / verrouille sur les versions visibles

### 5.4 Alertes derivees

- alerte de publication partagee
- alerte de timing partage

## 6. Services Et Endpoints

- `FormService.getAllByCriteria({ filterCampaignId?, search_string?, isDeleted: false })` -> `POST /form/getAllByCriteria`
- `CampaignService.getAllCampaignsByCriteria()` -> `POST /campaigns/getAllByCriteria` pour alimenter le filtre campagne et les libelles de contexte
- `CampaignFormService.getAllByCriteria()` -> lecture des liens `campaign_form` utilises comme detail d'implementation pour calculer le contexte campagne cote front
- `FormVersionService.getAllByCriteria()` -> `POST /formversion/getAllByCriteria` pour la synthese de versioning
- `FormService.create()` / `update()` / `delete()` -> mutations actuelles de la modale locale
- Cible produit: les actions `create` et `edit` de cette page doivent surtout naviguer vers des pages dediees, qui porteront ensuite le vrai workflow de composition du formulaire

## 7. Ce Que Le Backend Doit Envoyer

- Des formulaires actifs chargeables avec `filterCampaignId` pour les vues de contexte campagne.
- Des informations suffisamment stables pour afficher le contexte de partage sans exposer une entite technique a l'utilisateur.
- Un contexte campagne resolu de facon lisible: noms, compteurs et alertes utiles, sans imposer au front de transformer l'ecran en CRUD `campaign_form`.
- Des versions chargeables et ordonnables pour alimenter le resume des brouillons / publications.
- Une base suffisamment claire pour que `/dashboard/forms` reste une page metier de lecture et de pilotage, sans necessiter de faire manipuler directement `campaign_form` au user final.
- Des garde-fous de suppression ou d'edition qui protegent les formulaires deja relies ou deja utilises, meme si la liste cherche a rester simple cote UX.

## 8. Entites Metier Impliquees

- `form`
- `formVersion`
- `question`
- `answer`
- `campaign`
- liaison technique `campaignForm` comme detail d'implementation, non comme entite a exposer a l'utilisateur metier

## 9. Questions Ou Ecarts A Qualifier

- [ ] La liste doit-elle afficher toutes les campagnes liees par nom, ou seulement un compteur cliquable vers les campagnes concernees ?
- [ ] Faut-il proposer une action rapide `Dupliquer` depuis la liste pour accelerer les divergences de contenu entre campagnes ?
- [ ] La suppression doit-elle etre bloquee visuellement quand le formulaire reste lie a une campagne ou deja utilise par des candidatures ?
- [ ] Quelle est la frontiere exacte voulue pour cette page: simple catalogue + navigation, ou catalogue + suppression locale + quelques actions rapides ?
- [ ] Les ecrans `/dashboard/forms/new` et `/dashboard/forms/:id/edit` doivent-ils evoluer vers une banque de questions filtrable par specialite avec selection multiple et ajout en lot, pour eviter l'ajout unitaire fastidieux ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/forms` avec un compte autorise.
2. Verifier le chargement des cartes, des badges et des versions.
3. Filtrer par texte, campagne et statut.
4. Verifier que ni le header ni le bandeau d'aide n'envoient l'utilisateur vers une logique technique `campaign_form` dans la cible produit.
5. Verifier que la creation redirige vers `/dashboard/forms/new` et l'edition vers `/dashboard/forms/:id/edit`.
6. Verifier que l'ajout ou le retrait d'un formulaire a une campagne reste reserve aux pages campagne.
7. Verifier que la page reste lisible comme catalogue de formulaires, meme sans connaissance du versioning technique ni des tables de liaison.