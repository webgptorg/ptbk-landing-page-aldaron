import Link from 'next/link';
import { PRODUCT_RELEASES, RELEASE_CATALOG_UPDATED_AT, getInstallationReleases, getReleaseSupport, groupReleaseLines, type ProductRelease, type ReleaseCatalog } from '@/lib/releases/catalog';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { LegalNavigation } from './LegalNavigation';
import s from './site.module.css';
import r from './releases.module.css';

export function ReleasesPage({ language, catalog = { releases: [...PRODUCT_RELEASES], checkedAt: RELEASE_CATALOG_UPDATED_AT } }: {
    language: SupportedHomepageLanguage; catalog?: ReleaseCatalog & { stale?: boolean };
}) {
    const cs = language === 'cs';
    const format = (date: string) => new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { dateStyle: 'long', timeZone: 'Europe/Prague' }).format(new Date(date));
    const { stable, preview } = getInstallationReleases(catalog.releases);
    const lines = groupReleaseLines(catalog.releases);
    const stableLines = lines.filter(line => line.latestStable);
    const candidates = lines.filter(line => line.latestPrerelease);
    const sources = (release: ProductRelease) => <p className={r.sources}>{release.npmUrl && <a href={release.npmUrl} target="_blank" rel="noopener noreferrer">npm ↗</a>}{release.githubUrl && <a href={release.githubUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}</p>;
    return <>
        <header className={s.pageIntro}><Link className={s.breadcrumb} href={`/${language}`}>← Promptbook</Link><h1>{cs ? 'Vydání a podpora' : 'Releases and support'}</h1><p>{cs ? 'Řady Promptbooku od 0.115. Každá řada major.minor ukazuje svůj nejnovější stabilní patch.' : 'Promptbook lines from 0.115 onwards. Each major.minor line shows its latest stable patch.'}</p></header>
        <article className={s.prose}>
            {(stable || preview) && <p>
                {stable && <span>{cs ? 'Doporučená stabilní verze' : 'Recommended stable release'} <strong>{stable.version}</strong>{' · '}</span>}
                {preview && <span>{cs ? 'Verze k vyzkoušení' : 'Preview release'} <strong>{preview.version}</strong>{' · '}</span>}
                <Link href={`/${language}/open-source`}>{cs ? 'Instalace' : 'Installation'} ↗</Link>
            </p>}
            <h2>{cs ? 'Jak číst přehled' : 'Reading the catalogue'}</h2>
            <p>{cs ? 'Aktuální vydání a instalační soubory načítáme z GitHub Releases. Přehled se automaticky obnovuje po pěti minutách. Jednotlivé patche sdružujeme do řad; úplná historie zůstává na GitHubu. Historická data zveřejnění a přijaté závazky podpory zachováváme.' : 'Current releases and installers come from GitHub Releases. The catalogue refreshes automatically after five minutes. Patches are grouped into release lines; the complete history remains on GitHub. Historical publication dates and accepted support commitments are preserved.'}</p>
            <p>{cs ? 'Politika smluvní podpory: nejméně 90 dní od vydání první stabilní verze řady major.minor, vždy pro její nejnovější stabilní patch. Nový patch lhůtu neprodlužuje. Vždy musí zůstat alespoň jedna podporovaná stabilní řada. Již přijaté závazky podpory se nezkracují. Konkrétní rozsah podpory určuje přijatá smlouva.' : 'Contractual support policy: at least 90 days from the first stable release of a major.minor line, covering its latest stable patch. A patch does not restart the period. At least one supported stable line must remain available. Existing accepted support commitments are not shortened. The accepted agreement defines the specific support scope.'}</p>
            <p>{cs ? 'Štítky Supported a Unsupported označují stav podpory podle této politiky. LTS je pouze naše redakční označení vybrané řady; samo nepřidává smluvní záruku ani další dobu podpory. Prerelease jsou kandidáti k vyzkoušení, nejsou určeny pro komerční provoz ani zahrnuty do garance stabilních verzí.' : 'Supported and Unsupported indicate status under this policy. LTS is an editorial designation of a selected line; the label alone adds no contractual guarantee or support period. Prereleases are candidates for experimentation, not intended for commercial production or included in stable-release guarantees.'}</p>
            <p>{cs ? 'Poslední ověření vydání' : 'Last release check'}: {format(catalog.checkedAt)} · <a href="https://github.com/webgptorg/promptbook/releases">{cs ? 'Úplná historie na GitHubu' : 'Complete GitHub history'} ↗</a></p>
            {catalog.stale && <p role="status">{cs ? 'GitHub se nyní nepodařilo ověřit. Zobrazujeme poslední známá vydání; aktuální stav ověřte na GitHubu.' : 'GitHub could not be verified. Showing the last known releases; check GitHub for the current state.'}</p>}
        </article>
        <section className={r.list} aria-label={cs ? 'Stabilní řady' : 'Stable release lines'}>
            {stableLines.length === 0 && <p className={r.release}><strong>{cs ? 'Vydané řady od 0.115 jsou uvedeny níže.' : 'Published lines from 0.115 are listed below.'}</strong> {cs ? 'Zveřejněná čísla vydání mají ve zdrojích označení prerelease; garance stabilní podpory se na ně nevztahuje.' : 'The published versions are marked as prereleases in the sources; stable-support guarantees do not apply to them.'}</p>}
            {stableLines.map(line => {
                const release = line.latestStable!;
                const support = getReleaseSupport(release, catalog.releases);
                return <article className={r.release} key={line.line} id={`v${line.line}`}>
                    <div className={r.heading}><h2><a href={`#v${line.line}`}>Promptbook {line.line}</a></h2><span className={r.badge} data-state={support.status}>{support.status === 'supported' ? 'Supported' : 'Unsupported'}</span>{line.lts && <span className={r.badge}>LTS</span>}</div>
                    <p>{cs ? 'Nejnovější stabilní patch' : 'Latest stable patch'}: <strong id={`v${release.version}`}>{release.version}</strong></p>
                    <dl className={r.dates}><div><dt>{cs ? 'První stabilní vydání řady' : 'First stable release'} </dt><dd><time dateTime={line.firstStableAt!}>{format(line.firstStableAt!)}</time></dd></div><div><dt>{cs ? 'Vydání nejnovějšího patche' : 'Latest patch release'}</dt><dd><time dateTime={release.publishedAt}>{format(release.publishedAt)}</time></dd></div>{support.until && <div><dt>{cs ? 'Minimum podpory řady' : 'Line support minimum'}</dt><dd>{format(support.until)}</dd></div>}</dl>
                    {release.notes && <details><summary>{cs ? 'Poznámky k poslednímu vydání' : 'Latest release notes'}</summary><p className={r.notes}>{release.notes}</p></details>}
                    {sources(release)}
                </article>;
            })}
        </section>
        {candidates.length > 0 && <details className={r.candidates} open={stableLines.length === 0}><summary>{cs ? (stableLines.length ? 'Zobrazit i prerelease' : 'Vydané řady · prerelease') : (stableLines.length ? 'Show prereleases' : 'Published lines · prereleases')} ({candidates.length})</summary><div className={r.list}>
            {candidates.map(line => {
                const release = line.latestPrerelease!;
                return <article className={`${r.release} ${r.candidate}`} key={line.line} id={`v${line.line}`}><div className={r.heading}><h2>Promptbook {line.line}</h2><span className={r.badge}>Prerelease</span></div><p>{cs ? 'Poslední kandidát' : 'Latest candidate'}: <strong id={`v${release.version}`}>{release.version}</strong> · <time dateTime={release.publishedAt}>{format(release.publishedAt)}</time></p><p>{cs ? 'Bez garance stabilní podpory; není určeno pro komerční provoz.' : 'No stable-support guarantee; not intended for commercial production.'}</p>{sources(release)}</article>;
            })}
        </div></details>}
        <LegalNavigation language={language}/>
    </>;
}
