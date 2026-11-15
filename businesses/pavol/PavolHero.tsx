import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import type { PavolPageContent } from '@/businesses/pavol/pavolContent';
import { PavolPortrait } from '@/components/people/PavolPortrait';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

export function PavolHero({ content, onPrimaryAction }: { readonly content: PavolPageContent['hero']; readonly onPrimaryAction?: () => void }) {
    return (
        <section className="pavol-hero relative overflow-hidden pb-12 pt-28 sm:pb-16 sm:pt-36">
            <div
                className={`${PAVOL_CONTAINER_CLASS_NAME} grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12`}
            >
                <div className="relative z-10 min-w-0">
                    <h1 className="pavol-hero-name font-medium text-[var(--pavol-ink)]">
                        {content.title}
                        <span aria-hidden="true" className="ml-1 inline-block h-[0.09em] w-[0.09em] rounded-full bg-[var(--pavol-accent)]" />
                    </h1>
                    <p className="mt-6 whitespace-pre-line text-[1.65rem] font-medium leading-snug tracking-tight text-[var(--pavol-ink)] sm:text-[2.1rem]">
                        {content.introduction}
                    </p>
                    <p className="mt-5 max-w-[30rem] text-base leading-relaxed text-[var(--pavol-muted)] sm:text-lg">
                        {content.description}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="pavol-primary-button h-14 rounded-full px-7 text-sm"
                        >
                            <a href="#contact" onClick={onPrimaryAction}>
                                {content.primaryAction}
                                <ArrowUpRight aria-hidden="true" className="ml-2 h-5 w-5" />
                            </a>
                        </Button>
                            <a href="#projects" className="inline-flex min-h-11 items-center justify-center gap-2 px-2 text-sm font-medium underline underline-offset-4">
                                {content.secondaryAction}
                                <ArrowDown aria-hidden="true" className="ml-2 h-4 w-4" />
                            </a>
                    </div>
                    <p className="mt-6 text-xs text-[var(--pavol-muted)]">{content.badges.at(-1)}</p>
                </div>
                <figure className="pavol-portrait relative mx-auto w-full max-w-[500px]">
                    <div className="pavol-portrait-frame">
                        <div aria-hidden="true" className="pavol-portrait-disc" />
                        <div className="pavol-portrait-image">
                            <PavolPortrait
                                priority
                                sizes="(min-width: 1280px) 380px, (min-width: 1024px) 32vw, (min-width: 640px) 380px, 76vw"
                                hatSizes="(min-width: 640px) 160px, 31vw"
                            />
                        </div>
                    </div>
                </figure>
            </div>
        </section>
    );
}
