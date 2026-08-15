-- =============================================================================
-- V1_083 : Évolution 450 Vague 1 — Limite de tentatives quiz par campagne
--   - campaigns.max_attempts : nombre maximal de tentatives quiz réellement
--     lancées par candidat (défaut 1). Ne remplace PAS max_apply qui reste le
--     plafond de candidatures (candidats) par campagne.
--   - NULL = politique par défaut (1), cohérent avec l'absence de valeur.
-- =============================================================================

ALTER TABLE campaigns
    ADD COLUMN max_attempts INT NULL AFTER max_apply;
