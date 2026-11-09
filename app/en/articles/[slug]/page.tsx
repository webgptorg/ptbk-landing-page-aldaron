import { notFound } from 'next/navigation';
import { ArticlePage } from '@/businesses/articles/ArticlePage';
import { getPublishedArticle } from '@/lib/articles/publishedArticles';
import { createArticleMetadata, createArticleStructuredData } from '@/lib/articles/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const article = await getPublishedArticle('en', (await params).slug, 'promptbook');
    if (!article) return {};
    return createArticleMetadata(article, 'promptbook');
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const article = await getPublishedArticle('en', (await params).slug, 'promptbook');
    if (!article) notFound();
    return <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createArticleStructuredData(article)).replace(/</g, '\\u003c') }} />
        <ArticlePage article={article} publication="promptbook" />
    </>;
}
