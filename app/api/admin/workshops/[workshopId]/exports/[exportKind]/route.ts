import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { joinAdminContactGroup } from '@/lib/admin/adminContactJoin';
import { loadAdminContactGroups } from '@/lib/admin/adminContactDatabase';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import {
    buildWorkshopAdminExportFileName,
    createWorkshopAdminExportFile,
    isWorkshopAdminExportKind,
} from '@/lib/workshops/workshopAdminExports';
import {
    loadWorkshopAdminAnalytics,
    loadWorkshopAdminCommentsForExport,
    loadWorkshopAdminContentForExport,
    loadWorkshopAdminParticipantsForExport,
    loadWorkshopAdminReactionsForExport,
    mapWorkshopRow,
} from '@/lib/workshops/workshopDatabase';
import { parseWorkshopAdminParticipantQuery } from '@/lib/workshops/workshopAdminParticipantQuery';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopExportRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly exportKind: string }>;
};

function createWorkshopExportErrorResponse(errorMessage: string | null): NextResponse {
    return NextResponse.json({ error: errorMessage ?? 'Workshop export could not be created' }, { status: 500 });
}

/**
 * Exports one complete administration section. Participant exports carry the same filter and sort as their table but
 * deliberately omit pagination, so an administrator never downloads only the currently visible page.
 */
export async function GET(request: NextRequest, context: AdminWorkshopExportRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, exportKind: rawExportKind } = await context.params;
    if (!isWorkshopAdminExportKind(rawExportKind)) {
        return NextResponse.json({ error: 'Unknown workshop export' }, { status: 404 });
    }

    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const workshop = mapWorkshopRow(workshopData.workshopRow);
    let exportFile;

    switch (rawExportKind) {
        case 'settings':
            exportFile = createWorkshopAdminExportFile(rawExportKind, { workshop });
            break;
        case 'participants':
        case 'participants-vcard': {
            const query = parseWorkshopAdminParticipantQuery(request.nextUrl.searchParams);
            const [participantsResult, contactGroupsResult] = await Promise.all([
                loadWorkshopAdminParticipantsForExport(workshopData.supabase, workshopId, query),
                loadAdminContactGroups(workshopData.supabase, {
                    isLoadingAll: true,
                    isWorkshopParticipationsIncluded: false,
                }),
            ]);
            const { participants, errorMessage } = participantsResult;
            if (participants === null) {
                return createWorkshopExportErrorResponse(errorMessage);
            }
            if (contactGroupsResult.groups === null) {
                return createWorkshopExportErrorResponse(contactGroupsResult.errorMessage);
            }

            exportFile = createWorkshopAdminExportFile(rawExportKind, {
                workshop,
                participants: participants.map((participant) =>
                    joinAdminContactGroup(participant, contactGroupsResult.groups ?? []),
                ),
            });
            break;
        }
        case 'comments': {
            const { comments, errorMessage } = await loadWorkshopAdminCommentsForExport(
                workshopData.supabase,
                workshopData.workshopRow,
            );
            if (comments === null) {
                return createWorkshopExportErrorResponse(errorMessage);
            }

            exportFile = createWorkshopAdminExportFile(rawExportKind, { workshop, comments });
            break;
        }
        case 'reactions': {
            const { reactions, errorMessage } = await loadWorkshopAdminReactionsForExport(workshopData.supabase, workshopId);
            if (reactions === null) {
                return createWorkshopExportErrorResponse(errorMessage);
            }

            exportFile = createWorkshopAdminExportFile(rawExportKind, { workshop, reactions });
            break;
        }
        case 'content': {
            const { contentBlocks, errorMessage } = await loadWorkshopAdminContentForExport(
                workshopData.supabase,
                workshopId,
            );
            if (contentBlocks === null) {
                return createWorkshopExportErrorResponse(errorMessage);
            }

            exportFile = createWorkshopAdminExportFile(rawExportKind, { workshop, contentBlocks });
            break;
        }
        case 'timeline': {
            const { analytics, errorMessage } = await loadWorkshopAdminAnalytics(workshopData.supabase, workshopData.workshopRow);
            if (analytics === null) {
                return createWorkshopExportErrorResponse(errorMessage);
            }

            exportFile = createWorkshopAdminExportFile(rawExportKind, { workshop, timeline: analytics.timeline });
            break;
        }
    }

    return new NextResponse(exportFile.content, {
        headers: {
            'Cache-Control': 'no-store',
            'Content-Disposition': `attachment; filename="${buildWorkshopAdminExportFileName(workshop, rawExportKind)}"`,
            'Content-Type': exportFile.mimeType,
        },
    });
}
