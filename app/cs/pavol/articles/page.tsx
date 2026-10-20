import { ArticleIndex } from '@/businesses/articles/ArticleIndex';
import { getArticles } from '@/lib/articles/load';
import { createArticleIndexMetadata } from '@/lib/articles/metadata';

export const metadata = createArticleIndexMetadata('cs', 'personal');

export default function ArticleIndexPage() {
    return <ArticleIndex articles={getArticles('cs', 'personal')} language="cs" publication="personal" />;
}
