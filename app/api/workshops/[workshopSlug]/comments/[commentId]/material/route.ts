import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { convertWorkshopCommentToMaterial } from '@/lib/workshops/workshopCommentMaterial';
import { getWorkshopModerationCapabilities } from '@/lib/workshops/workshopModeration';
import { getModeratingWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopCommentMaterialRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string; readonly commentId: string }>;
};

/**
 * Lets a moderator of the current room preserve a useful chat message as a
 * participant-visible material without removing the message from the chat.
 */
export async function POST(request: NextRequest, context: WorkshopCommentMaterialRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const { workshopSlug, commentId } = await context.params;
    const moderatingRequest = await getModeratingWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(moderatingRequest)) {
        return moderatingRequest;
    }
    if (!getWorkshopModerationCapabilities('moderator').isCommentMaterialConversionOffered) {
        return NextResponse.json({ error: 'Převod komentáře na materiál není dostupný.' }, { status: 403 });
    }

    const conversion = await convertWorkshopCommentToMaterial(
        moderatingRequest.supabase,
        moderatingRequest.workshopRow,
        commentId,
    );
    if (conversion.kind === 'comment-not-found') {
        return NextResponse.json({ error: 'Komentář nebyl nalezen.' }, { status: 404 });
    }
    if (conversion.kind === 'error') {
        console.error('Failed to convert a workshop comment to material from the room:', conversion.errorMessage);
        return NextResponse.json({ error: 'Komentář se nepodařilo převést na materiál.' }, { status: 500 });
    }

    return NextResponse.json({ contentBlock: conversion.contentBlock }, { status: 201 });
}
