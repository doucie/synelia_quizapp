# Livrable J — Décisions, arbitrages et questions ouvertes (feedback 2026-05-12)

**Date :** 2026-05-12
**Statut :** ✅ Consolidé à partir du feedback utilisateur sur les livrables A→Z

> Ce fichier synthétise les **clarifications utilisateur**, les **décisions prises**, et les **questions ouvertes** qui doivent être tranchées avant exécution.

---

## J.1 — Clarifications factuelles (confirmation utilisateur)

| Sujet | Statut | Note |
|---|---|---|
| `V1_034` Flyway manquante | ✅ **Suppression involontaire** | Toujours **enregistrée en base** dans `flyway_schema_history` ; donc pas de problème de checksum. Aucune action requise sauf création d'un placeholder si on veut rétablir le fichier. |
| `applications.search_string` | ✅ **Utilisée pour recherche full-text** | Doit être **régénérée à chaque update** (remplacée, pas ajoutée). Concaténation virgules. Type **TEXT** obligatoire + gestion overflow à prévoir. |
| `applications.quiz_level` | ✅ **Reprise du quiz à la question N** | Logique conditionnelle selon stratégie d'attribution form + ordre questions (cf. J.3). |
| `application_abandoned` | ✅ **Action manuelle + automatique** | UI bouton abandon sur page suivi + auto-abandon si étape pipeline trop ancienne. Ajouter aussi un `is_archived`. |
| `pre_screen_decision_mail_sent` / `final_decision_mail_sent` | ⚠️ **OBSOLÈTE** | À remplacer par mécanisme générique sur `pipeline_stage` (cf. J.3). |
| `interview_participant.is_online` / `last_ping_at` | ✅ Utilisé pour **chat en direct** pendant l'entretien. |
| `notifications.object_table_name` / `object_table_id` | ✅ Polymorphisme volontaire — clic notif → page entité. |
| `question.question_ref` | ✅ **UUID de lignée de version** | Cf. [to-do-2026-03-27.md](../to-do-2026-03-27.md) PARTIE B — quand on modifie une question dans un formulaire locké, on duplique avec même `question_ref`. |
| `user.admin_mode` | ✅ Utilisé par `sidebar-admin-toggle` sur quasi toutes les pages dashboard. |
| `user.page_size_preference` | ✅ Pris en compte sur les pages `/dashboard/entities/*`. |
| `app_config.color_scheme` vs `primary_color` | ✅ **Complémentaires** | Multi-tenant theming : `color_scheme` = nom du thème, `primary_color` = code hex. Différentes entreprises = différents thèmes. |
| `interview_participant.is_online` | ✅ chat direct |
| Noms BD au pluriel (`decisions`, `interviews`, `applications`) | ✅ **Volonté assumée** | Le pluriel est la convention voulue. Priorité basse, pas une action obligatoire. |
| `/qeel/*` controller | ⚠️ **À vérifier** | Créé pour `qeel-container` du dashboard. Si plus utilisé → supprimer. Sinon conserver. |
| `MinioConfig` vs `uploads/cv/` local | ⚠️ **Choisir un seul** | Garder le meilleur et supprimer l'autre. |
| `candidate_accounts_enabled` | ✅ **Feature prévue, pas encore implémentée** | Activable par admin ; améliore suivi candidat + abonnement aux nouvelles campagnes. |

---

## J.2 — Décisions prises

### D-001 — `CampaignStatus` ajout `DRAFT`
- ✅ **Décision** : ajouter la valeur **`DRAFT`** à `CampaignStatus`.
- Pas d'attribut séparé "brouillon" — c'est un statut explicite.
- Valeurs finales proposées : `DRAFT`, `ACTIVE`, `PENDING`, `CLOSED`.

### D-002 — Page `form-versions` métier
- ✅ **Pas de page dédiée** : `form-versions` est un concept back-office.
- ✅ **À intégrer dans la page `forms`** (recruteur) : onglet "Historique des versions" + bouton **restaurer une ancienne version**.

### D-003 — Page `legal-texts` métier
- ✅ **Déjà géré dans `/dashboard/settings`** — pas de page dédiée.
- ⚠️ Audit à faire : vérifier que ça fonctionne réellement.

### D-004 — Page `source-tokens` métier
- ✅ **Créés directement lors de la création de campagne** — pas de page dédiée.
- ⚠️ Audit à faire : vérifier que la création + visualisation pendant `campaign-form` couvre bien le besoin.

### D-005 — Page `group-change-requests`
- ✅ **Accessible depuis `/dashboard/business-groups`** :
  - Liste des groupes → clic sur un groupe → vue détail.
  - Vue détail = membres + admins du groupe.
  - Pour les **admins du groupe** : onglet "Demandes d'adhésion" (PENDING / APPROVED / REJECTED).

### D-006 — Page `manual-correction`
- ✅ **Accessible depuis `/dashboard/applications`** (page candidats) :
  - Clic sur un candidat → détails candidature.
  - Onglet "Corriger les réponses" (visible si correction nécessaire ET utilisateur autorisé).

### D-007 — Page `email-template-presets`
- ✅ **Coupler avec page emails** : créer pages métier dédiées (à la fois pour templates ET presets).
- Les pages CRUD existent déjà, ce qui manque c'est la version métier (mise en avant catégories, prévisualisation).

### D-008 — Page candidats "Campagnes en cours / à venir / récentes"
- ✅ **Nouvelle page candidat publique** : `/campagnes` (ou nom à définir).
- Filtres : en cours, démarrent bientôt, récemment terminées.
- Lien direct vers candidature si campagne active.

### D-009 — Admin / Recruteur : `smtp_config` + `app_config`
- ✅ **Lecture seule** pour ADMIN/RECRUITER.
- Seul SUPER peut modifier ces tables.

### D-010 — Validation email post-inscription via invitation_code
- ✅ Même si on s'inscrit via code d'invitation, **validation email obligatoire** avant utilisation.

### D-011 — Durée expiration invitation_code
- ✅ **Modifiable via `app_config`** — ajouter un champ `invitation_code_expiration_days` (ou similaire).

### D-012 — Notifications : auto vs manuel pour les emails de pipeline
- ⚠️ **Question ouverte** — cf. J.3 Q-002.

### D-013 — Validation backend stricte des enums
- ✅ **Tous les endpoints qui acceptent un champ enum doivent rejeter les valeurs hors enum** (return 400 Bad Request).
- À implémenter via `@Valid` + `@Pattern` ou via converters Jackson stricts.

### D-014 — Page Merise : API dynamique
- ✅ **Doit avoir une API + algo d'organisation d'affichage fiable** côté backend, **pas hardcodé**.
- API à créer : `/merise/getSchema` retourne tables + relations + positions calculées.

---

## J.3 — Questions ouvertes à trancher

### Q-001 — Stratégie de reprise du quiz (`quiz_level`)
**Contexte** : si stratégie d'attribution form = `RANDOM` ou `RANDOM_NO_REPEAT`, ou si questions à l'intérieur d'un formulaire sont aléatoires, la reprise pose problème.

**Options** :
- **A** : reprise désactivée dès qu'il y a UN aléa (form ou questions) — simple et safe.
- **B** : reprise toujours possible : on enregistre la séquence générée à la 1re ouverture et on la rejoue.
- **C** : reprise possible si form fixé mais questions aléa désactivée.

**🟡 À TRANCHER** par l'utilisateur.

> ➕ **Action liée** : ajouter `campaigns.random_questions` (boolean) et `form_version.random_questions` si pas déjà présents → audit nécessaire.

### Q-002 — Stratégie d'envoi des mails de pipeline
**Contexte** : remplacer `pre_screen_decision_mail_sent` / `final_decision_mail_sent` (obsolètes).

**Options** :
- **A — Simple** : auto pour toutes les étapes nécessitant un email. Pas de flag.
- **B — Hybride** : ajouter sur `pipeline_stage` les attributs :
  - `email_required` (boolean)
  - `email_automatic` (boolean) — *si false : recruteur doit cliquer pour envoyer + ajouter note custom avant signature*.
  - Tracking `mail_sent` à mettre sur `application_progress` (par étape franchie) ou sur entité métier (`interview.invite_mail_sent`, `decision.notif_mail_sent`).

**🟡 À TRANCHER** : option A (simple) ou B (hybride flexible) ?
**Recommandation** : **B**, mais B est plus de travail. À court terme, A est viable.

### Q-003 — Chronométrage des campagnes
**Contexte** : `campaigns.is_timed` — pas clair comment c'est appliqué.

**Options** :
- **A** : chrono campagne global (durée totale)
- **B** : chrono par formulaire (chaque form a son temps)
- **C** : chrono par question (somme des `duration_seconds` des questions)
- **D** : champ `is_timed` par formulaire et non par campagne (override)

**🟡 À TRANCHER**. Doit aussi être reflété UI à création/modification campagne.

### Q-004 — `campaign_crud` vs `entity_permission`
**Contexte** : `campaign_crud.follow` / `is_admin` / `is_creator` / `can_planify` / `can_accept_pre_screen` / `can_accept_final` — `entity_permission` peut-il les remplacer ?

**Analyse** :
- `entity_permission` couvre **permissions par entité × user**.
- `campaign_crud` ajoute **rôles métier spécifiques campagne** (admin, créateur, peut planifier entretiens, peut accepter pre-screen, peut accepter final).
- Possible refonte : tout pousser dans `entity_permission` avec `FunctionalityEnum` étendu (`CAMPAIGN_PLANIFY_INTERVIEW`, `CAMPAIGN_ACCEPT_PRE_SCREEN`, `CAMPAIGN_ACCEPT_FINAL`).

**🟡 À TRANCHER** : refonte ou cohabitation ?
**Recommandation** : refonte progressive — `is_admin`/`is_creator` peuvent être déduits de `created_by` + entity_permission. `can_*` deviennent des `FunctionalityEnum`. `follow` reste (notion subjective utilisateur).

### Q-005 — `entity_permission` + `business_group_id` / `role_id`
**Contexte** : actuellement `entity_permission` n'a pas `business_group_id` ni `role_id`. Pour partager une campagne avec tout un groupe d'un coup, on doit créer N enregistrements.

**Proposition utilisateur** : ajouter `business_group_id` et `role_id` (nullable) sur `entity_permission`. Si un de ces champs est rempli, la permission s'applique à tous les membres du groupe / tous les users du rôle.

**Analyse** :
- ✅ Avantage : 1 enregistrement au lieu de N.
- ⚠️ Inconvénient : logique d'évaluation plus complexe (4 sources : user direct, group, role, override).
- ⚠️ Compatibilité : `business_group_permission` joue déjà un rôle similaire au niveau global, ici ce serait au niveau row-level.

**🟡 À TRANCHER** : adopter la proposition ?
**Recommandation** : **OUI**, mais en gardant `user_id` nullable et ordre d'évaluation explicite (user > override > role > group). À documenter clairement.

### Q-006 — Lien "Connexion" voilé sur la page d'accueil `/`
**Contexte** : `/connexion` existe mais pas de lien depuis `/` (volontaire, pour cacher l'interface interne).

**Options** :
- **A** : laisser tel quel (accès via URL directe).
- **B** : lien voilé dans footer (texte petit "Espace interne").
- **C** : icône discrète en coin (engrenage / clé).
- **D** : raccourci clavier ou clic 5× sur le logo.

**🟡 À TRANCHER** par l'utilisateur.

### Q-007 — `pipeline_stage.mail_sent` localisation
**Contexte** : où tracer le mail envoyé ?

**Options** :
- **A** : sur `application_progress.mail_sent` (générique, par franchissement d'étape).
- **B** : par entité métier (`interview.invite_mail_sent`, `decision.notif_mail_sent`, etc.).
- **C** : table dédiée `mail_log` (audit complet : à qui, quand, template, contenu).

**🟡 À TRANCHER** — lié à Q-002.
**Recommandation** : **C** (mail_log) pour audit RGPD + debug, complémentaire de flags A.

---

## J.4 — Items annulés / dégradés en priorité

| Item Z d'origine | Action |
|---|---|
| Z-031 — Page form-versions | ❌ **Annulé** — intégré dans Z-030 forms (D-002) |
| Z-033 — Page source-tokens | ❌ **Annulé** — géré dans campaign-form (D-004) |
| Z-039 — Page legal-texts métier | ❌ **Annulé** — géré dans settings (D-003) |
| Z-161 — Harmoniser noms entités pluriel | 🔽 **Priorité réduite P3 → P4 (low)** — convention assumée (J.1) |
| Z-038 — Page email-template-presets | 🔄 **Reformulé** — coupler avec page emails métier (D-007) |
| Z-037 — Page group-change-requests | 🔄 **Reformulé** — sous-page de business-groups (D-005) |
| Z-034 — Page manual-correction | 🔄 **Reformulé** — onglet dans page applications (D-006) |

---

## J.5 — Décisions issues du feedback 2026-05-12 (réponses Q-001→Q-007)

> Les questions Q-001 à Q-007 de la section J.3 sont désormais **tranchées**. Conservées ci-dessus pour traçabilité ; les décisions effectives suivent.

### D-015 — Reprise du quiz (réponse Q-001 = Option A)
- ✅ **Reprise désactivée dès qu'il y a UN aléa** (form_assignment_strategy = `RANDOM` / `RANDOM_NO_REPEAT`, ou `random_questions` à `true` sur form_version).
- Implémentation : si aléa actif → `quiz_level` non incrémenté entre sessions, ou abandon forcé si le candidat ferme la fenêtre.
- ➕ **Action liée** : audit présence champ `random_questions` (sur `form_version` ou `campaigns`) — à créer si absent.

### D-016 — Mails de pipeline (réponse Q-002 = Option B hybride)
- ✅ **Sur `pipeline_stage`** : ajouter
  - `email_required` (boolean, default false)
  - `email_automatic` (boolean, default true) — si `false`, le recruteur doit cliquer "Envoyer le mail" avant de valider l'étape suivante + ajouter une note custom avant signature.
- ✅ **Tracking** : voir D-021 (option C = table `mail_log` dédiée).
- ➕ Migration Flyway requise : `V1_037__pipeline_stage_mail_flags.sql`.
- ➕ Supprimer définitivement `applications.pre_screen_decision_mail_sent` et `applications.final_decision_mail_sent` après migration de données vers `mail_log`.

### D-017 — Chronométrage des campagnes (réponse Q-003 = Option C raffinée)
- ✅ **`campaigns.is_timed` SUPPRIMÉ** (champ retiré).
- ✅ **Ajouter `campaigns.time_all_forms`** (boolean, default `false`).
- ✅ **Ajouter `form.is_timed`** (boolean, default `false`). _Note : ce champ est sur `form` racine et hérite à toutes les `form_version`._
- **Invariants** :
  - Si `form.is_timed = true` → **toutes** les `form_questions` de toutes les `form_version` actives de ce form doivent avoir `duration_seconds NOT NULL AND > 0`. Validation côté backend lors d'un `INSERT/UPDATE` sur `form` ou `form_questions`.
  - Si `form.is_timed = false` → les `duration_seconds` éventuels sont **ignorés à l'exécution** (mais conservés en BD pour bascule future).
  - Si `campaigns.time_all_forms = true` → **toutes les `form` rattachées à la campagne doivent avoir `is_timed = true`**. Mise à jour de `campaigns.time_all_forms` à `true` ⇒ tentative de bascule forcée de `form.is_timed = true` pour chaque form lié ⇒ si la validation invariant échoue sur un form, **rollback transactionnel + message d'erreur listant les forms/questions fautives**.
- **UI** :
  - Page `form-form` : toggle "Chronométrer ce formulaire". Si activé et qu'une question n'a pas de durée → erreur bloquante.
  - Page `campaign-form` : toggle "Chronométrer tous les formulaires de cette campagne". Si activé → re-validation côté serveur sur tous les forms liés.
  - **Mode test** (recruteur) : bouton "Tester ce formulaire / cette campagne" sur les pages forms et campaigns → ouvre une simulation en session éphémère (pas de candidature persistée).
- ➕ Migrations Flyway :
  - `V1_038__remove_campaigns_is_timed.sql` (drop `campaigns.is_timed`)
  - `V1_039__add_campaigns_time_all_forms.sql`
  - `V1_040__add_form_is_timed.sql`

### D-018 — `campaign_crud` REFONTE complète (réponse Q-004)
- ✅ **`campaign_crud` est supprimée**. Toutes ses sémantiques migrent.
- **`is_creator`** → déduit de `campaigns.created_by` ⇒ **`created_by` devient immuable** (rejet de tout `UPDATE` qui modifie `created_by` : trigger BD + garde backend `@PreUpdate` JPA + revue API).
- **`is_admin`** → migre dans `entity_permission` via une **nouvelle FunctionalityEnum `CAMPAIGN_IS_ADMIN`** ; le créateur dispose automatiquement de cette permission, et **il peut accorder `CAMPAIGN_IS_ADMIN` à d'autres users** (qui obtiennent alors les mêmes droits de base que lui sur la campagne, sauf modification de `created_by`).
- **`can_planify`** → `FunctionalityEnum.CAMPAIGN_PLANIFY_INTERVIEW`.
- **`can_accept_pre_screen`** → `FunctionalityEnum.CAMPAIGN_ACCEPT_PRE_SCREEN`.
- **`can_accept_final`** → `FunctionalityEnum.CAMPAIGN_ACCEPT_FINAL`.
- **`follow`** → migrer vers une table dédiée `campaign_follow` (user_id, campaign_id, created_at) — notion subjective utilisateur, n'est pas une permission.
- ➕ Migrations Flyway :
  - `V1_041__create_campaign_follow.sql`
  - `V1_042__migrate_campaign_crud_to_entity_permission.sql` (DML de migration)
  - `V1_043__drop_campaign_crud.sql`
  - `V1_044__campaigns_created_by_immutable_trigger.sql`
- ➕ Évolution FunctionalityEnum (backend + front en miroir).

### D-019 — `entity_permission` + groupe + rôle (réponse Q-005 = OUI)
- ✅ Ajouter sur `entity_permission` :
  - `business_group_id` (nullable, FK → `business_group.id`)
  - `role_id` (nullable, FK → `system_role.id` _si table existe sinon enum string_)
  - `user_id` devient explicitement **nullable**.
- **Règle d'application** : la permission cible
  - un user précis (si `user_id` non null)
  - **OU** tous les membres d'un business_group (si `business_group_id` non null et `user_id` null)
  - **OU** tous les users d'un rôle (si `role_id` non null et autres null)
- **Ordre d'évaluation des permissions** (du plus prioritaire au moins) :
  1. `user_permission_override` (override individuel — peut interdire explicitement)
  2. `entity_permission` avec `user_id` rempli
  3. `entity_permission` avec `business_group_id` rempli (membre du groupe)
  4. `entity_permission` avec `role_id` rempli (porteur du rôle)
  5. `system_role_permission` (rôle global)
  6. `business_group_permission` (groupe global)
- **Contrainte BD** : `CHECK ((user_id IS NOT NULL) + (business_group_id IS NOT NULL) + (role_id IS NOT NULL) = 1)` — exactement une cible par ligne.
- ➕ Migration Flyway : `V1_045__entity_permission_group_role.sql`.
- ➕ Algorithme de résolution permission à implémenter / réécrire côté backend (`PermissionService.resolve(userId, entity, functionality)`).

### D-020 — Lien "Connexion" voilé sur `/` (réponse Q-006 = Option B)
- ✅ **Lien voilé dans le footer** : texte petit "Espace interne" en bas de page d'accueil `/`.
- Pas d'icône ostentatoire, pas de raccourci clavier.
- Cible : `/connexion`.

### D-021 — Localisation `mail_sent` (réponse Q-007 = Option C)
- ✅ **Table dédiée `mail_log`** créée pour audit complet RGPD + debug.
- Schéma proposé :
  - `id` PK
  - `created_at`
  - `recipient_email` (chaîne, pas FK — peut être un email externe non user)
  - `recipient_user_id` (nullable, FK → user)
  - `template_id` (nullable, FK → email_template) — null si template ad-hoc
  - `subject` (text)
  - `body` (mediumtext) — corps réellement envoyé, pour traçabilité
  - `object_table_name` + `object_table_id` (polymorphisme — comme `notifications`)
  - `status` (varchar : `SENT`, `FAILED`, `BOUNCED`, `RETRY`)
  - `error_message` (text nullable)
  - `sent_by_user_id` (nullable, FK → user — null si auto-système)
- ➕ Migration : `V1_046__create_mail_log.sql`.
- ➕ Tous les services qui envoient un mail doivent **logger dans `mail_log`** en complément (ou à la place) des flags actuels.
- ➕ Page admin `/dashboard/admin/mail-log` : table consultable par SUPER pour audit.

---

## J.6 — Champs nouveaux dérivés (campagne)

Issus de la section "POSSIBLES CHAMPS MANQUANTS" du prompt review2 :

### D-022 — Champ `is_published` sur `campaigns` ?
- ✅ **Décision : PAS de champ séparé**. Utilisation du **statut `DRAFT`** (D-001) pour matérialiser le "non publié".
- Règles :
  - `DRAFT` = non publié. Aucune transition automatique possible vers `PENDING`/`OPEN`/`PAUSED`/`CLOSED` même si `campaign_start` arrive.
  - Transition `DRAFT → PENDING` (ou `OPEN` si `campaign_start` déjà passé) **uniquement par action explicite utilisateur** ("Publier la campagne").
  - Validation publication : `speciality_id` rempli, au moins 1 `form` rattaché, `pipeline_template_id` rempli, dates cohérentes (`campaign_start < campaign_end` si renseignés).

### D-023 — Champ `is_archived` sur `campaigns`
- ✅ Ajouter **`campaigns.is_archived`** (boolean, default `false`).
- Une campagne **archivée** :
  - N'apparaît plus dans `/dashboard/campaigns` (sauf filtre "Inclure archivées").
  - N'apparaît plus dans `/campagnes` public.
  - N'est pas supprimée (soft delete reste séparé via `is_deleted`).
- Bouton "Archiver" disponible uniquement sur campagnes `CLOSED`.
- Bouton "Désarchiver" disponible sur campagnes archivées.
- ➕ Migration : `V1_047__add_campaigns_is_archived.sql`.

### D-024 — Statuts `CampaignStatus` finaux
- Mise à jour de D-001 : valeurs finales = **`DRAFT`, `PENDING`, `OPEN`, `PAUSED`, `CLOSED`**.
- Transitions autorisées :
  - `DRAFT → PENDING` (publication, si `campaign_start` futur)
  - `DRAFT → OPEN` (publication, si `campaign_start` <= now())
  - `PENDING → OPEN` (auto quand `campaign_start` atteinte ; ou manuel)
  - `OPEN → PAUSED` (manuel)
  - `PAUSED → OPEN` (manuel)
  - `OPEN → CLOSED` (auto si `campaign_end` atteinte OU `max_apply` atteint ; ou manuel)
  - `PAUSED → CLOSED` (manuel ou auto fin de date)
  - `CLOSED → (rien)` — terminal. Peut être archivée (`is_archived = true`) mais pas réouverte.
- **Côté code** :
  - **Backend** : enum `CampaignStatus` à étendre, transitions vérifiées dans `CampaignService.updateStatus()`. Job Spring `@Scheduled` quotidien pour transitions auto (`PENDING→OPEN`, `OPEN→CLOSED` sur date).
  - **Frontend** : enum miroir + badges colorés différenciés + boutons d'action conditionnels (cf. matrice K-005).

