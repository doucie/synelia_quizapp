-- V1_051 : garantir une seule version publiee active par formulaire

-- Si plusieurs versions actives sont publiees pour un meme formulaire, conserver la plus haute version.
UPDATE form_version older
JOIN form_version newer
  ON newer.form_id = older.form_id
 AND newer.version_number > older.version_number
 AND COALESCE(newer.is_published, b'0') = b'1'
 AND COALESCE(newer.is_deleted, b'0') = b'0'
SET older.is_published = b'0'
WHERE COALESCE(older.is_published, b'0') = b'1'
  AND COALESCE(older.is_deleted, b'0') = b'0';

ALTER TABLE form_version
    ADD COLUMN published_form_id INT UNSIGNED
        GENERATED ALWAYS AS (
            CASE
                WHEN COALESCE(is_published, b'0') = b'1' AND COALESCE(is_deleted, b'0') = b'0' THEN form_id
                ELSE NULL
            END
        ) STORED,
    ADD CONSTRAINT uk_form_version_single_active_published
        UNIQUE (published_form_id);