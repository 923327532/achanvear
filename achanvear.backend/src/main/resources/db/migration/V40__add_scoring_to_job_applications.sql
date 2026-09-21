-- V40: Agregar campos de scoring a job_applications
-- Almacena resultados del screening (Python), entrevista teorica y tecnica

ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS screening_score DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS screening_result BOOLEAN,
    ADD COLUMN IF NOT EXISTS theory_score INTEGER,
    ADD COLUMN IF NOT EXISTS technical_score INTEGER,
    ADD COLUMN IF NOT EXISTS final_status VARCHAR(30);
