-- =============================================
-- V1_018 : Données de test — groupes métiers,
--          associations utilisateurs et overrides
-- =============================================

-- =============================================
-- 1. BUSINESS_GROUPS (3 groupes)
-- =============================================
INSERT INTO `business_group` (`id`, `group_name`, `group_desc`, `created_at`, `created_by`, `is_deleted`, `search_string`)
VALUES
    (1, 'Recrutement',    'Équipe en charge du sourcing et des entretiens candidats',       NOW(), 1, FALSE, 'recrutement sourcing entretiens'),
    (2, 'Gestion RH',    'Gestion administrative des ressources humaines',                  NOW(), 1, FALSE, 'gestion rh ressources humaines'),
    (3, 'Communication',  'Équipe communication interne et marque employeur',                NOW(), 1, FALSE, 'communication marque employeur interne');

-- =============================================
-- 2. BUSINESS_GROUP_PERMISSION (permissions par groupe)
-- =============================================
INSERT INTO `business_group_permission` (`business_group_id`, `functionality`, `created_at`, `is_deleted`)
VALUES
    -- Groupe Recrutement : accès complet campagnes, candidatures, entretiens
    (1, 'VIEW_CAMPAIGNS',    NOW(), FALSE),
    (1, 'CREATE_CAMPAIGNS',  NOW(), FALSE),
    (1, 'UPDATE_CAMPAIGNS',  NOW(), FALSE),
    (1, 'VIEW_APPLICATIONS', NOW(), FALSE),
    (1, 'CREATE_APPLICATIONS', NOW(), FALSE),
    (1, 'UPDATE_APPLICATIONS', NOW(), FALSE),
    (1, 'VIEW_INTERVIEWS',   NOW(), FALSE),
    (1, 'CREATE_INTERVIEWS',  NOW(), FALSE),
    (1, 'VIEW_EVALUATIONS',  NOW(), FALSE),
    (1, 'CREATE_EVALUATIONS', NOW(), FALSE),
    -- Groupe Gestion RH : accès utilisateurs, départements, spécialités
    (2, 'VIEW_USER',         NOW(), FALSE),
    (2, 'CREATE_USER',       NOW(), FALSE),
    (2, 'UPDATE_USER',       NOW(), FALSE),
    (2, 'VIEW_DEPARTMENTS',  NOW(), FALSE),
    (2, 'CREATE_DEPARTMENTS', NOW(), FALSE),
    (2, 'VIEW_SPECIALITIES', NOW(), FALSE),
    (2, 'CREATE_SPECIALITIES', NOW(), FALSE),
    -- Groupe Communication : notifications, templates email
    (3, 'VIEW_NOTIFICATIONS',  NOW(), FALSE),
    (3, 'CREATE_NOTIFICATIONS', NOW(), FALSE),
    (3, 'VIEW_EMAIL_TEMPLATE', NOW(), FALSE),
    (3, 'CREATE_EMAIL_TEMPLATE', NOW(), FALSE);

-- =============================================
-- 3. USER_BUSINESS_GROUP (associations + 1 modérateur)
-- user 2 (Marie, ADMIN)  → Recrutement (modératrice) + Gestion RH
-- user 3 (Jean, RECRUITER) → Recrutement + Communication
-- =============================================
INSERT INTO `user_business_group` (`user_id`, `business_group_id`, `is_moderator`, `created_at`, `created_by`, `is_deleted`)
VALUES
    (2, 1, TRUE,  NOW(), 1, FALSE),
    (2, 2, FALSE, NOW(), 1, FALSE),
    (3, 1, FALSE, NOW(), 1, FALSE),
    (3, 3, FALSE, NOW(), 1, FALSE);

-- =============================================
-- 4. USER_PERMISSION_OVERRIDE (3 surcharges)
-- Jean (user 3, UTILISATEUR) :
--   - GRANT DELETE_CAMPAIGNS  (n'a pas ce droit de base)
--   - DENY  CREATE_EVALUATIONS (on lui retire ce droit)
-- Marie (user 2, ADMIN) :
--   - GRANT MANAGE_SYSTEM_ROLES (droit réservé SUPER_ADMIN, accordé en override)
-- =============================================
INSERT INTO `user_permission_override` (`user_id`, `functionality`, `is_allowed`, `created_at`, `created_by`, `is_deleted`)
VALUES
    (3, 'DELETE_CAMPAIGNS',     TRUE,  NOW(), 1, FALSE),
    (3, 'CREATE_EVALUATIONS',   FALSE, NOW(), 1, FALSE),
    (2, 'MANAGE_SYSTEM_ROLES',  TRUE,  NOW(), 1, FALSE);

-- =============================================
-- 5. Ajouter GROUP_CHANGE_REQUEST aux permissions ADMIN
--    (manquait dans V1_013)
-- =============================================
INSERT IGNORE INTO `system_role_permission` (`system_role`, `functionality`, `created_at`, `is_deleted`)
VALUES
    ('ADMIN', 'VIEW_GROUP_CHANGE_REQUEST',   NOW(), FALSE),
    ('ADMIN', 'CREATE_GROUP_CHANGE_REQUEST', NOW(), FALSE),
    ('ADMIN', 'UPDATE_GROUP_CHANGE_REQUEST', NOW(), FALSE),
    ('ADMIN', 'DELETE_GROUP_CHANGE_REQUEST', NOW(), FALSE),
    ('UTILISATEUR', 'CREATE_GROUP_CHANGE_REQUEST', NOW(), FALSE),
    ('UTILISATEUR', 'VIEW_GROUP_CHANGE_REQUEST',   NOW(), FALSE);
