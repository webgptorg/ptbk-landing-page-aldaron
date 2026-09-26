import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopContentReorderSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopContentOrderRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

type WorkshopContentOrderResult = {
    readonly outcome: 'ok' | 'invalid_request' | 'invalid_material' | 'workshop_not_found';
    readonly material_ids: readonly string[];
    readonly is_changed: boolean;
    readonly was_reconciled: boolean;
};

export async function PATCH(request: NextRequest, context: AdminWorkshopContentOrderRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopContentReorderSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Invalid material order' },
            { status: 400 },
        );
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) return workshopData.response;

    const { data, error } = await workshopData.supabase.rpc('reorder_workshop_content_blocks', {
        target_workshop_id: workshopId,
        ordered_content_ids: parsedResult.data.contentIds,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const result = (Array.isArray(data) ? data[0] : data) as WorkshopContentOrderResult | null;
    if (result === null) return NextResponse.json({ error: 'Material order was not returned' }, { status: 500 });
    if (result.outcome === 'workshop_not_found') {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    if (result.outcome === 'invalid_request' || result.outcome === 'invalid_material') {
        return NextResponse.json({ error: 'The material order contains invalid IDs' }, { status: 400 });
    }

    if (result.is_changed) {
        await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    }

    return NextResponse.json({ contentIds: result.material_ids, wasReconciled: result.was_reconciled });
}
