-- Migration V1_009: Add motivation_letter column to applications table
-- Date: 2025-10-03
-- Description: Add motivation letter field to store candidate's motivation text

ALTER TABLE applications 
ADD COLUMN motivation_letter TEXT NULL COMMENT 'Lettre de motivation du candidat';
