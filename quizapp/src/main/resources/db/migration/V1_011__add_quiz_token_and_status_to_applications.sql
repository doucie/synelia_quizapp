-- Migration: Add quiz_token and quiz_status to applications table
-- Description: Adds security token for quiz access and status tracking (pending, started, completed)
-- Date: 2025-10-09

-- Add quiz_token column (generated after email verification)
ALTER TABLE applications 
ADD COLUMN quiz_token VARCHAR(64) NULL UNIQUE COMMENT 'Unique token for secure quiz access, generated after email verification';

-- Add quiz_status column with ENUM
ALTER TABLE applications 
ADD COLUMN quiz_status ENUM('pending', 'started', 'completed') NOT NULL DEFAULT 'pending' 
COMMENT 'Quiz completion status: pending (not started), started (in progress), completed (finished)';

-- Add index on quiz_token for faster lookups
CREATE INDEX idx_applications_quiz_token ON applications(quiz_token);

-- Add index on quiz_status for filtering
CREATE INDEX idx_applications_quiz_status ON applications(quiz_status);

-- Add composite index for quiz access validation (application_id + quiz_token)
CREATE INDEX idx_applications_id_quiz_token ON applications(id, quiz_token);

-- Update table comment
ALTER TABLE applications COMMENT = 'Table storing candidate applications with secure quiz access via quiz_token';
