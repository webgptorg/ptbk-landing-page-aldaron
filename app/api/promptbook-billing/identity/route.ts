import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { BillingIdentityError, suggestPromptbookBillingIdentity } from '@/lib/promptbook-billing/billingIdentity';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const identitySchema = z.object({
    country: z.enum(['CZ', 'SK']),
    companyId: z.string().trim().regex(/^\d{8}$/),
    vatId: z.string().trim().max(24).optional(),
});
const headers = { 'Cache-Control': 'no-store' };

/** Lookup suggestions never replace the billing details subsequently submitted by the customer. */
export async function POST(request: NextRequest) {
    const crossSite = getCrossSiteResponseOrNull(request);
    if (crossSite) return crossSite;
    const input = identitySchema.safeParse(await request.json().catch(() => null));
    if (!input.success) return NextResponse.json({ error: 'Zkontrolujte IČO.' }, { status: 400, headers });
    try {
        const identity = await suggestPromptbookBillingIdentity(input.data);
        return NextResponse.json(identity, { headers });
    } catch (error) {
        if (error instanceof BillingIdentityError) {
            return NextResponse.json({ error: error.message }, { status: error.status, headers });
        }
        return NextResponse.json({ error: 'Údaje se nepodařilo dohledat. Vyplňte je ručně.' }, { status: 502, headers });
    }
}
