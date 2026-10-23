import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

function createRequest(url: string, headers: HeadersInit = {}): NextRequest {
    return new NextRequest(url, { headers });
}

describe('domain middleware', () => {
    it('permanently redirects legacy Promptbook paths to their independent domains and retains their query', () => {
        const response = middleware(createRequest('https://ptbk.io/ai-ta-krajta/media-kit?collaboration=partnerstvi'));

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe(
            'https://ai-ta-krajta.cz/media-kit?collaboration=partnerstvi',
        );
    });

    it('sends each localized Pavol page to its corresponding domain', () => {
        const czechResponse = middleware(createRequest('https://ptbk.io/cs/pavol'));
        const englishResponse = middleware(createRequest('https://ptbk.io/en/pavol'));

        expect(czechResponse.headers.get('location')).toBe('https://pavolhejny.cz/');
        expect(englishResponse.headers.get('location')).toBe('https://pavolhejny.com/');
    });

    it('keeps the language-selection entry point and its query on the primary host', () => {
        const response = middleware(
            createRequest('https://ptbk.io/pavol?from=footer', { 'accept-language': 'en-US,en;q=0.9' }),
        );

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe('https://ptbk.io/en/pavol?from=footer');
    });

    it('uses the forwarded public host when a reverse proxy supplies an internal URL', () => {
        const response = middleware(
            createRequest('http://internal.example.test/ai-ta-krajta', { 'x-forwarded-host': 'ptbk.io' }),
        );

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe('https://ai-ta-krajta.cz/');
    });

    it('rewrites a branded domain root to its existing internal route without changing the visible URL', () => {
        const response = middleware(createRequest('https://ai-ta-krajta.cz/'));

        expect(response.headers.get('x-middleware-rewrite')).toBe('https://ai-ta-krajta.cz/ai-ta-krajta');
    });

    it('serves a branded site on its www. host exactly as on the apex, rather than dropping it on the homepage', () => {
        const podcastResponse = middleware(createRequest('https://www.ai-ta-krajta.cz/'));
        const pavolEnglishResponse = middleware(createRequest('https://www.pavolhejny.com/'));

        expect(podcastResponse.headers.get('x-middleware-rewrite')).toBe('https://www.ai-ta-krajta.cz/ai-ta-krajta');
        expect(pavolEnglishResponse.headers.get('x-middleware-rewrite')).toBe('https://www.pavolhejny.com/en/pavol');
    });

    it('redirects legacy paths from the www. primary host too', () => {
        const response = middleware(createRequest('https://www.ptbk.io/ai-ta-krajta'));

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe('https://ai-ta-krajta.cz/');
    });

    it('rewrites a branded subpage but leaves its ordinary static assets alone', () => {
        const mediaKitResponse = middleware(createRequest('https://ai-ta-krajta.cz/media-kit'));
        const imageResponse = middleware(createRequest('https://ai-ta-krajta.cz/people/ai-ta-krajta/pavol-hejny.png'));

        expect(mediaKitResponse.headers.get('x-middleware-rewrite')).toBe(
            'https://ai-ta-krajta.cz/ai-ta-krajta/media-kit',
        );
        expect(imageResponse.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('returns each requested site’s own 404 for foreign and unknown pages without redirecting', async () => {
        const localeResponse = middleware(createRequest('https://ai-ta-krajta.cz/cs'));
        const deepResponse = middleware(createRequest('https://www.pavolhejny.com/for-industry?utm_source=x'));
        const foreignLegacyResponse = middleware(createRequest('https://ai-ta-krajta.cz/cs/pavol'));

        for (const response of [localeResponse, deepResponse, foreignLegacyResponse]) {
            expect(response.status).toBe(404);
            expect(response.headers.get('location')).toBeNull();
            expect(response.headers.get('x-middleware-rewrite')).toBeNull();
        }
        expect(await localeResponse.text()).toContain('Stránka nenalezena');
        expect(await deepResponse.text()).toContain('Page not found');
        expect(await foreignLegacyResponse.text()).toContain('AI ta Krajta');
    });

    it('keeps serving shared static assets and build output on a branded domain instead of redirecting them away', () => {
        const assetResponse = middleware(createRequest('https://ai-ta-krajta.cz/logo/pavol-hejny-ph.svg'));
        const buildChunkResponse = middleware(createRequest('https://ai-ta-krajta.cz/_next/data/app.json'));

        expect(assetResponse.headers.get('location')).toBeNull();
        expect(assetResponse.headers.get('x-middleware-rewrite')).toBeNull();
        expect(buildChunkResponse.headers.get('location')).toBeNull();
    });

    it('normalizes only the same site’s own old nested path on its domain', () => {
        const response = middleware(createRequest('https://pavolhejny.cz/cs/pavol/?source=old'));

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe('https://pavolhejny.cz/?source=old');
    });

    it('does not allow a file-looking page or short-link path to bypass the domain boundary', () => {
        const fileResponse = middleware(createRequest('https://ai-ta-krajta.cz/cs/online-workshop.pdf'));
        const shortLinkResponse = middleware(createRequest('https://pavolhejny.com/a-shortcode'));

        expect(fileResponse.status).toBe(404);
        expect(shortLinkResponse.status).toBe(404);
    });

    it('serves the new Czech root without an Accept-Language redirect, including development', () => {
        const response = middleware(createRequest('http://localhost:4009/', { 'accept-language': 'en-US,en;q=0.9' }));

        expect(response.headers.get('location')).toBeNull();
        expect(response.headers.get('x-middleware-rewrite')).toBeNull();
        expect(response.headers.get('x-middleware-request-x-promptbook-page-language')).toBe('cs');
    });

    it.each(['https://ptbk.io', 'https://www.ptbk.io'])('publishes the marketing site at %s without the old prefix', origin => {
        for (const path of ['/', '/cs', '/en', '/cs/cenik', '/cs/agendy/email', '/cenik', '/en/agendy/email', '/srovnani/chatgpt', '/opengraph-image', '/en/opengraph-image']) {
            const response = middleware(createRequest(`${origin}${path}?volume=47`));
            expect(response.headers.get('location')).toBeNull();
            expect(response.headers.get('x-middleware-rewrite')).toBeNull();
            expect(response.headers.get('x-middleware-request-x-promptbook-page-language')).toBe(path.startsWith('/en') ? 'en' : 'cs');
        }
    });

    it.each(['/new', '/new/en', '/new/kalkulacka', '/new/en/agendy/email'])('permanently redirects %s while preserving query parameters', path => {
        const response = middleware(createRequest(`https://www.ptbk.io${path}?volume=47&mode=partner`));
        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe(`https://www.ptbk.io${path.slice(4) || '/'}?volume=47&mode=partner`);
        expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('keeps existing articles, workshops, administration and unrelated paths outside marketing rewrites', () => {
        for (const path of ['/cs', '/en/articles', '/en/whitepaper', '/cs/online-workshop', '/admin/contacts', '/newsletter']) {
            const response = middleware(createRequest(`https://ptbk.io${path}`));
            expect(response.headers.get('x-middleware-rewrite')).toBeNull();
            expect(response.headers.get('location')).toBeNull();
        }
        expect(middleware(createRequest('https://ai-ta-krajta.cz/new')).status).toBe(404);
        expect(middleware(createRequest('https://pavolhejny.com/cenik')).status).toBe(404);
    });
});

describe('article publication boundaries', () => {
    it('rewrites personal articles and podcast feeds to the matching language only', () => {
        const cs = middleware(createRequest('https://pavolhejny.cz/articles/co-prichazi-po-generovani-kodu'));
        const en = middleware(createRequest('https://pavolhejny.com/articles/podcast.xml'));
        expect(cs.headers.get('x-middleware-rewrite')).toBe('https://pavolhejny.cz/cs/pavol/articles/co-prichazi-po-generovani-kodu');
        expect(en.headers.get('x-middleware-rewrite')).toBe('https://pavolhejny.com/en/pavol/articles/podcast.xml');
    });

    it('serves each personal sitemap as a build-time route including published variants', () => {
        const response = middleware(createRequest('https://pavolhejny.cz/sitemap.xml'));
        expect(response.headers.get('x-middleware-rewrite')).toBe('https://pavolhejny.cz/cs/pavol/sitemap.xml');
    });

    it('never adds article routes or new feeds to AI ta Krajta', () => {
        expect(middleware(createRequest('https://ai-ta-krajta.cz/articles')).status).toBe(404);
        expect(middleware(createRequest('https://ai-ta-krajta.cz/articles/podcast.xml')).status).toBe(404);
    });

    it('shares static article downloads without allowing unrelated dotted paths', () => {
        expect(middleware(createRequest('https://pavolhejny.cz/article-assets/spec-driven-anchoring-cs/article.pdf')).status).toBe(200);
        expect(middleware(createRequest('https://pavolhejny.cz/article-podcasts/pavol-hejny.png')).status).toBe(200);
        expect(middleware(createRequest('https://pavolhejny.cz/articles/unknown.pdf')).status).toBe(404);
    });
});
