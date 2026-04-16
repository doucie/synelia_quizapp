-- =============================================================================
-- V1_010 : Rétrocompatibilité — migrer les campagnes et candidatures existantes
-- vers le pipeline par défaut
-- =============================================================================

-- 1. Assigner le template par défaut à toutes les campagnes existantes
UPDATE campaigns
SET pipeline_template_id = (SELECT id FROM pipeline_template WHERE is_default = 1 LIMIT 1)
WHERE pipeline_template_id IS NULL;

-- 2. Créer les application_progress pour chaque candidature existante
-- On récupère les IDs des stages du template par défaut
SET @tpl_id = (SELECT id FROM pipeline_template WHERE is_default = 1 LIMIT 1);
SET @stage_candidature  = (SELECT id FROM pipeline_stage WHERE pipeline_template_id = @tpl_id AND stage_type = 'CANDIDATURE' LIMIT 1);
SET @stage_quiz         = (SELECT id FROM pipeline_stage WHERE pipeline_template_id = @tpl_id AND stage_type = 'QUIZ' LIMIT 1);
SET @stage_preselection = (SELECT id FROM pipeline_stage WHERE pipeline_template_id = @tpl_id AND stage_type = 'PRESELECTION' LIMIT 1);
SET @stage_interview    = (SELECT id FROM pipeline_stage WHERE pipeline_template_id = @tpl_id AND stage_type = 'INTERVIEW' LIMIT 1);
SET @stage_evaluation   = (SELECT id FROM pipeline_stage WHERE pipeline_template_id = @tpl_id AND stage_type = 'EVALUATION' LIMIT 1);
SET @stage_decision     = (SELECT id FROM pipeline_stage WHERE pipeline_template_id = @tpl_id AND stage_type = 'DECISION' LIMIT 1);

-- 2a. PENDING / SUBMITTED → CANDIDATURE=PASSED, reste=PENDING
INSERT INTO application_progress (application_id, pipeline_stage_id, progress_status, created_at, is_deleted)
SELECT a.id, @stage_candidature, 'PASSED', NOW(), 0
FROM applications a WHERE a.is_deleted = 0 AND a.application_status IN ('pending', 'submitte');

INSERT INTO application_progress (application_id, pipeline_stage_id, progress_status, created_at, is_deleted)
SELECT a.id, s.id, 'PENDING', NOW(), 0
FROM applications a
CROSS JOIN pipeline_stage s
WHERE a.is_deleted = 0
  AND a.application_status IN ('pending', 'submitte')
  AND s.pipeline_template_id = @tpl_id
  AND s.stage_type != 'CANDIDATURE';

-- 2b. PRE_SCREEN_ACCEPTED → CANDIDATURE=PASSED, QUIZ=PASSED, PRESELECTION=PASSED, reste=PENDING
INSERT INTO application_progress (application_id, pipeline_stage_id, progress_status, created_at, is_deleted)
SELECT a.id, @stage_candidature, 'PASSED', NOW(), 0
FROM applications a WHERE a.is_deleted = 0 AND a.application_status = 'accepted';

INSERT INTO application_progress (application_id, pipeline_stage_id, progress_status, created_at, is_deleted)
SELECT a.id, @stage_quiz, 'PASSED', NOW(), 0
FROM applications a WHERE a.is_deleted = 0 AND a.application_status = 'accepted';

INSERT INTO application_progress (application_id, pipeline_stage_id, progress_status, created_at, is_deleted)
SELECT a.id, @stage_preselection, 'PASSED', NOW(), 0
FROM applications a WHERE a.is_deleted = 0 AND a.application_status = 'accepted';

INSERT INTO application_progress (application_id, pipeline_stage_id, progress_status, created_at, is_deleted)
SELECT a.id, s.id, 'PENDING', NOW(), 0
FROM applications a
CROSS JOIN pipeline_stage s
WHERE a.is_deleted = 0
  AND a.application_status = 'accepted'
  AND s.pipeline_template_id = @tpl_id
  AND s.stage_type NOT IN ('CANDIDATURE', 'QUIZ', 'PRESELECTION');

-- 2c. PRE_SCREEN_REJECTED → CANDIDATURE=PASSED, QUIZ=PASSED, PRESELECTION=FAILED, reste=SKIPPED
INSERT INTO application_progress (application_id, pipeline_stage_id, progress_status, created_at, is_deleted)
SELECT a.id, @stage_candidature, 'PASSED', NOW(), 0
FROM applications a WHERE a.is_deleted = 0 AND a.application_status = 'rejected';

INSERT INTO application_progress (application_id, pipeline_stage_id, progress_status, created_at, is_deleted)
SELECT a.id, @stage_quiz, 'PASSED', NOW(), 0
FROM applications a WHERE a.is_deleted = 0 AND a.application_status = 'rejected';

INSERT INTO application_progress (application_id, pipeline_stage_id, progress_status, created_at, is_deleted)
SELECT a.id, @stage_preselection, 'FAILED', NOW(), 0
FROM applications a WHERE a.is_deleted = 0 AND a.application_status = 'rejected';

INSERT INTO application_progress (application_id, pipeline_stage_id, progress_status, created_at, is_deleted)
SELECT a.id, s.id, 'SKIPPED', NOW(), 0
FROM applications a
CROSS JOIN pipeline_stage s
WHERE a.is_deleted = 0
  AND a.application_status = 'rejected'
  AND s.pipeline_template_id = @tpl_id
  AND s.stage_type NOT IN ('CANDIDATURE', 'QUIZ', 'PRESELECTION');

-- 3. Verrouiller le template par défaut s'il y a des application_progress
UPDATE pipeline_template
SET is_locked = 1
WHERE id = @tpl_id
  AND EXISTS (SELECT 1 FROM application_progress ap
              JOIN pipeline_stage ps ON ap.pipeline_stage_id = ps.id
              WHERE ps.pipeline_template_id = @tpl_id);
