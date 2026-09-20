'use client';

import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import type { ContactChanges, ContactDraft } from '@/lib/contacts/Contact';
import {
    createContact,
    deleteContact as deleteContactRequest,
    fetchContacts,
} from '@/lib/contacts/contactsApiClient';
import { useCallback, useEffect, useState } from 'react';
import { useDebouncedContactSaver } from './useDebouncedContactSaver';

type UseContactsResult = {
    readonly contacts: readonly AdminJoinedContact[];
    readonly isLoading: boolean;
    readonly errorMessage: string | null;
    readonly changeContact: (contactId: number, contactChanges: ContactChanges) => void;
    readonly addContact: (contactDraft: ContactDraft) => Promise<boolean>;
    readonly editContact: (contactId: number, contactValues: ContactChanges) => Promise<boolean>;
    readonly deleteContact: (contactId: number) => Promise<boolean>;
};

/**
 * Load every contact and keep it in sync with the changes made in the dashboard
 *
 * Note: A change is shown immediately and saved a moment later, so that typing a note is not sent letter by letter
 */
export function useContacts(): UseContactsResult {
    const [contacts, setContacts] = useState<readonly AdminJoinedContact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { saveContactChanges, flushContactChanges, getContactChanges } = useDebouncedContactSaver(setErrorMessage);

    const reloadContacts = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);

        try {
            const loadedContacts = await fetchContacts();
            setContacts(loadedContacts.map((contact) => ({ ...contact, ...getContactChanges(contact.id) })));
            setErrorMessage(null);
            return true;
        } catch (error) {
            setErrorMessage((error as Error).message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [getContactChanges]);

    useEffect(() => {
        let isLoadingActive = true;

        void fetchContacts()
            .then((loadedContacts) => {
                if (!isLoadingActive) {
                    return;
                }
                setContacts(loadedContacts);
                setErrorMessage(null);
            })
            .catch((error: Error) => {
                if (!isLoadingActive) {
                    return;
                }
                setContacts([]);
                setErrorMessage(error.message);
            })
            .finally(() => {
                if (isLoadingActive) {
                    setIsLoading(false);
                }
            });

        return () => {
            isLoadingActive = false;
        };
    }, []);

    const changeContact = useCallback(
        (contactId: number, contactChanges: ContactChanges) => {
            setContacts((previousContacts) =>
                previousContacts.map((contact) =>
                    contact.id === contactId ? { ...contact, ...contactChanges } : contact,
                ),
            );

            saveContactChanges(contactId, contactChanges);
        },
        [saveContactChanges],
    );

    const addContact = useCallback(
        async (contactDraft: ContactDraft): Promise<boolean> => {
            try {
                await createContact(contactDraft);
                await reloadContacts();
                return true;
            } catch (error) {
                setErrorMessage((error as Error).message);
                return false;
            }
        },
        [reloadContacts],
    );

    const editContact = useCallback(
        async (contactId: number, contactValues: ContactChanges): Promise<boolean> => {
            changeContact(contactId, contactValues);
            const isSaved = await flushContactChanges(contactId);
            if (isSaved) setErrorMessage(null);
            return isSaved;
        },
        [changeContact, flushContactChanges],
    );

    const deleteContact = useCallback(
        async (contactId: number): Promise<boolean> => {
            // Finish any update first; a delayed write must not run after deletion.
            if (!(await flushContactChanges(contactId))) return false;

            try {
                await deleteContactRequest(contactId);
                return reloadContacts();
            } catch (error) {
                setErrorMessage((error as Error).message);
                return false;
            }
        },
        [reloadContacts, flushContactChanges],
    );

    return { contacts, isLoading, errorMessage, changeContact, addContact, editContact, deleteContact };
}
