import { getPublishedArticles } from '@/lib/articles/publishedArticles';
import { createArticlePodcastFeed } from '@/lib/articles/podcast';

export const dynamic = 'force-static';
export const revalidate = 3600;

/** Refresh published audio hourly without creating or processing any recordings. */
export async function GET() {
    return new Response(createArticlePodcastFeed(await getPublishedArticles('en', 'promptbook'), 'en', 'promptbook'), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', 'X-Content-Type-Options': 'nosniff' },
    });
}
