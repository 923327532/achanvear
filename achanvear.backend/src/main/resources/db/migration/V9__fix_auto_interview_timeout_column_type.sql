-- Cambiar el tipo de columna de INTEGER a BIGINT
ALTER TABLE recruitment_automation_configs
    ALTER COLUMN auto_interview_timeout_minutes TYPE BIGINT;
