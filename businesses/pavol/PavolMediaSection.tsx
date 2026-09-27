import {
    pavolMediaAppearances as PAVOL_MEDIA_APPEARANCES,
    pavolMediaMoreHref as PAVOL_MEDIA_MORE_URL,
    type PavolMediaAppearance,
} from '@/businesses/pavol/config-media';
import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { PavolSectionHeading } from '@/businesses/pavol/PavolSectionHeading';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';

function MediaAppearanceCard({ appearance }: { readonly appearance: PavolMediaAppearance }) {
    const IS_HIGHLIGHT = appearance.importance === 'highlight';
    return (
        <article className="h-full">
            <a
                href={appearance.href}
                className={cn(
                    'group flex h-full gap-5 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-[var(--pavol-accent)]',
                    IS_HIGHLIGHT ? 'flex-col sm:p-6' : 'flex-col sm:flex-row',
                )}
            >
                <div
                    aria-hidden="true"
                    style={
                        appearance.thumbnailBackgroundColor
                            ? { backgroundColor: appearance.thumbnailBackgroundColor }
                            : undefined
                    }
                    className={cn(
                        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-3xl font-bold',
                        IS_HIGHLIGHT ? 'h-48 w-full sm:h-56' : 'h-32 w-full sm:h-28 sm:w-40',
                        appearance.thumbnailClassName,
                    )}
                >
                    {appearance.imageSrc ? (
                        <Image
                            src={appearance.imageSrc}
                            alt=""
                            fill
                            sizes={
                                IS_HIGHLIGHT
                                    ? '(min-width: 1280px) 520px, (min-width: 768px) 42vw, 90vw'
                                    : '(min-width: 640px) 160px, 90vw'
                            }
                            className="object-contain transition-transform duration-300 motion-safe:group-hover:scale-105"
                        />
                    ) : (
                        (appearance.thumbnailLabel ?? appearance.source)
                    )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[var(--pavol-accent)]">
                        <span>
                            {appearance.kind}{' '}
                            <span aria-hidden="true" className="px-1 text-slate-400">
                                /
                            </span>{' '}
                            {appearance.source}
                        </span>
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                    </div>
                    <h3 className="mt-3 text-xl font-semibold leading-snug text-[var(--pavol-ink)]">
                        {appearance.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{appearance.description}</p>
                </div>
            </a>
        </article>
    );
}

export function PavolMediaSection({ language }: { readonly language: SupportedHomepageLanguage }) {
    const CONTENT = PAVOL_PAGE_CONTENT[language].media;
    const APPEARANCES = PAVOL_MEDIA_APPEARANCES[language];
    const HIGHLIGHTS = APPEARANCES.filter((APPEARANCE) => APPEARANCE.importance === 'highlight');
    const OTHER_APPEARANCES = APPEARANCES.filter((APPEARANCE) => APPEARANCE.importance === 'rest');
    return (
        <section id="media" tabIndex={-1} className="bg-white py-16 outline-none sm:py-24">
            <div className={PAVOL_CONTAINER_CLASS_NAME}>
                <PavolSectionHeading
                    eyebrow={CONTENT.eyebrow}
                    title={CONTENT.title}
                    description={CONTENT.description}
                />
                <h3 className="sr-only">{CONTENT.highlightsLabel}</h3>
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                    {HIGHLIGHTS.map((APPEARANCE) => (
                        <MediaAppearanceCard key={APPEARANCE.href} appearance={APPEARANCE} />
                    ))}
                </div>
                <details className="group/media mt-6 rounded-2xl border border-slate-200 p-5 sm:p-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold [&::-webkit-details-marker]:hidden">
                        <span>
                            {CONTENT.restLabel}{' '}
                            <span className="ml-2 font-normal text-slate-500">({OTHER_APPEARANCES.length})</span>
                        </span>
                        <ChevronDown
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0 transition-transform group-open/media:rotate-180"
                        />
                    </summary>
                    <div className="mt-6 space-y-4">
                        {OTHER_APPEARANCES.map((APPEARANCE) => (
                            <MediaAppearanceCard key={APPEARANCE.href} appearance={APPEARANCE} />
                        ))}
                    </div>
                </details>
                <a
                    href={PAVOL_MEDIA_MORE_URL}
                    className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-[var(--pavol-accent)]"
                >
                    {CONTENT.moreLabel}
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
            </div>
        </section>
    );
}
