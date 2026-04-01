-- V1_007 : Table invitation_code pour le système d'inscription par invitation
CREATE TABLE IF NOT EXISTS invitation_code (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    role            VARCHAR(30)  NOT NULL DEFAULT 'recruiter',
    code            VARCHAR(50)  NOT NULL,
    is_used         BIT(1)       NOT NULL DEFAULT 0,
    expired_at      DATETIME     NOT NULL,
    created_by      INT UNSIGNED,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     DEFAULT NULL,
    updated_by      INT UNSIGNED,
    is_deleted      BIT(1)       NOT NULL DEFAULT 0,
    search_string   TEXT,
    UNIQUE KEY uk_invitation_code (code),
    KEY idx_invitation_email (email),
    KEY idx_invitation_expired (expired_at),
    CONSTRAINT fk_invitation_created_by FOREIGN KEY (created_by) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
