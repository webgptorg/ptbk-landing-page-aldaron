'use client';

import { useState, useRef, type FormEvent } from 'react';
import { AdminAutosaveStatus } from './AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { ADMIN_PERMISSION_DEFINITIONS, ADMIN_SHORTENER_PERMISSION_DEFINITIONS, expandAdminPermissions, type AdminPermission } from '@/lib/admin/adminPermissions';
import { ADMIN_USERS_API_PATH, adminUserCreateSchema, adminUserUpdateSchema, type AdminUser } from '@/lib/admin/adminUserSchemas';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AdminUserFormProps = {
    readonly user: AdminUser | null;
    readonly onSaved: (user: AdminUser) => void;
    readonly onCreated: () => void;
    readonly onBusyChange: (isBusy: boolean) => void;
};

/** Profile and access edits share the existing autosave queue. Password changes require an explicit submit. */
export function AdminUserForm({ user, onSaved, onCreated, onBusyChange }: AdminUserFormProps) {
    const [username, setUsername] = useState(user?.username ?? '');
    const [permissions, setPermissions] = useState<readonly AdminPermission[]>(() => expandAdminPermissions(user?.permissions ?? []));
    const [isEnabled, setIsEnabled] = useState(user?.isEnabled ?? true);
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const isCreatingReference = useRef(false);
    const draft = { username, permissions, isEnabled, ...(user ? {} : { password }) };
    const autosave = useAdminAutosave({ value: draft, isEnabled: user !== null, onSave: async () => {
        const parsed = adminUserUpdateSchema.safeParse(draft);
        if (!parsed.success) throw new AdminSaveValidationError(parsed.error.issues[0]?.message ?? 'Opravte údaje účtu.');
        try {
            const result = await requestAdminJson<{ user: AdminUser }>(`${ADMIN_USERS_API_PATH}/${user!.id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data),
            });
            onSaved(result.user);
            setError(null);
            return true;
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Účet se nepodařilo uložit.');
            return false;
        }
    } });

    async function createUser(event: FormEvent) {
        event.preventDefault();
        if (user || isCreatingReference.current) return;
        const parsed = adminUserCreateSchema.safeParse(draft);
        if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Opravte údaje účtu.'); return; }
        isCreatingReference.current = true;
        setIsCreating(true);
        onBusyChange(true);
        try {
            const result = await requestAdminJson<{ user: AdminUser }>(ADMIN_USERS_API_PATH, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data),
            });
            autosave.acceptDraftValue(draft);
            onSaved(result.user);
            onCreated();
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Účet se nepodařilo vytvořit.');
        } finally {
            isCreatingReference.current = false;
            setIsCreating(false);
            onBusyChange(false);
        }
    }

    return <div className="space-y-6">
        <form ref={autosave.formRef} onSubmit={user ? (event) => { event.preventDefault(); void autosave.saveNow(); } : createUser} className="space-y-5">
            <fieldset disabled={isCreating} className="space-y-5">
                <label className="block text-sm font-medium">Uživatelské jméno
                    <Input name="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} minLength={3} maxLength={64} required className="mt-2" />
                    <span className="mt-1 block text-xs font-normal text-slate-500">3–64 znaků: a–z, číslice, tečka, pomlčka nebo podtržítko.</span>
                </label>
                {!user && <label className="block text-sm font-medium">Heslo
                    <Input name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={256} required className="mt-2" />
                    <span className="mt-1 block text-xs font-normal text-slate-500">Alespoň 12 znaků. Předejte ho uživateli bezpečnou cestou.</span>
                </label>}
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={isEnabled} onChange={(event) => setIsEnabled(event.target.checked)} className="h-4 w-4 accent-cyan-600" />Účet je aktivní</label>
                <fieldset>
                    <legend className="text-sm font-semibold">Povolené sekce</legend>
                    <p className="mt-1 text-sm text-slate-500">Uživatel může spravovat pouze vybrané sekce. Správa administrátorů zůstává superadminovi.</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {ADMIN_PERMISSION_DEFINITIONS.filter((definition) => definition.id !== 'shortener').map((definition) => <label key={definition.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                            <input type="checkbox" checked={permissions.includes(definition.id)} onChange={(event) => setPermissions((current) => event.target.checked ? [...current, definition.id] : current.filter((value) => value !== definition.id))} className="h-4 w-4 accent-cyan-600" />
                            {definition.label}
                        </label>)}
                    </div>
                    <fieldset className="mt-3 rounded-lg border border-slate-200 p-3">
                        <legend className="px-1 text-sm font-semibold">Zkracovač odkazů</legend>
                        <label className="flex items-center gap-3 text-sm">
                            <input type="checkbox" className="h-4 w-4 accent-cyan-600"
                                checked={ADMIN_SHORTENER_PERMISSION_DEFINITIONS.every((item) => permissions.includes(item.id))}
                                onChange={(event) => setPermissions((current) => [
                                    ...current.filter((value) => value !== 'shortener' && !value.startsWith('shortener:')),
                                    ...(event.target.checked ? ADMIN_SHORTENER_PERMISSION_DEFINITIONS.map((item) => item.id) : []),
                                ])} />Plný přístup ke zkracovači
                        </label>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {ADMIN_SHORTENER_PERMISSION_DEFINITIONS.map((definition) => <label key={definition.id} className="flex items-center gap-3 text-sm">
                                <input type="checkbox" checked={permissions.includes(definition.id)} onChange={(event) => setPermissions((current) => event.target.checked ? [...current, definition.id] : current.filter((value) => value !== definition.id))} className="h-4 w-4 accent-cyan-600" />
                                {definition.label}
                            </label>)}
                        </div>
                        <p className="mt-3 text-xs text-slate-500">Každá povolená akce zahrnuje zobrazení seznamu odkazů. Historie kliknutí se povoluje samostatně.</p>
                    </fieldset>
                    {permissions.length === 0 && <p className="mt-2 text-xs text-slate-500">Bez povolených sekcí bude dostupný pouze prázdný dashboard.</p>}
                </fieldset>
            </fieldset>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {user ? <AdminAutosaveStatus {...autosave} /> : <Button type="submit" disabled={isCreating}>{isCreating ? 'Vytvářím…' : 'Vytvořit administrátora'}</Button>}
        </form>
        {user && <AdminUserPasswordForm user={user} onBusyChange={onBusyChange} />}
    </div>;
}

function AdminUserPasswordForm({ user, onBusyChange }: { readonly user: AdminUser; readonly onBusyChange: (isBusy: boolean) => void }) {
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isSavingReference = useRef(false);
    // Protect a password draft without ever autosaving it or including it in a URL.
    const draftProtection = useAdminDraftProtection(password);
    async function resetPassword(event: FormEvent) {
        event.preventDefault();
        if (isSavingReference.current) return;
        isSavingReference.current = true;
        setIsSaving(true);
        onBusyChange(true);
        setError(null);
        setMessage(null);
        try {
            await requestAdminJson(`${ADMIN_USERS_API_PATH}/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
            draftProtection.acceptDraftValue('');
            setPassword('');
            setMessage('Heslo bylo změněno. Uživatel se musí znovu přihlásit.');
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'Heslo se nepodařilo změnit.'); }
        finally { isSavingReference.current = false; setIsSaving(false); onBusyChange(false); }
    }
    return <form onSubmit={resetPassword} className="space-y-3 border-t border-slate-200 pt-5">
        <label className="block text-sm font-medium">Nové heslo
            <Input type="password" name="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setMessage(null); }} autoComplete="new-password" minLength={12} maxLength={256} required disabled={isSaving} className="mt-2" />
        </label>
        <p className="text-xs text-slate-500">Alespoň 12 znaků. Změna hesla odhlásí všechny relace tohoto účtu.</p>
        <Button type="submit" variant="outline" disabled={isSaving}>{isSaving ? 'Měním heslo…' : 'Změnit heslo'}</Button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
    </form>;
}
