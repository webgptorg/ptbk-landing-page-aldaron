import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { convertWorkshopCommentToMaterial } from '@/lib/workshops/workshopCommentMaterial';
import { getWorkshopModerationCapabilities } from '@/lib/workshops/workshopModeration';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopCommentMaterialRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly commentId: string }>;
};

/**
 * Preserves a chat message and creates a material from it for the workshop
 * administrator.
 */
export async function POST(request: NextRequest, context: AdminWorkshopCommentMaterialRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }
    if (!getWorkshopModerationCapabilities('admin').isCommentMaterialConversionOffered) {
        return NextResponse.json({ error: 'Comment material conversion is not available' }, { status: 403 });
    }

    const { workshopId, commentId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const conversion = await convertWorkshopCommentToMaterial(workshopData.supabase, workshopData.workshopRow, commentId);
    if (conversion.kind === 'comment-not-found') {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    if (conversion.kind === 'error') {
        console.error('Failed to convert a workshop comment to material:', conversion.errorMessage);
        return NextResponse.json({ error: 'Comment could not be converted to material' }, { status: 500 });
    }

    return NextResponse.json({ contentBlock: conversion.contentBlock }, { status: 201 });
}
