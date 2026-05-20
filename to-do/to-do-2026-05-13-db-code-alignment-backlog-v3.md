# Backlog v3 — Alignement BD ↔ Code ↔ UI (post-feedback 2026-05-12)

**Date :** 2026-05-13
**Statut :** ✅ Actif — fait suite à `to-do-2026-05-12-db-code-alignment-backlog-v2.md`.
**Source :** décisions `J.5` et `J.6` du livrable [J-decisions-et-arbitrages.md](livrables/J-decisions-et-arbitrages.md).

> Ce backlog rassemble **uniquement les items nouveaux** issus du round de feedback 2026-05-12 (réponses Q-001→Q-007 + champs manquants campagne). Les items v1 et v2 restent applicables et ne sont **pas** dupliqués ici.

---

## Légende
- **P0** : bloquant prod / sécurité / cohérence critique.
- **P1** : indispensable pour cohérence métier.
- **P2** : améliore l'expérience / robustesse.
- **P3** : confort / nettoyage.
- 🗄 = migration Flyway. ⚙ = backend. 🌐 = frontend. 🔗 = front+back. ✅ = test à ajouter.

---

## Z3-001 → Z3-020 : D-015 / Q-001 — Reprise quiz et aléa

| # | P | Item | Effort |
|---|---|---|---|
| Z3-001 | P1 | 🗄 Vérifier la présence d'un champ `random_questions` sur `form_version` (ou ajouter migration `V1_048__add_form_version_random_questions.sql` si absent). | S |
| Z3-002 | P1 | ⚙ Service `ApplicationService` : si `form.is_random` OU `form_version.random_questions` OU `campaign.form_assignment_strategy IN (RANDOM, RANDOM_NO_REPEAT)` → désactiver `quiz_level` (impossible reprise). | M |
| Z3-003 | P1 | 🌐 Page `quiz-runner` : si l'API renvoie `resumable=false`, masquer le bouton "Reprendre" + afficher message explicatif. | S |
| Z3-004 | P2 | ✅ Test e2e : créer campagne avec form aléatoire → quitter au milieu du quiz → vérifier qu'on ne peut pas reprendre. | M |
| Z3-005 | P2 | ⚙ Documenter dans `QuizSessionService` la règle de "reprise inhibée par aléa". | S |

## Z3-006 → Z3-025 : D-016 / Q-002 — Mails de pipeline

| # | P | Item | Effort |
|---|---|---|---|
| Z3-006 | P0 | 🗄 Migration `V1_037__pipeline_stage_mail_flags.sql` : ajouter `email_required` (BOOL default false) et `email_automatic` (BOOL default true) sur `pipeline_stage`. | S |
| Z3-007 | P0 | ⚙ Entity `PipelineStage` : ajouter champs + DTO + getters/setters. | S |
| Z3-008 | P0 | 🌐 Page `pipeline-template-form` : checkbox "Étape requiert un email" + checkbox "Envoi automatique du mail" (visible si requis). | M |
| Z3-009 | P1 | ⚙ Service `ApplicationProgressService` : sur franchissement d'étape → si `email_required && email_automatic` → envoi mail auto ; sinon attente clic recruteur. | L |
| Z3-010 | P1 | 🌐 Page `application-detail` : si étape courante a `email_required=true` et `email_automatic=false` → bouton "Envoyer le mail" + zone texte note custom. | M |
| Z3-011 | P1 | ⚙ Endpoint `POST /application/sendStageMail` (payload : applicationId, stageId, customNote). | M |
| Z3-012 | P1 | ✅ Test : étape email_required=true, email_automatic=false → étape suivante bloquée tant que mail non envoyé. | M |
| Z3-013 | P2 | 🗄 Migration `V1_049__drop_applications_pre_screen_final_mail_sent.sql` (DROP `pre_screen_decision_mail_sent`, `final_decision_mail_sent`) après migration vers `mail_log`. | S |
| Z3-014 | P2 | ⚙ Job de migration data : pour chaque application avec ces flags=true → insérer entrée correspondante dans `mail_log` avant DROP. | M |

## Z3-026 → Z3-050 : D-017 / Q-003 — Chronométrage campagnes/forms

| # | P | Item | Effort |
|---|---|---|---|
| Z3-026 | P0 | 🗄 Migration `V1_038__remove_campaigns_is_timed.sql` : DROP `campaigns.is_timed`. | S |
| Z3-027 | P0 | 🗄 Migration `V1_039__add_campaigns_time_all_forms.sql` : ADD `time_all_forms` BOOL default false. | S |
| Z3-028 | P0 | 🗄 Migration `V1_040__add_form_is_timed.sql` : ADD `form.is_timed` BOOL default false. | S |
| Z3-029 | P0 | ⚙ Entity `Campaign` : retirer `isTimed`, ajouter `timeAllForms`. Idem DTO. | M |
| Z3-030 | P0 | ⚙ Entity `Form` : ajouter `isTimed`. Idem DTO. | S |
| Z3-031 | P0 | ⚙ `FormService.save()` : valider invariant — si `isTimed=true` → toutes `formQuestions` des `formVersion` actives doivent avoir `durationSeconds > 0`. Rollback transactionnel sinon. | L |
| Z3-032 | P0 | ⚙ `CampaignService.save()` : valider invariant — si `timeAllForms=true` → forcer `isTimed=true` sur tous les forms liés ; chacune doit elle-même passer Z3-031 ; rollback global sinon avec message listant les fautifs. | L |
| Z3-033 | P0 | 🌐 Page `form-form` : toggle "Chronométrer ce formulaire" (lié à `isTimed`). | S |
| Z3-034 | P0 | 🌐 Page `form-form` : si toggle activé et qu'une question n'a pas de durée → erreur formulaire bloquante + surlignage des lignes fautives. | M |
| Z3-035 | P0 | 🌐 Page `campaign-form` : retirer le toggle `is_timed` actuel ; ajouter toggle "Chronométrer tous les formulaires" (lié à `timeAllForms`). | S |
| Z3-036 | P1 | 🌐 Page `campaign-form` : si toggle activé → afficher message "Cela activera la chronométrie sur tous les formulaires liés ; les questions sans durée bloqueront l'enregistrement". | S |
| Z3-037 | P1 | 🌐 Bouton "Tester ce formulaire" sur la page `form-detail` (recruteur) → ouvre `quiz-runner` en mode **test** (session éphémère, pas de persistance). | L |
| Z3-038 | P1 | 🌐 Bouton "Tester cette campagne" sur la page `campaign-detail` (recruteur) → simule le cycle complet. | L |
| Z3-039 | P1 | ⚙ Endpoint `POST /quiz/test/form` et `POST /quiz/test/campaign` : retourne payload simulé sans persister. | M |
| Z3-040 | P2 | ✅ Test : créer un form avec `isTimed=true` + question sans durée → save doit échouer avec message clair. | M |
| Z3-041 | P2 | ✅ Test : campagne `timeAllForms=true` avec 1 form non timé contenant question sans durée → erreur explicite listant le form fautif. | M |

## Z3-051 → Z3-080 : D-018 / Q-004 — Refonte `campaign_crud`

| # | P | Item | Effort |
|---|---|---|---|
| Z3-051 | P0 | ⚙ Étendre `FunctionalityEnum` : ajouter `CAMPAIGN_IS_ADMIN`, `CAMPAIGN_PLANIFY_INTERVIEW`, `CAMPAIGN_ACCEPT_PRE_SCREEN`, `CAMPAIGN_ACCEPT_FINAL`. | S |
| Z3-052 | P0 | 🗄 Migration `V1_041__create_campaign_follow.sql` : table (id, user_id FK, campaign_id FK, created_at, unique(user_id, campaign_id)). | S |
| Z3-053 | P0 | ⚙ Entity + Repository + Service + API `CampaignFollow` (CRUD basique). | M |
| Z3-054 | P0 | 🗄 Migration `V1_042__migrate_campaign_crud_to_entity_permission.sql` : pour chaque ligne `campaign_crud` → insérer N lignes dans `entity_permission` (1 par flag `can_*` à true) + 1 dans `campaign_follow` si `follow=true`. | L |
| Z3-055 | P0 | 🗄 Migration `V1_043__drop_campaign_crud.sql` : DROP `campaign_crud` après vérification Z3-054. | S |
| Z3-056 | P0 | 🗄 Migration `V1_044__campaigns_created_by_immutable_trigger.sql` : trigger MySQL `BEFORE UPDATE ON campaigns` qui rejette si `OLD.created_by <> NEW.created_by`. | M |
| Z3-057 | P0 | ⚙ Entity `Campaign` : annotation `@Column(updatable=false)` sur `createdBy` + override `@PreUpdate` qui vérifie immuabilité. | S |
| Z3-058 | P0 | ⚙ `CampaignService.update()` : préserver `createdBy` quel que soit le payload. | S |
| Z3-059 | P0 | ⚙ Supprimer entity/repository/service/API `CampaignCrud` côté backend. | M |
| Z3-060 | P0 | 🌐 Supprimer service Angular `campaign-crud.service.ts` + pages `campaign-crud-*`. | S |
| Z3-061 | P0 | 🌐 Page `campaign-detail` : nouvelle section "Permissions de la campagne" — gestion des `entity_permission` ciblées (ajout admin, planificateur, validateur pre-screen, validateur final). | L |
| Z3-062 | P1 | 🌐 Page `campaign-detail` : bouton "Suivre cette campagne" / "Ne plus suivre" (toggle `campaign_follow`). | S |
| Z3-063 | P1 | 🌐 Sidebar candidate ou dashboard : section "Campagnes suivies" alimentée par `campaign_follow`. | M |
| Z3-064 | P1 | ⚙ `PermissionService.resolve()` : intégrer évaluation `CAMPAIGN_IS_ADMIN` → équivalent à toutes les permissions du créateur sauf modification `created_by`. | L |
| Z3-065 | P2 | ✅ Test : créateur de campagne accorde `CAMPAIGN_IS_ADMIN` à un autre user → cet user peut éditer mais pas changer `created_by`. | M |
| Z3-066 | P2 | ✅ Test : tenter `PUT /campaign/{id}` avec `createdBy` modifié → 400 ou silent ignore. | S |

## Z3-081 → Z3-100 : D-019 / Q-005 — `entity_permission` ouverte aux groupes/rôles

| # | P | Item | Effort |
|---|---|---|---|
| Z3-081 | P0 | 🗄 Migration `V1_045__entity_permission_group_role.sql` : ADD `business_group_id` (FK nullable), ADD `role_id` (varchar ou FK), ALTER `user_id` NULL. CHECK ((user_id NOT NULL) + (business_group_id NOT NULL) + (role_id NOT NULL) = 1). | M |
| Z3-082 | P0 | ⚙ Entity `EntityPermission` : ajouter champs + relations. DTO miroir. | M |
| Z3-083 | P0 | ⚙ `PermissionService.resolve(userId, entity, functionality)` : réécrire avec ordre d'évaluation décrit en D-019 (user_override > user_direct > group_membership > role > role_perm_global > group_perm_global). | XL |
| Z3-084 | P0 | ✅ Tests unitaires exhaustifs `PermissionServiceTest` : matrice de cas par ordre d'évaluation. | L |
| Z3-085 | P1 | 🌐 Page `entity-permission-form` : sélecteur "Cible" radio (User / Business Group / Rôle système) + dropdown contextuel. | M |
| Z3-086 | P1 | 🌐 Page `entity-permission-list` : afficher la nature de la cible avec badge (User / Groupe / Rôle). | S |
| Z3-087 | P2 | 🌐 Page `campaign-detail` section permissions : possibilité d'accorder une permission à un groupe entier d'un clic. | M |
| Z3-088 | P2 | ✅ Test e2e : accorder `CAMPAIGN_ACCEPT_FINAL` au business_group X → tous les membres de X peuvent valider la décision finale. | M |

## Z3-101 → Z3-110 : D-020 / Q-006 — Lien Connexion voilé

| # | P | Item | Effort |
|---|---|---|---|
| Z3-101 | P3 | 🌐 Footer de la page d'accueil `/` : ajouter un texte petit "Espace interne" lié vers `/connexion`. Couleur discrète, sans icône. | S |

## Z3-111 → Z3-140 : D-021 / Q-007 — Table `mail_log`

| # | P | Item | Effort |
|---|---|---|---|
| Z3-111 | P0 | 🗄 Migration `V1_046__create_mail_log.sql` : table complète (cf. D-021 schéma). Index sur `recipient_user_id`, `object_table_name+object_table_id`, `created_at`. | M |
| Z3-112 | P0 | ⚙ Entity + Repository + Service + API `MailLog`. | M |
| Z3-113 | P0 | ⚙ `EmailService.send()` : après chaque envoi (succès ou échec), insérer une ligne `mail_log` (statut SENT/FAILED). | M |
| Z3-114 | P1 | 🌐 Page admin `/dashboard/admin/mail-log` (SUPER uniquement) : table consultable, filtres (recipient, status, période, template). | L |
| Z3-115 | P1 | 🌐 Détail mail_log : modal montrant `subject`, `body`, `error_message`. | S |
| Z3-116 | P2 | ⚙ Endpoint `POST /mailLog/getAll` paginé + filtré (POST-only convention). | M |
| Z3-117 | P2 | ⚙ Rétention : job `@Scheduled` mensuel qui purge `mail_log` > 2 ans (configurable via `app_config`). | M |
| Z3-118 | P3 | ⚙ Export CSV des logs depuis la page admin. | S |

## Z3-141 → Z3-170 : D-022, D-023, D-024 — Campaign status, archivé

| # | P | Item | Effort |
|---|---|---|---|
| Z3-141 | P0 | ⚙ Enum `CampaignStatus` (backend) : ajouter `DRAFT`. Total : `DRAFT, PENDING, OPEN, PAUSED, CLOSED`. | S |
| Z3-142 | P0 | 🗄 Vérifier `campaigns.campaign_status` `varchar(7)` peut contenir "PENDING" (7 char OK) — sinon ALTER `varchar(10)` via `V1_050__campaigns_status_varchar10.sql`. | S |
| Z3-143 | P0 | 🌐 Frontend `CampaignStatus` (TS) : enum miroir + badges/couleurs distincts par statut. | S |
| Z3-144 | P0 | ⚙ `CampaignService.updateStatus(campaignId, newStatus)` : matrice transitions autorisées (cf. D-024). Rejet 400 si transition interdite. | M |
| Z3-145 | P0 | ⚙ `CampaignService.publish(campaignId)` : transition `DRAFT → PENDING/OPEN` (selon `campaign_start`). Pré-conditions : `speciality_id` rempli, ≥1 form, `pipeline_template_id` rempli, dates cohérentes. | M |
| Z3-146 | P0 | ⚙ Job `@Scheduled` quotidien : transitions auto `PENDING → OPEN` (date atteinte), `OPEN → CLOSED` (date fin OU `max_apply` atteint). | M |
| Z3-147 | P0 | 🌐 Page `campaign-form` (création) : nouveau bouton "Enregistrer en brouillon" → status = `DRAFT`. Bouton "Publier" → trigger transition. | M |
| Z3-148 | P0 | 🌐 Page `campaign-detail` : selon statut, afficher actions disponibles (Publier, Pauser, Reprendre, Fermer, Archiver, Désarchiver). | M |
| Z3-149 | P0 | 🌐 Page `campaign-list` : filtre par statut (chips multi-sélection) + filtre "Inclure archivées". | M |
| Z3-150 | P0 | 🗄 Migration `V1_047__add_campaigns_is_archived.sql` : ADD `is_archived` BOOL default false. Index conditionnel pour requêtes "non archivées". | S |
| Z3-151 | P0 | ⚙ Entity `Campaign` : ajouter `isArchived`. DTO miroir. | S |
| Z3-152 | P0 | ⚙ `CampaignService.archive(id)` et `unarchive(id)` : pré-condition `status = CLOSED` pour archiver. | S |
| Z3-153 | P0 | 🌐 Boutons "Archiver" / "Désarchiver" sur `campaign-detail`. | S |
| Z3-154 | P0 | ⚙ `CampaignRepository.findAllForListing()` : filtrer `is_archived = false` par défaut. Variante `findAllIncludingArchived()`. | S |
| Z3-155 | P0 | 🌐 Page publique `/campagnes` : ne montrer **que** statuts `PENDING` et `OPEN`, JAMAIS les archivées. | S |
| Z3-156 | P1 | ✅ Tests transitions de statut : matrice complète (15 transitions valides + 10 invalides). | L |
| Z3-157 | P1 | ✅ Test : campagne archivée invisible dans listing par défaut. | S |
| Z3-158 | P1 | ✅ Test : tentative archive d'une campagne OPEN → 400 Bad Request. | S |

## Z3-171 → Z3-180 : Préparation audit table par table (livrable L)

| # | P | Item | Effort |
|---|---|---|---|
| Z3-171 | P0 | 📋 Valider le plan d'audit (livrable L) avec l'utilisateur. | S |
| Z3-172 | P0 | 📋 Auditer en pilote la table `departments` (niveau 0) pour valider le gabarit. | M |
| Z3-173 | P1 | 📋 Auditer les 7 tables restantes du niveau 0. | L |
| Z3-174 | P1 | 📋 Auditer les 10 tables du niveau 1. | XL |
| Z3-175 | P1 | 📋 Auditer la table `campaigns` (niveau 2 — cas pédagogique du prompt). | L |
| Z3-176 | P2 | 📋 Auditer les tables des niveaux 2 à 6 + nouvelles tables. | XXL |
| Z3-177 | P2 | 📋 Consolider toutes les tâches `L<table>-<n>` dans le backlog v4 à venir. | M |

---

## Synthèse v3

- **Items P0** : ~50 (migrations + refontes structurelles + statut campagne).
- **Items P1** : ~30 (UX critique + tests).
- **Items P2** : ~25 (tests complémentaires + UX raffinée).
- **Items P3** : ~5 (cosmétique).
- **Total** : ~110 items v3 — à ajouter aux ~155 items v1+v2 = ~265 items globaux.

### Migrations Flyway à créer (par ordre)
1. `V1_037__pipeline_stage_mail_flags.sql`
2. `V1_038__remove_campaigns_is_timed.sql`
3. `V1_039__add_campaigns_time_all_forms.sql`
4. `V1_040__add_form_is_timed.sql`
5. `V1_041__create_campaign_follow.sql`
6. `V1_042__migrate_campaign_crud_to_entity_permission.sql`
7. `V1_043__drop_campaign_crud.sql`
8. `V1_044__campaigns_created_by_immutable_trigger.sql`
9. `V1_045__entity_permission_group_role.sql`
10. `V1_046__create_mail_log.sql`
11. `V1_047__add_campaigns_is_archived.sql`
12. `V1_048__add_form_version_random_questions.sql` (si nécessaire)
13. `V1_049__drop_applications_pre_screen_final_mail_sent.sql`
14. `V1_050__campaigns_status_varchar10.sql` (si nécessaire)

⚠️ **Ordre d'exécution important** — migrations data (`V1_042`) doivent se faire AVANT les `DROP` (`V1_043`, `V1_049`).

### Risques principaux
1. **Refonte `campaign_crud` → `entity_permission`** : risque de perte de permissions si la migration data est mal écrite. ⇒ **test exhaustif sur copie de prod** avant DROP.
2. **Trigger immuable `created_by`** : risque de casser des admins existants qui modifient des données via SQL direct. ⇒ communiquer + script de migration data avant trigger.
3. **Job auto `PENDING → OPEN` / `OPEN → CLOSED`** : risque de mauvaise gestion timezone. ⇒ tout en UTC + tests.
4. **`PermissionService.resolve()` réécrit** : risque de faille d'autorisation. ⇒ matrice tests exhaustive obligatoire avant déploiement.
