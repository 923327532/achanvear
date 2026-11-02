CREATE TABLE applications (
  id TEXT PRIMARY KEY CHECK (length(trim(id)) > 0),
  status TEXT NOT NULL CHECK (length(trim(status)) > 0),
  score NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100)
);

INSERT INTO applications (id, status, score) VALUES
  ('a1', 'new', 72),
  ('a2', 'interview', 88),
  ('a3', 'interview', 91);

CREATE INDEX applications_status_idx ON applications (status);

CREATE VIEW pipeline_summary AS
SELECT lower(trim(status)) AS status,
       count(*) AS count,
       round(avg(score), 2) AS average_score,
       CASE lower(trim(status))
         WHEN 'new' THEN 'Revisar perfil'
         WHEN 'interview' THEN 'Realizar entrevista'
         ELSE 'Revisar etapa'
       END AS next_action
FROM applications
GROUP BY lower(trim(status));

SELECT * FROM pipeline_summary ORDER BY status;

DO $$
BEGIN
  IF (SELECT average_score FROM pipeline_summary WHERE status='interview') <> 89.50 THEN
    RAISE EXCEPTION 'Fallo en promedio SQL';
  END IF;
  IF (SELECT count FROM pipeline_summary WHERE status='interview') <> 2 THEN
    RAISE EXCEPTION 'Fallo en agrupacion SQL';
  END IF;
END $$;
