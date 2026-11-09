import { ArticleIndex } from '@/businesses/articles/ArticleIndex';
import { getPublishedArticles } from '@/lib/articles/publishedArticles';
import { createArticleIndexMetadata } from '@/lib/articles/metadata';

export const metadata = createArticleIndexMetadata('en', 'personal');

export const dynamic = 'force-dynamic';

export default async function ArticleIndexPage() {
    return <ArticleIndex articles={await getPublishedArticles('en', 'personal')} language="en" publication="personal" />;
}
