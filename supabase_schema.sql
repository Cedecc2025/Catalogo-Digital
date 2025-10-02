-- Extensión requerida para UUIDs
create extension if not exists "pgcrypto";

-- Tabla de productos
create table public.products (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    description text,
    category text,
    price numeric(12,2) not null,
    stock integer not null default 0,
    image_url text,
    created_at timestamptz default now()
);

-- Tabla de clientes
create table public.clients (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    phone text not null,
    address text,
    total_spent numeric(14,2) not null default 0,
    purchases integer not null default 0,
    created_at timestamptz default now(),
    unique(user_id, phone)
);

-- Tabla de ventas
create table public.sales (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    client_id uuid references public.clients(id),
    subtotal numeric(14,2) not null,
    tax numeric(14,2) not null,
    total numeric(14,2) not null,
    status text not null default 'Pendiente',
    source text,
    created_at timestamptz default now()
);

-- Items de venta
create table public.sale_items (
    id bigserial primary key,
    sale_id uuid references public.sales(id) on delete cascade,
    product_id uuid references public.products(id),
    name text not null,
    quantity integer not null,
    price numeric(12,2) not null,
    created_at timestamptz default now()
);

-- Centro de notificaciones
create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    body text,
    type text,
    read boolean not null default false,
    created_at timestamptz default now()
);

-- Preferencias de negocio
create table public.business_settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid unique references auth.users(id) on delete cascade,
    business_name text,
    logo_url text,
    whatsapp text,
    email text,
    primary_color text default '#2563eb',
    gradient_start text default '#667eea',
    gradient_end text default '#764ba2',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Configuración del chatbot
create table public.chatbot_settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid unique references auth.users(id) on delete cascade,
    enabled boolean not null default true,
    assistant_name text default 'Asistente Virtual',
    welcome_message text,
    quick_hours text,
    quick_delivery text,
    quick_payment text,
    quick_contact text,
    updated_at timestamptz default now()
);

-- Actualización de totales del cliente
create or replace function public.update_client_totals()
returns trigger as $$
begin
    update public.clients
    set
        purchases = purchases + 1,
        total_spent = total_spent + NEW.total
    where id = NEW.client_id;
    return NEW;
end;
$$ language plpgsql;

create trigger sales_after_insert
    after insert on public.sales
    for each row execute function public.update_client_totals();

-- Políticas básicas (activar RLS antes de crear policies)
alter table public.products enable row level security;
alter table public.clients enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.notifications enable row level security;
alter table public.business_settings enable row level security;
alter table public.chatbot_settings enable row level security;

create policy "Solo dueño" on public.products
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Solo dueño" on public.clients
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Solo dueño" on public.sales
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Solo dueño" on public.sale_items
    for all using (
        exists(select 1 from public.sales s where s.id = sale_id and s.user_id = auth.uid())
    )
    with check (
        exists(select 1 from public.sales s where s.id = sale_id and s.user_id = auth.uid())
    );
create policy "Solo dueño" on public.notifications
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Solo dueño" on public.business_settings
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Solo dueño" on public.chatbot_settings
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
