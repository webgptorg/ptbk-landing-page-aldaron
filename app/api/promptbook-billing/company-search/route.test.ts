import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BillingIdentityError } from '@/lib/promptbook-billing/billingIdentity';
import { POST } from './route';

const { search } = vi.hoisted(() => ({ search: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/promptbook-billing/billingIdentity', async (original) => ({
    ...(await original<typeof import('@/lib/promptbook-billing/billingIdentity')>()),
    searchPromptbookBillingCompanies: search,
}));

function request(body: unknown = { country: 'CZ', query: 'AI Web' }, fetchSite = 'same-origin') {
    return new NextRequest('https://www.ptbk.io/api/promptbook-billing/company-search', {
        method: 'POST',
        headers: { 'sec-fetch-site': fetchSite, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('company-name lookup API', () => {
    beforeEach(() => {
        search.mockReset().mockResolvedValue({ companies: [], hasMore: false });
    });

    it('returns optional company suggestions with no browser cache', async () => {
        const response = await POST(request());
        expect(response.status).toBe(200);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(await response.json()).toEqual({ companies: [], hasMore: false });
        expect(search).toHaveBeenCalledWith({ country: 'CZ', query: 'AI Web' });
    });

    it.each([
        { country: 'CZ', query: 'AI' },
        { country: 'CZ', query: 'x'.repeat(121) },
        { country: 'DE', query: 'AI Web' },
        { query: 'AI Web' },
    ])('rejects invalid lookup input before reaching the registry', async (body) => {
        expect((await POST(request(body))).status).toBe(400);
        expect(search).not.toHaveBeenCalled();
    });

    it('refuses cross-site requests', async () => {
        expect((await POST(request(undefined, 'cross-site'))).status).toBe(403);
        expect(search).not.toHaveBeenCalled();
    });

    it('preserves the actionable fallback on registry failure', async () => {
        search.mockRejectedValue(new BillingIdentityError('ARES teď není dostupný. Údaje můžete vyplnit ručně.', 503));
        const response = await POST(request());
        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({ error: 'ARES teď není dostupný. Údaje můžete vyplnit ručně.' });
    });
});
