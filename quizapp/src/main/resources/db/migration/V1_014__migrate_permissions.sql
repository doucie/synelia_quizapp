-- =============================================
-- V1_014 : Migration des données existantes
-- Renommage user_role + migration CampaignCrud/InterviewCrud → entity_permission
-- =============================================

-- =============================================
-- 1. Renommer les valeurs de user_role
-- =============================================
UPDATE `user` SET `user_role` = 'SUPER_ADMIN' WHERE `user_role` = 'super';
UPDATE `user` SET `user_role` = 'ADMIN' WHERE `user_role` = 'admin';
UPDATE `user` SET `user_role` = 'UTILISATEUR' WHERE `user_role` = 'recruiter';

-- =============================================
-- 2. Migrer campaign_crud → entity_permission
-- =============================================
-- canUpdate
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'CAMPAIGN', `campaign_id`, 'UPDATE', NOW(), FALSE
FROM `campaign_crud`
WHERE `can_update` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `campaign_id` IS NOT NULL;

-- canDelete
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'CAMPAIGN', `campaign_id`, 'DELETE', NOW(), FALSE
FROM `campaign_crud`
WHERE `can_delete` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `campaign_id` IS NOT NULL;

-- canEvaluate
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'CAMPAIGN', `campaign_id`, 'EVALUATE', NOW(), FALSE
FROM `campaign_crud`
WHERE `can_evaluate` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `campaign_id` IS NOT NULL;

-- isAdmin
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'CAMPAIGN', `campaign_id`, 'ADMIN', NOW(), FALSE
FROM `campaign_crud`
WHERE `is_admin` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `campaign_id` IS NOT NULL;

-- isCreator
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'CAMPAIGN', `campaign_id`, 'CREATOR', NOW(), FALSE
FROM `campaign_crud`
WHERE `is_creator` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `campaign_id` IS NOT NULL;

-- canPlanify
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'CAMPAIGN', `campaign_id`, 'PLANIFY', NOW(), FALSE
FROM `campaign_crud`
WHERE `can_planify` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `campaign_id` IS NOT NULL;

-- canAcceptPreScreen → ADVANCE_PIPELINE
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'CAMPAIGN', `campaign_id`, 'ADVANCE_PIPELINE', NOW(), FALSE
FROM `campaign_crud`
WHERE (`can_accept_pre_screen` = TRUE OR `can_accept_final` = TRUE) AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `campaign_id` IS NOT NULL
GROUP BY `user_id`, `campaign_id`;

-- follow
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'CAMPAIGN', `campaign_id`, 'FOLLOW', NOW(), FALSE
FROM `campaign_crud`
WHERE `follow` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `campaign_id` IS NOT NULL;

-- =============================================
-- 3. Migrer interview_crud → entity_permission (permissions seulement)
-- =============================================
-- canUpdate
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'INTERVIEW', `interview_id`, 'UPDATE', NOW(), FALSE
FROM `interview_crud`
WHERE `can_update` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `interview_id` IS NOT NULL;

-- canDelete
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'INTERVIEW', `interview_id`, 'DELETE', NOW(), FALSE
FROM `interview_crud`
WHERE `can_delete` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `interview_id` IS NOT NULL;

-- canEvaluate
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'INTERVIEW', `interview_id`, 'EVALUATE', NOW(), FALSE
FROM `interview_crud`
WHERE `can_evaluate` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `interview_id` IS NOT NULL;

-- isAdmin
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'INTERVIEW', `interview_id`, 'ADMIN', NOW(), FALSE
FROM `interview_crud`
WHERE `is_admin` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `interview_id` IS NOT NULL;

-- follow
INSERT INTO `entity_permission` (`user_id`, `entity_type`, `entity_id`, `permission_key`, `created_at`, `is_deleted`)
SELECT `user_id`, 'INTERVIEW', `interview_id`, 'FOLLOW', NOW(), FALSE
FROM `interview_crud`
WHERE `follow` = TRUE AND `is_deleted` = FALSE AND `user_id` IS NOT NULL AND `interview_id` IS NOT NULL;

-- =============================================
-- 4. Renommer interview_crud → interview_participant
-- Garde uniquement les champs de session (is_online, has_finished, last_ping_at)
-- =============================================
RENAME TABLE `interview_crud` TO `interview_participant`;
