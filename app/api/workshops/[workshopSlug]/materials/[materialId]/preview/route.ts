import { loadPublicWebPagePreviewImage } from '@/lib/network/publicWebPagePreviewImage';
import { PublicWebPagePreviewError, scrapePublicWebPagePreview } from '@/lib/network/publicWebPagePreview';
import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';
import { WORKSHOP_EVENT_CARD_EXTERNAL_DETAILS_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { loadWorkshopMaterialPreviewTarget } from '@/lib/workshops/workshopMaterialPreview';
import type { WorkshopMaterialPreviewKind } from '@/lib/workshops/workshopMaterialPreviewTypes';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopMaterialPreviewRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string; readonly materialId: string }>;
};

function readPreviewKind(value: string | null): WorkshopMaterialPreviewKind | null {
    return value === 'material' || value === 'presentation' || value === 'video' ? value : null;
}

function createFallbackPreviewResponse(targetUrl: string | null) {
    let domain: string | null = null;
    try {
        if (targetUrl !== null) domain = new URL(targetUrl).hostname;
    } catch {
        // An invalid or disallowed destination keeps the visible Markdown link and its persisted QR only.
    }

    return { title: domain ?? '', description: '', domain, imageUrl: null, state: 'fallback' as const };
}

function createAuthorizedImageUrl(request: NextRequest, imageUrl: string): string {
    const authorizedImageUrl = new URL(request.nextUrl.pathname, request.nextUrl.origin);
    authorizedImageUrl.searchParams.set('kind', request.nextUrl.searchParams.get('kind') ?? 'material');
    authorizedImageUrl.searchParams.set('link', request.nextUrl.searchParams.get('link') ?? '');
    authorizedImageUrl.searchParams.set('image', imageUrl);
    return `${authorizedImageUrl.pathname}${authorizedImageUrl.search}`;
}

async function loadAuthorizedMaterialTarget(
    request: NextRequest,
    context: WorkshopMaterialPreviewRouteContext,
) {
    const { workshopSlug, materialId } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return { response: authenticatedRequest } as const;
    }

    const kind = readPreviewKind(request.nextUrl.searchParams.get('kind'));
    const submittedUrl = request.nextUrl.searchParams.get('link') ?? '';
    if (kind === null || submittedUrl === '') {
        return { response: NextResponse.json({ error: 'Material link not found' }, { status: 404 }) } as const;
    }

    const target = await loadWorkshopMaterialPreviewTarget(
        authenticatedRequest.supabase,
        authenticatedRequest.workshopRow,
        authenticatedRequest.participant,
        materialId,
        kind,
        submittedUrl,
    );
    if (target.errorMessage !== null) {
        console.error('Failed to resolve an authorized workshop material preview:', target.errorMessage);
        return { response: NextResponse.json({ error: 'Material preview could not be loaded' }, { status: 500 }) } as const;
    }
    if (target.targetUrl === null) {
        return { response: NextResponse.json({ error: 'Material link not found' }, { status: 404 }) } as const;
    }

    return {
        response: null,
        supabase: authenticatedRequest.supabase,
        targetUrl: target.targetUrl,
        submittedUrl,
    } as const;
}

/** Loads safe metadata independently of the room snapshot and proxies images only after the same access check. */
export async function GET(request: NextRequest, context: WorkshopMaterialPreviewRouteContext) {
    const authorizedTarget = await loadAuthorizedMaterialTarget(request, context);
    if (authorizedTarget.response !== null) return authorizedTarget.response;

    const requestedImageUrl = request.nextUrl.searchParams.get('image');
    if (requestedImageUrl !== null) {
        const normalizedRequestedImageUrl = normalizePublicWebPageUrl(requestedImageUrl);
        if (normalizedRequestedImageUrl === null) {
            return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
        }

        try {
            const preview = await scrapePublicWebPagePreview(authorizedTarget.targetUrl, {
                revalidateSeconds: WORKSHOP_EVENT_CARD_EXTERNAL_DETAILS_REVALIDATE_SECONDS,
            });
            const declaredImageUrl = preview.previewImageUrl === null ? null : normalizePublicWebPageUrl(preview.previewImageUrl);
            if (declaredImageUrl === null || declaredImageUrl !== normalizedRequestedImageUrl) {
                return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
            }

            const imageDataUrl = await loadPublicWebPagePreviewImage(
                declaredImageUrl,
                WORKSHOP_EVENT_CARD_EXTERNAL_DETAILS_REVALIDATE_SECONDS,
            );
            if (imageDataUrl === null) {
                return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
            }

            const imageBytes = Buffer.from(imageDataUrl.slice('data:image/jpeg;base64,'.length), 'base64');
            return new NextResponse(imageBytes, {
                headers: {
                    'Cache-Control': 'private, no-store',
                    'Content-Type': 'image/jpeg',
                    'X-Content-Type-Options': 'nosniff',
                },
            });
        } catch (error) {
            if (!(error instanceof PublicWebPagePreviewError)) throw error;
            return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
        }
    }

    try {
        const preview = await scrapePublicWebPagePreview(authorizedTarget.targetUrl, {
            revalidateSeconds: WORKSHOP_EVENT_CARD_EXTERNAL_DETAILS_REVALIDATE_SECONDS,
        });
        const domain = new URL(preview.url).hostname;
        const isFallback = preview.title === domain && preview.description === '' && preview.previewImageUrl === null;
        return NextResponse.json(
            {
                title: preview.title,
                description: preview.description,
                domain,
                imageUrl: preview.previewImageUrl === null ? null : createAuthorizedImageUrl(request, preview.previewImageUrl),
                state: isFallback ? 'fallback' : 'ready',
            },
            { headers: { 'Cache-Control': 'private, no-store' } },
        );
    } catch (error) {
        if (!(error instanceof PublicWebPagePreviewError)) throw error;
        const isSafeToNameDomain = error.kind !== 'disallowed' && error.kind !== 'invalid';
        return NextResponse.json(
            createFallbackPreviewResponse(isSafeToNameDomain ? authorizedTarget.targetUrl : null),
            { headers: { 'Cache-Control': 'private, no-store' } },
        );
    }
}
