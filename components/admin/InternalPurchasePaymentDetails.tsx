import type { InternalOneTimePayment } from '@/lib/payments/paymentCollectionPolicy';

/** Paid means the obligation is settled; collected money remains explicitly zero. */
export function InternalPurchasePaymentDetails({ payment }: { payment?: InternalOneTimePayment | null }) {
    if (!payment) return null;
    const money = (amount: number) => new Intl.NumberFormat('cs-CZ', {
        style: 'currency', currency: payment.currency.toUpperCase(), maximumFractionDigits: 2,
    }).format(amount / 100);
    return <div className="my-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
        <p className="font-semibold">Zaplaceno · bez účtování</p>
        <dl className="mt-2 space-y-1 text-xs">
            <div><dt className="inline font-medium">Cena po slevě: </dt><dd className="inline">{money(payment.amountBeforeWaiver)}</dd></div>
            <div><dt className="inline font-medium">Prominuto: </dt><dd className="inline">{money(payment.waivedAmount)}</dd></div>
            <div><dt className="inline font-medium">Přijato / zbývá uhradit: </dt><dd className="inline">{money(payment.amountPaid)} / {money(payment.amountDue)}</dd></div>
            <div><dt className="inline font-medium">Způsob: </dt><dd className="inline">Interní dokončení bez platební brány</dd></div>
            <div><dt className="inline font-medium">Důvod: </dt><dd className="inline">{payment.reason === 'zero_total' ? 'Nulová cena' : `Částka pod minimem brány ${payment.gateway} (${money(payment.gatewayMinimumAmount)})`}</dd></div>
            <div><dt className="inline font-medium">Dokončeno: </dt><dd className="inline">{payment.completedAt}</dd></div>
            <div><dt className="inline font-medium">Záznam úhrady: </dt><dd className="inline break-all">{payment.id}</dd></div>
        </dl>
    </div>;
}
