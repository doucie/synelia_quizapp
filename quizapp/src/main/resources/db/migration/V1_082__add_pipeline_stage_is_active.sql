-- =============================================================================
-- V1_082 : Versionnage fin des étapes (440 Lot B)
--   - pipeline_stage.is_active : révision active d'un slot
--   - active_slot (colonne générée) = IF(is_active, stage_order, NULL)
--   - UNIQUE(pipeline_template_id, active_slot) : au plus une révision active
--     par slot ; les NULL (étapes inactives) ne sont pas contraints
--   - Backfill : toutes les étapes existantes sont actives (comportement inchangé)
-- =============================================================================

-- 1. Index de lecture (template, stage_order) créé AVANT le drop de
--    uk_stage_order : il reprend le support de la FK fk_stage_template
--    (pipeline_template_id) côté enfant, sinon MySQL refuse le drop (1553).
ALTER TABLE pipeline_stage
    ADD KEY idx_ps_template_stage_order (pipeline_template_id, stage_order);

-- 2. L'unicité globale (template, stage_order) cède la place à une unicité
--    sur les révisions actives uniquement.
ALTER TABLE pipeline_stage DROP INDEX uk_stage_order;

-- 3. Révision active d'un slot.
ALTER TABLE pipeline_stage
    ADD COLUMN is_active BIT(1) NOT NULL DEFAULT 1 AFTER stage_order;

-- 4. Colonne générée : NULL quand l'étape est inactive, stage_order sinon.
--    (pas de clause NULL : la grammaire MySQL des colonnes générées ne
--     l'accepte pas ; la colonne est nullable par défaut)
ALTER TABLE pipeline_stage
    ADD COLUMN active_slot INT
    GENERATED ALWAYS AS (IF(is_active, stage_order, NULL)) STORED;

-- 5. Au plus une révision active par slot.
ALTER TABLE pipeline_stage
    ADD UNIQUE KEY uk_ps_template_active_slot (pipeline_template_id, active_slot);
