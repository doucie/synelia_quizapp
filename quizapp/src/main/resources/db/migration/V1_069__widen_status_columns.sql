ALTER TABLE applications MODIFY COLUMN application_status VARCHAR(50) NULL;
ALTER TABLE applications MODIFY COLUMN quiz_status VARCHAR(50) NOT NULL;
