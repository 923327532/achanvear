CREATE FUNCTION notify_published_job_opportunity() RETURNS TRIGGER AS $$
BEGIN
 IF NEW.status='PUBLISHED' AND (TG_OP='INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
   INSERT INTO in_app_notifications(user_id,category,title,message,event_key)
   SELECT fp.user_id,'JOB','Nueva vacante en tu industria',NEW.title,'job-opportunity:' || NEW.id
   FROM freelancer_profiles fp JOIN companies c ON c.id=NEW.company_id
   WHERE lower(fp.industry)=lower(c.industry) AND fp.status='ACTIVE'
     AND COALESCE(fp.availability_status,'OPEN_TO_OFFERS') NOT IN ('NOT_AVAILABLE','FREELANCE_ONLY')
   ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER published_job_opportunity AFTER INSERT OR UPDATE OF status ON job_posts
FOR EACH ROW EXECUTE FUNCTION notify_published_job_opportunity();

CREATE FUNCTION notify_matching_project_opportunity() RETURNS TRIGGER AS $$
BEGIN
 IF NEW.status='OPEN' THEN
   INSERT INTO in_app_notifications(user_id,category,title,message,event_key)
   SELECT fp.user_id,'JOB','Proyecto relacionado con tu perfil',NEW.title,'match:project:' || NEW.id
   FROM freelancer_profiles fp
   WHERE fp.status='ACTIVE' AND fp.user_id<>NEW.client_user_id
     AND COALESCE(fp.availability_status,'OPEN_TO_OFFERS')<>'NOT_AVAILABLE'
     AND (lower(fp.industry)=lower(NEW.category)
          OR (length(trim(fp.specialty))>=3 AND strpos(lower(NEW.title || ' ' || NEW.description),lower(trim(fp.specialty)))>0))
   ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER matching_project_opportunity AFTER INSERT ON freelance_projects
FOR EACH ROW EXECUTE FUNCTION notify_matching_project_opportunity();
