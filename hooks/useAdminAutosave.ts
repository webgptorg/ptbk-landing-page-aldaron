'use client';

import { AdminSaveQueue, AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { registerAdminSaveQueue } from '@/lib/admin/adminPendingSaves';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { ADMIN_DRAFT_PROTECTION_SCOPE_CONTEXT } from '@/components/admin/AdminEditorContext';
import { useCallback, useContext, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

type AdminAutosaveOptions = {
    /** Include raw draft values so an incomplete field still protects the window. */
    readonly value: unknown;
    readonly onSave: () => Promise<boolean>;
    readonly isEnabled?: boolean;
};

/** Shared debounce, validation, save ordering, status and window protection for admin editors. */
export function useAdminAutosave({ value, onSave, isEnabled = true }: AdminAutosaveOptions) {
    const formRef = useRef<HTMLFormElement>(null);
    const scope = useContext(ADMIN_DRAFT_PROTECTION_SCOPE_CONTEXT);
    const serializedValue = JSON.stringify(value) ?? 'undefined';
    const [queue] = useState(() => new AdminSaveQueue(serializedValue));
    const state = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot);
    const draftProtection = useAdminDraftProtection(serializedValue, !isEnabled);

    useLayoutEffect(() => {
        if (!isEnabled) {
            queue.acceptSavedValue(serializedValue);
            return;
        }
        const isFormValid = formRef.current?.checkValidity() ?? true;
        queue.update(serializedValue, async () => {
            if (!isFormValid) {
                throw new AdminSaveValidationError('Opravte vyznačená pole před uložením změn.');
            }
            return onSave();
        });
    });
    useLayoutEffect(() => isEnabled ? registerAdminSaveQueue(queue, scope) : undefined, [isEnabled, queue, scope]);

    const acceptSavedValue = useCallback((savedValue: unknown) => queue.acceptSavedValue(JSON.stringify(savedValue) ?? 'undefined'), [queue]);
    const acceptDraftValue = useCallback((savedValue?: unknown) => {
        draftProtection.acceptDraftValue(savedValue === undefined ? undefined : JSON.stringify(savedValue) ?? 'undefined');
    }, [draftProtection.acceptDraftValue]);
    return { ...state, formRef, acceptSavedValue, acceptDraftValue, saveNow: () => queue.flush(true) };
}
