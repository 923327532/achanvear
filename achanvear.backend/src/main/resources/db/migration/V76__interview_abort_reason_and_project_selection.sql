ALTER TABLE interviews ADD COLUMN IF NOT EXISTS abort_reason TEXT;

CREATE FUNCTION notify_project_selection() RETURNS TRIGGER AS $$
BEGIN
 IF NEW.selected_freelancer_user_id IS NOT NULL
    AND NEW.selected_freelancer_user_id IS DISTINCT FROM OLD.selected_freelancer_user_id THEN
   INSERT INTO in_app_notifications(user_id,category,title,message,event_key)
   VALUES(NEW.selected_freelancer_user_id,'APPLICATION','Has sido seleccionado',
          'La empresa te seleccionó para el proyecto: ' || NEW.title,
          'project-selection:' || NEW.id || ':' || NEW.selected_freelancer_user_id)
   ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER project_selection_notification AFTER UPDATE OF selected_freelancer_user_id
ON freelance_projects FOR EACH ROW EXECUTE FUNCTION notify_project_selection();
