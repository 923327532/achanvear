ALTER TABLE hiring_processes
    ADD COLUMN theory_interview_id_used BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN technical_interview_id_used BOOLEAN NOT NULL DEFAULT FALSE;
