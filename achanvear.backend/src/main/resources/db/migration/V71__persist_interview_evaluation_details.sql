CREATE TABLE interview_evaluation_details (
    interview_id VARCHAR(100) PRIMARY KEY REFERENCES interviews(id) ON DELETE CASCADE,
    communication_score INTEGER CHECK (communication_score BETWEEN 0 AND 100),
    evaluation_json TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
