-- =============================================================================
-- V1_079 : backfill phase B du versionnage des grilles (verrou d'usage + contenu)
--
-- Objectif : reconstituer les donnees depuis pipeline_stage_evaluation_criterion
-- sans perte, avec un rebranchement deterministe et reversible :
--   1. creer legacy_criterion_mapping (table de correspondance reversible,
--      consommee par V1_080 pour verifier puis supprimee) ;
--   2. reconstruire une version de grille par etape (reutilisation de la
--      version d'origine quand elle est strictement identique au contenu de
--      l'etape, sinon nouvelle reconstruction) ;
--   3. deduplicer par contenu (content_hash) et nettoyer les orphelins ;
--   4. renseigner pipeline_stage.evaluation_grid_template_version_id ;
--   5. rebrancher evaluation_item via legacy_criterion_mapping uniquement ;
--   6. poser locked_at sur les versions effectivement utilisees ;
--   7. extraire les cas non deterministes (criterion_order duplique, contenu
--      different de la version d'origine) vers l'arbitrage manuel (audit_event
--      action PHASE_B_ARBITRATION) AVANT le rebranchement final ;
--   8. controles de coherence obligatoires (SIGNAL -> migration annulee).
--
-- Sur le jeu de donnees de reference (tables sources vides), ce script est un
-- no-op propre : aucune version creee, mapping vide, controles verts.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Comptages "avant" pour les controles de coherence finaux
-- -----------------------------------------------------------------------------
SET SESSION group_concat_max_len = 1048576;

CREATE TEMPORARY TABLE phaseb_before_counts (
    measure VARCHAR(60) NOT NULL,
    val BIGINT NOT NULL
);

INSERT INTO phaseb_before_counts (measure, val) VALUES
    ('evaluation_item_total', (SELECT COUNT(*) FROM evaluation_item)),
    ('evaluation_item_active', (SELECT COUNT(*) FROM evaluation_item WHERE is_deleted = 0)),
    ('psec_total', (SELECT COUNT(*) FROM pipeline_stage_evaluation_criterion)),
    ('psec_active', (SELECT COUNT(*) FROM pipeline_stage_evaluation_criterion WHERE is_deleted = 0)),
    ('stages_with_criteria', (SELECT COUNT(DISTINCT pipeline_stage_id)
        FROM pipeline_stage_evaluation_criterion WHERE is_deleted = 0));

-- -----------------------------------------------------------------------------
-- 1. Table de correspondance reversible (droppee en Phase D)
-- -----------------------------------------------------------------------------
CREATE TABLE legacy_criterion_mapping (
    old_pipeline_stage_evaluation_criterion_id INT UNSIGNED NOT NULL,
    new_evaluation_grid_template_item_id       INT UNSIGNED NULL,
    pipeline_stage_id                          INT UNSIGNED NOT NULL,
    is_arbitrated                              TINYINT(1)   NOT NULL DEFAULT 0,
    justification                              VARCHAR(255) NULL,
    PRIMARY KEY (old_pipeline_stage_evaluation_criterion_id),
    KEY idx_lcm_item (new_evaluation_grid_template_item_id),
    KEY idx_lcm_stage (pipeline_stage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Reconstruction deterministe des versions par etape (procedure)
-- -----------------------------------------------------------------------------
-- phaseb_reused_stages : etapes qui ont reutilise leur version d'origine
-- (utilise par 4.3 pour ne pas baliser une reutilisation propre en arbitrage).
CREATE TEMPORARY TABLE phaseb_reused_stages (
    stage_id INT UNSIGNED NOT NULL PRIMARY KEY
);

DROP PROCEDURE IF EXISTS backfill_grid_usage;

DELIMITER $$
CREATE PROCEDURE backfill_grid_usage()
BEGIN
    DECLARE v_done          INT DEFAULT 0;
    DECLARE v_stage_id      INT UNSIGNED;
    DECLARE v_stage_label   VARCHAR(255);
    DECLARE v_origin_version INT UNSIGNED;
    DECLARE v_identical     TINYINT DEFAULT 0;
    DECLARE v_new_version   INT UNSIGNED;
    DECLARE v_template_id   INT UNSIGNED;
    DECLARE v_dup_count     INT DEFAULT 0;

    DECLARE cur CURSOR FOR
        SELECT ps.id
        FROM pipeline_stage ps
        WHERE ps.is_deleted = 0
          AND EXISTS (SELECT 1 FROM pipeline_stage_evaluation_criterion c
                      WHERE c.pipeline_stage_id = ps.id AND c.is_deleted = 0)
        ORDER BY ps.id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    OPEN cur;

    stage_loop: LOOP
        FETCH cur INTO v_stage_id;
        IF v_done = 1 THEN
            LEAVE stage_loop;
        END IF;

        -- 2.0 criterion_order duplique dans le stage : cas indeterministe,
        --     la reconstruction echouerait sur uk_egti_version_order. On saute
        --     l'etape (pas de version, pas de rattachement) et on remonte le cas
        --     en arbitrage (voir 4.2). ATTENTION : tout SELECT ... INTO qui ne
        --     renverrait aucune ligne declencherait le handler NOT FOUND ; les
        --     agregats ci-dessous renvoient toujours une ligne, donc c'est sur.
        SELECT COUNT(*) INTO v_dup_count
        FROM (SELECT 1
              FROM pipeline_stage_evaluation_criterion c
              WHERE c.pipeline_stage_id = v_stage_id AND c.is_deleted = 0
              GROUP BY c.criterion_order
              HAVING COUNT(*) > 1) d;

        IF v_dup_count > 0 THEN
            INSERT INTO audit_event (entity_type, entity_id, action_type, justification, created_at)
            VALUES ('PIPELINE_STAGE', CAST(v_stage_id AS CHAR), 'PHASE_B_SKIPPED',
                    CONCAT('criterion_order duplique dans le stage ', v_stage_id,
                           ' : etape non reconstruite, arbitrage manuel requis'),
                    NOW());
            ITERATE stage_loop;
        END IF;

        -- 2.1 version d'origine commune : tous les criteres actifs portent la
        --     meme version non nulle
        SET v_origin_version = NULL;
        SELECT MIN(c.evaluation_grid_template_version_id)
          INTO v_origin_version
          FROM pipeline_stage_evaluation_criterion c
         WHERE c.pipeline_stage_id = v_stage_id AND c.is_deleted = 0;

        IF v_origin_version IS NOT NULL THEN
            IF (SELECT COUNT(*) FROM pipeline_stage_evaluation_criterion c
                WHERE c.pipeline_stage_id = v_stage_id AND c.is_deleted = 0
                  AND (c.evaluation_grid_template_version_id IS NULL
                       OR c.evaluation_grid_template_version_id <> v_origin_version)) > 0 THEN
                SET v_origin_version = NULL;
            END IF;
        END IF;

        -- 2.2 l'etape est-elle strictement identique aux items de cette version ?
        --     (config_json compare via SHA2 pour eviter la troncature TEXT)
        SET v_identical = 0;
        IF v_origin_version IS NOT NULL THEN
            SELECT IF(
                (SELECT COUNT(*) FROM (
                    SELECT c.criterion_order, TRIM(c.label), c.criterion_type,
                           COALESCE(ROUND(c.max_score,4),-1), COALESCE(ROUND(c.weight,4),-1),
                           IF(c.is_required,1,0), SHA2(COALESCE(c.config_json,''),256)
                    FROM pipeline_stage_evaluation_criterion c
                    WHERE c.pipeline_stage_id = v_stage_id AND c.is_deleted = 0
                    EXCEPT
                    SELECT i.criterion_order, TRIM(i.label), i.criterion_type,
                           COALESCE(ROUND(i.max_score,4),-1), COALESCE(ROUND(i.weight,4),-1),
                           IF(i.is_required,1,0), SHA2(COALESCE(i.config_json,''),256)
                    FROM evaluation_grid_template_item i
                    WHERE i.evaluation_grid_template_version_id = v_origin_version AND i.is_deleted = 0
                ) d) = 0
                AND (SELECT COUNT(*) FROM pipeline_stage_evaluation_criterion c
                     WHERE c.pipeline_stage_id = v_stage_id AND c.is_deleted = 0)
                  = (SELECT COUNT(*) FROM evaluation_grid_template_item i
                     WHERE i.evaluation_grid_template_version_id = v_origin_version AND i.is_deleted = 0),
                1, 0) INTO v_identical;
        END IF;

        -- 2.3 cible : version d'origine (identique) sinon reconstruction neuve
        IF v_identical = 1 THEN
            SET v_new_version = v_origin_version;
            INSERT INTO phaseb_reused_stages (stage_id) VALUES (v_stage_id);
        ELSE
            SELECT stage_label INTO v_stage_label FROM pipeline_stage WHERE id = v_stage_id;

            INSERT INTO evaluation_grid_template
                (template_name, template_desc, is_active, created_at, is_deleted, search_string)
            VALUES (
                CONCAT('Reconstruction Phase B - ', COALESCE(v_stage_label, CONCAT('Stage ', v_stage_id))),
                CONCAT('Grille reconstruite depuis pipeline_stage_evaluation_criterion (etape ', v_stage_id, ').'),
                TRUE, NOW(), FALSE,
                CONCAT('phaseb stage ', v_stage_id));
            SET v_template_id = LAST_INSERT_ID();

            INSERT INTO evaluation_grid_template_version
                (evaluation_grid_template_id, version_number, version_label, is_published,
                 created_at, is_deleted, search_string)
            VALUES (v_template_id, 1, 'v1 - reconstruction Phase B', FALSE,
                    NOW(), FALSE, CONCAT('phaseb stage ', v_stage_id));
            SET v_new_version = LAST_INSERT_ID();

            INSERT INTO evaluation_grid_template_item
                (evaluation_grid_template_version_id, criterion_order, label, criterion_type,
                 max_score, weight, is_required, config_json, created_at, is_deleted, search_string)
            SELECT v_new_version, c.criterion_order, c.label, c.criterion_type,
                   c.max_score, c.weight, c.is_required, c.config_json, NOW(), FALSE,
                   CONCAT('phaseb stage ', v_stage_id, ' order ', c.criterion_order)
            FROM pipeline_stage_evaluation_criterion c
            WHERE c.pipeline_stage_id = v_stage_id AND c.is_deleted = 0;
        END IF;

        -- 2.4 rattachement de l'etape a la version cible
        UPDATE pipeline_stage
           SET evaluation_grid_template_version_id = v_new_version,
               updated_at = NOW()
         WHERE id = v_stage_id;

        -- 2.5 trace d'audit
        INSERT INTO audit_event (entity_type, entity_id, action_type, justification, created_at)
        VALUES ('PIPELINE_STAGE', CAST(v_stage_id AS CHAR),
                IF(v_identical = 1, 'PHASE_B_VERSION_REUSED', 'PHASE_B_VERSION_CREATED'),
                IF(v_identical = 1,
                   CONCAT('etape ', v_stage_id, ' -> version d''origine ', v_origin_version),
                   CONCAT('etape ', v_stage_id, ' -> nouvelle version ', v_new_version)),
                NOW());
    END LOOP;

    CLOSE cur;
END$$
DELIMITER ;

CALL backfill_grid_usage();

-- -----------------------------------------------------------------------------
-- 3. content_hash + deduplication par contenu (set-based)
-- -----------------------------------------------------------------------------
-- 3.1 calcul des empreintes sur forme canonique (ordre des items significatif).
--     content_hash est declare avec la collation de la table (utf8mb4_unicode_ci)
--     pour eviter tout mix de collations client-dependant (SHA2 renvoie une
--     chaine dans la collation de connexion, pas celle des colonnes).
CREATE TEMPORARY TABLE phaseb_version_hash (
    version_id   INT UNSIGNED NOT NULL,
    item_count   BIGINT       NOT NULL,
    content_hash CHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
) ENGINE=InnoDB;

INSERT INTO phaseb_version_hash (version_id, item_count, content_hash)
SELECT v.id,
       COUNT(i.id),
       SHA2(GROUP_CONCAT(
           SHA2(CONCAT_WS('|',
               i.criterion_order,
               TRIM(i.label),
               i.criterion_type,
               COALESCE(ROUND(i.max_score,4),-1),
               COALESCE(ROUND(i.weight,4),-1),
               IF(i.is_required,1,0),
               TRIM(COALESCE(i.config_json,''))
           ), 256)
           ORDER BY i.criterion_order SEPARATOR '§'), 256)
FROM evaluation_grid_template_version v
JOIN evaluation_grid_template_item i
  ON i.evaluation_grid_template_version_id = v.id AND i.is_deleted = 0
WHERE v.is_deleted = 0
GROUP BY v.id;

-- 3.2 version canonique par contenu (la plus ancienne id est conservee)
CREATE TEMPORARY TABLE phaseb_canonical_version AS
SELECT content_hash, MIN(version_id) AS keep_version_id
FROM phaseb_version_hash
GROUP BY content_hash;

-- 3.3 repointage des etapes vers la version canonique en cas de doublon
UPDATE pipeline_stage ps
JOIN phaseb_version_hash h ON h.version_id = ps.evaluation_grid_template_version_id
JOIN phaseb_canonical_version c ON c.content_hash = h.content_hash AND c.keep_version_id <> h.version_id
SET ps.evaluation_grid_template_version_id = c.keep_version_id,
    ps.updated_at = NOW();

-- 3.4 content_hash sur toutes les versions conservees (publiées ou non) :
--     uk_egtv_content_hash UNIQUE garantit une seule version par contenu ; les
--     doublons (non-keep) sont exclus et recoivent NULL, puis sont nettoyes en 3.5.
--     Une version publiee doublonnee reste donc sans empreinte -> arbitrage (3.6).
UPDATE evaluation_grid_template_version v
JOIN phaseb_version_hash h ON h.version_id = v.id
SET v.content_hash = h.content_hash
WHERE v.is_deleted = 0
  AND NOT EXISTS (SELECT 1 FROM phaseb_canonical_version c
                  WHERE c.content_hash = h.content_hash AND c.keep_version_id <> h.version_id);

-- 3.5 nettoyage des orphelins (versions creees puis abandonnees, ou doublons
--     dedupliques) : jamais de suppression physique, jamais sur les versions
--     publiees
UPDATE evaluation_grid_template_version v
SET v.is_deleted = 1, v.updated_at = NOW()
WHERE v.is_deleted = 0
  AND v.is_published = 0
  AND v.locked_at IS NULL
  AND v.content_hash IS NULL
  AND NOT EXISTS (SELECT 1 FROM pipeline_stage ps
                  WHERE ps.evaluation_grid_template_version_id = v.id AND ps.is_deleted = 0);

INSERT INTO audit_event (entity_type, entity_id, action_type, justification, created_at)
SELECT 'EVALUATION_GRID_TEMPLATE_VERSION', CAST(v.id AS CHAR), 'PHASE_B_ORPHAN_CLEANUP',
       CONCAT('version orpheline (dedoublonnage par contenu) desactivee, grille ', v.evaluation_grid_template_id),
       NOW()
FROM evaluation_grid_template_version v
WHERE v.is_deleted = 1
  AND v.content_hash IS NULL
  AND NOT EXISTS (SELECT 1 FROM pipeline_stage ps
                  WHERE ps.evaluation_grid_template_version_id = v.id AND ps.is_deleted = 0);

-- 3.6 versions publiees en doublon de contenu : cas pathologique (interdit par
--     uk_egtv_content_hash au runtime, possible sur donnees historiques) -> a
--     trancher manuellement, ne bloque pas la migration
INSERT INTO audit_event (entity_type, entity_id, action_type, justification, created_at)
SELECT 'EVALUATION_GRID_TEMPLATE_VERSION', CAST(v.id AS CHAR), 'PHASE_B_ARBITRATION',
       CONCAT('version publiee ', v.id, ' en doublon de contenu avec une version plus ancienne : a traiter manuellement'),
       NOW()
FROM phaseb_version_hash h
JOIN evaluation_grid_template_version v ON v.id = h.version_id
JOIN phaseb_canonical_version c ON c.content_hash = h.content_hash AND c.keep_version_id <> h.version_id
WHERE v.is_deleted = 0 AND v.is_published = 1;

-- -----------------------------------------------------------------------------
-- 4. legacy_criterion_mapping : rebranchement deterministe (jamais de devinette)
-- -----------------------------------------------------------------------------
-- 4.1 mapping propre : ordre unique dans le stage, item retrouve par ordre dans
--     la version finale de l'etape
INSERT INTO legacy_criterion_mapping
    (old_pipeline_stage_evaluation_criterion_id, new_evaluation_grid_template_item_id,
     pipeline_stage_id, is_arbitrated, justification)
SELECT c.id, i.id, c.pipeline_stage_id, 0, NULL
FROM pipeline_stage_evaluation_criterion c
JOIN pipeline_stage ps ON ps.id = c.pipeline_stage_id AND ps.is_deleted = 0
JOIN evaluation_grid_template_item i
  ON i.evaluation_grid_template_version_id = ps.evaluation_grid_template_version_id
 AND i.criterion_order = c.criterion_order AND i.is_deleted = 0
WHERE c.is_deleted = 0
  AND ps.evaluation_grid_template_version_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pipeline_stage_evaluation_criterion c2
                  WHERE c2.pipeline_stage_id = c.pipeline_stage_id AND c2.is_deleted = 0
                    AND c2.criterion_order = c.criterion_order AND c2.id <> c.id);

-- 4.2 arbitrage : criterion_order duplique dans un stage -> mapping indeterministe,
--     a trancher manuellement avant Phase D (evaluation_item non rebranche)
INSERT INTO audit_event (entity_type, entity_id, action_type, justification, created_at)
SELECT DISTINCT 'PIPELINE_STAGE', CAST(c.pipeline_stage_id AS CHAR), 'PHASE_B_ARBITRATION',
       'criterion_order duplique dans le stage : mapping evaluation_item indeterministe',
       NOW()
FROM pipeline_stage_evaluation_criterion c
WHERE c.is_deleted = 0
  AND EXISTS (SELECT 1 FROM pipeline_stage_evaluation_criterion c2
              WHERE c2.pipeline_stage_id = c.pipeline_stage_id AND c2.is_deleted = 0
                AND c2.criterion_order = c.criterion_order AND c2.id <> c.id);

INSERT INTO legacy_criterion_mapping
    (old_pipeline_stage_evaluation_criterion_id, new_evaluation_grid_template_item_id,
     pipeline_stage_id, is_arbitrated, justification)
SELECT c.id, NULL, c.pipeline_stage_id, 1, 'criterion_order duplique'
FROM pipeline_stage_evaluation_criterion c
WHERE c.is_deleted = 0
  AND EXISTS (SELECT 1 FROM pipeline_stage_evaluation_criterion c2
              WHERE c2.pipeline_stage_id = c.pipeline_stage_id AND c2.is_deleted = 0
                AND c2.criterion_order = c.criterion_order AND c2.id <> c.id);

-- 4.3 arbitrage : etapes RECONSTRUITES (pas de reutilisation) dont tous les
--     criteres portaient une meme version d'origine -> contenu modifie, verifier
--     le rattachement avant Phase D
INSERT INTO audit_event (entity_type, entity_id, action_type, justification, created_at)
SELECT DISTINCT 'PIPELINE_STAGE', CAST(ps.id AS CHAR), 'PHASE_B_ARBITRATION',
       'contenu reconstruit different de la version d''origine : verifier le rattachement',
       NOW()
FROM pipeline_stage ps
JOIN pipeline_stage_evaluation_criterion c
  ON c.pipeline_stage_id = ps.id AND c.is_deleted = 0
WHERE ps.is_deleted = 0
  AND ps.evaluation_grid_template_version_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM phaseb_reused_stages r WHERE r.stage_id = ps.id)
  AND (SELECT COUNT(DISTINCT c2.evaluation_grid_template_version_id)
       FROM pipeline_stage_evaluation_criterion c2
       WHERE c2.pipeline_stage_id = ps.id AND c2.is_deleted = 0) = 1
GROUP BY ps.id;

-- -----------------------------------------------------------------------------
-- 5. Rebranchement d'evaluation_item via legacy_criterion_mapping uniquement
-- -----------------------------------------------------------------------------
UPDATE evaluation_item ei
JOIN legacy_criterion_mapping m
  ON m.old_pipeline_stage_evaluation_criterion_id = ei.pipeline_stage_evaluation_criterion_id
 AND m.is_arbitrated = 0
SET ei.evaluation_grid_template_item_id = m.new_evaluation_grid_template_item_id,
    ei.updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 6. Verrou d'usage : locked_at sur les versions ayant au moins une
--    evaluation_item reellement saisie (is_deleted = 0)
-- -----------------------------------------------------------------------------
SET @phaseb_lock_now = NOW();

UPDATE evaluation_grid_template_version v
SET v.locked_at = @phaseb_lock_now
WHERE v.locked_at IS NULL
  AND EXISTS (SELECT 1 FROM evaluation_grid_template_item i
              WHERE i.evaluation_grid_template_version_id = v.id AND i.is_deleted = 0
                AND EXISTS (SELECT 1 FROM evaluation_item ei
                            WHERE ei.evaluation_grid_template_item_id = i.id AND ei.is_deleted = 0));

INSERT INTO audit_event (entity_type, entity_id, action_type, justification, created_at)
SELECT 'EVALUATION_GRID_TEMPLATE_VERSION', CAST(v.id AS CHAR), 'PHASE_B_LOCKED',
       CONCAT('verrou d''usage pose (premiere evaluation_item reellement saisie), grille ', v.evaluation_grid_template_id),
       NOW()
FROM evaluation_grid_template_version v
WHERE v.locked_at = @phaseb_lock_now;

-- -----------------------------------------------------------------------------
-- 7. Controles de coherence obligatoires (SIGNAL -> migration annulee)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS phaseb_consistency_check;

DELIMITER $$
CREATE PROCEDURE phaseb_consistency_check()
BEGIN
    -- 7.1 aucune evaluation_item perdue (comptages avant/après)
    IF (SELECT val FROM phaseb_before_counts WHERE measure = 'evaluation_item_total')
     <> (SELECT COUNT(*) FROM evaluation_item) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_B : nombre total d evaluation_item modifie';
    END IF;

    -- 7.2 aucune evaluation_item orpheline : toute valeur renseignee pointe un item existant
    IF (SELECT COUNT(*) FROM evaluation_item ei
        LEFT JOIN evaluation_grid_template_item i ON i.id = ei.evaluation_grid_template_item_id
        WHERE ei.evaluation_grid_template_item_id IS NOT NULL AND i.id IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_B : evaluation_item orpheline (item de grille inconnu)';
    END IF;

    -- 7.3 aucune etape INTERVIEW sans grille si des evaluations reelles (avec items)
    --     la reference (interpretation de la Regle A : l'usage = les items)
    IF (SELECT COUNT(*) FROM pipeline_stage ps
        WHERE ps.is_deleted = 0 AND ps.stage_type = 'INTERVIEW'
          AND ps.evaluation_grid_template_version_id IS NULL
          AND EXISTS (SELECT 1 FROM application_progress ap
                      JOIN interviews i ON i.application_progress_id = ap.id
                      JOIN candidate_interview ci ON ci.interview_id = i.id
                      JOIN evaluations e ON e.candidate_interview_id = ci.id
                      WHERE ap.pipeline_stage_id = ps.id
                        AND EXISTS (SELECT 1 FROM evaluation_item ei
                                    WHERE ei.evaluation_id = e.id AND ei.is_deleted = 0))) > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_B : etape INTERVIEW sans grille mais avec evaluations utilisees';
    END IF;

    -- 7.4 content_hash coherent sur les versions conservees non publiees
    --     (les versions publiees peuvent legitiment rester sans empreinte si
    --     elles sont en doublon historique -> arbitrage 3.6)
    IF (SELECT COUNT(*) FROM phaseb_version_hash h
        JOIN evaluation_grid_template_version v ON v.id = h.version_id
        WHERE v.is_deleted = 0 AND v.is_published = 0
          AND (v.content_hash IS NULL OR v.content_hash <> h.content_hash)) > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_B : content_hash incoherent avec le contenu des items';
    END IF;

    -- 7.5 verrou : toute version referencee par une evaluation_item saisie est verrouillee
    IF (SELECT COUNT(*) FROM evaluation_grid_template_item i
        JOIN evaluation_item ei ON ei.evaluation_grid_template_item_id = i.id AND ei.is_deleted = 0
        JOIN evaluation_grid_template_version v ON v.id = i.evaluation_grid_template_version_id
        WHERE v.is_deleted = 0 AND v.locked_at IS NULL) > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PHASE_B : version utilisee sans locked_at';
    END IF;
END$$
DELIMITER ;

CALL phaseb_consistency_check();

-- -----------------------------------------------------------------------------
-- 8. Bilan et nettoyage
-- -----------------------------------------------------------------------------
INSERT INTO audit_event (entity_type, entity_id, action_type, justification, created_at)
SELECT 'MIGRATION', 'V1_079', 'PHASE_B_COMPLETED',
       CONCAT('backfill termine : ',
              (SELECT COUNT(*) FROM evaluation_grid_template_version WHERE is_deleted = 0), ' version(s) de grille, ',
              (SELECT COUNT(*) FROM legacy_criterion_mapping WHERE is_arbitrated = 0), ' critere(s) rebranche(s), ',
              (SELECT COUNT(*) FROM legacy_criterion_mapping WHERE is_arbitrated = 1), ' cas en arbitrage, ',
              (SELECT COUNT(*) FROM evaluation_grid_template_version WHERE locked_at IS NOT NULL), ' version(s) verrouillee(s)'),
       NOW();

DROP PROCEDURE IF EXISTS backfill_grid_usage;
DROP PROCEDURE IF EXISTS phaseb_consistency_check;
DROP TEMPORARY TABLE IF EXISTS phaseb_before_counts;
DROP TEMPORARY TABLE IF EXISTS phaseb_version_hash;
DROP TEMPORARY TABLE IF EXISTS phaseb_canonical_version;
DROP TEMPORARY TABLE IF EXISTS phaseb_reused_stages;
