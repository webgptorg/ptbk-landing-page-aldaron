import { appendSearchParameters } from '@/lib/api/appendSearchParameters';
import { ADMIN_CONTACTS_PATH } from '@/lib/admin/adminConstants';
import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import { downloadTextFile } from '@/lib/downloadTextFile';
import moment from 'moment';
import type { ContactsExportFormat } from './contactsExportFormats';
import type { ContactsSelection } from './contactsSelection';
import { DEFAULT_CONTACTS_VIEW_STATE, serializeContactsViewState } from './contactsViewState';

const EXPORT_FILE_NAME_PREFIX = 'contacts';
const EXPORT_FILE_NAME_DATE_FORMAT = 'YYYY-MM-DD-HHmm';

/**
 * Where the server serves the exports from, one address below it for each format
 */
const CONTACTS_EXPORT_API_PATH = '/api/contacts/export';

/**
 * Name of the exported file, stamped with the moment of the export so that repeated exports do not overwrite each other
 */
export function buildContactsExportFileName(format: ContactsExportFormat): string {
    return `${EXPORT_FILE_NAME_PREFIX}-${moment().format(EXPORT_FILE_NAME_DATE_FORMAT)}.${format.fileExtension}`;
}

/**
 * Sentence which says how many contacts are going to be downloaded and how narrow that selection is
 *
 * Note: Only the filter narrows the export down, splitting the table into pages never does
 */
export function describeContactsExportScope(exportedContactsCount: number, totalContactsCount: number): string {
    if (totalContactsCount === 0) {
        return 'no contacts';
    }

    if (exportedContactsCount === totalContactsCount) {
        return `all ${totalContactsCount} contacts`;
    }

    return `${exportedContactsCount} of ${totalContactsCount} contacts which match the filter, across all pages`;
}

/**
 * Serialize one selection exactly as the contacts dashboard and its export endpoints understand it.
 */
function serializeContactsSelection(selection: ContactsSelection): URLSearchParams {
    return serializeContactsViewState({ ...DEFAULT_CONTACTS_VIEW_STATE, ...selection }, new URLSearchParams());
}

/**
 * Address which opens the contacts dashboard at one filtered and sorted selection.
 */
export function buildContactsDashboardUrl(selection: ContactsSelection): string {
    const contactsSearchParams = serializeContactsSelection(selection);

    return appendSearchParameters(ADMIN_CONTACTS_PATH, Object.fromEntries(contactsSearchParams.entries()));
}

/**
 * Address which serves the export of the given selection, opened by the very same session as the dashboard itself
 *
 * Note: The link carries the filter and the sorting and never the contacts themselves, so that opening it again -
 *       for example by reloading the tab it was opened in - exports the contacts as they are at that later moment
 *
 * Note: The page of the table is left out, because an export always contains the whole selection anyway
 */
export function buildContactsExportUrl(format: ContactsExportFormat, selection: ContactsSelection): string {
    const exportSearchParams = serializeContactsSelection(selection);

    return appendSearchParameters(
        `${CONTACTS_EXPORT_API_PATH}/${format.id}`,
        Object.fromEntries(exportSearchParams.entries()),
    );
}

/**
 * Serialize the given contacts and download them as a file
 *
 * Note: The caller decides the export scope by supplying the contacts to serialize, so the downloaded file holds
 *       exactly the contacts which the dashboard shows at that moment
 */
export function downloadContactsExport(contacts: readonly AdminJoinedContact[], format: ContactsExportFormat): void {
    downloadTextFile({
        fileName: buildContactsExportFileName(format),
        mimeType: format.mimeType,
        content: format.serialize(contacts),
    });
}
