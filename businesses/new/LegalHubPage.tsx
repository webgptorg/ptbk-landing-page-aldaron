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
            <p>{cs ? 'U každého dokumentu je uvedeno, zda jde o platné informace, nebo dosud neúčinný návrh. Zveřejnění návrhu nemění již uzavřené smlouvy. Smlouva přijatá při objednávce a práva ke konkrétní verzi mají vlastní působnost.' : 'Each document identifies whether it is published information or a non-effective proposal. Publishing a draft does not amend existing contracts. Accepted orders and version-specific rights have their own scope.'}</p>
            {LEGAL_DOCUMENT_KINDS.map(kind => {
                const document = getLegalDocument(kind, language);
                return <section key={kind}><h2><Link href={getLegalPagePath(kind, language)}>{document.title}</Link></h2><p><strong>{document.publication?.isDraft ? cs ? 'Návrh k projednání' : 'Draft for discussion' : cs ? 'Zveřejněné informace' : 'Published information'}</strong></p><p>{document.perex}</p></section>;
            })}
            <LegalNavigation language={language}/>
        </article>
    </>;
}
