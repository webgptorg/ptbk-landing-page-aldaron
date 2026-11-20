'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCanAccessAdminPath } from '@/components/admin/AdminAccessProvider';
import { createCommunityMembershipAdminPath } from '@/lib/community-membership/communityMembershipAdminLinks';
import { licenseAdminHref, stripeObjectUrl, safeInvoiceUrl, SUBSCRIPTION_PRODUCT_LABELS,
    type AdminSubscription, type AdminPage, type AdminSubscriptionDetail } from '@/lib/promptbook-licensing/adminContract';
import { AdminLicenseShell, SubscriptionRows, LicenseRows, ReadStatus, PageLinks, useAdminRead, inputClass, buttonClass, linkClass, formatDate, money } from './AdminLicenseShared';

export function SubscriptionAdministration() {
    const params = useSearchParams();
    return <AdminLicenseShell title="Předplatná a objednávky">{params.has('record') ? <SubscriptionDetail key={params.toString()} params={new URLSearchParams(params)}/> : <>
        <p className="text-sm text-slate-600">Společný přehled nákupů licencí, komunitního členství a avatara. Záznam bez předplatného Stripe zůstává označený samostatně.</p>
        <form method="GET" className="flex flex-wrap items-end gap-4"><label className="min-w-52 grow text-sm">Hledat podle e-mailu<input className={inputClass} name="q" defaultValue={params.get('q') ?? ''} maxLength={254}/></label>
            <label className="text-sm">Produkt<select className={inputClass} name="product" defaultValue={params.get('product') ?? 'all'}><option value="all">Všechny produkty</option>{Object.entries(SUBSCRIPTION_PRODUCT_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-sm">Prostředí<select className={inputClass} name="mode" defaultValue={params.get('mode') ?? 'live'}><option value="live">Produkční</option><option value="test">Testovací</option></select></label><button className={buttonClass}>Filtrovat</button></form>
        <SubscriptionList key={params.toString()} params={new URLSearchParams(params)}/>
    </>}</AdminLicenseShell>;
}
function SubscriptionList({params}:{params:URLSearchParams}) {
    const result = useAdminRead<AdminPage<AdminSubscription>>(`/api/admin/promptbook-subscriptions?${params}`);
    return <><ReadStatus {...result}/>{result.data && <><SubscriptionRows items={result.data.items}/><PageLinks path="/admin/promptbook-subscriptions" params={params} {...result.data}/></>}</>;
}
function SubscriptionDetail({params}:{params:URLSearchParams}) {
    const canReadLicenses = useCanAccessAdminPath('/admin/promptbook-licensing');
    const canReadCommunity = useCanAccessAdminPath('/admin/community');
    const result = useAdminRead<AdminSubscriptionDetail>(`/api/admin/promptbook-subscriptions?${params}`);
    const detail=result.data, s=detail?.subscription;
    function paymentHref(offset:number) { const copy=new URLSearchParams(params);copy.set('offset',String(offset));return `/admin/promptbook-subscriptions?${copy}`; }
    const stripeUrl=s ? stripeObjectUrl(s.is_test,'subscriptions',s.stripe_subscription_id) : null;
    const customerUrl=s ? stripeObjectUrl(s.is_test,'customers',s.stripe_customer_id) : null;
    return <><Link className={linkClass} href={`/admin/promptbook-subscriptions?mode=${params.get('mode') ?? 'live'}`}>Všechna předplatná a objednávky</Link><ReadStatus {...result}/>
        {s && detail && <>
            <section className="space-y-4 rounded-xl border border-slate-200 p-5"><h2 className="text-xl font-semibold">{SUBSCRIPTION_PRODUCT_LABELS[s.product]} · {s.community_id ?? s.label}</h2>
                <p>{s.email} · {s.status}{s.is_test ? ' · Testovací' : ''}</p><dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div><dt className="text-slate-500">Objednávka / členský záznam</dt><dd className="break-all">{s.id}</dd></div>
                    <div><dt className="text-slate-500">Předplatné Stripe</dt><dd>{stripeUrl ? <a className={linkClass} href={stripeUrl} target="_blank" rel="noreferrer">{s.stripe_subscription_id}</a> : 'Nevzniklo / není připojeno'}</dd></div>
                    <div><dt className="text-slate-500">Uhrazené období do</dt><dd>{s.paid_through ? formatDate(s.paid_through) : 'Neověřeno'}</dd></div>
                    <div><dt className="text-slate-500">Obnova</dt><dd>{s.stripe_subscription_id ? s.cancel_at_period_end ? 'Zrušena na konci období' : 'Podle stavu předplatného' : 'Bez automatického předplatného'}</dd></div>
                    <div><dt className="text-slate-500">Přijatá základní cena / měsíc</dt><dd>{money(s.base_amount,s.currency)}</dd></div>
                    <div><dt className="text-slate-500">Slevový kód</dt><dd>{s.discount_code ?? 'Bez kódu'}</dd></div>
                </dl><div className="flex flex-wrap gap-4 text-sm">{customerUrl && <a className={linkClass} href={customerUrl} target="_blank" rel="noreferrer">Zákazník ve Stripe</a>}
                    {canReadCommunity && s.product === 'community' && <Link className={linkClass} href={createCommunityMembershipAdminPath('memberships',s.email,s.community_id === 'promptbook' ? 'promptbook' : 'vyvojari')}>Otevřít členský záznam v komunitě</Link>}
                    {canReadLicenses && <Link className={linkClass} href={`/admin/promptbook-licensing?${new URLSearchParams({q:s.email,mode:s.is_test ? 'test' : 'live'})}`}>Licence stejného účtu</Link>}</div>
            </section>
            {canReadLicenses && <section className="space-y-3"><h2 className="text-lg font-semibold">Spárované licence</h2>{detail.licenses.length ? <LicenseRows items={detail.licenses}/> : <p className="text-sm text-slate-600">{s.product === 'promptbook' ? 'Objednávka zatím nemá potvrzený licenční nárok.' : 'Tento produkt není softwarová licence Promptbooku.'}</p>}</section>}
            <section className="space-y-3"><h2 className="text-lg font-semibold">Platby a faktury</h2>
                {detail.paymentsMessage && <p className="rounded-lg bg-slate-50 p-3 text-sm">{detail.paymentsMessage}</p>}
                {detail.payments.length > 0 ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b"><tr>{['Faktura','Stav','Zaplaceno','Částka','Vráceno',''].map((title,index) => <th className="p-3" key={index}>{title}</th>)}</tr></thead>
                    <tbody>{detail.payments.map((payment) => { const url=safeInvoiceUrl(payment.invoiceUrl);return <tr className="border-b" key={payment.id}><td className="p-3"><a className={linkClass} href={stripeObjectUrl(s.is_test,'invoices',payment.id) ?? undefined} target="_blank" rel="noreferrer">{payment.id}</a></td>
                        <td className="p-3">{payment.status}</td><td className="p-3">{payment.paidAt ? formatDate(payment.paidAt) : 'Nezaplaceno'}</td><td className="p-3">{money(payment.amountPaid,payment.currency)}</td>
                        <td className="p-3">{payment.refundedAmount === null ? 'Ověřit ve Stripe' : money(payment.refundedAmount,payment.currency)}</td><td className="p-3">{url && <a className={linkClass} href={url} target="_blank" rel="noreferrer">Otevřít fakturu</a>}</td></tr>; })}</tbody></table></div>
                : !detail.paymentsMessage && <p className="text-sm text-slate-600">V evidenci nejsou potvrzené platby. Samotná objednávka ani cena nedokazuje úhradu.</p>}
                <div className="flex gap-4 text-sm">{detail.paymentOffset > 0 && s.product !== 'community' && <Link className={linkClass} href={paymentHref(Math.max(0,detail.paymentOffset-50))}>Novější platby</Link>}
                    {detail.paymentsHasMore && s.product !== 'community' && <Link className={linkClass} href={paymentHref(detail.paymentOffset+50)}>Starší platby</Link>}</div>
            </section>
        </>}
    </>;
}
