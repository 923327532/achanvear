-- Fix NOT NULL constraints that conflict with JPA entity mapping
ALTER TABLE interviews ALTER COLUMN interviewer_code DROP NOT NULL;
ALTER TABLE interviews ALTER COLUMN interviewer_style DROP NOT NULL;