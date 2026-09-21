CREATE TABLE interviews (
                            id VARCHAR(100) PRIMARY KEY,
                            hiring_process_id VARCHAR(100) NOT NULL,
                            candidate_id VARCHAR(100) NOT NULL,
                            type VARCHAR(50) NOT NULL,
                            status VARCHAR(50) NOT NULL,
                            interviewer_profile_code VARCHAR(50) NOT NULL,
                            interviewer_name VARCHAR(150) NOT NULL,
                            interviewer_style VARCHAR(150) NOT NULL,
                            interviewer_voice VARCHAR(50) NOT NULL,
                            score INTEGER,
                            recording_file_key VARCHAR(255),
                            recording_active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_interviews_hiring_process_id
    ON interviews (hiring_process_id);

CREATE INDEX idx_interviews_candidate_id
    ON interviews (candidate_id);

CREATE INDEX idx_interviews_status
    ON interviews (status);

CREATE INDEX idx_interviews_type
    ON interviews (type);