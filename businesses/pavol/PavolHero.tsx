import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import type { PavolPageContent } from '@/businesses/pavol/pavolContent';
import { Button } from '@/components/ui/button';
import PAVOL_PORTRAIT from '@/public/people/pavol-hejny-transparent.png';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

export function PavolHero({ content }: { readonly content: PavolPageContent['hero'] }) {
    return (
        <section className="pavol-hero relative overflow-hidden pb-12 pt-28 sm:pb-16 sm:pt-36">
            <div
                className={`${PAVOL_CONTAINER_CLASS_NAME} grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12`}
            >
                <div className="relative z-10 min-w-0">
                    <p className="pavol-eyebrow max-w-md">
                        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[var(--pavol-accent)]" />
                        {content.eyebrow}
                    </p>
                    <h1 className="pavol-hero-name mt-7 font-medium text-[var(--pavol-ink)]">
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
                            <a href="#contact">
                                {content.primaryAction}
                                <ArrowUpRight aria-hidden="true" className="ml-2 h-5 w-5" />
                            </a>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="h-14 rounded-full border-[var(--pavol-border)] bg-transparent px-6 text-sm hover:bg-[var(--pavol-warm)]"
                        >
                            <a href="#projects">
                                {content.secondaryAction}
                                <ArrowDown aria-hidden="true" className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                    <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs leading-relaxed text-[var(--pavol-muted)]">
                        {content.badges.map((BADGE) => (
                            <li key={BADGE} className="flex items-center gap-1.5">
                                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--pavol-accent)]" />
                                {BADGE}
                            </li>
                        ))}
                    </ul>
                </div>
                <figure className="pavol-portrait relative mx-auto w-full max-w-[500px]">
                    <div className="pavol-portrait-frame">
                        <div aria-hidden="true" className="pavol-portrait-disc" />
                        <Image
                            src={PAVOL_PORTRAIT}
                            alt="Pavol Hejný"
                            priority
                            sizes="(min-width: 1280px) 430px, (min-width: 1024px) 36vw, (min-width: 640px) 430px, 86vw"
                            className="pavol-portrait-image"
                        />
                    </div>
                    <figcaption className="flex items-center gap-4 border-b border-[var(--pavol-border)] py-5 text-xs font-medium tracking-wide text-[var(--pavol-muted)]">
                        <span aria-hidden="true" className="h-px flex-1 bg-[var(--pavol-border)]" />
                        <span>{content.portraitCaption}</span>
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}
