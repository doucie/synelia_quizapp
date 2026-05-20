-- V1_038 : ajoute colonnes is_archived/time_all_forms a campaigns,
-- elargit campaign_status a varchar(20) (D-022),
-- ajoute is_timed a form (D-017).
--
-- Refs : L-audit-02-campaigns.md LCAMPAI-020/021/022, L-audit-03-form.md LFORM-020.

ALTER TABLE campaigns
    ADD COLUMN is_archived TINYINT(1) NOT NULL DEFAULT 0 AFTER is_timed,
    ADD COLUMN time_all_forms INT NULL AFTER is_archived,
    MODIFY COLUMN campaign_status VARCHAR(20) NOT NULL;

ALTER TABLE form
    ADD COLUMN is_timed TINYINT(1) NOT NULL DEFAULT 0 AFTER campaign_id;
