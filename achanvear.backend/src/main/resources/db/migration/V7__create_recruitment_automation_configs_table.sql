CREATE TABLE IF NOT EXISTS recruitment_automation_configs (
    job_post_id UUID NOT NULL PRIMARY KEY,
    automation_level VARCHAR(30) NOT NULL,
    auto_send_interview_invites BOOLEAN NOT NULL DEFAULT FALSE,
    auto_interview_timeout_minutes BIGINT,
    screening_criteria VARCHAR(2000),
    webhook_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recruitment_automation_configs_job_post
        FOREIGN KEY (job_post_id)
        REFERENCES job_posts(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_recruitment_automation_configs_job_post_id
    ON recruitment_automation_configs(job_post_id);
