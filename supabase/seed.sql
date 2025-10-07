-- Optional seed data for the Catalogo Digital project.
--
-- Execute after running schema.sql to populate the core tables with
-- a minimal dataset. Feel free to adjust names, branding details,
-- and contact information before running it in production.

insert into public.settings (key, value)
values
    ('company_name', 'Catálogo Digital CR'),
    ('company_email', 'ventas@catalogodigital.cr'),
    ('company_phone', '+506 8888 8888'),
    ('company_address', 'San José, Costa Rica'),
    ('tagline', 'Transforma tu negocio con un catálogo digital'),
    ('theme_color', '#4f46e5'),
    ('logo_url', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=320&q=80'),
    (
        'portal_base_url',
        'https://{REEMPLAZA_CON_TU_DOMINIO}/client-portal.html?portal={{slug}}'
    )
ON CONFLICT (key) DO UPDATE SET value = excluded.value;

-- Portal principal con términos y un color de acento personalizado.
insert into public.portals (
    slug,
    name,
    description,
    accent_color,
    contact_email,
    contact_phone,
    hero_title,
    hero_subtitle,
    banner_image,
    terms
) values (
    'catalogo-digital',
    'Catálogo Digital CR',
    'Accede a nuestra línea completa de productos para distribuidores autorizados.',
    '#4f46e5',
    'ventas@catalogodigital.cr',
    '+506 8888 8888',
    'Explora nuestro catálogo mayorista',
    'Selecciona lo que necesitas y envía tu solicitud en cuestión de minutos.',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
    ARRAY['Precios sujetos a cambios sin previo aviso.', 'Entregas en todo el país en 48 horas.']
) on conflict (slug) do update set
    name = excluded.name,
    description = excluded.description,
    accent_color = excluded.accent_color,
    contact_email = excluded.contact_email,
    contact_phone = excluded.contact_phone,
    hero_title = excluded.hero_title,
    hero_subtitle = excluded.hero_subtitle,
    banner_image = excluded.banner_image,
    terms = excluded.terms
;

-- Productos de ejemplo asignados al portal anterior.
with portal as (
    select id from public.portals where slug = 'catalogo-digital' limit 1
)
insert into public.products (
    name,
    category,
    price,
    stock,
    status,
    status_class,
    image,
    description,
    short_description,
    portal_id,
    portal_slug
)
select
    'Café gourmet en grano 1kg',
    'Bebidas',
    18500,
    125,
    'Disponible',
    'success',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
    'Tueste medio con notas de chocolate y frutos rojos.',
    'Café arábica premium para coffee shops y hoteles.',
    portal.id,
    'catalogo-digital'
from portal
union all
select
    'Kit de empaque ecológico',
    'Empaques',
    9500,
    58,
    'Disponible',
    'pending',
    'https://images.unsplash.com/photo-1596783074918-c84cb06531d5?auto=format&fit=crop&w=400&q=80',
    'Incluye bolsas compostables, cajas recicladas y etiquetas.',
    'Solución sostenible para envíos de e-commerce.',
    portal.id,
    'catalogo-digital'
from portal
union all
select
    'Dispensador inteligente de agua',
    'Tecnología',
    139000,
    12,
    'En espera',
    'info',
    'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=400&q=80',
    'Control de temperatura y monitoreo de consumo desde la app.',
    'Ideal para oficinas con más de 20 colaboradores.',
    portal.id,
    'catalogo-digital'
from portal;

-- Cliente de ejemplo para probar el módulo de clientes.
insert into public.clients (
    name,
    email,
    phone,
    company,
    status,
    notes
) values (
    'Laura Sánchez',
    'laura.sanchez@empresa.cr',
    '+506 7000 0000',
    'Distribuidora El Roble',
    'Activo',
    'Cliente recurrente, solicita entregas semanales.'
) on conflict (id) do nothing;

-- Venta histórica inicial asociada al cliente anterior.
with customer as (
    select id from public.clients where email = 'laura.sanchez@empresa.cr' limit 1
)
insert into public.sales (
    sale_date,
    total,
    status,
    payment_method,
    notes,
    client_id,
    client_name,
    client_email,
    client_phone,
    items
)
select
    timezone('utc', now()) - interval '3 days',
    278000,
    'Completado',
    'Transferencia bancaria',
    'Pedido mayorista entregado el mismo día.',
    (select id from customer),
    'Laura Sánchez',
    'laura.sanchez@empresa.cr',
    '+506 7000 0000',
    '[{"product_id": "demo-1", "productName": "Café gourmet en grano 1kg", "quantity": 10, "unitPrice": 18500}]'
::jsonb;

-- Ajuste de inventario de ejemplo.
with product as (
    select id, name from public.products order by created_at limit 1
)
insert into public.inventory_adjustments (
    product_id,
    product_name,
    type,
    quantity,
    direction,
    reason
)
select
    product.id,
    product.name,
    'Reposición',
    50,
    1,
    'Ingreso por compra al proveedor principal.'
from product;

