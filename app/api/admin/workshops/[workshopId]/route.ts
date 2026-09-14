import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_IS_DELETED_COLUMN_NAME, WORKSHOP_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    createWorkshopDatabaseUnavailableResponse,
    findWorkshopById,
    getWorkshopDatabaseOrNull,
    loadWorkshopAdminSnapshot,
    mapWorkshopRow,
    type WorkshopRow,
} from '@/lib/workshops/workshopDatabase';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getUnsupportedWorkshopKindFieldNames } from '@/lib/workshops/workshopKindCapabilities';
import { isWorkshopCommentStatus } from '@/lib/workshops/workshopCommentStatus';
import { workshopUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { createWorkshopUpdateDatabaseValues } from '@/lib/workshops/workshopValues';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

export async function GET(request: NextRequest, context: AdminWorkshopRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId } = await context.params;
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const workshopRow = await findWorkshopById(supabase, workshopId);
    if (workshopRow === null) {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const requestedCommentStatus = request.nextUrl.searchParams.get('commentStatus');
    if (requestedCommentStatus !== null && !isWorkshopCommentStatus(requestedCommentStatus)) {
        return NextResponse.json({ error: 'Invalid comment status' }, { status: 400 });
    }

    const isCommentsIncluded = request.nextUrl.searchParams.get('includeComments') !== 'false';

    const { snapshot, errorMessage } = await loadWorkshopAdminSnapshot(
        supabase,
        workshopRow,
        requestedCommentStatus ?? 'pending',
        { isCommentsIncluded },
    );
    if (snapshot === null) {
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json(snapshot, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(request: NextRequest, context: AdminWorkshopRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Invalid workshop' },
            { status: 400 },
        );
    }

    const { workshopId } = await context.params;
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const existingWorkshop = await findWorkshopById(supabase, workshopId);
    if (existingWorkshop === null) {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const unsupportedFieldNames = getUnsupportedWorkshopKindFieldNames(existingWorkshop.room_kind, parsedResult.data);
    if (unsupportedFieldNames.length > 0) {
        return NextResponse.json(
            { error: `A ${existingWorkshop.room_kind} room has no ${unsupportedFieldNames.join(', ')}` },
            { status: 400 },
        );
    }

    const startsAt = parsedResult.data.startsAt ?? existingWorkshop.starts_at;
    const endsAt = parsedResult.data.endsAt === undefined ? existingWorkshop.ends_at : parsedResult.data.endsAt;
    if (endsAt !== null && Date.parse(endsAt) <= Date.parse(startsAt)) {
        return NextResponse.json({ error: 'Workshop end must be after its start' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .update(createWorkshopUpdateDatabaseValues(parsedResult.data))
        .eq('id', workshopId)
        .select('*')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.code === '23505' ? 409 : 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const updatedWorkshopRow = data as WorkshopRow;
    await broadcastWorkshopEvent(supabase, updatedWorkshopRow, { kind: 'state-changed' });
    return NextResponse.json({ workshop: mapWorkshopRow(updatedWorkshopRow) });
}

/**
 * Removes an event occurrence from every active list without erasing the room's audit trail or the shared community
 * polls attached to it. The attachment rows deliberately remain: they belong to polls which the community owns.
 */
export async function DELETE(request: NextRequest, context: AdminWorkshopRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId } = await context.params;
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const workshopRow = await findWorkshopById(supabase, workshopId);
    if (workshopRow === null) {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    if (workshopRow.room_kind !== 'workshop') {
        return NextResponse.json({ error: 'Only workshop occurrences can be deleted' }, { status: 400 });
    }

    const { data: deletedWorkshop, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .update({ is_deleted: true })
        .eq('id', workshopId)
        .eq(WORKSHOP_IS_DELETED_COLUMN_NAME, false)
        .select('id')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (deletedWorkshop === null) {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(supabase, workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ isDeleted: true });
}
