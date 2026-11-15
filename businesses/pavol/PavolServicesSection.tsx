import Link from 'next/link';
import { PAVOL_CONTAINER_CLASS_NAME } from './layout';
import { PAVOL_PAGE_CONTENT } from './pavolContent';
import { PavolSectionHeading } from './PavolSectionHeading';
import type { PavolContactForm } from './usePavolContactForm';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { ArrowUpRight } from 'lucide-react';

export function PavolServicesSection({ language, form }: {
    readonly language: SupportedHomepageLanguage;
    readonly form: PavolContactForm;
}) {
    const content = PAVOL_PAGE_CONTENT[language].services;
    return <section id="services" tabIndex={-1} className="pavol-section outline-none">
        <div className={PAVOL_CONTAINER_CLASS_NAME}>
            <PavolSectionHeading {...content} />
            <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
                {content.items.map(service => <article key={service.id} className="flex flex-col border-t border-[var(--pavol-border)] pt-5">
                    <h3 className="text-xl font-medium tracking-tight">{service.title}</h3>
                    <p className="mb-4 mt-3 text-base leading-relaxed text-[var(--pavol-muted)]">{service.description}</p>
                    <a href="#contact" aria-disabled={form.isSubmitting}
                        onClick={event => {
                            if (form.isSubmitting) { event.preventDefault(); return; }
                            form.selectService(service.id);
                        }}
                        className="mt-auto inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--pavol-accent)] underline underline-offset-4 aria-disabled:opacity-50">
                        {service.buttonLabel}<ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                    {service.formats && <Link href="/training" className="inline-flex min-h-11 items-center text-sm text-[var(--pavol-muted)] underline underline-offset-4">
                        {language === 'cs' ? 'Jak školení probíhá' : 'Training formats'} →
                    </Link>}
                </article>)}
            </div>
        </div>
    </section>;
}
