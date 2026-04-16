-- =============================================================================
-- V1_009 : Données par défaut — template de pipeline standard
-- =============================================================================

-- 1. Template par défaut
INSERT INTO pipeline_template (template_name, template_desc, is_default, is_active, is_locked, created_at, is_deleted, search_string)
VALUES ('Flux standard', 'Pipeline de recrutement par défaut avec les étapes classiques', 1, 1, 0, NOW(), 0,
        'flux standard pipeline recrutement défaut');

SET @template_id = LAST_INSERT_ID();

-- 2. Étapes du template par défaut
INSERT INTO pipeline_stage (pipeline_template_id, stage_type, stage_label, stage_order, is_required, is_eliminatory, created_at, is_deleted, search_string) VALUES
(@template_id, 'CANDIDATURE',  'Réception candidature',   1, 1, 0, NOW(), 0, 'réception candidature'),
(@template_id, 'QUIZ',         'Quiz de présélection',    2, 1, 1, NOW(), 0, 'quiz présélection'),
(@template_id, 'PRESELECTION', 'Pré-sélection dossier',   3, 1, 1, NOW(), 0, 'pré-sélection dossier'),
(@template_id, 'INTERVIEW',    'Entretien',               4, 0, 0, NOW(), 0, 'entretien'),
(@template_id, 'EVALUATION',   'Évaluation',              5, 0, 0, NOW(), 0, 'évaluation'),
(@template_id, 'DECISION',     'Décision finale',         6, 1, 1, NOW(), 0, 'décision finale');
