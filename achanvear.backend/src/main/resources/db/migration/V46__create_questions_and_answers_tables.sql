-- Crear tablas que JPA espera (questions, answers) basadas en las existentes (interview_questions, interview_answers)
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(100) PRIMARY KEY,
    interview_id VARCHAR(100) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    order_number INTEGER NOT NULL DEFAULT 0,
    audio_url VARCHAR(500),
    CONSTRAINT fk_questions_interview
        FOREIGN KEY (interview_id)
            REFERENCES interviews (id)
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answers (
    id VARCHAR(100) PRIMARY KEY,
    interview_id VARCHAR(100) NOT NULL,
    question_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    score INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_answers_interview
        FOREIGN KEY (interview_id)
            REFERENCES interviews (id)
            ON DELETE CASCADE
);

CREATE INDEX idx_questions_interview_id ON questions (interview_id);
CREATE INDEX idx_answers_interview_id ON answers (interview_id);
CREATE INDEX idx_answers_question_id ON answers (question_id);