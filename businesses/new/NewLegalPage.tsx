import Link from 'next/link';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { getLegalDocument } from '@/lib/legal/legalDocuments';
import { getLegalDocumentPublicationLabel } from '@/lib/legal/legalDocumentPublication';
import type { LegalDocumentKind } from '@/lib/legal/legalPagePaths';
import s from './site.module.css';

/** Server-rendered legal content keeps complete bilingual contracts out of the marketing JavaScript bundle. */
export function NewLegalPage({ kind, language = 'cs' }: {
    kind: LegalDocumentKind;
    language?: SupportedHomepageLanguage;
}) {
    const document = getLegalDocument(kind, language);
    return <>
        <header className={s.pageIntro}>
            <Link className={s.breadcrumb} href={`/${language}`}>← Promptbook</Link>
            <h1>{document.title}</h1>
        </header>
        <article className={s.prose}>
            <p><strong>{getLegalDocumentPublicationLabel(document, language)}</strong></p>
            {document.publication?.notice && <aside className={s.card} style={{ marginBlock: 24 }}>{document.publication.notice}</aside>}
            <p>{document.perex}</p>
            {document.sections.map((section, index) => <section key={section.heading}>
                <h2>{index + 1}. {section.heading}</h2>
                {section.paragraphs?.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
                {section.bullets && <ul>{section.bullets.map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}</ul>}
            </section>)}
        </article>
    </>;
}
