import { mapWorkshopRow } from '@/lib/workshops/workshopDatabase';
import { createWorkshopProjectPreview } from '@/lib/workshops/workshopEventCardDetails';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';

/** Deployment metadata loads independently so an unavailable application cannot delay the room or its commits. */
export async function GET(
    request: NextRequest,
    context: { readonly params: Promise<{ readonly workshopSlug: string }> },
) {
    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const workshop = mapWorkshopRow(authenticatedRequest.workshopRow);
    if (!getWorkshopKindCapabilities(workshop.kind).isRepositoryOffered || workshop.repository === null) {
        return NextResponse.json({ error: 'Workshop repository not found' }, { status: 404 });
    }

    const preview = await createWorkshopProjectPreview(workshop.repository);
    return NextResponse.json({ preview }, { headers: { 'Cache-Control': 'no-store' } });
}
