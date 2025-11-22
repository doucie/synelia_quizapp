-- Add admin_mode column to users table
ALTER TABLE `user` ADD COLUMN admin_mode BOOLEAN DEFAULT FALSE;

-- Update existing records to have admin_mode = false
UPDATE `user` SET admin_mode = FALSE WHERE id > 0 AND admin_mode IS NULL;