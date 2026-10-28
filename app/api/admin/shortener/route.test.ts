import { createAdminSessionCookieHeader } from '@/lib/admin/adminSessionTestUtilities';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
    createSupabaseServiceRoleClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}));

import { GET, POST } from './route';

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD = 'shortener-admin-token';

const SHORTCODE_LINK_ROW = {
    id: 42,
    createdAt: '2026-08-21T10:00:00.000Z',
    shortcode: 'campaign-abc123',
    url: ['https://example.com/offer'],
    note: 'Autumn campaign',
    landingPage: null,
    isAdHoc: false,
    sourceApp: 'admin-shortener',
};

const SHORTCODE_LINK = {
    domains: null,
    id: 42,
    createdAt: '2026-08-21T10:00:00.000Z',
    shortcode: 'campaign-abc123',
    urls: ['https://example.com/offer'],
    note: 'Autumn campaign',
    landingPage: null,
    isAdHoc: false,
    sourceApp: 'admin-shortener',
};

const SHORTCODE_LINK_SUMMARY = {
    ...SHORTCODE_LINK,
    clickCount: 2,
};

function createShortcodeLinkInsertDatabase(result: {
    readonly data: unknown;
    readonly error: { readonly code?: string; readonly message: string } | null;
}) {
    const single = vi.fn().mockResolvedValue(result);
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));

    return { from, insert, select };
}

function createShortcodeLinkListDatabase(shortcodeLinkRows: readonly unknown[], shortcodeLinkClickRows: readonly unknown[]) {
    const shortcodeLinkRange = vi.fn().mockResolvedValue({ data: shortcodeLinkRows, error: null });
    const shortcodeLinkOrderById = vi.fn(() => ({ range: shortcodeLinkRange }));
    const shortcodeLinkOrderByCreation = vi.fn(() => ({ order: shortcodeLinkOrderById }));
    const shortcodeLinkSelect = vi.fn(() => ({ order: shortcodeLinkOrderByCreation }));

    const shortcodeLinkClickRange = vi.fn().mockResolvedValue({ data: shortcodeLinkClickRows, error: null });
    const shortcodeLinkClickOrderById = vi.fn(() => ({ range: shortcodeLinkClickRange }));
    const shortcodeLinkClickOrderByLink = vi.fn(() => ({ order: shortcodeLinkClickOrderById }));
    const shortcodeLinkClickNotNavigated = vi.fn(() => ({ order: shortcodeLinkClickOrderByLink }));
    const shortcodeLinkClickSelect = vi.fn(() => ({ not: shortcodeLinkClickNotNavigated }));

    const from = vi.fn((tableName: string) =>
        tableName === 'ShortcodeLink'
            ? { select: shortcodeLinkSelect }
            : { select: shortcodeLinkClickSelect },
    );

    return {
        from,
        shortcodeLinkRange,
        shortcodeLinkClickRange,
        shortcodeLinkClickNotNavigated,
    };
}

function createShortcodeLinkRequest(
    method: 'GET' | 'POST',
    isAdminSignedIn: boolean,
    body?: Readonly<Record<string, unknown>>,
): NextRequest {
    const headers: Record<string, string> = isAdminSignedIn ? { cookie: createAdminSessionCookieHeader() } : {};
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    return new NextRequest('https://promptbook.studio/api/admin/shortener', {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

function restoreAdminToken(): void {
    if (ORIGINAL_ADMIN_PASSWORD === undefined) {
        delete process.env.ADMIN_PASSWORD;
    } else {
        process.env.ADMIN_PASSWORD = ORIGINAL_ADMIN_PASSWORD;
    }
}

describe('admin shortcode link collection', () => {
    beforeEach(() => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
        createSupabaseServiceRoleClientMock.mockReset();
    });

    afterEach(() => {
        restoreAdminToken();
    });

    it('refuses a listing without the session of an administrator before reaching the database', async () => {
        const response = await GET(createShortcodeLinkRequest('GET', false));

        expect(response.status).toBe(401);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('lists every short link for an administrator', async () => {
        const database = createShortcodeLinkListDatabase([SHORTCODE_LINK_ROW], [
            { shortcodeLinkId: SHORTCODE_LINK_ROW.id },
            { shortcodeLinkId: SHORTCODE_LINK_ROW.id },
        ]);
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await GET(createShortcodeLinkRequest('GET', true));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ shortcodeLinks: [SHORTCODE_LINK_SUMMARY] });
        expect(database.from).toHaveBeenCalledWith('ShortcodeLink');
        expect(database.from).toHaveBeenCalledWith('ShortcodeLinkClick');
        expect(database.shortcodeLinkRange).toHaveBeenCalledWith(0, 999);
        expect(database.shortcodeLinkClickRange).toHaveBeenCalledWith(0, 999);
        expect(database.shortcodeLinkClickNotNavigated).toHaveBeenCalledWith('navigatedAt', 'is', null);
    });

    it('refuses a request without the session of an administrator before reaching the database', async () => {
        const response = await POST(
            createShortcodeLinkRequest('POST', false, { shortcode: 'public-code', urls: ['https://example.com'] }),
        );

        expect(response.status).toBe(401);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('writes a validated shortcode only through the server service role', async () => {
        const database = createShortcodeLinkInsertDatabase({ data: SHORTCODE_LINK_ROW, error: null });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await POST(
            createShortcodeLinkRequest('POST', true, {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/offer'],
                note: 'Autumn campaign',
            }),
        );

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ shortcodeLink: SHORTCODE_LINK });
        expect(database.from).toHaveBeenCalledWith('ShortcodeLink');
        expect(database.insert).toHaveBeenCalledWith({
            domains: null,
            shortcode: 'campaign-abc123',
            url: ['https://example.com/offer'],
            note: 'Autumn campaign',
            landingPage: null,
            type: 'CUSTOM',
            ownerEmail: null,
            isAdHoc: false,
            sourceApp: 'admin-shortener',
        });
    });

    it('does not reach the database for an invalid short link request', async () => {
        const response = await POST(
            createShortcodeLinkRequest('POST', true, { shortcode: 'not/a-code', urls: ['not a URL'] }),
        );

        expect(response.status).toBe(400);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('reports an unavailable service-role database instead of falling back to the public client', async () => {
        createSupabaseServiceRoleClientMock.mockReturnValue(null);

        const response = await POST(
            createShortcodeLinkRequest('POST', true, {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/offer'],
            }),
        );

        expect(response.status).toBe(503);
    });

    it('allows an administrator to choose another preview when the shortcode already exists', async () => {
        const database = createShortcodeLinkInsertDatabase({
            data: null,
            error: { code: '23505', message: 'duplicate key value' },
        });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await POST(
            createShortcodeLinkRequest('POST', true, {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/offer'],
            }),
        );

        expect(response.status).toBe(409);
        expect(await response.json()).toEqual({ error: 'This shortcode is already in use' });
    });
});
