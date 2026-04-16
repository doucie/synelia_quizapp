-- V1_011: Ajouter le champ optionnel pipeline_stage_id à la table decisions
-- Permet de lier une décision à une étape précise du pipeline.
-- Les anciennes décisions (sans pipeline_stage_id) restent valides.

ALTER TABLE decisions
    ADD COLUMN pipeline_stage_id INT UNSIGNED NULL AFTER search_string;

ALTER TABLE decisions
    ADD CONSTRAINT fk_decisions_pipeline_stage
    FOREIGN KEY (pipeline_stage_id) REFERENCES pipeline_stage(id);
