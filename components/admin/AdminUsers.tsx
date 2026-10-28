'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminEditorDialog } from './AdminEditorDialog';
import { AdminUserForm } from './AdminUserForm';
import { ADMIN_PERMISSION_DEFINITIONS } from '@/lib/admin/adminPermissions';
import { ADMIN_USERS_API_PATH, type AdminUser } from '@/lib/admin/adminUserSchemas';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

export function AdminUsers({ initialUsers }: { readonly initialUsers: readonly AdminUser[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [editor, setEditor] = useState<AdminUser | 'new' | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    function acceptUser(user: AdminUser) {
        setUsers((current) => [...current.filter((item) => item.id !== user.id), user].sort((a, b) => a.username.localeCompare(b.username)));
    }
    async function deleteUser(user: AdminUser) {
        if (deletingId || !window.confirm(`Trvale smazat administrátora ${user.username}? Jeho přihlášení přestane fungovat.`)) return;
        setDeletingId(user.id);
        setError(null);
        try {
            await requestAdminJson(`${ADMIN_USERS_API_PATH}/${user.id}`, { method: 'DELETE' });
            setUsers((current) => current.filter((item) => item.id !== user.id));
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'Účet se nepodařilo smazat.'); }
        finally { setDeletingId(null); }
    }
    return <>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="text-2xl font-bold text-slate-950">Administrátoři</h2><p className="mt-2 text-sm text-slate-600">Každému účtu povolte jen sekce, které má spravovat.</p></div>
            <Button onClick={() => void runAfterAdminSaves(() => setEditor('new'))}>Nový administrátor</Button>
        </div>
        <div className="mb-5 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950"><strong>admin · Superadmin</strong><p className="mt-1">Účet nastavený na serveru má vždy plný přístup. Zde ho nelze změnit ani smazat.</p></div>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="space-y-3">
            {users.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Zatím nejsou vytvoření další administrátoři.</p>}
            {users.map((user) => <article key={user.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="min-w-0 flex-1"><h3 className="break-words font-semibold text-slate-950">{user.username} <span className={`ml-2 text-xs font-normal ${user.isEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>{user.isEnabled ? 'Aktivní' : 'Vypnutý'}</span></h3>
                    <p className="mt-2 text-sm text-slate-500">{ADMIN_PERMISSION_DEFINITIONS.filter((item) => user.permissions.includes(item.id)).map((item) => item.label).join(', ') || 'Žádné povolené sekce'}</p>
                </div>
                <div className="flex gap-2"><Button variant="outline" onClick={() => void runAfterAdminSaves(() => setEditor(user))}>Upravit</Button><Button variant="outline" disabled={deletingId !== null} onClick={() => void runAfterAdminSaves(() => deleteUser(user))}>{deletingId === user.id ? 'Mažu…' : 'Smazat'}</Button></div>
            </article>)}
        </div>
        <AdminEditorDialog isOpen={editor !== null} onClose={() => setEditor(null)} canClose={() => !isBusy} title={editor === 'new' ? 'Nový administrátor' : 'Upravit administrátora'} description="Přístup do jednotlivých sekcí platí i pro přímé požadavky na server.">
            {editor !== null && <AdminUserForm key={editor === 'new' ? 'new' : editor.id} user={editor === 'new' ? null : editor} onSaved={acceptUser} onCreated={() => setEditor(null)} onBusyChange={setIsBusy} />}
        </AdminEditorDialog>
    </>;
}
