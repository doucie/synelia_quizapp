-- Retire the legacy seeded email presets and clear stale template links.

UPDATE email_template
SET preset_id = NULL
WHERE preset_id IN (
    SELECT legacy_presets.id
    FROM (
        SELECT id
        FROM email_template_preset
        WHERE (name = 'Minimal' AND category = 'MINIMAL')
           OR (name = 'Modern' AND category = 'MODERN')
           OR (name = 'Corporate' AND category = 'CORPORATE')
           OR (name = 'Colorful' AND category = 'COLORFUL')
           OR (name = 'Dark' AND category = 'DARK')
    ) legacy_presets
);

UPDATE email_template_preset
SET is_deleted = TRUE,
    updated_at = NOW()
WHERE is_deleted = FALSE
  AND (
      (name = 'Minimal' AND category = 'MINIMAL')
      OR (name = 'Modern' AND category = 'MODERN')
      OR (name = 'Corporate' AND category = 'CORPORATE')
      OR (name = 'Colorful' AND category = 'COLORFUL')
      OR (name = 'Dark' AND category = 'DARK')
  );