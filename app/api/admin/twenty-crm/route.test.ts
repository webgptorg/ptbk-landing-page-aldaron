import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
const mocks = vi.hoisted(() => ({ guard: vi.fn(), settings: vi.fn(), inspect: vi.fn(), backup: vi.fn(), schema: vi.fn(), load: vi.fn() }));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: mocks.guard }));
vi.mock('@/lib/crm/runTwentyContactSync', () => ({ getTwentyContactSyncSettings: mocks.settings }));
vi.mock('@/lib/crm/twentyCrmOperations', () => ({ backupTwentyCrm: mocks.backup, ensureTwentyCrmOperationalFields: mocks.schema, inspectTwentyCrm: mocks.inspect, loadTwentyCrmBackup: mocks.load }));
import { GET, POST } from './route';
const request = (action = 'inspect', backupKey = '', contentType = 'application/x-www-form-urlencoded') => new NextRequest('https://www.ptbk.io/api/admin/twenty-crm', {
    method: 'POST', headers: { 'content-type': contentType }, body: new URLSearchParams({ action, backupKey }),
});
describe('attended CRM operator authorization', () => {
    beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('VERCEL_ENV', 'production'); vi.stubEnv('TWENTY_CRM_OPERATOR_ENABLED', 'true'); mocks.guard.mockResolvedValue(null); mocks.settings.mockReturnValue({ key: 'private' }); });
    afterEach(() => vi.unstubAllEnvs());
    it('requires the existing superadmin guard before reading or changing CRM', async () => {
        mocks.guard.mockResolvedValue(new NextResponse(null, { status: 403 }));
        expect((await POST(request('schema'))).status).toBe(403);
        expect((await GET(request())).status).toBe(403);
        expect(mocks.settings).not.toHaveBeenCalled();
    });
    it.each(['preview', 'development'])('is unavailable in %s', async (environment) => {
        vi.stubEnv('VERCEL_ENV', environment);
        expect((await POST(request())).status).toBe(404);
        expect(mocks.inspect).not.toHaveBeenCalled();
    });
    it('never reads or mutates CRM on GET and respects the disabled flag', async () => {
        expect((await GET(request())).status).toBe(200);
        expect(mocks.settings).not.toHaveBeenCalled();
        vi.stubEnv('TWENTY_CRM_OPERATOR_ENABLED', 'false');
        expect((await POST(request())).status).toBe(404);
    });
    it('rejects unrecognized actions and formats', async () => {
        expect((await POST(request('delete'))).status).toBe(400);
        expect((await POST(request('schema', '', 'application/json'))).status).toBe(415);
        expect(mocks.schema).not.toHaveBeenCalled();
    });
    it('keeps backup and field setup explicit, passing the selected backup', async () => {
        mocks.backup.mockResolvedValue({ key: 'private/crm-operations/test.json.gz' });
        await POST(request('backup'));
        expect(mocks.schema).not.toHaveBeenCalled();
        await POST(request('schema', 'selected-backup'));
        expect(mocks.schema).toHaveBeenCalledWith({ key: 'private' }, 'selected-backup');
    });
    it('redacts unexpected errors and prevents caching', async () => {
        mocks.inspect.mockRejectedValue(new Error('Bearer secret customer@example.invalid'));
        const response = await POST(request());
        const html = await response.text();
        expect(html).toContain('crm_operator_failed'); expect(html).not.toContain('Bearer secret');
        expect(html).not.toContain('customer@example.invalid');
        expect(response.headers.get('cache-control')).toBe('private, no-store');
    });
});
