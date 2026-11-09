import { ArticleIndex } from '@/businesses/articles/ArticleIndex';
import { getPublishedArticles } from '@/lib/articles/publishedArticles';
import { createArticleIndexMetadata } from '@/lib/articles/metadata';

export const metadata = createArticleIndexMetadata('en', 'promptbook');

export const dynamic = 'force-dynamic';

export default async function ArticleIndexPage() {
    return <ArticleIndex articles={await getPublishedArticles('en', 'promptbook')} language="en" publication="promptbook" />;
}
