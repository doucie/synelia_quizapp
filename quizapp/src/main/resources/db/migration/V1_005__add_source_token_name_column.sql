-- Ajout de la colonne source_token_name à la table source_token
-- Migration: V1_005__add_source_token_name_column.sql
-- Date: 2025-10-02
-- Description: Ajout d'un champ source_token_name pour nommer les tokens source

-- Ajouter la colonne source_token_name à la table source_token
ALTER TABLE source_token ADD COLUMN source_token_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;

-- Commentaire:
-- Ce champ permet de donner un nom descriptif aux tokens source
-- La taille de 100 caractères est suffisante pour un nom descriptif
-- Le champ peut être NULL pour maintenir la compatibilité avec les données existantes