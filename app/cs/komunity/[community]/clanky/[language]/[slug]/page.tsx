import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticlePage } from '@/businesses/articles/ArticlePage';
import { CommunityArticleTeaser } from '@/businesses/articles/CommunityArticleTeaser';
import { COMMUNITIES } from '@/businesses/community/config';
import { TERMINAL_TOUR_ARTICLE_FRAMES } from '@/businesses/terminal-tour/terminalTour';
import { isArticleCommunity } from '@/lib/articles/managedArticleInput';
import { getManagedArticleUrl } from '@/lib/articles/managedArticleUrls';
import { createArticleMetadata, createArticleStructuredData } from '@/lib/articles/metadata';
import { COMMUNITY_ARTICLE_COVER_SIZE } from '@/lib/articles/promptbookCommunityArticleCovers';
import { getCommunityArticleDetail } from '@/lib/articles/publishedArticles';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ community: string; language: string; slug: string }> };

async function getPlacement(params: PageProps['params']) {
    const { community, language, slug } = await params;
    if (!isArticleCommunity(community) || (language !== 'cs' && language !== 'en')) return null;
    const result = await getCommunityArticleDetail(community, language, slug);
    return result ? { ...result, community, language, slug } as const : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const result = await getPlacement(params);
    const robots = { index: false, follow: false };
    if (!result) return { robots };
    if (result.kind === 'teaser' || result.visibility !== 'public') {
        const preview = result.kind === 'teaser' ? result : result.article;
        const { title, coverImage, coverImageAlt } = preview;
        const description = result.kind === 'teaser' ? result.perex : undefined;
        const images = coverImage ? [{ url: createAbsoluteUrl(coverImage), alt: coverImageAlt, ...COMMUNITY_ARTICLE_COVER_SIZE }] : undefined;
        return {
            title, description, robots,
            ...(images && {
                openGraph: { type: 'article', title, description, images },
                twitter: { card: 'summary_large_image', title, description, images },
            }),
        };
    }
    const pathname = new URL(getManagedArticleUrl(result.article, result.community)).pathname;
    return createArticleMetadata(result.article, 'promptbook', pathname);
}

export default async function CommunityArticlePage({ params }: PageProps) {
    const result = await getPlacement(params);
    if (!result) notFound();
    const definition = COMMUNITIES[result.community];
    const indexPath = `${definition.path}#clanky`;
    if (result.kind === 'teaser') {
        return <CommunityArticleTeaser
            title={result.title}
            perex={result.perex}
            coverImage={result.coverImage}
            coverImageAlt={result.coverImageAlt}
            openingMarkdown={result.openingMarkdown}
            language={result.language}
            indexPath={indexPath}
            roomSlug={definition.roomSlug}
            showTerminalGuide={result.community === 'promptbook' && result.language === 'cs'
                && TERMINAL_TOUR_ARTICLE_FRAMES.has(result.slug)}
        />;
    }
    const { article, community, visibility } = result;
    return <>
        {visibility === 'public' && <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify(createArticleStructuredData(article)).replace(/</g, '\\u003c'),
        }} />}
        <ArticlePage article={article} publication="promptbook" community={{
            id: community,
            indexPath,
            articlePath: new URL(getManagedArticleUrl(article, community)).pathname,
        }} />
    </>;
}
