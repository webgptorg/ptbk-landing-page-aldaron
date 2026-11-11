-- A zero-amount first invoice concludes an order too, while first_paid_at tracks actual paid conversions.
alter table public.promptbook_orders add column confirmed_at timestamptz;

update public.promptbook_orders as orders
set confirmed_at = coalesce(
    (select min(invoices.paid_at) from public.promptbook_invoices as invoices where invoices.order_id = orders.id),
    orders.first_paid_at
)
where orders.confirmed_at is null;
