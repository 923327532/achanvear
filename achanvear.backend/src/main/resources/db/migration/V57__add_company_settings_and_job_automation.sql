-- V57: Persistencia de configuracion de empresa (pendientes #1, #2, #3)
-- y separacion del modo de automatizacion (automation_level) en job_posts (#14).

-- Empresa: preferencias del agente IA (pendiente #1)
ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS ai_agent_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS match_score_threshold INTEGER DEFAULT 70;

-- Empresa: privacidad / visibilidad (pendiente #2)
ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS incognito_mode BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS show_contact_info BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS show_in_directory BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS visibility_notifications BOOLEAN NOT NULL DEFAULT FALSE;

-- Empresa: preferencias generales (idioma / zona horaria) (pendiente #3)
ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS language VARCHAR(20),
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(40);

-- Empleo: nivel de automatizacion (MANUAL/SEMI_AUTOMATED/FULLY_AUTOMATED),
-- independiente del modo de cierre (selection_mode) — pendiente #14.
ALTER TABLE job_posts
    ADD COLUMN IF NOT EXISTS automation_level VARCHAR(30);