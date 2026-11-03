import type { Contact } from './Contact';
import {
    formatAdminContactRecords,
    formatAdminWorkshopFeedbacks,
    formatAdminWorkshopParticipations,
    type AdminJoinedContact,
} from '@/lib/admin/adminContactJoin';
import { CONTACT_COLUMN_DEFINITIONS } from './contactColumnDefinitions';
import { formatContactValueForExport } from './contactValues';
import { serializeRowsAsCsv } from '@/lib/exports/serializeRowsAsCsv';

/**
 * Serialize the contacts into a CSV file
 *
 * Note: The columns and their order are shared with the contacts table, they are not repeated here
 */
export function serializeContactsAsCsv(contacts: readonly Contact[]): string {
    return serializeRowsAsCsv(
        contacts,
        [...CONTACT_COLUMN_DEFINITIONS.map((column) => ({
            header: column.key,
            getValue: (contact: Contact) => formatContactValueForExport(contact, column.key),
        })), { header: 'submissionEvidence', getValue: (contact: Contact) => contact.submissionEvidence ? JSON.stringify(contact.submissionEvidence) : '' }],
    );
}

/**
 * Serialize the admin's grouped contact projection, including source records that do not live in the Contact table.
 */
export function serializeAdminJoinedContactsAsCsv(contacts: readonly AdminJoinedContact[]): string {
    return serializeRowsAsCsv(
        contacts,
        [
            ...CONTACT_COLUMN_DEFINITIONS.map((column) => ({
                header: column.key,
                getValue: (contact: AdminJoinedContact) => formatContactValueForExport(contact, column.key),
            })),
            { header: 'normalizedEmail', getValue: (contact) => contact.contactGroup.normalizedEmail },
            { header: 'contactRecordCount', getValue: (contact) => contact.contactGroup.contacts.length },
            {
                header: 'contactRecords',
                getValue: (contact) => formatAdminContactRecords(contact.contactGroup),
            },
            {
                header: 'workshopParticipations',
                getValue: (contact) => formatAdminWorkshopParticipations(contact.contactGroup),
            },
            {
                header: 'workshopFeedbacks',
                getValue: (contact) => formatAdminWorkshopFeedbacks(contact.contactGroup),
            },
        ],
    );
}
