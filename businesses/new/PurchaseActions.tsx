'use client';
import Link from 'next/link';
import { LeadButton } from './LeadCapture';
import { useSiteLocale } from './LocaleProvider';
import s from './site.module.css';
/** Czech trial and direct purchase are separate; English enquiries keep the existing CRM route. */
export function PurchaseActions({ compact = false }: { compact?: boolean }) {
    const { locale, path } = useSiteLocale();
    if (locale === 'en')
        return (
            <LeadButton interest topic="Promptbook — ongoing agenda">
                Discuss my agenda
            </LeadButton>
        );
    return (
        <div className={s.actions}>
            <a className={s.button} href={path('pricing/zkouska')}>
                Vyzkoušet Business zdarma
            </a>
            {!compact && (
                <>
                    <a className={s.textLink} href={path('pricing/objednat/business')}>
                        Koupit Business rovnou
                    </a>
                    <LeadButton secondary topic="Pomoc s první agendou">
                        Poradit se
                    </LeadButton>
                </>
            )}
        </div>
    );
}
