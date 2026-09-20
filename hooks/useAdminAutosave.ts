'use client';

import { AdminSaveQueue } from '@/lib/admin/AdminSaveQueue';
import { registerAdminSaveQueue } from '@/lib/admin/adminPendingSaves';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

type AdminAutosaveOptions = {
    /** Include raw draft values so an incomplete field still protects the window. */
    readonly value: unknown;
    readonly onSave: () => Promise<boolean>;
    readonly isEnabled?: boolean;
};

/** Shared debounce, validation, save ordering, status and window protection for admin editors. */
export function useAdminAutosave({ value, onSave, isEnabled = true }: AdminAutosaveOptions) {
    const formRef = useRef<HTMLFormElement>(null);
    const serializedValue = JSON.stringify(value);
    const [queue] = useState(() => new AdminSaveQueue(serializedValue));
    const state = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot);

    useLayoutEffect(() => {
        if (!isEnabled) {
            queue.acceptSavedValue(serializedValue);
            return;
        }
        const isFormValid = formRef.current?.checkValidity() ?? true;
        queue.update(serializedValue, async () => {
            if (!isFormValid) {
                throw new Error('Změny nejsou uložené. Zkontrolujte vyplněná pole.');
            }
            return onSave();
        });
    });
    useEffect(() => isEnabled ? registerAdminSaveQueue(queue) : undefined, [isEnabled, queue]);

    const acceptSavedValue = useCallback((savedValue: unknown) => queue.acceptSavedValue(JSON.stringify(savedValue)), [queue]);
    return { ...state, formRef, acceptSavedValue, saveNow: () => queue.flush(true) };
}
