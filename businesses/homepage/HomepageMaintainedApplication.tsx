import { getHomepageContent, type HomepageLanguage } from '@/businesses/homepage/homepageContent';
import { SectionIntro } from '@/components/section-intro';
import { RotateCcw } from 'lucide-react';

/**
 * The strongest example, walked through step by step: not a website being generated, but one being kept alive
 *
 * Note: The flow closes on itself on purpose. A reader who stops after the last step would still be looking at a
 *       one-shot generator, which is exactly the mental model the page is replacing.
 */
export function HomepageMaintainedApplication({ language }: { readonly language: HomepageLanguage }) {
    const { maintainedApplication } = getHomepageContent(language);

    return (
        <section className="bg-[#04131c] py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <SectionIntro
                    eyebrow={maintainedApplication.eyebrow}
                    title={maintainedApplication.heading}
                    description={maintainedApplication.description}
                    tone="onDark"
                />

                <ol className="mx-auto mt-14 max-w-3xl">
                    {maintainedApplication.steps.map((step, stepIndex) => (
                        <li key={step.title} className="relative flex gap-4 pb-6 sm:gap-6">
                            {/* The line joining the steps, which the last one does not continue */}
                            {stepIndex < maintainedApplication.steps.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className="absolute left-[17px] top-10 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-cyan-300/40 to-cyan-300/10 sm:left-[19px]"
                                />
                            )}

                            <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-[#07222f] text-[14px] font-semibold text-cyan-200 sm:h-10 sm:w-10">
                                {stepIndex + 1}
                            </span>

                            <div className="pt-1">
                                <h3 className="text-[16px] font-semibold text-white sm:text-[17px]">{step.title}</h3>
                                <p className="mt-1.5 text-[14px] leading-relaxed text-white/60 sm:text-[15px]">
                                    {step.description}
                                </p>
                            </div>
                        </li>
                    ))}

                    <li className="flex gap-4 sm:gap-6">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-cyan-300/40 text-cyan-300/70 sm:h-10 sm:w-10">
                            <RotateCcw className="h-4 w-4" />
                        </span>
                        <p className="pt-2.5 text-[14px] font-medium text-cyan-200/80 sm:text-[15px]">
                            {maintainedApplication.loopLabel}
                        </p>
                    </li>
                </ol>

                <p className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 text-[14.5px] leading-relaxed text-white/70 sm:text-[15px]">
                    {maintainedApplication.selfReference}
                </p>
            </div>
        </section>
    );
}
