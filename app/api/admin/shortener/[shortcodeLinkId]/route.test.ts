import { createAdminSessionCookieHeader } from '@/lib/admin/adminSessionTestUtilities';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
    createSupabaseServiceRoleClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}));

import { DELETE, PATCH } from './route';

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD = 'shortener-admin-token';
const SHORTCODE_LINK_ID = 42;

const SHORTCODE_LINK_ROW = {
    id: SHORTCODE_LINK_ID,
    createdAt: '2026-08-21T10:00:00.000Z',
    shortcode: 'campaign-abc123',
    url: ['https://example.com/other-offer'],
    note: null,
    landingPage: '# Offer',
    isAdHoc: false,
    sourceApp: 'admin-shortener',
};

const SHORTCODE_LINK = {
    domains: null,
    id: SHORTCODE_LINK_ID,
    createdAt: '2026-08-21T10:00:00.000Z',
    shortcode: 'campaign-abc123',
    urls: ['https://example.com/other-offer'],
    note: null,
    landingPage: '# Offer',
    isAdHoc: false,
    sourceApp: 'admin-shortener',
};

type MutationResult = {
    readonly data: unknown;
    readonly error: { readonly code?: string; readonly message: string } | null;
};

function createShortcodeLinkUpdateDatabase(result: MutationResult) {
    const maybeSingle = vi.fn().mockResolvedValue(result);
    const select = vi.fn(() => ({ maybeSingle }));
    const equals = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq: equals }));
    const from = vi.fn(() => ({ update }));

    return { from, update, equals };
}

function createShortcodeLinkDeletionDatabase(result: MutationResult) {
    const maybeSingle = vi.fn().mockResolvedValue(result);
    const select = vi.fn(() => ({ maybeSingle }));
    const equals = vi.fn(() => ({ select }));
    const deleteRow = vi.fn(() => ({ eq: equals }));
    const from = vi.fn(() => ({ delete: deleteRow }));

    return { from, deleteRow, equals };
}

function createShortcodeLinkRequest(
    method: 'PATCH' | 'DELETE',
    isAdminSignedIn: boolean,
    shortcodeLinkId: string,
    body?: Readonly<Record<string, unknown>>,
): NextRequest {
    const headers: Record<string, string> = isAdminSignedIn ? { cookie: createAdminSessionCookieHeader() } : {};
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    return new NextRequest(`https://promptbook.studio/api/admin/shortener/${shortcodeLinkId}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

function createShortcodeLinkRouteContext(shortcodeLinkId: string) {
    return { params: Promise.resolve({ shortcodeLinkId }) };
}

function restoreAdminToken(): void {
    if (ORIGINAL_ADMIN_PASSWORD === undefined) {
        delete process.env.ADMIN_PASSWORD;
    } else {
        process.env.ADMIN_PASSWORD = ORIGINAL_ADMIN_PASSWORD;
    }
}

describe('one admin shortcode link', () => {
    beforeEach(() => {
        process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
        createSupabaseServiceRoleClientMock.mockReset();
    });

    afterEach(() => {
        restoreAdminToken();
    });

    it('refuses an edit without the session of an administrator before reaching the database', async () => {
        const response = await PATCH(
            createShortcodeLinkRequest('PATCH', false, '42', {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/other-offer'],
            }),
            createShortcodeLinkRouteContext('42'),
        );

        expect(response.status).toBe(401);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('rewrites the values an administrator decides, leaving the type and the owner of the link alone', async () => {
        const database = createShortcodeLinkUpdateDatabase({ data: SHORTCODE_LINK_ROW, error: null });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await PATCH(
            createShortcodeLinkRequest('PATCH', true, '42', {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/other-offer'],
                note: '   ',
                landingPage: '# Offer',
            }),
            createShortcodeLinkRouteContext('42'),
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ shortcodeLink: SHORTCODE_LINK });
        expect(database.from).toHaveBeenCalledWith('ShortcodeLink');
        expect(database.update).toHaveBeenCalledWith({
            shortcode: 'campaign-abc123',
            url: ['https://example.com/other-offer'],
            note: null,
            landingPage: '# Offer',
        });
        expect(database.equals).toHaveBeenCalledWith('id', SHORTCODE_LINK_ID);
    });

    it('does not reach the database for an edit which is not a valid short link', async () => {
        const response = await PATCH(
            createShortcodeLinkRequest('PATCH', true, '42', { shortcode: 'not/a-code', urls: ['not a URL'] }),
            createShortcodeLinkRouteContext('42'),
        );

        expect(response.status).toBe(400);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('answers that a short link which is not identified by a number was not found', async () => {
        const response = await PATCH(
            createShortcodeLinkRequest('PATCH', true, 'campaign-abc123', {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/other-offer'],
            }),
            createShortcodeLinkRouteContext('campaign-abc123'),
        );

        expect(response.status).toBe(404);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('answers that an edited short link which no longer exists was not found', async () => {
        const database = createShortcodeLinkUpdateDatabase({ data: null, error: null });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await PATCH(
            createShortcodeLinkRequest('PATCH', true, '42', {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/other-offer'],
            }),
            createShortcodeLinkRouteContext('42'),
        );

        expect(response.status).toBe(404);
    });

    it('reports a shortcode taken by another link as a conflict', async () => {
        const database = createShortcodeLinkUpdateDatabase({
            data: null,
            error: { code: '23505', message: 'duplicate key value' },
        });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await PATCH(
            createShortcodeLinkRequest('PATCH', true, '42', {
                shortcode: 'campaign-abc123',
                urls: ['https://example.com/other-offer'],
            }),
            createShortcodeLinkRouteContext('42'),
        );

        expect(response.status).toBe(409);
        expect(await response.json()).toEqual({ error: 'This shortcode is already in use' });
    });

    it('refuses a deletion without the session of an administrator before reaching the database', async () => {
        const response = await DELETE(
            createShortcodeLinkRequest('DELETE', false, '42'),
            createShortcodeLinkRouteContext('42'),
        );

        expect(response.status).toBe(401);
        expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled();
    });

    it('removes one short link through the server service role', async () => {
        const database = createShortcodeLinkDeletionDatabase({ data: { id: SHORTCODE_LINK_ID }, error: null });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await DELETE(
            createShortcodeLinkRequest('DELETE', true, '42'),
            createShortcodeLinkRouteContext('42'),
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ isDeleted: true });
        expect(database.from).toHaveBeenCalledWith('ShortcodeLink');
        expect(database.equals).toHaveBeenCalledWith('id', SHORTCODE_LINK_ID);
    });

    it('answers that a deleted short link which no longer exists was not found', async () => {
        const database = createShortcodeLinkDeletionDatabase({ data: null, error: null });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await DELETE(
            createShortcodeLinkRequest('DELETE', true, '42'),
            createShortcodeLinkRouteContext('42'),
        );

        expect(response.status).toBe(404);
    });

    it('says that a short link still referenced elsewhere could not be removed', async () => {
        const database = createShortcodeLinkDeletionDatabase({
            data: null,
            error: { code: '23503', message: 'violates foreign key constraint' },
        });
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await DELETE(
            createShortcodeLinkRequest('DELETE', true, '42'),
            createShortcodeLinkRouteContext('42'),
        );

        expect(response.status).toBe(409);
    });
});
