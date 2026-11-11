import type { ComparisonValue } from './comparisons';
import type { SiteLocale } from './localization';

export type ComparisonCurrency = 'CZK' | 'USD' | 'EUR';
export type ComparisonPriceMode = 'original' | 'converted';
export type ComparisonPrice = ComparisonValue & {
    currency: ComparisonCurrency;
    amounts: readonly number[];
    template: Record<SiteLocale, string>;
};

/** Dated CNB fixing, independent of the calculator's editable model assumptions. */
export const COMPARISON_EXCHANGE_RATES = {
    date: '2026-11-11',
    czkPerUnit: { CZK: 1, USD: 21.91, EUR: 24.38 },
    source: 'https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/index.html?date=11.11.2026',
} as const;

function renderPrice(price: Pick<ComparisonPrice, 'currency' | 'amounts' | 'template'>, locale: SiteLocale, target: ComparisonCurrency) {
    const converted = target !== price.currency;
    const formatter = new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-US', {
        style: 'currency', currency: target,
        currencyDisplay: locale === 'cs' && target !== 'CZK' ? 'code' : 'symbol',
        minimumFractionDigits: 0, maximumFractionDigits: target === 'CZK' ? 0 : 2,
    });
    return price.template[locale].replace(/\{(\d+)\}/g, (_, index: string) => {
        const amount = price.amounts[Number(index)];
        const value = amount * COMPARISON_EXCHANGE_RATES.czkPerUnit[price.currency]
            / COMPARISON_EXCHANGE_RATES.czkPerUnit[target];
        return `${converted && amount !== 0 ? '≈ ' : ''}${formatter.format(value)}`;
    });
}

/** Numeric amounts and the original display copy are always generated together. */
export function comparisonPrice(cs: string, en: string, currency: ComparisonCurrency, amounts: readonly number[]): ComparisonPrice {
    const price = { currency, amounts, template: { cs, en } };
    return { ...price, cs: renderPrice(price, 'cs', currency), en: renderPrice(price, 'en', currency) };
}

export function displayComparisonPrice(price: ComparisonValue | ComparisonPrice, locale: SiteLocale, mode: ComparisonPriceMode): ComparisonValue {
    if (mode === 'original' || !('currency' in price)) return price;
    const text = renderPrice(price, locale, locale === 'cs' ? 'CZK' : 'USD');
    return { cs: text, en: text };
}
