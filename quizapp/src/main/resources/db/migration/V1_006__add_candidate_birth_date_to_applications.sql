-- Ajout de la colonne candidate_birth_date à la table applications
-- Migration: V1_006__add_candidate_birth_date_to_applications.sql
-- Date: 2025-10-03
-- Description: Ajout du champ date de naissance pour les candidats

-- Ajouter la colonne candidate_birth_date à la table applications
ALTER TABLE applications ADD COLUMN candidate_birth_date DATE NULL;

-- Commentaire:
-- Ce champ permet de stocker la date de naissance des candidats
-- Le type DATE est approprié pour les dates sans heure
-- Le champ peut être NULL car il peut ne pas être fourni lors de la candidature
-- Cela permettra de calculer l'âge des candidats si nécessaire