'use client';

import { czechBusinessFooterProps } from '@/businesses/_generic/czechBusinessFooterProps';
import {
    onlineWorkshopContentItems,
    onlineWorkshopFaqs,
    onlineWorkshopFitCards,
    createOnlineWorkshopHeroBullets,
    onlineWorkshopImpactMetrics,
    onlineWorkshopPainPoints,
    onlineWorkshopScheduleItems,
    onlineWorkshopStats,
    onlineWorkshopTerminalMetrics,
} from '@/businesses/online-workshop/onlineWorkshopContent';
import { OnlineWorkshopRegistrationForm } from '@/businesses/online-workshop/OnlineWorkshopRegistrationForm';
import { useWorkshopParticipantOfflineSupport } from '@/businesses/online-workshop/participant/useWorkshopParticipantOfflineSupport';
import { onlineWorkshopTestimonials } from '@/businesses/online-workshop/onlineWorkshopTestimonials';
import { AiSupervizeTerminal } from '@/businesses/ai-supervize/AiSupervizeTerminal';
import { FAQSection } from '@/components/faq-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { SectionIntro } from '@/components/section-intro';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Button } from '@/components/ui/button';
import { AI_SUPERVIZE_MINI_PATH } from '@/lib/discounts/discountPlaces';
import {
    formatCzechWorkshopDuration,
    formatCzechWorkshopRelativeDate,
    formatCzechWorkshopTime,
} from '@/lib/workshops/workshopDate';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CheckCircle, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type OnlineWorkshopPageProps = {
    readonly workshops: readonly EventOccurrence[];

    /**
     * Moment the server built this page at, from which a term near enough is named rather than merely dated
     */
    readonly currentTime: string;
};

export function OnlineWorkshopPage({ workshops, currentTime }: OnlineWorkshopPageProps) {
    useWorkshopParticipantOfflineSupport();
    const nearestUpcomingWorkshop = workshops[0] ?? null;
    const nearestWorkshopDateLabel =
        nearestUpcomingWorkshop === null
            ? null
            : formatCzechWorkshopRelativeDate(nearestUpcomingWorkshop.startsAt, currentTime);
    const nearestWorkshopTimeLabel =
        nearestUpcomingWorkshop === null ? null : formatCzechWorkshopTime(nearestUpcomingWorkshop.startsAt);
    const nearestWorkshopDurationLabel =
        nearestUpcomingWorkshop === null
            ? '60 minut + Q&A'
            : formatCzechWorkshopDuration(nearestUpcomingWorkshop.startsAt, nearestUpcomingWorkshop.endsAt);
    const heroBullets = createOnlineWorkshopHeroBullets(nearestWorkshopDurationLabel);

    return (
        <main className="min-h-screen bg-white">
            <Header
                getStartedText="Rezervovat místo"
                primaryAction={{ label: 'Rezervovat místo', href: '#registrace', mobileLabel: 'Chci místo' }}
                secondaryAction={{ label: 'AI Supervize Mini', href: AI_SUPERVIZE_MINI_PATH }}
                centerContent={
                    <>
                        <span>🔥</span>
                        <span>
                            Online workshop zdarma ·{' '}
                            <strong className="text-gray-900">
                                {nearestWorkshopDateLabel === null
                                    ? 'další termíny připravujeme'
                                    : `${nearestWorkshopDateLabel} v ${nearestWorkshopTimeLabel}`}
                            </strong>
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
                                    Online workshop zdarma ·{' '}
                                    {nearestWorkshopDateLabel === null
                                        ? 'další termíny připravujeme'
                                        : `${nearestWorkshopDateLabel} · ${nearestWorkshopTimeLabel}`}
                                </div>

                                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                    Jak s AI agenty psát produkční kód{' '}
                                    <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                        a nepřepisovat po nich všechno
                                    </span>
                                </h1>

                                <p className="max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                                    Pavol Hejný naživo projde workflow od issue po merge na reálném repu. Za{' '}
                                    {nearestWorkshopDurationLabel} uvidíš, kde se agenti lámou a jak jim nastavit
                                    mantinely.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-center text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                >
                                    <Link href="#registrace">
                                        Rezervovat místo zdarma
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-white/20 bg-white/10 px-8 py-6 text-center text-lg text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white"
                                >
                                    <Link href={AI_SUPERVIZE_MINI_PATH}>
                                        Navazující placený workshop
                                    </Link>
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
                                titleBarText={`claude - online-workshop - ${nearestWorkshopTimeLabel ?? 'brzy'}`}
                                commandName="claude"
                                commandAction="implement"
                                commandArgs="--issue 142 --branch feat/pdf-export"
                                initializingText="Načítám kontext repozitáře..."
                                okLines={['Plán schválen: 4 kroky', 'Testy prošly (12/12)', 'Typecheck bez chyb']}
                                reportTitle="UKÁZKA WORKSHOPU"
                                reportSubtitle="Workflow s AI agentem, před a po"
                                doneText="PR #143 připraven k review."
                                metrics={onlineWorkshopTerminalMetrics}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id="bolesti" className="bg-slate-50 py-20">
                <div className="container mx-auto px-4">
                    <SectionIntro
                        eyebrow="Proč tenhle workshop děláme"
                        title={
                            <>
                                Agent ti napíše feature za hodinu.{' '}
                                <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                                    Tým ji pak týden dává dohromady.
                                </span>
                            </>
                        }
                    />

                    <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
                        {onlineWorkshopStats.map((stat) => (
                            <div key={stat.source} className="rounded-2xl border border-slate-200 bg-white p-6">
                                <div className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-3xl font-extrabold text-transparent">
                                    {stat.value}
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">{stat.description}</p>
                                <span className="mt-3 block text-xs uppercase tracking-wide text-slate-400">
                                    {stat.source}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {onlineWorkshopPainPoints.map((painPoint) => (
                            <div
                                key={painPoint.title}
                                className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50">
                                    <painPoint.icon className="h-5 w-5 text-cyan-700" />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-slate-950">{painPoint.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{painPoint.description}</p>
                                <p className="mt-3 text-sm font-semibold italic text-slate-500">
                                    → {painPoint.consequence}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {onlineWorkshopFitCards.map((fitCard) => (
                            <div
                                key={fitCard.title}
                                className={
                                    fitCard.isPositive
                                        ? 'rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 text-sm text-slate-600'
                                        : 'rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600'
                                }
                            >
                                <b className="mb-2 block font-bold text-slate-950">{fitCard.title}</b>
                                {fitCard.description}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="obsah" className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <SectionIntro
                        eyebrow="Co si projdeme"
                        title={
                            <>
                                Šest věcí, které si{' '}
                                <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                                    můžeš použít v týmu hned další den
                                </span>
                            </>
                        }
                    />

                    <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2">
                        {onlineWorkshopContentItems.map((item) => (
                            <div
                                key={item.title}
                                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
                                    <item.icon className="h-5 w-5 text-cyan-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-950">{item.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="lektor" className="overflow-hidden bg-slate-50 py-20">
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

                        <div className="pb-4 lg:pb-8">
                            <p className="text-sm font-semibold uppercase text-cyan-700">Kdo workshop vede</p>
                            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Pavol Hejný</h2>
                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                Vývojář s více než 15 lety praxe a aktivní{' '}
                                <Link
                                    href="https://www.pavolhejny.com/"
                                    className="font-semibold text-cyan-700 underline-offset-4 hover:underline"
                                >
                                    open-source contributor
                                </Link>
                                . Už tři roky staví s AI agenty reálné produkty a učí to týmy ve firmách.
                            </p>
                            <p className="mt-4 text-base leading-relaxed text-slate-600">
                                Workshop vede spolu s Jiřím Jahnem, CEO Promptbooku.
                            </p>

                            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                                <Image
                                    src={jiriJahn}
                                    alt="Jiří Jahn"
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-slate-950">Jiří Jahn</p>
                                    <p className="text-xs text-slate-400">CEO Promptbooku, workshop spolumoderuje s Pavolem</p>
                                </div>
                            </div>

                            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                <Button asChild className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
                                    <Link href="#registrace">Rezervovat místo</Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-full px-6">
                                    <Link href="mailto:pavol@ptbk.io">pavol@ptbk.io</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <TestimonialsSection
                id="reference"
                eyebrow="Ohlasy"
                title={
                    <>
                        Co říkají lidé, kteří s{' '}
                        <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                            se kterými Pavol pracoval
                        </span>
                    </>
                }
                description="Pavol tenhle přístup používá roky na reálných projektech."
                testimonials={onlineWorkshopTestimonials}
                metrics={onlineWorkshopImpactMetrics}
            />

            <section id="registrace" className="bg-slate-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 max-w-3xl">
                        <p className="text-sm font-semibold uppercase text-cyan-700">Registrace</p>
                        <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Vyber si termín</h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            {workshops.length === 0
                                ? 'Další online workshop teď připravujeme.'
                                : 'Všechny workshopy jsou zdarma a online. Odkaz k připojení ti přijde e-mailem.'}
                        </p>
                    </div>

                    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)] lg:items-start">
                        <div className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <CalendarDays className="h-6 w-6 text-cyan-700" />
                                    <h3 className="mt-3 font-bold text-slate-950">
                                        {nearestWorkshopDateLabel ?? 'Termín brzy doplníme'}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {nearestWorkshopTimeLabel === null
                                            ? 'Nový termín doplníme, jakmile ho vypíšeme.'
                                            : `Nejbližší workshop začíná v ${nearestWorkshopTimeLabel}. Odkaz na připojení dostaneš e-mailem.`}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <Clock className="h-6 w-6 text-cyan-700" />
                                    <h3 className="mt-3 font-bold text-slate-950">{nearestWorkshopDurationLabel}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Držíme svižné tempo a necháme prostor i na tvoje dotazy.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                <h3 className="text-xl font-bold text-slate-950">Co tě během hodiny čeká</h3>
                                <div className="mx-auto mt-6 max-w-2xl">
                                    {onlineWorkshopScheduleItems.map((item, index) => {
                                        const Icon = item.icon;
                                        const isLast = index === onlineWorkshopScheduleItems.length - 1;

                                        return (
                                            <div
                                                key={item.time}
                                                className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 sm:grid-cols-[7.5rem_3rem_minmax(0,1fr)]"
                                            >
                                                <div className="pt-1 text-xs font-semibold text-cyan-700 sm:text-right">
                                                    {item.time}
                                                </div>
                                                <div className="relative hidden justify-center sm:flex">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 ${item.badgeClassName}`}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    {!isLast && (
                                                        <div className="absolute top-11 h-[calc(100%-0.75rem)] w-px bg-slate-200" />
                                                    )}
                                                </div>
                                                <div className="pb-6">
                                                    <h4 className="font-semibold text-slate-950">{item.title}</h4>
                                                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <p className="flex items-center gap-2 text-sm text-slate-500">
                                <Users className="h-4 w-4 shrink-0 text-cyan-700" />
                                Po registraci ti automaticky pošleme odkaz k připojení a připomínky.
                            </p>
                        </div>

                        <OnlineWorkshopRegistrationForm workshops={workshops} currentTime={currentTime} />
                    </div>
                </div>
            </section>

            <FAQSection
                faqs={onlineWorkshopFaqs}
                eyebrow="FAQ"
                title={
                    <>
                        Časté otázky k{' '}
                        <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                            online workshopu
                        </span>
                    </>
                }
                description="Obsah, průběh i registrace na jednom místě."
            />

            <Footer {...czechBusinessFooterProps} isTechnologyIncubationShown={true} />
        </main>
    );
}
