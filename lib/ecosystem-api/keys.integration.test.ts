import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdminUserTestClient } from '@/lib/admin/adminUserTestUtilities';
import { createAdminSessionCookieHeader } from '@/lib/admin/adminSessionTestUtilities';
import { apiKeyCreateSchema, type ApiKey } from './contract';
import { acceptsApiKey, createApiKey, hashApiKey, listApiKeys, revokeApiKey } from './keys';
import { isLicenseAppRequest } from '@/lib/promptbook-licensing/appAuthentication';
import { GET as list, POST as create } from '@/app/api/admin/api-keys/route';
import { DELETE as revoke } from '@/app/api/admin/api-keys/[keyId]/route';
import { GET as canonicalSnapshot, POST as canonicalLookup } from '@/app/api/v1/licenses/route';
import { POST as canonicalExchange } from '@/app/api/v1/identity/exchange/route';
import { POST as legacyLookup } from '@/app/api/promptbook-billing/app/licenses/route';

const fakes = vi.hoisted(() => ({ database: vi.fn(), lookup: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createSupabaseServiceRoleClient: fakes.database }));
vi.mock('@/lib/promptbook-licensing/lookup', () => ({
    lookupLicenseByEmail: fakes.lookup, LicenseAccountBackfillRequired: class extends Error {},
}));

let database: PGlite;
const origin = 'https://ptbk.io';
const keyInput = () => apiKeyCreateSchema.parse({ name: 'App integration', scopes: ['licenses:read'] });
const apiRequest = (token: string, path = '/api/v1/licenses', body: unknown = { email: 'customer@example.test' }) =>
    new NextRequest(origin + path, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
function adminRequest(method = 'GET', body?: unknown, cookie = createAdminSessionCookieHeader()) {
    return new NextRequest(origin + '/api/admin/api-keys', { method, headers: { origin, cookie, 'content-type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

describe('managed ecosystem API keys through real handlers and PostgreSQL', () => {
    beforeAll(async () => {
        database = new PGlite();
        await database.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
        await database.exec(readFileSync('migrations/2026-11-2001-ecosystem-api-keys.sql', 'utf8'));
    }, 30_000);
    beforeEach(async () => {
        vi.resetAllMocks();
        vi.stubEnv('ADMIN_PASSWORD', 'synthetic-owner-password');
        vi.stubEnv('PROMPTBOOK_APP_LICENSE_SECRET', '');
        fakes.database.mockReturnValue(createAdminUserTestClient(database));
        fakes.lookup.mockResolvedValue({ status: 'none', snapshot: null });
        await database.exec('TRUNCATE ecosystem_api_keys;');
    });
    afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
    afterAll(() => database.close());

    it('creates a random key once, stores only the hash, and never lists secrets', async () => {
        const response = await create(adminRequest('POST', keyInput()));
        expect(response.status).toBe(201);
        expect(response.headers.get('cache-control')).toContain('no-store');
        const { key, token } = await response.json() as { key: ApiKey; token: string };
        expect(token).toMatch(/^ptbk_[A-Za-z0-9_-]{43}$/);
        expect(key.createdBy).toBe('admin');
        const { rows } = await database.query<{ token_hash: string }>('SELECT * FROM ecosystem_api_keys');
        expect(rows[0].token_hash).toBe(hashApiKey(token));
        expect(JSON.stringify(rows)).not.toContain(token);
        const listing = await list(adminRequest());
        const data = await listing.json() as Awaited<ReturnType<typeof listApiKeys>>;
        expect(data.total).toBe(1);
        expect(data.items[0].prefix).toBe(token.slice(0, 13));
        expect(JSON.stringify(data)).not.toMatch(/token_hash|tokenHash/);
        expect(JSON.stringify(data)).not.toContain(token);
        expect(data.items[0].revokedAt).toBeNull();
        expect(await acceptsApiKey(token, 'licenses:read')).toBe(true);
    });

    it('enforces scopes on canonical and compatible routes before parsing input', async () => {
        const { token } = await createApiKey(keyInput(), 'key-admin');
        expect((await canonicalLookup(apiRequest(token))).status).toBe(200);
        expect((await legacyLookup(apiRequest(token, '/api/promptbook-billing/app/licenses'))).status).toBe(200);
        expect((await canonicalSnapshot(new NextRequest(origin + '/api/v1/licenses?subject=bad', { headers: { authorization: `Bearer ${token}` } }))).status).toBe(400);
        const denied = apiRequest(token, '/api/v1/identity/exchange', {});
        expect((await canonicalExchange(denied)).status).toBe(401);
        expect(denied.bodyUsed).toBe(false);
        const identityKey = await createApiKey({ ...keyInput(), scopes: ['identity:exchange'] }, 'key-admin');
        expect((await canonicalLookup(apiRequest(identityKey.token))).status).toBe(401);
        expect((await canonicalExchange(apiRequest(identityKey.token, '/api/v1/identity/exchange', {}))).status).toBe(400);
    });

    it('applies expiry and revocation on the next request and preserves the first revocation audit', async () => {
        const now = new Date('2030-01-01T00:00:00Z');
        vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(now);
        const { key, token } = await createApiKey({ ...keyInput(), expiresAt: '2030-01-01T00:00:01Z' }, 'key-admin');
        expect(await acceptsApiKey(token, 'licenses:read')).toBe(true);
        vi.setSystemTime(new Date(now.getTime() + 1000));
        expect((await canonicalLookup(apiRequest(token))).status).toBe(401);
        expect(await revokeApiKey(key.id, 'revoking-admin')).toBe(true);
        vi.setSystemTime(new Date(now.getTime() + 2000));
        expect(await revokeApiKey(key.id, 'different-admin')).toBe(true);
        const listing = await listApiKeys(0);
        expect(listing.items[0].revokedBy).toBe('revoking-admin');
        expect(new Date(listing.items[0].revokedAt!).toISOString()).toBe('2030-01-01T00:00:01.000Z');
        vi.setSystemTime(now);
        expect(await acceptsApiKey(token, 'licenses:read')).toBe(false);
    });

    it('protects reads, creation and revocation with the admin session and cross-site guard', async () => {
        const { key, token } = await createApiKey(keyInput(), 'key-admin');
        expect((await create(adminRequest('POST', keyInput(), ''))).status).toBe(401);
        expect((await list(adminRequest('GET', undefined, ''))).status).toBe(401);
        const crossSite = new NextRequest(origin + `/api/admin/api-keys/${key.id}`, { method: 'DELETE', headers: { origin: 'https://other.test', cookie: createAdminSessionCookieHeader() } });
        expect((await revoke(crossSite, { params: Promise.resolve({ keyId: key.id }) })).status).toBe(403);
        expect(await acceptsApiKey(token, 'licenses:read')).toBe(true);
        expect((await revoke(adminRequest('DELETE'), { params: Promise.resolve({ keyId: key.id }) })).status).toBe(200);
        expect(await acceptsApiKey(token, 'licenses:read')).toBe(false);
    });

    it('fails closed during key-storage outages and retains the legacy server integration', async () => {
        const { token } = await createApiKey(keyInput(), 'key-admin');
        fakes.database.mockReturnValue(null);
        const request = apiRequest(token);
        expect((await canonicalLookup(request)).status).toBe(503);
        expect(request.bodyUsed).toBe(false);
        expect(fakes.lookup).not.toHaveBeenCalled();
        vi.stubEnv('PROMPTBOOK_APP_LICENSE_SECRET', 'synthetic-legacy-server-key-at-least-32');
        expect(await isLicenseAppRequest(apiRequest('synthetic-legacy-server-key-at-least-32'))).toBe(true);
        vi.stubEnv('PROMPTBOOK_APP_LICENSE_SECRET', token);
        expect((await canonicalLookup(apiRequest(token))).status).toBe(503);
    });

    it('rejects untrusted metadata and preserves private database grants', async () => {
        for (const body of [{ ...keyInput(), createdBy: 'forged' }, { ...keyInput(), scopes: [] }, { ...keyInput(), scopes: ['superadmin'] },
            { ...keyInput(), scopes: ['licenses:read', 'licenses:read'] }, { ...keyInput(), expiresAt: '2000-01-01T00:00:00Z' }]) {
            expect((await create(adminRequest('POST', body))).status).toBe(400);
        }
        expect((await database.query('SELECT * FROM ecosystem_api_keys')).rows).toHaveLength(0);
        const { rows } = await database.query(`SELECT relrowsecurity AS rls,
            has_table_privilege('anon','ecosystem_api_keys','SELECT') AS anon_access,
            has_table_privilege('authenticated','ecosystem_api_keys','SELECT') AS member_access,
            has_table_privilege('service_role','ecosystem_api_keys','DELETE') AS service_delete
            FROM pg_class WHERE oid='ecosystem_api_keys'::regclass`);
        expect(rows[0]).toEqual({ rls: true, anon_access: false, member_access: false, service_delete: false });
        await database.exec('SET ROLE anon;');
        await expect(database.query('SELECT token_hash FROM ecosystem_api_keys')).rejects.toThrow();
        await database.exec('RESET ROLE;');
    });
});
