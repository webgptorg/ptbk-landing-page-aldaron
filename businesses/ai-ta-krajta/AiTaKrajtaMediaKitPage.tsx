import { AiTaKrajtaCollaborationForm } from '@/businesses/ai-ta-krajta/AiTaKrajtaCollaborationForm';
import { AiTaKrajtaFooter } from '@/businesses/ai-ta-krajta/AiTaKrajtaFooter';
import {
    AI_TA_KRAJTA_COLLABORATION_GUIDES,
    AI_TA_KRAJTA_EDITORIAL_PRINCIPLES,
    AI_TA_KRAJTA_MEDIA_KIT_FREQUENTLY_ASKED_QUESTIONS,
    AI_TA_KRAJTA_MEDIA_KIT_STATISTICS,
    AI_TA_KRAJTA_MEDIA_KIT_STATISTICS_SOURCE,
    AI_TA_KRAJTA_PARTNERSHIP_OFFERS,
    AI_TA_KRAJTA_PARTNERSHIP_PROCESS,
    AI_TA_KRAJTA_PARTNERSHIP_USE_CASES,
    type AiTaKrajtaPartnershipOffer,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMediaKitContent';
import { AiTaKrajtaSectionHeading } from '@/businesses/ai-ta-krajta/AiTaKrajtaSectionHeading';
import { AiTaKrajtaSubpageCallout } from '@/businesses/ai-ta-krajta/AiTaKrajtaSubpageCallout';
import { AiTaKrajtaSubpageHeader } from '@/businesses/ai-ta-krajta/AiTaKrajtaSubpageHeader';
import {
    AI_TA_KRAJTA_BRANDING_SUBPAGE,
    AI_TA_KRAJTA_LINKEDIN_URL,
    AI_TA_KRAJTA_MEDIA_KIT_CONTACT_SECTION_ID,
    AI_TA_KRAJTA_MEDIA_KIT_SUBPAGE,
    AI_TA_KRAJTA_PLATFORMS,
    createAiTaKrajtaMediaKitCollaborationPath,
} from '@/businesses/ai-ta-krajta/config';
import { ArrowDown, ArrowUpRight, Check, ExternalLink, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

/**
 * A public partnership format and its direct path into the one shared contact form
 */
function AiTaKrajtaPartnershipOfferCard({ offer }: { readonly offer: AiTaKrajtaPartnershipOffer }) {
    return (
        <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <p className="text-sm font-semibold text-[#ffb1a6]">{offer.priceLabel}</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{offer.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{offer.description}</p>
            <ul className="mt-6 grid gap-3">
                {offer.deliverables.map((deliverable) => (
                    <li key={deliverable} className="flex gap-2.5 text-sm leading-relaxed text-white/75">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b5c2ff]" />
                        {deliverable}
                    </li>
                ))}
            </ul>
            <Link
                href={createAiTaKrajtaMediaKitCollaborationPath(offer.collaborationKind)}
                className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#ff6b6b] px-5 text-sm font-semibold text-[#1a201c] transition-transform hover:scale-[1.02]"
            >
                {offer.callToActionLabel}
                <ArrowUpRight className="h-4 w-4" />
            </Link>
        </article>
    );
}

/**
 * Shape reserved while the query-aware contact form reaches the browser
 */
function AiTaKrajtaCollaborationFormFallback() {
    return <div className="min-h-96 rounded-2xl border border-white/10 bg-white/[0.03]" aria-hidden="true" />;
}

/**
 * Detailed public media kit for the podcast, its editorial contributions and commercial partnerships
 */
export function AiTaKrajtaMediaKitPage() {
    return (
        <div className="min-h-screen bg-[#232a25] font-sans antialiased">
            <AiTaKrajtaSubpageHeader subpage={AI_TA_KRAJTA_MEDIA_KIT_SUBPAGE} />

            <main>
                <section className="relative overflow-hidden border-b border-white/10">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-32 -top-44 h-[30rem] w-[30rem] rounded-full bg-[#ff6b6b]/15 blur-3xl"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-28 top-16 h-[28rem] w-[28rem] rounded-full bg-[#6b8cff]/15 blur-3xl"
                    />
                    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b5c2ff]">
                                Spolupráce s AI ta Krajta
                            </p>
                            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
                                Oslovte české a slovenské publikum, které AI opravdu řeší.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
                                Každý týden probíráme novinky, nástroje a dopady AI, často ještě předtím, než se
                                dostanou do mainstreamu. Firmám nabízíme spolupráce s jasným označením a redakční
                                nezávislostí, od krátké integrace po tematickou epizodu do hloubky.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href={createAiTaKrajtaMediaKitCollaborationPath('partnerstvi')}
                                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#ff6b6b] px-6 text-base font-semibold text-[#1a201c] transition-transform hover:scale-[1.02]"
                                >
                                    Probrat partnerství
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="#nabidka"
                                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-base font-medium text-white transition-colors hover:border-white/50"
                                >
                                    Prohlédnout nabídku
                                    <ArrowDown className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="o-podcastu" className="border-b border-white/10 py-16 sm:py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="O podcastu"
                            title="Co se v AI mění, probíráme každý týden."
                            description="AI ta Krajta vychází každý týden na YouTube, Spotify a Apple Podcasts. V každém díle probíráme novinky, nástroje, souvislosti a vedeme otevřenou debatu."
                        />

                        <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {AI_TA_KRAJTA_MEDIA_KIT_STATISTICS.map((statistic) => (
                                <div
                                    key={statistic.id}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                                >
                                    <dt className="text-2xl font-bold tracking-tight text-white">{statistic.value}</dt>
                                    <dd className="mt-2 text-sm font-medium leading-snug text-white/85">
                                        {statistic.label}
                                    </dd>
                                    <p className="mt-2 text-xs leading-relaxed text-white/45">
                                        {statistic.description}
                                    </p>
                                </div>
                            ))}
                        </dl>
                        <p className="mt-4 text-xs leading-relaxed text-white/40">
                            {AI_TA_KRAJTA_MEDIA_KIT_STATISTICS_SOURCE}
                        </p>

                        <div className="mt-12 border-t border-white/10 pt-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                                Kde podcast vychází
                            </p>
                            <ul className="mt-4 flex flex-wrap gap-3">
                                {AI_TA_KRAJTA_PLATFORMS.map((platform) => (
                                    <li key={platform.id}>
                                        <a
                                            href={platform.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-white/75 transition-colors hover:border-white/35 hover:text-white"
                                        >
                                            <span>{platform.label}</span>
                                            <span className="hidden text-white/45 sm:inline">
                                                · {platform.description}
                                            </span>
                                            <ExternalLink className="h-3.5 w-3.5 text-white/45" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8">
                            <AiTaKrajtaSubpageCallout
                                subpage={AI_TA_KRAJTA_BRANDING_SUBPAGE}
                                eyebrow="Chystáte grafiku nebo článek?"
                            />
                        </div>
                    </div>
                </section>

                <section id="pro-koho" className="py-16 sm:py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="Pro koho spolupráce dává smysl"
                            title="Když má značka k tématu co říct."
                            description="Neprodáváme levné reklamní imprese a produkt do dílu netlačíme. Spolupráce má smysl, když sedí značce, tématu i posluchačům."
                        />
                        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                            {AI_TA_KRAJTA_PARTNERSHIP_USE_CASES.map((useCase) => (
                                <li
                                    key={useCase.title}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                                >
                                    <h3 className="text-lg font-semibold text-white">{useCase.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-white/60">{useCase.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section id="nabidka" className="border-y border-white/10 bg-[#1a201c]/45 py-16 sm:py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="Nabídka spolupráce"
                            title="Tři formáty, jasná pravidla."
                            description="Můžeme začít jednou integrací nebo se domluvit na delším partnerství. Cíl a rozsah si řekneme předem, hranice zůstávají stejné."
                        />
                        <div className="mt-10 grid gap-4 lg:grid-cols-3">
                            {AI_TA_KRAJTA_PARTNERSHIP_OFFERS.map((offer) => (
                                <AiTaKrajtaPartnershipOfferCard key={offer.id} offer={offer} />
                            ))}
                        </div>
                    </div>
                </section>

                <section id="napady-a-hoste" className="py-16 sm:py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="Hosté, témata a další nápady"
                            title="Dobrý díl může začít jednou zprávou."
                            description="Nemusíte být firma. Napište nám o hostovi, tématu nebo formátu, který by podle vás stál za díl."
                        />
                        <ul className="mt-10 grid gap-4 md:grid-cols-2">
                            {AI_TA_KRAJTA_COLLABORATION_GUIDES.map((guide) => (
                                <li key={guide.collaborationKind}>
                                    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                                        <h3 className="text-xl font-semibold text-white">{guide.title}</h3>
                                        <p className="mt-3 text-sm leading-relaxed text-white/65">
                                            {guide.description}
                                        </p>
                                        <ol className="mt-6 grid flex-1 gap-3">
                                            {guide.steps.map((step, index) => (
                                                <li
                                                    key={step}
                                                    className="flex gap-3 text-sm leading-relaxed text-white/75"
                                                >
                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6b8cff]/20 text-[11px] font-semibold text-[#c3cdff]">
                                                        {index + 1}
                                                    </span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ol>
                                        <Link
                                            href={createAiTaKrajtaMediaKitCollaborationPath(guide.collaborationKind)}
                                            className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-[#b5c2ff] transition-colors hover:text-white"
                                        >
                                            Napsat nám
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </article>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section id="redakcni-principy" className="border-y border-white/10 bg-[#1a201c]/45 py-16 sm:py-20">
                    <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
                        <AiTaKrajtaSectionHeading
                            eyebrow="Redakční principy"
                            title="Partnerství ano. Názor si nekoupíte."
                            description="Posluchači nám musí věřit. Proto jsou pravidla jasná ještě před první domluvou."
                        />
                        <ul className="grid gap-3">
                            {AI_TA_KRAJTA_EDITORIAL_PRINCIPLES.map((principle) => (
                                <li
                                    key={principle}
                                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-white/80"
                                >
                                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#ffb1a6]" />
                                    {principle}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section id="jak-spoluprace-probiha" className="py-16 sm:py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="Jak to probíhá"
                            title="Od první zprávy k výsledkům."
                            description="Nejdřív si ujasníme cíl a formát. Potom domluvíme epizodu, integraci nebo další kroky."
                        />
                        <ol className="mt-10 grid gap-4 md:grid-cols-5">
                            {AI_TA_KRAJTA_PARTNERSHIP_PROCESS.map((step) => (
                                <li
                                    key={step.number}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                                >
                                    <p className="text-xs font-semibold tracking-[0.16em] text-[#ffb1a6]">
                                        {step.number}
                                    </p>
                                    <h3 className="mt-4 text-base font-semibold text-white">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section id="otazky" className="border-y border-white/10 bg-[#1a201c]/45 py-16 sm:py-20">
                    <div className="mx-auto max-w-3xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="FAQ"
                            title="Nejčastější otázky před první spoluprací."
                            description="Pár odpovědí ještě před prvním hovorem."
                            isCentered
                        />
                        <div className="mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] px-5 sm:px-7">
                            {AI_TA_KRAJTA_MEDIA_KIT_FREQUENTLY_ASKED_QUESTIONS.map((frequentlyAskedQuestion) => (
                                <details key={frequentlyAskedQuestion.question} className="group">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold text-white marker:content-none">
                                        {frequentlyAskedQuestion.question}
                                        <ArrowDown className="h-4 w-4 shrink-0 text-white/50 transition-transform group-open:rotate-180" />
                                    </summary>
                                    <p className="pb-5 text-sm leading-relaxed text-white/60">
                                        {frequentlyAskedQuestion.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <section id={AI_TA_KRAJTA_MEDIA_KIT_CONTACT_SECTION_ID} className="scroll-mt-24 py-16 sm:py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb1a6]">
                                    Kontakt
                                </p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Napište, čeho chcete dosáhnout.
                                </h2>
                                <p className="mt-4 leading-relaxed text-white/65">
                                    Napište nám, jestli řešíte hosta, téma, sponzoring nebo jiný nápad. Ozveme se s
                                    dalším krokem. U tematických epizod nejdřív ověříme, že téma i host sedí redakčně.
                                </p>
                                <a
                                    href={AI_TA_KRAJTA_LINKEDIN_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-white/65 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Napište nám i na LinkedIn
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>

                            <Suspense fallback={<AiTaKrajtaCollaborationFormFallback />}>
                                <AiTaKrajtaCollaborationForm />
                            </Suspense>
                        </div>
                    </div>
                </section>
            </main>

            <AiTaKrajtaFooter />
        </div>
    );
}
