'use client';

import type { AdminSaveState } from '@/lib/admin/AdminSaveQueue';

type AdminAutosaveStatusProps = AdminSaveState & { readonly saveNow: () => Promise<boolean> };

export function AdminAutosaveStatus({ isDirty, isSaving, errorMessage, saveNow }: AdminAutosaveStatusProps) {
    return (
        <div className="text-sm text-slate-500" role={errorMessage ? 'alert' : 'status'} aria-live="polite">
            {errorMessage ? (
                <span className="text-red-700">
                    {errorMessage}{' '}
                    <button type="button" className="font-medium underline" disabled={isSaving} onClick={() => void saveNow()}>
                        Zkusit znovu
                    </button>
                </span>
            ) : isSaving ? 'Ukládám změny…' : isDirty ? 'Čeká na uložení…' : 'Změny se ukládají automaticky.'}
        </div>
    );
}
