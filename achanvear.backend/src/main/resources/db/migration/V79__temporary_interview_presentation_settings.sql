CREATE TABLE interview_presentation_settings (
    interview_id VARCHAR(36) PRIMARY KEY REFERENCES interviews(id) ON DELETE CASCADE,
    question_count INTEGER NOT NULL DEFAULT 3 CHECK (question_count BETWEEN 1 AND 15),
    time_limit_minutes INTEGER NOT NULL DEFAULT 5 CHECK (time_limit_minutes BETWEEN 1 AND 20),
    case_code VARCHAR(40) NOT NULL DEFAULT 'java_calculator' CHECK (case_code='java_calculator'),
    valid_until TIMESTAMPTZ NOT NULL
);
