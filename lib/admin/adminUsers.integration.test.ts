import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdminUserTestClient } from './adminUserTestUtilities';
import { createAdminSessionCookieHeader } from './adminSessionTestUtilities';
import { ADMIN_SESSION_COOKIE_NAME } from './adminConstants';
import { getAdminIdentityForSession } from './adminIdentity';
import { getUnauthorizedResponseOrNull } from './adminApiGuard';
import { canAccessAdminPath, ADMIN_PERMISSION_DEFINITIONS } from './adminPermissions';
import { createAdminUserSessionValueOrNull, isAdminSessionValueValid, readAdminUserSessionOrNull } from './adminSession';
import { POST as SIGN_IN } from '@/app/api/admin/session/route';
import { GET as LIST_USERS, POST as CREATE_USER } from '@/app/api/admin/users/route';
import { PATCH as UPDATE_USER, DELETE as DELETE_USER } from '@/app/api/admin/users/[userId]/route';
import type { AdminUser } from './adminUserSchemas';

const mocks = vi.hoisted(() => ({ database: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createSupabaseServiceRoleClient: mocks.database }));

const ORIGIN = 'https://ptbk.io';
const PASSWORD = 'A-long-private-password-123';
const NEW_PASSWORD = 'Another-private-password-456';
let database: PGlite;

function request(path: string, method = 'GET', body?: unknown, cookie = createAdminSessionCookieHeader()) {
    return new NextRequest(ORIGIN + path, { method, headers: { cookie, origin: ORIGIN, 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

async function createUser(permissions: readonly string[] = ['shortener'], username = 'short-links'): Promise<AdminUser> {
    const response = await CREATE_USER(request('/api/admin/users', 'POST', { username, password: PASSWORD, permissions }));
    expect(response.status).toBe(201);
    const body = await response.json() as { readonly user: AdminUser };
    expect(JSON.stringify(body)).not.toMatch(/password|session_version|scrypt|A-long-private/);
    return body.user as AdminUser;
}

async function login(username = 'short-links', password = PASSWORD, redirectPath = '/admin/shortener') {
    return SIGN_IN(new NextRequest(ORIGIN + '/api/admin/session', { method: 'POST', headers: { origin: ORIGIN },
        body: new URLSearchParams({ username, password, redirectPath }) }));
}

function userContext(user: AdminUser) { return { params: Promise.resolve({ userId: user.id }) }; }

// Real scrypt verification is intentionally retained; allow headroom alongside the other integration suites.
describe('delegated administrators through real handlers and PostgreSQL constraints', { timeout: 20_000 }, () => {
    beforeAll(async () => {
        database = new PGlite();
        await database.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;');
        await database.exec(readFileSync('migrations/2026-10-2800-admin-users.sql', 'utf8'));
        await database.exec('CREATE TABLE workshops (id uuid PRIMARY KEY, room_kind text);');
    }, 20_000);
    beforeEach(async () => {
        vi.stubEnv('ADMIN_PASSWORD', 'local-superadmin-password');
        mocks.database.mockReturnValue(createAdminUserTestClient(database));
        await database.exec('TRUNCATE admin_users, workshops;');
    });
    afterEach(() => vi.unstubAllEnvs());
    afterAll(async () => database.close());

    it('logs in a shortener-only user, checks both API and pages, and never elevates its cookie', async () => {
        await createUser();
        const response = await login('SHORT-LINKS');
        expect(response.headers.get('location')).toBe('/admin/shortener');
        const value = response.cookies.get(ADMIN_SESSION_COOKIE_NAME)!.value;
        const cookie = `${ADMIN_SESSION_COOKIE_NAME}=${value}`;
        expect(isAdminSessionValueValid(value)).toBe(false);
        const identity = (await getAdminIdentityForSession(value))!;
        expect(identity.isSuperAdmin).toBe(false);
        expect(canAccessAdminPath(identity, '/admin/shortener')).toBe(true);
        expect(canAccessAdminPath(identity, '/admin/shortener/item')).toBe(true);
        expect(canAccessAdminPath(identity, '/admin')).toBe(true);
        for (const path of ['/admin/contacts', '/admin/users', '/admin/community', '/admin/studio', '/admin/shortener-other']) {
            expect(canAccessAdminPath(identity, path)).toBe(false);
        }
        expect(await getUnauthorizedResponseOrNull(request('/api/admin/shortener', 'GET', undefined, cookie))).toBeNull();
        for (const path of ['/api/contacts', '/api/contacts/export/csv', '/api/admin/users', '/api/admin/discount-codes', '/api/admin/studio/access', '/api/admin/recording-studio/transcribe', '/api/admin/workshops', '/api/admin/community/memberships', '/api/admin/future-section']) {
            expect((await getUnauthorizedResponseOrNull(request(path, 'GET', undefined, cookie)))?.status).toBe(403);
        }
        expect((await LIST_USERS(request('/api/admin/users', 'GET', undefined, cookie))).status).toBe(403);
        expect((await CREATE_USER(request('/api/admin/users', 'POST', { username: 'elevated' }, cookie))).status).toBe(403);
        expect((await login('short-links', PASSWORD, '/admin/contacts')).headers.get('location')).toBe('/admin');
    });

    it('applies a changed permission to an existing cookie on its next request', async () => {
        const user = await createUser();
        const value = (await login()).cookies.get(ADMIN_SESSION_COOKIE_NAME)!.value;
        const response = await UPDATE_USER(request(`/api/admin/users/${user.id}`, 'PATCH', { permissions: ['contacts'] }), userContext(user));
        expect(response.status).toBe(200);
        const identity = (await getAdminIdentityForSession(value))!;
        expect(canAccessAdminPath(identity, '/admin/shortener')).toBe(false);
        expect(canAccessAdminPath(identity, '/admin/contacts')).toBe(true);
        expect((await getUnauthorizedResponseOrNull(request('/api/admin/shortener', 'GET', undefined, `${ADMIN_SESSION_COOKIE_NAME}=${value}`)))?.status).toBe(403);
    });

    it('revokes old sessions when disabling, re-enabling, changing passwords and deleting', async () => {
        const user = await createUser();
        const firstSession = (await login()).cookies.get(ADMIN_SESSION_COOKIE_NAME)!.value;
        await UPDATE_USER(request(`/api/admin/users/${user.id}`, 'PATCH', { isEnabled: false }), userContext(user));
        expect(await getAdminIdentityForSession(firstSession)).toBeNull();
        expect((await login()).cookies.get(ADMIN_SESSION_COOKIE_NAME)).toBeUndefined();
        await UPDATE_USER(request(`/api/admin/users/${user.id}`, 'PATCH', { isEnabled: true }), userContext(user));
        expect(await getAdminIdentityForSession(firstSession)).toBeNull();
        const secondSession = (await login()).cookies.get(ADMIN_SESSION_COOKIE_NAME)!.value;
        const changed = await UPDATE_USER(request(`/api/admin/users/${user.id}`, 'PATCH', { password: NEW_PASSWORD }), userContext(user));
        expect(changed.status).toBe(200);
        expect(await getAdminIdentityForSession(secondSession)).toBeNull();
        expect((await login()).cookies.get(ADMIN_SESSION_COOKIE_NAME)).toBeUndefined();
        const thirdSession = (await login('short-links', NEW_PASSWORD)).cookies.get(ADMIN_SESSION_COOKIE_NAME)!.value;
        expect(await getAdminIdentityForSession(thirdSession)).not.toBeNull();
        expect((await DELETE_USER(request(`/api/admin/users/${user.id}`, 'DELETE'), userContext(user))).status).toBe(200);
        expect(await getAdminIdentityForSession(thirdSession)).toBeNull();
    });

    it('keeps even fully delegated users out of account management and refuses escalation fields', async () => {
        const user = await createUser(ADMIN_PERMISSION_DEFINITIONS.map((item) => item.id));
        const value = (await login()).cookies.get(ADMIN_SESSION_COOKIE_NAME)!.value;
        const cookie = `${ADMIN_SESSION_COOKIE_NAME}=${value}`;
        expect((await UPDATE_USER(request(`/api/admin/users/${user.id}`, 'PATCH', { permissions: ['superadmin'] }, cookie), userContext(user))).status).toBe(403);
        for (const body of [{ isSuperAdmin: true }, { permissions: ['superadmin'] }, { session_version: 'forged' }, { username: 'ADMIN' }, { password: 'short' }]) {
            expect((await UPDATE_USER(request(`/api/admin/users/${user.id}`, 'PATCH', body), userContext(user))).status).toBe(400);
        }
        expect((await CREATE_USER(request('/api/admin/users', 'POST', { username: 'admin', password: PASSWORD, permissions: [] }))).status).toBe(400);
        const duplicate = await CREATE_USER(request('/api/admin/users', 'POST', { username: 'SHORT-LINKS', password: PASSWORD, permissions: [] }));
        expect(duplicate.status).toBe(409);
        expect((await LIST_USERS(request('/api/admin/users'))).status).toBe(200);
    });

    it('distinguishes shared workshop APIs by the stored room kind', async () => {
        await createUser(['community']);
        const value = (await login()).cookies.get(ADMIN_SESSION_COOKIE_NAME)!.value;
        const cookie = `${ADMIN_SESSION_COOKIE_NAME}=${value}`;
        const workshopId = '11111111-1111-4111-8111-111111111111';
        const communityId = '22222222-2222-4222-8222-222222222222';
        await database.query('INSERT INTO workshops VALUES ($1,$2),($3,$4)', [workshopId, 'workshop', communityId, 'community']);
        expect(await getUnauthorizedResponseOrNull(request('/api/admin/workshops?kind=community', 'GET', undefined, cookie))).toBeNull();
        expect(await getUnauthorizedResponseOrNull(request(`/api/admin/workshops/${communityId}/participants`, 'GET', undefined, cookie))).toBeNull();
        expect((await getUnauthorizedResponseOrNull(request(`/api/admin/workshops/${workshopId}/participants?kind=community`, 'GET', undefined, cookie)))?.status).toBe(403);
        expect((await getUnauthorizedResponseOrNull(request('/api/admin/workshops?kind=project', 'GET', undefined, cookie)))?.status).toBe(403);
        expect((await getUnauthorizedResponseOrNull(request('/api/admin/workshops', 'POST', {}, cookie)))?.status).toBe(403);
    });

    it('stores salted hashes and never returns hashes or session versions in list responses', async () => {
        await createUser(); await createUser([], 'no-access');
        const { rows } = await database.query<{ password_hash: string }>('SELECT password_hash FROM admin_users');
        expect(rows[0].password_hash).toMatch(/^scrypt-/);
        expect(rows[0].password_hash).not.toContain(PASSWORD);
        expect(rows[0].password_hash).not.toBe(rows[1].password_hash);
        expect(JSON.stringify(await (await LIST_USERS(request('/api/admin/users'))).json())).not.toMatch(/password|session_version|scrypt/);
    });

    it('rejects forged, future and expired user cookies and fails closed on a database outage', async () => {
        const user = await createUser();
        const value = (await login()).cookies.get(ADMIN_SESSION_COOKIE_NAME)!.value;
        expect(await getAdminIdentityForSession(value.replace(user.id, '99999999-9999-4999-8999-999999999999'))).toBeNull();
        const session = readAdminUserSessionOrNull(value)!;
        expect(readAdminUserSessionOrNull(createAdminUserSessionValueOrNull(session, Date.now() + 60_000))).toBeNull();
        expect(readAdminUserSessionOrNull(createAdminUserSessionValueOrNull(session, Date.now() - 8 * 86400_000))).toBeNull();
        mocks.database.mockReturnValue(null);
        expect((await getUnauthorizedResponseOrNull(request('/api/admin/shortener', 'GET', undefined, `${ADMIN_SESSION_COOKIE_NAME}=${value}`)))?.status).toBe(503);
        expect(await getUnauthorizedResponseOrNull(request('/api/admin/users'))).toBeNull(); // Environment superadmin remains independent.
        vi.stubEnv('ADMIN_PASSWORD', 'rotated-superadmin-password');
        expect(await getAdminIdentityForSession(value)).toBeNull();
    });

    it('refuses cross-site writes before touching the account database', async () => {
        const before = mocks.database.mock.calls.length;
        const response = await CREATE_USER(new NextRequest(ORIGIN + '/api/admin/users', {
            method: 'POST', headers: { cookie: createAdminSessionCookieHeader(), origin: 'https://elsewhere.example' }, body: '{}',
        }));
        expect(response.status).toBe(403);
        expect(mocks.database.mock.calls.length).toBe(before);
    });
});
