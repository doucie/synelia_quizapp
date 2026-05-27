-- La projection legacy form.campaign_id doit pouvoir retomber a NULL quand un
-- formulaire n'a aucun lien actif ou plusieurs liens actifs dans campaign_form.
ALTER TABLE form
    MODIFY COLUMN campaign_id INT UNSIGNED NULL;

UPDATE form f
LEFT JOIN (
    SELECT
        cf.form_id,
        COUNT(*) AS active_link_count,
        MIN(cf.campaign_id) AS projected_campaign_id
    FROM campaign_form cf
    WHERE COALESCE(cf.is_deleted, 0) = 0
    GROUP BY cf.form_id
) projection ON projection.form_id = f.id
SET f.campaign_id = CASE
        WHEN projection.active_link_count = 1 THEN projection.projected_campaign_id
        ELSE NULL
    END,
    f.updated_at = NOW()
WHERE COALESCE(f.is_deleted, 0) = 0
  AND (
      (projection.active_link_count = 1 AND COALESCE(f.campaign_id, 0) <> projection.projected_campaign_id)
      OR ((projection.active_link_count IS NULL OR projection.active_link_count <> 1) AND f.campaign_id IS NOT NULL)
  );