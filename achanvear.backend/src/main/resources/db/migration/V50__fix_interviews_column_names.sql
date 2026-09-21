-- Fix column name mismatches between V14 schema and JPA entity InterviewJpaEntity
-- V14 creó la columna como "type", pero JPA mapea a "interview_type"
-- Usamos DO $$ para que sea tolerante si la columna ya fue renombrada
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'interviews' AND column_name = 'type'
    ) THEN
        ALTER TABLE interviews RENAME COLUMN type TO interview_type;
    END IF;
END $$;

-- Agregar columna python_session_id (nuevo campo en Interview domain model)
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS python_session_id VARCHAR(255);
