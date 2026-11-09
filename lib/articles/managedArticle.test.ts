import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { managedArticleInputSchema } from './managedArticleInput';
import { getManagedArticleAssetPath, getManagedArticleUrl } from './managedArticleUrls';

const article = {
    language: 'cs',
    slug: 'prace-s-agenty',
    title: 'Práce s agenty',
    perex: 'Praktická ukázka.',
    markdown: 'Celý článek.',
    authorId: 'pavol-hejny',
} as const;

describe('managed article publications', () => {
    it('publishes one source at several addresses and requires one of them to be canonical', () => {
        const placements = [
            { destination: 'promptbook-blog', visibility: 'public' },
            { destination: 'personal-blog', visibility: 'public' },
            { destination: 'promptbook', visibility: 'public' },
        ];
        expect(managedArticleInputSchema.safeParse({ ...article, placements, canonicalDestination: 'personal-blog' }).success).toBe(true);
        expect(managedArticleInputSchema.safeParse({ ...article, placements, canonicalDestination: 'vyvojari' }).success).toBe(false);
        expect(managedArticleInputSchema.safeParse({ ...article, placements: [], canonicalDestination: null }).success).toBe(true);
        expect(getManagedArticleUrl(article, 'promptbook-blog')).toBe('https://ptbk.io/cs/articles/prace-s-agenty');
        expect(getManagedArticleUrl(article, 'personal-blog')).toBe('https://pavolhejny.cz/articles/prace-s-agenty');
        expect(getManagedArticleUrl(article, 'promptbook')).toBe('https://ptbk.io/cs/komunity/promptbook/clanky/cs/prace-s-agenty');
    });

    it('rejects public mirrors of gated articles and keeps Promptbook free at launch', () => {
        const check = (placements: unknown, canonicalDestination: string) =>
            managedArticleInputSchema.safeParse({ ...article, placements, canonicalDestination }).success;
        expect(check([{ destination: 'promptbook', visibility: 'members' }], 'promptbook')).toBe(true);
        expect(check([{ destination: 'vyvojari', visibility: 'paid' }], 'vyvojari')).toBe(true);
        expect(check([{ destination: 'promptbook', visibility: 'paid' }], 'promptbook')).toBe(false);
        expect(check([{ destination: 'personal-blog', visibility: 'members' }], 'personal-blog')).toBe(false);
        expect(check([
            { destination: 'promptbook-blog', visibility: 'public' }, { destination: 'vyvojari', visibility: 'paid' },
        ], 'promptbook-blog')).toBe(false);
        expect(check([
            { destination: 'vyvojari', visibility: 'paid' }, { destination: 'promptbook', visibility: 'members' },
        ], 'vyvojari')).toBe(false);
        expect(getManagedArticleAssetPath('article-id', 'audio', 'vyvojari')).toBe('/cs/komunity/vyvojari/clanky/media/article-id/audio');
    });

    it('enforces publication integrity and service-only access in Postgres', async () => {
        const db = new PGlite();
        try {
            await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;');
            await db.exec(readFileSync('migrations/2026-11-0940-managed-articles.sql', 'utf8'));
            const addArticle = (placements: unknown, canonicalDestination: string | null) => db.query(`
                INSERT INTO managed_articles (language, slug, title, perex, markdown, author_id, placements, canonical_destination, published_at)
                VALUES ('cs', 'prace-s-agenty', 'Titulek', 'Perex', 'Text', 'pavol-hejny', $1::jsonb, $2, now())
            `, [JSON.stringify(placements), canonicalDestination]);
            await expect(addArticle([{ destination: 'vyvojari', visibility: 'members' }], 'promptbook')).rejects.toThrow(/check constraint/);
            await expect(addArticle([
                { destination: 'vyvojari', visibility: 'paid' }, { destination: 'promptbook-blog', visibility: 'public' },
            ], 'vyvojari')).rejects.toThrow(/check constraint/);
            await expect(addArticle([{ destination: 'vyvojari', visibility: 'paid' }], 'vyvojari')).resolves.toBeDefined();
            await expect(db.query(`
                INSERT INTO legacy_article_placements (legacy_id, communities, canonical_destination)
                VALUES ('legacy-article', ARRAY['vyvojari'], 'promptbook')
            `)).rejects.toThrow(/check constraint/);
            await db.query(`
                INSERT INTO legacy_article_placements (legacy_id, communities, canonical_destination)
                VALUES ('legacy-article', ARRAY['vyvojari','promptbook'], 'promptbook')
            `);
            await db.exec('SET ROLE anon');
            await expect(db.query('SELECT markdown FROM managed_articles')).rejects.toThrow(/permission denied/);
            await expect(db.query('SELECT * FROM legacy_article_placements')).rejects.toThrow(/permission denied/);
        } finally {
            await db.close();
        }
    });
});
