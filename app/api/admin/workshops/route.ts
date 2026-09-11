import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    createWorkshopDatabaseUnavailableResponse,
    duplicateWorkshopAttachedPolls,
    findWorkshopById,
    getWorkshopDatabaseOrNull,
    loadWorkshopAdminSummaries,
    mapWorkshopRow,
    type WorkshopRow,
} from '@/lib/workshops/workshopDatabase';
import { workshopCreateSchema } from '@/lib/workshops/workshopSchemas';
import { isWorkshopKind, type WorkshopKind } from '@/lib/workshops/workshopTypes';
import { createWorkshopDatabaseValues } from '@/lib/workshops/workshopValues';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const requestedWorkshopKind = request.nextUrl.searchParams.get('kind');
    if (requestedWorkshopKind !== null && !isWorkshopKind(requestedWorkshopKind)) {
        return NextResponse.json({ error: 'Invalid workshop kind' }, { status: 400 });
    }
    const workshopKind: WorkshopKind = requestedWorkshopKind ?? 'workshop';

    const { workshops, errorMessage } = await loadWorkshopAdminSummaries(supabase, workshopKind);
    if (workshops === null) {
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ workshops }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopCreateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Invalid workshop' },
            { status: 400 },
        );
    }

    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const sourceWorkshopId = parsedResult.data.duplicateAttachedPollsFromWorkshopId;
    if (sourceWorkshopId !== undefined) {
        const sourceWorkshop = await findWorkshopById(supabase, sourceWorkshopId);
        if (sourceWorkshop === null) {
            return NextResponse.json({ error: 'Workshop to duplicate was not found' }, { status: 404 });
        }
        if (sourceWorkshop.room_kind !== 'workshop') {
            return NextResponse.json({ error: 'Only workshop occurrences can be duplicated' }, { status: 400 });
        }
    }

    const { data, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .insert(createWorkshopDatabaseValues(parsedResult.data))
        .select('*')
        .single();
    if (error) {
        const status = error.code === '23505' ? 409 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }

    if (sourceWorkshopId !== undefined) {
        const duplicatePollsErrorMessage = await duplicateWorkshopAttachedPolls(supabase, sourceWorkshopId, data.id);
        if (duplicatePollsErrorMessage !== null) {
            const { error: cleanupError } = await supabase.from(WORKSHOP_TABLE_NAME).delete().eq('id', data.id);
            if (cleanupError) {
                console.error(`Failed to clean up workshop after poll duplication: ${cleanupError.message}`);
            }
            console.error(`Failed to duplicate attached workshop polls: ${duplicatePollsErrorMessage}`);
            return NextResponse.json({ error: duplicatePollsErrorMessage }, { status: 500 });
        }
    }

    return NextResponse.json({ workshop: mapWorkshopRow(data as WorkshopRow) }, { status: 201 });
}
