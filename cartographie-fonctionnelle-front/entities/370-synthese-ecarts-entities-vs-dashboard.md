# Synthese Transversale Entities Vs Dashboard

## 1. Objectif

Ce document condense les ecarts recurrents observes entre:

- les routes `dashboard/entities/solo/*`, souvent construites comme CRUD bruts ou tables d'administration;
- les pages dashboard specialisees, qui portent la vraie experience metier du produit.

Il ne remplace pas les fiches detaillees par route. Il sert a identifier les problemes structurels repetitifs, a evaluer leur impact et a preparer un backlog correctif priorise.

## 2. Conclusion Rapide

- Les routes `entities/*` servent souvent mieux comme surfaces d'inspection technique ou de support back-office que comme ecrans metier de reference.
- Le frontend duplique plusieurs domaines en deux versions concurrentes: une route CRUD brute et une page specialisee plus fidele au produit.
- Les ecarts ne sont pas seulement visuels: ils touchent aussi les guards, les payloads, les mappings DTO/UI, les actions disponibles et parfois le contrat de suppression/restauration.
- Tant que cette dualite reste active, il faut clarifier quelles pages sont des surfaces metier et quelles pages sont seulement des CRUD administratifs.

## 3. Ecarts Recurrents

### 3.1 Guards Trop Generiques

Le motif le plus visible est la reutilisation massive de `permissionGuard(['MANAGE_APP_CONFIG'])`, y compris sur des domaines qui relevent plutot:

- des permissions systeme ou groupes;
- des pipelines;
- des campagnes;
- de referentiels RH.

Cas representatifs:

- [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md)
- [270-entities-business-group-permissions.md](./270-entities-business-group-permissions.md)
- [280-entities-user-business-groups.md](./280-entities-user-business-groups.md)
- [300-entities-entity-permissions.md](./300-entities-entity-permissions.md)
- [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md)
- [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md)
- [330-entities-campaigns.md](./330-entities-campaigns.md)
- [340-entities-departments.md](./340-entities-departments.md)
- [350-entities-specialities.md](./350-entities-specialities.md)

Impact:

- risque de sur-ou sous-exposition fonctionnelle;
- incoherence entre route brute et page specialisee equivalente;
- difficulte a raisonner metierement sur les badges et actions visibles.

Lecture transversale: la permission de config application semble avoir servi de garde-fou par defaut a la place d'un vrai mapping par domaine.

### 3.2 CRUD Brut Vs Surface Metier

Plusieurs routes `entities/*` ne couvrent qu'un sous-ensemble de la logique produit alors qu'une page specialisee existe deja et porte le vrai flux metier.

Cas representatifs:

- [330-entities-campaigns.md](./330-entities-campaigns.md) vs [10-dashboard-campaigns.md](../dashboard/10-dashboard-campaigns.md), [12-dashboard-campaign-detail.md](../dashboard/12-dashboard-campaign-detail.md), [13-dashboard-campaign-edit.md](../dashboard/13-dashboard-campaign-edit.md)
- [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md) vs [40-dashboard-pipeline-templates.md](../dashboard/40-dashboard-pipeline-templates.md) et [41-dashboard-pipeline-template-edit.md](../dashboard/41-dashboard-pipeline-template-edit.md)
- [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md) vs [60-dashboard-system-role-permissions.md](../dashboard/60-dashboard-system-role-permissions.md)
- [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md) et [280-entities-user-business-groups.md](./280-entities-user-business-groups.md) vs [62-dashboard-user-permissions.md](../dashboard/62-dashboard-user-permissions.md)
- [170-entities-email-templates.md](./170-entities-email-templates.md) vs [80-dashboard-email-editor.md](../dashboard/80-dashboard-email-editor.md) et [82-dashboard-email-presets.md](../dashboard/82-dashboard-email-presets.md)
- [340-entities-departments.md](./340-entities-departments.md) vs [51-dashboard-departments.md](../dashboard/51-dashboard-departments.md)
- [350-entities-specialities.md](./350-entities-specialities.md) vs [52-dashboard-specialities.md](../dashboard/52-dashboard-specialities.md)
- [360-entities-answers.md](./360-entities-answers.md) vs [54-dashboard-answers.md](../dashboard/54-dashboard-answers.md)

Impact:

- duplication fonctionnelle avec comportements differents;
- dette documentaire et UX, car deux ecrans semblent faire la meme chose sans offrir le meme niveau de verite metier;
- risque de corriger une version tout en laissant l'autre incoherente.

Lecture transversale: plusieurs routes `entities/*` ressemblent a des vues de maintenance BD, tandis que les pages dashboard specialisees ressemblent aux vrais outils produit.

### 3.3 Helpers Service Non Exposes

De nombreuses fiches montrent que le service associe sait faire plus que l'UI ne le permet reellement.

Exemples clairs:

- [290-entities-invitation-codes.md](./290-entities-invitation-codes.md): `resend()`, `validateCode()`, `registerWithCode()`
- [200-entities-app-config.md](./200-entities-app-config.md): `activate(id)`
- [190-entities-smtp-config.md](./190-entities-smtp-config.md): `testActive()`
- [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md): `setDefault()`, `duplicate()`
- [260-entities-pipeline-stages.md](./260-entities-pipeline-stages.md): `getByTemplate()`, `reorder()`
- [230-entities-application-progress.md](./230-entities-application-progress.md): `advance`, `fail`, `skip`, `rollback`, `migrateMultipleCandidates`
- [220-entities-interview-participant.md](./220-entities-interview-participant.md): presence et statut temps reel
- [340-entities-departments.md](./340-entities-departments.md): `checkAssociatedSpecialities()`, `deleteWithCascade()`
- [330-entities-campaigns.md](./330-entities-campaigns.md): gestion des acces, notifications et controle d'edition

Impact:

- l'ecran admin semble incomplete alors que le backend sait deja faire davantage;
- certaines actions metier ne sont accessibles qu'ailleurs, voire nulle part cote front;
- la lecture du code donne une impression de fonctionnalites “cachees” ou partiellement abandonnees.

Lecture transversale: le service a souvent evolue plus vite que les routes CRUD qui le consomment.

### 3.4 Mismatch DTO / Colonnes / Template

Les cles de colonnes et les champs manipules par les templates ne correspondent pas toujours aux DTO reels. Ce motif apparait sur beaucoup de routes, parfois avec mapping manuel partiel, parfois avec noms historiques restes dans le composant.

Exemples representatifs:

- [330-entities-campaigns.md](./330-entities-campaigns.md): `name`, `description`, `status`, `startDate`, `endDate` vs `campaignName`, `campaignDesc`, `campaignStatus`, `campaignStart`, `campaignEnd`
- [350-entities-specialities.md](./350-entities-specialities.md): `name`, `department`, `createdAt` vs `nom`, `departmentName`, `dateCreation`
- [360-entities-answers.md](./360-entities-answers.md): `order`, `type`, `correct` vs `answerOrder`, `answerType`, `isCorrect`
- [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md): `role`, `feature` vs `systemRole`, `functionality`
- [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md): `feature`, `allowed` vs `functionality`, `isAllowed`
- [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md): `name`, `description`, `active`, `locked` vs `templateName`, `templateDesc`, `isActive`, `isLocked`
- [260-entities-pipeline-stages.md](./260-entities-pipeline-stages.md): `label`, `order`, `mandatory`, `template` vs `stageLabel`, `stageOrder`, `isRequired`, `pipelineTemplateId`
- [170-entities-email-templates.md](./170-entities-email-templates.md): `key`, `subject`, `active`, `deleted` vs `templateKey`, `subjectTemplate`, `isActive`, `isDeleted`

Impact:

- code plus fragile et plus difficile a maintenir;
- risque de filtres, tris ou detail panels semi-casses;
- difficulte a normaliser un pattern CRUD partage.

Lecture transversale: plusieurs composants ont ete adaptes par couches successives sans re-aligner le vocabulaire front avec le contrat du backend.

### 3.5 IDs Bruts Et Saisie Libre

Beaucoup de routes “techniques” affichent des IDs bruts ou demandent des saisies libres sur des enums et references qui devraient etre resolues ou contraintes.

Exemples:

- [360-entities-answers.md](./360-entities-answers.md): `questionId` brut alors que les questions sont deja chargees
- [60-entities-decisions.md](./60-entities-decisions.md): application, utilisateur et etape pipeline en IDs
- [220-entities-interview-participant.md](./220-entities-interview-participant.md): `userId` et `interviewId` bruts
- [150-entities-form-questions.md](./150-entities-form-questions.md): `versionId` et `questionId` bruts
- [270-entities-business-group-permissions.md](./270-entities-business-group-permissions.md): saisie libre de la fonctionnalite et ID de groupe brut
- [280-entities-user-business-groups.md](./280-entities-user-business-groups.md): relation uniquement par IDs
- [300-entities-entity-permissions.md](./300-entities-entity-permissions.md): `entityType`, `permissionKey`, `systemRole` et IDs saisis en brut
- [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md): `systemRole` et `functionality` en texte libre

Impact:

- ergonomie faible pour les admins;
- risque plus eleve d'entrees invalides ou incoherentes;
- decrochage entre l'ecran brut et la page specialisee qui, elle, sait resoudre labels et catalogues.

Lecture transversale: ces ecrans privilegient l'acces direct a la table plutot qu'une experience admin guidee.

### 3.6 Suppression Et Restauration Incoherentes

La semantique de suppression/restauration n'est pas homogene entre les routes.

Exemples:

- [290-entities-invitation-codes.md](./290-entities-invitation-codes.md): bloc de restauration present alors que `performRestore()` n'est pas supporte
- [350-entities-specialities.md](./350-entities-specialities.md): la route passe par `update(..., isDeleted)` alors que le service expose `delete()` et `restore()`
- [210-entities-legal-texts.md](./210-entities-legal-texts.md): restauration via update brut plutot qu'un helper dedie
- [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md): flux de restauration present sans filtre supprimes explicite
- [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md): meme motif

Impact:

- code mort ou semi-mort dans certaines modales;
- contrat backend peu lisible selon les entites;
- risque de regression si les pages sont harmonisees sans clarifier d'abord la semantique cible.

Lecture transversale: la restauration semble avoir ete ajoutee de maniere opportuniste, sans pattern commun stabilise.

### 3.7 Relations Et Chargements Fragiles

Certaines routes reconstruisent trop de logique cote front ou chargent trop large pour compenser un contrat service incomplet.

Cas representatifs:

- [340-entities-departments.md](./340-entities-departments.md): chargement de toutes les specialites (`size: 10000`) puis filtrage client par `departmentId`
- [350-entities-specialities.md](./350-entities-specialities.md): `departmentId` et `departmentName` mal transportes par le service
- [330-entities-campaigns.md](./330-entities-campaigns.md): permissions enfant agregees cote front a partir de `entity_permission`
- [30-entities-interviews.md](./30-entities-interviews.md): reconstruction des permissions membres et badge `Admin` a partir de la config

Impact:

- surcout de chargement;
- dependances implicites entre pages;
- bugs subtils de coherence quand le mapping d'une relation casse a un seul endroit.

Lecture transversale: plusieurs pages compensent des endpoints trop generiques par du calcul local, ce qui disperse la logique metier.

### 3.8 Fallbacks Utilisateur Et Contrats Techniques Laches

Quelques routes documentent encore des comportements techniques fragiles, notamment l'usage de `user: 1` ou de fallbacks permissifs si le contexte auth n'est pas proprement resolu.

Cas representatifs:

- [220-entities-interview-participant.md](./220-entities-interview-participant.md)
- [360-entities-answers.md](./360-entities-answers.md)

Impact:

- risque de mutation attribuee au mauvais utilisateur;
- dette technique masquee tant que l'environnement de test est permissif;
- difficulte a fiabiliser audit et tracing.

Lecture transversale: certaines routes CRUD ont garde des hypothese de developpement ou de bootstrap qui devraient etre purgees.

## 4. Typologie Des Routes Entities

### 4.1 Routes Qui Ressemblent A Des Outils De Maintenance

Ces routes ont du sens si elles sont assumees comme CRUD admin bruts ou vues d'inspection:

- [180-entities-mail-log.md](./180-entities-mail-log.md)
- [210-entities-legal-texts.md](./210-entities-legal-texts.md)
- [240-entities-email-verification-tokens.md](./240-entities-email-verification-tokens.md)
- [290-entities-invitation-codes.md](./290-entities-invitation-codes.md)

Lecture: elles sont utiles pour debugger, auditer ou maintenir des objets techniques, mais pas comme experience produit principale.

### 4.2 Routes Qui Chevauchent Une Vraie Page Metier

Ces routes deviennent ambigues parce qu'une page specialisee existe deja et fait mieux:

- [330-entities-campaigns.md](./330-entities-campaigns.md)
- [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md)
- [260-entities-pipeline-stages.md](./260-entities-pipeline-stages.md)
- [170-entities-email-templates.md](./170-entities-email-templates.md)
- [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md)
- [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md)
- [270-entities-business-group-permissions.md](./270-entities-business-group-permissions.md)
- [280-entities-user-business-groups.md](./280-entities-user-business-groups.md)

Lecture: c'est ici que le risque de divergence produit est le plus fort.

### 4.4 Routes Qui Restent Utiles Mais Demandent Un Nettoyage Structurel

Ces pages peuvent rester pertinentes, mais elles demandent surtout une remise a plat du mapping et des relations:

- [340-entities-departments.md](./340-entities-departments.md)
- [350-entities-specialities.md](./350-entities-specialities.md)
- [360-entities-answers.md](./360-entities-answers.md)
- [150-entities-form-questions.md](./150-entities-form-questions.md)
- [220-entities-interview-participant.md](./220-entities-interview-participant.md)

Lecture: ici le probleme principal n'est pas seulement le produit, mais aussi la qualite du contrat technique.

## 5. Risques Prioritaires

### 5.1 Risque Securite / Autorisation

- guards generiques sur des domaines sensibles;
- badges ou actions derives de permissions non alignees metierement;
- ecart entre la route brute et la vraie page d'administration des droits.

### 5.2 Risque Integrite Des Donnees

- relations mal mappees;
- payloads incomplets;
- restauration ou suppression non homogenes;
- fallback utilisateur technique.

### 5.3 Risque Produit / UX

- deux ecrans pour un meme domaine, avec comportements differents;
- champs visibles mais non editables;
- aides metier absentes alors que le service les supporte;
- tableaux peu lisibles a cause des IDs bruts.

### 5.4 Risque Maintenance

- logique de mapping dupliquee;
- reconstruction locale des permissions et relations;
- ecarts persistants entre DTO, colonnes et templates.

## 6. Backlog Correctif Priorise

### 6.1 P0

- Revoir les guards par domaine avant toute refonte UX, en priorite sur permissions, pipelines et campagnes.
- Corriger la chaine `speciality` / `department` pour fiabiliser `departmentId`, `departmentName` et les expansions dependantes.
- Supprimer les flux morts de restauration ou les rendre reellement operationnels.
- Purger les fallbacks `user: 1` encore presents sur les mutations admin.

### 6.2 P1

- Aligner les cles de colonnes et les DTO reels sur les CRUD les plus exposes.
- Remplacer les champs libres et IDs bruts par des labels resolus ou des selects contraints sur les routes permissions et relations.
- Exposer les helpers metier les plus importants quand la route brute reste officielle: activation config, test SMTP, duplicate/setDefault pipeline, resend invitation, actions pipeline.
- Clarifier explicitement dans l'UI quelles pages sont des surfaces “brutes” et quelles pages sont les surfaces metier de reference.

### 6.3 P2

- Arbitrer route par route s'il faut conserver le CRUD `entities/*`, le simplifier, le rediriger ou le deprecier.
- Mutualiser un vrai pattern CRUD type-safe pour limiter les mismatches DTO/UI.
- Centraliser la semantique suppression/restauration au lieu de la recoder entite par entite.

## 7. Recommandation Strategique

La ligne la plus defendable est la suivante:

- traiter les pages dashboard specialisees comme source de verite produit;
- traiter les pages `entities/*` soit comme outils de maintenance assumee, soit comme candidats a suppression si elles n'apportent rien de distinct;
- documenter explicitement cette difference pour eviter de corriger indifferemment deux surfaces qui n'ont pas le meme role.

Sans cette clarification, le frontend risque de continuer a accumuler deux couches concurrentes:

- une couche “metier” plus fidele mais plus specifique;
- une couche “CRUD universel” plus rapide a generer mais structurellement decalee.

## 8. Prochaine Etape Naturelle

La synthese a ete transformee en backlog actionnable ici:

- [380-backlog-correctif-priorise.md](./380-backlog-correctif-priorise.md)

Ordre de depart recommande:

1. guards et permissions;
2. mapping relationnel `speciality` / `department`;
3. routes permissions qui doublonnent deja des pages metier plus riches.
