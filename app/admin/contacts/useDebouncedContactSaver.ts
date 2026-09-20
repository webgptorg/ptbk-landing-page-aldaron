'use client';

import { AdminSaveQueue } from '@/lib/admin/AdminSaveQueue';
import { registerAdminSaveQueue } from '@/lib/admin/adminPendingSaves';
import type { ContactChanges } from '@/lib/contacts/Contact';
import { updateContact } from '@/lib/contacts/contactsApiClient';
import { useCallback, useEffect, useRef } from 'react';

type ContactSaveEntry = {
    readonly queue: AdminSaveQueue;
    readonly unregister: () => void;
    changes: ContactChanges;
};

/** Inline notes and the contact dialog share one ordered queue per contact. */
export function useDebouncedContactSaver(onSaveError: (errorMessage: string | null) => void) {
    const entriesRef = useRef(new Map<number, ContactSaveEntry>());

    useEffect(() => {
        const entries = entriesRef.current;
        return () => {
            entries.forEach((entry) => entry.unregister());
            entries.clear();
        };
    }, []);

    const saveContactChanges = useCallback((contactId: number, changes: ContactChanges) => {
        let entry = entriesRef.current.get(contactId);
        if (entry === undefined) {
            const queue = new AdminSaveQueue('{}');
            entry = { queue, changes: {}, unregister: registerAdminSaveQueue(queue) };
            entriesRef.current.set(contactId, entry);
        }
        const changesToSave = { ...entry.changes, ...changes };
        entry.changes = changesToSave;
        entry.queue.update(JSON.stringify(changesToSave), async () => {
            try {
                await updateContact(contactId, changesToSave);
                onSaveError(null);
                return true;
            } catch (error) {
                onSaveError(error instanceof Error ? error.message : 'Kontakt se nepodařilo uložit.');
                throw error;
            }
        });
    }, [onSaveError]);

    const flushContactChanges = useCallback((contactId: number) =>
        entriesRef.current.get(contactId)?.queue.flush() ?? Promise.resolve(true), []);

    // A list refresh may have started before one of these edits reached the server.
    const getContactChanges = useCallback((contactId: number): ContactChanges =>
        entriesRef.current.get(contactId)?.changes ?? {}, []);

    return { saveContactChanges, flushContactChanges, getContactChanges };
}
