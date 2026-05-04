ALTER TABLE email_template
    ADD COLUMN editable_variables_json TEXT NULL AFTER body_template;