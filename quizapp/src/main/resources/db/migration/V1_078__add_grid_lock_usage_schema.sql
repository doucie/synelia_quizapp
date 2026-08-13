-- =============================================================================
-- V1_078 : socle schema phase A du versionnage des grilles par verrou d'usage
-- Migration strictement additive : aucune suppression a ce stade.
-- La table pipeline_stage_evaluation_criterion reste en place jusqu'en V1_080.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Lien etape -> version de grille (une etape d'evaluation = une grille)
-- -----------------------------------------------------------------------------
ALTER TABLE pipeline_stage
    ADD COLUMN evaluation_grid_template_version_id INT UNSIGNED NULL,
    ADD KEY idx_ps_grid_version (evaluation_grid_template_version_id),
    ADD CONSTRAINT fk_ps_grid_version FOREIGN KEY (evaluation_grid_template_version_id)
        REFERENCES evaluation_grid_template_version(id);

-- -----------------------------------------------------------------------------
-- 2. Deduplication par contenu et verrou d'usage sur la version de grille
-- -----------------------------------------------------------------------------
-- content_hash : empreinte SHA-256 (hex) de l'ensemble ordonne des items,
-- sur forme canonique, SANS l'id de la version. NULL tant que le backfill
-- (V1_079) n'a pas calcule les empreintes ; le UNIQUE autorise plusieurs NULL.
ALTER TABLE evaluation_grid_template_version
    ADD COLUMN content_hash CHAR(64) NULL,
    ADD UNIQUE KEY uk_egtv_content_hash (content_hash);

-- locked_at : pose transactionnellement a la premiere evaluation_item reellement
-- saisie qui reference un item de la version. is_locked = locked_at IS NOT NULL.
ALTER TABLE evaluation_grid_template_version
    ADD COLUMN locked_at DATETIME NULL;

-- -----------------------------------------------------------------------------
-- 3. evaluation_item : lien vers l'item de grille (colonne nullable pour
--    l'instant ; le backfill la renseigne puis la bascule la rend NOT NULL)
-- -----------------------------------------------------------------------------
ALTER TABLE evaluation_item
    ADD COLUMN evaluation_grid_template_item_id INT UNSIGNED NULL,
    ADD KEY idx_ei_grid_item (evaluation_grid_template_item_id),
    ADD CONSTRAINT fk_ei_grid_item FOREIGN KEY (evaluation_grid_template_item_id)
        REFERENCES evaluation_grid_template_item(id);
