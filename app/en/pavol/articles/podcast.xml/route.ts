import { getPersonalArticleListings } from '@/lib/articles/publishedArticles';
import { createPavolFeed } from '@/businesses/pavol/pavolFeed';
import { fetchPavolPodcasts } from '@/businesses/pavol/fetchPavolPodcasts';

export const dynamic = 'force-static';
export const revalidate = 3600;

/** Hourly source refresh shares exactly the personal archive's participation filter. */
export async function GET() {
    return new Response(createPavolFeed(await getPersonalArticleListings('en'), await fetchPavolPodcasts('en', revalidate), 'en'), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', 'X-Content-Type-Options': 'nosniff' },
    });
}
