-- =============================================================================
-- V1_002 : Ajout contraintes UNIQUE sur username et email
-- =============================================================================

ALTER TABLE `user`
    ADD UNIQUE KEY uk_user_username (username),
    ADD UNIQUE KEY uk_user_email (email);
