'use client';

import { HomepageAgendaCard } from '@/businesses/homepage/HomepageAgendaCard';
import {
    getHomepageContent,
    HOMEPAGE_AGENDA_SECTION_ID,
    type HomepageLanguage,
} from '@/businesses/homepage/homepageContent';
import { openQualificationPopup } from '@/components/qualification-popup';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowRight } from 'lucide-react';

/**
 * Opening of the homepage, which has one job: say that a responsibility can keep being handled, and show one
 * such responsibility actually being held
 */
export function HomepageHero({ language }: { readonly language: HomepageLanguage }) {
    const { hero } = getHomepageContent(language);

    return (
        <section className="relative overflow-hidden bg-[#04131c] pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-28 lg:pt-36">
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage: `radial-gradient(ellipse at 18% 12%, rgba(122,235,255,0.22) 0%, transparent 55%),
                        radial-gradient(ellipse at 88% 78%, rgba(122,255,235,0.14) 0%, transparent 55%)`,
                }}
            />

            <div className="container relative z-10 mx-auto px-4">
                <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
                    <div>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                            {hero.eyebrow}
                        </p>

                        <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[2.6rem] lg:text-[3.2rem]">
                            {hero.heading}
                        </h1>

                        <p className="mt-6 max-w-xl text-[16px] leading-[1.7] text-white/65 sm:text-[17px]">
                            {hero.description}
                        </p>

                        <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                            <Button
                                onClick={openQualificationPopup}
                                size="lg"
                                id="hero-cta"
                                className="rounded-full border border-white/20 bg-gradient-to-r from-[#0e7490] to-[#0891b2] px-7 py-6 text-[15px] font-semibold text-white transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 motion-safe:hover:scale-[1.02]"
                            >
                                {hero.cta}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                variant="ghost"
                                className="rounded-full border border-white/15 bg-white/[0.03] px-7 py-6 text-[15px] font-medium text-white/80 hover:bg-white/[0.08] hover:text-white"
                            >
                                <a href={`#${HOMEPAGE_AGENDA_SECTION_ID}`}>
                                    {hero.secondaryCta}
                                    <ArrowDown className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    <HomepageAgendaCard agenda={hero.agenda} />
                </div>
            </div>
        </section>
    );
}
