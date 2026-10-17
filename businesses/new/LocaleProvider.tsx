'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { localizedPath, translator, type SiteLocale } from './localization';
const LocaleContext = createContext<SiteLocale>('cs');
export function SiteLocaleProvider({ locale, children }: { locale: SiteLocale; children: ReactNode }) {
    return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
export function useSiteLocale() {
    const locale = useContext(LocaleContext);
    return useMemo(() => ({ locale, t: translator(locale), path: (value = '') => localizedPath(value, locale) }), [locale]);
}
