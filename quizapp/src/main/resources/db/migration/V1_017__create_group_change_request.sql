-- Create group_change_request table for tracking group membership change requests
CREATE TABLE group_change_request (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    target_group_id INT NOT NULL,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT UNSIGNED,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT UNSIGNED,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_gcr_user FOREIGN KEY (user_id) REFERENCES user(id),
    CONSTRAINT fk_gcr_target_group FOREIGN KEY (target_group_id) REFERENCES business_group(id),
    CONSTRAINT fk_gcr_processed_by FOREIGN KEY (processed_by) REFERENCES user(id)
);
