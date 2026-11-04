import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ create: vi.fn(), title: vi.fn() }));
vi.mock('@/lib/shortener/shortcodeLinkAdHoc', () => ({ createAdHocShortcodeLink: mocks.create }));
vi.mock('@/lib/network/publicWebPagePreview', () => ({ fetchPublicWebPageTitle: mocks.title }));
import { prepareMessageLinks } from './messageLinks';

function database(registered: { shortcode: string; domains?: string[] }[] = [], previous: unknown = null, error: unknown = null) {
    const query = { select: vi.fn(() => query), in: vi.fn(async () => ({ data: registered, error })),
        eq: vi.fn(() => query), contains: vi.fn(() => query), order: vi.fn(() => query), limit: vi.fn(() => query),
        maybeSingle: vi.fn(async () => ({ data: previous, error })) };
    return { client: { from: vi.fn(() => query) } as unknown as SupabaseClient, query };
}
afterEach(() => vi.resetAllMocks());

describe('message save-time links', () => {
    it('reuses material parsing, titles, escaping and ad hoc creation while preserving labels and code', async () => {
        const { client } = database();
        mocks.title.mockResolvedValue('Název [dokumentu]');
        mocks.create.mockResolvedValue({ shortcodeLink: { shortcode: 'AbCd1234', domains: null }, errorMessage: null });
        const input = 'https://example.com/doc\n\n[Moje označení](https://example.com/doc)\n\n`https://example.com/code`';
        const result = await prepareMessageLinks(client, input);
        expect(result).toContain('[Název \\[dokumentu\\]](https://ptbk.io/AbCd1234)');
        expect(result).toContain('[Moje označení](https://ptbk.io/AbCd1234)');
        expect(result).toContain('`https://example.com/code`');
        expect(mocks.create).toHaveBeenCalledOnce();
        expect(mocks.create).toHaveBeenCalledWith(client, expect.objectContaining({ urls: ['https://example.com/doc'], sourceApp: 'admin-shortener' }));
        mocks.create.mockClear(); mocks.title.mockClear();
        const second = database([{ shortcode: 'AbCd1234' }]);
        expect(await prepareMessageLinks(second.client, result)).toBe(result);
        expect(mocks.create).not.toHaveBeenCalled(); expect(mocks.title).not.toHaveBeenCalled();
    });
    it('leaves all registered short-link aliases unchanged and distinguishes ordinary local pages', async () => {
        const { client } = database([{ shortcode: 'Existing', domains: ['pavolhejny.cz'] }]);
        mocks.title.mockResolvedValue('Článek');
        mocks.create.mockResolvedValue({ shortcodeLink: { shortcode: 'NewCode1', domains: null } });
        const result = await prepareMessageLinks(client, 'https://www.pavolhejny.cz/Existing\n\nhttps://ptbk.io/cs');
        expect(result).toBe('https://www.pavolhejny.cz/Existing\n\n[Článek](https://ptbk.io/NewCode1)');
        expect(mocks.title).toHaveBeenCalledExactlyOnceWith('https://ptbk.io/cs');
    });
    it('reuses a completed shortener write after an interrupted message save and falls back on an unreadable title', async () => {
        const { client } = database([], { shortcode: 'Retry123', domains: null, url: ['https://docs.google.com/document/d/private'] });
        mocks.title.mockRejectedValue(new Error('private document'));
        expect(await prepareMessageLinks(client, 'https://docs.google.com/document/d/private')).toBe('[docs.google.com](https://ptbk.io/Retry123)');
        expect(mocks.create).not.toHaveBeenCalled();
    });
    it('never reuses a short link subsequently changed to a random choice of destinations', async () => {
        const { client } = database([], { shortcode: 'Changed1', domains: null, url: ['https://example.com', 'https://other.example'] });
        mocks.create.mockResolvedValue({ shortcodeLink: { shortcode: 'Safe1234', domains: null } });
        expect(await prepareMessageLinks(client, '[Moje označení](https://example.com)')).toBe('[Moje označení](https://ptbk.io/Safe1234)');
        expect(mocks.title).not.toHaveBeenCalled();
        expect(mocks.create).toHaveBeenCalledOnce();
    });
    it('reports failed shortener writes instead of claiming the raw draft was saved', async () => {
        const { client } = database();
        mocks.title.mockResolvedValue('Document'); mocks.create.mockResolvedValue({ shortcodeLink: null, errorMessage: 'unavailable' });
        await expect(prepareMessageLinks(client, 'https://example.com')).rejects.toThrow('neuložená');
    });
});
