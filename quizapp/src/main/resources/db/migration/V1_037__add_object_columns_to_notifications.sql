-- Add missing columns to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS object_table_name VARCHAR(100) AFTER search_string,
ADD COLUMN IF NOT EXISTS object_table_id INT AFTER object_table_name;
