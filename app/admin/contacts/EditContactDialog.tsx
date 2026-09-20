'use client';

import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import {
    CONTACT_EDITABLE_TEXT_FIELD_NAMES,
    pickContactTextValues,
    type Contact,
    type ContactTextValues,
} from '@/lib/contacts/Contact';
import { ContactForm } from './ContactForm';

type EditContactDialogProps = {
    readonly contact: Contact;
    readonly onEditContact: (contactId: number, contactValues: ContactTextValues & { readonly isContacted: boolean }) => Promise<boolean>;
    readonly onClose: () => void;
};

/**
 * Dialog for changing the contact details that are also available when adding a contact manually
 */
export function EditContactDialog(props: EditContactDialogProps) {
    const { contact, onEditContact, onClose } = props;

    return (
        <AdminEditorDialog isOpen onClose={onClose} title="Edit Contact" description="Update the contact details, notes and contacted status.">
            <ContactForm
                isAutosaveEnabled
                initialIsContacted={contact.isContacted === true}
                key={contact.id}
                fieldNames={CONTACT_EDITABLE_TEXT_FIELD_NAMES}
                initialContactValues={pickContactTextValues(contact, CONTACT_EDITABLE_TEXT_FIELD_NAMES)}
                saveButtonLabel="Save Changes"
                onSaveContact={(contactValues, isContacted) => onEditContact(contact.id, { ...contactValues, isContacted })}
                onContactSaved={onClose}
                onCancel={onClose}
            />
        </AdminEditorDialog>
    );
}
