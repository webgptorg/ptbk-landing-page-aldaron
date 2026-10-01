import { getHomepageContent, type HomepageLanguage } from '@/businesses/homepage/homepageContent';
import { SectionIntro } from '@/components/section-intro';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

/**
 * Example agendas, which are here to reveal the principle rather than to narrow the product down to any one of them
 *
 * Note: The self-maintaining application is marked as featured because the section after this one explains exactly
 *       that one in depth; nothing else about it is special, so no other example looks like a lesser version of it.
 */
export function HomepageExamples({ language }: { readonly language: HomepageLanguage }) {
    const { examples } = getHomepageContent(language);

    return (
        <section className="bg-slate-50 py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <SectionIntro eyebrow={examples.eyebrow} title={examples.heading} />

                <ul className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {examples.items.map((example) => (
                        <li
                            key={example.name}
                            className={cn(
                                'flex flex-col rounded-3xl border bg-white p-5 sm:p-6',
                                example.isFeatured ? 'border-cyan-300 ring-1 ring-cyan-100' : 'border-slate-200',
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="text-[16px] font-semibold leading-snug text-slate-950">
                                    {example.name}
                                </h3>
                                {example.isFeatured && (
                                    <span className="mt-0.5 shrink-0 rounded-full bg-cyan-100 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-cyan-800">
                                        {examples.featuredLabel}
                                    </span>
                                )}
                            </div>

                            <p className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-slate-500">
                                <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span>
                                    <span className="font-medium text-slate-600">{examples.watchesLabel}:</span>{' '}
                                    {example.watches}
                                </span>
                            </p>

                            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                                {example.tasks.map((task) => (
                                    <li
                                        key={task}
                                        className="flex items-start gap-2.5 text-[13.5px] leading-snug text-slate-600"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"
                                        />
                                        {task}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>

                <p className="mx-auto mt-12 max-w-3xl text-center text-[15px] leading-relaxed text-slate-600 sm:text-base">
                    {examples.abstraction}
                </p>
            </div>
        </section>
    );
}
