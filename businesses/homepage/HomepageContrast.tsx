import { getHomepageContent, type HomepageLanguage } from '@/businesses/homepage/homepageContent';
import { SectionIntro } from '@/components/section-intro';
import { Infinity as InfinityIcon, Zap } from 'lucide-react';

/**
 * The difference the whole page stands on, drawn as two columns a visitor can read in one glance
 *
 * Note: On a phone the two columns become one pair per compared aspect, so the contrast survives the narrow screen
 *       instead of turning into two unrelated lists scrolled minutes apart.
 */
export function HomepageContrast({ language }: { readonly language: HomepageLanguage }) {
    const { contrast } = getHomepageContent(language);

    return (
        <section className="bg-slate-50 py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <SectionIntro eyebrow={contrast.eyebrow} title={contrast.heading} />

                <div className="mx-auto mt-14 max-w-4xl">
                    <div className="grid grid-cols-2 gap-3 sm:gap-5">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-6">
                            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                <Zap className="h-3.5 w-3.5" />
                                {contrast.oneShotLabel}
                            </p>
                            <p className="mt-2 text-[15px] font-medium text-slate-500 sm:text-base">
                                {contrast.oneShotClaim}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 px-4 py-4 sm:px-6">
                            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                                <InfinityIcon className="h-3.5 w-3.5" />
                                {contrast.agendaLabel}
                            </p>
                            <p className="mt-2 text-[15px] font-semibold text-slate-950 sm:text-base">
                                {contrast.agendaClaim}
                            </p>
                        </div>
                    </div>

                    <dl className="mt-3 space-y-3 sm:mt-5 sm:space-y-4">
                        {contrast.rows.map((row) => (
                            <div key={row.aspect}>
                                <dt className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    {row.aspect}
                                </dt>
                                <dd className="grid grid-cols-2 gap-3 sm:gap-5">
                                    <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[13.5px] leading-snug text-slate-500 sm:px-6 sm:text-[15px]">
                                        {row.oneShot}
                                    </p>
                                    <p className="rounded-2xl border border-cyan-200 bg-cyan-50/70 px-4 py-3.5 text-[13.5px] font-medium leading-snug text-slate-900 sm:px-6 sm:text-[15px]">
                                        {row.agenda}
                                    </p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
