import { PROMPTBOOK_COMMUNITY_PODCAST } from '@/businesses/community/communityPodcast';
import { renderArticlePodcastFeed } from '@/lib/articles/podcast';
import { getPublicCommunityArticles } from '@/lib/articles/publishedArticles';

export const dynamic = 'force-dynamic';

export async function GET() {
    const articles = await getPublicCommunityArticles('promptbook');
    const feed = renderArticlePodcastFeed(articles, 'cs', PROMPTBOOK_COMMUNITY_PODCAST, (article) => article.canonicalUrl);

    return new Response(feed, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
