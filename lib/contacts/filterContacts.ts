import moment from 'moment';
import type { AdminContactGroup } from '@/lib/admin/adminContactJoin';
import { isEventRegistrationPlaceName } from '@/lib/events/eventTypes';
import {
    isWorkshopRegistrationForTerm,
    readWorkshopRegistration,
    type WorkshopRegistrationTerm,
} from '@/lib/workshops/workshopRegistrations';
import type { Contact } from './Contact';
import { parseContactDate } from './contactDates';
import { getContactSearchText, normalizeSearchText } from './contactValues';
import {
    EMPTY_CONTACT_ORIGIN_SELECTIONS,
    isContactOriginSelectionActive,
    matchesContactOriginSelections,
    normalizeContactOriginSelections,
    type ContactOriginSelection,
} from './contactOrigins';

/**
 * Format of the dates in the date range filter, the very same format which `<input type="date">` works with
 */
export const DATE_FILTER_FORMAT = 'YYYY-MM-DD';

/**
 * Every answer to the question whether one value of the contact is filled in at all, in the order in which they are offered
 */
export const PRESENCE_FILTER_VALUES = ['ANY', 'PRESENT', 'MISSING'] as const;

/**
 * Filter which asks whether one value of the contact is filled in at all
 */
export type PresenceFilterValue = (typeof PRESENCE_FILTER_VALUES)[number];

/**
 * Every answer to the question whether the contact was already contacted, in the order in which they are offered
 */
export const CONTACTED_FILTER_VALUES = ['ANY', 'NOT_CONTACTED', 'CONTACTED'] as const;

/**
 * Filter which asks whether the contact was already contacted by us
 */
export type ContactedFilterValue = (typeof CONTACTED_FILTER_VALUES)[number];

/**
 * Everything the user can narrow the contacts down by
 */
export type ContactsFilter = {
    readonly searchQuery: string;
    readonly createdFromDate: string;
    readonly createdToDate: string;
    readonly emailPresence: PresenceFilterValue;
    readonly phonePresence: PresenceFilterValue;
    readonly userNotePresence: PresenceFilterValue;
    readonly contactedStatus: ContactedFilterValue;
    readonly contactOriginSelections: readonly ContactOriginSelection[];

    /**
     * A particular event term whose landing-page registrations are shown, or `null` for no term-specific restriction.
     *
     * Note: The contact row stores neither a workshop id nor a foreign key. Its note is the durable source of which
     *       term it registered for, so the same term shape used by registration counting identifies it here.
     */
    readonly workshopRegistrationTerm: WorkshopRegistrationTerm | null;
};

/**
 * Filter which lets every single contact through
 */
export const EMPTY_CONTACTS_FILTER: ContactsFilter = {
    searchQuery: '',
    createdFromDate: '',
    createdToDate: '',
    emailPresence: 'ANY',
    phonePresence: 'ANY',
    userNotePresence: 'ANY',
    contactedStatus: 'ANY',
    contactOriginSelections: EMPTY_CONTACT_ORIGIN_SELECTIONS,
    workshopRegistrationTerm: null,
};

/**
 * Filter the dashboard starts with
 *
 * Note: Leads which were not contacted yet are the ones which need our attention, so they are shown first
 */
export const DEFAULT_CONTACTS_FILTER: ContactsFilter = {
    ...EMPTY_CONTACTS_FILTER,
    contactedStatus: 'NOT_CONTACTED',
};

const CONTACTS_FILTER_SCALAR_KEYS: readonly (
    Exclude<keyof ContactsFilter, 'contactOriginSelections' | 'workshopRegistrationTerm'>
)[] = [
    'searchQuery',
    'createdFromDate',
    'createdToDate',
    'emailPresence',
    'phonePresence',
    'userNotePresence',
    'contactedStatus',
];

/**
 * Is the given filter narrowing the contacts down in any way?
 */
export function isContactsFilterActive(filter: ContactsFilter): boolean {
    return (
        CONTACTS_FILTER_SCALAR_KEYS.some(
            (filterKey) => filter[filterKey] !== EMPTY_CONTACTS_FILTER[filterKey],
        ) ||
        filter.workshopRegistrationTerm !== null ||
        isContactOriginSelectionActive(filter.contactOriginSelections)
    );
}

/**
 * Does the contact match every word of the fulltext query?
 *
 * Note: The words are searched independently, so "novak praha" finds the contact no matter the order of the values
 */
function matchesSearchQuery(contact: Contact, searchQuery: string): boolean {
    const searchWords = normalizeSearchText(searchQuery).split(/\s+/).filter(Boolean);

    if (searchWords.length === 0) {
        return true;
    }

    const searchText = getContactSearchText(contact);
    return searchWords.every((searchWord) => searchText.includes(searchWord));
}

/**
 * Was the contact created within the picked date range?
 *
 * Note: Both bounds are inclusive whole days in the timezone of the browser
 */
function matchesCreatedDateRange(contact: Contact, createdFromDate: string, createdToDate: string): boolean {
    if (createdFromDate === '' && createdToDate === '') {
        return true;
    }

    const createdAtMoment = parseContactDate(contact.createdAt);

    if (createdAtMoment === null) {
        return false;
    }

    if (createdFromDate !== '' && createdAtMoment.isBefore(moment(createdFromDate, DATE_FILTER_FORMAT).startOf('day'))) {
        return false;
    }

    if (createdToDate !== '' && createdAtMoment.isAfter(moment(createdToDate, DATE_FILTER_FORMAT).endOf('day'))) {
        return false;
    }

    return true;
}

/**
 * Is the value filled in (or missing) as the presence filter requires?
 */
function matchesPresence(value: string | null, presence: PresenceFilterValue): boolean {
    if (presence === 'ANY') {
        return true;
    }

    const isValuePresent = typeof value === 'string' && value.trim() !== '';
    return presence === 'PRESENT' ? isValuePresent : !isValuePresent;
}

/**
 * Was the contact already contacted (or not) as the filter requires?
 */
function matchesContactedStatus(contact: Contact, contactedStatus: ContactedFilterValue): boolean {
    if (contactedStatus === 'ANY') {
        return true;
    }

    // Note: A missing flag means "not contacted yet", exactly the same as an explicit `false`
    const isContacted = contact.isContacted === true;
    return contactedStatus === 'CONTACTED' ? isContacted : !isContacted;
}

type ContactWithAdminContactGroup = Contact & {
    readonly contactGroup?: AdminContactGroup | null;
};

/**
 * Read every source Contact row which can describe a registration for the identity displayed by the contacts admin.
 *
 * Note: The contacts administration merges rows with the same normalized e-mail. Its displayed primary row can be a
 *       newer newsletter or inquiry, while an older source row is the actual event registration. A term filter must
 *       therefore inspect the complete source group or it could hide a person who really registered.
 */
function getSourceContactsForRegistration(contact: Contact): readonly Contact[] {
    const sourceContacts = (contact as ContactWithAdminContactGroup).contactGroup?.contacts;

    return sourceContacts === undefined || sourceContacts.length === 0 ? [contact] : sourceContacts;
}

/**
 * Does the contact record one registration for the requested event term?
 *
 * Note: The origin check comes before parsing the note. A term-like note left in a different form must not become a
 *       workshop registration merely because it contains a date or a slug.
 */
function matchesWorkshopRegistrationTerm(contact: Contact, workshopRegistrationTerm: WorkshopRegistrationTerm | null): boolean {
    return (
        workshopRegistrationTerm === null ||
        getSourceContactsForRegistration(contact).some(
            (sourceContact) =>
                isEventRegistrationPlaceName(sourceContact.placeName) &&
                isWorkshopRegistrationForTerm(readWorkshopRegistration(sourceContact.userNote), workshopRegistrationTerm),
        )
    );
}

/**
 * Does the contact match every part of the filter?
 */
function matchesContactsFilter(
    contact: Contact,
    filter: ContactsFilter,
    contactOriginSelections: readonly ContactOriginSelection[],
): boolean {
    return (
        matchesContactedStatus(contact, filter.contactedStatus) &&
        matchesPresence(contact.email, filter.emailPresence) &&
        matchesPresence(contact.phone, filter.phonePresence) &&
        matchesPresence(contact.userNote, filter.userNotePresence) &&
        matchesCreatedDateRange(contact, filter.createdFromDate, filter.createdToDate) &&
        matchesSearchQuery(contact, filter.searchQuery) &&
        matchesWorkshopRegistrationTerm(contact, filter.workshopRegistrationTerm) &&
        matchesContactOriginSelections(contact, contactOriginSelections)
    );
}

/**
 * Keep only the contacts which match the filter
 *
 * @returns New array, the given contacts are never mutated
 */
export function filterContacts<ContactType extends Contact>(
    contacts: readonly ContactType[],
    filter: ContactsFilter,
): ContactType[] {
    const contactOriginSelections = normalizeContactOriginSelections(filter.contactOriginSelections);

    return contacts.filter((contact) => matchesContactsFilter(contact, filter, contactOriginSelections));
}
