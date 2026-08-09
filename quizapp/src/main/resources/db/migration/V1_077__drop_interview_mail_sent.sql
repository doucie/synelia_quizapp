-- =============================================================================
-- V1_077 : Drop interviews.interview_mail_sent (Phase 6, arbitrage BA n°11)
--   Retrait physique de la derniere colonne legacy restante de la liste §7
--   du doc cible (`quizapp_db_cible_post_420_migration.md`, ligne 362).
--   Le flag est derive de `mail_log` (eventCode INTERVIEW_INVITATION_EMAIL,
--   status SENT) dans InterviewsBusiness.interviewInvitationMailAlreadySent ;
--   l'entite JPA Interviews ne mappe plus cette colonne.
--   PREREQUIS : V1_076 appliquee (phase 6) ; backend 0 reference
--   (rg interviewMailSent|interview_mail_sent = 0 dans quizapp/src).
--   ATTENTION : DDL MySQL NON transactionnel. Flyway: une migration appliquee
--   est immuable.
-- =============================================================================

DROP PROCEDURE IF EXISTS v1_077_assert_column_exists;
DELIMITER //
CREATE PROCEDURE v1_077_assert_column_exists()
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'interviews'
          AND COLUMN_NAME = 'interview_mail_sent'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_077: interviews.interview_mail_sent absent (etat inattendu)';
    END IF;
END//
DELIMITER ;
CALL v1_077_assert_column_exists();
DROP PROCEDURE v1_077_assert_column_exists;

ALTER TABLE interviews DROP COLUMN interview_mail_sent;
