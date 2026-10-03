'use client';

import type { HomepageContent } from './homepageContent';
import { HOMEPAGE_CONTAINER_CLASS_NAME, HOMEPAGE_SECTION_HEADING_CLASS_NAME } from './homepageDesign';
import { ArrowDown, Check, Repeat2, UserRound } from 'lucide-react';
import { useState } from 'react';

/** Examples explain the general model and its human boundaries; they do not imply preconfigured integrations. */
export function HomepageExamples({ content }: { content: HomepageContent['examples'] }) {
    const [selectedExampleId, setSelectedExampleId] = useState(content.items[0]!.id);
    const selectedExample = content.items.find((example) => example.id === selectedExampleId) ?? content.items[0]!;

    return (
        <section id="agendy" className="scroll-mt-24 py-16 sm:py-24" aria-labelledby="examples-heading">
            <div className={HOMEPAGE_CONTAINER_CLASS_NAME}>
                <h2 id="examples-heading" className={`${HOMEPAGE_SECTION_HEADING_CLASS_NAME} max-w-3xl`}>
                    {content.heading}
                </h2>
                <div
                    role="group"
                    aria-labelledby="examples-heading"
                    className="mb-6 mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
                >
                    {content.items.map((example) => (
                        <button
                            key={example.id}
                            type="button"
                            aria-pressed={selectedExampleId === example.id}
                            aria-controls="agenda-example"
                            onClick={() => setSelectedExampleId(example.id)}
                            className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 ${selectedExampleId === example.id ? 'border-cyan-700 bg-cyan-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-800'}`}
                        >
                            {example.label}
                        </button>
                    ))}
                </div>
                <div
                    id="agenda-example"
                    role="region"
                    aria-label={selectedExample.label}
                    className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white lg:grid-cols-[0.85fr_1.15fr]"
                >
                    <div className="bg-slate-50 p-6 sm:p-8">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-700">
                            {content.exampleLabel}
                        </p>
                        <h3
                            className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {selectedExample.responsibility}
                        </h3>
                        <h4 className="mb-2 mt-8 text-sm font-semibold text-slate-950">{content.contextLabel}</h4>
                        <p className="text-sm leading-relaxed text-slate-600">{selectedExample.context}</p>
                        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                                <UserRound aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-700" />
                                {content.decisionLabel}
                            </h4>
                            <p className="text-sm leading-relaxed text-slate-600">{selectedExample.humanDecision}</p>
                        </div>
                    </div>
                    <ol className="space-y-0 p-6 sm:p-8">
                        {selectedExample.steps.map((step, index) => (
                            <li key={step.title} className="flex gap-4">
                                <div aria-hidden="true" className="flex flex-col items-center">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                                        {index === selectedExample.steps.length - 1 ? (
                                            <Repeat2 className="h-4 w-4" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </span>
                                    {index < selectedExample.steps.length - 1 && (
                                        <div className="flex flex-1 items-center py-3 text-cyan-200">
                                            <ArrowDown className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                                <div className={index < selectedExample.steps.length - 1 ? 'pb-7' : ''}>
                                    <h4 className="pt-1 text-base font-semibold text-slate-950">{step.title}</h4>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
                <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-600">{content.conclusion}</p>
            </div>
        </section>
    );
}
