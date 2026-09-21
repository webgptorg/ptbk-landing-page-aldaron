import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { loadPublicWebPagePreviewImage } from '@/lib/network/publicWebPagePreviewImage';
import { createPublicShortcodeLinkUrl } from '@/lib/shortener/shortcodeLink';
import { createAdHocShortcodeLink } from '@/lib/shortener/shortcodeLinkAdHoc';
import { fetchWorkshopRepositoryHistory } from '@/lib/workshops/fetchWorkshopRepositoryHistory';
import { WORKSHOP_EVENT_CARD_EXTERNAL_DETAILS_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';
import { loadWorkshopPublicState, mapWorkshopRow } from '@/lib/workshops/workshopDatabase';
import { createWorkshopProjectPreview } from '@/lib/workshops/workshopEventCardDetails';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import {
    createWorkshopWrapUpRoomUrl, isWorkshopWrapUpAvailable, selectWorkshopWrapUpSource,
    type WorkshopWrapUpExport,
} from '@/lib/workshops/workshopWrapUpExport';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

/** POST creates an ad hoc room link; no document is stored and callers cannot supply a redirect destination. */
export async function POST(request: NextRequest, context: { readonly params: Promise<{ readonly workshopSlug: string }> }) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse !== null) return crossSiteResponse;
    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) return authenticatedRequest;
    const { supabase, workshopRow, participant } = authenticatedRequest;
    const workshop = mapWorkshopRow(workshopRow);
    if (!isWorkshopWrapUpAvailable({ workshop, contentBlocks: [], serverTime: new Date().toISOString() })) {
        return NextResponse.json({ error: 'Shrnutí bude dostupné po skončení workshopu.' }, { status: 409 });
    }

    const { state } = await loadWorkshopPublicState(supabase, workshopRow, participant, 'recent');
    if (state === null) {
        return NextResponse.json({ error: 'Shrnutí se nepodařilo načíst.' }, { status: 500 });
    }
    const source = selectWorkshopWrapUpSource(state);
    if (!isWorkshopWrapUpAvailable(source)) {
        return NextResponse.json({ error: 'Shrnutí bude dostupné po skončení workshopu.' }, { status: 409 });
    }
    const roomUrl = createWorkshopWrapUpRoomUrl(workshop.slug);
    const createdLink = await createAdHocShortcodeLink(supabase, {
        urls: [roomUrl], note: `Shrnutí workshopu: ${workshop.slug}`, sourceApp: 'online-workshop',
    });
    if (createdLink.shortcodeLink === null) {
        return NextResponse.json({ error: 'Odkaz do místnosti se nepodařilo vytvořit. Zkuste to znovu.' }, { status: 503 });
    }

    const [repositoryProgress, projectPreview] = await Promise.all([
        workshop.repository === null ? null
            : fetchWorkshopRepositoryHistory(workshop.repository, { page: 1, isExpanded: false }).catch(() => null),
        createWorkshopProjectPreview(workshop.repository),
    ]);
    const projectPreviewImage = await loadPublicWebPagePreviewImage(
        projectPreview?.previewImageUrl ?? null, WORKSHOP_EVENT_CARD_EXTERNAL_DETAILS_REVALIDATE_SECONDS,
    );
    const result: WorkshopWrapUpExport = {
        source, roomUrl, shortUrl: createPublicShortcodeLinkUrl(createdLink.shortcodeLink.shortcode),
        repositoryProgress, projectPreview, projectPreviewImage,
    };
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
