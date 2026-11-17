import Link from 'next/link';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { loadAvatarLegalDocument, AVATAR_LEGAL_VERSION, AVATAR_TERMS_PATH, AVATAR_PRIVACY_PATH, type AvatarLegalKind } from '@/lib/legal/productLegalAvatar';
import { PavolHeader } from './PavolHeader';
import { PAVOL_CONTAINER_CLASS_NAME, PAVOL_SITE_STYLE } from './layout';
import './pavol.css';

const linkStyle = 'underline underline-offset-4 hover:opacity-75';
export function PavolAvatarLegalPage({ language, kind }: { language: SupportedHomepageLanguage; kind: AvatarLegalKind }) {
    const cs = language === 'cs';
    const value = loadAvatarLegalDocument(kind, language);
    const document = value.document;
    return <div className="pavol-site min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
        <PavolHeader language={language} pagePath={value.path} />
        <main id="main-content" tabIndex={-1} className={`${PAVOL_CONTAINER_CLASS_NAME} py-12 outline-none`}>
            <nav className="mb-8 flex flex-wrap gap-5 text-sm">
                <Link href="/avatar" className={linkStyle}>{cs ? '← Zpět k avatarovi' : '← Back to the avatar'}</Link>
                <Link href="/avatar/legal" className={linkStyle}>{cs ? 'Dokumenty avatara' : 'Avatar documents'}</Link>
            </nav>
            <article className="mx-auto max-w-3xl">
                <p className="mb-3 text-sm uppercase tracking-widest">Pavol Hejný · AI avatar · {AVATAR_LEGAL_VERSION}</p>
                <h1 className="mb-6 text-3xl font-semibold leading-tight sm:text-5xl">{document.title}</h1>
                <p className="mb-10 text-lg leading-relaxed">{document.perex}</p>
                <div className="space-y-10 [&_a]:underline [&_a]:underline-offset-4">
                    {document.sections.map((section, index) => <section key={section.heading}>
                        <h2 className="mb-4 text-xl font-semibold">{index + 1}. {section.heading}</h2>
                        {section.paragraphs?.map((paragraph, i) => <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>)}
                        {section.bullets && <ul className="list-disc space-y-2 pl-6">{section.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}</ul>}
                    </section>)}
                </div>
            </article>
            <footer className="mx-auto mt-16 flex max-w-3xl flex-wrap gap-5 border-t border-current/15 pt-6 text-sm">
                <Link href={AVATAR_TERMS_PATH} className={linkStyle}>{cs ? 'Podmínky avatara' : 'Avatar terms'}</Link>
                <Link href={AVATAR_PRIVACY_PATH} className={linkStyle}>{cs ? 'Soukromí avatara' : 'Avatar privacy'}</Link>
                <span>{cs ? 'Dodavatel' : 'Supplier'}: {value.seller.legalName} · IČO {value.seller.companyId}</span>
            </footer>
        </main>
    </div>;
}
export function PavolAvatarLegalHub({ language }: { language: SupportedHomepageLanguage }) {
    const cs = language === 'cs';
    return <div className="pavol-site min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
        <PavolHeader language={language} pagePath="/avatar/legal" />
        <main id="main-content" tabIndex={-1} className={`${PAVOL_CONTAINER_CLASS_NAME} max-w-3xl py-16 outline-none`}>
            <Link href="/avatar" className={linkStyle}>{cs ? '← Zpět k avatarovi' : '← Back to the avatar'}</Link>
            <h1 className="mb-6 mt-8 text-4xl font-semibold">{cs ? 'Dokumenty Pavolova AI avatara' : "Pavol's AI avatar documents"}</h1>
            <p className="mb-8 leading-relaxed">{cs ? 'Samostatný projekt pod osobní značkou Pavola Hejného. Smluvním dodavatelem je AI Web s.r.o., IČO 21012288. Podmínky Promptbooku a komunity se tímto nákupem nemění.' : "A separate project under Pavol Hejný's personal brand. The contractual supplier is AI Web s.r.o., company number 21012288. This purchase does not change Promptbook or community agreements."}</p>
            <ul className="space-y-5">
                <li><Link href={AVATAR_TERMS_PATH} className={linkStyle}>{cs ? 'Podmínky služby a licence' : 'Service terms and licence'} · {AVATAR_LEGAL_VERSION}</Link></li>
                <li><Link href={AVATAR_PRIVACY_PATH} className={linkStyle}>{cs ? 'Informace o soukromí' : 'Privacy notice'} · {AVATAR_LEGAL_VERSION}</Link></li>
            </ul>
        </main>
    </div>;
}
