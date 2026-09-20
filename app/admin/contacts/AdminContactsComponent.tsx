'use client';

import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

import { Button } from '@/components/ui/button';
import { useResizableColumnWidths } from '@/hooks/useResizableColumnWidths';
import type { Contact, ContactDraft } from '@/lib/contacts/Contact';
import {
    DEFAULT_CONTACT_COLUMN_WIDTHS,
    MAXIMAL_CONTACT_COLUMN_WIDTH,
    MINIMAL_CONTACT_COLUMN_WIDTH,
} from '@/lib/contacts/contactColumnDefinitions';
import { getContactOriginGroups } from '@/lib/contacts/contactOrigins';
import { selectContacts, type ContactsSelection } from '@/lib/contacts/contactsSelection';
import { paginateContacts } from '@/lib/contacts/paginateContacts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AddContactForm } from './AddContactForm';
import { EditContactDialog } from './EditContactDialog';
import { ContactsExportBar } from './ContactsExportBar';
import { ContactsFilterBar } from './ContactsFilterBar';
import { ContactsPagination } from './ContactsPagination';
import { ContactsTable } from './ContactsTable';
import { useContacts } from './useContacts';
import { useContactsViewState } from './useContactsViewState';

/**
 * Key under which the widths of the columns survive a reload of the page
 */
const CONTACT_COLUMN_WIDTHS_STORAGE_KEY = 'admin-contacts-column-widths';

/**
 * Dashboard which shows, filters, sorts and exports the gathered contacts and leads
 */
export default function AdminContactsComponent() {
    const { contacts, isLoading, errorMessage, changeContact, addContact, editContact, deleteContact } = useContacts();

    const {
        filter,
        sortState,
        contactsPerPage,
        currentPage,
        changeFilter,
        toggleSort,
        changeContactsPerPage,
        changePage,
    } = useContactsViewState();

    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [editedContact, setEditedContact] = useState<Contact | null>(null);

    const { widths, startResizing, resetWidths } = useResizableColumnWidths({
        defaultWidths: DEFAULT_CONTACT_COLUMN_WIDTHS,
        minimalWidth: MINIMAL_CONTACT_COLUMN_WIDTH,
        maximalWidth: MAXIMAL_CONTACT_COLUMN_WIDTH,
        storageKey: CONTACT_COLUMN_WIDTHS_STORAGE_KEY,
    });

    // Note: This is the current view, the table pages through it and the export contains all of it
    const contactsSelection = useMemo((): ContactsSelection => ({ filter, sortState }), [filter, sortState]);

    const filteredAndSortedContacts = useMemo(
        () => selectContacts(contacts, contactsSelection),
        [contacts, contactsSelection],
    );

    const contactOriginGroups = useMemo(() => getContactOriginGroups(contacts), [contacts]);

    const contactsPage = useMemo(
        () => paginateContacts(filteredAndSortedContacts, currentPage, contactsPerPage),
        [contactsPerPage, currentPage, filteredAndSortedContacts],
    );

    // An inline edit can make the final contact on a page stop matching the active filter and a shared link can point
    // to a page which the filter does not reach anymore
    //
    // Note: The page is only kept valid once the contacts are loaded, otherwise a shared page number would be thrown
    //       away while the empty table waits for them
    useEffect(() => {
        if (isLoading) {
            return;
        }

        changePage(contactsPage.currentPage);
    }, [changePage, contactsPage.currentPage, isLoading]);

    const handleAddContact = useCallback((contactDraft: ContactDraft) => addContact(contactDraft), [addContact]);

    return (
        <div className="p-8">
            <h1 className="mb-4 text-2xl font-bold">Contacts & Leads Dashboard</h1>

            {errorMessage !== null && (
                <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            )}

            <ContactsFilterBar
                filter={filter}
                contactOriginGroups={contactOriginGroups}
                onChangeFilter={changeFilter}
            />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <ContactsExportBar
                    exportedContacts={filteredAndSortedContacts}
                    totalContactsCount={contacts.length}
                    contactsSelection={contactsSelection}
                />
                <div className="grow" />
                <Button variant="ghost" onClick={resetWidths} title="Set the widths of all the columns back to default">
                    Reset column widths
                </Button>
                <Button
                    onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                    variant={isAddFormOpen ? 'outline' : 'default'}
                >
                    {isAddFormOpen ? 'Cancel' : 'Add Contact'}
                </Button>
            </div>

            {isAddFormOpen && (
                <AddContactForm onAddContact={handleAddContact} onContactAdded={() => setIsAddFormOpen(false)} />
            )}

            {editedContact !== null && (
                <EditContactDialog
                    contact={editedContact}
                    onEditContact={editContact}
                    onClose={() => setEditedContact(null)}
                />
            )}

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <ContactsTable
                        contacts={contactsPage.pageContacts}
                        columnWidths={widths}
                        sortState={sortState}
                        onToggleSort={toggleSort}
                        onStartColumnResize={startResizing}
                        onChangeContact={changeContact}
                        onEditContact={(contact) => void runAfterAdminSaves(() => setEditedContact(contact))}
                        onDeleteContact={deleteContact}
                    />
                    <ContactsPagination
                        contactsPage={contactsPage}
                        contactsPerPage={contactsPerPage}
                        onChangePage={changePage}
                        onChangeContactsPerPage={changeContactsPerPage}
                    />
                </>
            )}
        </div>
    );
}
