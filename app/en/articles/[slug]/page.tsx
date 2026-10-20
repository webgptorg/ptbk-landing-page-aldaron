import { notFound } from 'next/navigation';
import { ArticlePage } from '@/businesses/articles/ArticlePage';
import { getArticle, getArticles } from '@/lib/articles/load';
import { createArticleMetadata, createArticleStructuredData } from '@/lib/articles/metadata';

export const dynamicParams = false;

export function generateStaticParams() {
    return getArticles('en', 'promptbook').map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const article = getArticle((await params).slug, 'en', 'promptbook');
    if (!article) return {};
    return createArticleMetadata(article, 'promptbook');
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const article = getArticle((await params).slug, 'en', 'promptbook');
    if (!article) notFound();
    return <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createArticleStructuredData(article)).replace(/</g, '\\u003c') }} />
        <ArticlePage article={article} publication="promptbook" />
    </>;
}
