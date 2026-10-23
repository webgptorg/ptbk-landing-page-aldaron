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
        <LeadButton interest topic={en
            ? (partner ? 'Partnership — deploying Promptbook for clients' : 'Interest in Promptbook — app, engine and support')
            : (partner ? 'Partnerství — nasazování Promptbooku klientům' : 'Zájem o Promptbook — aplikace, engine a podpora')}>
            {en ? (partner ? 'Bring Promptbook to my clients' : 'I’m interested in Promptbook') : (partner ? 'Chci nasazovat klientům' : 'Chci Promptbook')}
        </LeadButton>
        <Link className={s.installLink} href={path('open-source')}>
            {en ? 'or install the engine yourself' : 'nebo si nainstalujte engine u sebe'} <span aria-hidden="true">↗</span>
        </Link>
        <p className={s.enquiryNote}>{en
            ? 'No commitment. We’ll get in touch and let you know when the app is available.'
            : 'Nezávazně. Ozveme se vám a dáme vědět, až bude aplikace dostupná.'}</p>
    </div>;
}
