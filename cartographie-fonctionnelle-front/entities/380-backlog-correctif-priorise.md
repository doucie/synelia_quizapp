# Backlog Correctif Priorise

## 1. Objectif

Ce backlog transforme la synthese transversale en lots actionnables.

Document source:

- [370-synthese-ecarts-entities-vs-dashboard.md](./370-synthese-ecarts-entities-vs-dashboard.md)

Logique retenue:

- P0 = risque fort ou dette structurelle bloquante;
- P1 = correction importante pour coherence produit et maintenabilite;
- P2 = rationalisation, simplification et decisions d'architecture produit.

## 2. Ordre Recommande

1. Securiser les guards et les permissions.
2. Reparer la chaine relationnelle `speciality` / `department`.
3. Uniformiser suppression / restauration et supprimer les flux morts.
4. Purger les fallbacks techniques de type `user: 1`.
5. Aligner les DTO, colonnes et templates sur les routes les plus exposees.
6. Reprendre les routes qui doublonnent deja une vraie page metier.

## 3. P0

### [x] BL-001 Revoir Les Guards Par Domaine

- Priorite: P0
- Impact: securite / autorisation
- Probleme: `MANAGE_APP_CONFIG` est reutilise sur des domaines permissions, pipeline, campagnes et referentiels RH alors que les surfaces specialisees montrent des droits plus fins.
- Fichiers ou fiches cibles:
  - [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md)
  - [270-entities-business-group-permissions.md](./270-entities-business-group-permissions.md)
  - [280-entities-user-business-groups.md](./280-entities-user-business-groups.md)
  - [300-entities-entity-permissions.md](./300-entities-entity-permissions.md)
  - [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md)
  - [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md)
  - [330-entities-campaigns.md](./330-entities-campaigns.md)
  - [340-entities-departments.md](./340-entities-departments.md)
  - [350-entities-specialities.md](./350-entities-specialities.md)
- Livrable attendu:
  - matrice route -> permission ciblee;
  - arbitrage explicite entre page brute et page specialisee;
  - correction des guards incoherents dans le routing.
- Realisation:
  - `quizapp_front/src/app/app.routes.ts` aligne les routes `entities/*` sur les permissions de lecture de domaine (`VIEW_*`) au lieu du reliquat `MANAGE_APP_CONFIG` absent du backend source;
  - `system-role-permissions` et `user-permission-overrides` conservent `MANAGE_SYSTEM_ROLES` comme les pages specialisees;
  - `/dashboard/entities` et `/dashboard/merise` sont alignes sur `VIEW_APP_CONFIG`.
- Critere de fin:
  - chaque route `entities/*` sensible a une permission justifiable metierement.

### [x] BL-002 Corriger La Chaine Speciality / Department

- Priorite: P0
- Impact: integrite des donnees / coherence inter-pages
- Probleme: `departmentId` et `departmentName` sont mal transportes dans la chaine `SpecialityService`, alors que plusieurs ecrans en dependent.
- Fichiers ou fiches cibles:
  - [340-entities-departments.md](./340-entities-departments.md)
  - [350-entities-specialities.md](./350-entities-specialities.md)
- Zones techniques probables:
  - `quizapp_front/src/app/core/services/speciality.service.ts`
  - `quizapp_front/src/app/pages/dashboard/entities/solo/departments/*`
  - `quizapp_front/src/app/pages/dashboard/entities/solo/specialities/*`
- Livrable attendu:
  - payload create/update incluant la relation departement si elle est requise produit;
  - mapping frontend rehydratant `departmentId` et `departmentName`;
  - expansion departement -> specialites fiable sans comportement vide fantome.
- Realisation:
  - `quizapp_front/src/app/core/services/speciality.service.ts` transmet maintenant `specialityName`, `specialityDesc` et `departmentId` au backend sur create/update/bulk update;
  - le mapping frontend rehydrate `departmentId` et `departmentName` sur les charges liste, detail et reponses CRUD;
  - `quizapp_front/src/app/pages/dashboard/entities/solo/departments/entities-departments.ts` charge les specialites avec un filtre `departmentId` cote API puis garde un filtre defensif cote frontend;
  - `quizapp_front/src/app/pages/dashboard/entities/solo/specialities/entities-specialities.ts` conserve un affichage coherent du departement selectionne pour les objets exposes en `nom` ou `name`.
- Critere de fin:
  - une specialite creee, editee ou chargee conserve correctement son rattachement departement sur toutes les pages.

### [x] BL-003 Uniformiser Suppression / Restauration

- Priorite: P0
- Impact: integrite des donnees / reduction du code mort
- Probleme: certaines routes affichent une restauration non operationnelle, d'autres reutilisent `update(isDeleted)` au lieu d'un vrai contrat metier.
- Fichiers ou fiches cibles:
  - [290-entities-invitation-codes.md](./290-entities-invitation-codes.md)
  - [210-entities-legal-texts.md](./210-entities-legal-texts.md)
  - [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md)
  - [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md)
  - [350-entities-specialities.md](./350-entities-specialities.md)
- Livrable attendu:
  - inventaire clair des entites restaurables ou non;
  - suppression des modales mortes;
  - harmonisation des helpers service / UI.
- Realisation:
  - le pattern partage `EntityCrudBase` et `EntityDetailPanel` expose maintenant une capacite explicite de restauration pour eviter les actions mortes dans les panneaux de detail;
  - `invitation-codes`, `system-role-permissions` et `user-permission-overrides` desactivent la restauration cote UI quand l'entite ne suit pas un vrai flux de soft delete restaure;
  - `InvitationCodeService` et `LegalTextService` respectent desormais l'absence de filtre `isDeleted`, ce qui rend enfin coherent le chargement des elements supprimes avec l'etat UI;
  - `LegalTextService` fournit un helper `restore()` dedie et `entities-specialities` utilise maintenant `delete()` / `restore()` au lieu de detourner `update(isDeleted)`.
- Critere de fin:
  - aucune action de restauration visible ne doit echouer “par design”.

### [x] BL-004 Purger Les Fallbacks Utilisateur Techniques

- Priorite: P0
- Impact: audit / attribution des mutations
- Probleme: certaines routes ou services conservent des fallbacks `user: 1` ou des hypotheses de bootstrap.
- Fichiers ou fiches cibles:
  - [220-entities-interview-participant.md](./220-entities-interview-participant.md)
  - [360-entities-answers.md](./360-entities-answers.md)
- Livrable attendu:
  - usages relies au vrai contexte auth;
  - echec explicite si le contexte utilisateur manque;
  - documentation des preconditions d'appel.
- Realisation:
  - `quizapp_front/src/app/core/services/interview-participant.service.ts` n'utilise plus `user: 1` ni fallback silencieux sur ses lectures, mutations CRUD et helpers de presence;
  - `quizapp_front/src/app/core/services/answer.service.ts` exige lui aussi un utilisateur authentifie pour les lectures et mutations admin au lieu d'un fallback `'1'`;
  - `quizapp_front/src/app/shared/entity-crud-base.ts` et `quizapp_front/src/app/pages/dashboard/entities/solo/answers/entities-answers.ts` affichent maintenant le message d'erreur remonte quand le contexte auth manque;
  - les fiches `220-entities-interview-participant.md` et `360-entities-answers.md` documentent desormais explicitement cette precondition d'appel.
- Critere de fin:
  - aucune mutation admin ne part avec un utilisateur fictif par defaut.

## 4. P1

### [x] BL-005 Aligner DTO / Colonnes / Templates

- Priorite: P1
- Impact: maintenabilite / reduction des regressions
- Probleme: les cles de colonnes et les DTO reels divergent frequemment.
- Fichiers ou fiches cibles prioritaires:
  - [330-entities-campaigns.md](./330-entities-campaigns.md)
  - [350-entities-specialities.md](./350-entities-specialities.md)
  - [360-entities-answers.md](./360-entities-answers.md)
  - [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md)
  - [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md)
  - [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md)
  - [260-entities-pipeline-stages.md](./260-entities-pipeline-stages.md)
  - [170-entities-email-templates.md](./170-entities-email-templates.md)
  - [160-entities-notifications.md](./160-entities-notifications.md)
- Livrable attendu:
  - vocabulaire front unifie;
  - detail panels et tableaux alignes sur les vrais champs;
  - moins de mapping manuel implicite dans les composants.
- Realisation:
  - `entities-specialities`: colonnes alignees sur `nom`, `departmentName`, `dateCreation`.
  - `entities-campaigns`: colonnes alignees sur les champs `campaign*`, filtres avances completes sur `campaignDesc` / `campaignStart*` / `campaignEnd*`, et formulaire create/edit normalise sur `specialityId`.
  - `CampaignService`: les mutations normalisent desormais `campaignName -> campaignTitle` et acceptent aussi l'ancien alias `specialitiesId` le temps de purger les usages restants.
  - `entities-answers`: colonnes alignees sur `answerOrder`, `answerType`, `isCorrect`.
    - `entities-system-role-permissions`: colonnes alignees sur `systemRole`, `functionality`.
    - `entities-user-permission-overrides`: colonnes alignees sur `functionality`, `isAllowed`.
    - `entities-pipeline-templates`: colonnes alignees sur `templateName`, `templateDesc`, `isActive`, `isLocked`.
    - `entities-pipeline-stages`: colonnes alignees sur `stageLabel`, `stageType`, `stageOrder`, `isRequired`, `isEliminatory`, `pipelineTemplateId`, `configJson`.
    - `entities-email-templates`: colonnes alignees sur `templateKey`, `subjectTemplate`, `isActive`, `isDeleted`.
    - `entities-notifications`: colonnes alignees sur `notifType`, `notifActor`, `notifLink`, `isRead`, `objectTableName`, `objectTableId`.
- Critere de fin:
  - les colonnes visibles et les champs modifiables utilisent le meme vocabulaire que le DTO front officiel.

### [x] BL-006 Remplacer IDs Bruts Et Champs Libres Sensibles

- Priorite: P1
- Impact: UX admin / reduction des erreurs de saisie
- Probleme: de nombreuses routes demandent des IDs ou enums en saisie libre alors que l'application sait deja charger des labels ou catalogues.
- Fichiers ou fiches cibles prioritaires:
  - [300-entities-entity-permissions.md](./300-entities-entity-permissions.md)
  - [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md)
  - [270-entities-business-group-permissions.md](./270-entities-business-group-permissions.md)
  - [280-entities-user-business-groups.md](./280-entities-user-business-groups.md)
  - [220-entities-interview-participant.md](./220-entities-interview-participant.md)
  - [150-entities-form-questions.md](./150-entities-form-questions.md)
  - [360-entities-answers.md](./360-entities-answers.md)
  - [60-entities-decisions.md](./60-entities-decisions.md)
- Livrable attendu:
  - selects ou autocompletes pour references critiques;
  - labels resolus dans les tableaux;
  - saisie libre reservee aux vrais cas techniques.
- Realisation en cours:
  - `entities-entity-permissions`: `entityType`, `permissionKey` et `systemRole` passent par des selects alignes sur les enums backend, `userId`/`businessGroupId` via catalogues frontend, et `entityId` via select dependant du type supporte avec labels resolus dans la grille.
  - `entities-system-role-permissions`: `systemRole` et `functionality` passent par des selects branches sur les catalogues frontend, avec labels resolus dans le tableau.
  - `entities-user-permission-overrides`: `userId` et `functionality` passent par des selects branches sur les catalogues utilisateur et permissions, avec labels resolus dans le tableau.
  - `entities-business-group-permissions`: `functionality` et `businessGroupId` passent par des selects branches sur les catalogues permissions et groupes, avec labels resolus dans le tableau.
  - `entities-user-business-groups`: `userId` et `businessGroupId` passent par des selects branches sur les catalogues utilisateur et groupes, avec labels resolus dans le tableau.
  - `entities-interview-participant`: les references `userId` et `interviewId` sont resolues via les catalogues deja charges, dans la grille et les selecteurs.
  - `entities-answers`: `questionId` est resolu via le catalogue des questions dans la grille et les selecteurs.
  - `entities-form-questions`: `formVersionId` et `questionId` sont resolus via les catalogues de versions et questions dans la grille et les selecteurs.
  - `entities-decisions`: `applicationId`, `userId` et `pipelineStageId` sont resolus via les catalogues charges dans la grille et les selecteurs.
- Critere de fin:
  - les routes les plus sensibles ne demandent plus a l'utilisateur de saisir a la main les valeurs de reference les plus risquées.

### [x] BL-007 Exposer Les Helpers Metier Prioritaires Ou Assumer Leur Absence

- Priorite: P1
- Impact: completude fonctionnelle / lisibilite produit
- Probleme: le service sait souvent faire plus que l'UI, sans decision explicite sur ce qui doit rester cache ou devenir actionnable.
- Fichiers ou fiches cibles prioritaires:
  - [200-entities-app-config.md](./200-entities-app-config.md)
  - [190-entities-smtp-config.md](./190-entities-smtp-config.md)
  - [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md)
  - [260-entities-pipeline-stages.md](./260-entities-pipeline-stages.md)
  - [290-entities-invitation-codes.md](./290-entities-invitation-codes.md)
  - [230-entities-application-progress.md](./230-entities-application-progress.md)
  - [330-entities-campaigns.md](./330-entities-campaigns.md)
  - [340-entities-departments.md](./340-entities-departments.md)
- Livrable attendu:
  - arbitrage helper par helper;
  - exposition UI des actions retenues;
  - documentation explicite des actions volontairement hors scope.
- Realisation:
  - `entities-invitation-codes`: `resend()` est expose pour les codes actifs non utilises; `update()` et `restore()` sont maintenant explicitement assumes hors scope dans l'UI et la fiche, tandis que `validateCode()` / `registerWithCode()` restent limites au parcours d'onboarding.
  - `entities-smtp-config`: `testActive()` est maintenant expose dans le toolbar avec le meme feedback de notification que la surface settings, ce qui leve l'ambiguite entre helper cache et action admin attendue.
  - `entities-app-config`: `activate(id)` est maintenant expose comme action explicite sur les configurations inactives, avec confirmation utilisateur et synchronisation immediate du theme actif en session.
  - `entities-application-progress`: `getByApplication()` est maintenant expose comme vue ciblee par candidature, tandis que les vraies transitions pipeline (`advance`, `fail`, `skip`, `rollback`) restent explicitement hors scope de cette route brute.
  - `entities-campaigns`: l'onglet `Permissions` consomme maintenant `getCampaignAccess()` pour afficher les acces recruteurs reels (`follow`, `creator`, `advance pipeline`) au lieu d'une agregration locale partielle; `saveCampaignAccess()` et `createNotification()` restent hors scope de cette route brute.
  - `entities-pipeline-templates`: `duplicate()` et `setDefault()` sont maintenant exposes avec les confirmations/metadonnees minimales, et les templates verrouilles n'affichent plus les actions directes d'edition/suppression qui contredisaient la regle produit de duplication.
  - `entities-pipeline-stages`: `getByTemplate()` est maintenant expose comme vue ciblee par template, tandis que `reorder()` reste explicitement hors scope de cette route brute au profit de l'editeur detaille.
  - `entities-departments`: la suppression expose maintenant explicitement le chemin `deleteWithCascade()` quand des specialites associees sont detectees, au lieu de laisser ce helper cache cote service.
- Critere de fin:
  - il n'y a plus de flou sur le statut “cache”, “obsolete” ou “a exposer” des helpers principaux.

### [x] BL-008 Clarifier Le Statut Des Pages Brutes Vs Pages Metier

- Priorite: P1
- Impact: coherence produit / eviter les doublons
- Probleme: plusieurs domaines ont deux surfaces concurrentes, sans statut explicite.
- Domaines cibles:
  - campagnes
  - pipelines
  - permissions systeme et utilisateur
  - templates email
  - referentiels departements / specialites / answers
- Livrable attendu:
  - decision “page metier de reference” par domaine;
  - mention explicite si `entities/*` reste une surface technique;
  - redirections ou liens croises si necessaire.
- Realisation:
  - `entities-campaigns`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers la page metier de reference `/dashboard/campaigns`, ce qui reduit l'ambiguite sans casser le CRUD brut existant.
  - `entities-pipeline-templates`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers la page metier de reference `/dashboard/pipeline-templates`, ce qui clarifie le partage de roles avec l'editeur specialise sans retirer les actions CRUD brutes.
  - `entities-pipeline-stages`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA vers le catalogue pipeline, ou directement vers l'editeur du template courant quand la vue est deja ciblee, ce qui clarifie ou gerer l'ordre des etapes et les flags email.
  - `entities-email-templates`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers `/dashboard/email-editor`, ce qui clarifie que la vraie gestion des presets, `actionType` et previews appartient a l'editeur dedie.
  - `entities-system-role-permissions`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers `/dashboard/system-role-permissions`, ce qui clarifie que la vraie edition par role, categories et cas `SUPER_ADMIN` appartient a la page specialisee.
  - `entities-user-permission-overrides`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers `/dashboard/user-permissions`, ce qui clarifie que le vrai travail metier sur les surcharges tri-etat et groupes metiers appartient a la page specialisee.
  - `entities-departments`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers `/dashboard/departments`, ce qui clarifie que la vue cartes et le pilotage quotidien appartiennent a la page metier tout en conservant l'expansion technique inline.
  - `entities-specialities`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers `/dashboard/specialities`, ce qui clarifie que les filtres de consultation et le CRUD metier quotidien appartiennent a la page metier.
  - `entities-answers`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers `/dashboard/answers`, ce qui clarifie que la consultation transverse quotidienne appartient a la page metier plutot qu'au CRUD brut.
  - `entities-business-groups`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers `/dashboard/business-groups`, ce qui clarifie que la vraie gestion des informations, permissions, membres et demandes appartient a la page metier de groupe.
  - `entities-business-group-permissions`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers `/dashboard/business-groups`, ce qui clarifie que la vraie gestion metier des permissions collectives appartient a la page detaillee du groupe.
  - `entities-user-business-groups`: la route annonce maintenant explicitement son statut de surface technique et propose un CTA direct vers `/dashboard/user-permissions`, ce qui clarifie que la vraie gestion metier des rattachements groupes d'un utilisateur appartient a la page specialisee utilisateur.
- Critere de fin:
  - un admin peut comprendre quelle page utiliser sans ambiguité fonctionnelle.

## 5. P2

### [ ] BL-009 Arbitrer Les Routes A Conserver, Rediriger Ou Deprecier

- Priorite: P2
- Impact: simplification du frontend
- Recadrage: ne pas traiter la dualite `dashboard/entities/*` vs `dashboard/*` comme une anomalie quand elle correspond volontairement a la separation `super-admin technique` vs `page metier`.
- Candidats naturels:
  - [330-entities-campaigns.md](./330-entities-campaigns.md)
  - [70-entities-business-groups.md](./70-entities-business-groups.md)
  - [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md)
  - [260-entities-pipeline-stages.md](./260-entities-pipeline-stages.md)
  - [170-entities-email-templates.md](./170-entities-email-templates.md)
  - [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md)
  - [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md)
  - [270-entities-business-group-permissions.md](./270-entities-business-group-permissions.md)
  - [280-entities-user-business-groups.md](./280-entities-user-business-groups.md)
- Livrable attendu:
  - tableau conserver / reduire / rediriger / deprecier.
- Cible reelle:
  - identifier les vraies routes frontend mortes, aliases historiques inutiles ou points d'entree qui n'ont plus d'usage produit ni technique;
  - verifier separement si certains endpoints backend anciens existent encore sans consommateur frontend utile.

### [ ] BL-010 Construire Un Vrai Pattern CRUD Type-Safe

- Priorite: P2
- Impact: maintenabilite a long terme
- Probleme: trop de composants reimplementent le meme schema CRUD avec mapping et conventions instables.
- Livrable attendu:
  - pattern partage plus strict;
  - adaptation explicite des DTO et colonnes;
  - reduction du code de glue dans chaque route.

### [ ] BL-011 Centraliser Les Mappings De Permissions Et Relations

- Priorite: P2
- Impact: coherence fonctionnelle
- Probleme: plusieurs pages reconstruisent localement badges, relations et agregats a partir de services generiques.
- Zones visees:
  - campagnes
  - interviews
  - permissions entite / role / overrides
  - relations department / speciality
- Livrable attendu:
  - transformations partagees au niveau service ou facade;
  - disparition des reconstructions ad hoc dans les composants.

## 6. Lots D'Execution Recommandes

### [ ] Lot A Securite Et Autorisations

- inclut BL-001
- peut inclure une partie de BL-008 sur permissions et campagnes

### [ ] Lot B Integrite Des Relations Et Mutations

- inclut BL-002, BL-003, BL-004

### [ ] Lot C Lisibilite Des CRUD Exposes

- inclut BL-005, BL-006

### [ ] Lot D Rationalisation Produit

- inclut BL-007, BL-008, BL-009

### [ ] Lot E Industrialisation Front

- inclut BL-010, BL-011

## 7. Premier Lot A Lancer Sans Reanalyse Globale

Si l'objectif est d'attaquer directement le code, le lot le plus rentable est:

1. BL-001 Revoir les guards par domaine.
2. BL-002 Corriger la chaine `speciality` / `department`.
3. BL-003 Uniformiser suppression / restauration sur les routes les plus incoherentes.

Ce trio reduit le plus de risque avec un perimetre encore localisable.
