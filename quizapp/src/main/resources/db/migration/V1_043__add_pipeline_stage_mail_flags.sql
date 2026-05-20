-- V1_043 : flags mail sur pipeline_stage

ALTER TABLE pipeline_stage
    ADD COLUMN email_required BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN email_automatic BOOLEAN NOT NULL DEFAULT TRUE;