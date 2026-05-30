# Entities Mail Log

## 1. Identite

- Routes: `/dashboard/entities/mail-log` et `/dashboard/entities/mail-log/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/mail-log/entities-mail-log.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/mail-log/entities-mail-log.html`

## 2. Objectif Produit

La page expose le journal d'envoi d'emails, mais sous forme de CRUD complet. Elle joue donc un double role ambigu: audit technique d'un cote, et administration modifiable de logs de livraison de l'autre.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, destinataire, recipientUserId, senderUserId, emailTemplateId, statut, suppression et intervalles de dates.
- [x] Le tableau expose destinataire, statut, IDs utilisateur/template, `sentAt` et `createdAt`.
- [x] Les modales create/edit permettent de manipuler sujet, corps, statut, erreur et horodatage.
- [x] La restauration est supportee.
- [ ] La page traite un journal technique comme un CRUD editable complet, ce qui fragilise sa valeur d'audit.
- [ ] Les filtres et formulaires restent tres bruts: uniquement des IDs numeriques, sans FK resolues pour les utilisateurs ou le template.
- [ ] Le detail panel est cable en `saveItem -> validateEdit()` sans payload, contrairement au pattern standard `saveFromDetail($event)`: l'edition depuis le panneau detail est probablement incoherente ou inoperante.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les logs supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `recipientEmail`
- [x] filtre `recipientUserId`
- [x] filtre `senderUserId`
- [x] filtre `emailTemplateId`
- [x] filtre `status`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `recipientEmail`, `status`, `recipientUserId`, `senderUserId`, `emailTemplateId`, `sentAt`, `createdAt`
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] detail panel avec schema de champs explicite

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation log email
- [x] edition log email

## 5. Donnees Affichees Ou Editees

- `id`
- `recipientEmail`
- `recipientUserId`
- `senderUserId`
- `emailTemplateId`
- `subject`
- `bodyPreview`
- `status`
- `errorMessage`
- `sentAt`
- `isDeleted`
- `createdAt`

## 6. Services Et Endpoints

- liste via `MailLogCrudService.getAllByCriteria()` -> `POST /mailLog/getAllByCriteria`
- creation via `MailLogCrudService.create()` -> `POST /mailLog/create`
- edition via `MailLogCrudService.update()` -> `POST /mailLog/update`
- suppression via `MailLogCrudService.delete()` -> `POST /mailLog/delete`
- restauration via `MailLogCrudService.restore()` -> `POST /mailLog/update`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse paginee `getAllByCriteria` avec `items` ou `count/totalCount`, normalisable depuis camelCase ou snake_case.
- Des logs contenant destinataire, template, statut, erreur et horodatage d'envoi.
- Un comportement clair sur la modifiabilite reelle d'un log: audit en lecture, ou vrai CRUD d'administration.

## 8. Entites Metier Impliquees

- `mailLog`
- `emailTemplate`
- utilisateurs expediteur et destinataire
- audit de livraison email

## 9. Questions Ou Ecarts A Qualifier

- [ ] Un journal d'envoi doit-il vraiment rester editable et supprimable ?
- [ ] Faut-il enrichir la route avec de vraies FK resolues plutot que des IDs nus ?
- [ ] Le detail panel doit-il etre recable sur le flux standard `saveFromDetail($event)` ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/mail-log` avec un compte autorise.
2. Filtrer par destinataire, statut et template.
3. Ouvrir un detail panel puis tester une edition depuis ce panneau.
4. Modifier ensuite le meme log via la modale pour comparer le comportement.
5. Supprimer puis restaurer une ligne.

## 11. Impact Cible Multi-Occurrences

- [ ] documenter les nouveaux rattachements metier attendus (`applicationProgressId`, `interviewId`, `decisionId`, `notificationRuleId`, `eventCode`)
- [ ] clarifier si cette route devient un audit en lecture prioritaire plutot qu'un vrai CRUD editable
- [ ] faire du journal mail la source de trace des notifications critiques a la place des flags `mailSent` disperses dans le modele
- [ ] documenter aussi `applicationId`, `requiresConfirmation`, `confirmedAt` et `confirmedBy` pour tracer les validations manuelles des envois critiques
- [ ] distinguer clairement le role de `mail_log` par rapport a `notifications` et `audit_event` pour eviter trois journaux partiels qui se chevauchent
