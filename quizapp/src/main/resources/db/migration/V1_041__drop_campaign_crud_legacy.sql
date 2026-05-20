-- =============================================
-- V1_041 : Suppression finale du legacy campaign_crud
-- Nettoie les permissions globales devenues mortes puis supprime la table
-- =============================================

DELETE FROM `user_permission_override`
WHERE `functionality` IN (
    'VIEW_CAMPAIGN_CRUD',
    'CREATE_CAMPAIGN_CRUD',
    'UPDATE_CAMPAIGN_CRUD',
    'DELETE_CAMPAIGN_CRUD'
);

DELETE FROM `business_group_permission`
WHERE `functionality` IN (
    'VIEW_CAMPAIGN_CRUD',
    'CREATE_CAMPAIGN_CRUD',
    'UPDATE_CAMPAIGN_CRUD',
    'DELETE_CAMPAIGN_CRUD'
);

DELETE FROM `system_role_permission`
WHERE `functionality` IN (
    'VIEW_CAMPAIGN_CRUD',
    'CREATE_CAMPAIGN_CRUD',
    'UPDATE_CAMPAIGN_CRUD',
    'DELETE_CAMPAIGN_CRUD'
);

DROP TABLE IF EXISTS `campaign_crud`;