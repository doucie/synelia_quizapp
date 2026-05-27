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
    candidate.campaign_id,
    candidate.form_id,
    candidate.assignment_order,
    candidate.created_at,
    candidate.created_by,
    candidate.updated_at,
    candidate.updated_by,
    b'0',
    candidate.search_string
FROM (
    SELECT
        f.campaign_id AS campaign_id,
        f.id AS form_id,
        ROW_NUMBER() OVER (PARTITION BY f.campaign_id ORDER BY f.id) AS assignment_order,
        COALESCE(f.created_at, NOW()) AS created_at,
        f.created_by AS created_by,
        f.updated_at AS updated_at,
        f.updated_by AS updated_by,
        TRIM(CONCAT_WS(' ', c.campaign_title, f.form_name, f.form_desc)) AS search_string
    FROM form f
    JOIN campaigns c ON c.id = f.campaign_id
    WHERE f.campaign_id IS NOT NULL
      AND f.campaign_id <> 0
      AND COALESCE(f.is_deleted, 0) = 0
      AND COALESCE(c.is_deleted, 0) = 0
) candidate
WHERE NOT EXISTS (
    SELECT 1
    FROM campaign_form cf
    WHERE cf.form_id = candidate.form_id
);