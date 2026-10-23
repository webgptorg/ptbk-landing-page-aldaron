'use client';

import { useSiteLocale } from './LocaleProvider';
import { usePathname } from 'next/navigation';
import { SiteLocaleProvider } from './LocaleProvider';
import { localeFromPath, localizedPath } from './localization';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { ORGANIZATION_DATA_BOX_ID, ORGANIZATION_LEGAL_NAME, ORGANIZATION_REGISTRATION_NUMBER } from '@/lib/metadata/site-config';
import { LEGAL_CONTACT_EMAIL, PRIVACY_CONTACT_EMAIL } from '@/lib/legal/legalOperator';
import { LeadButton, LeadCaptureProvider } from './LeadCapture';
import { NEW_SITE_NAVIGATION, sitePath } from './siteConfig';
import { TechnologyIncubation } from './TechnologyIncubation';
import { ENGINE_REPOSITORY } from './commercialTerms';
import s from './site.module.css';

function LocalizedShell({ children }: { children: ReactNode }) {
    const { t, locale, path } = useSiteLocale();

    return <LeadCaptureProvider><div className={s.site} lang={locale}>
        <a href="#obsah" className={s.skip}>{t("Přejít na obsah")}</a>
        <header className={s.header}><div className={s.headerInner}>
            <Link className={s.logo} href={path()} aria-label={t("Promptbook — úvod")}><Image src="/logo/promptbook-logo-blue-transparent-128.png" width={33} height={33} alt="" priority /><span>{t("promptbook")}<span className={s.logoDot}>{t(".")}</span></span></Link>
            <nav className={s.desktopNav} aria-label={t("Hlavní navigace")}>{NEW_SITE_NAVIGATION.map(([label, destination]) => <Link key={destination} href={path(destination)}>{t(label)}</Link>)}</nav>
            <LanguageSwitch/><div className={s.headerAction}><LeadButton interest>{t("Mám zájem")}</LeadButton></div>
            <details className={s.mobileMenu}><summary aria-label={t("Otevřít navigaci")}><Menu /></summary><nav aria-label={t("Mobilní navigace")}>{NEW_SITE_NAVIGATION.map(([label, destination]) => <Link key={destination} href={path(destination)}>{t(label)}</Link>)}<Link href={path('kalkulacka')}>{t("Kalkulačka")}</Link><LeadButton interest>{t("Mám zájem")}</LeadButton></nav></details>
        </div></header>
        <main id="obsah" className={s.container}>{t(children)}</main>
        <footer className={s.footer}><div className={s.footerGrid}>
            <div><Link href={path()} className={s.logo}>{t("promptbook.")}</Link><p>{t("Vaše AI.")}<br />{t("Opravdu vaše.")}</p></div>
            <nav aria-label={t("Produkt v patičce")}><strong>{t("Promptbook")}</strong><Link href={path('agendy')}>{t("Agendy")}</Link><Link href={path('partnership')}>{t("Partnerství")}</Link><Link href={path('cenik')}>{t("Ceník")}</Link><Link href={path('kalkulacka')}>{t("Kalkulačka")}</Link></nav>
            <nav aria-label={t("Zdroje v patičce")}><strong>{t("Více informací")}</strong><Link href={path('srovnani')}>{t("Srovnání")}</Link><Link href={path('bezpecnost')}>{t("Data a bezpečnost")}</Link><Link href={path('faq')}>{t("Otázky a odpovědi")}</Link><Link href={path('o-nas')}>{t("Náš příběh a kontakt")}</Link><Link href={path('open-source')}>{t("Vlastní instalace")}</Link><Link href={path('whitepaper')}>APT whitepaper</Link><a href={ENGINE_REPOSITORY}>{t("GitHub")}</a></nav>
            <div className={s.legalContact}><strong>{t(ORGANIZATION_LEGAL_NAME)}</strong><span>{t("IČO: ")}{t(ORGANIZATION_REGISTRATION_NUMBER)}</span><span>{t("Datová schránka: ")}{t(ORGANIZATION_DATA_BOX_ID)}</span><span>{t(LEGAL_CONTACT_EMAIL)}</span><span>{t(PRIVACY_CONTACT_EMAIL)}</span><a href="https://or-justice-cz.translate.goog/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&typ=UPLNY&_x_tr_sl=cs&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp">{t("Obchodní rejstřík ↗")}</a></div>
        </div><div className={s.footerBottom}><span>{t("© ")}{new Date().getFullYear()} {t(ORGANIZATION_LEGAL_NAME)}</span><div><Link href={path('soukromi')}>{t("Ochrana osobních údajů")}</Link><Link href={path('podminky')}>{t("Podmínky webu")}</Link><a href="https://linkedin.com/company/promptbook">{t("LinkedIn")}</a><a href="https://discord.gg/x3QWNaa89N">{t("Discord")}</a></div></div><TechnologyIncubation/></footer>
    </div></LeadCaptureProvider>;
}

function LanguageSwitch() {
    const pathname = usePathname();
    const { locale } = useSiteLocale();
    return <nav className={s.languageSwitch} aria-label="Language / Jazyk">{(['cs', 'en'] as const).map(language => <Link key={language} href={localizedPath(pathname, language)} hrefLang={language} lang={language} aria-current={locale === language ? 'page' : undefined} onClick={event => {
        // Preserve the current calculation and anchor, including edits made via native history.
        event.preventDefault();
        window.location.assign(localizedPath(window.location.pathname, language) + window.location.search + window.location.hash);
    }}>{language === 'cs' ? 'CZ' : 'EN'}</Link>)}</nav>;
}
export function NewSiteShell({ children }: { children: ReactNode }) {
    const locale = localeFromPath(usePathname());
    return <SiteLocaleProvider locale={locale}><LocalizedShell>{children}</LocalizedShell></SiteLocaleProvider>;
}
