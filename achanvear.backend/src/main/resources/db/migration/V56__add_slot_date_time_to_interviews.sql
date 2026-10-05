ALTER TABLE interviews ADD COLUMN IF NOT EXISTS slot_date_time VARCHAR(30);

UPDATE interviews i
SET slot_date_time = s.chosen_date_time
FROM interview_schedules s
WHERE i.slot_date_time IS NULL
  AND s.chosen_date_time IS NOT NULL
  AND s.candidate_id = i.candidate_id
  AND s.job_id = i.hiring_process_id;
