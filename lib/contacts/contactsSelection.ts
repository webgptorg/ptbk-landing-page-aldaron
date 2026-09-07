import type { Contact } from './Contact';
import type { ContactsViewState } from './contactsViewState';
import { EMPTY_CONTACTS_FILTER, filterContacts } from './filterContacts';
import { DEFAULT_CONTACTS_SORT_STATE, sortContacts } from './sortContacts';
import type { WorkshopRegistrationTerm } from '@/lib/workshops/workshopRegistrations';

/**
 * Which contacts belong into the current view and in which order they are read
 *
 * Note: Splitting the table into pages is deliberately not a part of it, the pages only decide how much of the
 *       selection is shown at once while an export always contains all of it
 */
export type ContactsSelection = Pick<ContactsViewState, 'filter' | 'sortState'>;

/**
 * The view of contact records which registered for one administered event term.
 *
 * Note: Registrations must stay visible after somebody answers them, unlike the everyday contacts dashboard which
 *       begins with unanswered leads. The term-aware filter itself is shared with the table and every export.
 */
export function createWorkshopRegistrationContactsSelection(
    workshopRegistrationTerm: WorkshopRegistrationTerm,
): ContactsSelection {
    // Only identifiers belong in a shareable URL. An administered workshop has extra private configuration fields but
    // is structurally usable as a term, so copy exactly what the registration rule needs instead of serializing it.
    const selectedWorkshopRegistrationTerm: WorkshopRegistrationTerm = {
        slug: workshopRegistrationTerm.slug,
        startsAt: workshopRegistrationTerm.startsAt,
    };

    return {
        filter: {
            ...EMPTY_CONTACTS_FILTER,
            contactedStatus: 'ANY',
            workshopRegistrationTerm: selectedWorkshopRegistrationTerm,
        },
        sortState: DEFAULT_CONTACTS_SORT_STATE,
    };
}

/**
 * Keep only the selected contacts, in the selected order
 *
 * Note: This is the one and only place which turns a filter and a sorting into contacts, so that the table in the
 *       browser and an export built by the server can never disagree about what the very same view contains
 *
 * @returns New array, the given contacts are never mutated
 */
export function selectContacts<ContactType extends Contact>(
    contacts: readonly ContactType[],
    selection: ContactsSelection,
): ContactType[] {
    return sortContacts(filterContacts(contacts, selection.filter), selection.sortState);
}
