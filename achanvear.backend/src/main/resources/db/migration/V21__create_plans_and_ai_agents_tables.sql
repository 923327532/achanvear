-- Tabla de planes configurables desde admin
create table plans (
    id varchar(50) primary key,
    name varchar(100) not null,
    description varchar(500),
    monthly_price numeric(10,2) not null default 0,
    yearly_price numeric(10,2) not null default 0,
    max_projects int not null default 1,
    max_invites_per_project int not null default 0,
    is_active boolean not null default true,
    is_popular boolean not null default false,
    sort_order int not null default 0,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Beneficios de cada plan (relación 1:N)
create table plan_benefits (
    id uuid primary key,
    plan_id varchar(50) not null references plans(id),
    benefit_text varchar(500) not null,
    sort_order int not null default 0,
    created_at timestamp not null default current_timestamp
);

-- Agentes IA configurables desde admin
create table ai_agents (
    id varchar(50) primary key,
    name varchar(100) not null,
    description varchar(500),
    avatar_url varchar(500),
    personality varchar(50) not null default 'professional',
    is_active boolean not null default true,
    sort_order int not null default 0,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Capacidades de cada agente IA
create table ai_agent_capabilities (
    id uuid primary key,
    agent_id varchar(50) not null references ai_agents(id),
    capability varchar(200) not null,
    created_at timestamp not null default current_timestamp
);

-- Datos iniciales: Planes
insert into plans (id, name, description, monthly_price, yearly_price, max_projects, max_invites_per_project, is_active, is_popular, sort_order) values
('FREE', 'Gratis', 'Plan por defecto - Siempre gratis', 0, 0, 1, 0, true, false, 1),
('BASIC', 'Básico', 'Para MYPES y startups', 29, 278, 10, 5, true, false, 2),
('PREMIUM', 'Premium', 'El más popular - Completo', 99, 950, 50, 10, true, true, 3),
('ENTERPRISE', 'Empresarial', 'Para corporaciones', 299, 2870, 999999, 20, true, false, 4);

-- Datos iniciales: Beneficios de planes
insert into plan_benefits (id, plan_id, benefit_text, sort_order) values
-- FREE
(gen_random_uuid(), 'FREE', '1 proyecto activo', 1),
(gen_random_uuid(), 'FREE', 'Postulaciones básicas', 2),
(gen_random_uuid(), 'FREE', '30 días de prueba', 3),
-- BASIC
(gen_random_uuid(), 'BASIC', '10 proyectos activos', 1),
(gen_random_uuid(), 'BASIC', '5 invitaciones directas', 2),
(gen_random_uuid(), 'BASIC', 'Soporte por email', 3),
-- PREMIUM
(gen_random_uuid(), 'PREMIUM', '50 proyectos activos', 1),
(gen_random_uuid(), 'PREMIUM', '10 invitaciones directas', 2),
(gen_random_uuid(), 'PREMIUM', 'Proyectos destacados', 3),
(gen_random_uuid(), 'PREMIUM', 'Soporte prioritario', 4),
-- ENTERPRISE
(gen_random_uuid(), 'ENTERPRISE', 'Proyectos ilimitados', 1),
(gen_random_uuid(), 'ENTERPRISE', '20 invitaciones directas', 2),
(gen_random_uuid(), 'ENTERPRISE', 'Proyectos destacados', 3),
(gen_random_uuid(), 'ENTERPRISE', 'Soporte 24/7', 4),
(gen_random_uuid(), 'ENTERPRISE', 'Gestor de cuenta dedicado', 5);

-- Datos iniciales: Agentes IA
insert into ai_agents (id, name, description, personality, is_active, sort_order) values
('carlos', 'Carlos', 'Especialista en screening y preselección de candidatos', 'professional', true, 1),
('ana', 'Ana', 'Experta en entrevistas técnicas y evaluación de habilidades', 'analytical', true, 2),
('diego', 'Diego', 'Especialista en entrevistas teóricas y conocimientos', 'academic', true, 3),
('sofia', 'Sofia', 'Generadora de reportes ejecutivos y análisis de resultados', 'creative', true, 4);

-- Datos iniciales: Capacidades de agentes IA
insert into ai_agent_capabilities (id, agent_id, capability) values
-- Carlos
(gen_random_uuid(), 'carlos', 'Filtro curricular automático'),
(gen_random_uuid(), 'carlos', 'Evaluación de experiencia laboral'),
(gen_random_uuid(), 'carlos', 'Análisis de habilidades blandas'),
-- Ana
(gen_random_uuid(), 'ana', 'Evaluación técnica especializada'),
(gen_random_uuid(), 'ana', 'Pruebas de código en vivo'),
(gen_random_uuid(), 'ana', 'Análisis de portafolio técnico'),
-- Diego
(gen_random_uuid(), 'diego', 'Evaluación de conocimientos teóricos'),
(gen_random_uuid(), 'diego', 'Pruebas de razonamiento lógico'),
(gen_random_uuid(), 'diego', 'Evaluación de metodologías'),
-- Sofia
(gen_random_uuid(), 'sofia', 'Generación de reportes ejecutivos'),
(gen_random_uuid(), 'sofia', 'Análisis de tendencias de contratación'),
(gen_random_uuid(), 'sofia', 'Recomendaciones de mejora');

-- Indices
create index idx_plan_benefits_plan_id on plan_benefits(plan_id);
create index idx_ai_agent_capabilities_agent_id on ai_agent_capabilities(agent_id);
create index idx_plans_is_active on plans(is_active);
create index idx_ai_agents_is_active on ai_agents(is_active);
