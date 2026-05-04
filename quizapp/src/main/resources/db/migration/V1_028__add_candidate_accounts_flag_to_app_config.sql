ALTER TABLE app_config
    ADD COLUMN candidate_accounts_enabled TINYINT(1) NOT NULL DEFAULT 0
    AFTER color_scheme;