'use client';

import { COMMUNITIES, COMMUNITIES_PATH } from '@/businesses/community/config';
import { TERMINAL_TOUR_PATH } from '@/businesses/terminal-tour/terminalTour';
import { useSiteLocale } from './LocaleProvider';
import { usePathname } from 'next/navigation';
import { SiteLocaleProvider } from './LocaleProvider';
import { localeFromPath, localizedPath } from './localization';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Menu } from 'lucide-react';
import { ORGANIZATION_DATA_BOX_ID, ORGANIZATION_LEGAL_NAME, ORGANIZATION_REGISTRATION_NUMBER } from '@/lib/metadata/site-config';
import { LEGAL_CONTACT_EMAIL, PRIVACY_CONTACT_EMAIL } from '@/lib/legal/legalOperator';
import { getLegalDocumentLinks } from '@/lib/legal/legalLinks';
import { LeadButton, LeadCaptureProvider } from './LeadCapture';
import { isPromptbookBillingPagePath, NEW_SITE_NAVIGATION } from './siteConfig';
import { TechnologyIncubation } from './TechnologyIncubation';
import { ENGINE_REPOSITORY } from './commercialTerms';
import { COMPARISONS } from './comparisons';
import { PROMPTBOOK_BRAND, PROMPTBOOK_BRAND_STYLE } from '@/lib/promptbook-brand';
import s from './site.module.css';
import f from './footer.module.css';

function LocalizedShell({ children, checkoutEnabled }: { children: ReactNode; checkoutEnabled: boolean }) {
    const { t, locale, path } = useSiteLocale();
    const pathname = usePathname();
    const communityLink = locale === 'cs' ? <Link href={COMMUNITIES.promptbook.path}>Komunita</Link> : null;
    const showCheckout = checkoutEnabled && locale === 'cs' && (pathname === '/cs' || pathname === '/cs/');
    const headerAction = showCheckout
        ? <a href={path('pricing/objednat/start')} className={s.button}>{t("Mám zájem")}<ArrowUpRight size={17} aria-hidden="true" /></a>
        : <LeadButton interest>{t("Mám zájem")}</LeadButton>;

    return <LeadCaptureProvider><div className={s.site} lang={locale} style={PROMPTBOOK_BRAND_STYLE}>
        <a href="#obsah" className={s.skip}>{t("Přejít na obsah")}</a>
        <header className={s.header}><div className={s.headerInner}>
            <BrandLogo priority/>
            <nav className={s.desktopNav} aria-label={t("Hlavní navigace")}>{NEW_SITE_NAVIGATION.map(([label, destination]) => <Link key={destination} href={path(destination)}>{t(label)}</Link>)}{communityLink}</nav>
            <LanguageSwitch/><div className={s.headerAction}>{headerAction}</div>
            <details className={s.mobileMenu}><summary aria-label={t("Otevřít navigaci")}><Menu /></summary><nav aria-label={t("Mobilní navigace")}>{NEW_SITE_NAVIGATION.map(([label, destination]) => <Link key={destination} href={path(destination)}>{t(label)}</Link>)}{communityLink}<Link href={path('kalkulacka')}>{t("Kalkulačka")}</Link>{headerAction}</nav></details>
        </div></header>
        <main id="obsah" className={s.container}>{t(children)}</main>
        <footer className={s.footer}><div className={`${s.footerGrid} ${f.grid}`}>
            <div>
                <BrandLogo/>
                <div className={f.socials}>
                    <a href="https://linkedin.com/company/promptbook">LinkedIn</a>
                    <a href="https://discord.gg/x3QWNaa89N">Discord</a>
                </div>
            </div>
            <nav aria-label={t("Produkt v patičce")}><strong>{t("Promptbook")}</strong><Link href={path('agendy')}>{t("Agendy")}</Link><Link href={path('partnership')}>{t("Partnerství")}</Link><Link href={path('pricing')}>{t("Ceník")}</Link><Link href={path('kalkulacka')}>{t("Kalkulačka")}</Link><Link href={path('open-source')}>{t("Vlastní instalace")}</Link><Link href={`/${locale}/releases`}>{locale === 'cs' ? 'Vydání a podpora' : 'Releases and support'}</Link><a href={ENGINE_REPOSITORY}>{t("GitHub")}</a></nav>
            <nav aria-label={t("Zdroje v patičce")}><strong>{t("Více informací")}</strong><Link href={path('bezpecnost')}>{t("Data a bezpečnost")}</Link><Link href={path('faq')}>{t("Otázky a odpovědi")}</Link><Link href={path('o-nas')}>{t("Náš příběh a kontakt")}</Link><Link href={path('whitepaper')}>APT whitepaper</Link><Link href="/book">Common knowledge</Link><Link href={path('branding')} hrefLang={locale}>{locale === 'cs' ? 'Logo a značka' : 'Brand kit'}</Link><Link href={COMMUNITIES.promptbook.path} hrefLang="cs" prefetch={false}>{locale === 'cs' ? 'Komunita Promptbook' : 'Promptbook community (Czech)'}</Link></nav>
            <nav aria-label="Promptbook versus">
                <strong>Promptbook versus</strong>
                <Link href={path('srovnani')}>{'Promptbook versus'}</Link>
                {COMPARISONS.slice(0, 6).map(item => (
                    <Link key={item.slug} href={path(`srovnani/${item.slug}`)} prefetch={false}>
                        {item.slug === 'google-workspace' ? 'Gemini (Duet AI)' : item.name}
                    </Link>
                ))}
            </nav>
            <nav className={f.legal} aria-label={locale === 'cs' ? 'Právní dokumenty' : 'Legal documents'}>
                <strong><Link href={`/${locale}/legal`}>{locale === 'cs' ? 'Právní dokumenty' : 'Legal documents'}</Link></strong>
                <ul className={f.documents}>{getLegalDocumentLinks(locale).map(link => <li key={link.href}><Link href={link.href}>{link.text}</Link></li>)}</ul>
            </nav>
        </div>
        <div className={f.details}>
            <div className={f.company}>
                <strong>{ORGANIZATION_LEGAL_NAME}</strong>
                <span>{t('IČO: ')}{ORGANIZATION_REGISTRATION_NUMBER}</span>
                <span>{t('Datová schránka: ')}{ORGANIZATION_DATA_BOX_ID}</span>
                <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
                <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>
                <a href="https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&amp;typ=UPLNY">{t('Obchodní rejstřík ↗')}</a>
            </div>
            <TechnologyIncubation/>
        </div>
        </footer>
    </div></LeadCaptureProvider>;
}

/** The website and downloadable kit use the identical outlined vector lockup. */
function BrandLogo({ priority = false }: { priority?: boolean }) {
    const { path, t } = useSiteLocale();
    const [width, height] = PROMPTBOOK_BRAND.logo.lockupSize;
    return <Link className={s.logo} href={path()} aria-label={t('Promptbook — úvod')}>
        <Image src={PROMPTBOOK_BRAND.assets.lockupLight} width={width} height={height} alt="promptbook" priority={priority}/>
    </Link>;
}

function LanguageSwitch() {
    const pathname = usePathname();
    const { locale } = useSiteLocale();
    if (pathname === COMMUNITIES_PATH || pathname === TERMINAL_TOUR_PATH || isPromptbookBillingPagePath(pathname)) return null;
    return <nav className={s.languageSwitch} aria-label="Language / Jazyk">{(['cs', 'en'] as const).map(language => <Link key={language} href={localizedPath(pathname, language)} hrefLang={language} lang={language} aria-current={locale === language ? 'page' : undefined} onClick={event => {
        // Preserve the current calculation and anchor, including edits made via native history.
        event.preventDefault();
        window.location.assign(localizedPath(window.location.pathname, language) + window.location.search + window.location.hash);
    }}>{language === 'cs' ? 'CZ' : 'EN'}</Link>)}</nav>;
}
export function NewSiteShell({ children, checkoutEnabled = false }: { children: ReactNode; checkoutEnabled?: boolean }) {
    const locale = localeFromPath(usePathname());
    return <SiteLocaleProvider locale={locale}><LocalizedShell checkoutEnabled={checkoutEnabled}>{children}</LocalizedShell></SiteLocaleProvider>;
}
