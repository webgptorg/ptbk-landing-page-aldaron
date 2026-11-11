import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { BillingIdentityError, searchPromptbookBillingCompanies } from '@/lib/promptbook-billing/billingIdentity';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const searchSchema = z.object({
    country: z.enum(['CZ', 'SK']),
    query: z.string().trim().min(3).max(120),
});
const headers = { 'Cache-Control': 'no-store' };

/** Registry search is an optional form shortcut, never a requirement for placing an order. */
export async function POST(request: NextRequest) {
    const crossSite = getCrossSiteResponseOrNull(request);
    if (crossSite) return crossSite;
    const input = searchSchema.safeParse(await request.json().catch(() => null));
    if (!input.success) {
        return NextResponse.json({ error: 'Zadejte alespoň tři znaky názvu firmy.' }, { status: 400, headers });
    }
    try {
        return NextResponse.json(await searchPromptbookBillingCompanies(input.data), { headers });
    } catch (error) {
        if (error instanceof BillingIdentityError) {
            return NextResponse.json({ error: error.message }, { status: error.status, headers });
        }
        return NextResponse.json({ error: 'Firmu se nepodařilo dohledat. Údaje můžete vyplnit ručně.' }, { status: 502, headers });
    }
}
