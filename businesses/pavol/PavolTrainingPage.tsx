import Link from 'next/link';
import { PAVOL_CONTAINER_CLASS_NAME, PAVOL_SITE_STYLE } from './layout';
import { PAVOL_PAGE_CONTENT } from './pavolContent';
import { PavolHeader } from './PavolHeader';
import { PavolFooter } from './_PavolFooter';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createPublicUrl } from '@/lib/domains/publicDomainRouting';
import './pavol.css';

export function PavolTrainingPage({ language }: { readonly language: SupportedHomepageLanguage }) {
    const cs = language === 'cs';
    const service = PAVOL_PAGE_CONTENT[language].services.items.find(item => item.id === 'ai-workshops-talks')!;
    return <div className="pavol-site min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
        <PavolHeader language={language} pagePath="/training" />
        <main id="main-content" tabIndex={-1} className="pb-16 pt-28 outline-none sm:pt-36">
            <div className={`${PAVOL_CONTAINER_CLASS_NAME} max-w-4xl`}>
                <Link href="/#services" className="pavol-source-link">← {cs ? 'Zpět na úvod' : 'Back to home'}</Link>
                <h1 className="mt-6 text-4xl font-medium tracking-tight sm:text-5xl">{service.title}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--pavol-muted)]">{service.description}</p>
                <dl className="mt-10 grid gap-8 sm:grid-cols-2">
                    {service.formats?.map(format => <div key={format.title} className="border-t border-[var(--pavol-border)] pt-5">
                        <dt className="text-xl font-medium">{format.title}</dt>
                        <dd className="mt-3 leading-relaxed text-[var(--pavol-muted)]">{format.description}</dd>
                    </div>)}
                </dl>
                <section className="mt-12 border-t border-[var(--pavol-border)] pt-6">
                    <h2 className="text-2xl font-medium">AI Supervize</h2>
                    <p className="mt-3 max-w-2xl leading-relaxed text-[var(--pavol-muted)]">{cs
                        ? 'Praktický rámec pro týmy, které chtějí při vývoji s AI lépe hlídat kvalitu.'
                        : 'A practical framework for teams that want better quality control when developing with AI.'}</p>
                    <a href={createPublicUrl('/ai-supervize')} className="pavol-source-link">{cs ? 'Více o AI Supervizi' : 'More about AI Supervize (in Czech)'} ↗</a>
                </section>
                <div className="mt-10 flex flex-wrap items-center gap-6">
                    <Link href="/?inquiry=ai-workshops-talks#contact" className="pavol-primary-button inline-flex min-h-12 items-center rounded-full px-6 text-sm font-medium">{service.buttonLabel} ↗</Link>
                    <Link href="/talks" className="pavol-source-link">{cs ? 'Termíny a záznamy přednášek' : 'Events and talk recordings'} →</Link>
                </div>
            </div>
        </main>
        <PavolFooter language={language} isHomepage={false} />
    </div>;
}
