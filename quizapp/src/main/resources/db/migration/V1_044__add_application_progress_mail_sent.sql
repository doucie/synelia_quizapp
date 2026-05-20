-- V1_044 : suivi d'envoi mail par etape de pipeline

ALTER TABLE application_progress
    ADD COLUMN mail_sent BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE application_progress ap
JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
JOIN applications a ON a.id = ap.application_id
SET ap.mail_sent = TRUE
WHERE UPPER(ps.stage_type) = 'PRESELECTION'
  AND COALESCE(a.pre_screen_decision_mail_sent, FALSE) = TRUE;

UPDATE application_progress ap
JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
JOIN applications a ON a.id = ap.application_id
SET ap.mail_sent = TRUE
WHERE UPPER(ps.stage_type) = 'DECISION'
  AND COALESCE(a.final_decision_mail_sent, FALSE) = TRUE;

UPDATE application_progress ap
JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
JOIN interviews i ON i.application_id = ap.application_id
SET ap.mail_sent = TRUE
WHERE UPPER(ps.stage_type) = 'INTERVIEW'
  AND COALESCE(i.interview_mail_sent, FALSE) = TRUE
  AND COALESCE(i.is_deleted, FALSE) = FALSE;