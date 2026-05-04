# Checklist implementation BD - Recrutement QuizApp

Date: 2026-04-25  
Source analysee: migrations Flyway `quizapp/src/main/resources/db/migration/V1_001` a `V1_020`, enums backend, controllers/business existants, pages frontend dashboard.

## Legende priorites

- [ ] **P0 - Memoire / demo bloquante**: indispensable pour montrer le parcours recruteur -> campagne -> candidature -> selection.
- [ ] **P1 - Fonctionnel important**: necessaire pour une version propre, mais contournable en demo courte.
- [ ] **P2 - Admin / confort / robustesse**: utile pour l'exploitation et la coherence.
- [ ] **P3 - Plus tard**: nettoyage, historique avance, optimisation, polish.

## Parcours demo minimum recommande

- [ ] **P0** Verifier qu'un recruteur peut creer une campagne avec `campaigns.campaign_title`, `campaign_desc`, `campaign_start`, `campaign_end`, `speciality_id`, `pipeline_template_id`.
- [ ] **P0** Verifier qu'une campagne peut avoir un ou plusieurs formulaires via `form.campaign_id` et des versions via `form_version.form_id`.
- [ ] **P0** Verifier qu'une version publiee de formulaire contient des questions ordonnees via `form_questions.form_version_id`, `question_id`, `question_order`, `chrono_override`.
- [ ] **P0** Verifier qu'un candidat postule via `applications` et qu'on conserve `candidate_*`, `candidate_cv_path`, `source_token_id`, `form_version_id`.
- [ ] **P0** Verifier que les reponses candidat sont rattachees a la bonne version/question via `candidate_answer.application_id`, `question_id`, `answer_id`, `free_text_response`.
- [ ] **P0** Verifier que le pipeline candidat est initialise via `application_progress.application_id`, `pipeline_stage_id`, `progress_status`.
- [ ] **P0** Verifier que l'avancement pipeline met a jour les decisions via `decisions.pipeline_stage_id`, `decision_type`, `is_cancel`.
- [ ] **P0** Verifier que les permissions empechent un utilisateur non autorise de modifier campagne, pipeline, formulaires et candidats.

---

# 1. Utilisateurs, roles et groupes

## Table `user`

Champs clefs: `first_name`, `last_name`, `username`, `email`, `phone`, `password`, `is_default_password`, `user_role`, `is_online`, `is_locked`, `last_connection_date`, `admin_mode`, `page_size_preference`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string`.

- [ ] **P0** Verifier login/creation compte sur `email`, `username`, `password`, `user_role` avec roles actuels (`SUPER`, `ADMIN`, `UTILISATEUR` ou equivalent reel).
- [ ] **P0** Verifier que `user_role` alimente bien les permissions systeme (`system_role_permission`) et que `SUPER` bypass tout proprement.
- [ ] **P1** Implementer/valider l'invitation recruteur: creation `user` depuis `invitation_code.email`, role cible, mot de passe initial et `is_default_password`.
- [ ] **P1** Verifier verrouillage compte via `is_locked` et retour UI clair.
- [ ] **P1** Verifier `admin_mode`: visible uniquement pour profils autorises, sans donner de droits si permission absente.
- [ ] **P2** Mettre a jour `last_connection_date`, `is_online`, `page_size_preference` dans les workflows reels.
- [ ] **P2** Uniformiser `created_by`, `updated_by`, `is_deleted`, `search_string` dans tous les CRUD utilisateurs.

## Table `business_group`

Champs clefs: `group_name`, `group_desc`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string`.

- [ ] **P0** Verifier creation/modification/suppression logique des groupes metiers.
- [ ] **P0** Verifier unicite `group_name` et message d'erreur front lisible.
- [ ] **P1** Afficher les permissions attachees au groupe dans l'ecran groupe.
- [ ] **P2** Ajouter recherche/filtrage base sur `search_string` si non fiable.

## Table `business_group_permission`

Champs clefs: `business_group_id`, `functionality`, audit, `is_deleted`.

- [ ] **P0** Verifier ajout/retrait de permissions sur groupe via `functionality` et enum `FunctionalityEnum`.
- [ ] **P0** Verifier que `PermissionService` tient compte des permissions groupe dans `hasPermission`.
- [ ] **P1** Eviter doublons avec contrainte unique `(business_group_id, functionality)` et feedback UI.
- [ ] **P1** Grouper les permissions par domaine front: campagnes, candidats, formulaires, pipeline, admin.

## Table `user_business_group`

Champs clefs: `user_id`, `business_group_id`, `is_moderator`, audit, `is_deleted`.

- [ ] **P0** Verifier assignation/retrait utilisateur <-> groupe depuis l'admin utilisateurs.
- [ ] **P0** Verifier que `is_moderator` donne uniquement les droits prevus sur demandes de groupe, pas un acces global.
- [ ] **P1** Afficher les groupes d'un utilisateur dans son profil et dans l'admin.
- [ ] **P1** Bloquer doublon `(user_id, business_group_id)` avec message clair.

## Table `system_role_permission`

Champs clefs: `system_role`, `functionality`, audit, `is_deleted`.

- [ ] **P0** Verifier la matrice roles systeme -> permissions de base.
- [ ] **P0** Verifier que les ecrans critiques du front utilisent les permissions effectives, pas seulement `user_role`.
- [ ] **P1** Ecran admin: permettre d'activer/desactiver les permissions par role sans casser `SUPER`.
- [ ] **P2** Ajouter un seed coherent pour toutes les nouvelles fonctionnalites (`FORM_VERSION`, `PIPELINE_STAGE`, `GROUP_CHANGE_REQUEST`, etc.).

## Table `user_permission_override`

Champs clefs: `user_id`, `functionality`, `is_allowed`, audit, `is_deleted`.

- [ ] **P0** Verifier override individuel `GRANT` / `DENY` dans `PermissionService`.
- [ ] **P0** Verifier regle metier: `DENY` ne doit pas casser un droit inalienable si c'est voulu pour `ADMIN`/`SUPER`.
- [ ] **P1** UI admin: afficher permissions heritees + overrides pour comprendre le resultat final.
- [ ] **P2** Historiser/auditer les changements critiques de permissions.

## Table `entity_permission`

Champs clefs: `user_id`, `entity_type`, `entity_id`, `permission_key`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Verifier droits par entite pour `CAMPAIGN`, `INTERVIEW`, `PIPELINE_TEMPLATE`.
- [ ] **P0** Remplacer les dependances metier restantes a `campaign_crud` / `interview_crud` quand elles doublonnent `entity_permission`.
- [ ] **P0** Verifier permissions `UPDATE`, `DELETE`, `EVALUATE`, `ADVANCE_PIPELINE`, `ADMIN`, `FOLLOW`, `PLANIFY` sur les ecrans reels.
- [ ] **P1** Ajouter UI de partage/permissions depuis detail campagne et detail entretien.
- [ ] **P1** Securiser backend: chaque action sensible doit appeler `hasEntityPermission` ou equivalent.

## Table `group_change_request`

Champs clefs: `user_id`, `target_group_id`, `reason`, `status`, `requested_at`, `processed_at`, `processed_by`, audit, `is_deleted`.

- [ ] **P1** Permettre a un utilisateur de demander l'ajout a un groupe (`PENDING`).
- [ ] **P1** Permettre aux moderateurs/admins d'approuver/rejeter (`APPROVED`, `REJECTED`) avec `processed_by` et `processed_at`.
- [ ] **P1** Si approuve, creer l'entree `user_business_group` correspondante.
- [ ] **P2** Notifier le demandeur du resultat.

---

# 2. Campagnes, formulaires, questions, versions

## Table `campaigns`

Champs clefs: `campaign_title`, `campaign_desc`, `campaign_status`, `campaign_start`, `campaign_end`, `max_apply`, `all_can_evaluate`, `total_questions`, `is_timed`, `pipeline_template_id`, `creator_id`, `speciality_id`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Formulaire campagne: renseigner `campaign_title`, `campaign_desc`, dates, `speciality_id`, `max_apply`, statut.
- [ ] **P0** Ajouter/valider le choix `pipeline_template_id` pendant la creation ou edition campagne.
- [ ] **P0** Ajouter/valider le choix de plusieurs formulaires pour une campagne, ou clarifier si `form.campaign_id` suffit cote modele actuel.
- [ ] **P0** Verifier `campaign_status` dans tous les parcours: brouillon, ouverte, fermee, archivee selon enum/metier reel.
- [ ] **P0** Verifier `max_apply`: bloquer ou avertir quand la limite de candidatures est atteinte.
- [ ] **P1** Verifier `campaign_start`/`campaign_end`: ouverture automatique ou controles front/back.
- [ ] **P1** Verifier `all_can_evaluate`: impact sur les droits d'evaluation.
- [ ] **P1** Recalculer/afficher `total_questions` depuis les formulaires/version publiee au lieu d'une valeur obsolete.
- [ ] **P2** Mettre a jour `search_string` pour recherche recruteur.

## Table `campaign_crud` (legacy ou compatibilite)

Champs clefs: `can_update`, `can_delete`, `can_evaluate`, `follow`, `is_admin`, `is_creator`, `can_planify`, `can_accept_pre_screen`, `can_accept_final`, `user_id`, `campaign_id`.

- [ ] **P0** Decider officiellement si `campaign_crud` reste supporte ou est remplace par `entity_permission`.
- [ ] **P0** Si conserve: synchroniser les droits avec `entity_permission` pour eviter deux sources de verite.
- [ ] **P1** Migrer `can_planify`, `can_accept_pre_screen`, `can_accept_final` vers des `permission_key` explicites si besoin.
- [ ] **P2** Masquer les ecrans CRUD legacy si le nouveau systeme est utilise.

## Table `form`

Champs clefs: `form_name`, `form_desc`, `is_active`, `campaign_id`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Permettre creation de plusieurs formulaires rattaches a une campagne (`campaign_id`).
- [ ] **P0** Afficher les formulaires de la campagne dans l'ecran detail/edition campagne.
- [ ] **P0** Gérer `is_active`: seul les formulaires actifs doivent etre proposables au candidat.
- [ ] **P1** Si plusieurs formulaires par campagne: definir selection par candidat, par source, ou tous obligatoires.
- [ ] **P1** Eviter suppression d'un formulaire ayant des versions/reponses candidates.

## Table `form_version`

Champs clefs: `form_id`, `version_number`, `is_published`, `is_locked`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Implementer regle de versioning: toute modification d'un formulaire publie cree une nouvelle `form_version`.
- [ ] **P0** Verifier qu'une version publiee devient `is_locked = true` quand des candidatures/reponses existent.
- [ ] **P0** Verifier que `applications.form_version_id` pointe vers la version exacte presentee au candidat.
- [ ] **P1** UI: afficher historique des versions, statut publie/verrouille, bouton publier.
- [ ] **P1** Bloquer deux versions publiees actives si le metier exige une seule version courante.
- [ ] **P2** Ajouter comparaison entre versions pour la soutenance si utile.

## Table `question`

Champs clefs: `question_ref`, `question_text`, `question_chrono`, `question_type`, `score`, `difficulty_level`, `speciality_id`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Verifier CRUD question avec `question_text`, `question_type`, `score`, `question_chrono`.
- [ ] **P0** Verifier types de question: `SINGLE_CHOICE`, choix multiples, texte libre si supporte par front/back.
- [ ] **P0** Verifier scoring: `score` et bonnes reponses dans `answer.is_correct`.
- [ ] **P1** Utiliser `question_ref` pour dupliquer/versionner sans perdre l'identite logique d'une question.
- [ ] **P1** Filtrer par `speciality_id` et `difficulty_level` lors de la construction du formulaire.
- [ ] **P2** Clarifier si `question_chrono` est remplace par `form_questions.chrono_override` selon contexte.

## Table `form_questions`

Champs clefs: `form_version_id`, `question_id`, `question_order`, `chrono_override`, audit, `is_deleted`, `search_string`.

- [ ] **P0** UI builder formulaire: ajouter/reordonner/supprimer questions dans une version.
- [ ] **P0** Respecter `question_order` lors de l'affichage candidat.
- [ ] **P0** Respecter `chrono_override` si present, sinon utiliser `question.question_chrono`.
- [ ] **P0** Bloquer doublons `(form_version_id, question_id)` cote UI et back.
- [ ] **P1** Quand une version est `is_locked`, interdire modification directe de `form_questions`.

## Table `answer`

Champs clefs: `question_id`, `answer_text`, `answer_type`, `answer_order`, `is_correct`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Verifier CRUD reponses depuis l'ecran question.
- [ ] **P0** Respecter `answer_order` pour l'affichage candidat.
- [ ] **P0** Verifier `is_correct` pour scoring automatique.
- [ ] **P1** Gerer `answer_type` (`FIXED` ou autres valeurs reelles) et compatibilite texte libre.
- [ ] **P1** Interdire edition destructive d'une reponse deja utilisee dans `candidate_answer` sans versionner/copier.

---

# 3. Candidatures et parcours candidat

## Table `source_token`

Champs clefs: `token_string`, `source_token_name`, `expiration_date`, `campaign_id`, audit, `is_deleted`, `search_string`.

- [ ] **P1** Generer liens de candidature par source/campagne.
- [ ] **P1** Verifier expiration via `expiration_date`.
- [ ] **P1** Renseigner `applications.source_token_id` pour mesurer la provenance.
- [ ] **P2** Tableau stats par source.

## Table `applications`

Champs clefs: `candidate_first_name`, `candidate_last_name`, `candidate_email`, `candidate_phone`, `candidate_cv_path`, `candidate_birth_date`, `motivation_letter`, `email_verified`, `quiz_score`, `total_evaluation_score`, `total_evaluation_number`, `total_evaluation_percentage`, `application_status`, `quiz_token`, `quiz_status`, `quiz_level`, `total_questions`, `quiz_score_percent`, `time_elapsed`, `quiz_last_activity_at`, `interview_date`, `interview_status`, `application_abandoned`, `pre_screen_decision_mail_sent`, `final_decision_mail_sent`, `source_token_id`, `form_version_id`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Page candidature publique: creer `applications` avec infos candidat + CV + lettre + consentement legal.
- [ ] **P0** Verifier unicite ou regle anti-doublon par `candidate_email` + campagne/source.
- [ ] **P0** Verifier stockage/upload `candidate_cv_path` et telechargement recruteur.
- [x] **P0** Generer le code de suivi candidat et `quiz_token` correctement.
	Base: `candidate_token` est maintenant cree automatiquement comme code de suivi public, et `quiz_token` a la verification email; `visit_token` a ete retire du schema actif.
- [ ] **P0** Verifier `email_verified`: le candidat ne commence pas le quiz si non verifie, sauf choix metier explicite.
- [ ] **P0** Rattacher `form_version_id` au moment exact de candidature.
- [ ] **P0** Mettre a jour `quiz_status`, `quiz_score`, `quiz_score_percent`, `time_elapsed`, `total_questions` apres quiz.
- [ ] **P0** Synchroniser `application_status` avec `application_progress` et `decisions`.
- [ ] **P1** Calculer `total_evaluation_score`, `total_evaluation_number`, `total_evaluation_percentage` apres evaluations.
- [x] **P1** Gerer `application_abandoned` si candidat quitte/expire.
	Base: `quiz_last_activity_at` + endpoint public `touch-quiz` + controle planifie backend marquent desormais la candidature abandonnee en cas d'inactivite sur un quiz `STARTED`.
- [ ] **P1** Gerer `pre_screen_decision_mail_sent` et `final_decision_mail_sent` pour eviter les doubles emails.
- [ ] **P2** Nettoyer les champs entretien dupliques (`interview_date`, `interview_status`) si la source fiable devient `interviews`/`candidate_interview`.

## Table `candidate_token`

Champs clefs: `token_string`, `application_id`, audit, `is_deleted`, `search_string`.

- [x] **P1** Clarifier usage par rapport a `applications.visit_token` / `quiz_token`.
	Base: `candidate_token` est maintenant cree automatiquement comme code de suivi public et utilise par `/applications/track`; `visit_token` a ete retire du schema/code actifs.
- [ ] **P1** Si conserve: endpoints de regeneration/expiration et controle securite.
- [ ] **P2** Fusionner ou documenter pour eviter trois systemes de token candidat.

## Table `candidate_ask`

Champs clefs: `request_type`, `ask_status`, `decision_reason`, `is_verified`, `first_name`, `last_name`, `new_email`, `new_phone`, `application_id`, audit, `is_deleted`, `search_string`.

- [x] **P1** Implementer demande candidat de correction email/telephone/identite.
- [x] **P1** Workflow validation recruteur: `ask_status`, `decision_reason` et application des nouvelles valeurs.
- [ ] **P2** Notifier recruteur et candidat.
	Base: la notification email du candidat est maintenant en place apres revue; la notification recruteur reste a completer.

## Table `candidate_answer`

Champs clefs: `application_id`, `question_id`, `answer_id`, `free_text_response`, `is_selected`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Enregistrer toutes les reponses candidat, y compris choix multiples (`is_selected`) et texte libre (`free_text_response`).
- [ ] **P0** Verifier que `question_id` appartient bien a `applications.form_version_id` via `form_questions`.
- [ ] **P0** Calculer score automatique a partir de `answer.is_correct`.
- [ ] **P1** Empecher modification des reponses apres soumission sauf mode admin explicite.
- [ ] **P1** Afficher les reponses dans detail candidature/evaluation.

## Table `email_verification_tokens`

Champs clefs: `email`, `token`, `token_type`, `expires_at`, `is_used`, `created_at`, `used_at`, `application_id`, `user_id`.

- [ ] **P0** Verifier creation token apres candidature.
- [ ] **P0** Verifier lien front -> backend qui marque `is_used`, `used_at`, `applications.email_verified`.
- [ ] **P0** Verifier expiration `expires_at` et message candidat.
- [ ] **P1** Supporter plusieurs `token_type`: candidature, utilisateur, reset si utilise.
- [ ] **P2** Nettoyer/expirer automatiquement les vieux tokens.

---

# 4. Pipeline personnalisable et decisions

## Table `pipeline_template`

Champs clefs: `template_name`, `template_desc`, `is_default`, `is_active`, `is_locked`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Ecran admin: creer/modifier template avec nom, description, actif, default.
- [ ] **P0** Choisir un `pipeline_template_id` sur une campagne.
- [ ] **P0** Verifier qu'un template utilise par une campagne/candidature devient `is_locked` ou versionne.
- [ ] **P1** Un seul `is_default = true` actif.
- [ ] **P1** Dupliquer un template pour modification sans casser les campagnes existantes.

## Table `pipeline_stage`

Champs clefs: `pipeline_template_id`, `stage_type`, `stage_label`, `stage_order`, `is_required`, `is_eliminatory`, `config_json`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Builder pipeline: ajouter/reordonner/supprimer stages.
- [ ] **P0** Valider `stage_type` selon `StageType`: `CANDIDATURE`, `QUIZ`, `PRESELECTION`, `INTERVIEW`, `TECHNICAL_TEST`, `EVALUATION`, `DECISION`, `CUSTOM`.
- [ ] **P0** Respecter `stage_order` dans le suivi candidat.
- [ ] **P0** Respecter `is_required` et `is_eliminatory` lors de l'avancement.
- [ ] **P1** Definir schema attendu de `config_json` par type d'etape.
- [ ] **P1** Bloquer doublon `(pipeline_template_id, stage_order)` proprement cote UI.

## Table `application_progress`

Champs clefs: `application_id`, `pipeline_stage_id`, `progress_status`, `started_at`, `completed_at`, `score`, `notes`, `decided_by`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Initialiser automatiquement une ligne par stage au moment de la candidature ou de l'affectation pipeline.
- [ ] **P0** Avancer/reculer un candidat avec statuts `PENDING`, `IN_PROGRESS`, `PASSED`, `FAILED`, `SKIPPED`.
- [ ] **P0** Mettre `started_at`, `completed_at`, `decided_by` pendant les actions recruteur.
- [ ] **P0** Synchroniser `applications.application_status` avec l'etat global du pipeline.
- [ ] **P1** Afficher timeline pipeline dans detail candidature.
- [ ] **P1** Utiliser `score` et `notes` pour etapes quiz/evaluation/interview.
- [ ] **P1** Controler permissions `ADVANCE_PIPELINE` et `MIGRATE_CANDIDATE_PIPELINE`.

## Table `decisions`

Champs clefs: `decision_type`, `is_cancel`, `application_id`, `user_id`, `pipeline_stage_id`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Creer decision liee a la candidature et, si applicable, a `pipeline_stage_id`.
- [ ] **P0** Une decision doit mettre a jour `application_progress.progress_status` et/ou `applications.application_status`.
- [ ] **P0** Gerer annulation via `is_cancel` sans supprimer l'historique.
- [ ] **P1** Afficher historique decisions par candidat.
- [ ] **P1** Envoyer email selon type decision quand le workflow le demande.

---

# 5. Entretiens, evaluations, participants

## Table `interviews`

Champs clefs: `interview_location`, `interview_date`, `interview_status`, `meet_link`, `interview_evaluations_link`, `interview_note`, `interview_mail_sent`, `interview_type`, `started_at`, `ended_at`, `evaluation_score`, `evaluation_number`, `evaluation_percentage`, `campaign_id`, `application_id`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Planifier entretien depuis candidature/pipeline avec date, type, lieu/lien.
- [x] **P0** Envoyer convocation email et mettre `interview_mail_sent`.
- [ ] **P0** Generer/afficher `interview_evaluations_link` pour participants autorises.
- [ ] **P1** Mettre a jour statut entretien: planifie, en cours, termine, annule/refuse.
- [ ] **P1** Calculer `evaluation_score`, `evaluation_number`, `evaluation_percentage` depuis `evaluations`.
- [ ] **P2** Gerer `started_at` / `ended_at` dans une vraie session d'entretien.

## Table `candidate_interview`

Champs clefs: `interview_start`, `interview_duration`, `application_id`, `interview_id`, `decline_reason`, `alternative_date_requested`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Rattacher candidat/application a un entretien.
- [ ] **P1** Permettre au candidat de refuser/proposer une autre date via `decline_reason` et `alternative_date_requested`.
- [ ] **P1** Afficher cette demande au recruteur et permettre replanification.
- [ ] **P2** Clarifier difference entre `interviews.interview_date` et `candidate_interview.interview_start`.

## Table `interview_crud` (legacy ou presence live)

Champs clefs: `can_update`, `can_delete`, `can_evaluate`, `is_admin`, `follow`, `is_online`, `has_finished`, `last_ping_at`, `user_id`, `interview_id`.

- [ ] **P1** Decider si cette table reste pour presence live ou si elle doit etre migree vers `entity_permission` + websocket.
- [ ] **P1** Si conserve: verifier `is_online`, `has_finished`, `last_ping_at` pendant l'evaluation live.
- [ ] **P2** Ne pas utiliser comme source principale des droits si `entity_permission` est la nouvelle norme.

## Table `evaluations`

Champs clefs: `candidate_mark`, `recruiter_comment`, `candidate_interview_id`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Permettre aux evaluateurs autorises de noter/commenter.
- [ ] **P0** Recalculer scores agreges sur `interviews` et `applications` apres evaluation.
- [ ] **P1** Empêcher double evaluation d'un meme recruteur si ce cas est non souhaite.
- [ ] **P1** Afficher synthese dans detail candidature.

## Table `interview_participant`

Champs a verifier dans l'entite: participants recruteurs/evaluateurs, rattachement entretien/utilisateur, statut participation.

- [ ] **P1** Confirmer le schema exact de la table/entite `interview_participant` et aligner avec la migration actuelle.
- [x] **P1** Ajouter/retirer participants depuis creation/edition entretien.
- [x] **P1** Relier participants aux permissions d'evaluation.

---

# 6. Emails, configuration, legal, invitations

## Table `email_template`

Champs clefs: `template_key`, `subject_template`, `body_template`, `description`, `available_variables`, `action_type`, `preset_id`, `is_active`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Associer chaque email metier a un `template_key`/`action_type`: verification candidature, convocation entretien, decision, invitation, reset password.
- [ ] **P0** Valider remplacement variables `available_variables` dans `subject_template` et `body_template`.
- [ ] **P1** UI edition template avec preview.
- [ ] **P1** Utiliser `preset_id` pour appliquer une structure HTML.
- [ ] **P2** Tester rendu email sur clients simples.

## Table `email_template_preset`

Champs clefs: `name`, `category`, `html_structure`, `preview_image`, `description`, `is_deleted`, `created_at`, `updated_at`.

- [ ] **P1** Ecran ou modal de selection de preset dans l'editeur email.
- [ ] **P1** Injecter `{{content}}`, `{{companyName}}`, `{{primaryColor}}`, `{{ctaButton}}` de facon fiable.
- [ ] **P2** Preview image ou rendu live.

## Table `smtp_config`

Champs clefs: `host`, `port`, `username`, `password_encrypted`, `smtp_auth`, `starttls_enable`, `starttls_required`, `connection_timeout`, `timeout`, `write_timeout`, `sender_name`, `sender_email`, `is_active`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Verifier qu'une config active permet l'envoi reel des emails essentiels.
- [x] **P0** Securiser `password_encrypted`: jamais exposer le secret au front.
- [x] **P1** Bouton test SMTP.
- [x] **P1** Garantir une seule configuration `is_active`.
- [ ] **P2** Logs d'erreur mail comprehensibles.

## Table `legal_text`

Champs clefs: `text_key`, `title`, `content`, `description`, `is_active`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Afficher `candidate_consent` sur le formulaire de candidature.
- [ ] **P1** Afficher `privacy_policy` et `terms_of_use` depuis la BD.
- [ ] **P1** Gerer versions actives/inactives si plusieurs textes.
- [ ] **P2** Ajouter date de derniere mise a jour visible.

## Table `app_config`

Champs clefs: `config_name`, `company_name`, `logo_html`, `primary_color`, `color_scheme`, `is_active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `is_deleted`.

- [ ] **P1** Charger config active au demarrage front ou dans layout.
- [ ] **P1** Appliquer `company_name`, `logo_html`, `primary_color`, `color_scheme` aux emails et a l'interface si prevu.
- [ ] **P2** Une seule config active.
- [ ] **P2** Securiser `logo_html` contre injection si edite par admin.

## Table `invitation_code`

Champs clefs: `email`, `role`, `code`, `is_used`, `expired_at`, `created_by`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Envoyer invitation recruteur/admin avec `code` et expiration.
- [ ] **P0** Creer compte uniquement si code non utilise, non expire, email correspondant.
- [ ] **P1** Marquer `is_used` apres inscription.
- [ ] **P1** Ecran admin pour relancer/revoquer invitation.

## Table `notifications`

Champs clefs: `notif_type`, `notif_actor`, `notif_link`, `is_read`, `object_table_name`, `object_table_id`, `user_id`, audit, `is_deleted`, `search_string`.

- [ ] **P1** Notifier recruteur: nouvelle candidature, demande changement groupe, entretien refuse, decision requise.
- [ ] **P1** Marquer lu/non lu via `is_read`.
- [ ] **P2** Nettoyer liens `notif_link` et objets generiques.

---

# 7. Referentiels et administration

## Table `departments`

Champs clefs: `department_name`, `department_desc`, audit, `is_deleted`, `search_string`.

- [ ] **P1** CRUD departements fonctionnel pour organiser les specialites.
- [ ] **P1** Eviter suppression si specialites rattachees.
- [ ] **P2** Recherche et tri.

## Table `specialities`

Champs clefs: `speciality_name`, `speciality_desc`, `department_id`, audit, `is_deleted`, `search_string`.

- [ ] **P0** Selection de specialite dans creation campagne.
- [ ] **P1** CRUD specialites avec rattachement departement.
- [ ] **P1** Filtrage questions/campagnes par specialite.

---

# 8. Audit, coherence technique et dette

## Champs communs d'audit et suppression logique

Tables concernees: presque toutes les tables metier avec `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string`.

- [ ] **P0** Verifier que les listes n'affichent pas `is_deleted = true`.
- [ ] **P1** Remplir automatiquement `created_at`, `updated_at`, `created_by`, `updated_by` dans les services critiques.
- [ ] **P1** Verifier que les suppressions importantes sont logiques, pas physiques, sauf tables techniques.
- [ ] **P2** Standardiser types `BOOLEAN` vs `BIT(1)` vs `BIT` dans DTO/front.
- [ ] **P2** Standardiser types id `INT UNSIGNED`, `INT`, `BIGINT` entre SQL/JPA/DTO.
- [ ] **P2** Recalculer `search_string` a la creation/update des entites recherchables.

## Champs de scoring et statuts a synchroniser

Tables concernees: `applications`, `candidate_answer`, `answer`, `question`, `interviews`, `evaluations`, `application_progress`, `decisions`.

- [ ] **P0** Definir une source de verite pour statut candidat: `applications.application_status` ou pipeline agregé.
- [ ] **P0** Definir une source de verite pour score quiz: `candidate_answer` -> `applications.quiz_score` / `quiz_score_percent`.
- [ ] **P1** Definir une source de verite pour score entretien: `evaluations` -> `interviews` -> `applications`.
- [ ] **P1** Ajouter tests backend sur transitions: candidature creee, email verifie, quiz termine, pipeline avance, decision finale.

## Tables/entites a clarifier

- [ ] **P0** `campaign_crud` vs `entity_permission`: choisir source officielle des permissions campagne.
- [ ] **P1** `interview_crud` vs `entity_permission` + `interview_participant`: choisir source officielle des droits entretien.
- [ ] **P1** `candidate_token` vs `applications.visit_token` vs `quiz_token` vs `email_verification_tokens`: clarifier roles pour eviter failles.
- [ ] **P1** `form.campaign_id` et besoin de plusieurs formulaires par campagne: modele actuel le permet, mais il faut definir comment le candidat recoit un ou plusieurs formulaires.
- [ ] **P2** `app_config.logo_html`: securite/sanitization si affichage brut.

---

# 9. Ordre de travail conseille avant presentation

## Sprint 1 - Demo recruteur/candidat minimale

- [ ] **P0** Creation campagne avec pipeline et formulaire.
- [ ] **P0** Builder formulaire versionne avec questions/reponses.
- [ ] **P0** Page candidature publique avec upload CV + verification email.
- [ ] **P0** Passage quiz + sauvegarde reponses + calcul score.
- [ ] **P0** Detail candidature recruteur avec reponses, score et CV.
- [ ] **P0** Avancement pipeline + decision finale.
- [ ] **P0** Permissions minimum: seul utilisateur autorise modifie campagne/candidat.

## Sprint 2 - Qualite memoire

- [ ] **P1** Historique versions formulaire visible.
- [ ] **P1** Timeline pipeline visible.
- [ ] **P1** Emails configurables pour verification, entretien, decision.
- [ ] **P1** Gestion groupes metiers + overrides utilisateur.
- [ ] **P1** Entretiens + evaluations agregees.

## Sprint 3 - Admin/polish

- [ ] **P2** Notifications.
- [ ] **P2** App config branding.
- [ ] **P2** Legal texts depuis BD.
- [ ] **P2** Nettoyage legacy CRUD permissions.
- [ ] **P2** Tests backend transitions principales.

---

# 10. Definition de fini pour la soutenance

- [ ] **P0** Un recruteur peut creer une campagne complete sans intervention SQL.
- [ ] **P0** Un candidat peut postuler, verifier son email, repondre au quiz, et apparaitre dans la campagne.
- [ ] **P0** Le recruteur peut voir le score, le CV, les reponses et faire avancer le candidat.
- [ ] **P0** Une decision finale est historisee et liee a une etape pipeline.
- [ ] **P0** Les permissions empechent au moins les modifications non autorisees sur campagne/candidature.
- [ ] **P1** Les formulaires versionnes sont explicables simplement pendant le memoire: une candidature garde la version exacte utilisee.
- [ ] **P1** Le pipeline personnalisable est explicable simplement: template -> stages -> progress candidat -> decisions.
