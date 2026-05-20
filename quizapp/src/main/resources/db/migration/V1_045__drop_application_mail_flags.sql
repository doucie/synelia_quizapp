-- V1_045 : suppression des anciens flags mail decisions portes par applications

ALTER TABLE applications
    DROP COLUMN pre_screen_decision_mail_sent,
    DROP COLUMN final_decision_mail_sent;