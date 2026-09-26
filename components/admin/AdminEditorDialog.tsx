'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ADMIN_DRAFT_PROTECTION_SCOPE_CONTEXT, ADMIN_EDITOR_CLOSE_REQUEST_CONTEXT } from '@/components/admin/AdminEditorContext';
import {
    type AdminDraftProtectionScope,
    confirmDiscardPendingAdminDrafts,
    flushAdminSaves,
    getAdminSaveRevision,
    getAdminServerSaveRevision,
    getPendingAdminSaves,
    subscribeToAdminSaves,
} from '@/lib/admin/adminPendingSaves';
import { cn } from '@/lib/utils';
import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';

/** Makes request errors from an administration dashboard visible inside its active editor. */
const ADMIN_EDITOR_ERROR_CONTEXT = createContext<string | null>(null);
export const AdminEditorErrorProvider = ADMIN_EDITOR_ERROR_CONTEXT.Provider;

export type AdminEditorDialogProps = {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    /** An explicit batch can keep its draft visible until every item has reported a result. */
    readonly canClose?: () => boolean;
    readonly title: string;
    readonly description?: string;
    readonly errorMessage?: string | null;
    readonly className?: string;
    readonly children: ReactNode;
};

/** One accessible, scrollable editor shell; every dismissal waits for the existing admin save queue. */
export function AdminEditorDialog(props: AdminEditorDialogProps) {
    return props.isOpen ? <OpenAdminEditorDialog {...props} /> : null;
}

function restoreEditorFocus(opener: HTMLElement | null): void {
    if (opener?.isConnected) {
        opener.focus();
        return;
    }
    // Saving can remove the edited row from the current filter, or delete it altogether.
    const main = document.querySelector('main');
    if (!main) return;
    const previousTabIndex = main.getAttribute('tabindex');
    main.tabIndex = -1;
    main.focus();
    if (previousTabIndex === null) main.removeAttribute('tabindex');
    else main.setAttribute('tabindex', previousTabIndex);
}

function OpenAdminEditorDialog({ onClose, canClose, title, description, errorMessage, className, children }: AdminEditorDialogProps) {
    const dashboardErrorMessage = useContext(ADMIN_EDITOR_ERROR_CONTEXT);
    const parentDraftProtectionScope = useContext(ADMIN_DRAFT_PROTECTION_SCOPE_CONTEXT);
    // Capture before a child's autoFocus runs, including editors opened without a Radix DialogTrigger.
    const openerReference = useRef<HTMLElement | null>(
        typeof document !== 'undefined' && document.activeElement instanceof HTMLElement ? document.activeElement : null,
    );
    const isClosingReference = useRef(false);
    const [draftProtectionScope] = useState<AdminDraftProtectionScope>(() => ({ parent: parentDraftProtectionScope }));
    const [isCloseBlocked, setIsCloseBlocked] = useState(false);
    const [isOperationCloseBlocked, setIsOperationCloseBlocked] = useState(false);
    useSyncExternalStore(subscribeToAdminSaves, getAdminSaveRevision, getAdminServerSaveRevision);
    const pendingDialogSaves = getPendingAdminSaves(draftProtectionScope);
    const isUnsavedNoticeShown = isCloseBlocked && pendingDialogSaves.length > 0;
    const saveError = pendingDialogSaves.find((queue) => queue.getSnapshot().errorMessage !== null)?.getSnapshot();
    useEffect(() => {
        if (pendingDialogSaves.length === 0) setIsCloseBlocked(false);
    }, [pendingDialogSaves.length]);

    const closeEditor = useCallback(async () => {
        if (isClosingReference.current) return;
        if (canClose && !canClose()) {
            setIsOperationCloseBlocked(true);
            return;
        }
        isClosingReference.current = true;
        try {
            if (!(await flushAdminSaves(draftProtectionScope))) {
                setIsCloseBlocked(true);
                return;
            }
            if (canClose && !canClose()) {
                setIsOperationCloseBlocked(true);
                return;
            }
            setIsOperationCloseBlocked(false);
            if (confirmDiscardPendingAdminDrafts(draftProtectionScope)) onClose();
        } finally {
            isClosingReference.current = false;
        }
    }, [canClose, draftProtectionScope, onClose]);
    const requestClose = useCallback(() => { void closeEditor(); }, [closeEditor]);
    const visibleErrorMessage = errorMessage ?? dashboardErrorMessage;

    return (
        <Dialog open onOpenChange={(isNextOpen) => { if (!isNextOpen) requestClose(); }}>
            <DialogContent
                className={cn('max-h-[calc(100dvh-2rem)] max-w-3xl grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden bg-white p-0 text-slate-950', className)}
                closeLabel="Zavřít"
                {...(!description ? { 'aria-describedby': undefined } : {})}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    restoreEditorFocus(openerReference.current);
                }}
                onPointerDownOutside={(event) => event.preventDefault()}
            >
                <DialogHeader className="border-b border-slate-200 px-5 py-4 pr-12 text-left">
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
                    {visibleErrorMessage && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{visibleErrorMessage}</p>}
                    {isUnsavedNoticeShown && <p role="alert" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                        Změny nejsou uložené{saveError?.errorMessage ? `: ${saveError.errorMessage}` : '.'}{' '}
                        {saveError?.errorKind === 'validation'
                            ? 'Opravte vyznačená pole; okno zůstane otevřené.'
                            : 'Použijte opakování u stavu ukládání; okno zůstane otevřené.'}
                    </p>}
                    {isOperationCloseBlocked && canClose && !canClose() && <p role="status" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Probíhá ukládání nebo vytváření. Počkejte na dokončení a potom okno zavřete.</p>}
                    <ADMIN_DRAFT_PROTECTION_SCOPE_CONTEXT.Provider value={draftProtectionScope}>
                        <ADMIN_EDITOR_CLOSE_REQUEST_CONTEXT.Provider value={requestClose}>
                            {children}
                        </ADMIN_EDITOR_CLOSE_REQUEST_CONTEXT.Provider>
                    </ADMIN_DRAFT_PROTECTION_SCOPE_CONTEXT.Provider>
                </div>
            </DialogContent>
        </Dialog>
    );
}
