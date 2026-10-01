import {
    getHomepageContent,
    HOMEPAGE_AGENDA_SECTION_ID,
    type HomepageLanguage,
} from '@/businesses/homepage/homepageContent';
import { SectionIntro } from '@/components/section-intro';
import { ArrowRight, ArrowUpRight, RefreshCw, UserCheck } from 'lucide-react';

/**
 * What an agenda is made of, and what happens with it afterwards
 *
 * Note: The three stages are one row on a desktop and one column on a phone, with the arrow between them turning
 *       from pointing right to pointing down, so the diagram reads as a flow at every width.
 */
export function HomepageAnatomy({ language }: { readonly language: HomepageLanguage }) {
    const { anatomy } = getHomepageContent(language);

    return (
        <section id={HOMEPAGE_AGENDA_SECTION_ID} className="scroll-mt-16 bg-white py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <SectionIntro eyebrow={anatomy.eyebrow} title={anatomy.heading} />

                <div className="mx-auto mt-14 max-w-6xl">
                    <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.5fr)_auto_minmax(0,1fr)] lg:gap-0">
                        {/* The durable unit, holding everything the area needs */}
                        <div className="rounded-3xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50/80 to-white p-5 sm:p-7">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                                {anatomy.agendaLabel}
                            </p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {anatomy.parts.map((part) => (
                                    <div
                                        key={part.title}
                                        className="rounded-2xl border border-cyan-100 bg-white px-4 py-3.5"
                                    >
                                        <p className="text-[14.5px] font-semibold text-slate-950">{part.title}</p>
                                        <p className="mt-1 text-[13px] leading-snug text-slate-500">
                                            {part.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <HomepageAnatomyArrow />

                        {/* What the agenda does with all of it, over time */}
                        <div className="flex flex-col gap-4">
                            <div className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    {anatomy.backgroundLabel}
                                </p>
                                <p className="mt-2.5 text-[14px] leading-relaxed text-slate-600">
                                    {anatomy.backgroundDescription}
                                </p>
                            </div>
                            <div className="flex-1 rounded-3xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
                                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                    {anatomy.outcomeLabel}
                                </p>
                                <p className="mt-2.5 text-[14px] leading-relaxed text-slate-600">
                                    {anatomy.outcomeDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* The way back: a person is never written out of the loop */}
                    <p className="mt-4 flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[14px] leading-relaxed text-slate-600">
                        <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                        {anatomy.humanLoop}
                    </p>

                    <p className="mx-auto mt-10 max-w-3xl border-l-2 border-cyan-300 pl-5 text-[15px] leading-relaxed text-slate-600 sm:text-base">
                        {anatomy.notATask}
                    </p>
                </div>
            </div>
        </section>
    );
}

/**
 * The step between the agenda and its work, pointing right on a desktop and down on a phone
 */
function HomepageAnatomyArrow() {
    return (
        <div aria-hidden="true" className="flex items-center justify-center lg:px-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                <ArrowRight className="h-4 w-4 rotate-90 lg:rotate-0" />
            </span>
        </div>
    );
}
