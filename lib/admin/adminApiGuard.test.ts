import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionCookieHeader } from '@/lib/admin/adminSessionTestUtilities';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD = 'correct-horse-battery-staple';
const ADMIN_API_URL = 'https://promptbook.studio/api/admin/workshops';

function createAdminApiRequest(headers: Readonly<Record<string, string>> = {}): NextRequest {
    return new NextRequest(ADMIN_API_URL, { headers });
}

describe('the guard of the administration API', () => {
    beforeEach(() => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
    });

    afterEach(() => {
        if (ORIGINAL_ADMIN_PASSWORD === undefined) {
            delete process.env.ADMIN_PASSWORD;
        } else {
            process.env.ADMIN_PASSWORD = ORIGINAL_ADMIN_PASSWORD;
        }
    });

    it('lets a request of a signed in administrator through', async () => {
        const request = createAdminApiRequest({ cookie: createAdminSessionCookieHeader() });

        expect(await getUnauthorizedResponseOrNull(request)).toBeNull();
    });

    it('refuses a request without a session before it reaches the database', async () => {
        expect((await getUnauthorizedResponseOrNull(createAdminApiRequest()))?.status).toBe(401);
    });

    it('refuses a made up session', async () => {
        const request = createAdminApiRequest({ cookie: `${ADMIN_SESSION_COOKIE_NAME}=made-up-session` });

        expect((await getUnauthorizedResponseOrNull(request))?.status).toBe(401);
    });

    it('no longer opens the administration by a token written into the address', async () => {
        const request = new NextRequest(`${ADMIN_API_URL}?token=${ADMIN_PASSWORD}`);

        expect((await getUnauthorizedResponseOrNull(request))?.status).toBe(401);
    });

    it('refuses a request which another site sends with the session of the administrator', async () => {
        const request = createAdminApiRequest({
            cookie: createAdminSessionCookieHeader(),
            origin: 'https://example.com',
        });

        expect((await getUnauthorizedResponseOrNull(request))?.status).toBe(403);
    });
});
