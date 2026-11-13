import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
const mocks = vi.hoisted(() => ({ guard: vi.fn(), sync: vi.fn(), settings: vi.fn(), schema: vi.fn() }));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: mocks.guard }));
vi.mock('@/lib/crm/runTwentyCommerceSync', () => ({ runTwentyCommerceSync: mocks.sync }));
vi.mock('@/lib/crm/runTwentyContactSync', () => ({ getTwentyContactSyncSettings: mocks.settings }));
vi.mock('@/lib/crm/twentyCommerceSchema', () => ({ ensureTwentyCommerceSchema: mocks.schema }));
import { GET, POST } from './route';
const request = (action = 'verify', contentType = 'application/x-www-form-urlencoded') => new NextRequest(
    'https://www.ptbk.io/api/admin/twenty-commerce', { method: 'POST', headers: { 'content-type': contentType }, body: new URLSearchParams({ action }) },
);
describe('explicit CRM commerce operator', () => {
    beforeEach(() => {
        vi.stubEnv('VERCEL_ENV', 'production');
        vi.stubEnv('TWENTY_COMMERCE_OPERATOR_ENABLED', 'true');
        vi.clearAllMocks();
        mocks.guard.mockResolvedValue(null);
        mocks.sync.mockResolvedValue({ verified: 11, replayWrites: 0 });
        mocks.settings.mockReturnValue({ key: 'test-only' });
        mocks.schema.mockResolvedValue({ version: 'test' });
    });
    afterEach(() => vi.unstubAllEnvs());
    it('checks owner authorization before any operation', async () => {
        mocks.guard.mockResolvedValue(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
        expect((await POST(request())).status).toBe(403);
        expect(mocks.sync).not.toHaveBeenCalled();
        expect(mocks.schema).not.toHaveBeenCalled();
    });
    it.each(['preview', 'development'])('refuses %s even when the operator is enabled', async (environment) => {
        vi.stubEnv('VERCEL_ENV', environment);
        expect((await POST(request())).status).toBe(404);
        expect(mocks.sync).not.toHaveBeenCalled();
    });
    it('is disabled unless explicitly enabled and never imports on GET', async () => {
        vi.stubEnv('TWENTY_COMMERCE_OPERATOR_ENABLED', 'false');
        expect((await POST(request())).status).toBe(404);
        vi.stubEnv('TWENTY_COMMERCE_OPERATOR_ENABLED', 'true');
        expect((await GET(request())).status).toBe(200);
        expect(mocks.sync).not.toHaveBeenCalled();
    });
    it('refuses unexpected request formats and actions', async () => {
        expect((await POST(request('verify', 'application/json'))).status).toBe(415);
        expect((await POST(request('delete'))).status).toBe(400);
        expect(mocks.sync).not.toHaveBeenCalled();
    });
    it('keeps source inspection, schema setup and verified import separate', async () => {
        await POST(request('dry-run'));
        expect(mocks.sync).toHaveBeenLastCalledWith({ dryRun: true });
        await POST(request('setup'));
        expect(mocks.schema).toHaveBeenCalledWith({ key: 'test-only' }, true);
        expect(mocks.sync).toHaveBeenCalledTimes(1);
        await POST(request('verify'));
        expect(mocks.sync).toHaveBeenLastCalledWith({ verify: true });
    });
    it('reports a busy lock without fabricating successful verification', async () => {
        mocks.sync.mockResolvedValue({ busy: true });
        expect((await POST(request())).status).toBe(409);
    });
    it('does not expose provider errors or permit page caching', async () => {
        mocks.sync.mockRejectedValue(new Error('sk_live_private private@example.invalid'));
        const response = await POST(request());
        expect(response.status).toBe(502);
        const html = await response.text();
        expect(html).toContain('commerce_operator_failed');
        expect(html).not.toContain('sk_live_private');
        expect(html).not.toContain('private@example.invalid');
        expect(response.headers.get('cache-control')).toBe('private, no-store');
        expect(response.headers.get('content-security-policy')).toContain("form-action 'self'");
    });
});
