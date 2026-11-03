import Link from 'next/link';
import { getLegalDocument } from '@/lib/legal/legalDocuments';
import { LEGAL_DOCUMENT_KINDS, getLegalPagePath } from '@/lib/legal/legalPagePaths';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { LegalNavigation } from './LegalNavigation';
import s from './site.module.css';

export function LegalHubPage({ language }: { language: SupportedHomepageLanguage }) {
    const cs = language === 'cs';
    return <>
        <header className={s.pageIntro}><Link className={s.breadcrumb} href={`/${language}`}>← Promptbook</Link><h1>{cs ? 'Právní dokumenty' : 'Legal documents'}</h1><p>{cs ? 'Podmínky produktu, partnerství, licence a informace o osobních údajích na jednom místě.' : 'Product and partner terms, licensing and personal-data information in one place.'}</p></header>
        <article className={s.prose}>
            <p>{cs ? 'Aktuální znění dokumentů s datem zveřejnění. Konkrétní smlouva nebo objednávka určuje použitelnou verzi a rozsah plnění. Změny pro nové smlouvy zveřejňujeme zde; změny běžících vztahů oznamujeme podle přijatých podmínek. Již vzniklá práva zůstávají zachována.' : 'Current documents with their publication dates. Each agreement or order identifies the applicable version and service scope. Changes for new agreements are published here; changes to existing relationships follow the accepted notice procedure. Accrued rights remain intact.'}</p>
            {LEGAL_DOCUMENT_KINDS.map(kind => {
                const document = getLegalDocument(kind, language);
                return <section key={kind}><h2><Link href={getLegalPagePath(kind, language)}>{document.title}</Link></h2><p><strong>{cs ? 'Aktuální znění' : 'Current version'}</strong></p><p>{document.perex}</p></section>;
            })}
            <LegalNavigation language={language}/>
        </article>
    </>;
}
