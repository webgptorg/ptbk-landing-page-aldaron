import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

function createRequest(url: string, headers: HeadersInit = {}): NextRequest {
    return new NextRequest(url, { headers });
}

describe('custom domain middleware', () => {
    it.each([
        ['/ai-ta-krajta?episode=64', 'https://ai-ta-krajta.cz/?episode=64'],
        ['/cs/pavol?ref=profile', 'https://pavolhejny.cz/?ref=profile'],
        ['/en/pavol', 'https://pavolhejny.com/'],
    ])('permanently redirects the retired ptbk.io path %s to %s', (sourcePath, destination) => {
        const response = middleware(createRequest(`https://ptbk.io${sourcePath}`));

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe(destination);
    });

    it('uses the forwarded hostname when a proxy supplied it', () => {
        const response = middleware(
            createRequest('https://internal-deployment.vercel.app/ai-ta-krajta', {
                'x-forwarded-host': 'www.ptbk.io',
            }),
        );

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe('https://ai-ta-krajta.cz/');
    });

    it.each([
        ['https://ai-ta-krajta.cz/', 'https://ai-ta-krajta.cz/ai-ta-krajta'],
        ['https://ai-ta-krajta.cz/media-kit', 'https://ai-ta-krajta.cz/ai-ta-krajta/media-kit'],
        ['https://ai-ta-krajta.cz/manifest.webmanifest', 'https://ai-ta-krajta.cz/ai-ta-krajta/manifest.webmanifest'],
        ['https://pavolhejny.cz/', 'https://pavolhejny.cz/cs/pavol'],
        ['https://pavolhejny.com/opengraph-image', 'https://pavolhejny.com/en/pavol/opengraph-image'],
    ])('rewrites %s to its existing application route', (sourceUrl, rewriteUrl) => {
        const response = middleware(createRequest(sourceUrl));

        expect(response.headers.get('x-middleware-rewrite')).toBe(rewriteUrl);
    });

    it('canonicalizes an accidentally copied source path even on a custom hostname', () => {
        const response = middleware(createRequest('https://pavolhejny.com/cs/pavol'));

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe('https://pavolhejny.cz/');
    });

    it('does not expose unrelated Promptbook routes on a custom hostname', () => {
        const response = middleware(createRequest('https://ai-ta-krajta.cz/privacy'));

        expect(response.headers.get('x-middleware-rewrite')).toBeNull();
        expect(response.headers.get('location')).toBeNull();
    });

    it('keeps source routes usable on local and preview hosts', () => {
        const response = middleware(createRequest('http://localhost:4009/ai-ta-krajta'));

        expect(response.headers.get('x-middleware-rewrite')).toBeNull();
        expect(response.headers.get('location')).toBeNull();
    });
});
