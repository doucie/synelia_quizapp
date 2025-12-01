-- Add interview_evaluations_link column to interviews table
-- This column will store a unique 8-character lowercase alphanumeric string
-- Generated automatically when an interview status changes to STARTED

ALTER TABLE interviews
ADD COLUMN interview_evaluations_link VARCHAR(8) AFTER meet_link;

-- Create unique index on interview_evaluations_link
-- Note: The application ensures the link is always generated in lowercase
CREATE UNIQUE INDEX idx_interviews_evaluation_link 
ON interviews (interview_evaluations_link);

-- Add comment to explain the column
ALTER TABLE interviews 
MODIFY COLUMN interview_evaluations_link VARCHAR(8) 
COMMENT 'Unique 8-character lowercase alphanumeric link for interview evaluation. Generated when interview status changes to STARTED.';
