-- Confirmation de l'ENUM user_role avec super, admin et recruiter
-- Migration: V1_002__update_user_role_enum.sql
-- Date: 2025-08-26
-- Description: Confirmation que l'ENUM user_role contient 'super', 'admin' et 'recruiter'

-- Étape 1: S'assurer que l'ENUM contient les trois rôles souhaités
ALTER TABLE user MODIFY COLUMN user_role
ENUM('super', 'admin', 'recruiter')
NULL DEFAULT 'recruiter';

-- Commentaire:
-- Cette migration confirme que 'super', 'admin' et 'recruiter' sont les rôles autorisés
-- Toute autre valeur sera rejetée par MySQL
