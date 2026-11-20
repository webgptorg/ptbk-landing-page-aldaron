'use client';

import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { KeyRound, Plus, ShieldCheck } from 'lucide-react';
import { AdminEditorDialog } from './AdminEditorDialog';
import { useAdminEditorClose } from './AdminEditorContext';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';
import { API_DOCS_PATH, API_KEYS_ADMIN_ENDPOINT, API_KEYS_ADMIN_PATH, API_SCOPE_DEFINITIONS, apiKeyStatus, type ApiKey } from '@/lib/ecosystem-api/contract';
import { AdminLicenseShell, ReadStatus, PageLinks, useAdminRead, inputClass, buttonClass, formatDate } from './licensing/AdminLicenseShared';

type KeyPage = { items: ApiKey[]; total: number; offset: number; limit: number; legacyConfigured: boolean };
const statusLabels = { active: 'Aktivní', expired: 'Vypršel', revoked: 'Zneplatněný' };

export function ApiKeyAdministration() {
    const params = useSearchParams();
    const result = useAdminRead<KeyPage>(`${API_KEYS_ADMIN_ENDPOINT}?${new URLSearchParams({ offset: params.get('offset') ?? '0' })}`);
    const [creating, setCreating] = useState(false);
    const [revoking, setRevoking] = useState<ApiKey | null>(null);
    return <AdminLicenseShell title="API klíče">
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-6">
            <div className="max-w-2xl space-y-2"><div className="flex items-center gap-2 font-semibold"><KeyRound className="h-5 w-5 text-cyan-700" />Jedno API pro všechny naše weby</div>
                <p className="text-sm leading-6 text-slate-600">Každé integraci vytvořte vlastní klíč a povolte jí jen potřebné funkce. Prvním zdrojem jsou licence Promptbooku.</p>
                <a className="text-sm font-medium text-cyan-800 underline underline-offset-4" href={API_DOCS_PATH} target="_blank" rel="noreferrer">Dokumentace a zkoušení API</a></div>
            <button className={buttonClass+' gap-2 border-cyan-700 bg-cyan-700 text-white'} onClick={() => setCreating(true)}><Plus className="h-4 w-4" />Vytvořit API klíč</button>
        </section>
        <ReadStatus {...result} />
        {result.data && <>
            <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr>
                {['Název / klíč', 'Oprávnění', 'Stav', 'Platnost do', 'Vytvořil', ''].map((label, index) => <th className="p-4 font-medium" key={index}>{label}</th>)}
            </tr></thead><tbody>{result.data.items.map((key) => <tr key={key.id} className="border-b last:border-0">
                <td className="p-4"><span className="font-medium">{key.name}</span><code className="mt-1 block text-slate-500">{key.prefix}…</code></td>
                <td className="p-4">{key.scopes.map((scope) => <span className="block" key={scope}>{API_SCOPE_DEFINITIONS.find((item) => item.id === scope)?.label ?? scope}</span>)}</td>
                <td className="p-4">{statusLabels[apiKeyStatus(key)]}</td><td className="p-4">{formatDate(key.expiresAt)}</td>
                <td className="p-4">{key.createdBy}<span className="block text-slate-500">{formatDate(key.createdAt)}</span>
                    {key.revokedAt && <span className="block text-slate-500">Zneplatnil {key.revokedBy} · {formatDate(key.revokedAt)}</span>}</td>
                <td className="p-4">{!key.revokedAt && <button className={buttonClass+' text-red-700'} onClick={() => setRevoking(key)}>Zneplatnit</button>}</td>
            </tr>)}</tbody></table>{result.data.items.length === 0 && <p className="p-8 text-center text-slate-600">Zatím nebyl vytvořen žádný API klíč.</p>}</div>
            <PageLinks path={API_KEYS_ADMIN_PATH} params={new URLSearchParams(params)} {...result.data} />
            {result.data.legacyConfigured && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Starší licenční integrace stále může používat klíč z konfigurace serveru. Po přechodu integrace na nový klíč jej odpojte odstraněním <code>PROMPTBOOK_APP_LICENSE_SECRET</code> v nastavení nasazení.</p>}
        </>}
        {creating && <CreateKeyDialog onClose={() => setCreating(false)} onCreated={result.refresh} />}
        {revoking && <RevokeKeyDialog apiKey={revoking} onClose={() => setRevoking(null)} onRevoked={result.refresh} />}
    </AdminLicenseShell>;
}

function CreateKeyDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [token, setToken] = useState<string | null>(null);
    return <AdminEditorDialog isOpen onClose={onClose} canClose={() => !busy} title={token ? 'API klíč byl vytvořen' : 'Vytvořit API klíč'}
        description={token ? 'Zkopírujte si jej nyní. Po zavření už celý klíč znovu nezobrazíme.' : 'Název pomůže rozlišit aplikace. Platnost můžete ponechat bez omezení.'} errorMessage={error}>
        {token ? <CreatedKey token={token} onClose={onClose} /> : <form className="space-y-5" onSubmit={async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault(); if (busy) return;
            const form = new FormData(event.currentTarget);
            setBusy(true); setError('');
            try {
                const expiry = String(form.get('expiresAt') ?? '');
                const response = await requestAdminJson<{ token: string }>(API_KEYS_ADMIN_ENDPOINT, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: String(form.get('name')), scopes: form.getAll('scopes'), expiresAt: expiry ? new Date(expiry).toISOString() : null }),
                });
                setToken(response.token); onCreated();
            } catch (failure) { setError(failure instanceof Error ? failure.message : 'Klíč nelze vytvořit.'); }
            finally { setBusy(false); }
        }}><fieldset disabled={busy} className="space-y-5">
            <label className="block text-sm font-medium">Název<input className={inputClass} name="name" placeholder="Například Promptbook App" maxLength={120} required autoFocus autoComplete="off" /></label>
            <fieldset className="space-y-3"><legend className="mb-2 text-sm font-medium">Povolené funkce API</legend>{API_SCOPE_DEFINITIONS.map((scope) => <label key={scope.id} className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4">
                <input type="checkbox" name="scopes" value={scope.id} defaultChecked={scope.id === 'licenses:read'} className="mt-1 h-4 w-4 accent-cyan-700" />
                <span><span className="block text-sm font-medium">{scope.label}</span><span className="mt-1 block text-sm text-slate-500">{scope.description}</span></span>
            </label>)}</fieldset>
            <label className="block text-sm font-medium">Platnost do (volitelné)<input className={inputClass} name="expiresAt" type="datetime-local" /></label>
            <p className="flex gap-2 text-sm leading-6 text-slate-600"><ShieldCheck className="mt-1 h-4 w-4 shrink-0" />Klíč vložte do konfigurace backendu integrace. Pro ruční test jej můžete dočasně zadat v dokumentaci API.</p>
            <button className={buttonClass} disabled={busy}>{busy ? 'Vytvářím…' : 'Vytvořit API klíč'}</button>
        </fieldset></form>}
    </AdminEditorDialog>;
}

function CreatedKey({ token, onClose }: { token: string; onClose: () => void }) {
    const { copyText, copyStatus } = useCopyTextToClipboard();
    const close = useAdminEditorClose(onClose);
    return <div className="space-y-4"><label className="block text-sm font-medium">Váš nový API klíč<input className={inputClass+' font-mono'} value={token} readOnly autoComplete="off" spellCheck={false} onFocus={(event) => event.currentTarget.select()} /></label>
        <div className="flex flex-wrap gap-3"><button className={buttonClass} onClick={() => void copyText(token)}>{copyStatus === 'copied' ? 'Zkopírováno' : 'Zkopírovat klíč'}</button>
            <button className={buttonClass} onClick={() => void close()}>Hotovo</button></div>
        {copyStatus === 'failed' && <p role="alert" className="text-sm text-red-700">Kopírování se nezdařilo. Označte a zkopírujte klíč ručně.</p>}
    </div>;
}

function RevokeKeyDialog({ apiKey, onClose, onRevoked }: { apiKey: ApiKey; onClose: () => void; onRevoked: () => void }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    return <AdminEditorDialog isOpen onClose={onClose} canClose={() => !busy} title="Zneplatnit API klíč" description={`Klíč „${apiKey.name}“ přestane fungovat pro všechny další požadavky. Tuto akci nelze vrátit.`} errorMessage={error}>
        <RevokeKeyButton id={apiKey.id} busy={busy} setBusy={setBusy} setError={setError} onClose={onClose} onRevoked={onRevoked} />
    </AdminEditorDialog>;
}

function RevokeKeyButton({ id, busy, setBusy, setError, onClose, onRevoked }: { id: string; busy: boolean; setBusy: (value: boolean) => void; setError: (value: string) => void; onClose: () => void; onRevoked: () => void }) {
    const close = useAdminEditorClose(onClose);
    return <button className={buttonClass+' text-red-700'} disabled={busy} onClick={async () => {
        if (busy) return; setBusy(true); setError('');
        try { await requestAdminJson(`${API_KEYS_ADMIN_ENDPOINT}/${id}`, { method: 'DELETE' }); setBusy(false); onRevoked(); void close(); }
        catch (failure) { setError(failure instanceof Error ? failure.message : 'Klíč nelze zneplatnit.'); }
        finally { setBusy(false); }
    }}>{busy ? 'Zneplatňuji…' : 'Zneplatnit klíč'}</button>;
}
