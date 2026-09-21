CREATE TABLE interview_questions (
                                     id VARCHAR(100) PRIMARY KEY,
                                     interview_id VARCHAR(100) NOT NULL,
                                     content VARCHAR(2000) NOT NULL,
                                     audio_url VARCHAR(500),
                                     CONSTRAINT fk_interview_questions_interview
                                         FOREIGN KEY (interview_id)
                                             REFERENCES interviews (id)
                                             ON DELETE CASCADE
);

CREATE TABLE interview_answers (
                                   id VARCHAR(100) PRIMARY KEY,
                                   interview_id VARCHAR(100) NOT NULL,
                                   question_id VARCHAR(100) NOT NULL,
                                   content VARCHAR(4000) NOT NULL,
                                   score INTEGER NOT NULL,
                                   CONSTRAINT fk_interview_answers_interview
                                       FOREIGN KEY (interview_id)
                                           REFERENCES interviews (id)
                                           ON DELETE CASCADE,
                                   CONSTRAINT fk_interview_answers_question
                                       FOREIGN KEY (question_id)
                                           REFERENCES interview_questions (id)
                                           ON DELETE CASCADE
);

CREATE INDEX idx_interview_questions_interview_id
    ON interview_questions (interview_id);

CREATE INDEX idx_interview_answers_interview_id
    ON interview_answers (interview_id);

CREATE INDEX idx_interview_answers_question_id
    ON interview_answers (question_id);