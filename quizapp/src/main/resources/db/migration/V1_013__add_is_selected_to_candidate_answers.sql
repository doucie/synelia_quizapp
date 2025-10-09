-- Migration: Add is_selected column to candidate_answers table
-- Description: Adds a boolean flag to track whether a candidate selected this answer
--              This allows tracking all answer options (selected and not selected)
-- Date: 2025-10-09

-- Add is_selected column
ALTER TABLE candidate_answers 
ADD COLUMN is_selected BOOLEAN NOT NULL DEFAULT FALSE 
COMMENT 'Indicates whether the candidate selected this answer option';

-- Add index for better performance when filtering selected answers
CREATE INDEX idx_candidate_answers_is_selected ON candidate_answers(is_selected);

-- Add composite index for common query pattern: application + question + selected
CREATE INDEX idx_candidate_answers_app_question_selected ON candidate_answers(application_id, question_id, is_selected);

-- Update table comment
ALTER TABLE candidate_answers COMMENT = 'Table storing candidate answer selections with selection status';
