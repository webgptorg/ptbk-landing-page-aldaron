'use client';

import { PavolFooter } from '@/businesses/pavol/_PavolFooter';
import { PAVOL_SITE_STYLE } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { PavolContactSection } from '@/businesses/pavol/PavolContactSection';
import { PavolHeader } from '@/businesses/pavol/PavolHeader';
import { PavolHero } from '@/businesses/pavol/PavolHero';
import { PavolMediaSection } from '@/businesses/pavol/PavolMediaSection';
import { PavolNumbersSection } from '@/businesses/pavol/PavolNumbersSection';
import { PavolProjectsSection } from '@/businesses/pavol/PavolProjectsSection';
import { PavolServicesSection } from '@/businesses/pavol/PavolServicesSection';
import { PavolTestimonialsSection } from '@/businesses/pavol/PavolTestimonialsSection';
import { usePavolContactForm } from '@/businesses/pavol/usePavolContactForm';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import './pavol.css';

export function PavolPage({ language }: { readonly language: SupportedHomepageLanguage }) {
    const FORM = usePavolContactForm(language);

    return (
        <div className="pavol-site min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
            <PavolHeader language={language} />
            <main id="main-content" tabIndex={-1} className="outline-none">
                <PavolHero content={PAVOL_PAGE_CONTENT[language].hero} />
                <PavolNumbersSection language={language} />
                <PavolServicesSection language={language} form={FORM} />
                <PavolProjectsSection language={language} />
                <PavolTestimonialsSection language={language} />
                <PavolMediaSection language={language} />
                <PavolContactSection language={language} form={FORM} />
            </main>
            <PavolFooter language={language} />
        </div>
    );
}
