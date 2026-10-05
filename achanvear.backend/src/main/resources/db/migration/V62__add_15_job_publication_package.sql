insert into credit_packages (id, name, description, credits, price, savings_percentage, is_popular, sort_order)
values ('growth_15_jobs', '15 empleos', 'Activa 15 publicaciones de empleo adicionales', 15, 96.00, 20, false, 5)
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
