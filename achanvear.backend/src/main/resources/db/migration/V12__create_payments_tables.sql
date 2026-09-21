-- Tabla principal de pagos por milestone
create table payments (
                          id uuid primary key,
                          milestone_id uuid not null,
                          project_id uuid not null,
                          client_user_id uuid not null,
                          freelancer_user_id uuid not null,
                          amount numeric(12,2) not null,
                          platform_commission numeric(12,2) not null,
                          freelancer_amount numeric(12,2) not null,
                          mp_payment_id varchar(100) not null unique,
                          status varchar(30) not null,
                          created_at timestamp not null default current_timestamp,
                          updated_at timestamp not null default current_timestamp
);

-- Tabla de suscripciones para empresas
create table subscriptions (
                               id uuid primary key,
                               company_user_id uuid not null,
                               plan varchar(50) not null,
                               status varchar(30) not null,
                               start_date timestamp not null,
                               end_date timestamp not null,
                               mp_subscription_id varchar(100) unique,
                               created_at timestamp not null default current_timestamp,
                               updated_at timestamp not null default current_timestamp
);

-- Indices clave para performance y unicidad
create index idx_payments_mp_payment_id on payments(mp_payment_id);
create index idx_payments_status on payments(status);
create index idx_payments_freelancer_user_id on payments(freelancer_user_id);
create index idx_payments_project_id on payments(project_id);

create index idx_subscriptions_company_user_id on subscriptions(company_user_id);
create index idx_subscriptions_status on subscriptions(status);
create index idx_subscriptions_mp_subscription_id on subscriptions(mp_subscription_id);

-- Tabla de milestones (hitos de proyecto)
create table milestones (
                          id uuid primary key,
                          project_id uuid not null,
                          client_user_id uuid not null,
                          freelancer_user_id uuid not null,
                          title varchar(200) not null,
                          description varchar(2000),
                          amount numeric(12,2) not null,
                          status varchar(30) not null default 'PENDING',
                          mp_preference_id varchar(100),
                          mp_payment_id varchar(100) unique,
                          funded_at timestamp,
                          released_at timestamp,
                          created_at timestamp not null default current_timestamp,
                          updated_at timestamp not null default current_timestamp
);

-- Tabla de transacciones de pagos
create table payment_transactions (
                                      id uuid primary key,
                                      user_id uuid not null,
                                      type varchar(50) not null,
                                      description varchar(500),
                                      amount numeric(12,2) not null,
                                      status varchar(30) not null,
                                      related_entity_id uuid,
                                      related_entity_type varchar(50),
                                      created_at timestamp not null default current_timestamp
);

-- Indices para milestones
create index idx_milestones_project_id on milestones(project_id);
create index idx_milestones_client_user_id on milestones(client_user_id);
create index idx_milestones_freelancer_user_id on milestones(freelancer_user_id);
create index idx_milestones_status on milestones(status);
create index idx_milestones_mp_payment_id on milestones(mp_payment_id);

-- Indices para transacciones
create index idx_payment_transactions_user_id on payment_transactions(user_id);
create index idx_payment_transactions_type on payment_transactions(type);
create index idx_payment_transactions_created_at on payment_transactions(created_at);

-- Constraint para asegurar que comision sea 5%
alter table payments
    add constraint chk_platform_commission
        check (platform_commission = amount * 0.05);

-- Constraint para validar estados de milestone
alter table milestones
    add constraint chk_milestone_status
        check (status in ('PENDING', 'FUNDED', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'RELEASED', 'DISPUTED', 'REFUNDED'));