import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { memberResponse } from '@/lib/promptbook-billing/memberAccess';
import { licenseDatabase } from '@/lib/promptbook-licensing/accounts';
import { adminEmailPattern, loadSubscriptionDetail, readAdminPageQuery } from '@/lib/promptbook-licensing/adminData';

export async function GET(request: NextRequest) {
    const rejected = await getUnauthorizedResponseOrNull(request);
    if (rejected) return rejected;
    try {
        const params = request.nextUrl.searchParams;
        const { offset, isTest, query, limit } = readAdminPageQuery(params);
        const product = z.enum(['all','promptbook','community','avatar']).parse(params.get('product') ?? 'all');
        if (params.has('record')) {
            if (product === 'all') return memberResponse({ error: 'Vyberte produkt.' }, 400);
            const detail = await loadSubscriptionDetail(z.string().uuid().parse(params.get('record')), product, isTest, offset);
            return detail ? memberResponse(detail) : memberResponse({ error: 'Předplatné nebylo nalezeno.' }, 404);
        }
        let lookup = licenseDatabase().from('promptbook_admin_subscriptions').select('*', { count: 'exact' }).eq('is_test', isTest);
        if (product !== 'all') lookup = lookup.eq('product', product);
        if (query) lookup = lookup.ilike('email', adminEmailPattern(query));
        const result = await lookup.order('created_at', { ascending: false }).order('product').order('id').range(offset, offset+limit-1);
        if (result.error) throw new Error('Subscription list unavailable');
        return memberResponse({ items: result.data, total: result.count ?? 0, offset, limit });
    } catch (error) {
        return error instanceof z.ZodError ? memberResponse({ error: 'Neplatný filtr.' }, 400) : memberResponse({ error: 'Předplatná nejsou dostupná.' }, 503);
    }
}
