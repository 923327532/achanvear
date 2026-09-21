-- Remove NOT NULL from created_at and updated_at as JPA mapper doesn't set them
ALTER TABLE interviews ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE interviews ALTER COLUMN updated_at DROP NOT NULL;