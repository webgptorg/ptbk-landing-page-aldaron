import { Suspense } from 'react';
import { AiTaKrajtaCollaborationForm } from './AiTaKrajtaCollaborationForm';
import { AiTaKrajtaFooter } from './AiTaKrajtaFooter';
import { AiTaKrajtaLink as Link } from './AiTaKrajtaLink';
import { AiTaKrajtaSubpageHeader } from './AiTaKrajtaSubpageHeader';
import {
    AI_TA_KRAJTA_COLLABORATION_GUIDES,
    AI_TA_KRAJTA_EDITORIAL_PRINCIPLES,
    AI_TA_KRAJTA_MEDIA_KIT_STATISTICS,
    AI_TA_KRAJTA_MEDIA_KIT_STATISTICS_SOURCE,
    AI_TA_KRAJTA_PARTNERSHIP_OFFERS,
} from './aiTaKrajtaMediaKitContent';
import {
    AI_TA_KRAJTA_BRANDING_SUBPAGE,
    AI_TA_KRAJTA_LINKEDIN_URL,
    AI_TA_KRAJTA_MEDIA_KIT_CONTACT_SECTION_ID,
    AI_TA_KRAJTA_MEDIA_KIT_SUBPAGE,
    createAiTaKrajtaMediaKitCollaborationPath,
} from './config';
import { ArrowUpRight } from 'lucide-react';

/** Collaboration choices first, one contact form last. The established URL and inquiry links stay valid. */
export function AiTaKrajtaMediaKitPage() {
    return (
        <div className="ai-ta-krajta-supporting-page min-h-screen bg-[#232a25] font-sans antialiased">
            <AiTaKrajtaSubpageHeader subpage={AI_TA_KRAJTA_MEDIA_KIT_SUBPAGE} />
            <main>
                <section className="border-b border-white/10">
                    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                        <p className="text-sm font-semibold text-[#b5c2ff]">Spolupráce s AI ta Krajta</p>
                        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                            Host, téma nebo partnerství.
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/65">
                            Máte co říct k AI, tip na příští díl nebo chcete podcast podpořit?
                            Vyberte si možnost níže, nebo nám rovnou napište.
                        </p>
                        <Link href={createAiTaKrajtaMediaKitCollaborationPath('jine')} className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-[#ff6b6b] px-5 text-sm font-semibold text-[#1a201c]">
                            Napsat nám
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                <section id="napady-a-hoste" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16">
                    <h2 className="text-2xl font-bold text-white">Hosté a tipy na témata</h2>
                    <p className="mt-3 max-w-2xl leading-relaxed text-white/60">
                        Účast v redakčním dílu není placená nabídka. Hosta a téma vybíráme podle toho, co přinesou posluchačům.
                    </p>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {AI_TA_KRAJTA_COLLABORATION_GUIDES.filter((guide) => guide.collaborationKind === 'host' || guide.collaborationKind === 'tema').map((guide) => (
                            <article key={guide.collaborationKind} className="flex flex-col rounded-2xl border border-white/10 p-6">
                                <h3 className="text-xl font-semibold text-white">{guide.title}</h3>
                                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/65">{guide.description}</p>
                                <p className="mt-3 text-sm leading-relaxed text-white/65">{guide.steps[0]}</p>
                                <Link href={createAiTaKrajtaMediaKitCollaborationPath(guide.collaborationKind)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b5c2ff]">
                                    {guide.collaborationKind === 'host' ? 'Navrhnout hosta' : 'Poslat tip'}
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="nabidka" className="scroll-mt-20 border-y border-white/10 bg-[#1a201c]/45">
                    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
                        <h2 className="text-2xl font-bold text-white">Partnerství a sponzoring</h2>
                        <p className="mt-3 max-w-2xl leading-relaxed text-white/60">
                            Pro firmy, které chtějí oslovit české a slovenské posluchače se zájmem o AI.
                            Rozsah a termín domluvíme předem.
                        </p>
                        <div className="mt-6 grid gap-4 lg:grid-cols-3">
                            {AI_TA_KRAJTA_PARTNERSHIP_OFFERS.map((offer) => (
                                <article key={offer.id} className="flex flex-col rounded-2xl border border-white/10 p-6">
                                    <h3 className="text-xl font-semibold text-white">{offer.title}</h3>
                                    <p className="mt-3 font-semibold text-[#ffb1a6]">{offer.priceLabel}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-white/65">{offer.description}</p>
                                    <ul className="mt-4 flex-1 list-disc space-y-2 pl-4 text-sm leading-relaxed text-white/65">
                                        {offer.deliverables.map((item) => <li key={item}>{item}</li>)}
                                    </ul>
                                    <Link href={createAiTaKrajtaMediaKitCollaborationPath(offer.collaborationKind)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#b5c2ff]">
                                        {offer.callToActionLabel}
                                        <ArrowUpRight className="h-4 w-4 shrink-0" />
                                    </Link>
                                </article>
                            ))}
                        </div>
                        <div id="redakcni-principy" className="mt-8 scroll-mt-20">
                            <h3 className="text-lg font-semibold text-white">Redakční pravidla</h3>
                            <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-relaxed text-white/65">
                                {AI_TA_KRAJTA_EDITORIAL_PRINCIPLES.map((principle) => <li key={principle}>{principle}</li>)}
                            </ul>
                        </div>
                        <details className="mt-8 border-t border-white/10 pt-5">
                            <summary className="cursor-pointer text-sm font-medium text-white/75">Media kit: čísla a podklady pro partnery</summary>
                            <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                {AI_TA_KRAJTA_MEDIA_KIT_STATISTICS.map((statistic) => (
                                    <div key={statistic.id}>
                                        <dt className="text-sm text-white/60">{statistic.label}</dt>
                                        <dd className="mt-1 text-xl font-bold text-white">{statistic.value}</dd>
                                        <p className="mt-1 text-xs text-white/45">{statistic.description}</p>
                                    </div>
                                ))}
                            </dl>
                            <p className="mt-4 text-xs text-white/45">{AI_TA_KRAJTA_MEDIA_KIT_STATISTICS_SOURCE}</p>
                            <Link href={AI_TA_KRAJTA_BRANDING_SUBPAGE.path} className="mt-4 inline-block text-sm text-[#b5c2ff]">Logo a podklady ke stažení</Link>
                        </details>
                    </div>
                </section>

                <section id={AI_TA_KRAJTA_MEDIA_KIT_CONTACT_SECTION_ID} className="mx-auto grid max-w-6xl scroll-mt-20 gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Napište nám</h2>
                        <p className="mt-4 leading-relaxed text-white/65">
                            Stačí stručně popsat nápad a přidat odkazy. U partnerství pomůže také termín a orientační rozpočet.
                        </p>
                        <a href={AI_TA_KRAJTA_LINKEDIN_URL} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm text-[#b5c2ff] underline underline-offset-4">Nebo napište na LinkedIn</a>
                    </div>
                    <Suspense fallback={<div className="min-h-96" aria-hidden="true" />}>
                        <AiTaKrajtaCollaborationForm />
                    </Suspense>
                </section>
            </main>
            <AiTaKrajtaFooter />
        </div>
    );
}
