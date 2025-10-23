-- V1_025__update_application_status_enum.sql
-- Met à jour l'enum application_status avec les nouveaux statuts

-- Modifier l'enum application_status
ALTER TABLE applications
MODIFY COLUMN application_status ENUM(
    'PENDING',
    'PENDING_ARCHIVED',
    'SUBMITTED',
    'PRE_SCREEN_ACCEPTED',
    'PRE_SCREEN_REJECTED',
    'PRE_SCREEN_REJECTED_ARCHIVED',
    'INTERVIEWING',
    'FINAL_ACCEPTED',
    'FINAL_ACCEPTED_ARCHIVED',
    'FINAL_REJECTED',
    'FINAL_REJECTED_ARCHIVED'
) DEFAULT 'PENDING' NOT NULL;

-- Ajouter les nouveaux champs
ALTER TABLE applications
ADD COLUMN application_abandoned BOOLEAN DEFAULT FALSE NOT NULL COMMENT 'Candidature abandonnée par le candidat',
ADD COLUMN pre_screen_decision_mail_sent BOOLEAN DEFAULT FALSE NOT NULL COMMENT 'Email de décision pré-sélection envoyé',
ADD COLUMN final_decision_mail_sent BOOLEAN DEFAULT FALSE NOT NULL COMMENT 'Email de décision finale envoyé';
