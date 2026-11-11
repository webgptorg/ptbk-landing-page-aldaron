'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { LeadButton } from './LeadCapture';
import { useSiteLocale } from './LocaleProvider';
import s from './brand.module.css';
import site from './site.module.css';

/** The primary action sets the width for both secondary links. */
export function BrandActions({ partner = false, checkoutEnabled = false }: { partner?: boolean; checkoutEnabled?: boolean }) {
    const { locale, path } = useSiteLocale();
    const en = locale === 'en';
    const checkoutHref = !partner && !en && checkoutEnabled ? path('pricing/objednat/start') : null;
    const label = en ? (partner ? 'Bring Promptbook to my clients' : 'Free up my time') : (partner ? 'Chci nasazovat klientům' : 'Chci uvolnit ruce');
    return <div className={s.primaryActions}>
        {checkoutHref ? <a href={checkoutHref} className={site.button}>
            {label}<ArrowUpRight size={17} aria-hidden="true" />
        </a> : <LeadButton interest heading={partner ? undefined : (en ? 'What would you like AI to take over?' : 'Co za Vás má AI převzít?')} topic={en
            ? (partner ? 'Partnership — deploying Promptbook for clients' : 'Handing work over to AI')
            : (partner ? 'Partnerství — nasazování Promptbooku klientům' : 'Předání práce AI')}>
            {label}
        </LeadButton>}
        <div className={s.secondaryActions}>
            <Link href={path('open-source')}>
                <span>{en ? 'Install the engine yourself' : 'Nainstalujte engine u sebe'}</span><ArrowRight size={14} aria-hidden="true"/>
            </Link>
            <Link href={path(partner ? '' : 'partnership')}>
                <span>{partner ? (en ? 'Explore Promptbook' : 'Prohlédnout Promptbook') : (en ? 'For partners · 20% software share' : 'Pro partnery · 20 % podíl ze softwaru')}</span><ArrowRight size={14} aria-hidden="true"/>
            </Link>
        </div>
    </div>;
}
