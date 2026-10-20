import { ArticleIndex } from '@/businesses/articles/ArticleIndex';
import { getArticles } from '@/lib/articles/load';
import { createArticleIndexMetadata } from '@/lib/articles/metadata';

export const metadata = createArticleIndexMetadata('en', 'personal');

export default function ArticleIndexPage() {
    return <ArticleIndex articles={getArticles('en', 'personal')} language="en" publication="personal" />;
}
