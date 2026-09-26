import type { WorkshopMaterialPreviewKind } from '@/lib/workshops/workshopMaterialPreviewTypes';

const MAXIMAL_CONCURRENT_WORKSHOP_MATERIAL_PREVIEWS = 3;
const MAXIMAL_QUEUED_WORKSHOP_MATERIAL_PREVIEWS = 60;
const MAXIMAL_CACHED_WORKSHOP_MATERIAL_PREVIEWS = 200;
const WORKSHOP_MATERIAL_PREVIEW_CACHE_MILLISECONDS = 15 * 60 * 1_000;

export type WorkshopMaterialLinkPreview = {
    readonly title: string;
    readonly description: string;
    readonly domain: string;
    readonly imageUrl: string | null;
    readonly state: 'ready' | 'fallback';
};

type WorkshopMaterialPreviewRequest = {
    readonly endpoint: string;
    readonly fallback: WorkshopMaterialLinkPreview;
    readonly resolve: (preview: WorkshopMaterialLinkPreview) => void;
};

type CachedWorkshopMaterialPreview = {
    readonly expiresAt: number;
    readonly promise: Promise<WorkshopMaterialLinkPreview>;
};

const workshopMaterialPreviewCache = new Map<string, CachedWorkshopMaterialPreview>();
const workshopMaterialPreviewQueue: WorkshopMaterialPreviewRequest[] = [];
let activeWorkshopMaterialPreviewRequestCount = 0;

function getLinkDomain(href: string): string {
    try {
        return new URL(href).hostname;
    } catch {
        return '';
    }
}

export function createWorkshopMaterialLinkPreviewFallback(
    href: string,
    label: string,
): WorkshopMaterialLinkPreview {
    const domain = getLinkDomain(href);
    return { title: label.trim() || domain, description: '', domain, imageUrl: null, state: 'fallback' };
}

function trimPreviewText(value: unknown, maximalLength: number): string {
    return typeof value === 'string' ? value.trim().slice(0, maximalLength) : '';
}

function readWorkshopMaterialLinkPreview(value: unknown, fallback: WorkshopMaterialLinkPreview): WorkshopMaterialLinkPreview {
    if (typeof value !== 'object' || value === null) return fallback;
    const preview = value as Record<string, unknown>;
    const title = trimPreviewText(preview.title, 200) || fallback.title;
    const domain = trimPreviewText(preview.domain, 253) || fallback.domain;
    const imageUrl = typeof preview.imageUrl === 'string' && preview.imageUrl.startsWith('/api/workshops/')
        ? preview.imageUrl
        : null;

    return {
        title,
        description: trimPreviewText(preview.description, 2_000),
        domain,
        imageUrl,
        state: preview.state === 'ready' ? 'ready' : 'fallback',
    };
}

async function loadWorkshopMaterialPreview(
    endpoint: string,
    fallback: WorkshopMaterialLinkPreview,
): Promise<WorkshopMaterialLinkPreview> {
    try {
        const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
        if (!response.ok) return fallback;
        return readWorkshopMaterialLinkPreview(await response.json(), fallback);
    } catch {
        return fallback;
    }
}

function processWorkshopMaterialPreviewQueue(): void {
    while (
        activeWorkshopMaterialPreviewRequestCount < MAXIMAL_CONCURRENT_WORKSHOP_MATERIAL_PREVIEWS &&
        workshopMaterialPreviewQueue.length > 0
    ) {
        const request = workshopMaterialPreviewQueue.shift();
        if (request === undefined) return;
        activeWorkshopMaterialPreviewRequestCount += 1;
        void loadWorkshopMaterialPreview(request.endpoint, request.fallback)
            .then(request.resolve)
            .finally(() => {
                activeWorkshopMaterialPreviewRequestCount -= 1;
                processWorkshopMaterialPreviewQueue();
            });
    }
}

function rememberWorkshopMaterialPreview(key: string, promise: Promise<WorkshopMaterialLinkPreview>): void {
    workshopMaterialPreviewCache.set(key, {
        expiresAt: Date.now() + WORKSHOP_MATERIAL_PREVIEW_CACHE_MILLISECONDS,
        promise,
    });
    while (workshopMaterialPreviewCache.size > MAXIMAL_CACHED_WORKSHOP_MATERIAL_PREVIEWS) {
        const oldestCacheKey = workshopMaterialPreviewCache.keys().next().value;
        if (oldestCacheKey === undefined) return;
        workshopMaterialPreviewCache.delete(oldestCacheKey);
    }
}

/** Uses only the room-scoped read endpoint; it never navigates through a public short-link redirect. */
export function fetchWorkshopMaterialLinkPreview(options: {
    readonly workshopSlug: string;
    readonly materialId: string;
    readonly kind: WorkshopMaterialPreviewKind;
    readonly href: string;
    readonly label: string;
}): Promise<WorkshopMaterialLinkPreview> {
    const fallback = createWorkshopMaterialLinkPreviewFallback(options.href, options.label);
    const key = JSON.stringify([options.workshopSlug, options.materialId, options.kind, options.href]);
    const cachedPreview = workshopMaterialPreviewCache.get(key);
    if (cachedPreview !== undefined && cachedPreview.expiresAt > Date.now()) return cachedPreview.promise;
    if (cachedPreview !== undefined) workshopMaterialPreviewCache.delete(key);

    const previewEndpoint = new URL(
        `/api/workshops/${encodeURIComponent(options.workshopSlug)}/materials/${encodeURIComponent(options.materialId)}/preview`,
        window.location.origin,
    );
    previewEndpoint.searchParams.set('kind', options.kind);
    previewEndpoint.searchParams.set('link', options.href);
    const endpoint = `${previewEndpoint.pathname}${previewEndpoint.search}`;
    const previewPromise = new Promise<WorkshopMaterialLinkPreview>((resolve) => {
        if (workshopMaterialPreviewQueue.length >= MAXIMAL_QUEUED_WORKSHOP_MATERIAL_PREVIEWS) {
            resolve(fallback);
            return;
        }
        workshopMaterialPreviewQueue.push({ endpoint, fallback, resolve });
        processWorkshopMaterialPreviewQueue();
    });
    rememberWorkshopMaterialPreview(key, previewPromise);
    return previewPromise;
}
