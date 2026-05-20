# Backlog unique simplifie -- alignement BD / backend / frontend

**Date :** 2026-05-18
**But :** remplacer le pilotage quotidien par un backlog plus court, plus lisible, et plus proche de l'etat reel du repo.

> Ce fichier sert de **backlog courant**. Les backlogs du 2026-05-11, 2026-05-12 et 2026-05-13 restent utiles comme historique detaille, mais on ne les suit plus au quotidien.

---

## Regles de lecture

- On suit d'abord le code reel et les migrations deja presentes dans le repo.
- On n'ouvre les anciens backlogs que pour retrouver un detail ou un item oublie.
- On traite le **backend avant le frontend** sur ce chantier.
- On ne lance pas de grand nettoyage documentaire ou de suppression de fichiers tant que le socle backend n'est pas recale.

---

## Bloc 1 -- Recaler le backend sur la BD deja migree

**Objectif :** fermer l'ecart entre les migrations deja presentes et le code Java encore en retard.

- [x] **Propager `V1_038__campaigns_archived_time_status.sql` dans le code backend**
   - [x] Ajouter dans `Campaigns` les champs manquants relies a la migration reelle : `isArchived`, `timeAllForms`, longueur `campaignStatus` alignee.
   - [x] Ajouter dans `Form` le champ `isTimed`.
   - [x] Repercuter ces champs dans DTO, transformers, business et endpoints concernes.

- [x] **Propager `V1_039__entity_permission_scope_columns.sql` dans le code backend**
   - [x] Aligner `EntityPermission` avec le schema reel migre : `user_id` nullable, `business_group_id`, `system_role`.
   - [x] Repercuter ces champs dans DTO, logique de lecture/ecriture et resolution de permissions.
   - [x] Suivre le schema reel du repo (`system_role`) tant qu'une remigration explicite vers `role_id` n'est pas decidee.

- [x] **Propager `V1_040__create_mail_log.sql` dans le code backend**
   - [x] Creer `MailLog` cote entity/repository/service.
   - [x] Exposer `MailLog` cote controller.
   - [x] Brancher l'envoi d'email pour ecrire dans `mail_log`.
   - [x] Ne pas traiter d'abord la page admin front ; faire d'abord exister la brique backend.

- [x] **Verifier l'etat reel de `V1_037__add_unique_constraints_referentials.sql`**
   - [x] Confirmer que les contraintes ajoutees en base sont bien compatibles avec les validations backend/front existantes.

**Definition de fini du bloc 1 :** les migrations 037 a 040 ne sont plus seulement presentes en SQL, elles existent aussi dans les entites et le backend compile proprement sur ces champs.

---

## Bloc 2 -- Corriger les incoherences de securite et de cohence les plus dangereuses

**Objectif :** supprimer les divergences qui peuvent casser les droits, les enums ou les routes critiques.

- [x] **Harmoniser les roles systeme partout**
   - [x] Aligner `UserRole`, `@PreAuthorize`, backend et frontend.
   - [x] Supprimer la valeur fantome `UTILISATEUR` du pilotage courant.
   - [x] Corriger le cas `SUPER` / `SUPER_ADMIN` pour n'avoir qu'une seule verite fonctionnelle.
   - [x] Normaliser `systemRole` dans les flux backend de permissions (`SystemRolePermission`, `EntityPermission`).
   - [x] Normaliser les roles d'invitation backend sur `UserRole` en gardant la contrainte `admin/recruiter`.

- [x] **Corriger les endpoints de debug et les droits incoherents**
   - [x] Corriger `QuestionController` si un role fantome est encore autorise.
   - [x] Supprimer ou neutraliser `GET /userDebug/roles-debug`.

- [x] **Rendre la validation des enums stricte cote backend**
   - [x] Introduire `CampaignStatus` cote backend et centraliser sa validation stricte.
   - [x] Introduire `InterviewStatus` cote backend et centraliser sa validation stricte.
   - [x] Introduire `InterviewType` cote backend et centraliser sa validation stricte.
   - [x] Introduire `DecisionType` cote backend et centraliser sa validation stricte.
   - [x] Introduire `CandidateAskRequestType` cote backend et centraliser sa validation stricte.
   - [x] Centraliser `CandidateAskStatus` cote backend sur le CRUD metier.
   - [x] Centraliser `ProgressStatus` cote backend et refuser les valeurs invalides sur le flux de progression.
   - [x] Introduire `EntityPermissionType` et `EntityPermissionKey` cote backend et centraliser leur validation stricte.
   - [x] Creer ou finaliser les enums backend manquants les plus structurants.
   - [x] Refuser toute valeur hors enum avec une erreur 400 claire.
   - [x] Priorite aux enums qui pilotent campagnes, permissions, decisions, interviews et pipeline.

- [x] **Aligner les enums critiques backend/front**
   - [x] `StageType`
   - [x] `CampaignStatus`
   - [x] `ProgressStatus`
   - [x] `ManualCorrectionStatus`

**Definition de fini du bloc 2 :** plus de role fantome, plus de route debug exposee, plus d'enum critique accepte en texte libre incoherent.

---

## Bloc 3 -- Terminer le coeur backend des campagnes et permissions

**Objectif :** finir la refonte la plus structurante du projet, sans s'eparpiller sur tout le front.

- [x] **Finaliser le cycle de vie de campagne**
   - [x] `CampaignStatus` final : `DRAFT`, `PENDING`, `OPEN`, `PAUSED`, `CLOSED`.
     - [x] Migrer les anciennes valeurs `ACTIVE` / `ARCHIVED` vers `OPEN` / `CLOSED` + `is_archived`.
   - [x] Implementer les transitions autorisees et leurs validations.
   - [x] Brancher `is_archived` correctement dans les listings backend.

- [x] **Finaliser la refonte `campaign_crud` -> permissions + follow**
   - [x] Etendre `FunctionalityEnum` pour les droits campagne.
   - [x] Confirmer que `FOLLOW` vit dans `entity_permission` via `V1_014`; ne pas creer de table `campaign_follow` hors remigration explicite.
   - [x] Migrer les usages de `campaign_crud` au lieu de continuer a le faire vivre.
     - [x] Remplacer le blocage legacy de suppression utilisateur par `entity_permission`.
       - [x] Remplacer les dependances et counts dashboard backend par `entity_permission`.
       - [x] Retirer le fallback frontend `campaign.service` vers `/campaignCrud` pour les acces campagne.
          - [x] Retirer la page/service frontend legacy `campaign-crud` devenue orpheline une fois les routes coupees.
          - [x] Supprimer la surface backend legacy `/campaignCrud` et son cluster Java associe (`controller`, `business`, `entity`, `repository`, `dto`, `transformer`).
          - [x] Retirer du catalogue source les permissions `CAMPAIGN_CRUD` encore exposees apres suppression de l'endpoint legacy.
          - [x] Ajouter une migration Flyway de retrait final pour purger les permissions globales legacy et supprimer la table `campaign_crud` de l'etat final de la BD.
          - [x] Nettoyer les ressources repo qui exposaient encore `campaignCrud` comme surface active (Postman, guide API, schema Merise, proxies front, schema Telosys).
   - [x] Preserver l'immutabilite de `campaigns.created_by`.

- [x] **Reecrire la resolution de permissions cote backend**
   - [x] Ordre de priorite : override user, permission user, permission groupe, permission role, permission role globale, permission groupe globale.
   - [x] Faire respecter dans `PermissionService` les `entity_permission` actives via `user_id`, `business_group_id` et `system_role`, en ignorant les lignes soft-delete.
   - [x] Centraliser la verification "permission entite puis globale" dans `PermissionService`, puis migrer les owners backend critiques (interviews, progression, decisions, correction manuelle, evaluations).
   - [x] Ajouter des tests unitaires solides sur ce point avant tout gros cablage front.

**Definition de fini du bloc 3 :** le systeme campagne / permissions est coherent cote backend et ne depend plus d'un melange instable entre ancien et nouveau modele.

---

## Bloc 4 -- Finir les regles metier backend encore ouvertes

**Objectif :** traiter les sujets fonctionnels deja decides dans `J` mais pas encore correctement propages.

- [x] **Pipeline mails**
   - [x] Ajouter `email_required` et `email_automatic` a `pipeline_stage` si pas encore fait.
   - [x] Implementer la logique backend d'etape automatique vs manuelle.
   - [x] Supprimer ensuite les anciens flags mail obsoletes sur `applications`.

- [x] **Chronometrage campaigns / forms**
   - [x] Appliquer les invariants backend relies a `timeAllForms` et `isTimed`.
   - [x] Verifier que le modele reel suit bien la decision J, meme si les noms ou types exacts ont bouge dans les migrations deja presentes.

- [x] **Reprise quiz et alea**
   - [x] Verifier la presence d'un champ `random_questions` la ou il doit vivre.
   - [x] Desactiver la reprise quand un alea existe, conformement a la decision prise.

- [x] **Limiter `max_apply` et consolider les statuts candidature lies a l'abandon**
   - [x] Appliquer `max_apply` cote backend.
   - [x] Consolider le statut public de candidature quand `application_abandoned = true`, sans melanger ce sujet avec l'archivage applicatif plus large.

**Definition de fini du bloc 4 :** les grosses regles metier decidees dans `J` ne restent plus seulement documentaires.

---

## Bloc 5 -- Cablage frontend apres stabilisation backend

**Objectif :** ne faire le front qu'une fois les modeles et endpoints reels stabilises.

- [x] **Aligner les modeles et services frontend sur les changements backend critiques**
   - [x] campagnes
   - [x] permissions ciblees
   - [x] mail log
   - [x] pipeline stage

- [x] **Traiter ensuite les pages metier les plus importantes**
   - [x] `campaign-form` / `campaign-detail`
   - [x] `applications` detail avec correction manuelle et candidate-ask
   - [x] `forms`
   - [x] `notifications`
   - [x] page publique `/campagnes`

- [x] **Garder les grands audits UI pour apres**
   - [x] routes orphelines
   - [x] boutons morts
   - [x] filtres
   - [x] pagination transverse

**Definition de fini du bloc 5 :** le front suit le backend stabilise, au lieu d'inventer des ecrans sur un modele encore mouvant.

---

## Ce qu'on met explicitement de cote pour l'instant

- Nettoyage large des anciens fichiers `to-do/`
- Relecture exhaustive de tous les audits `L-audit-*`
- Refonte cosmetique CSS / UI
- Audits transverses lourds non bloquants
- Pages metier secondaires qui ne debloquent pas le coeur backend

---

## Ordre de travail recommande des maintenant

1. Bloc 1
2. Bloc 2
3. Bloc 3
4. Bloc 4
5. Bloc 5

Si tu es perdue au quotidien, reviens a cette regle simple :

- **d'abord** ce qui est deja migre en BD mais pas propage dans le code
- **ensuite** ce qui peut casser la securite ou les droits
- **ensuite seulement** les pages frontend et les audits larges

---

## Premier point de depart concret

Si on reprend tout de suite, je recommande de commencer par ce sous-bloc unique :

1. `Campaigns.java`
2. `Form.java`
3. `EntityPermission.java`
4. `MailLog` cote backend

Autrement dit : on ferme le trou entre `V1_038`, `V1_039`, `V1_040` et le code Java reel avant tout le reste.