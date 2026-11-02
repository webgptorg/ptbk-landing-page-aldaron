import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { getLegalDocument } from '@/lib/legal/legalDocuments';
import type { LegalDocumentSection } from '@/lib/legal/legalDocument';
import { getLegalDocumentPublicationLabel } from '@/lib/legal/legalDocumentPublication';
import type { LegalDocumentKind } from '@/lib/legal/legalPagePaths';

/**
 * Look of the links inside the text, kept here so the documents themselves stay plain content
 */
const LEGAL_TEXT_CLASS_NAME =
    '[&_a]:font-medium [&_a]:text-cyan-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-cyan-900';

/**
 * Renders one numbered chapter of a legal document
 */
function LegalDocumentSectionView({ section, number }: { section: LegalDocumentSection; number: number }) {
    return (
        <section>
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
                <span className="mr-3 text-cyan-700">{number}.</span>
                {section.heading}
            </h2>

            {section.paragraphs?.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="mt-4 leading-relaxed text-slate-600">
                    {paragraph}
                </p>
            ))}

            {section.bullets && (
                <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="flex gap-3 leading-relaxed text-slate-600">
                            <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-600" />
                            <span>{bullet}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

/**
 * Whole page of one legal document
 *
 * Note: Every legal page of the site is this one component with a different document, so they never drift apart.
 */
export function LegalDocumentPage({
    kind,
    language,
}: {
    kind: LegalDocumentKind;
    language: SupportedHomepageLanguage;
}) {
    const document = getLegalDocument(kind, language);

    return (
        <div className="min-h-screen bg-white">
            {/* Note: A legal document is not a place to sell, so the header keeps no call to action here */}
            <Header language={language} hideCenterContent isPrimaryActionShown={false} />

            <main className={`mx-auto max-w-3xl px-6 pb-24 pt-32 sm:pt-36 ${LEGAL_TEXT_CLASS_NAME}`}>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                    {getLegalDocumentPublicationLabel(document, language)}
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{document.title}</h1>

                <p className="mt-5 text-lg leading-relaxed text-slate-600">{document.perex}</p>

                {document.publication?.notice && (
                    <aside className="mt-6 rounded-xl border border-slate-300 bg-slate-50 p-5 text-sm leading-relaxed text-slate-700">
                        {document.publication.notice}
                    </aside>
                )}

                <div className="mt-12 space-y-10 border-t border-slate-200 pt-10">
                    {document.sections.map((section, sectionIndex) => (
                        <LegalDocumentSectionView key={section.heading} section={section} number={sectionIndex + 1} />
                    ))}
                </div>
            </main>

            <Footer language={language} />
        </div>
    );
}
