-- V34__enhance_services_table.sql
-- Agrega campos enriquecidos a la tabla services

ALTER TABLE services
    ADD COLUMN IF NOT EXISTS short_description      VARCHAR(300),
    ADD COLUMN IF NOT EXISTS subcategory             VARCHAR(100),
    ADD COLUMN IF NOT EXISTS tags                    TEXT,           -- JSON array: ["tag1","tag2"]
    ADD COLUMN IF NOT EXISTS modality                VARCHAR(30)     DEFAULT 'REMOTE',  -- PRESENTIAL, REMOTE, HYBRID
    ADD COLUMN IF NOT EXISTS coverage_type           VARCHAR(30)     DEFAULT 'LOCAL',   -- LOCAL, NATIONAL, INTERNATIONAL
    ADD COLUMN IF NOT EXISTS coverage_details        TEXT,           -- JSON: distritos, ciudades, paises
    ADD COLUMN IF NOT EXISTS schedule                TEXT,           -- JSON: horarios de atención
    ADD COLUMN IF NOT EXISTS billing_type            VARCHAR(30)     DEFAULT 'PER_PROJECT', -- PER_HOUR, PER_DAY, PER_PROJECT, MONTHLY, CUSTOM
    ADD COLUMN IF NOT EXISTS currency                VARCHAR(10)     DEFAULT 'PEN',
    ADD COLUMN IF NOT EXISTS whatsapp                VARCHAR(20),
    ADD COLUMN IF NOT EXISTS phone                   VARCHAR(20),
    ADD COLUMN IF NOT EXISTS email_contact           VARCHAR(255),
    ADD COLUMN IF NOT EXISTS video_urls              TEXT,           -- JSON array
    ADD COLUMN IF NOT EXISTS pdf_urls                TEXT,           -- JSON array
    ADD COLUMN IF NOT EXISTS certificate_urls        TEXT,           -- JSON array
    ADD COLUMN IF NOT EXISTS faqs                    TEXT,           -- JSON array: [{question, answer}]
    ADD COLUMN IF NOT EXISTS warranty_info           TEXT,
    ADD COLUMN IF NOT EXISTS cancellation_policy     TEXT,
    ADD COLUMN IF NOT EXISTS support_info            TEXT,
    ADD COLUMN IF NOT EXISTS response_time           VARCHAR(50),    -- "En menos de 1 hora", "En menos de 24 horas", etc.
    ADD COLUMN IF NOT EXISTS is_featured             BOOLEAN         DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_premium              BOOLEAN         DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_available            BOOLEAN         DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS available_immediately   BOOLEAN         DEFAULT FALSE;

-- Tabla de planes/paquetes del servicio
CREATE TABLE IF NOT EXISTS service_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    price           DECIMAL(12,2) NOT NULL,
    delivery_days   INTEGER,
    features        TEXT,           -- JSON array of features
    is_active       BOOLEAN         DEFAULT TRUE,
    sort_order      INTEGER         DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_plans_service ON service_plans(service_id);
