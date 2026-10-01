'use client';

import { getHomepageContent, type HomepageLanguage } from '@/businesses/homepage/homepageContent';
import { openQualificationPopup } from '@/components/qualification-popup';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

/**
 * Closing call to action of the homepage
 *
 * Note: Where the company-data page shows a capacity bar, this one says what actually happens on the call. There is
 *       no number of free places to report honestly, so none is shown.
 */
export function HomepageFinalCta({ language }: { readonly language: HomepageLanguage }) {
    const { finalCta } = getHomepageContent(language);

    return (
        <section className="relative overflow-hidden bg-[#072e3f] py-20 sm:py-24">
            <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px),
                        radial-gradient(circle at 50% 45%, rgba(8,145,178,0.35) 0%, transparent 60%)`,
                    backgroundSize: '40px 40px, 40px 40px, 100% 100%',
                }}
            />

            <div className="container relative z-10 mx-auto px-4">
                <div className="mx-auto max-w-2xl text-center">
                    {/* Note: The headline balances its own lines instead of carrying a hard break, which would read
                        well on a desktop and leave a single word stranded on a phone. */}
                    <h2 className="text-balance text-[28px] font-extrabold leading-tight tracking-tight text-white sm:text-[34px] lg:text-[2.6rem]">
                        {finalCta.heading}
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-cyan-100/75 sm:text-[17px]">
                        {finalCta.description}
                    </p>

                    <div className="mt-8">
                        <Button
                            onClick={openQualificationPopup}
                            size="lg"
                            id="final-cta"
                            className="rounded-full bg-white px-8 py-6 text-[15px] font-bold text-[#0e7490] transition-all duration-300 hover:bg-gray-50 hover:shadow-2xl hover:shadow-black/20 motion-safe:hover:scale-[1.02] sm:text-[16px]"
                        >
                            {finalCta.cta}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>

                    <ul className="mx-auto mt-9 max-w-md space-y-2.5 text-left">
                        {finalCta.expectations.map((expectation) => (
                            <li key={expectation} className="flex items-start gap-2.5 text-[14px] text-cyan-100/70">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/80" />
                                {expectation}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
