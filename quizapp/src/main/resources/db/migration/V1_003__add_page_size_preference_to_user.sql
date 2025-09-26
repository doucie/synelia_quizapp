-- Ajout du champ page_size_preference à la table user
-- Migration: V1_003__add_page_size_preference_to_user.sql
-- Date: 2025-09-26
-- Description: Ajout d'un champ pour stocker la préférence de taille de page de chaque utilisateur

-- Ajouter la colonne page_size_preference avec une valeur par défaut de 10
ALTER TABLE user ADD COLUMN page_size_preference INT NULL DEFAULT 10;

-- Commentaire:
-- Ce champ permet à chaque utilisateur de définir sa taille de page préférée
-- La valeur par défaut est 10 éléments par page
-- Le champ peut être NULL pour utiliser la valeur par défaut