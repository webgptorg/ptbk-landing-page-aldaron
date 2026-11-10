import { getArticleAuthor } from '@/lib/articles/authors';
import type { Article } from '@/lib/articles/types';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ArticlePage } from './ArticlePage';

vi.mock('./ArticleTracking', () => ({
    ArticleTracking: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('./ArticleAudioButton', () => ({ ArticleAudioButton: () => null }));
vi.mock('./ArticleBookExamples', () => ({
    ArticleBookExamples: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('./ArticleRssLink', () => ({ ArticleRssLink: () => null }));

const markdown = '## Jak tuhle agendu spustit\n\nText postupu.\n\n## Další kapitola\n\nObsah.';
const article: Article = {
    id: 'czech-launch-article',
    translationGroupId: 'czech-launch-article',
    managed: true,
    authorId: 'pavol-hejny',
    author: getArticleAuthor('pavol-hejny')!,
    language: 'cs',
    slug: 'pece-o-kontakty',
    title: 'Péče o kontakty',
    perex: 'Praktická agenda.',
    publishedAt: '2026-11-10T08:00:00Z',
    markdown,
    tags: [],
    translations: [],
    canonicalUrl: 'https://ptbk.io/cs/komunity/promptbook/clanky/cs/pece-o-kontakty',
};

const community = {
    id: 'promptbook' as const,
    indexPath: '/cs/komunity/promptbook#clanky',
    articlePath: new URL(article.canonicalUrl).pathname,
};

describe('terminal recording links in community articles', () => {
    it.each([
        ['pece-o-kontakty', '04-agenda.webp'],
        ['sprava-podcastu', '06-podcast.webp'],
        ['udrzba-webu', '07-web.webp'],
    ])('shows its original agenda frame in the setup section of %s', (slug, filename) => {
        const html = renderToStaticMarkup(<ArticlePage article={{ ...article, slug }} publication="promptbook" community={community} />);
        const link = 'href="/cs/terminal"';
        expect(html.split(link)).toHaveLength(2);
        expect(html.indexOf(link)).toBeGreaterThan(html.indexOf('id="jak-tuhle-agendu-spustit"'));
        expect(html.indexOf(link)).toBeLessThan(html.indexOf('id="dalsi-kapitola"'));
        expect(html).toContain(`href="/terminal-tour/${filename}"`);
        expect(html).toContain(`src="/terminal-tour/${filename}"`);
    });

    it('keeps the card out of other publications and unrelated articles', () => {
        expect(renderToStaticMarkup(<ArticlePage article={article} publication="personal" />)).not.toContain('href="/cs/terminal"');
        expect(renderToStaticMarkup(<ArticlePage
            article={article} publication="promptbook" community={{ ...community, id: 'vyvojari' }}
        />)).not.toContain('href="/cs/terminal"');
        expect(renderToStaticMarkup(<ArticlePage
            article={{ ...article, slug: 'jiny-clanek' }} publication="promptbook" community={community}
        />)).not.toContain('href="/cs/terminal"');
    });
});
