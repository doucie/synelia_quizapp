INSERT INTO campaign_form (
    campaign_id,
    form_id,
    assignment_order,
    created_at,
    created_by,
    updated_at,
    updated_by,
    is_deleted,
    search_string
)
SELECT
    missing.campaign_id,
    missing.form_id,
    missing.assignment_order,
    missing.created_at,
    missing.created_by,
    missing.updated_at,
    missing.updated_by,
    b'0',
    missing.search_string
FROM (
    SELECT
        f.campaign_id AS campaign_id,
        f.id AS form_id,
        COALESCE(active_orders.max_assignment_order, 0)
            + ROW_NUMBER() OVER (PARTITION BY f.campaign_id ORDER BY f.id) AS assignment_order,
        COALESCE(f.created_at, NOW()) AS created_at,
        f.created_by AS created_by,
        f.updated_at AS updated_at,
        f.updated_by AS updated_by,
        TRIM(CONCAT_WS(' ', c.campaign_title, f.form_name, f.form_desc)) AS search_string
    FROM form f
    JOIN campaigns c ON c.id = f.campaign_id
    LEFT JOIN (
        SELECT
            cf.campaign_id,
            MAX(COALESCE(cf.assignment_order, 0)) AS max_assignment_order
        FROM campaign_form cf
        WHERE COALESCE(cf.is_deleted, 0) = 0
        GROUP BY cf.campaign_id
    ) active_orders ON active_orders.campaign_id = f.campaign_id
    WHERE f.campaign_id IS NOT NULL
      AND f.campaign_id <> 0
      AND COALESCE(f.is_deleted, 0) = 0
      AND COALESCE(c.is_deleted, 0) = 0
      AND NOT EXISTS (
          SELECT 1
          FROM campaign_form active_cf
          WHERE active_cf.form_id = f.id
            AND COALESCE(active_cf.is_deleted, 0) = 0
      )
) missing;

UPDATE campaign_form cf
JOIN (
    SELECT
        pending.id,
        COALESCE(defined_orders.max_assignment_order, 0)
            + ROW_NUMBER() OVER (PARTITION BY pending.campaign_id ORDER BY pending.form_id, pending.id) AS assignment_order
    FROM campaign_form pending
    LEFT JOIN (
        SELECT
            campaign_id,
            MAX(assignment_order) AS max_assignment_order
        FROM campaign_form
        WHERE COALESCE(is_deleted, 0) = 0
          AND assignment_order IS NOT NULL
        GROUP BY campaign_id
    ) defined_orders ON defined_orders.campaign_id = pending.campaign_id
    WHERE COALESCE(pending.is_deleted, 0) = 0
      AND pending.assignment_order IS NULL
) assignment_fix ON assignment_fix.id = cf.id
SET cf.assignment_order = assignment_fix.assignment_order
WHERE cf.assignment_order IS NULL;

UPDATE campaign_form cf
JOIN campaigns c ON c.id = cf.campaign_id
JOIN form f ON f.id = cf.form_id
SET cf.search_string = TRIM(CONCAT_WS(' ', c.campaign_title, f.form_name, f.form_desc))
WHERE COALESCE(cf.is_deleted, 0) = 0
  AND COALESCE(c.is_deleted, 0) = 0
  AND COALESCE(f.is_deleted, 0) = 0
  AND COALESCE(cf.search_string, '') <> TRIM(CONCAT_WS(' ', c.campaign_title, f.form_name, f.form_desc));

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