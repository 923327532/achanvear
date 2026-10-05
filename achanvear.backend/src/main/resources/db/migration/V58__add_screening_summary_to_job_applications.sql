ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS screening_summary VARCHAR(2000);

ALTER TABLE job_applications
    ALTER COLUMN cv_url DROP NOT NULL;
