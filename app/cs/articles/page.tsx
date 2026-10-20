import { ArticleIndex } from '@/businesses/articles/ArticleIndex';
import { getArticles } from '@/lib/articles/load';
import { createArticleIndexMetadata } from '@/lib/articles/metadata';

export const metadata = createArticleIndexMetadata('cs', 'promptbook');

export default function ArticleIndexPage() {
    return <ArticleIndex articles={getArticles('cs', 'promptbook')} language="cs" publication="promptbook" />;
}
