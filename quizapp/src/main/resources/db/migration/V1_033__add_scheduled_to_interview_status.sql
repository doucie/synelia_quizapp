-- Migration V1_033: Add SCHEDULED to interview_status ENUM
-- Date: 17/11/2025
-- Description: Add SCHEDULED status to interviews table to support scheduled interviews

ALTER TABLE interviews 
MODIFY COLUMN interview_status ENUM('PENDING', 'SCHEDULED', 'STARTED', 'OVER', 'POSTPONED', 'ARCHIVED') NOT NULL DEFAULT 'PENDING';
