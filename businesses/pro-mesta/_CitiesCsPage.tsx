'use client'; // <- TODO: !!! Maybe not ideal here

import { czechBusinessFooterProps } from '@/businesses/_generic/czechBusinessFooterProps';
import { citiesCsBenefits } from '@/businesses/pro-mesta/citiesCsBenefits';
import { citiesCsConversation } from '@/businesses/pro-mesta/citiesCsConversation';
import { citiesCsIntegrations } from '@/businesses/pro-mesta/citiesCsIntegrations';
import { citiesCsPricing, citiesCsPricingFootnotes } from '@/businesses/pro-mesta/citiesCsPricing';
import { citiesCsTestimonials } from '@/businesses/pro-mesta/citiesCsTestimonials';
import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { IntegrationsSection } from '@/components/integrations-section';
import { OldHeroSection } from '@/components/old-hero-section';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Button } from '@/components/ui/button';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export function CitiesCsPage() {
    const isLocalhost = useIsLocalhost();

    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="ProMestaPage"
                    title="Chcete zjistit, kde může AI pomoct vašemu městu?"
                    requestSent="Požadavek jsme přijali"
                    specialistContact="Ozveme se vám brzy."
                    ceoOf="CEO společnosti Promptbook"
                    description="Domluvte si bezplatnou konzultaci bez závazků. Zjistěte, jak může Promptbook pracovat se znalostmi vašeho úřadu a pomoct vašemu týmu."
                    emailPlaceholder="jmeno@mesto.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte e-mail nebo telefon."
                    sending="Odesílám..."
                    scheduleCall="Domluvit konzultaci"
                />
            </Suspense>
            <main className="min-h-screen">
                <Header
                    tryItYourselfText={null} // "Vyzkoušejte si to sami"
                    whyPromptbookText="Proč Promptbook?"
                    integrationsText="Integrace"
                    pricingText="Ceník"
                    getStartedText="Začněte"
                />
                <Suspense>
                    <OldHeroSection
                        conversation={citiesCsConversation}
                        backgroundImage="/backgrounds/pro-mesta.svg"
                        getHero={({ you }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        AI pro {you || 'města a obce'}
                                    </div>
                                    <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                        AI odborník, který{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            rozumí
                                        </span>{' '}
                                        {you || <>vaší obci</>}
                                    </h1>
                                    <p className="max-w-2xl text-lg leading-relaxed text-white sm:text-xl">
                                        AI odborník pracuje s pravidly a znalostmi vašeho úřadu.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-center text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    >
                                        Začít
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>

                                <div className="flex flex-wrap items-center gap-4 text-sm opacity-80 sm:gap-8">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Open-source řešení
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Data máte pod kontrolou
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Nasadíte ho jednoduše
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

                <BenefitsSection
                    title="AI pro města a obce"
                    description="Pomůže úřadu zrychlit práci a snížit administrativní zátěž. Vychází přitom z pravidel, dokumentů a znalostí vašeho města."
                    benefits={citiesCsBenefits}
                />
                <IntegrationsSection
                    title="Kde může AI odborník pomoct"
                    description="Nemusí zůstat jen na webu. Může být součástí nástrojů, které úřad používá každý den."
                    integrations={citiesCsIntegrations}
                />
                <TestimonialsSection
                    title="Co o Promptbooku říkají"
                    description="Pár slov od lidí, kteří ho znají."
                    testimonials={citiesCsTestimonials}
                />

                {/*
                <Suspense>
                    <TryItYourselfSection
                        initialBook={citiesCsBook}
                        tryItYourself="Vyzkoušejte si to sami"
                        tryChatting="Zkuste si popovídat s {agentName} sami:"
                    />
                </Suspense>
                */}
                <PricingSection
                    title="Ceník pro obce i města"
                    description="Plány máme pro malé obce i velká města. Cena je jasná, bez skrytých poplatků a složitých smluv."
                    plans={citiesCsPricing}
                    footnotes={citiesCsPricingFootnotes}
                    monthlyText="Měsíčně"
                    yearlyText="Ročně"
                    saveText="Ušetřete"
                    openSourceGuaranteeText={' '}
                />
                {isLocalhost && <PlaygroundSection />}
                <TeamSection
                    title="Tým Promptbooku"
                    description="Pomáháme obcím a městům dostat umělou inteligenci do běžné práce."
                    jiriDescription={
                        <>
                            Ph.D. z matematiky. Dříve výzkumník v{' '}
                            <Link href="https://www.it4i.cz/">Národním superpočítačovém centru IT4I</Link>.
                        </>
                    }
                    pavolDescription={
                        <>
                            Aktivní <Link href="https://www.pavolhejny.com/">open-source přispěvatel</Link> z Česka.
                            Software vyvíjí přes 15 let.
                        </>
                    }
                />
                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}

/**
 * TODO: Zig-zag the bg of the sections
 */
