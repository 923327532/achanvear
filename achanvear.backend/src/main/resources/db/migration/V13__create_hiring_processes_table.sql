CREATE TABLE hiring_processes (
                                  id VARCHAR(36) PRIMARY KEY,
                                  job_id VARCHAR(36) NOT NULL,
                                  candidate_id VARCHAR(36) NOT NULL,
                                  stage VARCHAR(50) NOT NULL,
                                  theory_interview_pass_score INTEGER NOT NULL,
                                  technical_interview_pass_score INTEGER NOT NULL,
                                  max_candidates_per_screening_request INTEGER NOT NULL
);

CREATE INDEX idx_hiring_processes_job_id ON hiring_processes(job_id);
CREATE INDEX idx_hiring_processes_candidate_id ON hiring_processes(candidate_id);
CREATE UNIQUE INDEX ux_hiring_processes_job_candidate ON hiring_processes(job_id, candidate_id);