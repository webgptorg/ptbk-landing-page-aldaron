'use client';

import {
    flushAdminSaves, getAdminSaveRevision, getAdminServerSaveRevision, getPendingAdminDrafts, getPendingAdminSaves, hasPendingAdminWork,
    runAfterAdminSaves, subscribeToAdminSaves, flushAdminEditorSaves, confirmDiscardPendingAdminDrafts,
} from '@/lib/admin/adminPendingSaves';
import { STUDIO_PATH } from '@/lib/recording-studio/studioProjectTypes';
import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';

/** Keep ordinary links and sign-out from disposing drafts before the server acknowledges them. */
export function AdminSaveProtection() {
    const router = useRouter();
    useSyncExternalStore(subscribeToAdminSaves, getAdminSaveRevision, getAdminServerSaveRevision);
    const pendingSaves = getPendingAdminSaves();
    const pendingDrafts = getPendingAdminDrafts();
    const isSaveFailed = pendingSaves.some((queue) => queue.getSnapshot().errorKind === 'save');
    const isValidationFailed = pendingSaves.some((queue) => queue.getSnapshot().errorKind === 'validation');
    const isSaveInProgress = pendingSaves.some((queue) => queue.getSnapshot().isSaving);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
            if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || !hasPendingAdminWork()) return;
            const destination = new URL(link.href, window.location.href);
            if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;
            event.preventDefault();
            event.stopPropagation();
            const isStudioSectionChange = link.hasAttribute('data-admin-navigation-preserves-studio') && destination.origin === window.location.origin &&
                window.location.pathname.startsWith(`${STUDIO_PATH}/`) && destination.pathname.startsWith(`${STUDIO_PATH}/`);
            if (isStudioSectionChange) {
                // Capture's explicit operation lasts until Stop. Both sections retain that same mounted owner.
                // Only editor drafts must settle here; waiting for the capture itself would deadlock navigation.
                void flushAdminEditorSaves().then((isSaved) => {
                    if (isSaved && confirmDiscardPendingAdminDrafts()) router.push(`${destination.pathname}${destination.search}${destination.hash}`);
                });
                return;
            }
            void runAfterAdminSaves(() => {
                if (destination.origin === window.location.origin) router.push(`${destination.pathname}${destination.search}${destination.hash}`);
                else window.location.assign(destination.href);
            });
        };
        const handleSubmit = (event: SubmitEvent) => {
            const form = event.target;
            if (!(form instanceof HTMLFormElement) || !form.hasAttribute('action') || !hasPendingAdminWork()) return;
            event.preventDefault();
            event.stopPropagation();
            void runAfterAdminSaves(() => form.submit());
        };
        document.addEventListener('click', handleClick, true);
        document.addEventListener('submit', handleSubmit, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('submit', handleSubmit, true);
        };
    }, [router]);

    if (pendingSaves.length === 0 && pendingDrafts.length === 0) return null;
    return (
        <div role={isSaveFailed ? 'alert' : 'status'} className={`border-b px-6 py-2 text-sm ${isSaveFailed ? 'border-red-200 bg-red-50 text-red-800' : 'border-cyan-100 bg-cyan-50 text-cyan-900'}`}>
            {isSaveFailed
                ? 'Některé změny se nepodařilo uložit. Zkontrolujte připojení nebo zkuste uložení znovu.'
                : isValidationFailed
                    ? 'Některá pole obsahují neplatné hodnoty. Opravte je před odchodem.'
                : pendingSaves.length > 0
                    ? isSaveInProgress ? 'Ukládám změny… Před odchodem počkejte na dokončení.' : 'Čekám na uložení změn…'
                    : 'Rozpracovaný nový záznam zůstává jen jako koncept, dokud nepotvrdíte vytvoření.'}
            {isSaveFailed && <button type="button" className="ml-3 font-medium underline" onClick={() => void flushAdminSaves()}>Zkusit znovu</button>}
        </div>
    );
}
