# Dashboard Settings

## 1. Identite

- Route: `/dashboard/settings`
- Guard: route protegee par `authGuard` sur le shell, visibilite menu conditionnee par permissions `VIEW_APP_CONFIG` ou `VIEW_EMAIL_TEMPLATE`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/settings/settings.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/settings/settings.html`
- Onglets principaux: `emails`, `smtp`, `legal`, `config`, `invitations`

## 2. Objectif Produit

La page centralise l’administration fonctionnelle et technique visible du produit: templates email, SMTP, textes juridiques, identité visuelle de l’application et invitations utilisateurs.

## 3. Etat Constate

- [x] La page charge plusieurs sections en parallèle via `forkJoin`.
- [x] Les onglets `emails`, `smtp`, `legal` et `invitations` sont réservés au rôle `super`.
- [x] L’onglet `config` reste accessible hors `super` mais en lecture seule.
- [x] Chaque section a son état vide, ses cartes de liste et ses actions de création / édition / suppression.
- [x] Le chargement partiel est déjà géré avec notifications d’erreur par section.
- [x] La configuration d’application supporte un vrai mode aperçu non sauvegardé.
- [x] Les invitations distinguent `envoyée`, `utilisée`, `expirée` et supportent le renvoi.
- [ ] Vérifier finement quels profils non `super` atteignent réellement la route via les guards et les données du shell.
- [ ] Vérifier que la lecture seule côté UI est suffisante si le backend refuse aussi les mutations aux rôles non `super`.

## 4. Blocs UI Constates

### 4.1 Structure générale

- [x] Titre `Paramètres`
- [x] Barre d’onglets dynamique selon le rôle
- [x] État global de chargement

### 4.2 Onglet `Templates Email`

- [x] Liste des templates avec badge actif/inactif
- [x] Bouton `Gérer les presets`
- [x] Bouton `Nouveau template`
- [x] Redirection vers `/dashboard/email-editor` ou `/dashboard/email-editor/:id`
- [x] Modal d’édition encore présente mais la navigation vers éditeur dédié semble le flux principal

### 4.3 Onglet `SMTP`

- [x] Liste des configurations SMTP
- [x] Bouton `Tester la config active`
- [x] Création / édition / suppression d’une config
- [x] Champs techniques détaillés: host, port, auth, STARTTLS, timeouts, expéditeur

### 4.4 Onglet `Textes juridiques`

- [x] Liste des textes avec `textKey`, `title`, aperçu HTML
- [x] Création / édition / suppression
- [x] Éditeur riche pour le contenu HTML

### 4.5 Onglet `Configuration App`

- [x] Liste des configurations visuelles
- [x] Distinction configuration active / inactive / prévisualisée
- [x] Mode lecture seule pour non `super`
- [x] Prévisualisation locale du thème
- [x] Activation d’une configuration inactive
- [x] Édition de `configName`, `companyName`, `appLink`, logo, palette et comptes candidats

### 4.6 Onglet `Invitations`

- [x] Liste des invitations avec état d’usage et d’expiration
- [x] Création d’invitation avec email et rôle
- [x] Renvoi d’invitation
- [x] Suppression d’invitation

## 5. Donnees Affichees

### 5.1 Templates email

- `id`
- `templateKey`
- `subjectTemplate`
- `bodyTemplate`
- `description`
- `availableVariables`
- `actionType`
- `isActive`

### 5.2 SMTP

- `id`
- `host`
- `port`
- `username`
- `senderName`
- `senderEmail`
- `smtpAuth`
- `starttlsEnable`
- `starttlsRequired`
- `connectionTimeout`, `timeout`, `writeTimeout`
- `isActive`

### 5.3 Textes juridiques

- `id`
- `textKey`
- `title`
- `description`
- `content`
- `isActive`

### 5.4 Configuration app

- `id`
- `configName`
- `companyName`
- `appLink`
- `logoHtml`
- `primaryColor`
- `colorScheme`
- `candidateAccountsEnabled`
- `isActive`

### 5.5 Invitations

- `id`
- `email`
- `role`
- `isUsed`
- `expiredAt`
- `createdAt`

## 6. Services Et Endpoints

### 6.1 Chargement initial

- `EmailTemplateService.getByCriteria()` -> `POST /emailTemplate/getByCriteria`
- `SmtpConfigService.getByCriteria()` -> `POST /smtpConfig/getByCriteria`
- `LegalTextService.getByCriteria()` -> `POST /legalText/getByCriteria`
- `AppConfigService.getByCriteria()` -> `POST /appConfig/getByCriteria`
- `InvitationCodeService.getByCriteria()` -> `POST /invitationCode/getByCriteria`

### 6.2 Mutations

- templates: `create`, `update`, `delete` -> `/emailTemplate/create|update|delete`
- smtp: `create`, `update`, `delete`, `testActive` -> `/smtpConfig/create|update|delete|testActive`
- legal: `create`, `update`, `delete` -> `/legalText/create|update|delete`
- config: `create`, `update`, `delete`, `activate` -> `/appConfig/create|update|delete|activate`
- invitations: `create`, `delete`, `resend` -> `/invitationCode/create|delete|resend`

### 6.3 Dépendances transverses

- `ThemeService` applique le thème actif ou l’aperçu
- `LogoHtmlSanitizerService` nettoie le logo HTML avant rendu et sauvegarde
- `NotificationService` signale les succès/erreurs

## 7. Ce Que Le Backend Doit Envoyer

- Des réponses homogènes avec `items` utilisables pour chaque onglet.
- Des IDs stables pour toutes les entités de paramètres.
- Des statuts métier explicites: `isActive`, `isUsed`, dates d’expiration.
- Une gestion robuste des erreurs métier, surtout pour `resend`, `testActive`, `activate` et `create invitation`.
- Des contrôles d’autorisation serveur alignés avec le rôle `super` quand l’UI masque les actions.
- Un endpoint d’activation `appConfig` qui garantit une seule configuration active à la fois.

## 8. Entites Metier Impliquees

- `emailTemplate`
- `emailTemplatePreset`
- `smtpConfig`
- `legalText`
- `appConfig`
- `invitationCode`

## 9. Questions Ou Ecarts A Qualifier

- [ ] La route devrait-elle avoir un guard plus explicite que le simple shell auth ?
- [ ] Les non `super` doivent-ils toujours voir l’onglet `config` ou seulement la config active ailleurs dans l’UI ?
- [ ] Le vieux modal template est-il encore un flux supporté, ou seulement un reliquat UI ?
- [ ] Faut-il documenter séparément `/dashboard/email-editor` et `/dashboard/email-presets` comme sous-extensions de cette page ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/settings` avec un utilisateur `super`.
2. Vérifier les cinq onglets et leur chargement.
3. Tester un CRUD simple dans `smtp` ou `legal`.
4. Tester `Tester la config active` dans `smtp`.
5. Prévisualiser puis réactiver une configuration dans `config`.
6. Créer puis renvoyer une invitation.
7. Ouvrir la page avec un utilisateur non `super` et vérifier la lecture seule.