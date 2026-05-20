-- V1_039 : etend entity_permission avec scope groupe + role (D-019).
--
-- Refs : L-audit-06-entity_permission.md LENTPER-020/021/022/023.
--
-- Changements :
--  * `user_id` devient NULL pour permettre les permissions scope groupe/role.
--  * Nouvelle colonne `business_group_id` (FK vers business_group).
--  * Nouvelle colonne `system_role` (varchar 20) pour scope role.
--  * Remplacement de l'ancien UNIQUE (user_id, entity_type, entity_id, permission_key)
--    par un index composite sur (entity_type, entity_id, permission_key).
--  * Contrainte CHECK : exactement un parmi (user_id, business_group_id, system_role)
--    doit etre non null.

ALTER TABLE entity_permission
    MODIFY COLUMN user_id INT UNSIGNED NULL,
    ADD COLUMN business_group_id INT NULL AFTER user_id,
    ADD COLUMN system_role VARCHAR(20) NULL AFTER business_group_id,
    DROP INDEX uq_entity_permission,
    ADD INDEX idx_ep_scope_entity_perm (entity_type, entity_id, permission_key),
    ADD INDEX idx_ep_business_group (business_group_id),
    ADD INDEX idx_ep_system_role (system_role),
    ADD CONSTRAINT chk_ep_exactly_one_scope CHECK (
        (CASE WHEN user_id           IS NULL THEN 0 ELSE 1 END
       + CASE WHEN business_group_id IS NULL THEN 0 ELSE 1 END
       + CASE WHEN system_role       IS NULL THEN 0 ELSE 1 END) = 1
    );
