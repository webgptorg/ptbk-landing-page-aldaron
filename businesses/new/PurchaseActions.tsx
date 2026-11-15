'use client';
import { LeadButton } from './LeadCapture';
import { useSiteLocale } from './LocaleProvider';
import s from './actions.module.css';
import site from './site.module.css';
/** Czech trial and direct purchase are separate; English enquiries keep the existing CRM route. */
export function PurchaseActions({ compact = false }: { compact?: boolean }) {
    const { locale, path } = useSiteLocale();
    if (locale === 'en')
        return (
            <LeadButton interest topic="Promptbook — ongoing agenda">
                Discuss my agenda
            </LeadButton>
        );
    if (compact)
        return (
            <div className={site.actions}>
                <a className={site.button} href={path('pricing/zkouska')}>
                    Vyzkoušet Business zdarma
                </a>
            </div>
        );
    return (
        <div className={s.purchaseActions}>
            <a className={`${s.action} ${s.primary}`} href={path('pricing/zkouska')}>
                Vyzkoušet Business zdarma
            </a>
            <a className={`${s.action} ${s.secondary}`} href={path('pricing/objednat/business')}>
                Koupit Business rovnou
            </a>
            <LeadButton secondary className={s.consult} topic="Pomoc s první agendou">
                Poradit se
            </LeadButton>
        </div>
    );
}
