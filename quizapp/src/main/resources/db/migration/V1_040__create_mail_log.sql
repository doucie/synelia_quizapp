-- V1_040 : creation de la table mail_log (D-021).
--
-- Journal des emails envoyes : succes/echec SMTP, destinataire, template,
-- horodatage, message d'erreur. Sert de source de verite pour replacer les
-- flags `pre_screen_decision_mail_sent` / `final_decision_mail_sent` /
-- `interview_mail_sent` portes par `applications` (cf. LAPPLIC-042).
--
-- Refs : L-audit-99-mail_log.md LMAILOG-001.

CREATE TABLE IF NOT EXISTS mail_log (
    id                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    recipient_email    VARCHAR(255)  NOT NULL,
    recipient_user_id  INT UNSIGNED  NULL,
    sender_user_id     INT UNSIGNED  NULL,
    email_template_id  INT UNSIGNED  NULL,
    subject            VARCHAR(500)  NOT NULL,
    body_preview       TEXT          NULL,
    status             VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    error_message      TEXT          NULL,
    sent_at            DATETIME      NULL,
    created_at         DATETIME      NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         INT           NULL,
    updated_at         DATETIME      NULL,
    updated_by         INT           NULL,
    is_deleted         TINYINT(1)    NOT NULL DEFAULT 0,
    search_string      TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_mail_log_recipient_user FOREIGN KEY (recipient_user_id) REFERENCES `user`(id),
    CONSTRAINT fk_mail_log_sender_user    FOREIGN KEY (sender_user_id)    REFERENCES `user`(id),
    CONSTRAINT fk_mail_log_email_template FOREIGN KEY (email_template_id) REFERENCES email_template(id),
    INDEX idx_mail_log_recipient_email (recipient_email),
    INDEX idx_mail_log_status          (status),
    INDEX idx_mail_log_sent_at         (sent_at),
    INDEX idx_mail_log_recipient_user  (recipient_user_id),
    INDEX idx_mail_log_email_template  (email_template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
