CREATE TABLE job_posts (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(5000) NOT NULL,
    location VARCHAR(120) NOT NULL,
    job_type VARCHAR(30) NOT NULL,
    salary_min NUMERIC(12, 2) NOT NULL,
    salary_max NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    vacancies INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY,
    job_post_id UUID NOT NULL,
    candidate_user_id UUID NOT NULL,
    cv_url VARCHAR(500),
    cover_letter VARCHAR(2000) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_job_applications_job_post
        FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_job_posts_company_id ON job_posts(company_id);
CREATE INDEX idx_job_posts_status ON job_posts(status);
CREATE INDEX idx_job_posts_type ON job_posts(job_type);
CREATE INDEX idx_job_posts_location ON job_posts(location);
CREATE INDEX idx_job_posts_created_at ON job_posts(created_at);

CREATE INDEX idx_job_applications_job_post_id ON job_applications(job_post_id);
CREATE INDEX idx_job_applications_candidate_user_id ON job_applications(candidate_user_id);
CREATE UNIQUE INDEX uq_job_applications_job_post_candidate
    ON job_applications(job_post_id, candidate_user_id);

CREATE TABLE recruitment_automation_configs (
    job_post_id UUID PRIMARY KEY,
    automation_level VARCHAR(20) NOT NULL,
    auto_send_interview_invites BOOLEAN NOT NULL DEFAULT FALSE,
    auto_interview_timeout_minutes INTEGER,
    screening_criteria JSONB,
    webhook_url VARCHAR(500),
    configured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_recruitment_automation_configs_job_post
        FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_recruitment_automation_configs_level ON recruitment_automation_configs(automation_level);