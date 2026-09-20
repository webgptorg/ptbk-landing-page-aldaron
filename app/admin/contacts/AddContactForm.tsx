'use client';

import type { ContactDraft } from '@/lib/contacts/Contact';
import { CONTACT_DRAFT_FIELD_NAMES, EMPTY_CONTACT_DRAFT } from '@/lib/contacts/Contact';
import { ContactForm } from './ContactForm';

type AddContactFormProps = {
    readonly onAddContact: (contactDraft: ContactDraft) => Promise<boolean>;
    readonly onContactAdded: () => void;
};

/**
 * Form which adds one contact filled in by hand
 */
export function AddContactForm(props: AddContactFormProps) {
    const { onAddContact, onContactAdded } = props;

    return (
        <ContactForm
            fieldNames={CONTACT_DRAFT_FIELD_NAMES}
            initialContactValues={EMPTY_CONTACT_DRAFT}
            saveButtonLabel="Save Contact"
            onSaveContact={onAddContact}
            onContactSaved={onContactAdded}
        />
    );
}
