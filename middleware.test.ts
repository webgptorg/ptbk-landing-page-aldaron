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

    it('keeps the language redirect on unbranded roots for development and other hostnames', () => {
        const response = middleware(createRequest('http://localhost:4009/', { 'accept-language': 'en-US,en;q=0.9' }));

        expect(response.headers.get('location')).toBe('http://localhost:4009/en');
    });
});
