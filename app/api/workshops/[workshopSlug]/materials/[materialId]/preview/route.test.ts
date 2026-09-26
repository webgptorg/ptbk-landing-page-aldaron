import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getAuthenticatedRequestMock, loadTargetMock, scrapeMock, loadImageMock } = vi.hoisted(() => ({
    getAuthenticatedRequestMock: vi.fn(),
    loadTargetMock: vi.fn(),
    scrapeMock: vi.fn(),
    loadImageMock: vi.fn(),
}));

vi.mock('@/lib/workshops/workshopRequest', () => ({
    getAuthenticatedWorkshopRequest: getAuthenticatedRequestMock,
    isAuthenticatedWorkshopRequest: (value: unknown) =>
        typeof value === 'object' && value !== null && 'supabase' in value,
}));
vi.mock('@/lib/workshops/workshopMaterialPreview', () => ({
    loadWorkshopMaterialPreviewTarget: loadTargetMock,
}));
vi.mock('@/lib/network/publicWebPagePreview', () => {
    class PublicWebPagePreviewError extends Error {
        public constructor(message: string, public readonly kind: 'invalid' | 'disallowed' | 'unavailable' = 'unavailable') {
            super(message);
        }
    }
    return { PublicWebPagePreviewError, scrapePublicWebPagePreview: scrapeMock };
});
vi.mock('@/lib/network/publicWebPagePreviewImage', () => ({
    loadPublicWebPagePreviewImage: loadImageMock,
}));

import { GET } from './route';

const AUTHENTICATED_REQUEST = {
    supabase: { from: vi.fn() },
    workshopRow: { id: 'room-1' },
    participant: { id: 'participant-1' },
};
const TARGET_URL = 'https://example.com/guide?utm_content=material-1';
const IMAGE_URL = 'https://cdn.example.com/guide-card.jpg';

function createRequest(options: { readonly link?: string; readonly image?: string } = {}) {
    const requestUrl = new URL('https://room.test/api/workshops/demo/materials/material-1/preview');
    requestUrl.searchParams.set('kind', 'material');
    requestUrl.searchParams.set('link', options.link ?? 'https://ptbk.io/tracked-material');
    if (options.image !== undefined) requestUrl.searchParams.set('image', options.image);
    return new NextRequest(requestUrl);
}

function createContext() {
    return { params: Promise.resolve({ workshopSlug: 'demo', materialId: 'material-1' }) };
}

describe('participant workshop material preview endpoint', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getAuthenticatedRequestMock.mockResolvedValue(AUTHENTICATED_REQUEST);
        loadTargetMock.mockResolvedValue({ targetUrl: TARGET_URL, errorMessage: null });
        scrapeMock.mockResolvedValue({
            url: 'https://www.example.com/final-guide',
            title: 'Useful guide',
            description: 'A concise guide description.',
            previewImageUrl: IMAGE_URL,
        });
        loadImageMock.mockResolvedValue('data:image/jpeg;base64,aGVsbG8=');
    });

    it('returns text metadata and a same-room image proxy without exposing an external image URL', async () => {
        const response = await GET(createRequest(), createContext());
        const body = await response.json() as {
            readonly title: string;
            readonly description: string;
            readonly domain: string;
            readonly imageUrl: string;
            readonly state: string;
        };

        expect(body).toEqual({
            title: 'Useful guide',
            description: 'A concise guide description.',
            domain: 'www.example.com',
            imageUrl: expect.stringContaining('/api/workshops/demo/materials/material-1/preview?'),
            state: 'ready',
        });
        expect(body.imageUrl).not.toContain(IMAGE_URL);
        expect(scrapeMock).toHaveBeenCalledWith(TARGET_URL, { revalidateSeconds: 3_600 });
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    });

    it('rechecks material access and the declared image before proxying it', async () => {
        const response = await GET(createRequest({ image: IMAGE_URL }), createContext());

        expect(response.headers.get('Content-Type')).toBe('image/jpeg');
        expect(new TextDecoder().decode(await response.arrayBuffer())).toBe('hello');
        expect(loadImageMock).toHaveBeenCalledWith(IMAGE_URL, 3_600);
    });

    it('does not scrape or request an image when the material is no longer readable', async () => {
        loadTargetMock.mockResolvedValue({ targetUrl: null, errorMessage: null });

        const metadataResponse = await GET(createRequest(), createContext());
        const imageResponse = await GET(createRequest({ image: IMAGE_URL }), createContext());

        expect(metadataResponse.status).toBe(404);
        expect(imageResponse.status).toBe(404);
        expect(scrapeMock).not.toHaveBeenCalled();
        expect(loadImageMock).not.toHaveBeenCalled();
    });

    it('refuses an image which the authorized destination did not declare', async () => {
        const response = await GET(createRequest({ image: 'https://attacker.example/image.jpg' }), createContext());

        expect(response.status).toBe(404);
        expect(loadImageMock).not.toHaveBeenCalled();
    });
});
