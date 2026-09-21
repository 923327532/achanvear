-- V53: Sistema de gestión de roles y permisos.
-- Incluye el rol SUPERADMIN como rol privilegiado de nivel máximo.
-- Esta migración NO crea usuarios ni solicita credenciales iniciales:
-- el rol SUPERADMIN se asigna manualmente por un administrador de base de datos.

CREATE TABLE roles (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_privileged BOOLEAN NOT NULL DEFAULT FALSE,
    level INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (code, name, description, is_privileged, level) VALUES
    ('SUPERADMIN', 'Super Administrador', 'Control total de la plataforma y gestión de roles', TRUE, 100),
    ('SUBADMIN', 'Sub Administrador', 'Administrador heredado con permisos de gestión', TRUE, 80),
    ('ADMIN', 'Administrador', 'Gestión administrativa y operativa de la plataforma', TRUE, 80),
    ('SUPPORT', 'Soporte', 'Atención y soporte a usuarios', TRUE, 60),
    ('COMPANY', 'Empresa', 'Cuenta principal de una empresa', FALSE, 30),
    ('COMPANY_COLLABORATOR', 'Colaborador de Empresa', 'Colaborador invitado de una empresa', FALSE, 25),
    ('CANDIDATE', 'Candidato', 'Postulante a procesos de selección', FALSE, 10),
    ('FREELANCER', 'Freelancer', 'Profesional independiente', FALSE, 10);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
    permission VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_role_permission UNIQUE (role_code, permission)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_code);

INSERT INTO role_permissions (id, role_code, permission) VALUES
    (gen_random_uuid(), 'SUPERADMIN', 'USER_CREATE'),
    (gen_random_uuid(), 'SUPERADMIN', 'USER_ROLE_CHANGE'),
    (gen_random_uuid(), 'SUPERADMIN', 'USER_STATUS_CHANGE'),
    (gen_random_uuid(), 'SUPERADMIN', 'USER_KPIS_VIEW'),
    (gen_random_uuid(), 'SUPERADMIN', 'AUDIT_VIEW'),
    (gen_random_uuid(), 'SUPERADMIN', 'LEGAL_DOCUMENTS_MANAGE'),
    (gen_random_uuid(), 'SUBADMIN', 'USER_STATUS_CHANGE'),
    (gen_random_uuid(), 'SUBADMIN', 'USER_KPIS_VIEW'),
    (gen_random_uuid(), 'SUBADMIN', 'AUDIT_VIEW'),
    (gen_random_uuid(), 'ADMIN', 'USER_CREATE'),
    (gen_random_uuid(), 'ADMIN', 'USER_STATUS_CHANGE'),
    (gen_random_uuid(), 'ADMIN', 'USER_KPIS_VIEW'),
    (gen_random_uuid(), 'ADMIN', 'AUDIT_VIEW'),
    (gen_random_uuid(), 'SUPPORT', 'USER_KPIS_VIEW'),
    (gen_random_uuid(), 'SUPPORT', 'USER_STATUS_CHANGE');

-- Integridad de los roles almacenados en users.role
ALTER TABLE users
    ADD CONSTRAINT chk_users_role
    CHECK (role IN (
        'SUPERADMIN','SUBADMIN','ADMIN','SUPPORT',
        'COMPANY','COMPANY_COLLABORATOR','CANDIDATE','FREELANCER'
    ));
