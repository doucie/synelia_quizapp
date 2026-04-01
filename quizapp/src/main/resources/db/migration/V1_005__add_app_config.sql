-- =============================================================
-- V1_005 : Table de configuration générale de l'application
-- =============================================================

CREATE TABLE IF NOT EXISTS app_config (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_name     VARCHAR(100)  NOT NULL,
    company_name    VARCHAR(255)  NOT NULL DEFAULT 'Synelia',
    logo_html       TEXT          NULL,
    primary_color   VARCHAR(7)    NOT NULL DEFAULT '#7C3AED',
    color_scheme    VARCHAR(30)   NOT NULL DEFAULT 'violet',
    is_active       BIT(1)        NOT NULL DEFAULT 0,
    created_at      DATETIME      NULL,
    updated_at      DATETIME      NULL,
    created_by      BIGINT        NULL,
    updated_by      BIGINT        NULL,
    is_deleted      BIT(1)        NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed : configuration par défaut (active)
INSERT INTO app_config (config_name, company_name, logo_html, primary_color, color_scheme, is_active, created_at, is_deleted)
VALUES (
    'Config Synelia par défaut',
    'Synelia',
    '<span style="font-weight:700;font-size:1.5rem;background:linear-gradient(135deg,#7C3AED,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Synelia</span>',
    '#7C3AED',
    'violet',
    1,
    NOW(),
    0
);
