import { getArticles } from '@/lib/articles/load';
import { createPavolFeed } from '@/businesses/pavol/pavolFeed';
import { fetchPavolPodcasts } from '@/businesses/pavol/fetchPavolPodcasts';

export const revalidate = 3600;

/** Hourly source refresh shares exactly the personal archive's participation filter. */
export async function GET() {
    return new Response(createPavolFeed(getArticles('en', 'personal'), await fetchPavolPodcasts('en', revalidate), 'en'), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', 'X-Content-Type-Options': 'nosniff' },
    });
}
