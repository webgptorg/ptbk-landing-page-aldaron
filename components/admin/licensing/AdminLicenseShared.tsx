'use client';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { useCanAccessAdminPath } from '@/components/admin/AdminAccessProvider';
import { API_DOCS_PATH, API_OPENAPI_PATH } from '@/lib/ecosystem-api/contract';
import { licenseAdminHref, subscriptionAdminHref, LICENSE_STATE_LABELS, SUBSCRIPTION_PRODUCT_LABELS, stripeObjectUrl,
    type AdminLicense, type AdminSubscription } from '@/lib/promptbook-licensing/adminContract';

export const inputClass = 'mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base';
export const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-50';
export const linkClass = 'text-blue-800 underline underline-offset-2';
export function formatDate(value: string | null) { return value ? new Date(value).toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' }) : 'Bez omezení'; }
export function money(amount: number, currency: string) { return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: currency.toUpperCase() }).format(amount/100); }

export function useAdminRead<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setError(''); setData(null);
        void requestAdminJson<T>(url, { signal: controller.signal }).then((value) => {
            if (!controller.signal.aborted) setData(value);
        }).catch((failure: unknown) => {
            if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Evidenci nelze načíst.');
        }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [url, revision]);
    return { data, loading, error, refresh: () => setRevision((value) => value+1) };
}
export function ReadStatus({ loading, error, refresh }: { loading: boolean; error: string; refresh: () => void }) {
    return <>{loading && <p role="status">Načítám evidenci…</p>}{error && <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error} <button className="underline" onClick={refresh}>Zkusit znovu</button></div>}</>;
}
export function AdminLicenseShell({ title, children }: { title: string; children: ReactNode }) {
    const licenses = useCanAccessAdminPath('/admin/promptbook-licensing');
    const subscriptions = useCanAccessAdminPath('/admin/promptbook-subscriptions');
    const apiKeys = useCanAccessAdminPath('/admin/api-keys');
    return <main className="mx-auto max-w-7xl space-y-6 p-4 text-slate-900 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-semibold">{title}</h1>
            <nav aria-label="Licence a API" className="flex flex-wrap gap-4 text-sm">{licenses && <Link className={linkClass} href="/admin/promptbook-licensing">Licence</Link>}
                {subscriptions && <Link className={linkClass} href="/admin/promptbook-subscriptions">Předplatná a objednávky</Link>}
                {apiKeys && <Link className={linkClass} href="/admin/api-keys">API klíče</Link>}
                <a className={linkClass} href={API_DOCS_PATH} target="_blank" rel="noreferrer">Swagger</a>
                <a className={linkClass} href={`${API_OPENAPI_PATH}?download=1`} download>Stáhnout OpenAPI</a></nav>
        </div>{children}</main>;
}
export function LicenseRows({ items }: { items: AdminLicense[] }) {
    return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b"><tr>
        {['Účet','Licence / oprávnění','Stav','Platnost do','Zdroj',''].map((label,index) => <th className="p-3" key={index}>{label}</th>)}
    </tr></thead><tbody>{items.map((row) => <tr className="border-b" key={row.source+row.id}>
        <td className="p-3">{row.email}{row.is_test && <span className="ml-2 text-amber-800">Test</span>}</td>
        <td className="p-3">{row.label}{row.community_seats > 0 && <small className="block text-sm text-slate-500">Komunitní místa: {row.community_seats}</small>}</td>
        <td className="p-3">{LICENSE_STATE_LABELS[row.state]}</td><td className="p-3">{formatDate(row.valid_until)}</td>
        <td className="p-3">{row.source === 'subscription' ? 'Předplatné' : row.kind === 'trial' ? 'Zkouška' : 'Ručně bez objednávky'}</td>
        <td className="p-3"><Link className={linkClass} href={licenseAdminHref(row)}>Detail</Link></td>
    </tr>)}</tbody></table>{items.length === 0 && <p className="py-6 text-slate-600">Žádné licence neodpovídají filtru.</p>}</div>;
}
export function SubscriptionRows({ items }: { items: AdminSubscription[] }) {
    return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b"><tr>
        {['Účet','Produkt','Stav','Uhrazeno do','Předplatné / objednávka',''].map((label,index) => <th className="p-3" key={index}>{label}</th>)}
    </tr></thead><tbody>{items.map((row) => <tr className="border-b" key={row.product+row.id}>
        <td className="p-3">{row.email}{row.is_test && <span className="ml-2 text-amber-800">Test</span>}</td>
        <td className="p-3">{SUBSCRIPTION_PRODUCT_LABELS[row.product]}<span className="block text-slate-500">{row.community_id ?? row.label}</span></td>
        <td className="p-3">{row.status}{row.cancel_at_period_end && <span className="block text-slate-500">Obnova zrušena</span>}</td>
        <td className="p-3">{row.paid_through ? formatDate(row.paid_through) : 'Neověřeno'}</td>
        <td className="p-3">{row.stripe_subscription_id ? <a className={linkClass} href={stripeObjectUrl(row.is_test,'subscriptions',row.stripe_subscription_id)!} target="_blank" rel="noreferrer">Stripe předplatné</a> : 'Bez předplatného Stripe'}
            {row.discount_code && <span className="block text-slate-500">Sleva: {row.discount_code}</span>}</td>
        <td className="p-3"><Link className={linkClass} href={subscriptionAdminHref(row)}>Detail</Link></td>
    </tr>)}</tbody></table>{items.length === 0 && <p className="py-6 text-slate-600">Žádná předplatná ani objednávky neodpovídají filtru.</p>}</div>;
}
export function PageLinks({ path, params, offset, total, limit }: { path: string; params: URLSearchParams; offset: number; total: number; limit: number }) {
    function href(next: number) { const copy = new URLSearchParams(params); copy.set('offset',String(next)); return `${path}?${copy}`; }
    return <div className="flex items-center gap-5 text-sm"><span>{total ? `${offset+1}–${Math.min(offset+limit,total)} z ${total}` : '0 záznamů'}</span>
        {offset > 0 && <Link className={linkClass} href={href(Math.max(0,offset-limit))}>Předchozí</Link>}
        {offset+limit < total && <Link className={linkClass} href={href(offset+limit)}>Další</Link>}</div>;
}
