import {
    fetchYoutubeVideoDurationSeconds,
    parseYoutubeVideoDurationSeconds,
} from '@/lib/youtube/fetchYoutubeVideoDuration';
import { afterEach, describe, expect, it, vi } from 'vitest';

type YoutubeWatchPageFetchRequest = {
    readonly next: { readonly revalidate: number };
};

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('YouTube video duration', () => {
    it('reads the total length from normal and escaped player data', () => {
        expect(parseYoutubeVideoDurationSeconds('{"lengthSeconds":"5325"}')).toBe(5_325);
        expect(parseYoutubeVideoDurationSeconds('{\\"lengthSeconds\\":\\"90\\"}')).toBe(90);
    });

    it('refuses an absent, zero, fractional, or unsafe duration', () => {
        expect(parseYoutubeVideoDurationSeconds('no player data')).toBeNull();
        expect(parseYoutubeVideoDurationSeconds('{"lengthSeconds":"0"}')).toBeNull();
        expect(parseYoutubeVideoDurationSeconds('{"lengthSeconds":"90.5"}')).toBeNull();
        expect(parseYoutubeVideoDurationSeconds('{"lengthSeconds":"9007199254740992"}')).toBeNull();
    });

    it('reads the public watch page through the shared revalidated fetcher', async () => {
        const fetchMock = vi.fn(
            async (_url: string, _request: YoutubeWatchPageFetchRequest) =>
                new Response('{"lengthSeconds":"213"}', { status: 200 }),
        );
        vi.stubGlobal('fetch', fetchMock);

        await expect(
            fetchYoutubeVideoDurationSeconds({ videoId: 'dQw4w9WgXcQ', revalidateSeconds: 3_600 }),
        ).resolves.toBe(213);

        expect(fetchMock.mock.calls[0]?.[0]).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        expect(fetchMock.mock.calls[0]?.[1]?.next).toEqual({ revalidate: 3_600 });
    });
});
