create table if not exists publication_credit_wallets (
    user_id uuid primary key,
    balance int not null default 0,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

alter table credit_package_purchases
    alter column status set default 'PENDING';

update credit_packages
set name = '3 empleos',
    description = 'Activa 3 publicaciones de empleo adicionales',
    credits = 3,
    price = 24.00,
    savings_percentage = 0,
    is_popular = false,
    sort_order = 1,
    updated_at = current_timestamp
where id = 'starter';

update credit_packages
set name = '5 empleos',
    description = 'Activa 5 publicaciones de empleo adicionales',
    credits = 5,
    price = 38.00,
    savings_percentage = 5,
    is_popular = false,
    sort_order = 2,
    updated_at = current_timestamp
where id = 'professional';

update credit_packages
set name = '8 empleos',
    description = 'Activa 8 publicaciones de empleo adicionales',
    credits = 8,
    price = 56.00,
    savings_percentage = 12,
    is_popular = true,
    sort_order = 3,
    updated_at = current_timestamp
where id = 'enterprise';

insert into credit_packages (id, name, description, credits, price, savings_percentage, is_popular, sort_order)
values ('scale_10_jobs', '10 empleos', 'Activa 10 publicaciones de empleo adicionales', 10, 68.00, 15, false, 4)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    credits = excluded.credits,
    price = excluded.price,
    savings_percentage = excluded.savings_percentage,
    is_popular = excluded.is_popular,
    is_active = true,
    sort_order = excluded.sort_order,
    updated_at = current_timestamp;
