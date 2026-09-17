import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { NextRequest, NextResponse } from 'next/server';

export async function getAdminWorkshopAgentRequest(request: NextRequest, workshopId: string) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) return { response: unauthorizedResponse };
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) return workshopData;
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isAgentsOffered || workshopData.workshopRow.external_url) {
        return { response: NextResponse.json({ error: 'Tato místnost agenty nenabízí.' }, { status: 400 }) };
    }
    return workshopData;
}
