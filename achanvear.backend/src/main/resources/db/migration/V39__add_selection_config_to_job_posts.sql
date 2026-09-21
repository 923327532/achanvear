-- V39: Agregar campos de configuracion de seleccion a job_posts
-- Permite configurar modo de seleccion (MAX_APPLICANTS, FIXED_DATE, CONTINUOUS)
-- y parametros asociados

ALTER TABLE job_posts
    ADD COLUMN IF NOT EXISTS max_applicants INTEGER,
    ADD COLUMN IF NOT EXISTS closing_date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS required_score_threshold DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS selected_candidates_count INTEGER,
    ADD COLUMN IF NOT EXISTS selection_mode VARCHAR(30);
