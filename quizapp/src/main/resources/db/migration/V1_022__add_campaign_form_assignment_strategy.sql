ALTER TABLE campaigns
    ADD COLUMN form_assignment_strategy VARCHAR(30) NULL AFTER pipeline_template_id,
    ADD COLUMN form_assignment_exhaustion_policy VARCHAR(20) NULL AFTER form_assignment_strategy;

UPDATE campaigns
SET form_assignment_strategy = 'RANDOM'
WHERE form_assignment_strategy IS NULL;

UPDATE campaigns
SET form_assignment_exhaustion_policy = 'BLOCK'
WHERE form_assignment_exhaustion_policy IS NULL;

ALTER TABLE source_token
    ADD COLUMN form_id INT UNSIGNED NULL AFTER campaign_id;

ALTER TABLE source_token
    ADD CONSTRAINT fk_source_token_form FOREIGN KEY (form_id) REFERENCES form(id);