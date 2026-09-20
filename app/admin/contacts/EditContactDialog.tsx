'use client';

import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    CONTACT_EDITABLE_TEXT_FIELD_NAMES,
    pickContactTextValues,
    type Contact,
    type ContactTextValues,
} from '@/lib/contacts/Contact';
import { ContactForm } from './ContactForm';

type EditContactDialogProps = {
    readonly contact: Contact;
    readonly onEditContact: (contactId: number, contactValues: ContactTextValues) => Promise<boolean>;
    readonly onClose: () => void;
};

/**
 * Dialog for changing the contact details that are also available when adding a contact manually
 */
export function EditContactDialog(props: EditContactDialogProps) {
    const { contact, onEditContact, onClose } = props;

    return (
        <Dialog
            open
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    void runAfterAdminSaves(onClose);
                }
            }}
        >
            <DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Contact</DialogTitle>
                    <DialogDescription>
                        Update the contact details, including both notes. The contacted status and our note stay
                        editable in the table as well.
                    </DialogDescription>
                </DialogHeader>
                <ContactForm
                    isAutosaveEnabled
                    key={contact.id}
                    fieldNames={CONTACT_EDITABLE_TEXT_FIELD_NAMES}
                    initialContactValues={pickContactTextValues(contact, CONTACT_EDITABLE_TEXT_FIELD_NAMES)}
                    saveButtonLabel="Save Changes"
                    onSaveContact={(contactValues) => onEditContact(contact.id, contactValues)}
                    onContactSaved={onClose}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
