update plans
set description = 'Plan gratuito por 30 dias para validar la empresa',
    max_projects = 1,
    max_invites_per_project = 0,
    updated_at = current_timestamp
where id = 'FREE';

delete from plan_benefits
where plan_id = 'FREE';

insert into plan_benefits (id, plan_id, benefit_text, sort_order) values
(gen_random_uuid(), 'FREE', '2 empleos por 30 dias', 1),
(gen_random_uuid(), 'FREE', '1 proyecto freelance por 30 dias', 2),
(gen_random_uuid(), 'FREE', 'Luego requiere suscripcion activa', 3);
