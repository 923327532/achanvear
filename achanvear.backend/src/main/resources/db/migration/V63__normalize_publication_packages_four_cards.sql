update credit_packages
set name = 'Paquete Starter',
    description = '1 publicacion de empleo para una vacante puntual',
    credits = 1,
    price = 8.00,
    savings_percentage = 0,
    is_popular = false,
    is_active = true,
    sort_order = 1,
    updated_at = current_timestamp
where id = 'starter';

update credit_packages
set name = '3 empleos',
    description = 'Activa 3 publicaciones de empleo adicionales',
    credits = 3,
    price = 21.00,
    savings_percentage = 12,
    is_popular = false,
    is_active = true,
    sort_order = 2,
    updated_at = current_timestamp
where id = 'professional';

update credit_packages
set name = '5 empleos',
    description = 'Activa 5 publicaciones de empleo adicionales',
    credits = 5,
    price = 32.00,
    savings_percentage = 20,
    is_popular = true,
    is_active = true,
    sort_order = 3,
    updated_at = current_timestamp
where id = 'enterprise';

insert into credit_packages (id, name, description, credits, price, savings_percentage, is_popular, sort_order, is_active)
values ('scale_10_jobs', '10 empleos', 'Activa 10 publicaciones de empleo adicionales', 10, 50.00, 38, false, 4, true)
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

update credit_packages
set is_active = false,
    updated_at = current_timestamp
where id not in ('starter', 'professional', 'enterprise', 'scale_10_jobs');
