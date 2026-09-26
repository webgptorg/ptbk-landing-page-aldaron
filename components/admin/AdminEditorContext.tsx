'use client';

import { runAfterAdminSaves, type AdminDraftProtectionScope } from '@/lib/admin/adminPendingSaves';
import { createContext, useCallback, useContext } from 'react';

export const ADMIN_DRAFT_PROTECTION_SCOPE_CONTEXT = createContext<AdminDraftProtectionScope | null>(null);

const ADMIN_EDITOR_CLOSE_REQUEST_CONTEXT = createContext<(() => void) | null>(null);

/** Close the active editor through its save and discard protection. */
export function useAdminEditorClose(onClose: () => void): () => void {
    const requestDialogClose = useContext(ADMIN_EDITOR_CLOSE_REQUEST_CONTEXT);
    return useCallback(() => {
        if (requestDialogClose !== null) {
            requestDialogClose();
            return;
        }
        void runAfterAdminSaves(onClose);
    }, [onClose, requestDialogClose]);
}

export { ADMIN_EDITOR_CLOSE_REQUEST_CONTEXT };
