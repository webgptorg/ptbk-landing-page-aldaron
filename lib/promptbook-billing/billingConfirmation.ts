import { isValidElement, type ReactNode } from 'react';
import { getPromptbookOnlineTermsDocument } from '@/lib/legal/promptbookOnlineTermsDocument';
import { formatPromptbookBillingAmount } from '@/businesses/new/promptbookBillingPresentation';
import type { PromptbookOrder } from './billingOrders';

/** A pending Checkout session is not a concluded order, including when its first price is zero. */
export function hasPromptbookOrderConfirmation(order: PromptbookOrder): boolean {
    return Boolean(order.confirmed_at || order.first_paid_at || order.paid_through);
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]!);
}

/** Legal documents contain text, simple inline markup and Next links; no component code runs in a download. */
function legalHtml(node: ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node === 'string' || typeof node === 'number') return escapeHtml(String(node));
    if (Array.isArray(node)) return (node as ReactNode[]).map(legalHtml).join('');
    if (!isValidElement<{ children?: ReactNode; href?: unknown }>(node)) return '';
    const content = legalHtml(node.props.children);
    const href = node.props.href;
    if (typeof href === 'string') {
        const absolute = href.startsWith('/') && !href.startsWith('//') ? `https://www.ptbk.io${href}` : href;
        if (/^(?:https:\/\/|mailto:)/i.test(absolute)) return `<a href="${escapeHtml(absolute)}">${content}</a>`;
    }
    if (node.type === 'br') return '<br>';
    if (typeof node.type === 'string' && ['strong', 'em', 'b', 'i', 'code'].includes(node.type)) {
        return `<${node.type}>${content}</${node.type}>`;
    }
    return content;
}

const dateTime = new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Prague',
});

function printedDate(value: string): string {
    return dateTime.format(new Date(value));
}

/** The attachment uses only the frozen order and its accepted edition, never today's offer or latest invoice. */
export function createPromptbookOrderConfirmation(order: PromptbookOrder): string | null {
    const terms = getPromptbookOnlineTermsDocument(order.terms_version);
    if (!terms || !hasPromptbookOrderConfirmation(order)) return null;
    const rows: Array<[string, string]> = [
        ['Číslo objednávky', order.id],
        ['Vytvořena', printedDate(order.created_at)],
        ['Tarif', `Promptbook ${order.plan === 'start' ? 'Start' : 'Business'}`],
        ['Zákazník', order.company_name],
        ['E-mail', order.email],
        ['Adresa', `${order.billing_address.line1}, ${order.billing_address.postal_code} ${order.billing_address.city}, ${order.country}`],
        ['Měsíční cena', formatPromptbookBillingAmount(order.base_amount)],
    ];
    const confirmedAt = order.confirmed_at || order.first_paid_at;
    if (confirmedAt) rows.splice(2, 0, ['Potvrzena', printedDate(confirmedAt)]);
    if (order.company_id) rows.push(['IČO', order.company_id]);
    if (order.vat_id) rows.push(['DIČ / IČ DPH', order.vat_id]);
    const discountedAmount = order.base_amount - Math.round(order.base_amount * (order.discount_percent ?? 0) / 100);
    if (order.discount_code && order.discount_percent) {
        rows.push(['Slevový kód', order.discount_code]);
        rows.push(['Sleva', `${order.discount_percent} %${order.discount_months ? ` na ${order.discount_months} měsíce` : ' po dobu předplatného'}`]);
        rows.push(['Měsíční cena po slevě', formatPromptbookBillingAmount(discountedAmount)]);
        if (order.discount_months) rows.push(['Po slevě', `${formatPromptbookBillingAmount(order.base_amount)} měsíčně`]);
    }
    rows.push(['Daňový režim', order.tax_treatment === 'reverse_charge'
        ? `Daň odvede zákazník (reverse charge). DIČ dodavatele ${order.supplier_tax_id}.`
        : 'Dodavatel není plátcem DPH. Uvedená cena je konečná.']);
    if (order.order_note) rows.push(['Poznámka', order.order_note]);
    rows.push(['Verze enginu', order.engine_version]);
    rows.push(['Licence enginu', order.engine_licence_url]);
    rows.push(['Podpora', order.support_email]);
    rows.push(['Přijaté podmínky', order.terms_version]);
    if (order.customer_type === 'consumer') {
        rows.push(['Zpřístupnění předplatného ihned', order.immediate_start ? 'Výslovně požadováno při objednání. Právo odstoupit do 14 dnů zůstává zachováno.' : 'Nepožadováno.']);
    }
    const paragraphs = (values: readonly ReactNode[] | undefined) => (values ?? []).map((node) => `<p>${legalHtml(node)}</p>`).join('');
    return `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Potvrzení objednávky Promptbook ${escapeHtml(order.id)}</title>
<style>body{font:16px/1.6 system-ui,sans-serif;color:#17243a;max-width:850px;margin:40px auto;padding:0 24px}h1,h2{line-height:1.25}h1{font-size:28px}h2{font-size:21px;margin-top:32px}dl{display:grid;grid-template-columns:minmax(130px,1fr) 3fr;gap:8px 20px}dt{font-weight:600}dd{margin:0;overflow-wrap:anywhere;white-space:pre-wrap}a{color:#17386c}hr{margin:36px 0;border:0;border-top:1px solid #ccc}@media(max-width:540px){dl{display:block}dd{margin-bottom:12px}}@media print{body{margin:0;max-width:none}}</style></head><body>
<h1>Potvrzení objednávky</h1>
<dl>${rows.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl>
<p>Předplatné se obnovuje každý měsíc platbou kartou. Obnovu lze vypnout před dalším obdobím v zákaznické sekci na https://www.ptbk.io/cs/pricing/predplatne nebo postupem podle přijatých podmínek.</p>
<hr><h1>${escapeHtml(terms.title)}</h1>
${terms.publication?.notice ? `<p>${escapeHtml(terms.publication.notice)}</p>` : ''}
<p>${legalHtml(terms.perex)}</p>
${terms.sections.map((section, index) => `<section><h2>${index + 1}. ${escapeHtml(section.heading)}</h2>${paragraphs(section.paragraphs)}${section.bullets?.length ? `<ul>${section.bullets.map((node) => `<li>${legalHtml(node)}</li>`).join('')}</ul>` : ''}</section>`).join('')}
</body></html>`;
}
