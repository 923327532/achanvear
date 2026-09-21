-- Tabla de escrow (retención de pagos)
create table escrow (
    id uuid primary key,
    milestone_id uuid not null references milestones(id),
    project_id uuid not null,
    client_user_id uuid not null,
    freelancer_user_id uuid not null,
    amount numeric(12,2) not null,
    platform_commission numeric(12,2) not null default 0,
    mp_commission numeric(12,2) not null default 0,
    freelancer_amount numeric(12,2) not null default 0,
    mp_payment_id varchar(100),
    mp_preference_id varchar(100),
    status varchar(30) not null default 'HELD',
    held_at timestamp,
    released_at timestamp,
    refunded_at timestamp,
    disputed_at timestamp,
    dispute_reason varchar(2000),
    resolution_notes varchar(2000),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Tabla de métodos de pago guardados
create table payment_methods (
    id uuid primary key,
    user_id uuid not null,
    mp_card_id varchar(100),
    mp_payer_id varchar(100),
    payment_type varchar(50) not null, -- 'credit_card', 'debit_card', 'account_money'
    last_four_digits varchar(4),
    cardholder_name varchar(200),
    expiration_date varchar(7),
    issuer_name varchar(200),
    is_default boolean not null default false,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Tabla de logs de auditoría
create table audit_logs (
    id uuid primary key,
    user_id uuid,
    action varchar(100) not null,
    entity_type varchar(50) not null,
    entity_id varchar(100),
    old_value text,
    new_value text,
    ip_address varchar(45),
    user_agent varchar(500),
    metadata jsonb,
    created_at timestamp not null default current_timestamp
);

-- Tabla de disputas
create table disputes (
    id uuid primary key,
    milestone_id uuid not null references milestones(id),
    project_id uuid not null,
    raised_by_user_id uuid not null,
    raised_against_user_id uuid not null,
    reason varchar(2000) not null,
    description text,
    status varchar(30) not null default 'OPEN', -- OPEN, UNDER_REVIEW, RESOLVED, DISMISSED
    resolution varchar(2000),
    resolved_by_user_id uuid,
    resolved_at timestamp,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Tabla de evidencia de disputas
create table dispute_evidence (
    id uuid primary key,
    dispute_id uuid not null references disputes(id),
    uploaded_by_user_id uuid not null,
    file_url varchar(1000),
    description varchar(2000),
    created_at timestamp not null default current_timestamp
);

-- Tabla de reembolsos
create table refunds (
    id uuid primary key,
    milestone_id uuid not null references milestones(id),
    payment_id uuid references payments(id),
    escrow_id uuid references escrow(id),
    amount numeric(12,2) not null,
    reason varchar(2000) not null,
    mp_refund_id varchar(100),
    status varchar(30) not null default 'PENDING', -- PENDING, PROCESSED, FAILED
    processed_at timestamp,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Tabla de comisiones de plataforma
create table platform_fees (
    id uuid primary key,
    milestone_id uuid not null references milestones(id),
    payment_id uuid references payments(id),
    escrow_id uuid references escrow(id),
    amount numeric(12,2) not null,
    fee_type varchar(50) not null, -- PLATFORM_COMMISSION, MP_COMMISSION
    percentage numeric(5,2) not null,
    status varchar(30) not null default 'PENDING', -- PENDING, COLLECTED, REFUNDED
    collected_at timestamp,
    created_at timestamp not null default current_timestamp
);

-- Tabla de intentos de pago (para antifraude)
create table payment_attempts (
    id uuid primary key,
    user_id uuid not null,
    milestone_id uuid references milestones(id),
    amount numeric(12,2) not null,
    ip_address varchar(45),
    user_agent varchar(500),
    fingerprint varchar(200),
    risk_score integer default 0,
    risk_factors jsonb,
    status varchar(30) not null default 'PENDING', -- PENDING, APPROVED, BLOCKED, FLAGGED
    review_required boolean not null default false,
    created_at timestamp not null default current_timestamp
);

-- Indices
create index idx_escrow_milestone_id on escrow(milestone_id);
create index idx_escrow_status on escrow(status);
create index idx_escrow_client_user_id on escrow(client_user_id);
create index idx_escrow_freelancer_user_id on escrow(freelancer_user_id);

create index idx_payment_methods_user_id on payment_methods(user_id);
create index idx_payment_methods_is_default on payment_methods(user_id, is_default);

create index idx_audit_logs_user_id on audit_logs(user_id);
create index idx_audit_logs_action on audit_logs(action);
create index idx_audit_logs_entity_type on audit_logs(entity_type, entity_id);
create index idx_audit_logs_created_at on audit_logs(created_at);

create index idx_disputes_milestone_id on disputes(milestone_id);
create index idx_disputes_status on disputes(status);

create index idx_refunds_milestone_id on refunds(milestone_id);
create index idx_refunds_status on refunds(status);

create index idx_platform_fees_milestone_id on platform_fees(milestone_id);
create index idx_platform_fees_status on platform_fees(status);

create index idx_payment_attempts_user_id on payment_attempts(user_id);
create index idx_payment_attempts_status on payment_attempts(status);
create index idx_payment_attempts_created_at on payment_attempts(created_at);
