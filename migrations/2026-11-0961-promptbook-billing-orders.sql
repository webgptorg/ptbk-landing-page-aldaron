create table public.promptbook_orders (
    id uuid primary key,
    created_at timestamptz not null default now(),
    plan text not null check (plan in ('start', 'business')),
    email text not null,
    country text not null check (country in ('CZ', 'SK')),
    company_id text not null,
    company_name text not null,
    vat_id text,
    billing_address jsonb not null,
    terms_version text not null,
    engine_version text not null,
    engine_licence_url text not null,
    support_email text not null,
    billing_origin text not null,
    invoice_template_id text not null,
    supplier_tax_id text,
    base_amount integer not null check (base_amount > 0),
    discount_code text,
    discount_percent numeric,
    discount_months integer,
    is_test boolean not null,
    status text not null default 'pending',
    revision integer not null default 0,
    stripe_customer_id text unique,
    stripe_session_id text unique,
    stripe_subscription_id text unique,
    cancel_at_period_end boolean not null default false,
    paid_through timestamptz,
    invoice_url text,
    amount_paid integer,
    first_paid_at timestamptz,
    phone text,
    onboarding_note text
);
create index promptbook_orders_email_idx on public.promptbook_orders (email);
alter table public.promptbook_orders enable row level security;
revoke all on public.promptbook_orders from public, anon, authenticated;
grant select, insert, update, delete on public.promptbook_orders to service_role;

create table public.promptbook_invoices (
    stripe_invoice_id text primary key,
    order_id uuid not null references public.promptbook_orders (id),
    billing_reason text,
    paid_at timestamptz not null,
    paid_through timestamptz,
    amount_paid integer not null check (amount_paid >= 0),
    card_amount integer not null check (card_amount >= 0),
    refunded_amount integer not null default 0 check (refunded_amount >= 0),
    hosted_invoice_url text,
    currency text not null check (currency = 'czk')
);
create index promptbook_invoices_order_idx on public.promptbook_invoices (order_id, paid_at);
alter table public.promptbook_invoices enable row level security;
revoke all on public.promptbook_invoices from public, anon, authenticated;
grant select, insert, update, delete on public.promptbook_invoices to service_role;
