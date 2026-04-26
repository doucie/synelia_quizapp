-- V1_019 : Ajout des champs pour le déclinement d'entretien et demande de date alternative
ALTER TABLE candidate_interview
    ADD COLUMN decline_reason VARCHAR(500) DEFAULT NULL AFTER search_string,
    ADD COLUMN alternative_date_requested DATETIME DEFAULT NULL AFTER decline_reason;
