'use client';

import { registerAdminDraftProtection, updateAdminDraftProtection } from '@/lib/admin/adminPendingSaves';
import { ADMIN_DRAFT_PROTECTION_SCOPE_CONTEXT } from '@/components/admin/AdminEditorContext';
import { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';

function serializeDraft(value: unknown): string {
    return JSON.stringify(value) ?? 'undefined';
}

/** Tracks an unsubmitted creation draft for unload and controlled-navigation protection only. */
export function useAdminDraftProtection(value: unknown, isEnabled = true) {
    const serializedValue = serializeDraft(value);
    const scope = useContext(ADMIN_DRAFT_PROTECTION_SCOPE_CONTEXT);
    const [token] = useState<object>(() => ({}));
    const initialValueReference = useRef(serializedValue);
    const currentValueReference = useRef(serializedValue);
    currentValueReference.current = serializedValue;

    const isDirty = isEnabled && serializedValue !== initialValueReference.current;

    useLayoutEffect(() => registerAdminDraftProtection(token, scope), [scope, token]);
    useLayoutEffect(() => updateAdminDraftProtection(token, isDirty), [isDirty, token]);

    const acceptDraftValue = useCallback((savedValue?: unknown) => {
        initialValueReference.current = savedValue === undefined
            ? currentValueReference.current
            : serializeDraft(savedValue);
        updateAdminDraftProtection(token, false);
    }, [token]);

    return { isDraftDirty: isDirty, acceptDraftValue };
}
