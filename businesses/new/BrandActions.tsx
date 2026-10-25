'use client';

import Link from 'next/link';
import { LeadButton } from './LeadCapture';
import { useSiteLocale } from './LocaleProvider';
import s from './brand.module.css';

/** One primary enquiry action, with a quieter route to independent installation. */
export function BrandActions({ partner = false }: { partner?: boolean }) {
    const { locale, path } = useSiteLocale();
    const en = locale === 'en';
    return <div className={s.primaryActions}>
        <LeadButton interest heading={partner ? undefined : (en ? 'What would you like AI to take over?' : 'Co za Vás má AI převzít?')} topic={en
            ? (partner ? 'Partnership — deploying Promptbook for clients' : 'Handing work over to AI')
            : (partner ? 'Partnerství — nasazování Promptbooku klientům' : 'Předání práce AI')}>
            {en ? (partner ? 'Bring Promptbook to my clients' : 'Free up my time') : (partner ? 'Chci nasazovat klientům' : 'Chci uvolnit ruce')}
        </LeadButton>
        <Link className={s.installLink} href={path('open-source')}>
            <span>{en ? 'or install the engine yourself' : 'nebo si nainstalujte engine u sebe'}</span><span aria-hidden="true">↗</span>
        </Link>
    </div>;
}
