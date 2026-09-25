'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { flushAdminSaves, getAdminSaveRevision, getAdminServerSaveRevision, getPendingAdminSaves, subscribeToAdminSaves } from '@/lib/admin/adminPendingSaves';
import { cn } from '@/lib/utils';
import { createContext, useContext, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';

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
    // Capture before a child's autoFocus runs, including editors opened without a Radix DialogTrigger.
    const openerReference = useRef<HTMLElement | null>(
        typeof document !== 'undefined' && document.activeElement instanceof HTMLElement ? document.activeElement : null,
    );
    const isClosingReference = useRef(false);
    const [isCloseBlocked, setIsCloseBlocked] = useState(false);
    useSyncExternalStore(subscribeToAdminSaves, getAdminSaveRevision, getAdminServerSaveRevision);
    const isUnsavedNoticeShown = isCloseBlocked && getPendingAdminSaves().length > 0;

    const closeEditor = async () => {
        if (isClosingReference.current || (canClose && !canClose())) return;
        isClosingReference.current = true;
        try {
            if (await flushAdminSaves() && (!canClose || canClose())) onClose();
            else setIsCloseBlocked(true);
        } finally {
            isClosingReference.current = false;
        }
    };
    const visibleErrorMessage = errorMessage ?? dashboardErrorMessage;

    return (
        <Dialog open onOpenChange={(isNextOpen) => { if (!isNextOpen) void closeEditor(); }}>
            <DialogContent
                className={cn('max-h-[calc(100dvh-2rem)] max-w-3xl grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden bg-white p-0 text-slate-950', className)}
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
                    {isUnsavedNoticeShown && <p role="alert" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Změny ještě nejsou uložené. Opravte pole nebo zkuste uložení znovu a poté zavřete okno.</p>}
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
