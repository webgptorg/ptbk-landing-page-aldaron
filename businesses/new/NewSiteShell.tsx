import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { ORGANIZATION_DATA_BOX_ID, ORGANIZATION_LEGAL_NAME, ORGANIZATION_REGISTRATION_NUMBER } from '@/lib/metadata/site-config';
import { LEGAL_CONTACT_EMAIL, PRIVACY_CONTACT_EMAIL } from '@/lib/legal/legalOperator';
import { LeadButton, LeadCaptureProvider } from './LeadCapture';
import { NEW_SITE_NAVIGATION, sitePath } from './siteConfig';
import { ENGINE_REPOSITORY } from './commercialTerms';
import s from './site.module.css';

export function NewSiteShell({ children }: { children: ReactNode }) {
    return <LeadCaptureProvider><div className={s.site} lang="cs">
        <a href="#obsah" className={s.skip}>Přejít na obsah</a>
        <header className={s.header}><div className={s.headerInner}>
            <Link className={s.logo} href={sitePath()} aria-label="Promptbook — úvod"><Image src="/logo/promptbook-logo-blue-transparent-128.png" width={33} height={33} alt="" priority /><span>promptbook<span className={s.logoDot}>.</span></span></Link>
            <nav className={s.desktopNav} aria-label="Hlavní navigace">{NEW_SITE_NAVIGATION.map(([label, path]) => <Link key={path} href={sitePath(path)}>{label}</Link>)}</nav>
            <div className={s.headerAction}><LeadButton>Začít s Promptbookem</LeadButton></div>
            <details className={s.mobileMenu}><summary aria-label="Otevřít navigaci"><Menu /></summary><nav aria-label="Mobilní navigace">{NEW_SITE_NAVIGATION.map(([label, path]) => <Link key={path} href={sitePath(path)}>{label}</Link>)}<Link href={sitePath('kalkulacka')}>Kalkulačka</Link><LeadButton>Napište nám</LeadButton></nav></details>
        </div></header>
        <main id="obsah" className={s.container}>{children}</main>
        <footer className={s.footer}><div className={s.footerGrid}>
            <div><Link href={sitePath()} className={s.logo}>promptbook.</Link><p>Méně rutiny.<br />Více prostoru pro vaši práci.</p></div>
            <nav aria-label="Produkt v patičce"><strong>Promptbook</strong><Link href={sitePath('agendy')}>Agendy</Link><Link href={sitePath('partnership')}>Partnerství</Link><Link href={sitePath('cenik')}>Ceník</Link><Link href={sitePath('kalkulacka')}>Kalkulačka</Link></nav>
            <nav aria-label="Zdroje v patičce"><strong>Více informací</strong><Link href={sitePath('srovnani')}>Srovnání</Link><Link href={sitePath('bezpecnost')}>Data a bezpečnost</Link><Link href={sitePath('faq')}>Otázky a odpovědi</Link><Link href={sitePath('o-nas')}>Náš příběh a kontakt</Link><a href={ENGINE_REPOSITORY}>GitHub</a></nav>
            <div className={s.legalContact}><strong>{ORGANIZATION_LEGAL_NAME}</strong><span>IČO: {ORGANIZATION_REGISTRATION_NUMBER}</span><span>Datová schránka: {ORGANIZATION_DATA_BOX_ID}</span><span>{LEGAL_CONTACT_EMAIL}</span><span>{PRIVACY_CONTACT_EMAIL}</span><a href="https://or-justice-cz.translate.goog/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&typ=UPLNY&_x_tr_sl=cs&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp">Obchodní rejstřík ↗</a></div>
        </div><div className={s.footerBottom}><span>© {new Date().getFullYear()} {ORGANIZATION_LEGAL_NAME}</span><div><Link href={sitePath('soukromi')}>Ochrana osobních údajů</Link><Link href={sitePath('podminky')}>Podmínky webu</Link><a href="https://linkedin.com/company/promptbook">LinkedIn</a><a href="https://discord.gg/x3QWNaa89N">Discord</a></div></div></footer>
    </div></LeadCaptureProvider>;
}
