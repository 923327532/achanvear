-- Agregar columnas faltantes a freelance_projects
-- Estas columnas existen en la entidad JPA pero nunca se agregaron via migración

ALTER TABLE freelance_projects
    ADD COLUMN IF NOT EXISTS subcategory VARCHAR(120),
    ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50),
    ADD COLUMN IF NOT EXISTS skills TEXT,
    ADD COLUMN IF NOT EXISTS budget_type VARCHAR(30),
    ADD COLUMN IF NOT EXISTS modality VARCHAR(30),
    ADD COLUMN IF NOT EXISTS provider_type VARCHAR(30),
    ADD COLUMN IF NOT EXISTS attachments TEXT,
    ADD COLUMN IF NOT EXISTS currency VARCHAR(10),
    ADD COLUMN IF NOT EXISTS language VARCHAR(50),
    ADD COLUMN IF NOT EXISTS min_budget NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS max_budget NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS hourly_rate_min NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS hourly_rate_max NUMERIC(12, 2);

-- Hacer budget nullable ya que ahora puede ser opcional según el tipo de presupuesto
ALTER TABLE freelance_projects ALTER COLUMN budget DROP NOT NULL;
