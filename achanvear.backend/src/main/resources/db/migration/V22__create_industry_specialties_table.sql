CREATE TABLE industry_specialties (
    id UUID PRIMARY KEY,
    industry VARCHAR(120) NOT NULL,
    specialty VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(industry, specialty)
);

-- Insertar especialidades por industria
INSERT INTO industry_specialties (id, industry, specialty, created_at) VALUES
-- Tecnologia
(gen_random_uuid(), 'Tecnologia', 'Desarrollo Web', NOW()),
(gen_random_uuid(), 'Tecnologia', 'Desarrollo Movil', NOW()),
(gen_random_uuid(), 'Tecnologia', 'DevOps', NOW()),
(gen_random_uuid(), 'Tecnologia', 'Ciberseguridad', NOW()),
(gen_random_uuid(), 'Tecnologia', 'Data Science', NOW()),
(gen_random_uuid(), 'Tecnologia', 'Inteligencia Artificial', NOW()),
(gen_random_uuid(), 'Tecnologia', 'Soporte Tecnico', NOW()),
(gen_random_uuid(), 'Tecnologia', 'QA Testing', NOW()),
-- Derecho
(gen_random_uuid(), 'Derecho', 'Derecho Laboral', NOW()),
(gen_random_uuid(), 'Derecho', 'Derecho Corporativo', NOW()),
(gen_random_uuid(), 'Derecho', 'Litigios', NOW()),
(gen_random_uuid(), 'Derecho', 'Derecho Tributario', NOW()),
(gen_random_uuid(), 'Derecho', 'Derecho Penal', NOW()),
(gen_random_uuid(), 'Derecho', 'Asesoria Legal', NOW()),
(gen_random_uuid(), 'Derecho', 'Derecho Civil', NOW()),
(gen_random_uuid(), 'Derecho', 'Propiedad Intelectual', NOW()),
-- Contabilidad
(gen_random_uuid(), 'Contabilidad', 'Contabilidad General', NOW()),
(gen_random_uuid(), 'Contabilidad', 'Auditoria', NOW()),
(gen_random_uuid(), 'Contabilidad', 'Tributacion', NOW()),
(gen_random_uuid(), 'Contabilidad', 'Contabilidad de Costos', NOW()),
(gen_random_uuid(), 'Contabilidad', 'Finanzas Corporativas', NOW()),
(gen_random_uuid(), 'Contabilidad', 'Gestion de Nominas', NOW()),
-- Marketing
(gen_random_uuid(), 'Marketing', 'Marketing Digital', NOW()),
(gen_random_uuid(), 'Marketing', 'SEO/SEM', NOW()),
(gen_random_uuid(), 'Marketing', 'Redes Sociales', NOW()),
(gen_random_uuid(), 'Marketing', 'Branding', NOW()),
(gen_random_uuid(), 'Marketing', 'Content Marketing', NOW()),
(gen_random_uuid(), 'Marketing', 'Email Marketing', NOW()),
(gen_random_uuid(), 'Marketing', 'Analitica Web', NOW()),
(gen_random_uuid(), 'Marketing', 'Publicidad Pagada', NOW()),
-- Administracion
(gen_random_uuid(), 'Administracion', 'Gestion de Proyectos', NOW()),
(gen_random_uuid(), 'Administracion', 'Recursos Humanos', NOW()),
(gen_random_uuid(), 'Administracion', 'Gestion de Operaciones', NOW()),
(gen_random_uuid(), 'Administracion', 'Logistica', NOW()),
(gen_random_uuid(), 'Administracion', 'Gestion de Calidad', NOW()),
(gen_random_uuid(), 'Administracion', 'Administracion de Empresas', NOW()),
-- Ingenieria
(gen_random_uuid(), 'Ingenieria', 'Ingenieria Civil', NOW()),
(gen_random_uuid(), 'Ingenieria', 'Ingenieria Industrial', NOW()),
(gen_random_uuid(), 'Ingenieria', 'Ingenieria Electrica', NOW()),
(gen_random_uuid(), 'Ingenieria', 'Ingenieria Mecanica', NOW()),
(gen_random_uuid(), 'Ingenieria', 'Ingenieria de Sistemas', NOW()),
(gen_random_uuid(), 'Ingenieria', 'Ingenieria Ambiental', NOW()),
(gen_random_uuid(), 'Ingenieria', 'Ingenieria Quimica', NOW()),
-- Salud
(gen_random_uuid(), 'Salud', 'Medicina General', NOW()),
(gen_random_uuid(), 'Salud', 'Enfermeria', NOW()),
(gen_random_uuid(), 'Salud', 'Psicologia', NOW()),
(gen_random_uuid(), 'Salud', 'Nutricion', NOW()),
(gen_random_uuid(), 'Salud', 'Fisioterapia', NOW()),
(gen_random_uuid(), 'Salud', 'Odontologia', NOW()),
(gen_random_uuid(), 'Salud', 'Farmacia', NOW()),
-- Diseno
(gen_random_uuid(), 'Diseno', 'Diseno Grafico', NOW()),
(gen_random_uuid(), 'Diseno', 'UX/UI Design', NOW()),
(gen_random_uuid(), 'Diseno', 'Diseno de Interiores', NOW()),
(gen_random_uuid(), 'Diseno', 'Diseno de Moda', NOW()),
(gen_random_uuid(), 'Diseno', 'Motion Graphics', NOW()),
(gen_random_uuid(), 'Diseno', 'Ilustracion', NOW()),
-- Otros
(gen_random_uuid(), 'Otros', 'Consultoria', NOW()),
(gen_random_uuid(), 'Otros', 'Traduccion', NOW()),
(gen_random_uuid(), 'Otros', 'Docencia', NOW()),
(gen_random_uuid(), 'Otros', 'Servicios Generales', NOW()),
(gen_random_uuid(), 'Otros', 'Ventas', NOW()),
(gen_random_uuid(), 'Otros', 'Atencion al Cliente', NOW());
