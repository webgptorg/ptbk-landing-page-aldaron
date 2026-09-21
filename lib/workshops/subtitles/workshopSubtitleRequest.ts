import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export type WorkshopSubtitleRouteContext = { readonly params: Promise<{ readonly workshopId: string; readonly subtitleId?: string }> };

export async function getAdminWorkshopSubtitleRequest(request: NextRequest, workshopId: string) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) return { response: unauthorizedResponse };
    if (!z.string().uuid().safeParse(workshopId).success) {
        return { response: NextResponse.json({ error: 'Neplatný workshop.' }, { status: 400 }) };
    }
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) return workshopData;
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isStageOffered || workshopData.workshopRow.external_url) {
        return { response: NextResponse.json({ error: 'Tato místnost titulky nenabízí.' }, { status: 400 }) };
    }
    return workshopData;
}

export function subtitleErrorResponse(message: string, status = 500) {
    return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}
