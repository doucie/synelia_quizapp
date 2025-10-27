-- Migration V1_029: Create decisions table
-- Description: Table for tracking all decisions made on applications, allowing to approve or cancel decisions and maintain a history

CREATE TABLE decisions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    decision_type ENUM(
        'PENDING',
        'PENDING_ARCHIVED',
        'SUBMITTED',
        'PRE_SCREEN_ACCEPTED',
        'PRE_SCREEN_REJECTED',
        'PRE_SCREEN_REJECTED_ARCHIVED',
        'INTERVIEWING',
        'FINAL_ACCEPTED',
        'FINAL_ACCEPTED_ARCHIVED',
        'FINAL_REJECTED',
        'FINAL_REJECTED_ARCHIVED'
    ) NOT NULL COMMENT 'Type of decision, same as application_status enum',
    decision_action ENUM('APPROVE', 'CANCEL') NOT NULL COMMENT 'Action taken: approve or cancel the decision',
    application_id INT UNSIGNED NOT NULL COMMENT 'Reference to the application',
    user_id INT UNSIGNED NOT NULL COMMENT 'Reference to the user who made the decision',
    created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT UNSIGNED NULL,
    updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT UNSIGNED NULL,
    is_deleted BOOLEAN NULL DEFAULT FALSE,
    search_string TEXT NULL COLLATE utf8mb4_general_ci,
    PRIMARY KEY (id),
    INDEX idx_application_id (application_id),
    INDEX idx_user_id (user_id),
    INDEX idx_decision_type (decision_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE decisions COMMENT = 'Table for tracking all decisions made on applications with full audit trail';