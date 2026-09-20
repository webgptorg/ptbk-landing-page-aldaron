import type { ContactColumnKey } from './Contact';

/**
 * How the value of one contact column is rendered in the contacts table
 */
export type ContactColumnCellKind =
    /**
     * Human readable date truncated to one line
     */
    | 'DATE'

    /**
     * Short text truncated to one line
     */
    | 'TEXT'

    /**
     * Long text clamped to several lines
     */
    | 'MULTILINE_TEXT'

    /**
     * Contacted status which opens the contact editor
     */
    | 'CONTACTED_STATUS'

    /**
     * Read-only boolean value
     */
    | 'BOOLEAN'

    /**
     * Internal note preview which opens the contact editor
     */
    | 'EDITABLE_NOTE';

/**
 * Kind of destination a contact column can link to
 */
export type ContactColumnLinkKind = 'EMAIL' | 'PHONE' | 'WEB_URL';

/**
 * Description of one column of the contacts table
 *
 * Note: This is the single source of truth shared by the table, the sorting, the filtering and all the exports
 */
export type ContactColumnDefinition = {
    readonly key: ContactColumnKey;
    readonly label: string;
    readonly cellKind: ContactColumnCellKind;

    /**
     * Link behavior of a text value, when the column represents a way to reach the contact or their source page
     */
    readonly linkKind?: ContactColumnLinkKind;

    /**
     * Width in pixels used until the user resizes the column
     */
    readonly defaultWidth: number;
};

/**
 * Narrowest column the user can drag a column to, in pixels
 */
export const MINIMAL_CONTACT_COLUMN_WIDTH = 60;

/**
 * Widest column the user can drag a column to, in pixels
 */
export const MAXIMAL_CONTACT_COLUMN_WIDTH = 900;

/**
 * Width of the actions column, which is deliberately separate from data columns because it is neither sortable nor exportable
 */
export const CONTACT_ACTIONS_COLUMN_WIDTH = 170;

/**
 * Width of the admin-only workshop attendance column, which is derived from another source rather than Contact fields.
 */
export const CONTACT_WORKSHOP_PARTICIPATIONS_COLUMN_WIDTH = 260;

/**
 * How many lines of a `MULTILINE_TEXT` column are shown before the text is cut by the ellipsis "..."
 */
export const MULTILINE_CONTACT_CELL_LINE_COUNT = 3;

/**
 * All columns of the contacts table in the order in which they are shown and exported
 */
export const CONTACT_COLUMN_DEFINITIONS: readonly ContactColumnDefinition[] = [
    { key: 'createdAt', label: 'Created At', cellKind: 'DATE', defaultWidth: 140 },
    { key: 'fullname', label: 'Full Name', cellKind: 'TEXT', defaultWidth: 150 },
    { key: 'email', label: 'Email', cellKind: 'TEXT', linkKind: 'EMAIL', defaultWidth: 200 },
    { key: 'phone', label: 'Phone', cellKind: 'TEXT', linkKind: 'PHONE', defaultWidth: 120 },
    { key: 'userNote', label: 'User Note', cellKind: 'MULTILINE_TEXT', defaultWidth: 200 },
    { key: 'isContacted', label: 'Is Contacted', cellKind: 'CONTACTED_STATUS', defaultWidth: 100 },
    { key: 'isWaitlisted', label: 'Waitlisted', cellKind: 'BOOLEAN', defaultWidth: 100 },
    { key: 'ourNote', label: 'Our Note', cellKind: 'EDITABLE_NOTE', defaultWidth: 250 },
    { key: 'userAgent', label: 'User Agent', cellKind: 'MULTILINE_TEXT', defaultWidth: 300 },
    { key: 'ipAddress', label: 'IP Address', cellKind: 'TEXT', defaultWidth: 120 },
    { key: 'referrer', label: 'Referrer', cellKind: 'TEXT', linkKind: 'WEB_URL', defaultWidth: 200 },
    { key: 'appName', label: 'App Name', cellKind: 'TEXT', defaultWidth: 120 },
    { key: 'placeName', label: 'Place Name', cellKind: 'TEXT', defaultWidth: 120 },
    { key: 'url', label: 'URL', cellKind: 'TEXT', linkKind: 'WEB_URL', defaultWidth: 200 },
];

/**
 * Width of every column before the user resizes anything, keyed by the column key
 */
export const DEFAULT_CONTACT_COLUMN_WIDTHS: Readonly<Record<string, number>> = Object.fromEntries(
    CONTACT_COLUMN_DEFINITIONS.map((column) => [column.key, column.defaultWidth] as const),
);

const CONTACT_COLUMN_DEFINITIONS_BY_KEY = new Map<ContactColumnKey, ContactColumnDefinition>(
    CONTACT_COLUMN_DEFINITIONS.map((column) => [column.key, column] as const),
);

/**
 * Find the definition of one contact column
 *
 * @throws Error when the column is not defined in `CONTACT_COLUMN_DEFINITIONS`
 */
export function getContactColumnDefinition(columnKey: ContactColumnKey): ContactColumnDefinition {
    const columnDefinition = CONTACT_COLUMN_DEFINITIONS_BY_KEY.get(columnKey);

    if (columnDefinition === undefined) {
        throw new Error(`Contact column "${columnKey}" is not defined`);
    }

    return columnDefinition;
}
