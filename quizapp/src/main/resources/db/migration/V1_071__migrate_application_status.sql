-- =============================================================================
-- V1_071 : cloture du statut candidat legacy (fin du champ application_status)
--  - Backfill des miroirs derives de progression laisses NULL par V1_063/V1_064/
--    V1_065, depuis les sources de verite (application_progress, decisions) :
--    le statut candidat reste redervable a la lecture apres le DROP.
--  - Logique pipeline identique a V1_065 (resolveCurrentStageProgress) :
--    ligne IN_PROGRESS prioritaire, sinon premier PENDING par stage_order.
--  - Logique decision identique a V1_063/V1_064 : derniere decision non
--    annulee/non supprimee de type reconnu par le runtime (DecisionType).
--  - COMPTAGES avant/apres + RAPPORT DE DIVERGENCES (non bloquant) : aucune
--    valeur legacy ne se derive 1:1, les ecarts sont listes pour audit
--    (arbitrage verification 2026-08-03). Pas de SIGNAL strict.
--  - DROP de applications.application_status (ni index ni FK, verifie).
-- ATTENTION : DDL MySQL NON transactionnel. A tester sur une copie de la BD
-- avant application sur la BD partagee (Flyway: une migration appliquee est immuable).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. COMPTAGE AVANT : applications actives par statut legacy (valeur brute)
-- -----------------------------------------------------------------------------
SELECT a.application_status AS statut_legacy_brut, COUNT(*) AS nb_applications
FROM applications a
WHERE COALESCE(a.is_deleted, 0) = 0
GROUP BY a.application_status
ORDER BY nb_applications DESC;

-- 1.bis COMPTAGE AVANT : statut legacy normalise (suffixe _ARCHIVED retire,
-- valeur vide -> '(NULL)') : vocabulaire de comparaison du rapport
SELECT CASE
           WHEN a.application_status IS NULL OR TRIM(a.application_status) = '' THEN '(NULL)'
           ELSE TRIM(REPLACE(UPPER(a.application_status), '_ARCHIVED', ''))
       END AS statut_legacy_normalise,
       COUNT(*) AS nb_applications
FROM applications a
WHERE COALESCE(a.is_deleted, 0) = 0
GROUP BY statut_legacy_normalise
ORDER BY nb_applications DESC;

-- 1.ter COMPTAGE AVANT : etat des miroirs derives avant backfill (V1_063-065)
SELECT
    SUM(CASE WHEN current_pipeline_stage_type IS NULL THEN 1 ELSE 0 END) AS pipeline_vide,
    SUM(CASE WHEN current_preselection_decision_type IS NULL THEN 1 ELSE 0 END) AS preselection_vide,
    SUM(CASE WHEN current_final_decision_type IS NULL THEN 1 ELSE 0 END) AS finale_vide,
    COUNT(*) AS total_applications
FROM applications
WHERE COALESCE(is_deleted, 0) = 0;

-- -----------------------------------------------------------------------------
-- 2. BACKFILL miroirs pipeline (V1_065 : IN_PROGRESS prioritaire, sinon premier
--    PENDING par stage_order) : uniquement les lignes encore vides
-- -----------------------------------------------------------------------------
UPDATE applications a
LEFT JOIN (
    SELECT
        ap1.application_id,
        ps.stage_type,
        ps.stage_label,
        ap1.progress_status
    FROM application_progress ap1
    INNER JOIN pipeline_stage ps ON ps.id = ap1.pipeline_stage_id
    LEFT JOIN application_progress ap2
        ON ap2.application_id = ap1.application_id
       AND COALESCE(ap2.is_deleted, 0) = 0
       AND ap2.progress_status IN ('IN_PROGRESS', 'PENDING')
       AND (
            CASE ap2.progress_status
                WHEN 'IN_PROGRESS' THEN 0
                WHEN 'PENDING' THEN 1
                ELSE 99
            END
            <
            CASE ap1.progress_status
                WHEN 'IN_PROGRESS' THEN 0
                WHEN 'PENDING' THEN 1
                ELSE 99
            END
            OR (
                CASE ap2.progress_status
                    WHEN 'IN_PROGRESS' THEN 0
                    WHEN 'PENDING' THEN 1
                    ELSE 99
                END
                =
                CASE ap1.progress_status
                    WHEN 'IN_PROGRESS' THEN 0
                    WHEN 'PENDING' THEN 1
                    ELSE 99
                END
                AND COALESCE((SELECT ps2.stage_order FROM pipeline_stage ps2 WHERE ps2.id = ap2.pipeline_stage_id), 999999) < COALESCE(ps.stage_order, 999999)
            )
            OR (
                CASE ap2.progress_status
                    WHEN 'IN_PROGRESS' THEN 0
                    WHEN 'PENDING' THEN 1
                    ELSE 99
                END
                =
                CASE ap1.progress_status
                    WHEN 'IN_PROGRESS' THEN 0
                    WHEN 'PENDING' THEN 1
                    ELSE 99
                END
                AND COALESCE((SELECT ps2.stage_order FROM pipeline_stage ps2 WHERE ps2.id = ap2.pipeline_stage_id), 999999) = COALESCE(ps.stage_order, 999999)
                AND COALESCE(ap2.id, 0) < COALESCE(ap1.id, 0)
            )
       )
    WHERE COALESCE(ap1.is_deleted, 0) = 0
      AND ap1.progress_status IN ('IN_PROGRESS', 'PENDING')
      AND ap2.id IS NULL
) current_pipeline_stage ON current_pipeline_stage.application_id = a.id
SET
    a.current_pipeline_stage_type = COALESCE(current_pipeline_stage.stage_type, a.current_pipeline_stage_type),
    a.current_pipeline_stage_label = COALESCE(current_pipeline_stage.stage_label, a.current_pipeline_stage_label),
    a.current_pipeline_progress_status = COALESCE(current_pipeline_stage.progress_status, a.current_pipeline_progress_status)
WHERE a.current_pipeline_stage_type IS NULL;

-- -----------------------------------------------------------------------------
-- 3. BACKFILL miroirs preselection (V1_063 : derniere decision non annulee/non
--    supprimee PRE_SCREEN_* reconnue par le runtime) : lignes encore vides
-- -----------------------------------------------------------------------------
UPDATE applications a
LEFT JOIN (
    SELECT
        d1.application_id,
        d1.decision_type,
        COALESCE(d1.updated_at, d1.created_at) AS decision_date
    FROM decisions d1
    LEFT JOIN decisions d2
        ON d2.application_id = d1.application_id
       AND COALESCE(d2.is_deleted, 0) = 0
       AND COALESCE(d2.is_cancel, 0) = 0
       AND d2.decision_type IN ('PRE_SCREEN_ACCEPTED', 'PRE_SCREEN_REJECTED')
       AND (
            COALESCE(d2.updated_at, d2.created_at, TIMESTAMP('1000-01-01 00:00:00')) > COALESCE(d1.updated_at, d1.created_at, TIMESTAMP('1000-01-01 00:00:00'))
            OR (
                COALESCE(d2.updated_at, d2.created_at, TIMESTAMP('1000-01-01 00:00:00')) = COALESCE(d1.updated_at, d1.created_at, TIMESTAMP('1000-01-01 00:00:00'))
                AND COALESCE(d2.id, 0) > COALESCE(d1.id, 0)
            )
       )
    WHERE COALESCE(d1.is_deleted, 0) = 0
      AND COALESCE(d1.is_cancel, 0) = 0
      AND d1.decision_type IN ('PRE_SCREEN_ACCEPTED', 'PRE_SCREEN_REJECTED')
      AND d2.id IS NULL
) current_preselection ON current_preselection.application_id = a.id
SET
    a.current_preselection_decision_type = COALESCE(current_preselection.decision_type, a.current_preselection_decision_type),
    a.current_preselection_decision_date = COALESCE(current_preselection.decision_date, a.current_preselection_decision_date)
WHERE a.current_preselection_decision_type IS NULL;

-- -----------------------------------------------------------------------------
-- 4. BACKFILL miroirs decision finale (V1_064 : derniere decision non annulee/
--    non supprimee FINAL_* reconnue par le runtime) : lignes encore vides
-- -----------------------------------------------------------------------------
UPDATE applications a
LEFT JOIN (
    SELECT
        d1.application_id,
        d1.decision_type,
        COALESCE(d1.updated_at, d1.created_at) AS decision_date
    FROM decisions d1
    LEFT JOIN decisions d2
        ON d2.application_id = d1.application_id
       AND COALESCE(d2.is_deleted, 0) = 0
       AND COALESCE(d2.is_cancel, 0) = 0
       AND d2.decision_type IN ('FINAL_ACCEPTED', 'FINAL_REJECTED')
       AND (
            COALESCE(d2.updated_at, d2.created_at, TIMESTAMP('1000-01-01 00:00:00')) > COALESCE(d1.updated_at, d1.created_at, TIMESTAMP('1000-01-01 00:00:00'))
            OR (
                COALESCE(d2.updated_at, d2.created_at, TIMESTAMP('1000-01-01 00:00:00')) = COALESCE(d1.updated_at, d1.created_at, TIMESTAMP('1000-01-01 00:00:00'))
                AND COALESCE(d2.id, 0) > COALESCE(d1.id, 0)
            )
       )
    WHERE COALESCE(d1.is_deleted, 0) = 0
      AND COALESCE(d1.is_cancel, 0) = 0
      AND d1.decision_type IN ('FINAL_ACCEPTED', 'FINAL_REJECTED')
      AND d2.id IS NULL
) current_final_decision ON current_final_decision.application_id = a.id
SET
    a.current_final_decision_type = COALESCE(current_final_decision.decision_type, a.current_final_decision_type),
    a.current_final_decision_date = COALESCE(current_final_decision.decision_date, a.current_final_decision_date)
WHERE a.current_final_decision_type IS NULL;

-- -----------------------------------------------------------------------------
-- 5. COMPTAGE APRES + RAPPORT DE DIVERGENCES (non bloquant) : le statut derive
--    reproduit la logique de lecture (front resolveApplicationStatusFromMirrors,
--    backend resolveTrackedApplicationStatus / normalizeStatus)
-- -----------------------------------------------------------------------------
CREATE TEMPORARY TABLE tmp_v1_071_rapport AS
SELECT
    a.id,
    a.application_abandoned,
    a.application_status AS statut_legacy_brut,
    CASE
        WHEN a.application_status IS NULL OR TRIM(a.application_status) = '' THEN '(NULL)'
        ELSE TRIM(REPLACE(UPPER(a.application_status), '_ARCHIVED', ''))
    END AS statut_legacy_normalise,
    CASE
        WHEN COALESCE(a.application_abandoned, 0) = 1 THEN 'WITHDRAWN'
        WHEN a.current_final_decision_type LIKE 'FINAL_ACCEPTED%' THEN 'FINAL_ACCEPTED'
        WHEN a.current_final_decision_type LIKE 'FINAL_REJECTED%' THEN 'FINAL_REJECTED'
        WHEN a.current_preselection_decision_type LIKE 'PRE_SCREEN_REJECTED%' THEN 'PRE_SCREEN_REJECTED'
        WHEN a.current_preselection_decision_type LIKE 'PRE_SCREEN_ACCEPTED%' THEN 'PRE_SCREEN_ACCEPTED'
        WHEN a.current_pipeline_stage_type = 'INTERVIEW' THEN 'INTERVIEWING'
        WHEN a.current_pipeline_progress_status IS NULL OR a.current_pipeline_progress_status = 'PENDING' THEN 'PENDING'
        ELSE 'SUBMITTED'
    END AS statut_derive_miroirs
FROM applications a
WHERE COALESCE(a.is_deleted, 0) = 0;

-- 5.a COMPTAGE APRES : applications actives par statut derive des miroirs
SELECT statut_derive_miroirs, COUNT(*) AS nb_applications
FROM tmp_v1_071_rapport
GROUP BY statut_derive_miroirs
ORDER BY nb_applications DESC;

-- 5.b COMPTAGE APRES : miroirs encore vides apres backfill
SELECT
    SUM(CASE WHEN current_pipeline_stage_type IS NULL THEN 1 ELSE 0 END) AS pipeline_vide,
    SUM(CASE WHEN current_preselection_decision_type IS NULL THEN 1 ELSE 0 END) AS preselection_vide,
    SUM(CASE WHEN current_final_decision_type IS NULL THEN 1 ELSE 0 END) AS finale_vide,
    COUNT(*) AS total_applications
FROM applications
WHERE COALESCE(is_deleted, 0) = 0;

-- 5.c RAPPORT DE DIVERGENCES : statut legacy normalise different du statut
--     derive des miroirs (suffixes _ARCHIVED ignores). Non bloquant : a auditer.
--     Comparaisons en CAST AS BINARY (independant de la collation de connexion) :
--     les colonnes applications sont en utf8mb4_unicode_ci, les litteraux en
--     collation de connexion -> coercition impossible sinon (erreur 1267).
SELECT
    r.id,
    r.statut_legacy_brut,
    r.statut_legacy_normalise,
    r.statut_derive_miroirs,
    CASE
        WHEN COALESCE(r.application_abandoned, 0) = 1 THEN 'abandon (legacy non reflete)'
        WHEN CAST(r.statut_legacy_normalise AS BINARY) LIKE CAST('FINAL_%' AS BINARY) THEN 'decision finale legacy sans miroir equivalent'
        WHEN CAST(r.statut_legacy_normalise AS BINARY) LIKE CAST('PRE_SCREEN%' AS BINARY) THEN 'decision preselection legacy sans miroir equivalent'
        WHEN CAST(r.statut_legacy_normalise AS BINARY) = CAST('ACTIVE' AS BINARY) THEN 'statut legacy ACTIVE (remplace par derive progression)'
        WHEN CAST(r.statut_legacy_normalise AS BINARY) = CAST('PENDING' AS BINARY) THEN 'PENDING legacy vs progression avancee'
        WHEN CAST(r.statut_legacy_normalise AS BINARY) = CAST('(NULL)' AS BINARY) THEN 'statut legacy absent'
        ELSE 'autre divergence'
    END AS raison
FROM tmp_v1_071_rapport r
WHERE CAST(r.statut_legacy_normalise AS BINARY) <> CAST(r.statut_derive_miroirs AS BINARY)
ORDER BY r.id;

-- -----------------------------------------------------------------------------
-- 6. applications : DROP de la colonne application_status
-- -----------------------------------------------------------------------------
ALTER TABLE applications
    DROP COLUMN application_status;

-- -----------------------------------------------------------------------------
-- 7. Nettoyage des tables temporaires
-- -----------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS tmp_v1_071_rapport;
