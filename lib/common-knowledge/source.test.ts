import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { COMMON_KNOWLEDGE_BOOKS } from './catalog';
import { createCommonKnowledgeResponse, getCommonKnowledgeBody, readCommonKnowledgeSource } from './source';
import { GET as getLatest } from '@/app/book/external-action-impact.book/route';
import { GET as getRelease } from '@/app/book/[slug]/[version]/route';

describe('public common-knowledge source', () => {
    it('serves identical UTF-8 Book bytes through latest and immutable routes without authentication', async () => {
        const request = new Request('https://ptbk.io/book/external-action-impact.book', {
            headers: { 'accept-language': 'cs' },
        });
        const latest = getLatest(request);
        const release = await getRelease(request, {
            params: Promise.resolve({ slug: 'external-action-impact', version: '1.0.0.book' }),
        });
        const latestText = await latest.text();
        expect(latest.status).toBe(200);
        expect(release.status).toBe(200);
        expect(latestText).toBe(await release.text());
        expect(latestText).toBe(readCommonKnowledgeSource(COMMON_KNOWLEDGE_BOOKS[0]!));
        expect(latestText).toMatch(/^AGENT External action impact\nFROM @Void\n/);
        expect(getCommonKnowledgeBody(latestText)).toContain('## Reference examples');
        expect(latest.headers.get('content-type')).toBe('text/plain; charset=utf-8');
        expect(latest.headers.get('access-control-allow-origin')).toBe('*');
        expect(latest.headers.get('x-promptbook-knowledge-version')).toBe('1.0.0');
        expect(latest.headers.get('cache-control')).toContain('s-maxage=300');
        expect(release.headers.get('cache-control')).toContain('immutable');
        expect(latest.headers.get('etag')).toBe(`"${createHash('sha256').update(latestText).digest('hex')}"`);
    });

    it('revalidates by exact content identity while retaining public caching and version headers', async () => {
        const source = createCommonKnowledgeResponse('external-action-impact');
        const request = new Request('https://ptbk.io/book/external-action-impact.book', {
            headers: { 'If-None-Match': `"another-version", W/${source.headers.get('etag')}` },
        });
        const response = getLatest(request);
        expect(response.status).toBe(304);
        expect(await response.text()).toBe('');
        expect(response.headers.get('access-control-allow-origin')).toBe('*');
        expect(response.headers.get('etag')).toBe(source.headers.get('etag'));
        expect(response.headers.get('x-promptbook-knowledge-version')).toBe('1.0.0');
        expect(
            createCommonKnowledgeResponse(
                'external-action-impact',
                undefined,
                new Request(request.url, {
                    headers: { 'if-none-match': '"old"' },
                }),
            ).status,
        ).toBe(200);
    });

    it.each([
        ['missing-topic', '1.0.0.book'],
        ['external-action-impact', '9.9.9.book'],
        ['external-action-impact', '1.0.0'],
        ['external-action-impact', '../../package.json.book'],
    ])('returns a real 404 for %s / %s without substituting latest or reading visitor paths', async (slug, version) => {
        const response = await getRelease(new Request('https://ptbk.io/book/unknown'), {
            params: Promise.resolve({ slug, version }),
        });
        expect(response.status).toBe(404);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(await response.text()).not.toContain('AGENT');
    });
});
