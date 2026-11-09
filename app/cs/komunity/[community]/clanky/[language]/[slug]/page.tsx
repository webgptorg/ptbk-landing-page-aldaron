import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticlePage } from '@/businesses/articles/ArticlePage';
import { isArticleCommunity } from '@/lib/articles/managedArticleInput';
import { getManagedArticleUrl } from '@/lib/articles/managedArticleUrls';
import { createArticleMetadata, createArticleStructuredData } from '@/lib/articles/metadata';
import { getPublishedCommunityArticle } from '@/lib/articles/publishedArticles';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ community: string; language: string; slug: string }> };

async function getPlacement(params: PageProps['params']) {
    const { community, language, slug } = await params;
    if (!isArticleCommunity(community) || (language !== 'cs' && language !== 'en')) return null;
    const result = await getPublishedCommunityArticle(community, language, slug);
    return result ? { ...result, community } : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const result = await getPlacement(params);
    if (!result || result.visibility !== 'public') return { robots: { index: false, follow: false } };
    const pathname = new URL(getManagedArticleUrl(result.article, result.community)).pathname;
    return createArticleMetadata(result.article, 'promptbook', pathname);
}

export default async function CommunityArticlePage({ params }: PageProps) {
    const result = await getPlacement(params);
    if (!result) notFound();
    const { article, community, visibility } = result;
    return <>
        {visibility === 'public' && <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify(createArticleStructuredData(article)).replace(/</g, '\\u003c'),
        }} />}
        <ArticlePage article={article} publication="promptbook" community={{
            indexPath: `/cs/komunity/${community}#clanky`,
            articlePath: new URL(getManagedArticleUrl(article, community)).pathname,
        }} />
    </>;
}
