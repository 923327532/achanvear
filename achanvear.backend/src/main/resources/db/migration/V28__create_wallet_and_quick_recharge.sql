-- Tabla de wallet (saldo interno del usuario)
create table wallets (
    id uuid primary key,
    user_id uuid not null unique,
    balance numeric(12,2) not null default 0,
    total_deposited numeric(12,2) not null default 0,
    total_withdrawn numeric(12,2) not null default 0,
    total_spent numeric(12,2) not null default 0,
    currency varchar(3) not null default 'PEN',
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Tabla de recargas rápidas (Yape, Plin)
create table quick_recharges (
    id uuid primary key,
    user_id uuid not null,
    wallet_id uuid not null references wallets(id),
    amount numeric(12,2) not null,
    method varchar(30) not null, -- 'YAPE', 'PLIN', 'MP_WALLET', 'DEBIT_CARD', 'CREDIT_CARD'
    reference_code varchar(100), -- código de referencia de Yape/Plin
    phone_number varchar(20), -- número de teléfono asociado (Yape/Plin)
    status varchar(30) not null default 'PENDING', -- PENDING, COMPLETED, FAILED, EXPIRED
    mp_payment_id varchar(100), -- si se pagó con MP
    completed_at timestamp,
    failed_at timestamp,
    failure_reason varchar(500),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Tabla de transacciones de wallet
create table wallet_transactions (
    id uuid primary key,
    wallet_id uuid not null references wallets(id),
    user_id uuid not null,
    type varchar(30) not null, -- DEPOSIT, WITHDRAWAL, PAYMENT, REFUND, COMMISSION
    amount numeric(12,2) not null,
    balance_before numeric(12,2) not null,
    balance_after numeric(12,2) not null,
    reference_type varchar(50), -- QUICK_RECHARGE, MILESTONE, ESCROW, MP_PAYMENT
    reference_id varchar(100), -- ID de la entidad relacionada
    description varchar(500),
    status varchar(30) not null default 'COMPLETED',
    created_at timestamp not null default current_timestamp
);

-- Tabla de métodos de pago locales (Yape, Plin)
create table local_payment_methods (
    id uuid primary key,
    user_id uuid not null,
    method_type varchar(30) not null, -- 'YAPE', 'PLIN'
    phone_number varchar(20) not null,
    account_holder_name varchar(200),
    is_verified boolean not null default false,
    is_default boolean not null default false,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Indices
create index idx_wallets_user_id on wallets(user_id);
create unique index idx_wallets_user_id_unique on wallets(user_id);

create index idx_quick_recharges_user_id on quick_recharges(user_id);
create index idx_quick_recharges_status on quick_recharges(status);
create index idx_quick_recharges_method on quick_recharges(method);
create index idx_quick_recharges_created_at on quick_recharges(created_at);

create index idx_wallet_transactions_wallet_id on wallet_transactions(wallet_id);
create index idx_wallet_transactions_user_id on wallet_transactions(user_id);
create index idx_wallet_transactions_type on wallet_transactions(type);
create index idx_wallet_transactions_created_at on wallet_transactions(created_at);

create index idx_local_payment_methods_user_id on local_payment_methods(user_id);
create index idx_local_payment_methods_type on local_payment_methods(method_type);
