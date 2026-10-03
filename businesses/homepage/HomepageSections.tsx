import { HomepageCallButton } from './HomepageCallButton';
import { HOMEPAGE_CODING_HARNESSES } from './homepageIntegrations';
import type { HomepageContent } from './homepageContent';
import { HOMEPAGE_CONTAINER_CLASS_NAME, HOMEPAGE_SECTION_HEADING_CLASS_NAME } from './homepageDesign';
import { PRO_FIRMY_PATH } from '@/businesses/pro-firmy/config';
import { ArrowDown, ArrowRight, Check, CheckCircle2, Circle, Folder, Layers3, Repeat2, UserRound } from 'lucide-react';
import Link from 'next/link';

/** A labelled example, rather than a fabricated live dashboard or customer result. */
function HeroAgendaPreview({ content }: { content: HomepageContent['hero'] }) {
    return (
        <div className="relative min-w-0 rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-[0_20px_80px_-30px_rgba(8,145,178,0.3)] sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-widest text-cyan-700">
                <span>{content.exampleLabel}</span>
                <Layers3 aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="max-w-sm text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                {content.exampleTitle}
            </h2>
            <ol className="relative my-7 space-y-4 border-l border-cyan-200 pl-6">
                {content.cycle.map((step, index) => (
                    <li key={step} className="relative flex items-center gap-3 text-sm font-medium text-slate-700">
                        <span className="absolute -left-[2.2rem] flex h-5 w-5 items-center justify-center rounded-full bg-cyan-50 text-cyan-700 ring-4 ring-white">
                            {index === content.cycle.length - 1 ? (
                                <Repeat2 aria-hidden="true" className="h-3.5 w-3.5" />
                            ) : (
                                <Check aria-hidden="true" className="h-3.5 w-3.5" />
                            )}
                        </span>
                        {step}
                    </li>
                ))}
            </ol>
            <div className="space-y-3 rounded-2xl bg-slate-950 p-4 text-sm sm:p-5">
                <p className="flex gap-2.5 text-cyan-200">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                    {content.outcome}
                </p>
                <p className="flex gap-2.5 text-slate-200">
                    <UserRound aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                    {content.decision}
                </p>
            </div>
            <p className="mt-5 flex gap-2 text-sm text-slate-500">
                <Repeat2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                {content.continuation}
            </p>
        </div>
    );
}

export function HomepageHero({ content }: { content: HomepageContent }) {
    return (
        <section className="bg-[radial-gradient(ellipse_at_80%_15%,#dcf8fa,transparent_65%)] pb-14 pt-28 sm:pb-20 sm:pt-32">
            <div
                className={`${HOMEPAGE_CONTAINER_CLASS_NAME} grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14`}
            >
                <div className="min-w-0">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">
                        {content.hero.eyebrow}
                    </p>
                    <h1 className="text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[3.65rem]">
                        {content.hero.heading}
                        <br />
                        <span className="text-cyan-700">{content.hero.emphasis}</span>
                    </h1>
                    <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
                        {content.hero.description}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                        <HomepageCallButton label={content.callToAction} id="hero-cta" />
                        <Link
                            href="#jak-to-funguje"
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-800"
                        >
                            {content.hero.secondaryAction}
                            <ArrowDown aria-hidden="true" className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
                <HeroAgendaPreview content={content.hero} />
            </div>
        </section>
    );
}

function WorkSteps({ steps, isOngoing = false }: { steps: readonly string[]; isOngoing?: boolean }) {
    return (
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 text-xs font-medium sm:text-sm">
            {steps.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                    {index > 0 && <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-50" />}
                    <span
                        className={
                            isOngoing ? 'rounded-lg bg-white/10 px-2.5 py-2' : 'rounded-lg bg-slate-100 px-2.5 py-2'
                        }
                    >
                        {step}
                    </span>
                </li>
            ))}
            <li aria-hidden="true">
                {isOngoing ? (
                    <Repeat2 className="h-4 w-4 text-cyan-300" />
                ) : (
                    <Circle className="h-3 w-3 text-slate-400" />
                )}
            </li>
        </ol>
    );
}

export function HomepageComparison({ content }: { content: HomepageContent['comparison'] }) {
    return (
        <section id="jak-to-funguje" className="scroll-mt-24 pb-20 sm:pb-24" aria-labelledby="comparison-heading">
            <div className={HOMEPAGE_CONTAINER_CLASS_NAME}>
                <h2 id="comparison-heading" className={`${HOMEPAGE_SECTION_HEADING_CLASS_NAME} mb-8 max-w-3xl`}>
                    {content.heading}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            {content.oneShot.label}
                        </h3>
                        <p className="mb-6 mt-4 text-xl font-semibold text-slate-950 sm:text-2xl">
                            {content.oneShot.request}
                        </p>
                        <WorkSteps steps={content.oneShot.steps} />
                        <p className="mt-6 text-sm leading-relaxed text-slate-600">{content.oneShot.ending}</p>
                    </article>
                    <article className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
                        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
                            <Repeat2 aria-hidden="true" className="h-4 w-4" />
                            {content.agenda.label}
                        </h3>
                        <p className="mb-6 mt-4 text-xl font-semibold sm:text-2xl">{content.agenda.request}</p>
                        <WorkSteps steps={content.agenda.steps} isOngoing />
                        <p className="mt-6 text-sm leading-relaxed text-slate-300">{content.agenda.ending}</p>
                    </article>
                </div>
                <p className="mt-6 max-w-3xl text-base leading-relaxed text-slate-600">{content.bridge}</p>
            </div>
        </section>
    );
}

export function HomepageAgendaModel({ content }: { content: HomepageContent['model'] }) {
    return (
        <section
            id="agenda"
            className="scroll-mt-24 border-y border-cyan-100 bg-cyan-50/60 py-16 sm:py-24"
            aria-labelledby="agenda-heading"
        >
            <div className={HOMEPAGE_CONTAINER_CLASS_NAME}>
                <h2 id="agenda-heading" className={`${HOMEPAGE_SECTION_HEADING_CLASS_NAME} max-w-3xl`}>
                    {content.heading}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                    {content.definition}
                </p>
                <div className="mt-10 rounded-[2rem] border border-cyan-200 bg-white p-5 sm:p-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {content.parts.map((part, index) => (
                            <div key={part.title}>
                                <span
                                    aria-hidden="true"
                                    className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 font-mono text-xs text-cyan-700"
                                >
                                    0{index + 1}
                                </span>
                                <h3 className="text-lg font-semibold text-slate-950">{part.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{part.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="my-6 flex justify-center text-cyan-600">
                        <ArrowDown aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <div className="rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
                        <p className="mb-4 text-sm text-cyan-200">{content.cycleLabel}</p>
                        <WorkSteps steps={content.cycle} isOngoing />
                    </div>
                    <p className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-700" />
                        {content.outcomes}
                    </p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                    <p className="flex items-center gap-2 font-semibold text-slate-950">
                        <UserRound aria-hidden="true" className="h-5 w-5 text-cyan-700" />
                        {content.human}
                    </p>
                    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                        {content.humanActions.map((action) => (
                            <li key={action}>{action}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

export function HomepageTechnology({ content }: { content: HomepageContent['technology'] }) {
    return (
        <section
            id="pod-kapotou"
            className="scroll-mt-24 bg-slate-950 py-16 text-white sm:py-24"
            aria-labelledby="technology-heading"
        >
            <div className={HOMEPAGE_CONTAINER_CLASS_NAME}>
                <h2
                    id="technology-heading"
                    className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]"
                >
                    {content.heading}
                </h2>
                <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <h3 className="text-xl font-semibold">{content.harnessTitle}</h3>
                        <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                            {content.harnessDescription}
                        </p>
                        <ul className="my-6 flex flex-wrap gap-2">
                            {HOMEPAGE_CODING_HARNESSES.map((harness) => (
                                <li
                                    key={harness.id}
                                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-cyan-200"
                                >
                                    {harness.name}
                                </li>
                            ))}
                        </ul>
                        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{content.harnessScope}</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{content.workspaceTitle}</h3>
                        <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                            {content.workspaceDescription}
                        </p>
                        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
                            <p className="mb-4 text-xs text-slate-400">{content.workspaceLabel}</p>
                            <ul className="space-y-3 text-sm text-slate-200">
                                {content.folders.map((folder) => (
                                    <li key={folder} className="flex items-center gap-3">
                                        <Folder aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-300" />
                                        {folder}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-slate-800 pt-6">
                    <p className="max-w-xl text-sm leading-relaxed text-slate-400">{content.independence}</p>
                    <Link
                        href="https://github.com/webgptorg/promptbook"
                        className="inline-flex items-center gap-2 text-sm text-cyan-200 underline underline-offset-4 hover:text-white"
                    >
                        {content.documentation}
                        <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export function HomepageContactSection({ content }: { content: HomepageContent }) {
    return (
        <section id="kontakt" className="scroll-mt-24 bg-cyan-50 py-16 sm:py-24">
            <div className={`${HOMEPAGE_CONTAINER_CLASS_NAME} text-center`}>
                <h2 className={HOMEPAGE_SECTION_HEADING_CLASS_NAME}>{content.contact.heading}</h2>
                <p className="mx-auto mb-7 mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                    {content.contact.description}
                </p>
                <HomepageCallButton label={content.callToAction} id="final-cta" />
                <p className="mt-10 text-sm leading-relaxed text-slate-600">
                    {content.contact.companyPageLabel}
                    <br />
                    <Link
                        href={PRO_FIRMY_PATH}
                        hrefLang="cs"
                        className="font-medium text-cyan-800 underline underline-offset-4"
                    >
                        {content.contact.companyPageLink}
                    </Link>
                </p>
            </div>
        </section>
    );
}
