-- =============================================================================
-- V1_075 : Politique email des etapes deportee vers pipeline_stage_notification_rule
--   Porte sur : pipeline_stage.email_required / email_automatic (remplaces par
--     pipeline_stage_notification_rule.is_required / is_automatic) ;
--     application_progress.mail_sent (remplace par mail_log.status = 'SENT').
--   PREREQUIS : V1_074 appliquee (phase 4) ET phase 5 backend+front verrouilles
--     (DecisionBusiness/InterviewsBusiness/ApplicationProgressBusiness lisent
--     pipeline_stage_notification_rule et mail_log ; code Java sans
--     email_required/email_automatic/mail_sent).
--   ORDRE STRICT : seed des regles PUIS backfill mail_log PUIS DROP des colonnes.
--   ATTENTION : DDL MySQL NON transactionnel (chaque ALTER auto-commit). A
--   tester sur une copie de la BD avant application sur la BD partagee
--   (Flyway: une migration appliquee est immuable).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. COMPTAGE AVANT : etat des colonnes legacy ciblees + regles existantes
-- -----------------------------------------------------------------------------
SELECT 'pipeline_stage' AS table_name,
       COUNT(*) AS total,
       SUM(CASE WHEN email_required = 1 THEN 1 ELSE 0 END) AS email_required_1,
       SUM(CASE WHEN email_automatic = 1 THEN 1 ELSE 0 END) AS email_automatic_1
FROM pipeline_stage;

SELECT 'application_progress' AS table_name,
       COUNT(*) AS total,
       SUM(CASE WHEN mail_sent = 1 THEN 1 ELSE 0 END) AS mail_sent_1
FROM application_progress;

SELECT 'pipeline_stage_notification_rule' AS table_name,
       COUNT(*) AS total,
       SUM(CASE WHEN trigger_code = 'STAGE_EMAIL' THEN 1 ELSE 0 END) AS stage_email_rules
FROM pipeline_stage_notification_rule;

-- -----------------------------------------------------------------------------
-- 1. GARDE-FOU : verifie la presence des colonnes legacy ciblees, l'absence de
--    regles deja seudees et la conformite du mapping email_template
--    (echec explicite si l'etat ne correspond pas au schema attendu)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS v1_075_assert_backfill_ready;
DELIMITER //
CREATE PROCEDURE v1_075_assert_backfill_ready()
BEGIN
    DECLARE nb_missing INT;

    SELECT COUNT(*) INTO nb_missing
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND ( (TABLE_NAME = 'pipeline_stage'
             AND COLUMN_NAME IN ('email_required', 'email_automatic'))
         OR (TABLE_NAME = 'application_progress'
             AND COLUMN_NAME = 'mail_sent') );
    IF nb_missing <> 3 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_075: colonnes ciblees manquantes ou deja migrees (etat inattendu)';
    END IF;

    IF EXISTS (SELECT 1 FROM pipeline_stage_notification_rule
               WHERE trigger_code = 'STAGE_EMAIL') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_075: des regles STAGE_EMAIL existent deja (seed non idempotent)';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (SELECT 'PRE_SCREEN_DECISION' AS action_type) expected
        LEFT JOIN email_template et
               ON et.action_type = expected.action_type
              AND et.is_deleted = 0
        WHERE et.id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_075: template email PRE_SCREEN_DECISION introuvable';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (SELECT 'FINAL_DECISION' AS action_type UNION SELECT 'INTERVIEW_INVITE' AS action_type) expected
        LEFT JOIN email_template et
               ON et.action_type = expected.action_type
              AND et.is_deleted = 0
        WHERE et.id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_075: template email FINAL_DECISION/INTERVIEW_INVITE introuvable';
    END IF;
END//
DELIMITER ;
CALL v1_075_assert_backfill_ready();
DROP PROCEDURE v1_075_assert_backfill_ready;

-- -----------------------------------------------------------------------------
-- 2. SEED pipeline_stage_notification_rule (1 regle/etape avec politique email)
--    trigger_code='STAGE_EMAIL', outcome_code=stage_type ; is_required/
--    is_automatic copies depuis les colonnes legacy ; email_template_id resolu
--    par action_type ; requires_manual_confirmation=0 (flux auto existants).
--    Les etapes SANS politique email (email_required=0 ET email_automatic=0)
--    ne recoivent AUCUNE regle : en l'absence de regle, le backend
--    (DecisionBusiness / InterviewsBusiness) ne considere aucun email requis.
-- -----------------------------------------------------------------------------
INSERT INTO pipeline_stage_notification_rule
    (pipeline_stage_id, trigger_code, outcome_code, email_template_id,
     is_required, is_automatic, requires_manual_confirmation,
     created_at, updated_at, is_deleted)
SELECT
    ps.id,
    'STAGE_EMAIL',
    ps.stage_type,
    CASE ps.stage_type
        WHEN 'PRESELECTION' THEN (SELECT et.id FROM email_template et WHERE et.action_type = 'PRE_SCREEN_DECISION' AND et.is_deleted = 0 LIMIT 1)
        WHEN 'INTERVIEW'    THEN (SELECT et.id FROM email_template et WHERE et.action_type = 'INTERVIEW_INVITE' AND et.is_deleted = 0 LIMIT 1)
        WHEN 'DECISION'     THEN (SELECT et.id FROM email_template et WHERE et.action_type = 'FINAL_DECISION' AND et.is_deleted = 0 LIMIT 1)
        ELSE NULL
    END,
    ps.email_required,
    ps.email_automatic,
    0,
    NOW(),
    NOW(),
    ps.is_deleted
FROM pipeline_stage ps
WHERE ps.email_required = 1 OR ps.email_automatic = 1;

-- -----------------------------------------------------------------------------
-- 3. BACKFILL application_progress.mail_sent=1 -> mail_log (status='SENT')
--    Garde-fou : aucune ligne SENT existante pour la meme progression (evite
--    les doublons si le contexte mail est deja journalise). En BD reelle
--    actuelle : 0 ligne mail_sent=1 (garde conservee pour la copie/test).
-- -----------------------------------------------------------------------------
INSERT INTO mail_log
    (recipient_email, application_id, application_progress_id,
     event_code, requires_confirmation, subject, status, sent_at,
     created_at, updated_at, is_deleted)
SELECT
    a.candidate_email,
    ap.application_id,
    ap.id,
    CASE ps.stage_type
        WHEN 'PRESELECTION' THEN 'PRE_SCREEN_DECISION_EMAIL'
        WHEN 'INTERVIEW'    THEN 'INTERVIEW_INVITATION_EMAIL'
        WHEN 'DECISION'     THEN 'FINAL_DECISION_EMAIL'
        ELSE 'LEGACY_STAGE_EMAIL'
    END,
    0,
    CONCAT('Notification de ', ps.stage_label),
    'SENT',
    COALESCE(ap.completed_at, ap.updated_at, NOW()),
    NOW(),
    NOW(),
    0
FROM application_progress ap
JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
JOIN applications a ON a.id = ap.application_id
WHERE ap.mail_sent = 1
  AND ap.is_deleted = 0
  AND NOT EXISTS (
      SELECT 1 FROM mail_log existing
      WHERE existing.application_progress_id = ap.id
        AND existing.status = 'SENT'
  );

-- -----------------------------------------------------------------------------
-- 4. GARDE-FOU POST-BACKFILL : toute progression mail_sent=1 doit avoir sa
--    trace mail_log SENT ; toute etape avec politique doit avoir sa regle
--    (echec explicite sinon -> migration abandonnee)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS v1_075_assert_backfill_done;
DELIMITER //
CREATE PROCEDURE v1_075_assert_backfill_done()
BEGIN
    IF EXISTS (
        SELECT 1
        FROM application_progress ap
        WHERE ap.mail_sent = 1
          AND ap.is_deleted = 0
          AND NOT EXISTS (
              SELECT 1 FROM mail_log ml
              WHERE ml.application_progress_id = ap.id
                AND ml.status = 'SENT'
          )
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_075: mail_sent sans trace mail_log SENT (perte de donnees)';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pipeline_stage ps
        WHERE (ps.email_required = 1 OR ps.email_automatic = 1)
          AND NOT EXISTS (
              SELECT 1 FROM pipeline_stage_notification_rule r
              WHERE r.pipeline_stage_id = ps.id
                AND r.trigger_code = 'STAGE_EMAIL'
          )
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_075: etape avec politique email sans regle seudee (seed incomplet)';
    END IF;
END//
DELIMITER ;
CALL v1_075_assert_backfill_done();
DROP PROCEDURE v1_075_assert_backfill_done;

-- -----------------------------------------------------------------------------
-- 5. DROP DES COLONNES LEGACY
-- -----------------------------------------------------------------------------
ALTER TABLE pipeline_stage
    DROP COLUMN email_required,
    DROP COLUMN email_automatic;

ALTER TABLE application_progress
    DROP COLUMN mail_sent;

-- -----------------------------------------------------------------------------
-- 6. COMPTAGE APRES : controle que les colonnes legacy ont disparu et que les
--    regles seudees sont en place
-- -----------------------------------------------------------------------------
SELECT 'colonnes_restantes' AS etat,
       COUNT(*) AS nb_colonnes_legacy_encore_presentes
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND ( (TABLE_NAME = 'pipeline_stage'
         AND COLUMN_NAME IN ('email_required', 'email_automatic'))
     OR (TABLE_NAME = 'application_progress'
         AND COLUMN_NAME = 'mail_sent') );

SELECT 'pipeline_stage_notification_rule (STAGE_EMAIL)' AS etat,
       COUNT(*) AS nb_regles,
       COUNT(DISTINCT pipeline_stage_id) AS nb_etapes_couvertes
FROM pipeline_stage_notification_rule
WHERE trigger_code = 'STAGE_EMAIL'
  AND is_deleted = 0;

SELECT 'mail_log SENT lie a une progression' AS etat,
       COUNT(*) AS nb
FROM mail_log
WHERE status = 'SENT'
  AND application_progress_id IS NOT NULL;
