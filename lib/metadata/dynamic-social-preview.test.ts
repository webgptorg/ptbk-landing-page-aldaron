import CommunityProjectImage from '@/app/cs/komunita/projects/[projectId]/opengraph-image';
import ShortcodeImage from '@/app/[shortcode]/opengraph-image';
import { createInMemorySupabaseClient } from '@/lib/e2e/inMemorySupabase';
import { SHORTCODE_LINK_CLICK_TABLE_NAME, SHORTCODE_LINK_TABLE_NAME } from '@/lib/shortener/shortcodeLinkConstants';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const DATABASE = vi.hoisted(() => ({ current: null as SupabaseClient | null }));

// Next supplies its server React build in production; unit tests do not have a server render cache.
vi.mock('react', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react')>()),
    cache: (callback: unknown) => callback,
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({ getWorkshopDatabaseOrNull: () => DATABASE.current }));
vi.mock('@/lib/supabase', () => ({ get supabase() { return DATABASE.current; } }));

// Static cards are rendered end to end. These tests inspect exactly what dynamic routes hand to the renderer.
vi.mock('@/lib/metadata/social-preview-image', async () => ({
    ...(await import('@/lib/metadata/social-preview-image-config')),
    createSocialPreviewImage: async (options: unknown, headers: HeadersInit) =>
        new Response(JSON.stringify(options), { headers }),
}));

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
const DISCUSSION_ID = '22222222-2222-4222-8222-222222222222';

beforeEach(() => {
    DATABASE.current = createInMemorySupabaseClient();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('A sharing card must not follow a destination.')));
});

afterEach(() => vi.unstubAllGlobals());

describe('public dynamic sharing cards', () => {
    it.each(['pending', 'rejected'])('does not expose a %s project', async (status) => {
        await DATABASE.current!.from('community_projects').insert({ id: PROJECT_ID, title: 'Private draft', status });

        await expect(CommunityProjectImage({ params: Promise.resolve({ projectId: PROJECT_ID }) })).rejects.toThrow(
            /404/,
        );
        expect(fetch).not.toHaveBeenCalled();
    });

    it('renders only public project copy and prevents stale caching after moderation', async () => {
        await DATABASE.current!.from('workshops').insert({
            id: DISCUSSION_ID, slug: 'project-discussion', room_kind: 'project',
        });
        await DATABASE.current!.from('community_projects').insert({
            id: PROJECT_ID,
            discussion_workshop_id: DISCUSSION_ID,
            author_community_participant_id: 'private-author-id',
            title: 'Public project',
            description: 'A project shared with the community.',
            status: 'approved',
            url: 'https://example.test/project',
        });

        const response = await CommunityProjectImage({ params: Promise.resolve({ projectId: PROJECT_ID }) });
        const options = await response.json();

        expect(options).toMatchObject({ title: 'Public project', description: 'A project shared with the community.' });
        expect(JSON.stringify(options)).not.toContain('private-author-id');
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('renders an authored short-link landing page without visiting its destination or recording a click', async () => {
        await DATABASE.current!.from(SHORTCODE_LINK_TABLE_NAME).insert({
            shortcode: 'launch',
            url: ['https://example.test/private-destination'],
            landingPage: '# Public launch\n\nAn invitation to explore.',
            note: 'Private administrative note',
        });

        const response = await ShortcodeImage({ params: Promise.resolve({ shortcode: 'launch' }) });
        const options = await response.json();
        const { data: clicks } = await DATABASE.current!.from(SHORTCODE_LINK_CLICK_TABLE_NAME).select('*');

        expect(options).toMatchObject({ title: 'Public launch', description: 'An invitation to explore.' });
        expect(JSON.stringify(options)).not.toMatch(/Private administrative note|private-destination/);
        expect(clicks).toEqual([]);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('does not generate a card for a redirect-only short link or an unknown link', async () => {
        await DATABASE.current!.from(SHORTCODE_LINK_TABLE_NAME).insert({
            shortcode: 'redirect-only', url: ['https://example.test/destination'], landingPage: null,
        });

        for (const shortcode of ['redirect-only', 'missing']) {
            await expect(ShortcodeImage({ params: Promise.resolve({ shortcode }) })).rejects.toThrow(/404/);
        }
        expect(fetch).not.toHaveBeenCalled();
    });
});
