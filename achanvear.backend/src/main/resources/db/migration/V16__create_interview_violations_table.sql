CREATE TABLE interview_violations (
    id VARCHAR(100) PRIMARY KEY,
    interview_id VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    occurrence_count INTEGER NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_violations_interview
        FOREIGN KEY (interview_id)
        REFERENCES interviews (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_interview_violations_interview_id
    ON interview_violations (interview_id);

CREATE INDEX idx_interview_violations_occurred_at
    ON interview_violations (occurred_at);
