import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    createWorkshopDatabaseUnavailableResponse,
    findWorkshopBySlug,
    getWorkshopDatabaseOrNull,
    loadWorkshopPublicState,
} from '@/lib/workshops/workshopDatabase';
import { workshopConnectionSchema } from '@/lib/workshops/workshopSchemas';
import { createWorkshopParticipant, setWorkshopSessionCookie } from '@/lib/workshops/workshopSession';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopConnectRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

export async function POST(request: NextRequest, context: WorkshopConnectRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopConnectionSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Enter a valid name and e-mail address' }, { status: 400 });
    }

    const { workshopSlug } = await context.params;
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const workshopRow = await findWorkshopBySlug(supabase, workshopSlug, true);
    if (workshopRow === null) {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    if (workshopRow.room_kind === 'project') {
        return NextResponse.json(
            { error: 'Diskuze projektu se otevírá z komunity, kde ověříme vaše členství.' },
            { status: 403 },
        );
    }

    const connection = await createWorkshopParticipant(
        supabase,
        request,
        workshopRow.id,
        parsedResult.data.fullname,
        parsedResult.data.email,
    );
    if (connection === null) {
        return NextResponse.json({ error: 'Connection could not be saved' }, { status: 500 });
    }

    // Loading the first room snapshot here avoids a second workshop lookup and
    // participant authentication request when many attendees join at once.
    const { state, errorMessage } = await loadWorkshopPublicState(
        supabase,
        workshopRow,
        connection.participant,
        'recent',
    );
    if (state === null) {
        // The session cookie is still returned. The client can retry the state
        // endpoint without creating a duplicate participant row.
        console.error('Failed to load the initial workshop state:', errorMessage);
    }

    const response = NextResponse.json({ state });
    setWorkshopSessionCookie(response, workshopSlug, connection.sessionToken);
    response.headers.set('Cache-Control', 'no-store');
    return response;
}
