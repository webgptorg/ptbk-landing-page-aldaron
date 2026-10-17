import type { NumericKey } from './calculatorState';
import { translate, type SiteLocale } from './localization';
export const isCzkField = (key: NumericKey) => key.endsWith('Czk') || key === 'hourlyCost' || key === 'partnerHourlyCost';
const isUsdField = (key: NumericKey) => key === 'inputPriceUsd' || key === 'outputPriceUsd';
function displayFactor(key: NumericKey, locale: SiteLocale, rate: number) {
    return locale === 'en' && isCzkField(key) ? 1 / rate : locale === 'cs' && isUsdField(key) ? rate : 1;
}
export const displayFieldValue = (key: NumericKey, value: number, locale: SiteLocale, rate: number) => Number((value * displayFactor(key, locale, rate)).toFixed(6));
export const storedFieldValue = (key: NumericKey, value: number, locale: SiteLocale, rate: number) => value / displayFactor(key, locale, rate);
export const localizedFieldLabel = (key: NumericKey, label: string, locale: SiteLocale) => locale === 'cs' && isUsdField(key) ? label.replace('USD', 'Kč') : translate(label, locale);
