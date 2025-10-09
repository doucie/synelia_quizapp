-- Migration: Add order column to campaign_questions table
-- Description: Adds an order column to define the sequence of questions in a campaign
--              The order must be unique per campaign (composite unique constraint)
-- Date: 2025-10-09

-- Add order column
ALTER TABLE campaign_questions 
ADD COLUMN `order` INT NOT NULL DEFAULT 0 
COMMENT 'Order of the question in the campaign (starts at 1)';

-- Add composite unique constraint: campaign_id + order must be unique
ALTER TABLE campaign_questions 
ADD CONSTRAINT uk_campaign_questions_campaign_order 
UNIQUE KEY (campaign_id, `order`);

-- Add index for better performance when ordering questions
CREATE INDEX idx_campaign_questions_campaign_order ON campaign_questions(campaign_id, `order`);

-- Update table comment
ALTER TABLE campaign_questions COMMENT = 'Table linking campaigns to questions with ordering information';
