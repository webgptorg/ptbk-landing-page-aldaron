import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { syncPromptbookBillingContact } from '@/lib/promptbook-billing/billingContacts';
import { getBillingDatabase, PROMPTBOOK_ORDERS_TABLE, type PromptbookOrder } from '@/lib/promptbook-billing/billingOrders';
import {
    loadAuthorizedBillingOrders,
    memberResponse,
    rejectCrossSiteMemberRequest,
} from '@/lib/promptbook-billing/memberAccess';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
    id: z.string().uuid(),
    phone: z.string().trim().max(50).optional(),
    note: z.string().trim().max(2000).optional(),
});

export async function POST(request: NextRequest) {
    const rejected = rejectCrossSiteMemberRequest(request);
    if (rejected) {
        return rejected;
    }
    const parsed = requestSchema.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success || (parsed.data.phone === undefined && parsed.data.note === undefined)) {
        return memberResponse({ error: 'Zkontrolujte telefon a poznámku.' }, 400);
    }

    try {
        const database = getBillingDatabase();
        if (!database) {
            return memberResponse({ error: 'Údaje teď nelze uložit.' }, 503);
        }

        const order = (await loadAuthorizedBillingOrders(request)).find(({ id }) => id === parsed.data.id);
        if (!order || (order.first_paid_at === null && order.status !== 'active')) {
            return memberResponse({ error: 'Předplatné jsme nenašli.' }, 404);
        }

        const { phone, note } = parsed.data;
        const { data, error } = await database.from(PROMPTBOOK_ORDERS_TABLE).update({
            ...(phone === undefined ? {} : { phone: phone || null }),
            ...(note === undefined ? {} : { onboarding_note: note || null }),
        }).eq('id', order.id).select('*').single();
        if (error || !data) {
            return memberResponse({ error: 'Údaje se nepodařilo uložit. Zkuste to za chvíli.' }, 503);
        }

        try {
            await syncPromptbookBillingContact(data as PromptbookOrder, { isOnboardingUpdate: true });
        } catch {
            return memberResponse({ error: 'Údaje jsme uložili k objednávce. Přenos kontaktu se nezdařil. Zkuste odeslat údaje ještě jednou.' }, 503);
        }
        return memberResponse({ ok: true });
    } catch {
        return memberResponse({ error: 'Údaje teď nelze uložit.' }, 503);
    }
}
