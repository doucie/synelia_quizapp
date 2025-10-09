-- Migration: Add quiz_level column to applications table
-- Description: Adds a column to track the last question order the candidate answered
--              This allows resuming the quiz from where the candidate left off
-- Date: 2025-10-09

-- Add quiz_level column
ALTER TABLE applications 
ADD COLUMN quiz_level INT NULL DEFAULT NULL 
COMMENT 'Order of the last question answered by the candidate (for progress tracking)';

-- Add index for better performance when querying quiz progress
CREATE INDEX idx_applications_quiz_level ON applications(quiz_level);

-- Add composite index for common query pattern: id + quiz_level
CREATE INDEX idx_applications_id_quiz_level ON applications(id, quiz_level);

-- Update table comment
ALTER TABLE applications COMMENT = 'Table storing candidate applications with quiz progress tracking';
