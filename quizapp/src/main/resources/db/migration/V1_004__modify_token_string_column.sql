-- Modification de la colonne token_string pour réduire la taille et changer le collation
-- Migration: V1_004__modify_token_string_column.sql
-- Date: 2025-10-02
-- Description: Réduction de la taille de token_string de 255 à 20 caractères et changement du collation pour ignorer la casse

-- Modifier la colonne token_string de la table source_token
ALTER TABLE source_token
MODIFY COLUMN token_string VARCHAR(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Modifier la colonne token_string de la table candidate_token
ALTER TABLE candidate_token
MODIFY COLUMN token_string VARCHAR(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;

-- Commentaires:
-- - La taille passe de 255 à 20 caractères pour optimiser l'espace et la performance
-- - Le collation utf8mb4_unicode_ci permet de ne pas prendre la casse en compte lors des comparaisons
-- - Pour source_token, la colonne reste NOT NULL
-- - Pour candidate_token, la colonne peut être NULL (comme dans l'entité JPA)