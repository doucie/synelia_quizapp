# Dashboard Entities

## 1. Identite

- Route: `/dashboard/entities`
- Guard effectif: `authGuard` herite du shell `/dashboard`
- Guard enfant dedie: aucun `canActivate` sur cette route
- Menu dashboard: entree visible cote UI pour `roles: ['super']` avec `permissions: ['VIEW_APP_CONFIG']`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/entities.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/entities.html`

## 2. Objectif Produit

La page sert de hub systeme vers les CRUD `dashboard/entities/*` en affichant un annuaire d'entites, leur description et un compteur global d'enregistrements.

## 3. Etat Constate

- [x] La page affiche une liste frontend hardcodee d'entites avec nom, description, icone, couleur et route cible.
- [x] Un appel unique a `GET /api/dashboard/counts` alimente les compteurs visibles sur chaque carte.
- [x] Une recherche texte filtre les cartes par nom d'affichage ou description.
- [x] Le clic sur une carte ou le bouton `Gerer` navigue vers la route enfant correspondante sous `/dashboard/entities/*`.
- [x] Le cas `users` ajoute un controle client specifique pour refuser l'acces hors role `super`.
- [x] La page calcule aussi trois KPI de synthese: nombre d'entites disponibles, entites affichees et total cumule des enregistrements.
- [x] La route montee n'a pas de `permissionGuard` enfant, alors que le menu la presente comme une page systeme `VIEW_APP_CONFIG` reservee aux `super`.
- [ ] Verifier si l'absence de guard enfant dedie est volontaire ou un oubli de securisation.
- [ ] Verifier si la logique `handleFragmentNavigation()` restante dans le composant doit etre supprimee ou remise en service.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre `Gestion des Entites`
- [x] sous-titre `Administration centralisee de toutes les donnees du systeme`

### 4.2 Recherche

- [x] champ `Rechercher une entite...`

### 4.3 Grille des cartes

- [x] icone coloree par entite
- [x] compteur d'enregistrements par entite
- [x] nom et description
- [x] bouton `Gerer`

### 4.4 Etats transverses

- [x] spinner de chargement
- [x] etat vide si aucune entite ne correspond a la recherche

### 4.5 Statistiques generales

- [x] nombre d'entites disponibles
- [x] nombre d'entites affichees apres filtre
- [x] total d'enregistrements cumules

## 5. Donnees Affichees Ou Editees

- registre frontend `EntityInfo[]`
- `name`
- `displayName`
- `description`
- `route`
- `count`
- `color`

## 6. Services Et Endpoints

- chargement des compteurs via `DashboardStatsService.getCounts()` -> `GET /api/dashboard/counts`
- navigation vers les CRUD enfants `/dashboard/entities/*`
- controle client additionnel via `AuthService.getCurrentUser()` pour le cas `users`

## 7. Ce Que Le Backend Doit Envoyer

- Un objet JSON dont les cles correspondent exactement aux `name` du registre frontend (`users`, `applications`, `interviews`, etc.).
- Des valeurs numeriques coerentes meme a `0`; une cle absente laisse la carte en etat `...` cote UI.
- Une protection serveur sur chaque route/enpoint enfant sensible: ce hub ne doit pas etre considere comme la seule barriere d'acces.
- Une coherence de nomenclature avec les entites CRUD reelles, sinon les compteurs et routes deviennent trompeurs.

## 8. Entites Metier Impliquees

- hub systeme `entities`
- ensemble des entites CRUD exposees sous `/dashboard/entities/*`
- agregat de statistiques dashboard

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il ajouter `permissionGuard(['VIEW_APP_CONFIG'])` sur la route enfant `/dashboard/entities` pour aligner route et menu ?
- [ ] Le controle special `users` doit-il etre remplace par une verification permissionnelle commune a toutes les cartes ?
- [ ] Les compteurs doivent-ils couvrir toutes les cartes du registre ou seulement les entites reellement accessibles a l'utilisateur courant ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities` avec un utilisateur authentifie.
2. Verifier le chargement des compteurs et des trois KPI de synthese.
3. Filtrer par un mot-cle puis verifier que la grille se reduit correctement.
4. Ouvrir plusieurs cartes et confirmer la navigation vers les routes `/dashboard/entities/*` attendues.
5. Tester le cas `users` avec un compte non `super` et verifier la redirection de refus.
