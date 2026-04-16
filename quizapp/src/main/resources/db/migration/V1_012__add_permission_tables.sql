-- =============================================
-- V1_012 : Ajout des tables de permissions
-- Rôles système + groupes métiers + surcharges
-- =============================================

-- Agrandir user_role pour supporter les nouvelles valeurs
ALTER TABLE `user` MODIFY COLUMN `user_role` VARCHAR(20) NULL;

-- =============================================
-- Table system_role_permission
-- Permissions de base par rôle système (ADMIN, UTILISATEUR)
-- SUPER_ADMIN n'a pas d'entrées : bypass total en code
-- =============================================
CREATE TABLE IF NOT EXISTS `system_role_permission` (
    `id`            INT           NOT NULL AUTO_INCREMENT,
    `system_role`   VARCHAR(20)   NOT NULL COMMENT 'ADMIN ou UTILISATEUR',
    `functionality` VARCHAR(100)  NOT NULL COMMENT 'Valeur de FunctionalityEnum',
    `created_at`    TIMESTAMP     NULL,
    `created_by`    INT           NULL,
    `updated_at`    TIMESTAMP     NULL,
    `updated_by`    INT           NULL,
    `is_deleted`    BOOLEAN       DEFAULT FALSE,
    PRIMARY KEY (`id`),
    CONSTRAINT `uq_system_role_functionality` UNIQUE (`system_role`, `functionality`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Table business_group
-- Groupes métiers customisables par entreprise
-- =============================================
CREATE TABLE IF NOT EXISTS `business_group` (
    `id`            INT           NOT NULL AUTO_INCREMENT,
    `group_name`    VARCHAR(100)  NOT NULL,
    `group_desc`    TEXT          NULL,
    `created_at`    TIMESTAMP     NULL,
    `created_by`    INT           NULL,
    `updated_at`    TIMESTAMP     NULL,
    `updated_by`    INT           NULL,
    `is_deleted`    BOOLEAN       DEFAULT FALSE,
    `search_string` TEXT          NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `uq_business_group_name` UNIQUE (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Table business_group_permission
-- Permissions d'un groupe métier
-- =============================================
CREATE TABLE IF NOT EXISTS `business_group_permission` (
    `id`                 INT           NOT NULL AUTO_INCREMENT,
    `business_group_id`  INT           NOT NULL,
    `functionality`      VARCHAR(100)  NOT NULL COMMENT 'Valeur de FunctionalityEnum',
    `created_at`         TIMESTAMP     NULL,
    `created_by`         INT           NULL,
    `updated_at`         TIMESTAMP     NULL,
    `updated_by`         INT           NULL,
    `is_deleted`         BOOLEAN       DEFAULT FALSE,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_bgp_business_group` FOREIGN KEY (`business_group_id`) REFERENCES `business_group`(`id`),
    CONSTRAINT `uq_bgp_group_functionality` UNIQUE (`business_group_id`, `functionality`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Table user_business_group
-- Pivot user ↔ groupe métier (0..n groupes par user)
-- =============================================
CREATE TABLE IF NOT EXISTS `user_business_group` (
    `id`                 INT           NOT NULL AUTO_INCREMENT,
    `user_id`            INT UNSIGNED  NOT NULL,
    `business_group_id`  INT           NOT NULL,
    `created_at`         TIMESTAMP     NULL,
    `created_by`         INT           NULL,
    `updated_at`         TIMESTAMP     NULL,
    `updated_by`         INT           NULL,
    `is_deleted`         BOOLEAN       DEFAULT FALSE,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_ubg_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `fk_ubg_business_group` FOREIGN KEY (`business_group_id`) REFERENCES `business_group`(`id`),
    CONSTRAINT `uq_user_business_group` UNIQUE (`user_id`, `business_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Table user_permission_override
-- Surcharges individuelles (GRANT/DENY)
-- Règle métier vérifiée en code : DENY ignoré si ADMIN + perm de base
-- =============================================
CREATE TABLE IF NOT EXISTS `user_permission_override` (
    `id`            INT           NOT NULL AUTO_INCREMENT,
    `user_id`       INT UNSIGNED  NOT NULL,
    `functionality` VARCHAR(100)  NOT NULL COMMENT 'Valeur de FunctionalityEnum',
    `is_allowed`    BOOLEAN       NOT NULL COMMENT 'TRUE=GRANT, FALSE=DENY',
    `created_at`    TIMESTAMP     NULL,
    `created_by`    INT           NULL,
    `updated_at`    TIMESTAMP     NULL,
    `updated_by`    INT           NULL,
    `is_deleted`    BOOLEAN       DEFAULT FALSE,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_upo_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `uq_user_functionality_override` UNIQUE (`user_id`, `functionality`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Table entity_permission
-- Permissions par entité spécifique (remplace CampaignCrud/InterviewCrud)
-- =============================================
CREATE TABLE IF NOT EXISTS `entity_permission` (
    `id`              INT           NOT NULL AUTO_INCREMENT,
    `user_id`         INT UNSIGNED  NOT NULL,
    `entity_type`     VARCHAR(50)   NOT NULL COMMENT 'CAMPAIGN, INTERVIEW, PIPELINE_TEMPLATE',
    `entity_id`       INT           NOT NULL,
    `permission_key`  VARCHAR(50)   NOT NULL COMMENT 'UPDATE, DELETE, EVALUATE, ADVANCE_PIPELINE, ADMIN, FOLLOW, PLANIFY',
    `created_at`      TIMESTAMP     NULL,
    `created_by`      INT           NULL,
    `updated_at`      TIMESTAMP     NULL,
    `updated_by`      INT           NULL,
    `is_deleted`      BOOLEAN       DEFAULT FALSE,
    `search_string`   TEXT          NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_ep_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `uq_entity_permission` UNIQUE (`user_id`, `entity_type`, `entity_id`, `permission_key`),
    INDEX `idx_entity_type_id` (`entity_type`, `entity_id`),
    INDEX `idx_ep_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
