ALTER TABLE interviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Actualizar registros existentes con valores por defecto
UPDATE interviews SET created_at = NOW() WHERE created_at IS NULL;
UPDATE interviews SET updated_at = NOW() WHERE updated_at IS NULL;

-- Hacer NOT NULL después de actualizar
ALTER TABLE interviews ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE interviews ALTER COLUMN updated_at SET NOT NULL;