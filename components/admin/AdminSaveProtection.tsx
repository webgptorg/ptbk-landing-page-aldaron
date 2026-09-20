'use client';

import {
    flushAdminSaves, getAdminSaveRevision, getAdminServerSaveRevision, getPendingAdminSaves,
    runAfterAdminSaves, subscribeToAdminSaves,
} from '@/lib/admin/adminPendingSaves';
import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';

/** Keep ordinary links and sign-out from disposing drafts before the server acknowledges them. */
export function AdminSaveProtection() {
    const router = useRouter();
    useSyncExternalStore(subscribeToAdminSaves, getAdminSaveRevision, getAdminServerSaveRevision);
    const pendingSaves = getPendingAdminSaves();
    const isSaveFailed = pendingSaves.some((queue) => queue.getSnapshot().errorMessage !== null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
            if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || getPendingAdminSaves().length === 0) return;
            const destination = new URL(link.href, window.location.href);
            if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;
            event.preventDefault();
            event.stopPropagation();
            void runAfterAdminSaves(() => {
                if (destination.origin === window.location.origin) router.push(`${destination.pathname}${destination.search}${destination.hash}`);
                else window.location.assign(destination.href);
            });
        };
        const handleSubmit = (event: SubmitEvent) => {
            const form = event.target;
            if (!(form instanceof HTMLFormElement) || !form.hasAttribute('action') || getPendingAdminSaves().length === 0) return;
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

    if (pendingSaves.length === 0) return null;
    return (
        <div role={isSaveFailed ? 'alert' : 'status'} className={`border-b px-6 py-2 text-sm ${isSaveFailed ? 'border-red-200 bg-red-50 text-red-800' : 'border-cyan-100 bg-cyan-50 text-cyan-900'}`}>
            {isSaveFailed ? 'Některé změny nejsou uložené. Opravte pole nebo zkuste uložení znovu.' : 'Ukládám změny… Před odchodem počkejte na dokončení.'}
            {isSaveFailed && <button type="button" className="ml-3 font-medium underline" onClick={() => void flushAdminSaves()}>Zkusit znovu</button>}
        </div>
    );
}
