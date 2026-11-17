import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { getAvatarDatabase } from '@/lib/pavol-avatar/database';
import { AvatarError, AVATAR_PRIVATE_HEADERS, assertAvatarRequest, getAvatarAvailability } from '@/lib/pavol-avatar/config';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    try {
        assertAvatarRequest(request, false);
        const principal = await getAvatarPrincipal(request);
        if (!principal) throw new AvatarError('Nejdříve ověřte svůj e-mail.', 401);
        const parsed = z.string().uuid().safeParse(new URL(request.url).searchParams.get('id'));
        if (!parsed.success) throw new AvatarError('Objednávku jsme nenašli.', 404);
        const db = getAvatarDatabase();
        const order = await db.from('avatar_orders').select('id,email,fullname,customer_type,billing_name,company_id,vat_id,billing_address,country,base_amount,currency,terms_version,seller,legal_snapshot,usage_limits,immediate_start_accepted,status,paid_through,cancel_at_period_end,created_at,invoice_url')
            .eq('id', parsed.data).eq('principal_id', principal.id).eq('is_test', getAvatarAvailability().isTest).maybeSingle();
        if (order.error) throw new AvatarError('Potvrzení objednávky teď nelze načíst.');
        if (!order.data) throw new AvatarError('Objednávku jsme nenašli.', 404);
        const invoices = await db.from('avatar_invoices').select('stripe_invoice_id,paid_at,paid_through,amount_paid,refunded_amount,currency,invoice_url')
            .eq('order_id', order.data.id).order('paid_at', { ascending: true });
        if (invoices.error) throw new AvatarError('Doklady teď nelze načíst.');
        return new Response(JSON.stringify({ format: 'pavol-avatar-order-v1', exportedAt: new Date().toISOString(),
            product: 'Pavolův AI avatar', order: order.data, invoices: invoices.data ?? [] }, null, 2), {
            headers: { ...AVATAR_PRIVATE_HEADERS, 'Content-Type': 'application/json; charset=utf-8',
                'Content-Disposition': `attachment; filename="pavol-avatar-order-${parsed.data}.json"` },
        });
    } catch (error) {
        return NextResponse.json({ error: error instanceof AvatarError ? error.message : 'Potvrzení teď nelze načíst.' },
            { status: error instanceof AvatarError ? error.status : 503, headers: AVATAR_PRIVATE_HEADERS });
    }
}
