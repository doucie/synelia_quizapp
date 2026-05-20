# Entities App Config

## 1. Identite

- Routes: `/dashboard/entities/app-config` et `/dashboard/entities/app-config/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/app-config/entities-app-config.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/app-config/entities-app-config.html`

## 2. Objectif Produit

La page administre les configurations globales de l'application. Ce n'est pas un simple CRUD cosmetique: la configuration active sert de source de verite pour le theme public, certains liens applicatifs et l'activation des comptes candidats.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` via des types ad hoc `AppConfigCriteria` et `PagedAppConfigResponse`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, `configName`, actif, suppression et intervalles de dates.
- [x] Le tableau expose nom de config, entreprise, couleur primaire, theme/couleur et etat actif.
- [x] Les modales create/edit exposent au minimum nom, entreprise, `logoHtml`, couleur primaire, theme et activation.
- [x] La route surface aussi `candidateAccountsEnabled` dans le formulaire.
- [x] La restauration est supportee via un `update({ id, isDeleted: false })`.
- [x] Le service expose `activate(id)` et la route propose maintenant une action `Activer` explicite sur les configurations inactives non supprimees.
- [ ] Les cles de colonnes TS restent `theme`, `active`, `deleted`, alors que le template lit `colorScheme`, `isActive`, `isDeleted`.
- [ ] `appLink`, qui sert de source de verite pour l'URL publique quand renseigne, n'apparait pas dans cette route.
- [ ] La configuration est critique pour le front public, mais la page reste un CRUD generaliste sans mise en avant de l'unicite de la config active.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] action `Activer` sur les lignes inactives non supprimees
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `configName`
- [x] filtre `isActive`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `configName`, `companyName`, `primaryColor`, `theme`, `active`, `deleted`
- [x] swatch couleur sur `primaryColor`
- [x] action `Activer` avec confirmation explicite et synchronisation du theme actif en session
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] detail panel branche en bas de page

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation configuration application
- [x] edition configuration application

## 5. Donnees Affichees Ou Editees

- `id`
- `configName`
- `companyName`
- `appLink`
- `logoHtml`
- `primaryColor`
- `colorScheme`
- `candidateAccountsEnabled`
- `isActive`
- `isDeleted`
- `createdAt`
- `updatedAt`

## 6. Services Et Endpoints

- liste via `AppConfigService.getByCriteria()` -> `POST /appConfig/getByCriteria`
- creation via `AppConfigService.create()` -> `POST /appConfig/create`
- edition via `AppConfigService.update()` -> `POST /appConfig/update`
- suppression via `AppConfigService.delete()` -> `POST /appConfig/delete`
- restauration via `AppConfigService.update({ id, isDeleted: false })` -> `POST /appConfig/update`
- activation explicite disponible dans le service via `AppConfigService.activate(id)` -> `POST /appConfig/activate`

## 7. Ce Que Le Backend Doit Envoyer

- Un endpoint `getByCriteria` pagine avec `items` et `count` exploitable par le mapping custom du composant.
- Des configurations normalisees, avec `logoHtml` sanitise et `candidateAccountsEnabled` expose.
- Un contrat clair sur l'unicite de la configuration active.
- Une lecture publique assez stable pour que le theme actif et le lien applicatif puissent etre consommes hors dashboard.
- Des droits d'ecriture restreints, aujourd'hui reserves au `SUPER_ADMIN` pour les endpoints de mutation et d'activation.

## 8. Entites Metier Impliquees

- `appConfig`
- theming public de l'application
- `candidateAccountsEnabled`
- URL publique de l'application via `appLink`

## 9. Questions Ou Ecarts A Qualifier

- [x] Une action `Activer` explicite est exposee dans cette route.
- [ ] `appLink` doit-il etre rendu visible/editable ici ?
- [ ] Les cles de colonnes doivent-elles etre alignees sur le DTO reel ?
- [ ] La route doit-elle mieux signaler qu'une seule config active pilote le front public ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/app-config` avec un compte autorise.
2. Filtrer par nom de configuration et statut actif.
3. Creer une configuration avec couleur, logo HTML et comptes candidats.
4. Activer une configuration inactive et verifier le retour de succes ainsi que la bascule du theme actif en session.
5. Modifier la configuration et verifier l'impact attendu sur les donnees actives.
6. Supprimer puis restaurer une configuration.
