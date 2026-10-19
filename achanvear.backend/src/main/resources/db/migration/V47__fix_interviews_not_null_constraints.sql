-- Fix NOT NULL constraints that conflict with JPA entity mapping
-- V14 uses interviewer_profile_code; V49 renames it to interviewer_code.
-- Support both fresh databases and schemas where the rename already happened.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'interviews'
          AND column_name = 'interviewer_code'
    ) THEN
        ALTER TABLE interviews ALTER COLUMN interviewer_code DROP NOT NULL;
    ELSE
        ALTER TABLE interviews ALTER COLUMN interviewer_profile_code DROP NOT NULL;
    END IF;
END $$;
ALTER TABLE interviews ALTER COLUMN interviewer_style DROP NOT NULL;
