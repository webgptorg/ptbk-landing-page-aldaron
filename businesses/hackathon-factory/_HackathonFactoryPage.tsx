'use client';

import { czechBusinessFooterProps } from '@/businesses/_generic/czechBusinessFooterProps';
import {
    hackathonFactoryAudience,
    hackathonFactoryHighlights,
    hackathonFactoryPrinciples,
    hackathonFactoryPrinciplesNote,
    hackathonFactoryProcess,
    hackathonFactoryProcessNote,
    hackathonFactorySituations,
} from '@/businesses/hackathon-factory/hackathonFactoryContent';
import { hackathonFactoryConversation } from '@/businesses/hackathon-factory/hackathonFactoryConversation';
import {
    hackathonFactoryPricing,
    hackathonFactoryPricingFootnotes,
} from '@/businesses/hackathon-factory/hackathonFactoryPricing';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { FeatureCardsSection } from '@/components/feature-cards-section';
import { Footer } from '@/components/footer';
import { HackathonFactoryLogo } from '@/components/hackathon-factory-logo';
import { Header } from '@/components/header';
import { OldHeroSection } from '@/components/old-hero-section';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { Button } from '@/components/ui/button';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export function HackathonFactoryPage() {
    const isLocalhost = useIsLocalhost();

    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="HackathonFactoryPage"
                    title="Chcete zadat problém nebo se zapojit?"
                    requestSent="Děkujeme, ozveme se."
                    specialistContact="Do 24 hodin vám napíšeme, co může být další krok."
                    ceoOf="CEO AI Web s.r.o."
                    description="Stačí e-mail nebo telefon. Napište nám, co chcete řešit, nebo že se chcete zapojit jako účastník."
                    emailPlaceholder="jmeno@firma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo."
                    genericErrorMessage="Nastala chyba. Zkuste to prosím znovu."
                    sending="Odesílání..."
                    scheduleCall="Napsat nám"
                />
            </Suspense>

            <main className="min-h-screen bg-white">
                <Header
                    tryItYourselfText={null}
                    whyPromptbookText="Jak to funguje"
                    integrationsText="Pro koho"
                    pricingText="Jak se zapojit"
                    getStartedText="Napsat nám"
                    brandLogo={
                        <HackathonFactoryLogo
                            showWordmark={false}
                            className="gap-0"
                            markClassName="h-8 w-8 text-slate-900"
                        />
                    }
                    brandName={
                        <span className="text-xl font-bold text-gray-900">
                            Hackathon <span className="text-slate-900">Factory</span>
                        </span>
                    }
                />

                <Suspense>
                    <OldHeroSection
                        conversation={hackathonFactoryConversation}
                        backgroundImage={null}
                        getHero={() => (
                            <>
                                <div className="space-y-5">
                                    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                                        <HackathonFactoryLogo
                                            showWordmark={false}
                                            className="gap-0"
                                            markClassName="h-7 w-7 text-slate-800"
                                        />
                                        Hackathon Factory: skutečné problémy a lidé, kteří je umějí řešit
                                    </div>

                                    <h1 className="text-5xl font-bold leading-tight text-slate-900 lg:text-6xl">
                                        Spojujeme <span className="text-amber-500">skutečné problémy</span> s týmy,
                                        které je umějí řešit
                                    </h1>

                                    <p className="max-w-2xl text-xl leading-relaxed text-slate-600">
                                        Krátké hackathon sprinty pro CTO, zakladatele startupů, inovátory a developery.
                                        Nejde o hackování pro hackování. Za jeden až dva dny vznikne prototyp, podklad
                                        pro rozhodnutí nebo plán, který použijete hned další den.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Link href="?modal=get-started">
                                        <Button
                                            size="lg"
                                            className="bg-slate-900 text-white hover:bg-slate-700 text-lg px-8 py-6 rounded-full"
                                        >
                                            Přihlásit problém nebo se zapojit
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
                                        Ozveme se do 24 hodin
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600">
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-amber-500" />
                                        1-2 dny intenzivního sprintu
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-amber-500" />
                                        Online i prezenčně
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-amber-500" />
                                        Prototyp, rozhodnutí nebo plán
                                    </div>
                                </div>

                                <div className="max-w-2xl rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
                                    <p className="font-semibold text-slate-900">Není to soutěž o tričko.</p>
                                    <p className="mt-2">
                                        Každý sprint vychází ze zadání z praxe. Bez umělých výzev a teoretických
                                        scénářů. Řešíme skutečný problém a na konci má být něco, co použijete.
                                    </p>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

                <section className="relative z-10 -mt-12 px-4 pb-8">
                    <div className="container mx-auto">
                        <div className="grid gap-4 md:grid-cols-3">
                            {hackathonFactoryHighlights.map((highlight, index) => (
                                <motion.div
                                    key={highlight.label}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: index * 0.08 }}
                                    className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                                >
                                    <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
                                        {highlight.label}
                                    </div>
                                    <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                                        {highlight.value}
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                        {highlight.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <FeatureCardsSection
                    id="benefits"
                    title="Jak Hackathon Factory funguje"
                    description="Nejdřív zadání zpřesníme. Týmy na něm pracují v reálném čase a po sprintu můžete navázat další spoluprací."
                    note={hackathonFactoryProcessNote}
                    cards={hackathonFactoryProcess}
                    columns={3}
                    tone="muted"
                    className="pt-12"
                />

                <FeatureCardsSection
                    id="integrations"
                    title="Pro koho je Hackathon Factory"
                    description="Setkávají se tu lidé s konkrétním problémem a lidé, kteří chtějí stavět. Potřebujeme obě strany."
                    cards={hackathonFactoryAudience}
                    columns={2}
                    tone="white"
                />

                <FeatureCardsSection
                    title="S čím za námi přicházíte"
                    description="Když potřebujete rychle ověřit hypotézu, rozhodnout se, kudy dál, nebo najít tým pro další krok."
                    cards={hackathonFactorySituations}
                    columns={3}
                    tone="contrast"
                />

                <FeatureCardsSection
                    title="Aby sprint měl výsledek"
                    description="Každé zadání posuzujeme podle toho, jestli z něj může vzniknout něco použitelného i po akci."
                    note={hackathonFactoryPrinciplesNote}
                    cards={hackathonFactoryPrinciples}
                    columns={3}
                    tone="muted"
                />

                <TeamSection
                    title="Kdo za tím stojí"
                    description={
                        <>
                            Za Hackathon Factory stojí <strong>AI Web s.r.o.</strong>, tedy Jiří Jahn a Pavol Hejný.
                            <strong> Promptbook</strong> je naše platforma pro nasazování AI agentů v reálném provozu v
                            obcích, na univerzitách a ve firmách. Víme proto, co je použitelné řešení a co je jen
                            technologický hype. Hackathon Factory stavíme z jednoduchého důvodu: novou technologii
                            nejlépe pochopíte při práci na skutečném problému.
                        </>
                    }
                    jiriDescription={
                        <>
                            Matematik s Ph.D. a bývalý výzkumník v{' '}
                            <Link href="https://www.it4i.cz/">IT4Innovations</Link>. Hlídá metodiku, rozsah zadání a
                            kvalitu výstupu, aby sprint vedl k rozhodnutí nebo funkčnímu prototypu, ne k prezentaci,
                            která pak leží v šuplíku.
                        </>
                    }
                    pavolDescription={
                        <>
                            Developer s více než 15 lety praxe a aktivní{' '}
                            <Link href="https://www.pavolhejny.com/">open-source contributor</Link>. Přináší praktický
                            pohled na vývoj, tooling a prototypování. Hlídá, aby výsledek šel udržet v produktu nebo
                            interním procesu i po hackathonu.
                        </>
                    }
                />

                <PricingSection
                    title="Jak se zapojit"
                    description="Zadání i účast vývojářů jsou zdarma. Firmy si mohou připlatit za partnerství s přípravou briefu, moderováním a dotažením výstupů."
                    plans={hackathonFactoryPricing}
                    footnotes={hackathonFactoryPricingFootnotes}
                    showBillingToggle={false}
                    openSourceGuaranteeText="Úvodní 30min konzultace je zdarma a bez závazků. Když zadání pro Hackathon Factory nesedí, řekneme to rovnou a doporučíme jiný postup."
                />

                {isLocalhost && <PlaygroundSection />}

                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}
