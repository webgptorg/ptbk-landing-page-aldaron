import { describe, expect, it, vi } from 'vitest';
import {
    createStudioFileIdentity,
    isStudioFileIdentityEqual,
    normalizeStudioMediaUrl,
    openStudioRemoteInput,
    readStudioOriginalFile,
} from './studioMediaSource';
import { parseStudioByteRange } from '@/public/studio-range-reader.mjs';
import type { StudioAsset } from './studioProjectTypes';

describe('read-only media sources', () => {
    it('distinguishes changed files and treats handles as permissions to recheck, never durable object URLs', async () => {
        const file = new File(['original'], 'workshop.webm', { lastModified: 1 });
        const identity = await createStudioFileIdentity(file);
        expect(
            isStudioFileIdentityEqual(
                identity,
                await createStudioFileIdentity(new File(['original'], 'moved.webm', { lastModified: 1 })),
            ),
        ).toBe(true);
        expect(
            isStudioFileIdentityEqual(
                identity,
                await createStudioFileIdentity(new File(['changed!'], 'workshop.webm', { lastModified: 1 })),
            ),
        ).toBe(false);
        const location = {
            kind: 'file' as const,
            identity,
            handle: {
                queryPermission: vi.fn(async () => 'denied'),
                getFile: vi.fn(),
            } as unknown as FileSystemFileHandle,
        };
        await expect(readStudioOriginalFile({ id: 'private', original: location } as StudioAsset)).rejects.toThrow(
            /oprávnění/,
        );
        expect((location.handle as unknown as { getFile: ReturnType<typeof vi.fn> }).getFile).not.toHaveBeenCalled();
    });
    it('rejects Drive sharing/preview URLs and credential-bearing source URLs', () => {
        expect(() => normalizeStudioMediaUrl('https://drive.google.com/file/d/123/view')).toThrow(/Google Drive/);
        expect(() => normalizeStudioMediaUrl('https://username:secret@cdn.test/source.mp4')).toThrow(/údaje/);
        expect(() => normalizeStudioMediaUrl('http://example.org/source.mp4')).toThrow(/HTTPS/);
    });
    it('detects expired authorization and missing CORS/range headers without downloading the whole body', async () => {
        const originalFetch = globalThis.fetch;
        try {
            globalThis.fetch = vi.fn(async () => new Response('denied', { status: 403 }));
            await expect(
                openStudioRemoteInput('https://cdn.test/source', new AbortController().signal),
            ).rejects.toThrow(/vypršely/);
            globalThis.fetch = vi.fn(async () => new Response('no ranges', { status: 200 }));
            await expect(
                openStudioRemoteInput('https://cdn.test/source', new AbortController().signal),
            ).rejects.toThrow(/byte ranges/);
            globalThis.fetch = vi.fn(async () => {
                throw new TypeError('Failed to fetch');
            });
            await expect(
                openStudioRemoteInput('https://cdn.test/source', new AbortController().signal),
            ).rejects.toThrow(/CORS/);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });
    it('validates exact and suffix byte ranges including invalid/unsatisfiable requests', () => {
        expect(parseStudioByteRange('bytes=3-5', 9)).toEqual({ start: 3, end: 6, isPartial: true });
        expect(parseStudioByteRange('bytes=-2', 9)).toEqual({ start: 7, end: 9, isPartial: true });
        expect(parseStudioByteRange('bytes=9-', 9)).toBeNull();
        expect(parseStudioByteRange('bytes=0-1,3-4', 9)).toBeNull();
    });
});
