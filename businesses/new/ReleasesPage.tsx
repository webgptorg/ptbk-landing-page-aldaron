import Link from 'next/link';
import { PRODUCT_RELEASES, RELEASE_CATALOG_UPDATED_AT, getReleaseSupport } from '@/lib/releases/catalog';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { LegalNavigation } from './LegalNavigation';
import s from './site.module.css';
import r from './releases.module.css';

export function ReleasesPage({ language }: { language: SupportedHomepageLanguage }) {
    const cs = language === 'cs';
    const format = (date: string) => new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { dateStyle: 'long', timeZone: 'Europe/Prague' }).format(new Date(date));
    const status = {
        prerelease: cs ? 'Předběžná verze · bez garantované podpory' : 'Prerelease · no guaranteed support',
        supported: cs ? 'Podporovaná stabilní verze' : 'Supported stable version',
        superseded: cs ? 'Nahrazena novějším patchem' : 'Superseded by a newer patch',
        ended: cs ? 'Podpora ukončena' : 'Support ended',
    };
    return <>
        <header className={s.pageIntro}><Link className={s.breadcrumb} href={`/${language}`}>← Promptbook</Link><h1>{cs ? 'Vydání a podpora' : 'Releases and support'}</h1><p>{cs ? 'Historie nového Promptbooku od řady 0.118. Přehled verzí, zveřejnění a podpory.' : 'The new Promptbook from the 0.118 line onwards. Versions, publication dates and support status.'}</p></header>
        <article className={s.prose}>
            <h2>{cs ? 'Jak číst přehled' : 'Reading the catalogue'}</h2>
            <p>{cs ? 'Původní datum vydání pochází z npm nebo GitHubu. Zveřejněno zde je samostatné datum prvního zařazení do tohoto přehledu; při prvotním importu nejde o původní datum vydání. Odkazy zpřístupňují původní balíček a poznámky.' : 'The original release date comes from npm or GitHub. Listed here records the first publication in this catalogue, independently of the original release date. Links lead to the original package and release notes.'}</p>
            <p>{cs ? 'Navržená politika smluvní podpory: nejméně 90 dní od zdejšího zveřejnění prvního stabilního vydání řady major.minor, vždy pro její nejnovější stabilní patch. Nový patch minimum celé řady neobnovuje. Nejnovější stabilní řada zůstává podporována, aby byla dostupná alespoň jedna. Změna zdroje ani výpadek synchronizace již přislíbenou dobu nezkracují. Politika je zatím neúčinným návrhem; závazný rozsah určuje přijatá smlouva.' : 'Proposed contractual support policy: at least 90 days from the first stable major.minor release listed here, covering the latest stable patch of that line. A new patch does not restart the line’s minimum period. The newest stable line remains supported so at least one is available. Source changes or sync failures do not shorten promised periods. The policy is a non-effective draft; accepted agreements determine binding support.'}</p>
            {!PRODUCT_RELEASES.some(item => !item.prerelease) && <p><strong>{cs ? 'V tomto přehledu zatím není stabilní vydání. Předběžné verze nejsou zahrnuty do garance podpory stabilních řad.' : 'This catalogue does not yet contain a stable release. Prereleases are excluded from guaranteed stable-line support.'}</strong></p>}
            <p>{cs ? 'Poslední změna evidence' : 'Latest catalogue change'}: {format(RELEASE_CATALOG_UPDATED_AT)} · <a href="https://www.npmjs.com/package/ptbk?activeTab=versions">{cs ? 'Starší vydání před 0.118 na npm' : 'Releases before 0.118 on npm'} ↗</a></p>
        </article>
        <section className={r.list} aria-label={cs ? 'Seznam vydání' : 'Release list'}>
            {PRODUCT_RELEASES.map(release => {
                const support = getReleaseSupport(release, PRODUCT_RELEASES);
                return <article className={r.release} key={release.version} id={`v${release.version}`}>
                    <div className={r.heading}><h2><a href={`#v${release.version}`}>Promptbook {release.version}</a></h2><span className={r.badge} data-state={support.status}>{status[support.status]}</span></div>
                    <dl className={r.dates}><div><dt>{cs ? 'Původní vydání' : 'Original release'}</dt><dd><time dateTime={release.publishedAt}>{format(release.publishedAt)}</time></dd></div><div><dt>{cs ? 'Zveřejněno zde' : 'Listed here'}</dt><dd><time dateTime={release.listedAt}>{format(release.listedAt)}</time></dd></div>{support.until && <div><dt>{cs ? 'Minimum podpory řady' : 'Line support minimum'}</dt><dd>{format(support.until)}</dd></div>}</dl>
                    {release.notes && <details><summary>{cs ? 'Poznámky k vydání z GitHubu' : 'GitHub release notes'}</summary><p className={r.notes}>{release.notes}</p></details>}
                    <p className={r.sources}>{release.npmUrl && <a href={release.npmUrl} target="_blank" rel="noopener noreferrer">npm ↗</a>}{release.githubUrl && <a href={release.githubUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}</p>
                </article>;
            })}
        </section>
        <LegalNavigation language={language}/>
    </>;
}
