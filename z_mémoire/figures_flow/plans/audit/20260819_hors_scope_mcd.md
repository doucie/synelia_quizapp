# Entités et attributs hors-scope du MCD — recensement complet

> Date initiale : 2026-08-19 · **Mis à jour : 2026-09-24 (recensement exhaustif)**
> Contexte : modélisation Merise du projet QuizApp
> Source des tables : `bd_documentee/exemples/index.html` (mini-BD fictive `data.js`, 48 tables / 9 familles, fidèle au snapshot 20260810)

---

## Méthode

Pour **chaque table** BD, on cherche une **table correspondante** (≈ même attributs et même relation conceptuelle, en français) dans les **figures actives** MCD/MLD de `src/diagrams/nouveau/` (5 domaines : Utilisateurs & droits, Campagnes & pipeline, Candidatures & suivi, Entretiens & évaluation, Structure & configuration).

- Si une entité équivalente existe → la table est **écartée** (couverture).
- Sinon → la table est **recensée** (hors-scope).

**Convention** : les colonnes techniques de traçage (`created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string`) sont ignorées systématiquement — détail d'implémentation, jamais modélisé en Merise.

**Bilan** : 48 tables → **32 écartées**, **16 recensées** (dont 4 déjà documentées le 2026-08-19 et 12 nouvelles). Entités conservées : **~80 colonnes métier absentes** des figures.

---

## 1. Tables écartées (présentes dans une figure active)

| Table BD | Entité FR (figure active) | Domaine |
|---|---|---|
| `pipeline_template` | `MODELE_PIPELINE` | Campagnes & pipeline |
| `pipeline_stage` | `ETAPE_PIPELINE` | Campagnes & pipeline |
| `pipeline_stage_notification_rule` | `REGLE_NOTIFICATION` | Campagnes & pipeline |
| `campaigns` | `CAMPAGNE` | Campagnes & pipeline |
| `campaign_form` | `PROPOSER` (jonction) | Campagnes & pipeline |
| `form` | `FORMULAIRE` | Campagnes & pipeline |
| `form_version` | `VERSION_FORMULAIRE` | Campagnes & pipeline |
| `form_questions` | `REGROUPER` (jonction) | Campagnes & pipeline |
| `question` | `QUESTION` | Campagnes & pipeline |
| `answer` | `REPONSE` | Campagnes & pipeline |
| `specialities` | `SPECIALITE` | Structure & configuration |
| `departments` | `DEPARTEMENT` | Structure & configuration |
| `email_template` | `MODELE_EMAIL` | Structure & configuration |
| `app_config` | `CONFIGURATION` | Structure & configuration |
| `applications` | `CANDIDATURE` | Candidatures & suivi |
| `application_progress` | `AVANCEMENT` | Candidatures & suivi |
| `source_token` | `TOKEN_SOURCE` | Candidatures & suivi |
| `email_verification_tokens` | `TOKEN_VERIFICATION_EMAIL` | Candidatures & suivi |
| `interviews` | `ENTRETIEN` | Entretiens & évaluation |
| `candidate_interview` | `CONVOCATION` | Entretiens & évaluation |
| `interview_participant` | `EVALUATEUR_ENTRETIEN` | Entretiens & évaluation |
| `evaluations` | `EVALUATION` | Entretiens & évaluation |
| `evaluation_item` | `NOTE_CRITERE` | Entretiens & évaluation |
| `evaluation_grid_template` | `GRILLE_MODELE` | Entretiens & évaluation |
| `evaluation_grid_template_version` | `VERSION_GRILLE` | Entretiens & évaluation |
| `evaluation_grid_template_item` | `CRITERE` | Entretiens & évaluation |
| `decisions` | `DECISION` | Candidatures & suivi |
| `user` | `UTILISATEUR` | Utilisateurs & droits |
| `business_group` | `GROUPE_METIER` | Utilisateurs & droits |
| `business_group_permission` | `PERMISSION_GROUPE` (via `BENEFICIER`) | Utilisateurs & droits |
| `user_business_group` | `APPARTENIR` (jonction) | Utilisateurs & droits |
| `notifications` | `NOTIFICATION` | Utilisateurs & droits |

---

## 2. Tables recensées (hors-scope du MCD)

### 2.1 Parties déjà recensées le 2026-08-19 (noms de tables corrigés)

#### 1. EVENEMENT_AUDIT

| Attribut | Valeur |
|----------|--------|
| **Table BD** | `audit_event` (ex-doc : `audit_events`) |
| **Domaine MCD** | Utilisateurs & droits |
| **Raison d'exclusion** | Détail d'implémentation, pas un concept métier |
| **Problème technique** | Attributs `entity_type` + `entity_id` = association polymorphique (polymorphic association) |
| **Règle Merise violée** | R8 — cohérence : une entité doit avoir des associations stables vers des entités concrètes |

**Justification détaillée :**

La table `audit_event` enregistre les actions de traçabilité (créations, modifications, suppressions) sur n'importe quelle entité du système. Le champ `entity_type` stocke le nom de la table et `entity_id` l'identifiant de l'enregistrement concerné.

En Merise, cette approche est problématique car :
- `entity_id` n'est pas une clé étrangère vers une entité unique — c'est une référence polymorphique
- L'association n'est pas stable : elle peut pointer vers n'importe quelle entité du MCD
- Les examinateurs refusent ce type de modélisation car il ne respecte pas les règles d'identification

**Traitement retenu :** L'audit est assuré par des triggers MySQL ou un mécanisme d'audit applicatif. Il sera documenté dans le mémoire au §implémentation, pas au §conception MCD.

#### 2. PERMISSION_ENTITE

| Attribut | Valeur |
|----------|--------|
| **Table BD** | `entity_permission` (ex-doc : `entity_permissions`) |
| **Domaine MCD** | Utilisateurs & droits |
| **Raison d'exclusion** | Attribut `entity_id` = clé polymorphique |
| **Problème technique** | `entity_type` + `entity_id` référencent dynamiquement n'importe quelle table |
| **Règle Merise violée** | R8 — cohérence globale |

**Justification détaillée :**

La table `entity_permission` stocke des permissions au niveau individuel d'une entité spécifique (ex : permission sur une candidature précise). Le champ `entity_id` fait référence à l'identifiant de l'entité cible, mais sans FK formelle.

Cette table fait doublon avec `PERMISSION_GROUPE` (permissions de groupe) qui sont de simples attributs fonctionnels.

**Traitement retenu :** Supprimée du MCD. Les permissions sont modélisées via `PERMISSION_GROUPE` (et le rôle système porté par UTILISATEUR).

#### 3. PERMISSION_UTILISATEUR

| Attribut | Valeur |
|----------|--------|
| **Table BD** | `user_permission_override` (ex-doc : `user_permissions`) |
| **Domaine MCD** | Utilisateurs & droits |
| **Raison d'exclusion** | Permissions individuelles = détail d'implémentation |
| **Problème technique** | `is_allowed` est un attribut d'association, pas d'entité |
| **Règle Merise** | Le MCD modélise les permissions au niveau groupe (`PERMISSION_GROUPE`) |

**Justification détaillée :**

La table `user_permission_override` stocke les permissions individuelles par utilisateur (exceptions allouées/bloquées). En Merise, les permissions sont portées au niveau conceptuel par `PERMISSION_GROUPE` (lié à GROUPE_METIER via l'association `beneficier`). Les permissions individuelles sont un détail d'implémentation qui sera géré au niveau applicatif (override des permissions groupe, ou permissions spécifiques stockées en BDD).

**Traitement retenu :** Supprimée du MCD. Les permissions individuelles sont documentées dans le mémoire au §implémentation.

#### 4. DEMANDE_CHANGEMENT_GROUPE

| Attribut | Valeur |
|----------|--------|
| **Table BD** | `group_change_request` (ex-doc : `group_change_requests`) |
| **Domaine MCD** | Utilisateurs & droits |
| **Raison d'exclusion** | Workflow d'approbation = détail d'implémentation |

**Justification détaillée :**

La table `group_change_request` enregistre les demandes de changement de groupe métier (workflow d'approbation admin). C'est un processus opérationnel (requête + validation) qui n'a pas de contrepartie conceptuelle forte en Merise. L'entité `GROUPE_METIER` et l'association `appartenir` modélisent la relation conceptuelle utilisateur ↔ groupe. Le workflow de demande/approbation est un détail d'implémentation géré au niveau applicatif.

**Traitement retenu :** Supprimée du MCD. Le workflow de changement de groupe est documenté dans le mémoire au §implémentation.

### 2.2 Nouvelles tables recensées (2026-09-24)

#### 2.2.1 `candidate_token` — Candidature

| Colonne | Type | Clé |
|---|---|---|
| id | int unsigned | PRI |
| token_string | varchar(6) | |
| application_id | int unsigned | FK → `applications` |

**Raison d'exclusion** : code court (6 caractères) donnant au candidat l'accès à sa candidature = mécanisme d'accès technique ; la relation conceptuelle est portée par CANDIDATURE (chaque candidature a 0..1 code). **Règle Merise** : propriété d'implémentation. **Traitement retenu** : à statuer — soit attribut `code_acces` de CANDIDATURE, soit entité `CODE_ACCES` (1,1 / 0,1) si la traçabilité du code est jugée utile au concept.

#### 2.2.2 `candidate_ask` — Candidature

| Colonne | Type | Clé |
|---|---|---|
| id | int | PRI |
| request_type | enum | |
| ask_status | enum | |
| is_verified | tinyint(1) | |
| first_name / last_name | varchar(100) | |
| new_email | varchar(255) | |
| new_phone | varchar(20) | |
| decision_reason | varchar(500) | |
| application_id | int unsigned | FK → `applications` |

**Raison d'exclusion** : l'entité `DEMANDE_CANDIDAT` est **référencée dans le README (l.87) mais absente des figures actives** (Candidatures & suivi ne la contient pas ; seul l'archive la portait). Workflow de demande de mise à jour d'identité. **Traitement retenu** : **à statuer** — soit réintégrer une entité `DEMANDE_CANDIDAT` dans « Candidatures & suivi » (relation `formuler` (0,n) CANDIDATURE → (1,1) DEMANDE_CANDIDAT), soit traiter en implémentation. Fichier README à corriger selon la décision.

#### 2.2.3 `application_quiz_attempt` — Quiz

| Colonne | Type | Clé |
|---|---|---|
| id | int unsigned | PRI |
| application_id | int unsigned | FK → `applications` |
| application_progress_id | int unsigned | FK → `application_progress` |
| form_version_id | int unsigned | FK → `form_version` |
| quiz_token | varchar(36) | UNI |
| quiz_status | varchar(20) | |
| screening_mode / screening_threshold / screening_result | — | |
| tab_switch_count / fullscreen_exit_count / cheat_flag_count | int unsigned | Anti-triche |
| score / score_percent | — | |
| manual_correction_status | varchar(20) | |
| total_questions | int | |
| time_elapsed / timed_snapshot / total_time_allowed_snapshot | — | |
| last_activity_at / started_at / completed_at | datetime | |

**Raison d'exclusion** : concept métier majeur **non encore modélisé** — aucune entité `TENTATIVE_QUIZ` n'existe dans les figures actives. **Traitement retenu** : **à statuer (prioritaire)** — candidat à un prochain chantier figures (entité `TENTATIVE_QUIZ`, 1,n côté CANDIDATURE, et ses attributs screening/anti-triche/correction).

#### 2.2.4 `candidate_answer` — Quiz

| Colonne | Type | Clé |
|---|---|---|
| id | int unsigned | PRI |
| is_selected | tinyint(1) | |
| manual_is_correct / manual_correction_comment / manual_correction_score | — | |
| manual_corrected_at / manual_corrected_by | — | FK `manual_corrected_by` → `user` |
| application_quiz_attempt_id | int unsigned | FK → `application_quiz_attempt` |
| question_id | int unsigned | FK → `question` |
| answer_id | int unsigned | FK → `answer` |
| free_text_response | text | |

**Raison d'exclusion** : entité-réponses passées du candidat = assemblage de `TENTATIVE_QUIZ` / `QUESTION` / `REPONSE` (les deux premières non modélisées). **Traitement retenu** : **à statuer (prioritaire)** — entité `REPONSE_CANDIDAT` à prévoir avec la tentative de quiz.

#### 2.2.5 `quiz_anti_cheat_event` — Quiz (19bis)

| Colonne | Type | Clé |
|---|---|---|
| id | int unsigned | PRI |
| application_quiz_attempt_id | int unsigned | FK → `application_quiz_attempt` |
| event_type | varchar(30) | |
| occurred_at | datetime | |
| metadata | varchar(500) | |

**Raison d'exclusion** : **journal technique** des infractions anti-triche (sortie d'onglet, plein écran, copier-coller) = implémentation, au même titre que `EVENEMENT_AUDIT` ; dépend de la tentative de quiz non modélisée. **Traitement retenu** : documentation au §implémentation ; les **compteurs agrégés** (tab_switch/fullscreen/cheat_flags) sont déjà recensés côté `application_quiz_attempt`.

#### 2.2.6 `mail_log` — Emailing

| Colonne | Type | Clé |
|---|---|---|
| id | int | PRI |
| recipient_email | varchar(255) | |
| application_id / application_progress_id / interview_id / decision_id / notification_rule_id | int | FK multiples (contexte métier) |
| event_code | varchar(50) | |
| requires_confirmation / confirmed_at / confirmed_by | — | FK `confirmed_by` → `user` |
| recipient_user_id / sender_user_id | int | FK → `user` |
| email_template_id | int | FK → `email_template` |
| subject / body_preview / status / error_message | — | |
| sent_at | datetime | |

**Raison d'exclusion** : **trace d'envoi d'email** = log d'implémentation ; entité `JOURNAL_EMAIL` présente dans le README (l.96, domaine Communication) et dans l'archive, **absente des figures actives**. **Traitement retenu** : documentation au §implémentation ; les règles qui décident de l'envoi sont modélisées (`REGLE_NOTIFICATION`), pas leur exécution.

#### 2.2.7 `email_template_preset` — Emailing

| Colonne | Type | Clé |
|---|---|---|
| id | int | PRI |
| name | varchar(100) | |
| category | enum(...) | |
| html_structure | text | |
| preview_image | varchar(500) | |
| description | varchar(500) | |

**Raison d'exclusion** : **gabarit visuel** (style HTML) des emails = présentation / implémentation ; entité `PRESET_MODELE_EMAIL` présente dans le README (l.95, domaine Communication), **absente des figures actives**. **Traitement retenu** : documentation au §implémentation ; `MODELE_EMAIL` (actif) reste conceptuel (sujet/corps/variables). La FK BD `email_template.preset_id` est recensée en attributs absents de `MODELE_EMAIL` (voir §3).

#### 2.2.8 `smtp_config` — Emailing

| Colonne | Type | Clé |
|---|---|---|
| id | int unsigned | PRI |
| host / port / username / password_encrypted | — | |
| smtp_auth / starttls_enable / starttls_required | bit(1) | |
| connection_timeout / timeout / write_timeout | int | |
| sender_name / sender_email | varchar(255) | |
| is_active | bit(1) | |

**Raison d'exclusion** : **paramétrage technique SMTP** (hôte, TLS, timeouts) = implémentation ; entité `CONFIGURATION_SMTP` présente dans le README (l.98, domaine Config système), **absente des figures actives**. **Traitement retenu** : documentation au §implémentation. La politique d'emailing (categories) vit dans `CONFIGURATION` (`politique_filtrage`).

#### 2.2.9 `legal_text` — Plateforme transverse

| Colonne | Type | Clé |
|---|---|---|
| id | int unsigned | PRI |
| text_key | varchar(50) | UNI |
| title | varchar(255) | |
| content | text | |
| description | varchar(500) | |
| is_active | bit(1) | |

**Raison d'exclusion** : initialement documentée comme **déplacée** Communication → Config système (2026-08-19), l'entité `TEXTE_JURIDIQUE` reste **absente des figures actives** (présente en archive seulement). **Traitement retenu** : **à statuer** — soit l'ajouter à « Structure & configuration » (dépend de `CONFIGURATION`), soit la traiter en implémentation. README (l.99) à corriger selon la décision.

#### 2.2.10 `system_role_permission` — Permissions

| Colonne | Type | Clé |
|---|---|---|
| id | int | PRI |
| system_role | varchar(30) | |
| functionality | varchar(100) | |

**Raison d'exclusion** : matrice **rôle système ↔ fonctionnalité** — modélisée conceptuellement par l'attribut `role_systeme` de `UTILISATEUR` (+ `PERMISSION_GROUPE` pour l'héritage métier). Les rôles système sont une contrainte d'implémentation. **Traitement retenu** : documentation au §implémentation.

#### 2.2.11 `invitation_code` — Permissions / comptes

| Colonne | Type | Clé |
|---|---|---|
| id | bigint | PRI |
| email | varchar(255) | |
| role | varchar(30) | |
| code | varchar(50) | UNI |
| is_used | bit(1) | |
| expired_at | datetime | |
| created_by | int unsigned | FK → `user` |

**Raison d'exclusion** : **mécanisme d'invitation** (création de compte recruteur par code + email) = workflow de provisionnement, pas un concept métier du recrutement. **Traitement retenu** : documentation au §implémentation.

#### 2.2.12 `flyway_schema_history` — Technique

| Colonne | Type | Clé |
|---|---|---|
| installed_rank | int | PRI |
| version / description / type / script / checksum / installed_by / installed_on / execution_time / success | — | |

**Raison d'exclusion** : **table technique de migrations Flyway** (V1__init, V420__post_420_migration...), hors périmètre métier. **Traitement retenu** : hors-scope trivial, mentionnée pour mémoire uniquement.

---

## 3. Attributs supprimés d'entités conservées (documentés 2026-08-19)

### 3.1 NOTIFICATION.utilisateur

| Attribut | Valeur |
|----------|--------|
| **Entité** | NOTIFICATION |
| **Attribut supprimé** | `utilisateur` |
| **Raison** | Clé étrangère interdite en MCD |

**Justification :** En Merise, les clés étrangères ne figurent pas au MCD. La relation entre UTILISATEUR et NOTIFICATION est portée par l'association `obtenir` (0,n / 1,1). La FK `id_utilisateur` sera ajoutée au niveau MLD/MPD.

### 3.2 TOKEN_VERIFICATION_EMAIL.email

| Attribut | Valeur |
|----------|--------|
| **Entité** | TOKEN_VERIFICATION_EMAIL |
| **Attribut supprimé** | `email` |
| **Raison** | Redondant avec CANDIDATURE.email |

**Justification :** Le token de vérification est toujours lié à une candidature via l'association `creer` (1,1 / 1,1). L'adresse email est déjà portée par l'entité CANDIDATURE. En Merise, la redondance d'attributs entre entités liées directement est évitée (règle de normalisation).

---

## 4. Attributs déplacés entre domaines (documenté 2026-08-19)

### TEXTE_JURIDIQUE (Communication → Config système)

| Attribut | Valeur |
|----------|--------|
| **Déplacement** | De `communication.ts` vers `config_systeme.ts` |
| **Raison** | Cohérence métier : les textes juridiques dépendent de la configuration globale |

**Justification :** Les textes juridiques (CGU, mentions légales) sont paramétrés au niveau de la configuration système, pas dans le module de communication. Leur contenu est lu par les candidats mais généré par l'administration via CONFIGURATION.

> Note 2026-09-24 : l'entité `TEXTE_JURIDIQUE` reste **absente des figures actives** (présente en archive uniquement) — voir aussi la recension `legal_text` en §2.2.9.

---

## 5. Attributs absents des entités conservées (recensés 2026-09-24)

Colonnes **métier** de la BD absentes de la figure active. (Les colonnes de trace sont ignorées, cf. Méthode.)

| Table BD | Entité FR | Colonnes métier absentes de la figure active |
|---|---|---|
| `pipeline_template` | MODELE_PIPELINE | `template_desc` |
| `pipeline_stage` | ETAPE_PIPELINE | `active_slot` |
| `pipeline_stage_notification_rule` | REGLE_NOTIFICATION | `requires_manual_confirmation` |
| `campaigns` | CAMPAGNE | `all_can_evaluate`, `total_questions`, `is_timed`, `time_all_forms`, `anti_cheat_enabled`, `form_assignment_strategy`, `form_assignment_exhaustion_policy`, `creator_id` |
| `campaign_form` | PROPOSER (jonction) | `active_campaign_id`, `active_form_id` (pointeurs techniques) |
| `source_token` | TOKEN_SOURCE | `source_token_name`, `expiration_date`, `campaign_id`, `form_id`, `is_public` |
| `applications` | CANDIDATURE | `abandoned_at`, `abandon_reason`, `abandoned_from_application_progress_id`, `last_progressed_at`, `current_*` (12 pointeurs : interview/preselection/final/pipeline), `current_application_progress_id`, `current_pipeline_stage_id`, `aggregated_*` (4 scores) |
| `application_progress` | AVANCEMENT | `validated_by`, `skipped_by`, `reopened_by` (FK → UTILISATEUR) |
| `email_verification_tokens` | TOKEN_VERIFICATION_EMAIL | `user_id` (jetons PASSWORD_RESET) — l'attribut `email` reste exclu (redondant CANDIDATURE.email, doc 2026-08-19) |
| `form_version` | VERSION_FORMULAIRE | `published_form_id` |
| `question` | QUESTION | `question_ref`, `all_answers_justification_required`, `free_text_response_placeholder` |
| `answer` | REPONSE | `additional_comment_required`, `additional_comment_placeholder` |
| `interviews` | ENTRETIEN | `evaluation_room_code`, `evaluation_completed_at`, `evaluation_completed_by`, `closed_at`, `closed_by`, `closure_comment` |
| `interview_participant` | EVALUATEUR_ENTRETIEN | `evaluation_submitted_at`, `last_ping_at`, `user_id` (FK → UTILISATEUR) |
| `evaluations` | EVALUATION | `validated_by` (FK → UTILISATEUR) |
| `evaluation_grid_template_version` | VERSION_GRILLE | `version_label`, `published_at` |
| `evaluation_grid_template_item` | CRITERE | `config_json` |
| `email_template` | MODELE_EMAIL | `preset_id` (→ PRESET_MODELE_EMAIL) |
| `app_config` | CONFIGURATION | `company_name`, `app_link`, `logo_html`, `primary_color`, `color_scheme` (branding — retiré par décision 2026-09-24), `tab_switch_max_warnings`, `tab_switch_max_actions` |
| `user` | UTILISATEUR | `phone`, `password`, `is_default_password`, `is_online`, `is_locked`, `last_connection_date`, `admin_mode`, `page_size_preference` |
| `notifications` | NOTIFICATION | `object_table_name`, `object_table_id` (polymorphique — exclu) |

Couverture totale des autres tables : `departments`, `specialities`, `form`, `form_questions`, `candidate_interview` (CONVOCATION), `evaluation_item`, `evaluation_grid_template`, `decisions`, `business_group`, `business_group_permission`, `user_business_group` — aucun attribut métier manquant.

---

## 6. Incohérences relevées

1. **README vs figures actives** : le mapping (l.87, 95-99) référence `DEMANDE_CANDIDAT`, `PRESET_MODELE_EMAIL`, `JOURNAL_EMAIL`, `CONFIGURATION_SMTP`, `TEXTE_JURIDIQUE` comme s'ils étaient modélisés → **présents uniquement dans l'archive / le README, absents des figures actives**.
2. **Noms de tables non conformes** : doc 2026-08-19 (`audit_events`, `entity_permissions`, `user_permissions`, `group_change_requests`) et README (`candidate_requests`, `email_logs`, `smtp_configurations`, `legal_texts`, `email_template_presets`) ≠ noms réels de `data.js` (`audit_event`, `entity_permission`, `user_permission_override`, `group_change_request`, `candidate_ask`, `mail_log`, `smtp_config`, `legal_text`, `email_template_preset`).
3. **`CAMPAGNE.est_publiee`** : présent dans la figure mais **absent de la BD** `campaigns` (qui n'a que `is_archived`) — cycle de vie auto, chantier 480.
4. **`ENTREPRISE`** : entité des figures actives (Structure & configuration) **sans table BD** (`companies` absente de `data.js`) — les données « entreprise » vivent dans `app_config.company_name`. Cible théorique.
5. **Cible théorique vs BD physique** (déjà documenté plan 20260922) : `CONFIGURATION` porte `#id_entreprise` (aucune FK dans `app_config`) ; `MODELE_EMAIL` est rattaché à `CONFIGURATION` alors que la BD le relie via `preset_id` / `pipeline_stage_notification_rule.email_template_id`.

---

## 7. Récapitulatif

| Élément | Nombre |
|---|---|
| Tables BD (data.js) | 48 |
| Tables écartées (couvertes par une figure active) | 32 |
| Tables recensées (hors-scope) | 16 |
| — déjà documentées 2026-08-19 (noms corrigés) | 4 |
| — nouvelles 2026-09-24 | 12 |
| Colonnes métier absentes des entités conservées | ~80 |
| Attributs supprimés d'entités conservées (documentés 2026-08-19) | 2 (`NOTIFICATION.utilisateur`, `TOKEN_VERIFICATION_EMAIL.email`) |
| Attributs déplacés entre domaines (documenté 2026-08-19) | 1 (`TEXTE_JURIDIQUE`) |

**À statuer (priorité)** : entités métier absentes — `TENTATIVE_QUIZ` (`application_quiz_attempt`), `REPONSE_CANDIDAT` (`candidate_answer`), et éventuellement `DEMANDE_CANDIDAT` (`candidate_ask`) — soit intégrées aux figures, soit assumées hors-scope.  
**À statuer (faible)**: `TEXTE_JURIDIQUE` (`legal_text`), `CODE_ACCES` (`candidate_token`).