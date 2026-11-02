import Link from 'next/link';
import { PAVOL_CONTAINER_CLASS_NAME, PAVOL_SITE_STYLE } from './layout';
import { PavolHeader } from './PavolHeader';
import { PavolFooter } from './_PavolFooter';
import { PavolProjectCatalog } from './PavolProjectCatalog';
import { PavolProjectsSection } from './PavolProjectsSection';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import './pavol.css';

export function PavolProjectIndex({ language }: { readonly language: SupportedHomepageLanguage }) {
    const cs = language === 'cs';
    return <div className="pavol-site min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
        <PavolHeader language={language} pagePath="/projects" />
        <main id="main-content" tabIndex={-1} className="pt-20 outline-none">
            <div className={`${PAVOL_CONTAINER_CLASS_NAME} pb-8 pt-12`}>
                <Link href="/#projects" className="pavol-source-link">← {cs ? 'Zpět na úvod' : 'Back to home'}</Link>
                <h1 className="mt-8 text-4xl font-medium sm:text-6xl">{cs ? 'Moje projekty' : 'My projects'}</h1>
                <p className="mt-5 max-w-2xl leading-relaxed text-[var(--pavol-muted)]">{cs ? 'Produkty, knihovny, hry a menší experimenty, na kterých jsem pracoval. U každého najdete odkaz na projekt nebo jeho zdrojový kód.' : 'Products, libraries, games, and smaller experiments I have worked on. Each entry links to the project or its source code.'}</p>
            </div>
            <PavolProjectsSection language={language} isArchive />
            <section className="pavol-section"><div className={PAVOL_CONTAINER_CLASS_NAME}><PavolProjectCatalog language={language} /></div></section>
        </main>
        <PavolFooter language={language} isHomepage={false} />
    </div>;
}
