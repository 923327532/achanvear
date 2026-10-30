-- Future completion events use their actual transition time. Unknown historical dates remain null.
CREATE FUNCTION record_interview_stage_completion() RETURNS TRIGGER AS $$
DECLARE job_uuid UUID; stage_name TEXT;
BEGIN
 IF NEW.status='COMPLETED' AND OLD.status IS DISTINCT FROM NEW.status THEN
   SELECT CAST(h.job_id AS UUID) INTO job_uuid FROM hiring_processes h WHERE h.id=NEW.hiring_process_id;
   IF job_uuid IS NULL THEN
     SELECT j.id INTO job_uuid FROM job_posts j WHERE CAST(j.id AS TEXT)=NEW.hiring_process_id;
   END IF;
   stage_name := CASE NEW.interview_type WHEN 'THEORY' THEN 'THEORY_INTERVIEW' WHEN 'TECHNICAL' THEN 'TECHNICAL_INTERVIEW' ELSE NULL END;
   IF job_uuid IS NOT NULL AND stage_name IS NOT NULL THEN
     INSERT INTO hiring_stage_completions VALUES(job_uuid,CAST(NEW.candidate_id AS UUID),stage_name,CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
   END IF;
 END IF;
 RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER interview_stage_completion AFTER UPDATE OF status ON interviews FOR EACH ROW EXECUTE FUNCTION record_interview_stage_completion();
