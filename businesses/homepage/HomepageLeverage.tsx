import { getHomepageContent, type HomepageLanguage } from '@/businesses/homepage/homepageContent';
import { SectionIntro } from '@/components/section-intro';

/**
 * Where the leverage comes from: existing strong coding agents, any capable vendor, and a folder which keeps the
 * agenda readable
 *
 * Note: It sits this far down the page on purpose. It is the answer to "how", and a visitor who has not yet
 *       understood "what" would read it as a list of features.
 */
export function HomepageLeverage({ language }: { readonly language: HomepageLanguage }) {
    const { leverage } = getHomepageContent(language);

    return (
        <section className="bg-white py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <SectionIntro eyebrow={leverage.eyebrow} title={leverage.heading} />

                <div className="mx-auto mt-14 grid max-w-6xl gap-4 lg:grid-cols-3">
                    {leverage.blocks.map((block) => (
                        <div
                            key={block.title}
                            className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50/60 p-6 sm:p-7"
                        >
                            <h3 className="text-[17px] font-semibold leading-snug text-slate-950">{block.title}</h3>
                            <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-slate-600">
                                {block.description}
                            </p>
                            <ul className="mt-5 flex flex-wrap gap-1.5">
                                {block.facts.map((fact) => (
                                    <li
                                        key={fact}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-medium text-slate-600"
                                    >
                                        {fact}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
