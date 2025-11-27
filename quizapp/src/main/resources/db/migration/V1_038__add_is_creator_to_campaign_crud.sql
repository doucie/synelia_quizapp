-- Modify is_creator column to use BOOLEAN type (avoid deprecated TINYINT(1))
ALTER TABLE campaign_crud 
MODIFY COLUMN is_creator BOOLEAN DEFAULT FALSE;

-- Update existing records: mark as creator where user is the campaign creator
SET SQL_SAFE_UPDATES = 0;

UPDATE campaign_crud cc
INNER JOIN campaigns c ON cc.campaign_id = c.id
SET cc.is_creator = 1
WHERE cc.user_id = c.created_by AND cc.is_admin = 1;

SET SQL_SAFE_UPDATES = 1;
