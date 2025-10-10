-- Supabase schema for Catalogo Digital dashboard and client portal
--
-- Run this script in the SQL editor inside your Supabase project.
-- It creates the tables required by both the administrative dashboard
-- and the public client portal, along with the Row Level Security (RLS)
-- policies that the frontend expects when authenticating with Supabase.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
--  Clients
-- ------------------------------------------------------------
create table if not exists public.clients (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    first_name text,
    last_name text,
    email text,
    phone text,
    company text,
    status text default 'Activo',
    status_class text,
    notes text,
    owner_id uuid references auth.users (id) on delete set null,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

alter table public.clients
    enable row level security;

alter table public.clients
    add column if not exists owner_id uuid references auth.users (id) on delete set null;

drop policy if exists "Clients are readable by authenticated users" on public.clients;

create policy "Clients are readable by authenticated users"
    on public.clients
    for select
    using (auth.role() = 'authenticated');

drop policy if exists "Clients are manageable by authenticated users" on public.clients;

create policy "Clients are manageable by authenticated users"
    on public.clients
    for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
--  Portals (public catalogues per company)
-- ------------------------------------------------------------
create table if not exists public.portals (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    description text,
    accent_color text default '#4f46e5',
    contact_email text,
    contact_phone text,
    hero_title text,
    hero_subtitle text,
    banner_image text,
    hero_video text,
    hero_media_type text,
    request_intro text,
    chatbot_enabled boolean default false,
    chatbot_name text,
    chatbot_welcome text,
    chatbot_faqs jsonb default '[]'::jsonb,
    terms text[] default '{}',
    product_ids uuid[] default '{}',
    owner_id uuid references auth.users (id) on delete set null,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

alter table public.portals
    enable row level security;

alter table public.portals
    add column if not exists chatbot_enabled boolean default false,
    add column if not exists chatbot_name text,
    add column if not exists chatbot_welcome text,
    add column if not exists chatbot_faqs jsonb default '[]'::jsonb,
    add column if not exists owner_id uuid references auth.users (id) on delete set null;

drop policy if exists "Portals are publicly readable" on public.portals;

create policy "Portals are publicly readable"
    on public.portals
    for select
    using (true);

drop policy if exists "Portals are manageable by authenticated users" on public.portals;

create policy "Portals are manageable by authenticated users"
    on public.portals
    for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
--  Products
-- ------------------------------------------------------------
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    category text,
    price numeric(12, 2) default 0,
    stock integer default 0,
    status text,
    status_class text,
    image text,
    description text,
    short_description text,
    sku text,
    portal_id uuid references public.portals (id) on delete set null,
    portal_ids uuid[] default '{}',
    portal_slug text,
    owner_id uuid references auth.users (id) on delete set null,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

alter table public.products
    enable row level security;

alter table public.products
    add column if not exists owner_id uuid references auth.users (id) on delete set null;

drop policy if exists "Products are publicly readable" on public.products;

create policy "Products are publicly readable"
    on public.products
    for select
    using (true);

drop policy if exists "Products are manageable by authenticated users" on public.products;

create policy "Products are manageable by authenticated users"
    on public.products
    for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
--  Sales
-- ------------------------------------------------------------
create table if not exists public.sales (
    id uuid primary key default gen_random_uuid(),
    sale_date timestamptz default timezone('utc', now()),
    total numeric(14, 2) default 0,
    status text,
    status_class text,
    payment_method text,
    notes text,
    client_id uuid references public.clients (id) on delete set null,
    client_name text,
    client_email text,
    client_phone text,
    items jsonb default '[]'::jsonb,
    owner_id uuid references auth.users (id) on delete set null,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

alter table public.sales
    enable row level security;

alter table public.sales
    add column if not exists owner_id uuid references auth.users (id) on delete set null;

drop policy if exists "Sales are readable by authenticated users" on public.sales;

create policy "Sales are readable by authenticated users"
    on public.sales
    for select
    using (auth.role() = 'authenticated');

drop policy if exists "Sales are manageable by authenticated users" on public.sales;

create policy "Sales are manageable by authenticated users"
    on public.sales
    for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
--  Inventory adjustments
-- ------------------------------------------------------------
create table if not exists public.inventory_adjustments (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products (id) on delete set null,
    product_name text,
    type text,
    quantity numeric(12, 2) default 0,
    direction smallint default 1,
    reason text,
    owner_id uuid references auth.users (id) on delete set null,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

alter table public.inventory_adjustments
    enable row level security;

alter table public.inventory_adjustments
    add column if not exists owner_id uuid references auth.users (id) on delete set null;

drop policy if exists "Inventory adjustments are readable by authenticated users" on public.inventory_adjustments;

create policy "Inventory adjustments are readable by authenticated users"
    on public.inventory_adjustments
    for select
    using (auth.role() = 'authenticated');

drop policy if exists "Inventory adjustments are manageable by authenticated users" on public.inventory_adjustments;

create policy "Inventory adjustments are manageable by authenticated users"
    on public.inventory_adjustments
    for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
--  Settings (key-value store for company branding)
-- ------------------------------------------------------------
create table if not exists public.settings (
    id uuid primary key default gen_random_uuid(),
    key text not null unique,
    value text,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

alter table public.settings
    enable row level security;

drop policy if exists "Settings are readable by authenticated users" on public.settings;

create policy "Settings are readable by authenticated users"
    on public.settings
    for select
    using (
        auth.role() = 'authenticated'
        or (
            auth.role() = 'anonymous'
            and key in (
                'company_name',
                'company_email',
                'company_phone',
                'company_address',
                'tagline',
                'theme_color',
                'logo_url',
                'portal_base_url',
                'chatbot_enabled',
                'chatbot_name',
                'chatbot_welcome',
                'chatbot_faqs'
            )
        )
    );

drop policy if exists "Settings are manageable by authenticated users" on public.settings;

create policy "Settings are manageable by authenticated users"
    on public.settings
    for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
--  Sale requests (public submissions from client portal)
-- ------------------------------------------------------------
create table if not exists public.sale_requests (
    id uuid primary key default gen_random_uuid(),
    portal_id uuid references public.portals (id) on delete set null,
    portal_slug text not null,
    name text not null,
    company text,
    email text not null,
    phone text,
    notes text,
    items jsonb default '[]'::jsonb,
    total numeric(14, 2) default 0,
    submitted_at timestamptz default timezone('utc', now()),
    status text default 'Pendiente',
    status_class text default 'pending',
    processed_at timestamptz,
    processed_by uuid references auth.users (id) on delete set null,
    sale_id uuid references public.sales (id) on delete set null,
    owner_id uuid references auth.users (id) on delete set null,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

alter table public.sale_requests
    add column if not exists total numeric(14, 2) default 0;

alter table public.sale_requests
    add column if not exists status_class text default 'pending';

alter table public.sale_requests
    add column if not exists processed_at timestamptz;

alter table public.sale_requests
    add column if not exists processed_by uuid references auth.users (id) on delete set null;

alter table public.sale_requests
    add column if not exists sale_id uuid references public.sales (id) on delete set null;

alter table public.sale_requests
    add column if not exists owner_id uuid references auth.users (id) on delete set null;

alter table public.sale_requests
    alter column total set default 0,
    alter column status set default 'Pendiente',
    alter column status_class set default 'pending';

alter table public.sale_requests
    enable row level security;

drop policy if exists "Sale requests can be submitted anonymously" on public.sale_requests;

create policy "Sale requests can be submitted anonymously"
    on public.sale_requests
    for insert
    with check (true);

drop policy if exists "Sale requests are readable by authenticated users" on public.sale_requests;

create policy "Sale requests are readable by authenticated users"
    on public.sale_requests
    for select
    using (auth.role() = 'authenticated');

drop policy if exists "Sale requests are manageable by authenticated users" on public.sale_requests;

create policy "Sale requests are manageable by authenticated users"
    on public.sale_requests
    for update
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
--  Helper triggers to keep updated_at in sync
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$ language plpgsql;

create trigger clients_set_updated_at
    before update on public.clients
    for each row execute procedure public.set_updated_at();

create trigger portals_set_updated_at
    before update on public.portals
    for each row execute procedure public.set_updated_at();

create trigger products_set_updated_at
    before update on public.products
    for each row execute procedure public.set_updated_at();

create trigger sales_set_updated_at
    before update on public.sales
    for each row execute procedure public.set_updated_at();

create trigger inventory_adjustments_set_updated_at
    before update on public.inventory_adjustments
    for each row execute procedure public.set_updated_at();

create trigger settings_set_updated_at
    before update on public.settings
    for each row execute procedure public.set_updated_at();

create trigger sale_requests_set_updated_at
    before update on public.sale_requests
    for each row execute procedure public.set_updated_at();

