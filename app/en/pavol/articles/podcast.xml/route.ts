import { getArticles } from '@/lib/articles/load';
import { createArticlePodcastFeed } from '@/lib/articles/podcast';

export const dynamic = 'force-static';

/** Next emits this deterministic XML once at build time; no request-time publishing or TTS. */
export function GET() {
    return new Response(createArticlePodcastFeed(getArticles('en', 'personal'), 'en', 'personal'), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', 'X-Content-Type-Options': 'nosniff' },
    });
}
