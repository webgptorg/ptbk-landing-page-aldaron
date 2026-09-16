'use client';

import { czechBusinessFooterProps } from '@/businesses/_generic/czechBusinessFooterProps';
import { AiSupervizeMiniRegistrationForm } from '@/businesses/ai-supervize-mini/AiSupervizeMiniRegistrationForm';
import {
    aiSupervizeMiniImpactMetrics,
    aiSupervizeMiniTakeaways,
    aiSupervizeMiniTerminalMetrics,
    createAiSupervizeMiniFaqs,
    createAiSupervizeMiniHeroBullets,
} from '@/businesses/ai-supervize-mini/aiSupervizeMiniContent';
import { aiSupervizeMiniTestimonials } from '@/businesses/ai-supervize-mini/aiSupervizeMiniTestimonials';
import {
    formatCzechFreeSeatCount,
    getAiSupervizeMiniWorkshopAvailabilityByEventSlug,
    isAiSupervizeMiniWorkshopFull,
    type AiSupervizeMiniWorkshopAvailability,
} from '@/businesses/ai-supervize-mini/workshopRegistration';
import { AiSupervizeTerminal } from '@/businesses/ai-supervize/AiSupervizeTerminal';
import { ScrollToRegistrationSection } from '@/components/discounts/ScrollToRegistrationSection';
import { FAQSection } from '@/components/faq-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Button } from '@/components/ui/button';
import type { ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import { REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import {
    formatEventOccurrenceCapacitySummary,
    formatEventOccurrenceDaySummary,
    formatEventOccurrenceLocationSummary,
    formatEventOccurrencePriceSummary,
    formatEventOccurrenceSummaries,
} from '@/lib/events/eventSummary';
import { formatCzechWorkshopDayAndMonth } from '@/lib/workshops/workshopDate';
import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CheckCircle, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type AiSupervizeMiniPageProps = {
    /**
     * The published terms of this workshop, which is everything this page says about when it is held
     *
     * Note: Nothing about a term is written into this page. A term is added, moved, or withdrawn in the administration
     *       of events, and this page follows it.
     */
    readonly events: readonly EventOccurrence[];
    readonly initialDiscountCode: string;
    readonly initialActiveDiscountByPlaceId: ActiveDiscountByPlaceId;
    readonly workshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[] | null;

    /**
     * Moment the server built this page at, from which a term near enough is named rather than merely dated
     */
    readonly currentTime: string;
};

/**
 * How many seats every published term still has, as the header of the page announces it
 *
 * Note: A term whose capacity could not be read says so rather than being announced as empty, and a term nobody has to
 *       be turned away from says it has room rather than naming a number it does not have.
 */
function getWorkshopSeatSummary(
    events: readonly EventOccurrence[],
    workshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[],
): string {
    return events
        .map((event) => {
            const eventDayLabel = formatCzechWorkshopDayAndMonth(event.startsAt);
            const workshopAvailability = getAiSupervizeMiniWorkshopAvailabilityByEventSlug(
                workshopAvailabilities,
                event.slug,
            );

            if (workshopAvailability === null) {
                return `kapacita na ${eventDayLabel} se ověřuje`;
            }

            if (isAiSupervizeMiniWorkshopFull(workshopAvailability)) {
                return `plno na ${eventDayLabel}`;
            }

            if (workshopAvailability.remainingSeatCount === null) {
                return `volná kapacita na ${eventDayLabel}`;
            }

            return `${formatCzechFreeSeatCount(workshopAvailability.remainingSeatCount)} na ${eventDayLabel}`;
        })
        .join(' · ');
}

export function AiSupervizeMiniPage({
    events,
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
    workshopAvailabilities,
    currentTime,
}: AiSupervizeMiniPageProps) {
    const dateSummary = formatEventOccurrenceDaySummary(events);
    const placeSummary = formatEventOccurrenceLocationSummary(events);
    const capacitySummary = formatEventOccurrenceCapacitySummary(events);
    const priceSummary = formatEventOccurrencePriceSummary(events);
    const eventSummaries = formatEventOccurrenceSummaries(events);
    const heroBullets = createAiSupervizeMiniHeroBullets(events);
    const seatSummary =
        workshopAvailabilities === null || events.length === 0
            ? null
            : getWorkshopSeatSummary(events, workshopAvailabilities);

    return (
        <main className="min-h-screen bg-white">
            <ScrollToRegistrationSection
                isScrollRequested={initialDiscountCode !== ''}
                registrationSectionId={REGISTRATION_SECTION_ID}
            />
            <Header
                getStartedText="Přihlásit se"
                primaryAction={{
                    label: 'Přihlásit se',
                    href: `#${REGISTRATION_SECTION_ID}`,
                    mobileLabel: 'Přihlásit',
                }}
                secondaryAction={{ label: 'Pro firmy', href: '/ai-supervize' }}
                centerContent={
                    <>
                        <span>🔥</span>
                        <span>
                            <strong className="text-gray-900">{seatSummary ?? 'Kapacitu ověřujeme'}</strong>
                        </span>
                    </>
                }
            />

            <section
                className="relative flex min-h-screen items-center overflow-hidden pt-16"
                style={{
                    backgroundImage: `url(/backgrounds/ai-supervize.svg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: '50% 100%',
                }}
            >
                <div className="container relative z-10 mx-auto px-4 py-20 text-white">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, x: -48 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.75 }}
                            className="min-w-0 space-y-8"
                        >
                            <div className="space-y-5">
                                <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                                    <CalendarDays className="h-4 w-4" />
                                    {['AI Supervize Mini', dateSummary, placeSummary]
                                        .filter((labelPart) => labelPart !== '')
                                        .join(' · ')}
                                </div>

                                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                    Nechte AI psát kód.{' '}
                                    <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                        Směr udáváte vy
                                    </span>
                                    , ne model.
                                </h1>

                                <p className="max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                                    Jeden den pro vývojáře a produkťáky, kteří s AI staví TypeScript nebo JavaScript
                                    produkt. Nástroje, rizika, verzování, testování a kvalita kódu.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-center text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                >
                                    <Link href={`#${REGISTRATION_SECTION_ID}`}>
                                        Vybrat termín
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-white/20 bg-white/10 px-8 py-6 text-center text-lg text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white"
                                >
                                    <Link href="/ai-supervize">Pro firmy</Link>
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/75 sm:gap-5">
                                {heroBullets.map((bullet) => (
                                    <div key={bullet} className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        {bullet}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 48 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.75, delay: 0.2 }}
                            className="min-w-0"
                        >
                            <AiSupervizeTerminal
                                titleBarText="ai-supervize-mini - workshopy - Praha / online"
                                commandName="promptbook-mini"
                                commandAction="plan"
                                commandArgs="--workshop one-day --stack ts-js"
                                initializingText="Preparing AI development workshop agenda..."
                                okLines={['Loading tool matrix', 'Checking risk checkpoints', 'Preparing PRD workflow']}
                                reportTitle="WORKSHOP PLAN"
                                reportSubtitle="AI development workflow before / after"
                                doneText="Agenda ready. Pick a date and bring a real problem."
                                metrics={aiSupervizeMiniTerminalMetrics}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id={REGISTRATION_SECTION_ID} className="bg-slate-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 max-w-3xl">
                        <p className="text-sm font-semibold uppercase text-cyan-700">Registrace na workshop</p>
                        <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                            Celý den nad vaším workflow
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Přihlásit se může jednotlivec i firma, která chce poslat svoje lidi.
                            {priceSummary === '' ? '' : ` Cena za účastníka je ${priceSummary}.`}
                            {capacitySummary === '' ? '' : ` Kapacita termínů: ${capacitySummary}.`} Ceny jsou konečné,
                            nejsme plátci DPH.
                        </p>
                    </div>

                    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)] lg:items-start">
                        <div className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <MapPin className="h-6 w-6 text-cyan-700" />
                                    <h3 className="mt-3 font-bold text-slate-950">
                                        {placeSummary === '' ? 'Vypsané termíny' : placeSummary}
                                    </h3>
                                    {eventSummaries.length === 0 ? (
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                            Další termín zrovna chystáme. Ozvěte se a dáme vám vědět, jakmile bude
                                            vypsaný.
                                        </p>
                                    ) : (
                                        <ul className="mt-2 space-y-1 text-sm leading-relaxed text-slate-600">
                                            {eventSummaries.map((eventSummary) => (
                                                <li key={eventSummary}>{eventSummary}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <Users className="h-6 w-6 text-cyan-700" />
                                    <h3 className="mt-3 font-bold text-slate-950">
                                        {capacitySummary === '' ? 'Malá skupina' : capacitySummary}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Prezenční skupinu držíme malou, aby se dostalo na dotazy a konkrétní situace
                                        každého. Do online termínu se vejde i větší tým, odkudkoli.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                <h3 className="text-xl font-bold text-slate-950">Co během dne projdeme</h3>
                                <div className="mt-5 grid gap-4">
                                    {aiSupervizeMiniTakeaways.map((item) => (
                                        <div key={item.title} className="flex gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
                                                <item.icon className="h-5 w-5 text-cyan-700" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-950">{item.title}</h4>
                                                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <AiSupervizeMiniRegistrationForm
                            events={events}
                            initialDiscountCode={initialDiscountCode}
                            initialActiveDiscountByPlaceId={initialActiveDiscountByPlaceId}
                            initialWorkshopAvailabilities={workshopAvailabilities}
                            currentTime={currentTime}
                        />
                    </div>
                </div>
            </section>

            <FAQSection
                faqs={createAiSupervizeMiniFaqs(events)}
                eyebrow="FAQ"
                title={
                    <>
                        Časté otázky k{' '}
                        <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                            AI Supervizi Mini
                        </span>
                    </>
                }
                description="Na co se lidé ptají nejčastěji."
            />

            <TestimonialsSection
                id="reference"
                eyebrow="Reference"
                title={
                    <>
                        Co říkají lidé, kteří s{' '}
                        <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                            Pavolem spolupracovali
                        </span>
                    </>
                }
                description="Dvě reference z Pavolovy osobní stránky. Obě jsou o tom, jak rychle se z nápadu stane něco, co doopravdy funguje."
                testimonials={aiSupervizeMiniTestimonials}
                metrics={aiSupervizeMiniImpactMetrics}
            />

            <section className="overflow-hidden bg-white pt-20">
                <div className="container mx-auto px-4">
                    <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,0.9fr)_1fr]">
                        <div className="relative mx-auto w-full max-w-[26rem] self-end lg:max-w-[32rem]">
                            <div className="absolute inset-x-10 bottom-4 h-40 rounded-full bg-cyan-100/80 blur-3xl" />
                            <Image
                                src={pavolHejny}
                                alt="Pavol Hejný"
                                className="relative z-10 block h-auto w-full object-contain"
                                priority={false}
                            />
                        </div>

                        <div className="pb-16 lg:pb-20">
                            <p className="text-sm font-semibold uppercase text-cyan-700">Workshop vede</p>
                            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Pavol Hejný</h2>
                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                Pavol je vývojář s víc než 15 lety praxe a aktivní{' '}
                                <Link
                                    href="https://www.pavolhejny.com/"
                                    className="font-semibold text-cyan-700 underline-offset-4 hover:underline"
                                >
                                    open-source contributor
                                </Link>
                                . AI Supervize stojí na tom, co dělá každý den. Píše kód, dělá code review, řeší tooling
                                a hlídá kvalitu změn. Žádná obecná prezentace o AI.
                            </p>
                            <p className="mt-4 text-base leading-relaxed text-slate-600">
                                Na workshopu ukazuje, jak zadávat práci, kde hlídat rizika a jak testovat a verzovat. A
                                hlavně jak poznat, že vám AI produkt posouvá, a ne jen nafukuje technický dluh.
                            </p>
                            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    asChild
                                    className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
                                >
                                    <Link href={`#${REGISTRATION_SECTION_ID}`}>Přihlásit se</Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-full px-6">
                                    <Link href="mailto:pavol@ptbk.io">pavol@ptbk.io</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer {...czechBusinessFooterProps} isTechnologyIncubationShown={false} />
        </main>
    );
}
