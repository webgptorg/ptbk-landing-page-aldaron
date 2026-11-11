import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const { loadOrders, renderConfirmation } = vi.hoisted(() => ({ loadOrders: vi.fn(), renderConfirmation: vi.fn() }));
vi.mock('@/lib/promptbook-billing/memberAccess', async (original) => ({
    ...(await original<typeof import('@/lib/promptbook-billing/memberAccess')>()),
    loadAuthorizedBillingOrders: loadOrders,
}));
vi.mock('@/lib/promptbook-billing/billingConfirmation', () => ({ createPromptbookOrderConfirmation: renderConfirmation }));
const id = 'c2a1a142-348f-43e8-8718-6a3820053cb7';

function request(queryId = id, fetchSite = 'same-origin') {
    return new NextRequest(`https://www.ptbk.io/api/promptbook-billing/confirmation?id=${queryId}`, {
        headers: { 'sec-fetch-site': fetchSite },
    });
}

describe('private confirmation download', () => {
    beforeEach(() => {
        loadOrders.mockReset().mockResolvedValue([{ id }]);
        renderConfirmation.mockReset().mockReturnValue('<!doctype html><p>Frozen confirmation</p>');
    });

    it('requires the selected order to appear in the independently authorized set', async () => {
        loadOrders.mockResolvedValue([]);
        expect((await GET(request())).status).toBe(404);
        expect(renderConfirmation).not.toHaveBeenCalled();
    });

    it('rejects cross-site downloads and unconfirmed orders', async () => {
        expect((await GET(request(id, 'cross-site'))).status).toBe(403);
        expect(loadOrders).not.toHaveBeenCalled();
        renderConfirmation.mockReturnValue(null);
        expect((await GET(request())).status).toBe(404);
    });

    it('delivers a private attachment with no executable or externally loaded content', async () => {
        const response = await GET(request());
        expect(response.status).toBe(200);
        expect(response.headers.get('content-disposition')).toBe(`attachment; filename="promptbook-objednavka-${id}.html"`);
        expect(response.headers.get('cache-control')).toBe('private, no-store');
        expect(response.headers.get('referrer-policy')).toBe('no-referrer');
        expect(response.headers.get('content-security-policy')).toContain("default-src 'none'");
        expect(await response.text()).toContain('Frozen confirmation');
    });
});
