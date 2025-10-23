-- Migration pour mettre à jour la table interviews

-- Renommer interview_start en interview_date
ALTER TABLE interviews 
CHANGE COLUMN interview_start interview_date DATETIME NOT NULL;

-- Supprimer interview_end et ajouter interview_status
ALTER TABLE interviews 
DROP COLUMN interview_end;

ALTER TABLE interviews 
ADD COLUMN interview_status ENUM('PENDING', 'STARTED', 'OVER', 'POSTPONED', 'ARCHIVED') NOT NULL DEFAULT 'PENDING' AFTER interview_date;

-- Ajouter meet_link
ALTER TABLE interviews 
ADD COLUMN meet_link VARCHAR(500) NULL AFTER interview_status;

-- Modifier interview_type
ALTER TABLE interviews 
MODIFY COLUMN interview_type ENUM('IN_PERSON', 'ONLINE') NOT NULL;

-- Ajouter interview_note et interview_mail_sent
ALTER TABLE interviews 
ADD COLUMN interview_note TEXT NULL AFTER meet_link,
ADD COLUMN interview_mail_sent BOOLEAN NOT NULL DEFAULT FALSE AFTER interview_note;
