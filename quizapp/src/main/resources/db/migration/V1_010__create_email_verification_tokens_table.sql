-- Migration V1_010: Create email_verification_tokens table
-- Description: Table for managing email verification tokens for candidate applications, user registrations, and password resets
CREATE TABLE email_verification_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    token_type ENUM('APPLICATION_VERIFICATION', 'PASSWORD_RESET', 'USER_REGISTRATION') NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    is_used BIT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    used_at DATETIME(6),
    application_id INT,
    user_id INT,
    PRIMARY KEY (id),
    INDEX idx_token (token),
    INDEX idx_email_type (email, token_type),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE email_verification_tokens COMMENT = 'Table for storing email verification tokens for candidate applications, user registrations, and password resets';