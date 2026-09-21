-- V41: Agregar campos de seguimiento de seleccion a hiring_processes
-- Almacena listas de candidatos seleccionados/rechazados, IDs de schedules y reporte final

ALTER TABLE hiring_processes
    ADD COLUMN IF NOT EXISTS selected_candidates TEXT,
    ADD COLUMN IF NOT EXISTS rejected_candidates TEXT,
    ADD COLUMN IF NOT EXISTS schedule_ids TEXT,
    ADD COLUMN IF NOT EXISTS final_report TEXT;
