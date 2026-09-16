import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { createWorkshopContent } from '@/lib/workshops/workshopContentCreation';
import { workshopContentCreateSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopContentRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

export async function POST(request: NextRequest, context: AdminWorkshopContentRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopContentCreateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Invalid content' },
            { status: 400 },
        );
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const createdContent = await createWorkshopContent(workshopData.supabase, workshopData.workshopRow, parsedResult.data);
    if (createdContent.errorMessage !== null || createdContent.contentBlock === null) {
        return NextResponse.json(
            { error: createdContent.errorMessage ?? 'Content was not returned' },
            { status: 500 },
        );
    }

    return NextResponse.json({ contentBlock: createdContent.contentBlock }, { status: 201 });
}
