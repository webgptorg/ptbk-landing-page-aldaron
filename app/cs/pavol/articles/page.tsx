import { ArticleIndex } from '@/businesses/articles/ArticleIndex';
import { getPublishedArticles } from '@/lib/articles/publishedArticles';
import { createArticleIndexMetadata } from '@/lib/articles/metadata';

export const metadata = createArticleIndexMetadata('cs', 'personal');

export const dynamic = 'force-dynamic';

export default async function ArticleIndexPage() {
    return <ArticleIndex articles={await getPublishedArticles('cs', 'personal')} language="cs" publication="personal" />;
}
