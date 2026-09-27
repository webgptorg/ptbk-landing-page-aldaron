import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import type { PavolPageContent } from '@/businesses/pavol/pavolContent';
import { Button } from '@/components/ui/button';
import PAVOL_PORTRAIT from '@/public/people/pavol-hejny-transparent.png';
import { ArrowDown, ArrowUpRight, Check } from 'lucide-react';
import Image from 'next/image';

export function PavolHero({ content }: { readonly content: PavolPageContent['hero'] }) {
    return (
        <section className="relative overflow-hidden pb-14 pt-28 sm:pb-20 sm:pt-36">
            <div
                className={`${PAVOL_CONTAINER_CLASS_NAME} grid items-center gap-12 lg:grid-cols-[1.25fr_0.85fr] lg:gap-16`}
            >
                <div>
                    <p className="flex items-center gap-3 text-xs font-semibold uppercase leading-relaxed tracking-[0.16em] text-[var(--pavol-accent)]">
                        <span aria-hidden="true" className="h-px w-8 shrink-0 bg-current" />
                        {content.eyebrow}
                    </p>
                    <h1 className="mt-6 text-[3.3rem] font-semibold leading-[1.05] tracking-[-0.055em] text-[var(--pavol-ink)] sm:text-7xl lg:text-[5.5rem]">
                        {content.title}
                    </h1>
                    <p className="mt-6 whitespace-pre-line text-2xl font-medium leading-snug tracking-tight text-[var(--pavol-ink)] sm:text-3xl">
                        {content.introduction}
                    </p>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                        {content.description}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Button
                            asChild
                            size="lg"
                            className="h-12 rounded-full bg-[var(--pavol-ink)] px-7 text-white hover:bg-[var(--pavol-accent)]"
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
                            className="h-12 rounded-full border-[var(--pavol-ink)]/20 bg-transparent px-7 hover:bg-[var(--pavol-warm)]"
                        >
                            <a href="#projects">
                                {content.secondaryAction}
                                <ArrowDown aria-hidden="true" className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                    <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-relaxed text-slate-600">
                        {content.badges.map((BADGE) => (
                            <li key={BADGE} className="flex items-center gap-1.5">
                                <Check aria-hidden="true" className="h-3.5 w-3.5 text-[var(--pavol-accent)]" />
                                {BADGE}
                            </li>
                        ))}
                    </ul>
                </div>
                <figure className="relative mx-auto w-full max-w-[380px]">
                    <div
                        aria-hidden="true"
                        className="absolute -right-5 top-12 h-36 w-36 rounded-full border border-[var(--pavol-gold)]/40 sm:-right-8"
                    />
                    <div className="relative overflow-hidden rounded-t-[48%] rounded-b-[2rem] bg-[#eee5d6] px-8 pt-8">
                        <div
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#d8e3df] to-transparent"
                        />
                        <Image
                            src={PAVOL_PORTRAIT}
                            alt="Pavol Hejný"
                            priority
                            sizes="(min-width: 1024px) 316px, (min-width: 420px) 316px, calc(100vw - 104px)"
                            className="relative mx-auto h-auto w-full"
                        />
                    </div>
                    <figcaption className="mt-4 text-center text-xs font-medium tracking-wide text-slate-600">
                        {content.portraitCaption}
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}
