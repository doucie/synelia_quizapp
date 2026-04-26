-- Add is_moderator column to user_business_group table
ALTER TABLE user_business_group
ADD COLUMN is_moderator BOOLEAN NOT NULL DEFAULT FALSE;
