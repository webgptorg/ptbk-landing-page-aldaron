import { config, middleware } from '@/middleware';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasPublicShortcodeLinkOnHostname } from '@/lib/shortener/shortcodeLinkMiddleware';
vi.mock('@/lib/shortener/shortcodeLinkMiddleware', () => ({ hasPublicShortcodeLinkOnHostname: vi.fn() }));
beforeEach(() => vi.mocked(hasPublicShortcodeLinkOnHostname).mockResolvedValue(false));

function createRequest(url: string, headers: HeadersInit = {}): NextRequest {
    return new NextRequest(url, { headers });
}

describe('domain middleware', () => {
    it('overwrites spoofed internal scope headers and covers shortcodes beginning with api', async () => {
        const matcher = new RegExp(`^${config.matcher[0]}$`);
        expect(matcher.test('/api-code')).toBe(true);
        expect(matcher.test('/api/admin/users')).toBe(false);
        for (const path of ['/code', '/api-code', '/short-links/code']) {
            const response = await middleware(createRequest(`https://ptbk.io${path}`, { 'x-promptbook-shortlink-host': 'pavolhejny.cz' }));
            expect(response.headers.get('x-middleware-request-x-promptbook-shortlink-host')).toBe('ptbk.io');
        }
    });

    it('rewrites an enabled short link on each branded hostname without changing its query', async () => {
        vi.mocked(hasPublicShortcodeLinkOnHostname).mockResolvedValue(true);
        for (const hostname of ['pavolhejny.cz', 'www.pavolhejny.com', 'ai-ta-krajta.cz']) {
            const response = await middleware(createRequest(`https://${hostname}/campaign-abc?utm_source=test`));
            expect(response.headers.get('x-middleware-rewrite')).toBe(`https://${hostname}/short-links/campaign-abc?utm_source=test`);
            expect(response.headers.get('location')).toBeNull();
            expect(response.headers.get('x-middleware-request-x-promptbook-shortlink-host')).toBe(hostname.replace(/^www\./, ''));
        }
        const image = await middleware(createRequest('https://pavolhejny.cz/campaign-abc/opengraph-image?v=1'));
        expect(image.headers.get('x-middleware-rewrite')).toBe('https://pavolhejny.cz/short-links/campaign-abc/opengraph-image?v=1');
    });
    it('keeps real branded pages and shared assets ahead of short-link lookup', async () => {
        vi.mocked(hasPublicShortcodeLinkOnHostname).mockResolvedValue(true);
        vi.mocked(hasPublicShortcodeLinkOnHostname).mockClear();
        const page = await middleware(createRequest('https://ai-ta-krajta.cz/branding'));
        expect(page.headers.get('x-middleware-rewrite')).toBe('https://ai-ta-krajta.cz/ai-ta-krajta/branding');
        expect(hasPublicShortcodeLinkOnHostname).not.toHaveBeenCalled();
    });

    it('permanently redirects legacy Promptbook paths to their independent domains and retains their query', async () => {
        const response = await middleware(createRequest('https://ptbk.io/ai-ta-krajta/media-kit?collaboration=partnerstvi'));

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe(
            'https://ai-ta-krajta.cz/media-kit?collaboration=partnerstvi',
        );
    });

    it('sends each localized Pavol page to its corresponding domain', async () => {
        const czechResponse = await middleware(createRequest('https://ptbk.io/cs/pavol'));
        const englishResponse = await middleware(createRequest('https://ptbk.io/en/pavol'));

        expect(czechResponse.headers.get('location')).toBe('https://pavolhejny.cz/');
        expect(englishResponse.headers.get('location')).toBe('https://pavolhejny.com/');
    });

    it('keeps the language-selection entry point and its query on the primary host', async () => {
        const response = await middleware(
            createRequest('https://ptbk.io/pavol?from=footer', { 'accept-language': 'en-US,en;q=0.9' }),
        );

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe('https://ptbk.io/en/pavol?from=footer');
    });

    it('uses the forwarded public host when a reverse proxy supplies an internal URL', async () => {
        const response = await middleware(
            createRequest('http://internal.example.test/ai-ta-krajta', { 'x-forwarded-host': 'ptbk.io' }),
        );

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe('https://ai-ta-krajta.cz/');
    });

    it('rewrites a branded domain root to its existing internal route without changing the visible URL', async () => {
        const response = await middleware(createRequest('https://ai-ta-krajta.cz/'));

        expect(response.headers.get('x-middleware-rewrite')).toBe('https://ai-ta-krajta.cz/ai-ta-krajta');
    });

    it('serves a branded site on its www. host exactly as on the apex, rather than dropping it on the homepage', async () => {
        const podcastResponse = await middleware(createRequest('https://www.ai-ta-krajta.cz/'));
        const pavolEnglishResponse = await middleware(createRequest('https://www.pavolhejny.com/'));

        expect(podcastResponse.headers.get('x-middleware-rewrite')).toBe('https://www.ai-ta-krajta.cz/ai-ta-krajta');
        expect(pavolEnglishResponse.headers.get('x-middleware-rewrite')).toBe('https://www.pavolhejny.com/en/pavol');
    });

    it('redirects legacy paths from the www. primary host too', async () => {
        const response = await middleware(createRequest('https://www.ptbk.io/ai-ta-krajta'));

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe('https://ai-ta-krajta.cz/');
    });

    it('rewrites a branded subpage but leaves its ordinary static assets alone', async () => {
        const mediaKitResponse = await middleware(createRequest('https://ai-ta-krajta.cz/media-kit'));
        const imageResponse = await middleware(createRequest('https://ai-ta-krajta.cz/people/ai-ta-krajta/pavol-hejny.png'));

        expect(mediaKitResponse.headers.get('x-middleware-rewrite')).toBe(
            'https://ai-ta-krajta.cz/ai-ta-krajta/media-kit',
        );
        expect(imageResponse.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('returns each requested site’s own 404 for foreign and unknown pages without redirecting', async () => {
        const localeResponse = await middleware(createRequest('https://ai-ta-krajta.cz/cs'));
        const deepResponse = await middleware(createRequest('https://www.pavolhejny.com/for-industry?utm_source=x'));
        const foreignLegacyResponse = await middleware(createRequest('https://ai-ta-krajta.cz/cs/pavol'));

        for (const response of [localeResponse, deepResponse, foreignLegacyResponse]) {
            expect(response.status).toBe(404);
            expect(response.headers.get('location')).toBeNull();
            expect(response.headers.get('x-middleware-rewrite')).toBeNull();
        }
        expect(await localeResponse.text()).toContain('Stránka nenalezena');
        expect(await deepResponse.text()).toContain('Page not found');
        expect(await foreignLegacyResponse.text()).toContain('AI ta Krajta');
    });

    it('keeps serving shared static assets and build output on a branded domain instead of redirecting them away', async () => {
        const assetResponse = await middleware(createRequest('https://ai-ta-krajta.cz/logo/pavol-hejny-ph.svg'));
        const buildChunkResponse = await middleware(createRequest('https://ai-ta-krajta.cz/_next/data/app.json'));

        expect(assetResponse.headers.get('location')).toBeNull();
        expect(assetResponse.headers.get('x-middleware-rewrite')).toBeNull();
        expect(buildChunkResponse.headers.get('location')).toBeNull();
    });

    it('normalizes only the same site’s own old nested path on its domain', async () => {
        const response = await middleware(createRequest('https://pavolhejny.cz/cs/pavol/?source=old'));

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe('https://pavolhejny.cz/?source=old');
    });

    it('does not allow a file-looking page or short-link path to bypass the domain boundary', async () => {
        const fileResponse = await middleware(createRequest('https://ai-ta-krajta.cz/cs/online-workshop.pdf'));
        const shortLinkResponse = await middleware(createRequest('https://pavolhejny.com/a-shortcode'));

        expect(fileResponse.status).toBe(404);
        expect(shortLinkResponse.status).toBe(404);
    });

    it.each([
        ['cs-CZ,cs;q=0.9,en;q=0.8', 'cs'],
        ['en-US,en;q=0.9', 'en'],
        ['de-DE,de;q=0.9,cs;q=0.8', 'cs'],
        ['cs;q=0.3,en;q=0.9', 'en'],
        ['', 'en'],
    ])('chooses the root language from %s without a shared cache', async (accepted, language) => {
        const response = await middleware(createRequest('http://localhost:4009/?from=launch', { 'accept-language': accepted }));
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe(`http://localhost:4009/${language}?from=launch`);
        expect(response.headers.get('vary')).toBe('Accept-Language');
        expect(response.headers.get('cache-control')).toBe('private, no-store');
    });

    it.each(['https://ptbk.io', 'https://www.ptbk.io'])('keeps explicit marketing language URLs at %s stable', async origin => {
        for (const path of ['/cs', '/en', '/cs/cenik', '/cs/agendy/email', '/en/agendy/email', '/cs/partnership', '/en/partnership', '/cs/open-source', '/en/open-source', '/opengraph-image', '/en/opengraph-image']) {
            const response = await middleware(createRequest(`${origin}${path}?volume=47`, { 'accept-language': 'en-US' }));
            expect(response.headers.get('location')).toBeNull();
            expect(response.headers.get('x-middleware-rewrite')).toBeNull();
            expect(response.headers.get('x-middleware-request-x-promptbook-page-language')).toBe(path.startsWith('/en') ? 'en' : 'cs');
        }
    });

    it.each(['/open-source', '/partnership', '/kalkulacka', '/agendy/email', '/srovnani/chatgpt'])('localizes the unprefixed marketing entry %s and preserves its query', async path => {
        for (const language of ['cs', 'en']) {
            const response = await middleware(createRequest(`https://www.ptbk.io${path}?volume=47&mode=partner`, { 'accept-language': language }));
            expect(response.status).toBe(307);
            expect(response.headers.get('location')).toBe(`https://www.ptbk.io/${language}${path}?volume=47&mode=partner`);
        }
    });

    it.each(['/new', '/new/en', '/new/kalkulacka', '/new/en/agendy/email'])('permanently redirects %s while preserving query parameters', async path => {
        const response = await middleware(createRequest(`https://www.ptbk.io${path}?volume=47&mode=partner`));
        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe(`https://www.ptbk.io${path.slice(4) || '/'}?volume=47&mode=partner`);
        expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('keeps existing articles, workshops, administration and unrelated paths outside marketing rewrites', async () => {
        for (const path of ['/cs', '/en/articles', '/en/whitepaper', '/cs/online-workshop', '/admin/contacts', '/newsletter']) {
            const response = await middleware(createRequest(`https://ptbk.io${path}`));
            expect(response.headers.get('x-middleware-rewrite')).toBeNull();
            expect(response.headers.get('location')).toBeNull();
        }
        expect((await middleware(createRequest('https://ai-ta-krajta.cz/new'))).status).toBe(404);
        expect((await middleware(createRequest('https://pavolhejny.com/cenik'))).status).toBe(404);
        expect((await middleware(createRequest('https://pavolhejny.com/open-source'))).status).toBe(404);
        expect((await middleware(createRequest('https://ai-ta-krajta.cz/en/open-source'))).status).toBe(404);
    });
});

describe('article publication boundaries', () => {
    it('rewrites personal articles and podcast feeds to the matching language only', async () => {
        const cs = await middleware(createRequest('https://pavolhejny.cz/articles/co-prichazi-po-generovani-kodu'));
        const en = await middleware(createRequest('https://pavolhejny.com/articles/podcast.xml'));
        expect(cs.headers.get('x-middleware-rewrite')).toBe('https://pavolhejny.cz/cs/pavol/articles/co-prichazi-po-generovani-kodu');
        expect(en.headers.get('x-middleware-rewrite')).toBe('https://pavolhejny.com/en/pavol/articles/podcast.xml');
    });

    it('serves each personal sitemap as a build-time route including published variants', async () => {
        const response = await middleware(createRequest('https://pavolhejny.cz/sitemap.xml'));
        expect(response.headers.get('x-middleware-rewrite')).toBe('https://pavolhejny.cz/cs/pavol/sitemap.xml');
    });

    it('never adds article routes or new feeds to AI ta Krajta', async () => {
        expect((await middleware(createRequest('https://ai-ta-krajta.cz/articles'))).status).toBe(404);
        expect((await middleware(createRequest('https://ai-ta-krajta.cz/articles/podcast.xml'))).status).toBe(404);
    });

    it('shares static article downloads without allowing unrelated dotted paths', async () => {
        expect((await middleware(createRequest('https://pavolhejny.cz/article-assets/spec-driven-anchoring-cs/article.pdf'))).status).toBe(200);
        expect((await middleware(createRequest('https://pavolhejny.cz/article-podcasts/pavol-hejny.png'))).status).toBe(200);
        expect((await middleware(createRequest('https://pavolhejny.cz/articles/unknown.pdf'))).status).toBe(404);
    });
});
