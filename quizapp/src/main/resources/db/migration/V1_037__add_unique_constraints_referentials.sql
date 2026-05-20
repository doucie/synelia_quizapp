-- Add UNIQUE constraints (active rows only) on reference tables to prevent duplicates at DB level.
-- Aligns with audit items LDEPART-711 and LSPECIA-711.
-- Functional unique indexes (MySQL 8.0+) only enforce uniqueness when is_deleted is 0/NULL,
-- allowing soft-deleted rows to keep the same name without conflict.

CREATE UNIQUE INDEX uk_departments_name_active
    ON departments ((CASE WHEN is_deleted = 0 OR is_deleted IS NULL THEN department_name END));

CREATE UNIQUE INDEX uk_specialities_name_active
    ON specialities ((CASE WHEN is_deleted = 0 OR is_deleted IS NULL THEN speciality_name END));

-- Aligns with audit item LSMTCON-040: only one active SMTP config row allowed.
-- Functional unique index enforces a single row with is_active = 1 (and is_deleted = 0/NULL).
CREATE UNIQUE INDEX uk_smtp_config_one_active
    ON smtp_config ((CASE WHEN (is_active = 1) AND (is_deleted = 0 OR is_deleted IS NULL) THEN 1 END));
