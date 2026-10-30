CREATE TABLE project_commission_agreements (
 project_id UUID PRIMARY KEY REFERENCES freelance_projects(id), freelancer_user_id UUID NOT NULL REFERENCES users(id),
 project_amount NUMERIC(12,2) NOT NULL, platform_percentage NUMERIC(5,2) NOT NULL,
 first_project_exempt BOOLEAN NOT NULL, agreed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX one_free_project_per_professional ON project_commission_agreements(freelancer_user_id) WHERE first_project_exempt;
-- Preserve historical contracts; never apply a new promotion retroactively.
INSERT INTO project_commission_agreements(project_id,freelancer_user_id,project_amount,platform_percentage,first_project_exempt)
SELECT id,selected_freelancer_user_id,COALESCE(budget,0),5,false FROM freelance_projects
WHERE selected_freelancer_user_id IS NOT NULL AND status IN ('IN_PROGRESS','PAUSED','COMPLETED','CANCELLED');
CREATE FUNCTION service_contract_payment_events() RETURNS TRIGGER AS $$
DECLARE contract service_contracts%ROWTYPE;
BEGIN
 IF TG_OP='INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
   INSERT INTO in_app_notifications(user_id,category,title,message,event_key)
   VALUES(NEW.client_user_id,'PAYMENT','Estado de pago actualizado','Estado del pago: '||NEW.status,'escrow:'||NEW.id||':'||NEW.status),
         (NEW.freelancer_user_id,'PAYMENT','Estado de pago actualizado','Estado del pago: '||NEW.status,'escrow:'||NEW.id||':'||NEW.status)
   ON CONFLICT DO NOTHING;
   IF NEW.status='RELEASED' THEN
     UPDATE service_contracts SET status='COMPLETED' WHERE milestone_id=NEW.milestone_id AND status='ACCEPTED' RETURNING * INTO contract;
     IF FOUND THEN
       UPDATE freelance_projects SET status='COMPLETED' WHERE id=contract.project_id AND status='IN_PROGRESS';
       UPDATE services SET sales=sales+1 WHERE id=contract.service_id;
     END IF;
   END IF;
 END IF;
 RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER escrow_notification_and_contract_completion AFTER INSERT OR UPDATE OF status ON escrow
FOR EACH ROW EXECUTE FUNCTION service_contract_payment_events();
