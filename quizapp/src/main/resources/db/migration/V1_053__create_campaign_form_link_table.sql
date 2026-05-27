CREATE TABLE campaign_form (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    campaign_id INT UNSIGNED NOT NULL,
    form_id INT UNSIGNED NOT NULL,
    assignment_order INT NULL,
    created_at DATETIME NULL,
    created_by INT NULL,
    updated_at DATETIME NULL,
    updated_by INT NULL,
    is_deleted BIT(1) NULL DEFAULT b'0',
    search_string TEXT NULL,
    active_campaign_id INT UNSIGNED GENERATED ALWAYS AS (
        CASE
            WHEN COALESCE(is_deleted, b'0') = b'0' THEN campaign_id
            ELSE NULL
        END
    ) STORED,
    active_form_id INT UNSIGNED GENERATED ALWAYS AS (
        CASE
            WHEN COALESCE(is_deleted, b'0') = b'0' THEN form_id
            ELSE NULL
        END
    ) STORED,
    PRIMARY KEY (id),
    CONSTRAINT fk_campaign_form_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    CONSTRAINT fk_campaign_form_form FOREIGN KEY (form_id) REFERENCES form(id),
    CONSTRAINT uk_campaign_form_active_link UNIQUE (active_campaign_id, active_form_id)
);

CREATE INDEX idx_campaign_form_campaign_id ON campaign_form (campaign_id);
CREATE INDEX idx_campaign_form_form_id ON campaign_form (form_id);
CREATE INDEX idx_campaign_form_assignment_order ON campaign_form (campaign_id, assignment_order);

INSERT INTO campaign_form (
    campaign_id,
    form_id,
    created_at,
    created_by,
    updated_at,
    updated_by,
    is_deleted,
    search_string
)
SELECT
    f.campaign_id,
    f.id,
    COALESCE(f.created_at, NOW()),
    f.created_by,
    f.updated_at,
    f.updated_by,
    b'0',
    TRIM(CONCAT_WS(' ', c.campaign_title, f.form_name, f.form_desc))
FROM form f
JOIN campaigns c ON c.id = f.campaign_id
WHERE f.campaign_id IS NOT NULL
  AND COALESCE(f.is_deleted, b'0') = b'0'
  AND COALESCE(c.is_deleted, b'0') = b'0';