import type { Moment } from 'moment';
import type { Contact, ContactColumnKey } from './Contact';
import { CONTACT_COLUMN_DEFINITIONS, getContactColumnDefinition } from './contactColumnDefinitions';
import { parseContactDate } from './contactDates';

/**
 * How a date is written into the exported files
 */
const CONTACT_DATE_EXPORT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * How a boolean is written into the exported files and into the fulltext search text
 */
const BOOLEAN_TRUE_LABEL = 'yes';
const BOOLEAN_FALSE_LABEL = 'no';

/**
 * Compares texts the way a human expects it, so that for example "Čapek" is next to "Capek"
 */
const CONTACT_TEXT_COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * Combining marks left over after the unicode decomposition of a letter with diacritics
 */
const DIACRITICS_PATTERN = new RegExp('[\u0300-\u036f]', 'g');

/**
 * Read one raw value of a contact
 */
function getContactRawValue(contact: Contact, columnKey: ContactColumnKey): string | boolean | null {
    return contact[columnKey] ?? null;
}

/**
 * Format one value of a contact, with its dates written the way the reader of the value needs them
 */
function formatContactValue(
    contact: Contact,
    columnKey: ContactColumnKey,
    formatDate: (contactDate: Moment) => string,
): string {
    const rawValue = getContactRawValue(contact, columnKey);

    if (rawValue === null) {
        return '';
    }

    if (typeof rawValue === 'boolean') {
        return rawValue ? BOOLEAN_TRUE_LABEL : BOOLEAN_FALSE_LABEL;
    }

    if (getContactColumnDefinition(columnKey).cellKind === 'DATE') {
        const contactDate = parseContactDate(rawValue);

        // Note: A value which holds no readable date is shown as it is stored, which tells more than "Invalid date"
        return contactDate === null ? rawValue : formatDate(contactDate);
    }

    return rawValue;
}

/**
 * Format one value of a contact the way it is shown in the contacts table
 */
export function formatContactValueForDisplay(contact: Contact, columnKey: ContactColumnKey): string {
    return formatContactValue(contact, columnKey, (contactDate) => contactDate.calendar());
}

/**
 * Format one value of a contact the way it is written into an exported CSV or vCard file
 *
 * Note: Unlike the displayed value, the exported value is machine readable, so dates are absolute
 */
export function formatContactValueForExport(contact: Contact, columnKey: ContactColumnKey): string {
    return formatContactValue(contact, columnKey, (contactDate) => contactDate.format(CONTACT_DATE_EXPORT_FORMAT));
}

/**
 * Value the contacts are sorted by when one column is picked
 *
 * Note: A date is sorted by the point in time it stands for and never by the text it is written as, so that the order
 *       does not depend on how the date happens to be spelled
 *
 * @returns Number for dates and switches, text for everything else, `null` when there is nothing to sort by
 */
export function getContactSortValue(contact: Contact, columnKey: ContactColumnKey): string | number | null {
    const rawValue = getContactRawValue(contact, columnKey);
    const { cellKind } = getContactColumnDefinition(columnKey);

    if (cellKind === 'CONTACTED_STATUS' || cellKind === 'BOOLEAN') {
        // Note: A missing flag means "not set", which has the same ordering as an explicit `false`.
        return rawValue === true ? 1 : 0;
    }

    if (typeof rawValue !== 'string') {
        return null;
    }

    if (cellKind === 'DATE') {
        return parseContactDate(rawValue)?.valueOf() ?? null;
    }

    const textValue = rawValue.trim();
    return textValue === '' ? null : textValue;
}

/**
 * Compare two non empty sort values in the ascending direction
 */
export function compareContactSortValues(sortValueA: string | number, sortValueB: string | number): number {
    if (typeof sortValueA === 'number' && typeof sortValueB === 'number') {
        return sortValueA - sortValueB;
    }

    return CONTACT_TEXT_COLLATOR.compare(String(sortValueA), String(sortValueB));
}

/**
 * Strip the diacritics and lowercase the text, so that the fulltext search finds "Novák" when "novak" is typed
 */
export function normalizeSearchText(text: string): string {
    return text.normalize('NFD').replace(DIACRITICS_PATTERN, '').toLowerCase();
}

const CONTACT_SEARCH_TEXT_CACHE = new WeakMap<Contact, string>();

/**
 * All values of one contact joined into a single normalized text which the fulltext search runs against
 *
 * Note: The result is cached per contact object, because the search runs on every keystroke
 */
export function getContactSearchText(contact: Contact): string {
    const cachedSearchText = CONTACT_SEARCH_TEXT_CACHE.get(contact);

    if (cachedSearchText !== undefined) {
        return cachedSearchText;
    }

    const searchText = normalizeSearchText(
        CONTACT_COLUMN_DEFINITIONS.map((column) => formatContactValueForExport(contact, column.key)).join(' '),
    );

    CONTACT_SEARCH_TEXT_CACHE.set(contact, searchText);
    return searchText;
}

/**
 * Best human readable name of the contact, used for example as the vCard full name
 */
export function getContactDisplayName(contact: Contact): string {
    return contact.fullname?.trim() || contact.email?.trim() || contact.phone?.trim() || `Contact #${contact.id}`;
}
