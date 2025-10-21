-- Migration V1_022: Add application_id column to interviews table
-- Date: 21/10/2025
-- Description: Add foreign key relationship between interviews and applications

ALTER TABLE interviews
ADD COLUMN application_id INT UNSIGNED NULL,
ADD CONSTRAINT fk_interviews_application
    FOREIGN KEY (application_id)
    REFERENCES applications(id)
    ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
