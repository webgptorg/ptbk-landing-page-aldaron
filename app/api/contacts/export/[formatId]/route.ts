// app/api/contacts/export/[formatId]/route.ts
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { loadAdminJoinedContacts } from '@/lib/admin/adminContactDatabase';
import { createContactsUnreachableResponse } from '@/lib/contacts/contactsDatabase';
import { getContactsExportFormatOrNull } from '@/lib/contacts/contactsExportFormats';
import { selectContacts } from '@/lib/contacts/contactsSelection';
import { parseContactsViewState } from '@/lib/contacts/contactsViewState';
import { buildContactsExportFileName } from '@/lib/contacts/exportContacts';
import { getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Type the export is served as, so that the browser shows it in the tab instead of downloading it
 *
 * Note: A browser renders neither a CSV nor a vCard, both would be offered as a download even with an inline
 *       disposition. The export which is opened to be read is therefore served as plain text, while the name it is
 *       saved under keeps the extension of its format.
 */
const VIEWED_EXPORT_MIME_TYPE = 'text/plain; charset=utf-8';

/**
 * Nothing about the export may be kept, so that reloading the tab really asks for the contacts as they are then
 */
const VIEWED_EXPORT_CACHE_CONTROL = 'no-store';

type ContactsExportRouteContext = {
    readonly params: Promise<{ readonly formatId: string }>;
};

/**
 * Serve one export of the contacts which the link asks for, filtered and sorted exactly as the dashboard shows them
 *
 * Note: The contacts are read at the moment of the request and the link carries only the view, so the very same link
 *       exports the contacts as they are whenever it is opened again
 */
export async function GET(request: NextRequest, context: ContactsExportRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { formatId } = await context.params;
    const format = getContactsExportFormatOrNull(formatId);
    if (format === null) {
        return NextResponse.json({ error: `There is no "${formatId}" export format` }, { status: 404 });
    }

    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createContactsUnreachableResponse();
    }

    // Note: Every contact is read, the filter of the view decides on its own which of them the export contains
    const { contacts, errorMessage } = await loadAdminJoinedContacts(supabase);
    if (contacts === null) {
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const viewState = parseContactsViewState(new URL(request.url).searchParams);
    const exportedContacts = selectContacts(contacts, viewState);

    return new NextResponse(format.serialize(exportedContacts), {
        headers: {
            'Content-Type': VIEWED_EXPORT_MIME_TYPE,
            'Content-Disposition': `inline; filename="${buildContactsExportFileName(format)}"`,
            'Cache-Control': VIEWED_EXPORT_CACHE_CONTROL,
        },
    });
}
