-- Agregar columna notification_timing a recruitment_automation_configs
-- Define cuando se notifica al candidato si paso el screening:
--   IMMEDIATE: Apenas se evalua al candidato
--   AFTER_2_HOURS: 2 horas despues de la evaluacion (batch)
--   AFTER_CLOSING: Cuando se cierren las postulaciones

ALTER TABLE recruitment_automation_configs
    ADD COLUMN IF NOT EXISTS notification_timing VARCHAR(30) NOT NULL DEFAULT 'IMMEDIATE';

-- Actualizar registros existentes a IMMEDIATE (comportamiento actual)
UPDATE recruitment_automation_configs
    SET notification_timing = 'IMMEDIATE'
    WHERE notification_timing IS NULL;
