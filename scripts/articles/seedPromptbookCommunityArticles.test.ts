import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { Client } from 'pg';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { seedPromptbookCommunityArticles } from './seedPromptbookCommunityArticles';

vi.mock('pg', () => ({ Client: vi.fn() }));

const launchArticles = ['pece-o-kontakty', 'sprava-podcastu', 'udrzba-webu'].map((slug) => ({
    language: 'cs',
    slug,
    title: 'Ukázka',
    perex: 'Krátký úvod.',
    markdown: 'Úplný článek pro členy.',
    authorId: 'pavol-hejny',
    canonicalDestination: 'promptbook',
    placements: [{ destination: 'promptbook', visibility: 'members' }],
}));

afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
});

describe('private Promptbook community launch articles', () => {
    it('rejects a public placement, duplicate slug and malformed input before opening a database connection', async () => {
        const publicPlacement = { ...launchArticles[0], placements: [{ destination: 'promptbook', visibility: 'public' }] };
        await expect(seedPromptbookCommunityArticles(JSON.stringify([publicPlacement, ...launchArticles.slice(1)])))
            .rejects.toThrow('Invalid private Promptbook community article seed.');
        await expect(seedPromptbookCommunityArticles(JSON.stringify([launchArticles[0], ...launchArticles.slice(0, 2)])))
            .rejects.toThrow('Invalid private Promptbook community article seed.');
        await expect(seedPromptbookCommunityArticles('this private text is not JSON'))
            .rejects.toThrow(/^Invalid private Promptbook community article seed\.$/);
        expect(Client).not.toHaveBeenCalled();
    });

    it('publishes members-only articles together and preserves later editor changes on retry', async () => {
        const db = new PGlite();
        try {
            await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;');
            await db.exec(readFileSync('migrations/2026-11-0940-managed-articles.sql', 'utf8'));
            await db.exec(readFileSync('migrations/2026-11-0942-article-placement-visibility.sql', 'utf8'));
            vi.stubEnv('DATABASE_URL', 'postgres://test.invalid/launch');
            vi.mocked(Client).mockImplementation(function () {
                return {
                    connect: async () => undefined,
                    end: async () => undefined,
                    query: async (query: string, params: unknown[]) => {
                        const result = await db.query(query, params);
                        return { rowCount: result.affectedRows };
                    },
                } as unknown as Client;
            });

            const payload = JSON.stringify(launchArticles);
            await expect(seedPromptbookCommunityArticles(payload)).resolves.toBe(3);
            await db.query("UPDATE managed_articles SET title = 'Upravený titulek' WHERE slug = 'pece-o-kontakty'");
            await expect(seedPromptbookCommunityArticles(payload)).resolves.toBe(0);

            const { rows } = await db.query('SELECT title, placements, canonical_destination, published_at FROM managed_articles ORDER BY slug');
            expect(rows).toHaveLength(3);
            expect(rows[0]).toMatchObject({
                title: 'Upravený titulek',
                placements: [{ destination: 'promptbook', visibility: 'members' }],
                canonical_destination: 'promptbook',
                published_at: expect.any(Date),
            });
        } finally {
            await db.close();
        }
    });

    it('does not put the payload into deployment errors', async () => {
        vi.stubEnv('DATABASE_URL', 'postgres://test.invalid/launch');
        const end = vi.fn(async () => undefined);
        vi.mocked(Client).mockImplementation(function () {
            return {
                connect: async () => undefined,
                end,
                query: async () => {
                    throw new Error('Database rejected the row containing: Úplný článek pro členy.');
                },
            } as unknown as Client;
        });

        await expect(seedPromptbookCommunityArticles(JSON.stringify(launchArticles)))
            .rejects.toThrow(/^Could not publish the private Promptbook community launch articles\.$/);
        expect(end).toHaveBeenCalledOnce();
    });
});
