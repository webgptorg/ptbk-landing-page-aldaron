import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { PublicWebPagePreviewError, scrapePublicWebPagePreview } from '@/lib/network/publicWebPagePreview';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { WORKSHOP_CONTENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getWorkshopMaterialLinkDestinations } from '@/lib/workshops/workshopMaterialLinks';
import {
    getWorkshopQuickLinkFallbackTitle,
    parseWorkshopQuickLinkDestination,
} from '@/lib/workshops/workshopQuickLinkMaterials';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopLinkPreviewRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

/** Returns only a title, never fetched HTML or arbitrary response bodies. */
export async function GET(request: NextRequest, context: AdminWorkshopLinkPreviewRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const submittedUrl = request.nextUrl.searchParams.get('url') ?? '';
    const destination = parseWorkshopQuickLinkDestination(submittedUrl);
    if (destination === null) {
        return NextResponse.json({ error: 'Zadejte platnou veřejnou adresu HTTP nebo HTTPS.' }, { status: 400 });
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) return workshopData.response;

    const existingMaterials = await workshopData.supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .select('body_markdown')
        .eq('workshop_id', workshopData.workshopRow.id);
    if (existingMaterials.error) {
        return NextResponse.json({ error: existingMaterials.error.message }, { status: 500 });
    }
    const isExisting = (existingMaterials.data ?? []).some((material) =>
        getWorkshopMaterialLinkDestinations(material.body_markdown).some((existingDestination) =>
            parseWorkshopQuickLinkDestination(existingDestination) === destination,
        ),
    );

    try {
        const preview = await scrapePublicWebPagePreview(destination);
        const isFallback = preview.title === new URL(preview.url).hostname;
        return NextResponse.json({
            title: preview.title,
            state: isFallback ? 'fallback' : 'ready',
            message: isFallback ? 'Stránka nemá nadpis; použije se název domény.' : null,
            isExisting,
        });
    } catch (error) {
        if (error instanceof PublicWebPagePreviewError && (error.kind === 'invalid' || error.kind === 'disallowed')) {
            return NextResponse.json({ error: 'Tuto adresu nelze bezpečně načíst.' }, { status: 422 });
        }
        if (!(error instanceof PublicWebPagePreviewError)) throw error;
        return NextResponse.json({
            title: getWorkshopQuickLinkFallbackTitle(destination),
            state: 'fallback',
            message: 'Stránka neodpověděla nebo nemá podporovaný náhled; použije se název domény.',
            isExisting,
        });
    }
}
