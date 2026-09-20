'use client';

import { AdminContactDetails } from '@/components/admin/AdminContactDetails';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import type { Contact, ContactColumnKey } from '@/lib/contacts/Contact';
import {
    CONTACT_ACTIONS_COLUMN_WIDTH,
    CONTACT_COLUMN_DEFINITIONS,
    CONTACT_WORKSHOP_PARTICIPATIONS_COLUMN_WIDTH,
} from '@/lib/contacts/contactColumnDefinitions';
import type { ContactsSortState } from '@/lib/contacts/sortContacts';
import type { ColumnWidths } from '@/hooks/useResizableColumnWidths';
import type { PointerEvent } from 'react';
import { ContactActions } from './ContactActions';
import { ContactsTableCell } from './ContactsTableCell';
import { ContactsTableHeaderCell } from './ContactsTableHeaderCell';

type ContactsTableProps = {
    readonly contacts: readonly AdminJoinedContact[];
    readonly columnWidths: ColumnWidths;
    readonly sortState: ContactsSortState;
    readonly onToggleSort: (columnKey: ContactColumnKey) => void;
    readonly onStartColumnResize: (columnKey: string, pointerEvent: PointerEvent) => void;
    readonly onEditContact: (contact: Contact) => void;
    readonly onDeleteContact: (contactId: number) => Promise<boolean>;
};

/**
 * Table of the contacts with resizable and sortable columns
 *
 * Note: The layout is fixed and driven by `columnWidths`, so a narrower column really does cut its text sooner
 */
export function ContactsTable(props: ContactsTableProps) {
    const {
        contacts,
        columnWidths,
        sortState,
        onToggleSort,
        onStartColumnResize,
        onEditContact,
        onDeleteContact,
    } = props;

    const tableWidth = CONTACT_COLUMN_DEFINITIONS.reduce(
        (totalWidth, column) => totalWidth + (columnWidths[column.key] ?? column.defaultWidth),
        CONTACT_ACTIONS_COLUMN_WIDTH + CONTACT_WORKSHOP_PARTICIPATIONS_COLUMN_WIDTH,
    );

    if (contacts.length === 0) {
        return (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">No contact matches the filter</div>
        );
    }

    return (
        <TooltipProvider delayDuration={300}>
            <div className="rounded-lg border">
                <Table
                    containerClassName="rounded-lg"
                    horizontalScrollLabel="Scroll contacts table horizontally"
                    className="table-fixed"
                    style={{ width: tableWidth }}
                >
                    <colgroup>
                        {CONTACT_COLUMN_DEFINITIONS.map((column) => (
                            <col key={column.key} style={{ width: columnWidths[column.key] ?? column.defaultWidth }} />
                        ))}
                        <col style={{ width: CONTACT_WORKSHOP_PARTICIPATIONS_COLUMN_WIDTH }} />
                        <col style={{ width: CONTACT_ACTIONS_COLUMN_WIDTH }} />
                    </colgroup>
                    <TableHeader>
                        <TableRow>
                            {CONTACT_COLUMN_DEFINITIONS.map((column) => (
                                <TableHead
                                    key={column.key}
                                    isPinned={column.key === 'fullname'}
                                    className="overflow-hidden px-4"
                                >
                                    <ContactsTableHeaderCell
                                        column={column}
                                        sortState={sortState}
                                        onToggleSort={onToggleSort}
                                        onStartResize={onStartColumnResize}
                                    />
                                </TableHead>
                            ))}
                            <TableHead className="px-4">Spojené údaje, účasti a zpětná vazba</TableHead>
                            <TableHead className="px-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.map((contact) => (
                            <TableRow key={contact.id}>
                                {CONTACT_COLUMN_DEFINITIONS.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        isPinned={column.key === 'fullname'}
                                        className="overflow-hidden p-2 align-top"
                                    >
                                        <ContactsTableCell
                                            contact={contact}
                                            column={column}
                                            onEditContact={onEditContact}
                                        />
                                    </TableCell>
                                ))}
                                <TableCell className="p-2 align-top">
                                    <AdminContactDetails
                                        contactGroup={contact.contactGroup}
                                        isContactRecordsIncluded={contact.contactGroup.contacts.length > 1}
                                        isWorkshopParticipationsIncluded
                                        isWorkshopFeedbackIncluded
                                    />
                                </TableCell>
                                <TableCell className="p-2 align-top">
                                    <ContactActions
                                        contact={contact}
                                        onEditContact={onEditContact}
                                        onDeleteContact={onDeleteContact}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    );
}
