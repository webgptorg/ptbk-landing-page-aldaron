'use client';
import { useRef, useState, type FormEvent } from 'react';
import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { useAdminEditorClose } from '@/components/admin/AdminEditorContext';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { capabilitiesForPlan, type LicenseCapabilities } from '@/lib/promptbook-licensing/contract';
import { licenseAdminMutationSchema, type AdminLicense } from '@/lib/promptbook-licensing/adminContract';
import { buttonClass, inputClass } from './AdminLicenseShared';

const capacities = { engineProjects: 'Projekty enginu', specialists: 'Odborní agenti', controllingUsers: 'Ovládající uživatelé', harnessInstances: 'Harnessy', browserProfiles: 'Profily prohlížeče' } as const;
const emptyCapabilities: LicenseCapabilities = { engineProjects:0, specialists:0, controllingUsers:0, harnessInstances:0, browserProfiles:0, remoteControl:false };
function localTime(value: string) { const date = new Date(value); return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16); }

export function LicenseGrantEditor(props: { license?: AdminLicense; isTest: boolean; onClose: () => void; onSaved: (id: string) => void }) {
    return <AdminEditorDialog isOpen onClose={props.onClose} title={props.license ? 'Upravit ruční licenci' : 'Vytvořit licenci bez objednávky'}
        description="Přidělení nevytváří objednávku, platbu ani předplatné. Změny stávající licence se ukládají průběžně.">
        <GrantForm {...props}/>
    </AdminEditorDialog>;
}
function GrantForm({ license, isTest, onClose, onSaved }: { license?: AdminLicense; isTest: boolean; onClose: () => void; onSaved: (id: string) => void }) {
    const [draft, setDraft] = useState(() => ({ email: license?.email ?? '', kind: license?.kind === 'partner' ? 'partner' : 'custom',
        label: license?.label ?? 'Business – individuální licence', communitySeats: String(license?.community_seats ?? 10),
        from: localTime(license?.valid_from ?? new Date().toISOString()), until: license?.valid_until ? localTime(license.valid_until) : '',
        reason: license?.reason ?? '', capacities: Object.fromEntries(Object.keys(capacities).map((key) => [key, (license?.capabilities ?? capabilitiesForPlan('business'))[key as keyof typeof capacities]?.toString() ?? ''])),
        remoteControl: license?.capabilities.remoteControl ?? true }));
    const revision = useRef(license?.revision ?? 1);
    const [requestId] = useState(() => crypto.randomUUID());
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const close = useAdminEditorClose(onClose);
    function payload() {
        const capabilities = { remoteControl: draft.remoteControl, ...Object.fromEntries(Object.entries(draft.capacities).map(([key,value]) => [key,value.trim() === '' ? null : Number(value)])) };
        return { action: license ? 'update' : 'grant', ...(license ? { grantId: license.id, revision: revision.current } : { email: draft.email,requestId }),
            kind:draft.kind, label:draft.label, communitySeats:Number(draft.communitySeats), capabilities,
            validFrom: new Date(draft.from).toISOString(), validUntil:draft.until ? new Date(draft.until).toISOString() : null,
            reason:draft.reason, isTest };
    }
    async function save() {
        let body: ReturnType<typeof payload>;
        try { body = payload(); } catch { throw new AdminSaveValidationError('Vyplňte platný začátek a konec platnosti.'); }
        if (!licenseAdminMutationSchema.safeParse(body).success) throw new AdminSaveValidationError('Zkontrolujte důvod, datum a kapacity.');
        const response = await requestAdminJson<{ grantId: string }>('/api/admin/promptbook-licensing', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
        if (license) revision.current += 1;
        return response.grantId;
    }
    const autosave = useAdminAutosave({ value:draft, isEnabled:!!license, onSave:async () => { await save(); return true; } });
    async function create(event: FormEvent) {
        event.preventDefault(); if (busy || license) return; setBusy(true); setError('');
        try { const id = await save(); autosave.acceptDraftValue(); onSaved(id); close(); }
        catch (failure) { setError(failure instanceof Error ? failure.message : 'Licenci nelze vytvořit.'); }
        finally { setBusy(false); }
    }
    function preset(plan: 'start' | 'business' | 'community') {
        const selected = plan === 'community' ? emptyCapabilities : capabilitiesForPlan(plan);
        setDraft((current) => ({ ...current, label:plan === 'community' ? 'Partnerský komunitní přístup' : `${plan === 'business' ? 'Business' : 'Start'} – individuální licence`,
            capacities:Object.fromEntries(Object.keys(capacities).map((key) => [key,selected[key as keyof typeof capacities]?.toString() ?? ''])),
            remoteControl:selected.remoteControl, communitySeats:plan === 'business' ? '10' : '1', kind:plan === 'community' ? 'partner' : 'custom' }));
    }
    return <form ref={autosave.formRef} onSubmit={create} className="space-y-5">
        {isTest && <p className="rounded-lg bg-amber-50 p-3">Testovací prostředí – licence se neprojeví v produkční App.</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <fieldset disabled={busy} className="space-y-5">
            <label className="block text-sm">E-mail účtu<input className={inputClass} type="email" required maxLength={254} value={draft.email} disabled={!!license} onChange={(e) => setDraft({...draft,email:e.target.value})}/></label>
            <div className="flex flex-wrap items-center gap-2"><span className="text-sm">Vyplnit kapacity:</span>{(['start','business','community'] as const).map((plan) => <button key={plan} className={buttonClass} type="button" onClick={() => preset(plan)}>{plan === 'community' ? 'Jen komunita' : plan === 'start' ? 'Start' : 'Business'}</button>)}</div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">Název<input className={inputClass} required maxLength={120} value={draft.label} onChange={(e) => setDraft({...draft,label:e.target.value})}/></label>
                <label className="block text-sm">Druh<select className={inputClass} value={draft.kind} onChange={(e) => setDraft({...draft,kind:e.target.value})}><option value="custom">Individuální</option><option value="partner">Partnerská</option></select></label></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">Platnost od<input className={inputClass} type="datetime-local" required value={draft.from} onChange={(e) => setDraft({...draft,from:e.target.value})}/></label>
                <label className="block text-sm">Platnost do (prázdné = bez konce)<input className={inputClass} type="datetime-local" value={draft.until} onChange={(e) => setDraft({...draft,until:e.target.value})}/></label></div>
            <p className="text-sm text-slate-600">Prázdná číselná kapacita znamená neomezeno; 0 znamená žádnou kapacitu. Časy se zadávají v časovém pásmu vašeho prohlížeče.</p>
            <div className="grid gap-4 sm:grid-cols-2">{Object.entries(capacities).map(([key,label]) => <label className="block text-sm" key={key}>{label}<input className={inputClass} type="number" min={0} max={1000000} step={1} value={draft.capacities[key]} onChange={(e) => setDraft({...draft,capacities:{...draft.capacities,[key]:e.target.value}})}/></label>)}
                <label className="block text-sm">Komunitní místa<input className={inputClass} required type="number" min={0} max={1000} step={1} value={draft.communitySeats} onChange={(e) => setDraft({...draft,communitySeats:e.target.value})}/></label></div>
            <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={draft.remoteControl} onChange={(e) => setDraft({...draft,remoteControl:e.target.checked})}/>Vzdálené ovládání</label>
            <label className="block text-sm">Důvod přidělení / změny<textarea className={inputClass} required minLength={5} maxLength={1000} rows={3} value={draft.reason} onChange={(e) => setDraft({...draft,reason:e.target.value})}/></label>
        </fieldset>
        {license ? <AdminAutosaveStatus {...autosave}/> : <button className={buttonClass+' bg-blue-900 text-white'} type="submit" disabled={busy}>{busy ? 'Vytvářím…' : 'Vytvořit licenci'}</button>}
    </form>;
}
