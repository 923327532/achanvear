-- Fix column name: V14 creó la columna como interviewer_profile_code
-- pero la JPA entity mapea a interviewer_code
-- V47 intentó ALTER interviewer_code, pero esa columna no existe en V14
-- Esta migración renombra la columna si aún se llama interviewer_profile_code
-- y dropea NOT NULL en ambas columnas
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'interviews' AND column_name = 'interviewer_profile_code'
    ) THEN
        ALTER TABLE interviews RENAME COLUMN interviewer_profile_code TO interviewer_code;
    END IF;
END $$;
ALTER TABLE interviews ALTER COLUMN interviewer_code DROP NOT NULL;
ALTER TABLE interviews ALTER COLUMN interviewer_style DROP NOT NULL;
