'use client';

import type { Contact } from '@/lib/contacts/Contact';
import {
    MULTILINE_CONTACT_CELL_LINE_COUNT,
    type ContactColumnDefinition,
} from '@/lib/contacts/contactColumnDefinitions';
import { getContactLink } from '@/lib/contacts/contactLinks';
import { formatContactValueForDisplay } from '@/lib/contacts/contactValues';
import { TruncatedText } from './TruncatedText';

type ContactsTableCellProps = {
    readonly contact: Contact;
    readonly column: ContactColumnDefinition;
    readonly onEditContact: (contact: Contact) => void;
};

/**
 * Value of one contact in one column, rendered the way the column definition asks for
 */
export function ContactsTableCell(props: ContactsTableCellProps) {
    const { contact, column, onEditContact } = props;

    if (column.cellKind === 'CONTACTED_STATUS' || column.cellKind === 'EDITABLE_NOTE') {
        return (
            <button type="button" onClick={() => onEditContact(contact)}
                aria-label={`Edit ${column.label} for ${contact.fullname ?? contact.email ?? contact.id}`}
                className="w-full rounded px-2 py-1 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-cyan-600">
                <span className="line-clamp-3 whitespace-pre-wrap break-words">
                    {column.cellKind === 'CONTACTED_STATUS' ? (contact.isContacted ? 'Contacted' : 'Not contacted') : (contact.ourNote || 'Add note')}
                </span>
            </button>
        );
    }

    const text = formatContactValueForDisplay(contact, column.key);
    const link = getContactLink(contact, column.key);

    return (
        <TruncatedText
            text={text}
            lineCount={column.cellKind === 'MULTILINE_TEXT' ? MULTILINE_CONTACT_CELL_LINE_COUNT : 1}
            link={link ?? undefined}
        />
    );
}
