import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ read: vi.fn(), insert: vi.fn(), headers: vi.fn() }));
vi.mock('react', async (importOriginal) => ({ ...(await importOriginal<typeof import('react')>()), cache: (callback: unknown) => callback }));
vi.mock('next/headers', () => ({ headers: mocks.headers }));
vi.mock('@/lib/supabase', () => ({ supabase: { from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: mocks.read }) }),
    insert: mocks.insert,
}) } }));
import { loadPublicShortcodeLink } from './publicShortcodeLink';
import Page, { generateMetadata } from '@/app/[shortcode]/page';

const row = { id: 1, url: ['https://example.com/destination?x=1'], landingPage: '# Private to selected domain', domains: null as readonly string[] | null };
beforeEach(() => {
    mocks.read.mockResolvedValue({ data: row, error: null });
    mocks.headers.mockResolvedValue(new Headers({ host: 'ptbk.io' }));
    mocks.insert.mockResolvedValue({ data: null, error: null });
});
afterEach(() => vi.clearAllMocks());

describe('public short-link host enforcement', () => {
    it('resolves the same legacy data on every public site without recording a metadata visit', async () => {
        for (const host of ['ptbk.io', 'pavolhejny.cz', 'pavolhejny.com', 'ai-ta-krajta.cz']) {
            mocks.headers.mockResolvedValue(new Headers({ host }));
            expect((await loadPublicShortcodeLink('abc'))?.url).toEqual(row.url);
            expect((await generateMetadata({ params: Promise.resolve({ shortcode: 'abc' }) })).alternates?.canonical).toBe(`https://${host}/abc`);
        }
        expect(mocks.insert).not.toHaveBeenCalled();
    });
    it('refuses the page and its metadata before revealing a destination or recording clicks on a disabled host', async () => {
        mocks.read.mockResolvedValue({ data: { ...row, domains: ['pavolhejny.cz'] }, error: null });
        expect(await loadPublicShortcodeLink('abc')).toBeNull();
        await expect(Page({ params: Promise.resolve({ shortcode: 'abc' }) })).rejects.toThrow();
        const metadata = await generateMetadata({ params: Promise.resolve({ shortcode: 'abc' }) });
        expect(metadata.openGraph).toBeUndefined();
        expect(mocks.insert).not.toHaveBeenCalled();
        mocks.headers.mockResolvedValue(new Headers({ host: 'internal', 'x-forwarded-host': 'localhost', 'x-promptbook-shortlink-host': 'pavolhejny.cz' }));
        expect((await loadPublicShortcodeLink('abc'))?.url).toEqual(row.url);
        expect((await generateMetadata({ params: Promise.resolve({ shortcode: 'abc' }) })).alternates?.canonical).toBe('https://pavolhejny.cz/abc');
    });
    it('records and redirects a permitted request using the shared existing target', async () => {
        mocks.read.mockResolvedValue({ data: { ...row, landingPage: null, domains: ['ptbk.io'] }, error: null });
        await expect(Page({ params: Promise.resolve({ shortcode: 'abc' }) })).rejects.toThrow('NEXT_REDIRECT');
        expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ shortcodeLinkId: 1 }));
    });
});
