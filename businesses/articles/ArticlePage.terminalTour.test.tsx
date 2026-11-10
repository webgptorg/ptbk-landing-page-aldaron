import { getArticleAuthor } from '@/lib/articles/authors';
import { getPromptbookCommunityArticleCover } from '@/lib/articles/promptbookCommunityArticleCovers';
import type { Article } from '@/lib/articles/types';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ArticlePage } from './ArticlePage';
import { CommunityArticleTeaser } from './CommunityArticleTeaser';

vi.mock('./ArticleTracking', () => ({
    ArticleTracking: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('./ArticleAudioButton', () => ({ ArticleAudioButton: () => null }));
vi.mock('./ArticleBookExamples', () => ({
    ArticleBookExamples: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('./ArticleRssLink', () => ({ ArticleRssLink: () => null }));
vi.mock('./CommunityArticleUnlockForm', () => ({ CommunityArticleUnlockForm: () => <form /> }));

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
        ['pece-o-kontakty', '08-contacts.webp'],
        ['sprava-podcastu', '06-podcast.webp'],
        ['udrzba-webu', '07-web.webp'],
    ])('shows its original agenda frame in the setup section of %s', (slug, filename) => {
        const cover = getPromptbookCommunityArticleCover({ ...article, slug }, community.id);
        const html = renderToStaticMarkup(<ArticlePage article={{ ...article, slug, ...cover }} publication="promptbook" community={community} />);
        expect(html).toContain(`src="/community-article-covers/${slug}.jpg"`);
        const link = 'href="/cs/terminal"';
        expect(html.split(link)).toHaveLength(2);
        expect(html.indexOf(link)).toBeGreaterThan(html.indexOf('id="jak-tuhle-agendu-spustit"'));
        expect(html.indexOf(link)).toBeLessThan(html.indexOf(`href="/terminal-tour/${filename}"`));
        expect(html.indexOf(`href="/terminal-tour/${filename}"`)).toBeLessThan(html.indexOf('id="dalsi-kapitola"'));
        expect(html).toContain(`href="/terminal-tour/${filename}"`);
        expect(html).toContain(`src="/terminal-tour/${filename}"`);
        const disclosure = html.match(/<details[^>]*><summary>Instalace a založení projektu na snímcích<\/summary>(.*?)<\/details>/)?.[1];
        expect(disclosure?.match(/src="\/terminal-tour\/[^"]+"/g)).toEqual([
            'src="/terminal-tour/01-install.webp"',
            'src="/terminal-tour/02-console.webp"',
            'src="/terminal-tour/03-project.webp"',
            'src="/terminal-tour/05-result.webp"',
        ]);
        expect(disclosure).toContain('Nainstaluj Promptbook');
        expect(disclosure).toContain('Zkontroluj uložený projekt');
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

    it('offers the public guide after the opening paragraph and before the unlock form', () => {
        const teaser = {
            title: article.title,
            perex: article.perex,
            openingMarkdown: 'Úvodní scénář.',
            language: article.language,
            indexPath: community.indexPath,
            roomSlug: 'promptbook',
            ...getPromptbookCommunityArticleCover(article, community.id),
        };
        const html = renderToStaticMarkup(<CommunityArticleTeaser {...teaser} showTerminalGuide />);
        const guideLink = 'href="/cs/terminal"';
        expect(html).toContain('src="/community-article-covers/pece-o-kontakty.jpg"');
        expect(html.indexOf(guideLink)).toBeGreaterThan(html.indexOf('scénář.'));
        expect(html.indexOf(guideLink)).toBeLessThan(html.indexOf('<form'));
        expect(html).not.toContain('/terminal-tour/');
        expect(renderToStaticMarkup(<CommunityArticleTeaser {...teaser} showTerminalGuide={false} />))
            .not.toContain(guideLink);
    });
});
