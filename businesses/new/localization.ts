import english from './locales/en.json';
import { COMMERCIAL_TERMS } from './commercialTerms';
export type SiteLocale = 'cs' | 'en';
export const localeFromPath = (pathname: string): SiteLocale => /^\/(?:new\/)?en(?:\/|$)/.test(pathname) ? 'en' : 'cs';
export function localizedPath(path = '', locale: SiteLocale = 'cs') {
    const suffix = path.replace(/^\/new(?=\/|\?|#|$)/, '').replace(/^\/(?:cs|en)(?=\/|\?|#|$)/, '').replace(/^\/+/, '');
    return `/${locale}${suffix ? `${/^[?#]/.test(suffix) ? '' : '/'}${suffix}` : ''}`;
}
const dictionary: Record<string, string> = english;
/** Translates authored copy only. User drafts and calculation inputs are never sent to a translation service. */
export function translate<T>(value: T, locale: SiteLocale): T {
    if (locale === 'cs' || typeof value !== 'string') return value;
    const key = value.trim();
    let translated = dictionary[key] ?? dictionary[value];
    if (translated === undefined && key.endsWith(' — posuvník')) translated = `${translate(key.slice(0, -' — posuvník'.length), locale)} — slider`;
    if (translated === undefined) {
        // Composed headings and periods keep the product name / numeric value intact.
        const rules: [RegExp, string][] = [
            [/^Promptbook a (.+)$/, 'Promptbook and $1'], [/^Kdy zvažovat (.+)$/, 'When to consider $1'],
            [/^Nasazení agendy — (.+)$/, 'Workflow deployment — $1'], [/^Srovnání Promptbooku a (.+)$/, 'Promptbook and $1 comparison'],
            [/^(\d+(?:[.,]\d+)?) měsíců(?: Business)?$/, '$1 months'], [/^(\d+(?:[.,]\d+)?) dní$/, '$1 days'],
            [/^Tržby za (.+) celkem$/, 'Total revenue over $1'], [/^Náklady za (.+) celkem$/, 'Total costs over $1'],
            [/^Celkové náklady klienta za (.+)$/, 'Total client costs over $1'],
        ];
        for (const [pattern, replacement] of rules) if (pattern.test(key)) { translated = key.replace(pattern, replacement); break; }
    }
    return (translated === undefined ? value : value.replace(key, translated)) as T;
}
export const translator = (locale: SiteLocale) => <T,>(value: T): T => translate(value, locale);
export function formatCurrency(czk: number, locale: SiteLocale, exchangeRate: number = COMMERCIAL_TERMS.displayCzkPerUsd, digits = 0) {
    return new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-US', {
        style: 'currency', currency: locale === 'cs' ? 'CZK' : 'USD', maximumFractionDigits: digits, minimumFractionDigits: 0,
    }).format(locale === 'cs' ? czk : czk / exchangeRate);
}
export function licencePrice(plan: 'start' | 'business', locale: SiteLocale) {
    if (locale === 'cs' && plan === 'start') return formatCurrency(COMMERCIAL_TERMS.startCzk, locale);
    return formatCurrency(COMMERCIAL_TERMS[plan === 'start' ? 'startUsd' : 'businessUsd'] * COMMERCIAL_TERMS.displayCzkPerUsd, locale);
}
