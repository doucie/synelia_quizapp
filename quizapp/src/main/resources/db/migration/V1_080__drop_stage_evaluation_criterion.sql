-- =============================================================================
-- V1_080 : Phase D - suppression de pipeline_stage_evaluation_criterion
--
-- Pre-requis : V1_079 (backfill Phase B) applique et controles verts, bascule
-- Phase C en production (aucune lecture/ecriture application ne reference plus
-- la table : entite/repo/business supprimes).
--
--   1. pre-controles : aucune evaluation_item sans item de grille, aucun
--      orphelin (SIGNAL -> migration annulee) ;
--   2. evaluation_item : drop FK fk_evaluation_item_criterion, index
--      idx_evaluation_item_criterion, UNIQUE uk_evaluation_item_criterion et
--      colonne pipeline_stage_evaluation_criterion_id ; le NOUVEAU UNIQUE
--      (evaluation_id, evaluation_grid_template_item_id) est cree AVANT le drop
--      de l'ancien (il couvre la FK fk_evaluation_item_evaluation via
--      evaluation_id, sinon MySQL refuserait le drop de l'ancien index) ;
--      passage evaluation_grid_template_item_id NOT NULL ;
--   3. drop legacy_criterion_mapping puis pipeline_stage_evaluation_criterion ;
--   4. controles finaux (tables absentes, colonne NOT NULL, uniques presents)
--      + trace d'audit.
--
-- Toutes les suppressions sont conditionnelles (information_schema) : un re-run
-- apres echec partiel repart proprement sans erreur.
-- Sur le jeu de reference (tables sources vides), no-op propre.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Pre-controles (le backfill Phase B doit avoir tout rebranche ; un reliquat
--    impose un arbitrage manuel AVANT de rendre la colonne NOT NULL)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS phase_d_precheck;

DELIMITER $$
CREATE PROCEDURE phase_d_precheck()
BEGIN
    IF (SELECT COUNT(*) FROM evaluation_item
        WHERE evaluation_grid_template_item_id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_D : evaluation_item sans evaluation_grid_template_item_id, arbitrage manuel requis avant Phase D';
    END IF;

    IF (SELECT COUNT(*) FROM evaluation_item ei
        LEFT JOIN evaluation_grid_template_item i ON i.id = ei.evaluation_grid_template_item_id
        WHERE ei.evaluation_grid_template_item_id IS NOT NULL AND i.id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_D : evaluation_item orpheline (item de grille inconnu)';
    END IF;

    IF (SELECT COUNT(*) FROM evaluation_grid_template_item i
        LEFT JOIN evaluation_grid_template_version v ON v.id = i.evaluation_grid_template_version_id
        WHERE i.is_deleted = 0 AND v.id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_D : item de grille actif sans version parente';
    END IF;
END$$
DELIMITER ;

CALL phase_d_precheck();
DROP PROCEDURE IF EXISTS phase_d_precheck;

-- -----------------------------------------------------------------------------
-- 2. evaluation_item : bascule complete sur evaluation_grid_template_item_id
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS phase_d_apply;

DELIMITER $$
CREATE PROCEDURE phase_d_apply()
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.referential_constraints
               WHERE constraint_schema = DATABASE()
                 AND constraint_name = 'fk_evaluation_item_criterion') THEN
        ALTER TABLE evaluation_item DROP FOREIGN KEY fk_evaluation_item_criterion;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.statistics
               WHERE table_schema = DATABASE() AND table_name = 'evaluation_item'
                 AND index_name = 'idx_evaluation_item_criterion') THEN
        ALTER TABLE evaluation_item DROP INDEX idx_evaluation_item_criterion;
    END IF;

    -- nouveau UNIQUE cree en premier : il couvre la FK fk_evaluation_item_evaluation
    -- (evaluation_id) pendant la suppression de l'ancien unique
    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics
                   WHERE table_schema = DATABASE() AND table_name = 'evaluation_item'
                     AND index_name = 'uk_evaluation_item_grid_item') THEN
        ALTER TABLE evaluation_item
            ADD UNIQUE KEY uk_evaluation_item_grid_item (evaluation_id, evaluation_grid_template_item_id);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.statistics
               WHERE table_schema = DATABASE() AND table_name = 'evaluation_item'
                 AND index_name = 'uk_evaluation_item_criterion') THEN
        ALTER TABLE evaluation_item DROP INDEX uk_evaluation_item_criterion;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'evaluation_item'
                 AND column_name = 'pipeline_stage_evaluation_criterion_id') THEN
        ALTER TABLE evaluation_item DROP COLUMN pipeline_stage_evaluation_criterion_id;
    END IF;

    -- la colonne item de grille devient la reference obligatoire (garanti par 1.)
    ALTER TABLE evaluation_item
        MODIFY evaluation_grid_template_item_id INT UNSIGNED NOT NULL;

    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = DATABASE() AND table_name = 'legacy_criterion_mapping') THEN
        DROP TABLE legacy_criterion_mapping;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = DATABASE() AND table_name = 'pipeline_stage_evaluation_criterion') THEN
        DROP TABLE pipeline_stage_evaluation_criterion;
    END IF;
END$$
DELIMITER ;

CALL phase_d_apply();
DROP PROCEDURE IF EXISTS phase_d_apply;

-- -----------------------------------------------------------------------------
-- 3. Controles finaux (SIGNAL -> migration annulee)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS phase_d_postcheck;

DELIMITER $$
CREATE PROCEDURE phase_d_postcheck()
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = DATABASE() AND table_name = 'pipeline_stage_evaluation_criterion') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_D : pipeline_stage_evaluation_criterion encore presente';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = DATABASE() AND table_name = 'legacy_criterion_mapping') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_D : legacy_criterion_mapping encore presente';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'evaluation_item'
                 AND column_name = 'pipeline_stage_evaluation_criterion_id') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_D : colonne pipeline_stage_evaluation_criterion_id encore presente sur evaluation_item';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'evaluation_item'
                 AND column_name = 'evaluation_grid_template_item_id' AND is_nullable = 'YES') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_D : evaluation_grid_template_item_id doit etre NOT NULL';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics
                   WHERE table_schema = DATABASE() AND table_name = 'evaluation_item'
                     AND index_name = 'uk_evaluation_item_grid_item' AND non_unique = 0) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_D : unique (evaluation_id, evaluation_grid_template_item_id) absent';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics
                   WHERE table_schema = DATABASE() AND table_name = 'evaluation_grid_template_version'
                     AND index_name = 'uk_egtv_content_hash' AND non_unique = 0) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_D : unique uk_egtv_content_hash absent';
    END IF;
END$$
DELIMITER ;

CALL phase_d_postcheck();
DROP PROCEDURE IF EXISTS phase_d_postcheck;

-- -----------------------------------------------------------------------------
-- 4. Trace d'audit et bilan
-- -----------------------------------------------------------------------------
INSERT INTO audit_event (entity_type, entity_id, action_type, justification, created_at)
SELECT 'MIGRATION', 'V1_080', 'PHASE_D_COMPLETED',
       CONCAT('suppression achevee : ', 
              (SELECT COUNT(*) FROM evaluation_item), ' evaluation_item sur evaluation_grid_template_item_id, ',
              (SELECT COUNT(*) FROM evaluation_grid_template_version WHERE is_deleted = 0), ' version(s) de grille conservee(s)'),
       NOW();
