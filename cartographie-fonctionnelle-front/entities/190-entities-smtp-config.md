# Entities Smtp Config

## 1. Identite

- Routes: `/dashboard/entities/smtp-config` et `/dashboard/entities/smtp-config/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/smtp-config/entities-smtp-config.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/smtp-config/entities-smtp-config.html`

## 2. Objectif Produit

La page administre les configurations SMTP actives de la plateforme. Elle reste cependant une surface CRUD minimale par rapport a l'usage metier reel, qui depend fortement du test de configuration active et d'un contrat strict de secret write-only.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` via des types ad hoc `SmtpConfigCriteria` et `PagedSmtpConfigResponse`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, host, actif, suppression et intervalles de dates.
- [x] Le tableau expose host, port, username, email expediteur, actif et suppression.
- [x] Les modales create/edit exposent host, port, username, mot de passe, flags SMTP, identite expediteur et statut actif.
- [x] La restauration est supportee via un `update({ id, isDeleted: false })`.
- [x] Le mot de passe reste en saisie write-only dans l'UI, conforme au contrat SMTP attendu.
- [x] Le service expose `testActive()` -> `/smtpConfig/test`, et la page l'assume desormais comme action metier explicite via le toolbar.
- [ ] Les cles de colonnes TS restent `sender`, `active`, `deleted`, alors que le template lit `senderEmail`, `isActive`, `isDeleted`.
- [ ] Les champs plus techniques (`starttlsRequired`, `connectionTimeout`, `timeout`, `writeTimeout`) ne sont pas visibles dans cette route.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Tester la config active`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `host`
- [x] filtre `isActive`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `host`, `port`, `username`, `sender`, `active`, `deleted`
- [x] badges booleens pour actif / supprime
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] detail panel branche en bas de page

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation configuration SMTP
- [x] edition configuration SMTP

## 5. Donnees Affichees Ou Editees

- `id`
- `host`
- `port`
- `username`
- `password`
- `smtpAuth`
- `starttlsEnable`
- `starttlsRequired`
- `senderName`
- `senderEmail`
- `isActive`
- `isDeleted`
- `createdAt`
- `updatedAt`

## 6. Services Et Endpoints

- liste via `SmtpConfigService.getByCriteria()` -> `POST /smtpConfig/getByCriteria`
- creation via `SmtpConfigService.create()` -> `POST /smtpConfig/create`
- edition via `SmtpConfigService.update()` -> `POST /smtpConfig/update`
- suppression via `SmtpConfigService.delete()` -> `POST /smtpConfig/delete`
- restauration via `SmtpConfigService.update({ id, isDeleted: false })` -> `POST /smtpConfig/update`
- test de la configuration active disponible dans le service via `SmtpConfigService.testActive()` -> `POST /smtpConfig/test`

## 7. Ce Que Le Backend Doit Envoyer

- Un endpoint `getByCriteria` pagine avec `items` et `count` exploitable par le mapping custom du composant.
- Des configurations SMTP ne renvoyant pas le secret chiffre en lecture.
- Un endpoint `test` capable d'envoyer un email de verification sur la configuration active.
- Un contrat stable entre la config active et les flux de livraison email du reste de la plateforme.

## 8. Entites Metier Impliquees

- `smtpConfig`
- livraison email de la plateforme
- verification admin de la configuration active

## 9. Questions Ou Ecarts A Qualifier

- [x] Le bouton `Tester la config active` est expose ici, aligne sur l'usage SMTP existant dans les settings.
- [ ] Les cles de colonnes doivent-elles etre alignees sur le DTO reel ?
- [ ] Les champs avances de timeouts et `starttlsRequired` doivent-ils etre visibles dans ce CRUD ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/smtp-config` avec un compte autorise.
2. Filtrer par host et statut actif.
3. Creer une configuration SMTP avec mot de passe write-only.
4. Utiliser `Tester la config active` et verifier le retour de succes ou d'erreur metier.
5. Modifier les flags `smtpAuth` et `starttlsEnable`.
6. Supprimer puis restaurer une configuration.
