/* Mini-BD fictive — quizapp_db (47 tables, 9 familles)
 * Colonnes et ordre conformes au snapshot : bd_documentee/quizapp_db_documentation_20260810.md
 * NULL (valeurs \N du snapshot) est représenté par `null`.
 * Valeurs `bit` représentées par 0/1.
 */
window.BD_EXEMPLES = {
  titre: "quizapp_db — Mini-BD fictive",
  sousTitre: "Exemples d'occurrences pour chaque table (scénario de recrutement 'Backend 2026')",
  source: "Structure reprise de bd_documentee/quizapp_db_documentation_20260810.md",
  familles: [
    {
      nom: "1. Pipeline (gabarits)",
      tables: [
        {
          num: 1,
          nom: "pipeline_template",
          description: "Un gabarit de processus de recrutement : la liste ordonnée des étapes que suivra chaque candidature d'une campagne.",
          notes: [],
          colonnes: ["id", "template_name", "template_desc", "is_default", "is_active", "is_locked", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "Recrutement Dev", "Gabarit standard pour les postes de développement", 1, 1, 0, "2026-07-01 09:00", 1, "2026-07-01 09:00", 1, 0, "recrutement dev gabarit"],
            [2, "Recrutement Commercial", "Gabarit pour les postes commerciaux", 0, 1, 1, "2026-07-02 10:00", 1, null, null, 0, null]
          ]
        },
        {
          num: 2,
          nom: "pipeline_stage",
          description: "Une étape du processus (candidature, quiz, présélection, entretien, décision) dans un gabarit de pipeline.",
          notes: ["stage_type est une énumération : CANDIDATURE, QUIZ, PRESELECTION, INTERVIEW, DECISION (EVALUATION a été fusionné dans DECISION).", "L'étape 4 (Entretien) est rattachée à la grille « Grille entretien RH » (evaluation_grid_template_version_id = 1) ; les autres étapes n'ont pas de grille.", "is_active / active_slot portent le versionnage fin des étapes (440 Lot B) : au plus une révision active par slot ; l'étape 3 (Présélection) montre une révision inactive (is_active=0) + une nouvelle révision active au même slot."],
          colonnes: ["id", "pipeline_template_id", "stage_type", "stage_label", "stage_order", "is_active", "active_slot", "is_required", "is_eliminatory", "config_json", "evaluation_grid_template_version_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, 1, "CANDIDATURE", "Candidature", 1, 1, 1, 1, 0, null, null, "2026-07-01 09:00", 1, null, null, 0, "candidature"],
            [2, 1, "QUIZ", "Quiz technique", 2, 1, 2, 1, 1, "{\"duration\":20}", null, "2026-07-01 09:00", 1, null, null, 0, "quiz technique"],
            [3, 1, "PRESELECTION", "Présélection (révision 1)", 3, 0, null, 1, 0, null, null, "2026-07-01 09:00", 1, null, null, 0, "présélection"],
            [31, 1, "PRESELECTION", "Présélection révisée", 3, 1, 3, 1, 0, null, null, "2026-07-10 14:00", 2, null, null, 0, "présélection révisée"],
            [4, 1, "INTERVIEW", "Entretien", 4, 1, 4, 1, 0, null, 1, "2026-07-01 09:00", 1, null, null, 0, "entretien"],
            [5, 1, "DECISION", "Décision", 5, 1, 5, 1, 0, null, null, "2026-07-01 09:00", 1, null, null, 0, "décision"]
          ]
        },
        {
          num: 3,
          nom: "pipeline_stage_notification_rule",
          description: "La règle de notification d'une étape : quel email envoyer, à quel déclencheur, et si l'envoi est automatique.",
          notes: ["C'est ici que vit la politique d'emailing par étape (anciennement pipeline_stage.email_required / email_automatic, supprimées)."],
          colonnes: ["id", "pipeline_stage_id", "trigger_code", "outcome_code", "email_template_id", "is_required", "is_automatic", "requires_manual_confirmation", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, 2, "QUIZ_INVITED", null, 3, 0, 1, 0, "2026-07-06 09:00", 2, null, null, 0, "quiz invité"],
            [2, 4, "INTERVIEW_SCHEDULED", null, 1, 1, 1, 0, "2026-07-06 09:00", 2, null, null, 0, "entretien planifié"],
            [3, 5, "DECISION_TAKEN", "REJECTED", 1, 0, 0, 1, "2026-07-06 09:00", 2, null, null, 0, "décision refus"]
          ]
        }
      ]
    },
    {
      nom: "2. Campagnes & référentiels",
      tables: [
        {
          num: 4,
          nom: "campaigns",
          description: "Une campagne de recrutement : un poste à pourvoir avec son pipeline, ses dates et ses paramètres.",
          notes: ["total_questions, is_timed, time_all_forms et all_can_evaluate sont des champs adjacents conservés hors périmètre strict 420."],
          colonnes: ["id", "campaign_title", "campaign_desc", "campaign_status", "campaign_start", "campaign_end", "max_apply", "all_can_evaluate", "total_questions", "is_timed", "is_archived", "time_all_forms", "pipeline_template_id", "form_assignment_strategy", "form_assignment_exhaustion_policy", "creator_id", "speciality_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "Développeur Backend Java", "Recrutement d'un développeur backend sénior (Java / Spring)", "OPEN", "2026-08-01 00:00", "2026-09-30 23:59", 20, 0, 4, 1, 0, 1, 1, "BALANCED", "ROUND_ROBIN", 2, 1, "2026-07-10 10:00", 2, "2026-08-01 08:00", 2, 0, "backend java senior"]
          ]
        },
        {
          num: 5,
          nom: "campaign_form",
          description: "Le lien entre une campagne et un formulaire : quel formulaire est attribué à la campagne et dans quel ordre.",
          notes: [],
          colonnes: ["id", "campaign_id", "form_id", "assignment_order", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string", "active_campaign_id", "active_form_id"],
          lignes: [
            [1, 1, 1, 1, "2026-07-10 10:00", 2, null, null, 0, null, 1, 1]
          ]
        },
        {
          num: 6,
          nom: "source_token",
          description: "Un code source de recrutement : permet de tracer d'où viennent les candidatures d'une campagne.",
          notes: [],
          colonnes: ["id", "token_string", "source_token_name", "expiration_date", "campaign_id", "form_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string", "is_public"],
          lignes: [
            [1, "LKD", "LinkedIn", null, 1, null, "2026-07-10 10:00", 2, null, null, 0, "linkedin", 1],
            [2, "JBD", "JobBoard", "2026-09-30 23:59", 1, null, "2026-07-10 10:00", 2, null, null, 0, "jobboard", 0]
          ]
        },
        {
          num: 7,
          nom: "departments",
          description: "Un département de l'entreprise, référentiel utilisé pour classer les spécialités.",
          notes: [],
          colonnes: ["id", "department_name", "department_desc", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "Direction Technique", "Département en charge du développement logiciel", "2026-06-01 09:00", 1, null, null, 0, "technique"]
          ]
        },
        {
          num: 8,
          nom: "specialities",
          description: "Une spécialité métier rattachée à un département (ex. « Développement », « Marketing »).",
          notes: [],
          colonnes: ["id", "speciality_name", "speciality_desc", "department_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "Développement Backend", "Java / Spring / SQL", 1, "2026-06-01 09:00", 1, null, null, 0, "backend java spring"]
          ]
        }
      ]
    },
    {
      nom: "3. Candidature",
      tables: [
        {
          num: 9,
          nom: "applications",
          description: "La candidature d'un candidat à une campagne : son identité, son état courant et ses synthèses de progression.",
          notes: ["Table de résumé et de pointeurs courants ; la progression détaillée vit dans application_progress. Les colonnes current_* et aggregated_* sont dérivées."],
          colonnes: ["id", "candidate_first_name", "candidate_last_name", "candidate_email", "candidate_phone", "candidate_cv_path", "candidate_birth_date", "motivation_letter", "email_verified", "current_interview_evaluation_score", "current_interview_evaluation_number", "current_interview_evaluation_percentage", "current_preselection_decision_type", "current_preselection_decision_date", "current_final_decision_type", "current_final_decision_date", "current_pipeline_stage_type", "current_pipeline_stage_label", "current_pipeline_progress_status", "application_abandoned", "abandoned_at", "abandon_reason", "abandoned_from_application_progress_id", "source_token_id", "form_version_id", "current_application_progress_id", "current_pipeline_stage_id", "last_progressed_at", "aggregated_quiz_score", "aggregated_quiz_score_percent", "aggregated_evaluation_score", "aggregated_evaluation_score_percent", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "Alice", "Martin", "alice.martin@mail.com", "0612345678", "/cvs/alice-martin.pdf", "1994-03-15", "Motivée par les systèmes distribués", 1, 73, 2, 73.0, "ACCEPTED", "2026-08-04 11:00", "REJECTED", "2026-08-08 09:00", "DECISION", "Décision", "COMPLETED", 0, null, null, null, 1, 1, 5, 5, "2026-08-07 17:00", 4.0, 80.0, 73.0, 73.0, "2026-08-02 10:15", 4, "2026-08-08 09:00", 2, 0, "alice martin backend"]
          ]
        },
        {
          num: 10,
          nom: "application_progress",
          description: "Une étape (round) du pipeline pour une candidature : son statut, son score, et ses décisions de validation / skip / réouverture.",
          notes: ["Les traces de décision vivent dans validated_by / skipped_by / reopened_by (decided_by supprimée) ; la trace mail dérive de mail_log."],
          colonnes: ["id", "application_id", "pipeline_stage_id", "progress_status", "started_at", "completed_at", "score", "notes", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string", "validated_at", "validated_by", "validation_comment", "skipped_at", "skipped_by", "skip_reason", "reopened_at", "reopened_by", "reopen_reason"],
          lignes: [
            [1, 1, 1, "COMPLETED", "2026-08-02 10:15", "2026-08-02 10:20", null, "Dossier complet", "2026-08-02 10:15", 4, null, null, 0, "candidature complétée", "2026-08-02 10:20", 2, "Candidature acceptée", null, null, null, null, null, null],
            [2, 1, 2, "COMPLETED", "2026-08-03 09:00", "2026-08-03 09:09", 4.0, "Quiz passé en 9 min", "2026-08-03 09:00", 4, null, null, 0, "quiz complété", "2026-08-03 09:15", 2, "Quiz validé", null, null, null, null, null, null],
            [3, 1, 3, "COMPLETED", "2026-08-04 09:00", "2026-08-04 11:00", null, null, "2026-08-04 09:00", 2, null, null, 0, "présélection", "2026-08-04 11:00", 2, "Présélection validée", null, null, null, null, null, null],
            [4, 1, 4, "COMPLETED", "2026-08-05 14:02", "2026-08-05 16:10", 73.0, null, "2026-08-04 09:00", 2, null, null, 0, "entretien", "2026-08-06 09:00", 2, "Entretien validé", null, null, null, null, null, null],
            [5, 1, 5, "COMPLETED", "2026-08-06 09:00", "2026-08-08 09:00", null, null, "2026-08-06 09:00", 2, null, null, 0, "décision", "2026-08-08 09:00", 2, "Décision finale", null, null, null, null, null, null]
          ]
        },
        {
          num: 11,
          nom: "candidate_token",
          description: "Un code d'accès à 6 caractères qui permet à un candidat de retrouver sa candidature.",
          notes: [],
          colonnes: ["id", "token_string", "application_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "A1B2C3", 1, "2026-08-02 10:16", 4, null, null, 0, "token alice"]
          ]
        },
        {
          num: 12,
          nom: "candidate_ask",
          description: "Une demande faite par un candidat (changement d'identité, d'email ou de téléphone) en attente de décision.",
          notes: [],
          colonnes: ["id", "request_type", "ask_status", "is_verified", "first_name", "last_name", "new_email", "new_phone", "decision_reason", "application_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "EMAIL", "APPROVED", 1, null, null, "alice.martin@mail.com", null, "Nouvelle adresse validée", 1, "2026-08-02 11:00", 4, "2026-08-02 14:00", 2, 0, "demande email"],
            [2, "PHONE", "PENDING", 0, null, null, null, "0611223344", null, 1, "2026-08-06 15:00", 4, null, null, 0, "demande téléphone"]
          ]
        }
      ]
    },
    {
      nom: "4. Quiz",
      tables: [
        {
          num: 13,
          nom: "form",
          description: "Un formulaire (questionnaire) de quiz.",
          notes: [],
          colonnes: ["id", "form_name", "form_desc", "is_active", "is_timed", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "Quiz Backend Java", "Questions de culture technique backend", 1, 1, "2026-07-12 09:00", 2, "2026-07-12 09:00", 2, 0, "quiz backend"]
          ]
        },
        {
          num: 14,
          nom: "form_version",
          description: "Une version d'un formulaire : le contenu évolue par versions que l'on publie puis verrouille.",
          notes: [],
          colonnes: ["id", "form_id", "version_number", "is_published", "is_locked", "random_questions", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string", "published_form_id"],
          lignes: [
            [1, 1, 1, 1, 1, 0, "2026-07-12 09:00", 2, "2026-07-13 09:00", 2, 0, "version 1", 1]
          ]
        },
        {
          num: 15,
          nom: "form_questions",
          description: "Le lien entre une version de formulaire et une question : position de la question et temps imparti.",
          notes: [],
          colonnes: ["id", "form_version_id", "question_id", "question_order", "chrono_override", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, 1, 1, 1, null, "2026-07-12 09:00", 2, null, null, 0, null],
            [2, 1, 2, 2, null, "2026-07-12 09:00", 2, null, null, 0, null],
            [3, 1, 3, 3, null, "2026-07-12 09:00", 2, null, null, 0, null],
            [4, 1, 4, 4, null, "2026-07-12 09:00", 2, null, null, 0, null]
          ]
        },
        {
          num: 16,
          nom: "question",
          description: "Une question de quiz : son énoncé, son type, sa difficulté et le score qu'elle rapporte.",
          notes: [],
          colonnes: ["id", "question_ref", "question_text", "question_chrono", "question_type", "score", "difficulty_level", "speciality_id", "all_answers_justification_required", "manual_correction_required", "free_text_response_placeholder", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "q-0001", "Quelle est la portée d'une variable déclarée avec le mot-clé final en Java ?", 20, "SINGLE_CHOICE", 1, "MEDIUM", 1, 0, 0, null, "2026-07-12 09:00", 2, null, null, 0, "final java"],
            [2, "q-0002", "Quels frameworks font partie de l'écosystème Spring ?", 30, "MULTIPLE_CHOICE", 2, "MEDIUM", 1, 0, 0, null, "2026-07-12 09:00", 2, null, null, 0, "spring framework"],
            [3, "q-0003", "Depuis Java 8, une interface peut contenir des méthodes par défaut.", 15, "TRUE_FALSE", 1, "EASY", 1, 0, 0, null, "2026-07-12 09:00", 2, null, null, 0, "interface java 8"],
            [4, "q-0004", "Expliquez le pattern Builder et donnez un exemple d'utilisation.", null, "TEXT", 1, "HARD", 1, 0, 1, "Votre réponse...", "2026-07-12 09:00", 2, null, null, 0, "pattern builder"]
          ]
        },
        {
          num: 17,
          nom: "answer",
          description: "Une réponse possible à une question de quiz (bonne ou mauvaise, avec texte et options de commentaire).",
          notes: [],
          colonnes: ["id", "answer_text", "is_correct", "answer_order", "answer_type", "allow_additional_comment", "additional_comment_required", "additional_comment_placeholder", "question_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "La variable devient immuable pour les objets référencés.", 0, 1, "TEXT", 0, 0, null, 1, "2026-07-12 09:00", 2, null, null, 0, null],
            [2, "On ne peut plus réassigner la variable après son initialisation.", 1, 2, "TEXT", 0, 0, null, 1, "2026-07-12 09:00", 2, null, null, 0, null],
            [3, "La variable est accessible partout dans le programme.", 0, 3, "TEXT", 0, 0, null, 1, "2026-07-12 09:00", 2, null, null, 0, null],
            [4, "La variable est automatiquement une constante de compilation.", 0, 4, "TEXT", 0, 0, null, 1, "2026-07-12 09:00", 2, null, null, 0, null],
            [5, "Vrai", 1, 1, "TEXT", 0, 0, null, 3, "2026-07-12 09:00", 2, null, null, 0, null],
            [6, "Faux", 0, 2, "TEXT", 0, 0, null, 3, "2026-07-12 09:00", 2, null, null, 0, null],
            [7, "Spring Boot", 1, 1, "TEXT", 1, 0, "Précisez pourquoi", 2, "2026-07-12 09:00", 2, null, null, 0, null],
            [8, "Spring Security", 1, 2, "TEXT", 0, 0, null, 2, "2026-07-12 09:00", 2, null, null, 0, null],
            [9, "Hibernate", 0, 3, "TEXT", 0, 0, null, 2, "2026-07-12 09:00", 2, null, null, 0, null],
            [10, "Lombok", 0, 4, "TEXT", 0, 0, null, 2, "2026-07-12 09:00", 2, null, null, 0, null]
          ]
        },
        {
          num: 18,
          nom: "application_quiz_attempt",
          description: "Une tentative de quiz passée par un candidat pour une étape de quiz : statut, score, chronomètre et correction manuelle.",
          notes: [],
          colonnes: ["id", "application_id", "application_progress_id", "form_version_id", "quiz_token", "quiz_status", "screening_mode", "screening_threshold", "screening_result", "score", "score_percent", "manual_correction_status", "total_questions", "time_elapsed", "timed_snapshot", "total_time_allowed_snapshot", "last_activity_at", "started_at", "completed_at", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, 1, 2, 1, "tk-8f7a2c9d-4e3b-11ec-9d64-0242ac130002", "COMPLETED", "NONE", null, null, 4.0, 80.0, "NOT_REQUIRED", 4, 540, 0, 600, "2026-08-03 09:09", "2026-08-03 09:00", "2026-08-03 09:09", "2026-08-03 09:00", 4, null, null, 0, "quiz alice"]
          ]
        },
        {
          num: 19,
          nom: "candidate_answer",
          description: "La réponse donnée par un candidat à une question lors d'une tentative de quiz, avec l'éventuelle correction manuelle.",
          notes: ["Q2 était MULTIPLE_CHOICE : Alice a coché Spring Boot mais pas Spring Security (ligne 3, is_selected = 0) — elle perd 1 point."],
          colonnes: ["id", "is_selected", "manual_is_correct", "manual_correction_comment", "manual_correction_score", "manual_corrected_at", "manual_corrected_by", "application_quiz_attempt_id", "question_id", "answer_id", "free_text_response", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, 1, null, null, null, null, null, 1, 1, 2, null, "2026-08-03 09:01", 4, null, null, 0, null],
            [2, 1, null, null, null, null, null, 1, 2, 7, null, "2026-08-03 09:01", 4, null, null, 0, null],
            [3, 0, null, null, null, null, null, 1, 2, 8, null, "2026-08-03 09:01", 4, null, null, 0, null],
            [4, 1, null, null, null, null, null, 1, 3, 5, null, "2026-08-03 09:01", 4, null, null, 0, null],
            [5, 0, 1, "Explication claire et structurée", 1, "2026-08-03 10:00", 2, 1, 4, null, "Le Builder sépare la construction d'un objet de sa représentation...", "2026-08-03 09:02", 4, "2026-08-03 10:00", 2, 0, null]
          ]
        }
      ]
    },
    {
      nom: "5. Entretien & évaluation",
      tables: [
        {
          num: 20,
          nom: "interviews",
          description: "Un entretien planifié pour une étape « entretien » : sa date, son type, son statut et sa salle d'évaluation partagée.",
          notes: ["application_progress_id est nullable dans la base (0 NULL actuellement, durcissement NOT NULL reporté). evaluation_room_code remplace l'ancienne interview_evaluations_link."],
          colonnes: ["id", "interview_location", "interview_date", "interview_status", "meet_link", "evaluation_room_code", "interview_note", "interview_type", "started_at", "ended_at", "evaluation_completed_at", "evaluation_completed_by", "closed_at", "closed_by", "closure_comment", "application_progress_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "Bâtiment B, salle 12", "2026-08-05 14:00", "CLOSED", null, "RM-8F3K2", "Entretien technique", "IN_PERSON", "2026-08-05 14:02", "2026-08-05 14:50", "2026-08-05 16:10", 3, "2026-08-06 09:00", 2, "Aptitude confirmée", 4, "2026-08-04 09:00", 2, "2026-08-06 09:00", 2, 0, "entretien alice"]
          ]
        },
        {
          num: 21,
          nom: "candidate_interview",
          description: "La réponse d'un candidat à une convocation d'entretien : acceptation, refus ou demande de replanification.",
          notes: ["interview_duration est conservée par décision BA 2026-08-04 (écart cible documenté)."],
          colonnes: ["id", "interview_duration", "candidate_response_status", "responded_at", "interview_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string", "decline_reason", "alternative_date_requested"],
          lignes: [
            [1, 60, "ACCEPTED", "2026-08-04 10:00", 1, "2026-08-04 09:00", 4, "2026-08-04 10:00", 4, 0, "convocation alice", null, null]
          ]
        },
        {
          num: 22,
          nom: "interview_participant",
          description: "Un participant (recruteur) à un entretien : ses droits et l'état de son évaluation.",
          notes: [],
          colonnes: ["id", "can_update", "can_delete", "can_evaluate", "is_admin", "follow", "is_online", "has_finished", "evaluation_status", "evaluation_submitted_at", "last_ping_at", "user_id", "interview_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, 1, 1, 1, 1, 1, 0, 1, "SUBMITTED", "2026-08-05 15:45", null, 2, 1, "2026-08-04 09:00", 2, null, null, 0, "participant camille"],
            [2, 0, 0, 1, 0, 1, 0, 1, "SUBMITTED", "2026-08-05 15:50", null, 3, 1, "2026-08-04 09:00", 2, null, null, 0, "participant lucas"]
          ]
        },
        {
          num: 23,
          nom: "evaluations",
          description: "L'évaluation d'un entretien par un participant évaluateur : score global, commentaire global et statut.",
          notes: ["interview_participant_id est nullable (durcissement NOT NULL reporté). Chaque évaluateur a sa propre ligne pour le même candidate_interview."],
          colonnes: ["id", "evaluation_status", "submitted_at", "validated_at", "validated_by", "global_score", "global_comment", "candidate_interview_id", "interview_participant_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "SUBMITTED", "2026-08-05 15:45", null, null, 75.0, "Très bon échange, profil sérieux", 1, 1, "2026-08-05 14:30", 2, "2026-08-05 15:45", 2, 0, "évaluation camille"],
            [2, "SUBMITTED", "2026-08-05 15:50", null, null, 71.0, "Bon niveau technique", 1, 2, "2026-08-05 14:30", 3, "2026-08-05 15:50", 3, 0, "évaluation lucas"]
          ]
        },
        {
          num: 24,
          nom: "evaluation_item",
          description: "La note attribuée par un évaluateur sur un critère précis d'une grille d'évaluation.",
          notes: ["Les snapshots (weight_snapshot / max_score_snapshot) figent la grille au moment de la note, même si elle change ensuite.", "Chaque ligne pointe un item de la grille v1 (evaluation_grid_template_item_id 1–3) ; ancienne colonne pipeline_stage_evaluation_criterion_id supprimée (note 430)."],
          colonnes: ["id", "evaluation_id", "evaluation_grid_template_item_id", "score_value", "text_value", "weight_snapshot", "max_score_snapshot", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, 1, 1, 4.0, null, 1, 5, "2026-08-05 14:35", 2, null, null, 0, null],
            [2, 1, 2, 3.5, null, 2, 5, "2026-08-05 14:35", 2, null, null, 0, null],
            [3, 1, 3, null, "Très bon échange", null, null, "2026-08-05 14:35", 2, null, null, 0, null],
            [4, 2, 1, 4.0, null, 1, 5, "2026-08-05 14:35", 3, null, null, 0, null],
            [5, 2, 2, 3.0, null, 2, 5, "2026-08-05 14:35", 3, null, null, 0, null],
            [6, 2, 3, null, "Niveau technique correct", null, null, "2026-08-05 14:35", 3, null, null, 0, null]
          ]
        },
        {
          num: 25,
          nom: "evaluation_grid_template",
          description: "Un modèle de grille d'évaluation réutilisable d'une campagne à l'autre.",
          notes: [],
          colonnes: ["id", "template_name", "template_desc", "is_active", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "Grille entretien RH", "Critères standards d'entretien", 1, "2026-07-05 09:00", 2, null, null, 0, "grille rh"],
            [2, "Grille entretien technique", "Critères orientés technique", 0, "2026-07-06 09:00", 2, null, null, 0, "grille technique"]
          ]
        },
        {
          num: 26,
          nom: "evaluation_grid_template_version",
          description: "Une version d'un modèle de grille d'évaluation (on publie une version avant de l'utiliser).",
          notes: ["content_hash (empreinte de contenu, forme canonique) est UNIQUE : une seule version par contenu.", "locked_at est posé à la première evaluation_item réellement saisie : la v1 est verrouillée (utilisée), la v2 (non publiée, non utilisée) ne l'est pas."],
          colonnes: ["id", "evaluation_grid_template_id", "version_number", "version_label", "is_published", "published_at", "content_hash", "locked_at", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, 1, 1, "v1", 1, "2026-07-05 10:00", "9a8b7c6d5e4f30291a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7081", "2026-08-05 14:35", "2026-07-05 09:00", 2, null, null, 0, "v1 grille"],
            [2, 1, 2, "v2 (ajout critère Autonomie)", 0, null, "0f1e2d3c4b5a69788796a5b4c3d2e1f011223344556677889900aabbccddeeff", null, "2026-07-20 09:00", 2, null, null, 0, "v2 grille"]
          ]
        },
        {
          num: 27,
          nom: "evaluation_grid_template_item",
          description: "Un critère défini dans une version de grille d'évaluation : intitulé, note maximale et poids.",
          notes: [],
          colonnes: ["id", "evaluation_grid_template_version_id", "criterion_order", "label", "criterion_type", "max_score", "weight", "is_required", "config_json", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, 1, 1, "Communication", "SCORE", 5, 1, 1, null, "2026-07-05 09:00", 2, null, null, 0, null],
            [2, 1, 2, "Motivation", "SCORE", 5, 2, 1, null, "2026-07-05 09:00", 2, null, null, 0, null],
            [3, 1, 3, "Commentaires", "TEXT", null, null, 0, null, "2026-07-05 09:00", 2, null, null, 0, null]
          ]
        }
      ]
    },
    {
      nom: "6. Décisions",
      tables: [
        {
          num: 28,
          nom: "decisions",
          description: "La décision prise sur une étape (présélection ou décision finale) : le verdict métier, le mode technique et l'acteur.",
          notes: ["application_progress_id est NOT NULL (décision mono-ancrée). Décision 3 = OVERRIDE qui annule la décision 2 (cancels_decision_id)."],
          colonnes: ["id", "decision_type", "user_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string", "application_progress_id", "justification", "decision_mode", "cancels_decision_id"],
          lignes: [
            [1, "ACCEPTED", 2, "2026-08-04 11:00", 2, null, null, 0, "présélection ok", 3, "Score quiz 80 %, passage en entretien", "STANDARD", null],
            [2, "ACCEPTED", 2, "2026-08-06 09:30", 2, "2026-08-08 09:00", 2, 0, "décision finale", 5, "Entretien concluant (73/100)", "STANDARD", null],
            [3, "REJECTED", 2, "2026-08-08 09:00", 2, null, null, 0, "override", 5, "Référence manquante détectée — annulation de l'acceptation", "OVERRIDE", 2]
          ]
        }
      ]
    },
    {
      nom: "7. Emailing",
      tables: [
        {
          num: 29,
          nom: "email_template",
          description: "Un modèle d'email configurable (sujet, corps, variables) réutilisé par les notifications du processus.",
          notes: [],
          colonnes: ["id", "template_key", "subject_template", "body_template", "editable_variables_json", "description", "available_variables", "action_type", "preset_id", "is_active", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "INTERVIEW_INVITE", "Invitation entretien — {{candidate_name}}", "Bonjour {{candidate_name}}, vous êtes invité(e) à un entretien...", null, "Invitation à un entretien", "candidate_name, campaign_title, interview_date", "INTERVIEW", 1, 1, "2026-07-05 09:00", 2, "2026-07-05 09:00", 2, 0, "invitation entretien"],
            [2, "APPLICATION_VERIFICATION", "Vérifiez votre adresse email", "Cliquez sur le lien pour confirmer votre email...", null, "Vérification d'email de candidature", "verification_link, application_id", null, 2, 1, "2026-07-05 09:00", 2, null, null, 0, "vérification email"],
            [3, "QUIZ_INVITE", "Votre quiz technique — {{campaign_title}}", "Bonjour {{candidate_name}}, voici votre lien de quiz...", null, "Invitation à passer le quiz", "candidate_name, campaign_title, quiz_link", "QUIZ", 1, 1, "2026-07-05 09:00", 2, null, null, 0, "invitation quiz"]
          ]
        },
        {
          num: 30,
          nom: "email_template_preset",
          description: "Un gabarit visuel d'email (style et structure HTML) prêt à l'emploi.",
          notes: ["category est un type MySQL enum(...) ; la liste complète est en annexe du doc."],
          colonnes: ["id", "name", "category", "html_structure", "preview_image", "description", "is_deleted", "created_at", "updated_at"],
          lignes: [
            [1, "Moderne", "MODERN", "<table class=\"preset\">...</table>", "/presets/moderne.png", "Style moderne et épuré", 0, "2026-07-05 09:00", null],
            [2, "Classique", "CORPORATE", "<table class=\"preset\">...</table>", null, "Style corporate sobre", 0, "2026-07-05 09:00", null]
          ]
        },
        {
          num: 31,
          nom: "mail_log",
          description: "La trace de chaque email envoyé ou à envoyer : destinataire, événement, statut et contexte métier.",
          notes: ["event_code doit être explicite (APPLICATION_VERIFICATION_EMAIL, INTERVIEW_INVITATION_EMAIL, QUIZ_INVITE_EMAIL...) ; LEGACY_UNCLASSIFIED n'est qu'un défaut de compatibilité."],
          colonnes: ["id", "recipient_email", "application_id", "application_progress_id", "interview_id", "decision_id", "notification_rule_id", "event_code", "requires_confirmation", "confirmed_at", "confirmed_by", "recipient_user_id", "sender_user_id", "email_template_id", "subject", "body_preview", "status", "error_message", "sent_at", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "alice.martin@mail.com", 1, null, null, null, null, "APPLICATION_VERIFICATION_EMAIL", 0, null, null, 4, 2, 2, "Vérifiez votre adresse email", "Cliquez pour confirmer votre email", "SENT", null, "2026-08-02 10:20", "2026-08-02 10:20", null, null, null, 0, "vérification email"],
            [2, "alice.martin@mail.com", 1, 2, null, null, null, "QUIZ_INVITE_EMAIL", 0, null, null, 4, 2, 3, "Votre quiz technique", "Bonjour Alice, voici votre lien de quiz", "SENT", null, "2026-08-03 08:00", "2026-08-03 08:00", null, null, null, 0, "quiz email"],
            [3, "alice.martin@mail.com", 1, 4, 1, null, 2, "INTERVIEW_INVITATION_EMAIL", 1, "2026-08-04 10:00", 2, 4, 2, 1, "Invitation entretien", "Bonjour Alice, vous êtes invité(e) le 05/08", "SENT", null, "2026-08-04 10:05", "2026-08-04 09:00", 2, null, null, 0, "invitation entretien"],
            [4, "alice.martin@mail.com", 1, 5, null, 3, null, "FINAL_DECISION_EMAIL", 0, null, null, 4, 2, 1, "Décision — Alice Martin", "Suite à votre entretien...", "PENDING", null, null, "2026-08-08 09:00", 2, null, null, 0, "décision email"]
          ]
        },
        {
          num: 32,
          nom: "smtp_config",
          description: "La configuration du serveur SMTP utilisé pour envoyer les emails de la plateforme.",
          notes: [],
          colonnes: ["id", "host", "port", "username", "password_encrypted", "smtp_auth", "starttls_enable", "starttls_required", "connection_timeout", "timeout", "write_timeout", "sender_name", "sender_email", "is_active", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "smtp.synelia.com", 587, "noreply", "ENC:AbCdEf...", 1, 1, 0, 5000, 5000, 5000, "Synelia Recrutement", "noreply@synelia.com", 1, "2026-07-01 09:00", 1, "2026-07-01 09:00", 1, 0, "smtp principal"]
          ]
        },
        {
          num: 33,
          nom: "email_verification_tokens",
          description: "Un jeton envoyé par email pour vérifier une adresse (candidature ou compte utilisateur).",
          notes: [],
          colonnes: ["id", "email", "token", "token_type", "expires_at", "is_used", "created_at", "used_at", "application_id", "user_id"],
          lignes: [
            [1, "alice.martin@mail.com", "V6F0-9A2B-11CD", "APPLICATION_VERIFICATION", "2026-08-09 10:20", 1, "2026-08-02 10:20", "2026-08-02 10:25", 1, null],
            [2, "camille.bernard@synelia.com", "PWD-88CC-22DD", "PASSWORD_RESET", "2026-08-12 09:00", 0, "2026-08-11 09:00", null, null, 2]
          ]
        }
      ]
    },
    {
      nom: "8. Utilisateurs & permissions",
      tables: [
        {
          num: 34,
          nom: "user",
          description: "Un utilisateur de la plateforme (recruteur, administrateur, candidat).",
          notes: [],
          colonnes: ["id", "first_name", "last_name", "username", "email", "phone", "password", "is_default_password", "user_role", "is_online", "is_locked", "last_connection_date", "admin_mode", "page_size_preference", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "System", "Admin", "superadmin", "admin@synelia.com", null, "$2a$10$haché...", 0, "SUPER", 0, 0, "2026-08-10 09:00", 0, 10, "2026-06-01 09:00", null, "2026-08-10 09:00", 1, 0, "superadmin"],
            [2, "Camille", "Bernard", "cbernard", "camille.bernard@synelia.com", "0699887766", "$2a$10$haché...", 0, "RECRUITER", 1, 0, "2026-08-08 09:00", 0, 25, "2026-06-15 09:00", 1, null, null, 0, "camille bernard recruteur"],
            [3, "Lucas", "Petit", "lpetit", "lucas.petit@synelia.com", "0611223344", "$2a$10$haché...", 0, "RECRUITER", 0, 0, "2026-08-05 17:00", 0, 10, "2026-06-20 09:00", 1, null, null, 0, "lucas petit recruteur"],
            [4, "Alice", "Martin", "alice.martin", "alice.martin@mail.com", "0612345678", "$2a$10$haché...", 1, "CANDIDATE", 0, 0, null, 0, 10, "2026-08-02 10:15", null, null, null, 0, "alice martin candidate"]
          ]
        },
        {
          num: 35,
          nom: "business_group",
          description: "Un groupe d'utilisateurs (équipe) qui partage des permissions sur le processus.",
          notes: [],
          colonnes: ["id", "group_name", "group_desc", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "Équipe Recrutement Tech", "Groupe des recruteurs du pôle technique", "2026-06-10 09:00", 1, null, null, 0, "recrutement tech"]
          ]
        },
        {
          num: 36,
          nom: "business_group_permission",
          description: "Une permission accordée à un groupe sur une fonctionnalité de la plateforme.",
          notes: [],
          colonnes: ["id", "business_group_id", "functionality", "created_at", "created_by", "updated_at", "updated_by", "is_deleted"],
          lignes: [
            [1, 1, "EVALUATE_INTERVIEW", "2026-06-10 09:00", 1, null, null, 0],
            [2, 1, "MANAGE_CAMPAIGNS", "2026-06-10 09:00", 1, null, null, 0]
          ]
        },
        {
          num: 37,
          nom: "user_business_group",
          description: "L'appartenance d'un utilisateur à un groupe, avec son éventuel rôle de modérateur.",
          notes: [],
          colonnes: ["id", "user_id", "business_group_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "is_moderator"],
          lignes: [
            [1, 2, 1, "2026-06-10 09:00", 1, null, null, 0, 1],
            [2, 3, 1, "2026-06-10 09:00", 1, null, null, 0, 0]
          ]
        },
        {
          num: 38,
          nom: "user_permission_override",
          description: "Une exception individuelle de permission (autorisée ou bloquée) appliquée à un utilisateur précis.",
          notes: [],
          colonnes: ["id", "user_id", "functionality", "is_allowed", "created_at", "created_by", "updated_at", "updated_by", "is_deleted"],
          lignes: [
            [1, 3, "MANAGE_CAMPAIGNS", 0, "2026-06-12 09:00", 1, null, null, 0]
          ]
        },
        {
          num: 39,
          nom: "system_role_permission",
          description: "Une permission accordée à un rôle système (super admin, admin, recruteur).",
          notes: [],
          colonnes: ["id", "system_role", "functionality", "created_at", "created_by", "updated_at", "updated_by", "is_deleted"],
          lignes: [
            [1, "SUPER", "MANAGE_APP_CONFIG", "2026-06-01 09:00", 1, null, null, 0],
            [2, "ADMIN", "MANAGE_CAMPAIGNS", "2026-06-01 09:00", 1, null, null, 0],
            [3, "RECRUITER", "EVALUATE_INTERVIEW", "2026-06-01 09:00", 1, null, null, 0]
          ]
        },
        {
          num: 40,
          nom: "entity_permission",
          description: "Une permission portant sur une entité précise (par exemple un entretien donné), accordée à un utilisateur, un groupe ou un rôle.",
          notes: [],
          colonnes: ["id", "user_id", "business_group_id", "system_role", "entity_type", "entity_id", "permission_key", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, 2, null, null, "CAMPAIGN", 1, "MANAGE_CAMPAIGN", "2026-07-10 10:00", 1, null, null, 0, "permission campagne"],
            [2, 3, null, null, "INTERVIEW", 1, "EVALUATE_INTERVIEW", "2026-08-04 09:00", 2, null, null, 0, "permission entretien"],
            [3, null, 1, null, "CAMPAIGN", 1, "MANAGE_CAMPAIGN", "2026-07-10 10:00", 1, null, null, 0, "permission groupe"]
          ]
        },
        {
          num: 41,
          nom: "group_change_request",
          description: "Une demande d'un utilisateur de changer de groupe, en attente de traitement.",
          notes: [],
          colonnes: ["id", "user_id", "target_group_id", "reason", "status", "requested_at", "processed_at", "processed_by", "created_at", "created_by", "updated_at", "updated_by", "is_deleted"],
          lignes: [
            [1, 3, 1, "Souhaite rejoindre l'équipe recrutement", "PENDING", "2026-08-10 09:00", null, null, "2026-08-10 09:00", 3, null, null, 0]
          ]
        },
        {
          num: 42,
          nom: "invitation_code",
          description: "Un code d'invitation permettant de créer un compte recruteur.",
          notes: [],
          colonnes: ["id", "email", "role", "code", "is_used", "expired_at", "created_by", "created_at", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "nadia.richard@mail.com", "recruiter", "INV-X7Q9Z2", 0, "2026-12-31 23:59", 2, "2026-08-01 09:00", null, null, 0, "invitation recruteur"]
          ]
        }
      ]
    },
    {
      nom: "9. Plateforme transverse",
      tables: [
        {
          num: 43,
          nom: "app_config",
          description: "La configuration générale de la plateforme : nom de l'entreprise, logo, couleurs et activation des comptes candidats.",
          notes: [],
          colonnes: ["id", "config_name", "company_name", "app_link", "logo_html", "primary_color", "color_scheme", "candidate_accounts_enabled", "is_active", "created_at", "updated_at", "created_by", "updated_by", "is_deleted"],
          lignes: [
            [1, "Configuration principale", "Synelia", "https://recrutement.synelia.com", "<span class=\"logo\">Synelia</span>", "#7C3AED", "violet", 1, 1, "2026-06-01 09:00", "2026-06-01 09:00", 1, 1, 0]
          ]
        },
        {
          num: 44,
          nom: "legal_text",
          description: "Les textes légaux (CGU, confidentialité, mentions) affichés aux utilisateurs.",
          notes: [],
          colonnes: ["id", "text_key", "title", "content", "description", "is_active", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "CGU", "Conditions générales d'utilisation", "<p>Conditions d'utilisation de la plateforme...</p>", "CGU de la plateforme", 1, "2026-06-01 09:00", 1, null, null, 0, "cgu"],
            [2, "PRIVACY", "Politique de confidentialité", "<p>Politique de protection des données...</p>", "Protection des données", 1, "2026-06-01 09:00", 1, null, null, 0, "confidentialité"]
          ]
        },
        {
          num: 45,
          nom: "notifications",
          description: "Une notification interne affichée à un utilisateur dans l'application.",
          notes: [],
          colonnes: ["id", "notif_type", "notif_actor", "notif_link", "is_read", "object_table_name", "object_table_id", "user_id", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "search_string"],
          lignes: [
            [1, "INTERVIEW_EVALUATION_SUBMITTED", 3, "/applications/1", 0, "applications", 1, 2, "2026-08-05 15:50", 3, null, null, 0, "évaluation soumise"],
            [2, "DECISION_TAKEN", 2, "/applications/1", 1, "applications", 1, 4, "2026-08-08 09:00", 2, null, null, 0, "décision prise"]
          ]
        },
        {
          num: 46,
          nom: "audit_event",
          description: "La trace d'une action métier : qui a fait quoi, quand, sur quelle entité, avec l'état avant / après.",
          notes: [],
          colonnes: ["id", "application_id", "application_progress_id", "entity_type", "entity_id", "action_type", "actor_user_id", "justification", "before_state_json", "after_state_json", "created_at"],
          lignes: [
            [1, 1, 2, "application_quiz_attempt", "1", "CREATE", 4, null, null, "{\"quiz_status\":\"COMPLETED\",\"score\":4.0}", "2026-08-03 09:09"],
            [2, 1, 5, "decisions", "2", "CREATE", 2, "Décision finale acceptée", null, "{\"decision_type\":\"ACCEPTED\"}", "2026-08-06 09:30"],
            [3, 1, 5, "decisions", "2", "UPDATE", 2, "Override suite à nouvelle information", "{\"decision_type\":\"ACCEPTED\"}", "{\"decision_type\":\"REJECTED\"}", "2026-08-08 09:00"]
          ]
        },
        {
          num: 47,
          nom: "flyway_schema_history",
          description: "L'historique des migrations de schéma appliquées par Flyway (table technique, non métier).",
          notes: [],
          colonnes: ["installed_rank", "version", "description", "type", "script", "checksum", "installed_by", "installed_on", "execution_time", "success"],
          lignes: [
            [1, "1", "init", "SQL", "V1__init.sql", 123456789, "quizapp", "2026-05-01 09:00", 320, 1],
            [2, "2", "add_quiz_tables", "SQL", "V2__add_quiz_tables.sql", 987654321, "quizapp", "2026-05-05 09:00", 180, 1],
            [3, "420", "post_420_migration", "SQL", "V420__post_420_migration.sql", 555666777, "quizapp", "2026-07-30 09:00", 450, 1]
          ]
        }
      ]
    }
  ]
};

/* Métadonnées de clés (fidèle au snapshot : colonne « Clé » du doc).
 * PRI : par défaut la colonne `id` ; exceptions ci-dessous.
 * UNI : colonnes à clé unique.
 * FK : colonnes marquées MUL qui référencent réellement une autre table (colonne -> table cible).
 */
window.BD_EXEMPLES.cles = {
  pri: {
    flyway_schema_history: ["installed_rank"]
  },
  uni: {
    user: ["username", "email"],
    email_verification_tokens: ["token"],
    invitation_code: ["code"],
    email_template: ["template_key"],
    form_version: ["published_form_id"],
    business_group: ["group_name"],
    legal_text: ["text_key"],
    application_quiz_attempt: ["quiz_token"],
    evaluation_grid_template_version: ["content_hash"]
  },
  fk: {
    "pipeline_stage:pipeline_template_id": "pipeline_template",
    "pipeline_stage:evaluation_grid_template_version_id": "evaluation_grid_template_version",
    "pipeline_stage_notification_rule:pipeline_stage_id": "pipeline_stage",
    "pipeline_stage_notification_rule:email_template_id": "email_template",
    "campaigns:pipeline_template_id": "pipeline_template",
    "campaigns:creator_id": "user",
    "campaigns:speciality_id": "specialities",
    "campaign_form:campaign_id": "campaigns",
    "campaign_form:form_id": "form",
    "campaign_form:active_campaign_id": "campaigns",
    "source_token:campaign_id": "campaigns",
    "source_token:form_id": "form",
    "specialities:department_id": "departments",
    "applications:abandoned_from_application_progress_id": "application_progress",
    "applications:source_token_id": "source_token",
    "applications:form_version_id": "form_version",
    "applications:current_application_progress_id": "application_progress",
    "applications:current_pipeline_stage_id": "pipeline_stage",
    "application_progress:application_id": "applications",
    "application_progress:pipeline_stage_id": "pipeline_stage",
    "candidate_token:application_id": "applications",
    "candidate_ask:application_id": "applications",
    "form_version:form_id": "form",
    "form_questions:form_version_id": "form_version",
    "form_questions:question_id": "question",
    "question:speciality_id": "specialities",
    "answer:question_id": "question",
    "application_quiz_attempt:application_id": "applications",
    "application_quiz_attempt:application_progress_id": "application_progress",
    "application_quiz_attempt:form_version_id": "form_version",
    "candidate_answer:application_quiz_attempt_id": "application_quiz_attempt",
    "candidate_answer:question_id": "question",
    "candidate_answer:answer_id": "answer",
    "interviews:application_progress_id": "application_progress",
    "candidate_interview:interview_id": "interviews",
    "interview_participant:user_id": "user",
    "interview_participant:interview_id": "interviews",
    "evaluations:candidate_interview_id": "candidate_interview",
    "evaluations:interview_participant_id": "interview_participant",
    "evaluation_item:evaluation_id": "evaluations",
    "evaluation_item:evaluation_grid_template_item_id": "evaluation_grid_template_item",
    "evaluation_grid_template_version:evaluation_grid_template_id": "evaluation_grid_template",
    "evaluation_grid_template_item:evaluation_grid_template_version_id": "evaluation_grid_template_version",
    "decisions:user_id": "user",
    "decisions:application_progress_id": "application_progress",
    "decisions:cancels_decision_id": "decisions",
    "mail_log:application_id": "applications",
    "mail_log:application_progress_id": "application_progress",
    "mail_log:interview_id": "interviews",
    "mail_log:decision_id": "decisions",
    "mail_log:notification_rule_id": "pipeline_stage_notification_rule",
    "mail_log:recipient_user_id": "user",
    "mail_log:sender_user_id": "user",
    "mail_log:email_template_id": "email_template",
    "email_verification_tokens:application_id": "applications",
    "email_verification_tokens:user_id": "user",
    "business_group_permission:business_group_id": "business_group",
    "user_business_group:user_id": "user",
    "user_business_group:business_group_id": "business_group",
    "user_permission_override:user_id": "user",
    "entity_permission:user_id": "user",
    "entity_permission:business_group_id": "business_group",
    "group_change_request:user_id": "user",
    "group_change_request:target_group_id": "business_group",
    "group_change_request:processed_by": "user",
    "invitation_code:created_by": "user",
    "notifications:user_id": "user",
    "audit_event:application_id": "applications",
    "audit_event:application_progress_id": "application_progress"
  }
};
