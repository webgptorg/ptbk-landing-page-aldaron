import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export const PROMPTBOOK_ORDERS_TABLE = 'promptbook_orders';

export type PromptbookOrder = {
    id: string;
    created_at: string;
    plan: 'start' | 'business';
    email: string;
    country: 'CZ' | 'SK';
    company_id: string | null;
    company_name: string;
    customer_type: 'business' | 'consumer';
    tax_treatment: 'domestic' | 'reverse_charge';
    order_note: string | null;
    immediate_start: boolean;
    vat_id: string | null;
    billing_address: { line1: string; city: string; postal_code: string; country: 'CZ' | 'SK' };
    terms_version: string;
    engine_version: string;
    engine_licence_url: string;
    support_email: string;
    billing_origin: string;
    invoice_template_id: string;
    supplier_tax_id: string | null;
    base_amount: number;
    discount_code: string | null;
    discount_percent: number | null;
    discount_months: number | null;
    is_test: boolean;
    status: string;
    revision: number;
    stripe_customer_id: string | null;
    stripe_session_id: string | null;
    stripe_subscription_id: string | null;
    cancel_at_period_end: boolean;
    paid_through: string | null;
    invoice_url: string | null;
    amount_paid: number | null;
    first_paid_at: string | null;
    confirmed_at: string | null;
    phone: string | null;
    onboarding_note: string | null;
};

export function getBillingDatabase() {
    return createSupabaseServiceRoleClient();
}

export async function loadPromptbookOrder(database: SupabaseClient, id: string): Promise<PromptbookOrder | null> {
    const result = await database.from(PROMPTBOOK_ORDERS_TABLE).select('*').eq('id', id).maybeSingle<PromptbookOrder>();
    if (result.error) throw new Error('Promptbook order lookup failed', { cause: result.error });
    return result.data;
}
