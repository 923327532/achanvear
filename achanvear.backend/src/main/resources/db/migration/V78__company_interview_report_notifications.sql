CREATE FUNCTION notify_company_interview_report() RETURNS TRIGGER AS $$
BEGIN
 IF NEW.status = 'COMPLETED' AND OLD.status IS DISTINCT FROM NEW.status THEN
   INSERT INTO in_app_notifications(user_id, category, title, message, event_key)
   SELECT c.owner_user_id, 'INTERVIEW', 'Informe de entrevista disponible',
          'La entrevista ' || CASE WHEN NEW.interview_type='THEORY' THEN 'teórica' ELSE 'práctica' END
          || ' ha finalizado para ' || j.title || '. Revisa el candidato en Pipeline y descarga su informe PDF.',
          'interview-report:' || NEW.id
   FROM job_posts j JOIN companies c ON c.id=j.company_id
   WHERE j.id::text=NEW.hiring_process_id OR j.id::text IN
     (SELECT hp.job_id::text FROM hiring_processes hp WHERE hp.id::text=NEW.hiring_process_id)
   ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER company_interview_report_notification AFTER UPDATE OF status ON interviews
FOR EACH ROW EXECUTE FUNCTION notify_company_interview_report();
