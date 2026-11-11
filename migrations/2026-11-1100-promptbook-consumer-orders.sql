alter table public.promptbook_orders
    alter column company_id drop not null,
    add column customer_type text not null default 'business'
        check (customer_type in ('business', 'consumer')),
    add column tax_treatment text not null default 'domestic'
        check (tax_treatment in ('domestic', 'reverse_charge')),
    add column order_note text,
    add column immediate_start boolean not null default false;

-- Existing Slovak orders were accepted only after matching RUZ and VIES verification.
update public.promptbook_orders set tax_treatment = 'reverse_charge'
where country = 'SK' and company_id is not null and vat_id is not null and supplier_tax_id is not null;

alter table public.promptbook_orders
    add constraint promptbook_consumer_identity_check check (
        (customer_type = 'business' and company_id is not null) or
        (customer_type = 'consumer' and company_id is null and vat_id is null)
    ),
    add constraint promptbook_reverse_charge_identity_check check (
        tax_treatment <> 'reverse_charge' or
        (customer_type = 'business' and country = 'SK' and vat_id is not null and supplier_tax_id is not null)
    ),
    add constraint promptbook_order_note_length_check check (length(order_note) <= 4000);
