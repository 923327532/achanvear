-- Métodos de retiro del profesional (tarjeta bancaria tokenizada vía Izipay Dispersión de Fondos)
-- Tiyuy NUNCA almacena el número completo de tarjeta ni el CVV.
create table payout_methods (
    id uuid primary key,
    user_id uuid not null,
    provider varchar(30) not null default 'IZIPAY',
    card_token varchar(200),
    masked_card varchar(30) not null,
    card_brand varchar(30),
    last_four_digits varchar(4) not null,
    account_holder_name varchar(200),
    is_default boolean not null default false,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Solicitudes de retiro (dispersión de fondos hacia la tarjeta del profesional)
create table payouts (
    id uuid primary key,
    user_id uuid not null,
    wallet_id uuid not null references wallets(id),
    payout_method_id uuid not null references payout_methods(id),
    amount numeric(12,2) not null,
    status varchar(30) not null default 'REQUESTED', -- REQUESTED, PROCESSING, COMPLETED, FAILED, CANCELLED
    external_disbursement_id varchar(100),
    failure_reason varchar(500),
    idempotency_key varchar(100) not null unique,
    requested_at timestamp not null default current_timestamp,
    completed_at timestamp,
    failed_at timestamp,
    cancelled_at timestamp,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create index idx_payout_methods_user_id on payout_methods(user_id);
create index idx_payouts_user_id on payouts(user_id);
create index idx_payouts_status on payouts(status);
create index idx_payouts_idempotency_key on payouts(idempotency_key);
