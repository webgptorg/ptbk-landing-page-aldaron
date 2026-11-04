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
import { getLegalDocumentLinks } from '@/lib/legal/legalLinks';
import { LeadButton, LeadCaptureProvider } from './LeadCapture';
import { NEW_SITE_NAVIGATION, sitePath } from './siteConfig';
import { TechnologyIncubation } from './TechnologyIncubation';
import { ENGINE_REPOSITORY } from './commercialTerms';
import s from './site.module.css';
import f from './footer.module.css';

function LocalizedShell({ children }: { children: ReactNode }) {
    const { t, locale, path } = useSiteLocale();

    return <LeadCaptureProvider><div className={s.site} lang={locale}>
        <a href="#obsah" className={s.skip}>{t("Přejít na obsah")}</a>
        <header className={s.header}><div className={s.headerInner}>
            <BrandLogo priority/>
            <nav className={s.desktopNav} aria-label={t("Hlavní navigace")}>{NEW_SITE_NAVIGATION.map(([label, destination]) => <Link key={destination} href={path(destination)}>{t(label)}</Link>)}</nav>
            <LanguageSwitch/><div className={s.headerAction}><LeadButton interest>{t("Mám zájem")}</LeadButton></div>
            <details className={s.mobileMenu}><summary aria-label={t("Otevřít navigaci")}><Menu /></summary><nav aria-label={t("Mobilní navigace")}>{NEW_SITE_NAVIGATION.map(([label, destination]) => <Link key={destination} href={path(destination)}>{t(label)}</Link>)}<Link href={path('kalkulacka')}>{t("Kalkulačka")}</Link><LeadButton interest>{t("Mám zájem")}</LeadButton></nav></details>
        </div></header>
        <main id="obsah" className={s.container}>{t(children)}</main>
        <footer className={s.footer}><div className={`${s.footerGrid} ${f.grid}`}>
            <div><BrandLogo/><p>{t("Vaše AI.")}<br />{t("Opravdu Vaše.")}</p></div>
            <nav aria-label={t("Produkt v patičce")}><strong>{t("Promptbook")}</strong><Link href={path('agendy')}>{t("Agendy")}</Link><Link href={path('partnership')}>{t("Partnerství")}</Link><Link href={path('cenik')}>{t("Ceník")}</Link><Link href={path('kalkulacka')}>{t("Kalkulačka")}</Link><Link href={path('open-source')}>{t("Vlastní instalace")}</Link><Link href={`/${locale}/releases`}>{locale === 'cs' ? 'Vydání a podpora' : 'Releases and support'}</Link><a href={ENGINE_REPOSITORY}>{t("GitHub")}</a></nav>
            <nav aria-label={t("Zdroje v patičce")}><strong>{t("Více informací")}</strong><Link href={path('srovnani')}>{t("Srovnání")}</Link><Link href={path('bezpecnost')}>{t("Data a bezpečnost")}</Link><Link href={path('faq')}>{t("Otázky a odpovědi")}</Link><Link href={path('o-nas')}>{t("Náš příběh a kontakt")}</Link><Link href={path('whitepaper')}>APT whitepaper</Link><Link href="/book">Common knowledge</Link><Link href="/en/branding" hrefLang="en">{locale === 'cs' ? 'Logo a značka (EN)' : 'Brand kit'}</Link></nav>
            <nav className={f.legal} aria-label={locale === 'cs' ? 'Právní dokumenty' : 'Legal documents'}>
                <strong><Link href={`/${locale}/legal`}>{locale === 'cs' ? 'Právní dokumenty' : 'Legal documents'}</Link></strong>
                <ul className={f.documents}>{getLegalDocumentLinks(locale).map(link => <li key={link.href}><Link href={link.href}>{link.text}</Link></li>)}</ul>
            </nav>
        </div>
        <div className={f.company}>
            <strong>{ORGANIZATION_LEGAL_NAME}</strong><span>{t("IČO: ")}{ORGANIZATION_REGISTRATION_NUMBER}</span><span>{t("Datová schránka: ")}{ORGANIZATION_DATA_BOX_ID}</span>
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a><a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>
            <a href="https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&amp;typ=UPLNY">{t("Obchodní rejstřík ↗")}</a>
        </div>
        <div className={s.footerBottom}><span>© {new Date().getFullYear()} {ORGANIZATION_LEGAL_NAME}</span><div><a href="https://linkedin.com/company/promptbook">LinkedIn</a><a href="https://discord.gg/x3QWNaa89N">Discord</a></div></div><TechnologyIncubation/></footer>
    </div></LeadCaptureProvider>;
}

/** Keep the original mark and exact wordmark colors together in both navigation and footer. */
function BrandLogo({ priority = false }: { priority?: boolean }) {
    const { path, t } = useSiteLocale();
    return <Link className={s.logo} href={path()} aria-label={t('Promptbook — úvod')}>
        <Image src="/logo/promptbook-logo-blue-transparent-128.png" width={33} height={33} alt="" priority={priority}/>
        <span className={s.wordmark}><span>prompt</span><span className={s.logoBook}>book</span></span>
    </Link>;
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
