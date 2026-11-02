import Link from 'next/link';
import { PAVOL_CONTAINER_CLASS_NAME, PAVOL_SITE_STYLE } from './layout';
import { PavolHeader } from './PavolHeader';
import { PavolFooter } from './_PavolFooter';
import { PavolTalksSection } from './PavolTalksSection';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import './pavol.css';

export async function PavolTalkIndex({ language }: { readonly language: SupportedHomepageLanguage }) {
    return <div className="pavol-site min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
        <PavolHeader language={language} pagePath="/talks" />
        <main id="main-content" tabIndex={-1} className="pt-20 outline-none">
            <div className={`${PAVOL_CONTAINER_CLASS_NAME} pt-10`}><Link href="/#talks" className="pavol-source-link">← {language === 'cs' ? 'Zpět na úvod' : 'Back to home'}</Link></div>
            {await PavolTalksSection({ language, isArchive: true })}
        </main>
        <PavolFooter language={language} isHomepage={false} />
    </div>;
}
