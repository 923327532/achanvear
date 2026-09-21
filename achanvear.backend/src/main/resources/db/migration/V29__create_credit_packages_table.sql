-- Tabla de paquetes de créditos (compra única, no suscripción)
create table credit_packages (
    id varchar(50) primary key,
    name varchar(100) not null,
    description varchar(500),
    credits int not null,
    price numeric(10,2) not null,
    savings_percentage int not null default 0,
    is_popular boolean not null default false,
    is_active boolean not null default true,
    sort_order int not null default 0,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- Datos iniciales: Paquetes de créditos
insert into credit_packages (id, name, description, credits, price, savings_percentage, is_popular, sort_order) values
('starter', 'Paquete Starter', '1 créditos para publicaciones', 1, 8.00, 0, false, 1),
('professional', 'Paquete Profesional', '3 créditos con 38% de ahorro', 3, 21.00, 17, true, 2),
('enterprise', 'Paquete Enterprise', '5 créditos con 43% de ahorro', 5, 36.00, 18, false, 3);

-- Tabla de compras de paquetes de créditos
create table credit_package_purchases (
    id uuid primary key,
    user_id uuid not null,
    package_id varchar(50) not null references credit_packages(id),
    credits_granted int not null,
    amount_paid numeric(10,2) not null,
    payment_method varchar(50),
    status varchar(30) not null default 'COMPLETED',
    mp_payment_id varchar(100),
    created_at timestamp not null default current_timestamp
);

-- Indices
create index idx_credit_packages_is_active on credit_packages(is_active);
create index idx_credit_package_purchases_user_id on credit_package_purchases(user_id);
create index idx_credit_package_purchases_package_id on credit_package_purchases(package_id);
