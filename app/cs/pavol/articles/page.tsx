import { ArticleIndex } from '@/businesses/articles/ArticleIndex';
import { getPersonalArticleListings } from '@/lib/articles/publishedArticles';
import { createArticleIndexMetadata } from '@/lib/articles/metadata';

export const metadata = createArticleIndexMetadata('cs', 'personal');

export const dynamic = 'force-dynamic';

export default async function ArticleIndexPage() {
    return <ArticleIndex articles={await getPersonalArticleListings('cs')} language="cs" publication="personal" />;
}
