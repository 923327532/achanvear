CREATE TABLE hiring_stage_completions (
    job_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stage VARCHAR(40) NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(job_id, candidate_id, stage)
);
-- Only submission has a trustworthy historical timestamp. Other old dates stay unknown.
INSERT INTO hiring_stage_completions(job_id,candidate_id,stage,completed_at)
SELECT job_post_id,candidate_user_id,'SUBMITTED',applied_at FROM job_applications ON CONFLICT DO NOTHING;
CREATE FUNCTION record_application_stage_completion() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO hiring_stage_completions VALUES(NEW.job_post_id,NEW.candidate_user_id,'SUBMITTED',NEW.applied_at) ON CONFLICT DO NOTHING;
  ELSE
    IF OLD.screening_score IS NULL AND NEW.screening_score IS NOT NULL THEN
      INSERT INTO hiring_stage_completions VALUES(NEW.job_post_id,NEW.candidate_user_id,'SCREENING',CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
    END IF;
    IF OLD.status = 'IN_REVIEW' AND NEW.status = 'SHORTLISTED' THEN
      INSERT INTO hiring_stage_completions VALUES(NEW.job_post_id,NEW.candidate_user_id,'SCREENING_REVIEW',CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER application_stage_completion AFTER INSERT OR UPDATE ON job_applications
FOR EACH ROW EXECUTE FUNCTION record_application_stage_completion();
CREATE FUNCTION record_hiring_stage_completion() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage IS DISTINCT FROM OLD.stage AND OLD.stage <> 'REJECTED' THEN
    INSERT INTO hiring_stage_completions VALUES(CAST(NEW.job_id AS UUID),CAST(NEW.candidate_id AS UUID),OLD.stage,CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER hiring_stage_completion AFTER UPDATE ON hiring_processes
FOR EACH ROW EXECUTE FUNCTION record_hiring_stage_completion();
