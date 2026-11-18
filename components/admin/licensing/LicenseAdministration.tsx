'use client';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import { useAdminEditorClose } from '@/components/admin/AdminEditorContext';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { licenseAdminHref, subscriptionAdminHref, LICENSE_STATE_LABELS,
    type AdminLicense, type AdminLicenseDetail, type AdminPage } from '@/lib/promptbook-licensing/adminContract';
import { LicenseGrantEditor } from './LicenseGrantEditor';
import { AdminLicenseShell, LicenseRows, SubscriptionRows, ReadStatus, PageLinks, useAdminRead, inputClass, buttonClass, linkClass, formatDate } from './AdminLicenseShared';

export function LicenseAdministration() {
    const params = useSearchParams();
    const [creating, setCreating] = useState(false);
    const [reload, setReload] = useState(0);
    const isTest = params.get('mode') === 'test';
    return <AdminLicenseShell title="Licence a komunitní oprávnění">
        {params.has('grant') ? <LicenseDetail key={params.toString()} params={new URLSearchParams(params)}/> : <>
            <div className="flex flex-wrap items-center justify-between gap-4"><p className="max-w-2xl text-sm text-slate-600">Licence z nákupů, zkoušky i samostatná ruční přidělení. Ruční licence vzniká přímo bez objednávky.</p>
                <button className={buttonClass} onClick={() => setCreating(true)}>Vytvořit licenci</button></div>
            <form method="GET" className="flex flex-wrap items-end gap-4">
                <label className="min-w-52 grow text-sm">Hledat podle e-mailu<input className={inputClass} name="q" defaultValue={params.get('q') ?? params.get('email') ?? ''} maxLength={254}/></label>
                <label className="text-sm">Stav<select className={inputClass} name="state" defaultValue={params.get('state') ?? 'all'}><option value="all">Všechny stavy</option>{Object.entries(LICENSE_STATE_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="text-sm">Prostředí<select className={inputClass} name="mode" defaultValue={isTest ? 'test' : 'live'}><option value="live">Produkční</option><option value="test">Testovací</option></select></label>
                <button className={buttonClass}>Filtrovat</button>
            </form>
            <LicenseList key={params.toString()+reload} params={new URLSearchParams(params)}/>
        </>}
        {creating && <LicenseGrantEditor isTest={isTest} onClose={() => setCreating(false)} onSaved={() => { setReload((n) => n+1); }}/>} 
    </AdminLicenseShell>;
}
function LicenseList({ params }: { params: URLSearchParams }) {
    const result = useAdminRead<AdminPage<AdminLicense>>(`/api/admin/promptbook-licensing?${params}`);
    return <><ReadStatus {...result}/>{result.data && <><LicenseRows items={result.data.items}/><PageLinks path="/admin/promptbook-licensing" params={params} {...result.data}/></>}</>;
}
function LicenseDetail({ params }: { params: URLSearchParams }) {
    const result = useAdminRead<AdminLicenseDetail>(`/api/admin/promptbook-licensing?${params}`);
    const [editing, setEditing] = useState(false);
    const [action, setAction] = useState<'revoke'|'restore'|'delete'|null>(null);
    const [referral, setReferral] = useState(false);
    const detail = result.data;
    const license = detail?.license;
    const paired = detail?.subscriptions.filter((s) => s.product === 'promptbook' && s.id === license?.order_id) ?? [];
    const others = detail?.subscriptions.filter((s) => !(s.product === 'promptbook' && s.id === license?.order_id)) ?? [];
    const editable = license && license.source === 'manual' && license.kind !== 'trial' && !license.deleted_at;
    return <>
        <Link className={linkClass} href={`/admin/promptbook-licensing?mode=${params.get('mode') ?? 'live'}`}>Všechny licence</Link>
        <ReadStatus {...result}/>
        {license && detail && <>
            <section className="space-y-5 rounded-xl border border-slate-200 p-5"><div className="flex flex-wrap items-center justify-between gap-4">
                <div><h2 className="text-xl font-semibold">{license.label}</h2><p>{license.email} · {LICENSE_STATE_LABELS[license.state]}{license.is_test ? ' · Test' : ''}</p></div>
                {editable && <div className="flex flex-wrap gap-2"><button className={buttonClass} onClick={() => setEditing(true)}>Upravit</button>
                    <button className={buttonClass} onClick={() => setAction(license.revoked_at ? 'restore' : 'revoke')}>{license.revoked_at ? 'Aktivovat' : 'Deaktivovat'}</button>
                    <button className={buttonClass+' text-red-700'} onClick={() => setAction('delete')}>Odstranit</button></div>}</div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Platnost</dt><dd>{formatDate(license.valid_from)} – {formatDate(license.valid_until)}</dd></div>
                    <div><dt className="text-slate-500">Zdroj</dt><dd>{license.source === 'subscription' ? 'Potvrzený nákup' : license.kind === 'trial' ? 'Výslovně aktivovaná zkouška' : 'Ručně přiděleno bez objednávky a platby'}</dd></div>
                    <div><dt className="text-slate-500">Důvod</dt><dd>{license.reason}</dd></div><div><dt className="text-slate-500">ID licence</dt><dd className="break-all">{license.id}</dd></div>
                </dl>
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">{Object.entries({ engineProjects:'Projekty', specialists:'Odborní agenti', controllingUsers:'Ovládající uživatelé', harnessInstances:'Harnessy', browserProfiles:'Profily prohlížeče', remoteControl:'Vzdálené ovládání' }).map(([key,label]) => {
                    const value = license.capabilities[key as keyof typeof license.capabilities]; return <div key={key}><dt className="text-slate-500">{label}</dt><dd>{value === null ? 'Neomezeno' : typeof value === 'boolean' ? value ? 'Ano' : 'Ne' : value}</dd></div>;
                })}<div><dt className="text-slate-500">Komunitní místa</dt><dd>{license.community_seats}</dd></div></dl>
            </section>
            <section className="space-y-3"><h2 className="text-lg font-semibold">Spárovaná objednávka, předplatné a platby</h2>
                {paired.length ? <SubscriptionRows items={paired}/> : <p className="text-sm text-slate-600">Tato licence nemá spárovanou objednávku, platbu ani předplatné.</p>}
                {paired.map((s) => <Link className={linkClass+' block text-sm'} key={s.id} href={subscriptionAdminHref(s)}>Otevřít historii plateb a objednávku</Link>)}
            </section>
            {others.length > 0 && <section className="space-y-3"><h2 className="text-lg font-semibold">Další nákupy stejného účtu</h2><SubscriptionRows items={others}/></section>}
            {detail.subscriptionsHasMore && <Link className={linkClass} href={`/admin/promptbook-subscriptions?${new URLSearchParams({q:license.email,mode:license.is_test ? 'test' : 'live'})}`}>Všechny nákupy tohoto účtu</Link>}
            <section className="space-y-3"><h2 className="text-lg font-semibold">Historie změn</h2>
                {detail.history.length ? <ol className="space-y-3 text-sm">{detail.history.map((entry) => <li className="border-l-2 border-slate-200 pl-4" key={entry.id}><p>{formatDate(entry.created_at)} · {entry.actor} · {({ grant:'Vytvoření', update:'Úprava', revoke:'Deaktivace', restore:'Aktivace', delete:'Odstranění' } as Record<string,string>)[entry.action] ?? entry.action}</p><p className="text-slate-600">{entry.reason}</p></li>)}</ol> : <p className="text-sm text-slate-600">Zatím nejsou zaznamenané žádné administrátorské změny.</p>}
                {detail.historyHasMore && <p className="text-sm">Zobrazeno posledních 100 změn. Starší záznamy zůstávají v evidenci.</p>}
            </section>
            {detail.account && <section className="space-y-3"><h2 className="text-lg font-semibold">Doporučení</h2><p className="text-sm">{detail.account.referral_code ?? 'Neuvedeno'}</p><button className={buttonClass} onClick={() => setReferral(true)}>Opravit doporučení</button>
                {detail.referralHistory.map((entry) => <p className="text-sm text-slate-600" key={entry.id}>{formatDate(entry.created_at)} · {entry.code ?? 'Bez kódu'} · {entry.reason}</p>)}
            </section>}
            {editing && <LicenseGrantEditor key={license.id} license={license} isTest={license.is_test} onClose={() => { setEditing(false); result.refresh(); }} onSaved={() => {}}/>}
            {action && <GrantActionDialog license={license} action={action} onClose={() => setAction(null)} onSaved={() => result.refresh()}/>}
            {referral && detail.account && <ReferralDialog accountId={detail.account.id} code={detail.account.referral_code ?? ''} onClose={() => setReferral(false)} onSaved={() => result.refresh()}/>}
        </>}
    </>;
}
function GrantActionDialog({ license, action, onClose, onSaved }: { license: AdminLicense; action:'revoke'|'restore'|'delete'; onClose:() => void; onSaved:() => void }) {
    const [busy,setBusy] = useState(false);
    const title = action === 'restore' ? 'Aktivovat licenci' : action === 'revoke' ? 'Deaktivovat licenci' : 'Odstranit licenci';
    return <AdminEditorDialog isOpen onClose={onClose} canClose={() => !busy} title={title} description={action === 'restore' ? 'Obnoví oprávnění v původní platnosti. Datum expirace zůstane zachované.' : 'Oprávnění přestane platit; záznam i historie zůstanou dohledatelné.'}>
        <ExplicitAction action={{ action,grantId:license.id,revision:license.revision,isTest:license.is_test }} title={title} onSaved={onSaved} onClose={onClose} setBusy={setBusy}/>
    </AdminEditorDialog>;
}
function ReferralDialog({ accountId, code, onClose, onSaved }: { accountId:string; code:string; onClose:() => void; onSaved:() => void }) {
    const [busy,setBusy] = useState(false);
    return <AdminEditorDialog isOpen onClose={onClose} canClose={() => !busy} title="Opravit doporučení"><ExplicitAction action={{action:'referral',accountId}} title="Uložit opravu" onSaved={onSaved} onClose={onClose} setBusy={setBusy}>
        <label className="block text-sm">Kód<input className={inputClass} name="code" maxLength={80} pattern="[A-Za-z0-9_-]*" defaultValue={code}/></label>
    </ExplicitAction></AdminEditorDialog>;
}
function ExplicitAction({ action,title,onSaved,onClose,setBusy,children }: { action:Record<string,unknown>; title:string; onSaved:() => void; onClose:() => void; setBusy:(value:boolean) => void; children?:React.ReactNode }) {
    const [pending,setPending] = useState(false); const [error,setError] = useState(''); const close=useAdminEditorClose(onClose);
    async function submit(event:FormEvent<HTMLFormElement>) {
        event.preventDefault(); if(pending) return; const form=new FormData(event.currentTarget);setPending(true);setBusy(true);setError('');
        try { await requestAdminJson('/api/admin/promptbook-licensing',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...action,reason:String(form.get('reason')),...(action.action === 'referral' ? {code:String(form.get('code'))} : {})})});
            setBusy(false);onSaved();close();
        } catch(failure) {setError(failure instanceof Error ? failure.message : 'Změnu nelze uložit.');} finally{setPending(false);setBusy(false);}
    }
    return <form onSubmit={submit} className="space-y-4">{error && <p role="alert" className="text-red-700">{error}</p>}<fieldset disabled={pending} className="space-y-4">{children}
        <label className="block text-sm">Důvod<textarea className={inputClass} name="reason" minLength={5} maxLength={1000} required rows={3}/></label><button className={buttonClass} disabled={pending}>{pending ? 'Ukládám…' : title}</button></fieldset></form>;
}
