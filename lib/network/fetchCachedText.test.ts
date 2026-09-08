import { fetchCachedText } from '@/lib/network/fetchCachedText';
import { afterEach, describe, expect, it, vi } from 'vitest';

const OPTIONS = {
    url: 'https://publisher.example/feed.xml',
    revalidateSeconds: 3600,
    acceptedMediaTypes: 'application/xml',
};

/**
 * What a caller of `fetch` is asked to send along with an address
 *
 * Note: Named here rather than read as `RequestInit` because the point of the checks below is the fields this
 *       application insists on, and `RequestInit` types all of them away as optional.
 */
type FetchRequest = {
    headers: Record<string, string>;
    signal: AbortSignal;
    next: { revalidate: number };
};

function stubFetch(answer: (url: string, request: FetchRequest) => Promise<Response>) {
    const fetchMock = vi.fn(answer);

    vi.stubGlobal('fetch', fetchMock);

    return fetchMock;
}

function answerWith(status: number, body: string): (url: string, request: FetchRequest) => Promise<Response> {
    return async () => new Response(body, { status });
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('fetchCachedText', () => {
    it('returns the document a publisher answers with', async () => {
        stubFetch(answerWith(200, '<rss />'));

        expect(await fetchCachedText(OPTIONS)).toBe('<rss />');
    });

    it('asks for the document with the media types the publisher may answer with', async () => {
        const fetchMock = stubFetch(answerWith(200, '<rss />'));

        await fetchCachedText(OPTIONS);

        expect(fetchMock.mock.calls[0]![1].headers).toEqual({ Accept: OPTIONS.acceptedMediaTypes });
    });

    it('reuses an answer for as long as the caller allows it', async () => {
        const fetchMock = stubFetch(answerWith(200, '<rss />'));

        await fetchCachedText(OPTIONS);

        expect(fetchMock.mock.calls[0]![1].next).toEqual({ revalidate: OPTIONS.revalidateSeconds });
    });

    // Note: The bound is what keeps a page rendering when a publisher accepts the connection and then stays silent,
    //       so the request has to carry a signal which can cancel it.
    it('bounds how long a publisher may take, so that a silent one cannot hold a page open', async () => {
        const fetchMock = stubFetch(answerWith(200, '<rss />'));

        await fetchCachedText(OPTIONS);

        const { signal } = fetchMock.mock.calls[0]![1];

        expect(signal).toBeInstanceOf(AbortSignal);
        expect(signal.aborted).toBe(false);
    });

    it('gives the caller nothing when a publisher answers with an error', async () => {
        stubFetch(answerWith(503, 'unavailable'));

        await expect(fetchCachedText(OPTIONS)).resolves.toBeNull();
    });

    it('gives the caller nothing when a publisher cannot be reached at all', async () => {
        stubFetch(async () => {
            throw new Error('ECONNREFUSED');
        });

        await expect(fetchCachedText(OPTIONS)).resolves.toBeNull();
    });

    it('gives the caller nothing when the bound cancels a publisher which stayed silent', async () => {
        stubFetch(async () => {
            throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
        });

        await expect(fetchCachedText(OPTIONS)).resolves.toBeNull();
    });
});
