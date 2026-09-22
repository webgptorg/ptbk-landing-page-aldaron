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

    it('rewrites a branded subpage but leaves its ordinary static assets alone', () => {
        const mediaKitResponse = middleware(createRequest('https://ai-ta-krajta.cz/media-kit'));
        const imageResponse = middleware(createRequest('https://ai-ta-krajta.cz/people/ai-ta-krajta/pavol.png'));

        expect(mediaKitResponse.headers.get('x-middleware-rewrite')).toBe(
            'https://ai-ta-krajta.cz/ai-ta-krajta/media-kit',
        );
        expect(imageResponse.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('normalizes an accidentally used internal path on a branded domain', () => {
        const response = middleware(createRequest('https://pavolhejny.cz/en/pavol'));

        expect(response.status).toBe(308);
        expect(response.headers.get('location')).toBe('https://pavolhejny.com/');
    });

    it('keeps the language redirect on unbranded roots for development and other hostnames', () => {
        const response = middleware(createRequest('http://localhost:4009/', { 'accept-language': 'en-US,en;q=0.9' }));

        expect(response.headers.get('location')).toBe('http://localhost:4009/en');
    });
});
