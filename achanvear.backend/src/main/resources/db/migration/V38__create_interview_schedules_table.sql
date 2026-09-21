CREATE TABLE interview_schedules (
    id VARCHAR(36) PRIMARY KEY,
    hiring_process_id VARCHAR(36) NOT NULL,
    candidate_id VARCHAR(36) NOT NULL,
    job_id VARCHAR(36) NOT NULL,
    interview_type VARCHAR(20) NOT NULL,

    slot1_date_time VARCHAR(30),
    slot1_status VARCHAR(20),

    slot2_date_time VARCHAR(30),
    slot2_status VARCHAR(20),

    slot3_date_time VARCHAR(30),
    slot3_status VARCHAR(20),

    chosen_slot_index INTEGER,
    chosen_date_time VARCHAR(30),

    interview_token VARCHAR(36),
    token_status VARCHAR(20),

    status VARCHAR(30) NOT NULL
);

CREATE INDEX idx_interview_schedules_hiring_process ON interview_schedules(hiring_process_id, interview_type);
CREATE INDEX idx_interview_schedules_token ON interview_schedules(interview_token);
