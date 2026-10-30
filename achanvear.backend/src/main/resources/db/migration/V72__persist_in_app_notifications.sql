CREATE TABLE in_app_notifications (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 category VARCHAR(20) NOT NULL CHECK(category IN ('JOB','INTERVIEW','PAYMENT','APPLICATION','REPORT','COMMISSION')),
 title VARCHAR(200) NOT NULL, message TEXT NOT NULL, event_key VARCHAR(160) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, read_at TIMESTAMPTZ,
 UNIQUE(user_id,event_key)
);
CREATE INDEX in_app_notifications_user_date ON in_app_notifications(user_id,created_at DESC);
CREATE INDEX in_app_notifications_unread ON in_app_notifications(user_id) WHERE read_at IS NULL;
CREATE FUNCTION notify_application_submitted() RETURNS TRIGGER AS $$
DECLARE owner_id UUID;
BEGIN
 SELECT c.owner_user_id INTO owner_id FROM job_posts j JOIN companies c ON c.id=j.company_id WHERE j.id=NEW.job_post_id;
 INSERT INTO in_app_notifications(user_id,category,title,message,event_key)
 VALUES(NEW.candidate_user_id,'APPLICATION','Postulacion recibida','Tu postulacion fue registrada.','application:'||NEW.id),
 (owner_id,'APPLICATION','Nueva postulacion','Recibiste una postulacion a tu empleo.','application:'||NEW.id)
 ON CONFLICT DO NOTHING;
 RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER notify_application AFTER INSERT ON job_applications FOR EACH ROW EXECUTE FUNCTION notify_application_submitted();
CREATE FUNCTION notify_interview_schedule() RETURNS TRIGGER AS $$
BEGIN
 INSERT INTO in_app_notifications(user_id,category,title,message,event_key)
 VALUES(CAST(NEW.candidate_id AS UUID),'INTERVIEW','Entrevista disponible','Selecciona un horario para tu entrevista.','schedule:'||NEW.id)
 ON CONFLICT DO NOTHING;
 RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER notify_schedule AFTER INSERT ON interview_schedules FOR EACH ROW EXECUTE FUNCTION notify_interview_schedule();
