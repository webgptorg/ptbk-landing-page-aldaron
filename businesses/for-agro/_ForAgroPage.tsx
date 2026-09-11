'use client';

import { czechBusinessFooterProps } from '@/businesses/_generic/czechBusinessFooterProps';
import { forAgroBenefits } from '@/businesses/for-agro/forAgroBenefits';
import { forAgroConversation } from '@/businesses/for-agro/forAgroConversation';
import { forAgroIntegrations } from '@/businesses/for-agro/forAgroIntegrations';
import { forAgroPricing, forAgroPricingFootnotes } from '@/businesses/for-agro/forAgroPricing';
import { forAgroTestimonials } from '@/businesses/for-agro/forAgroTestimonials';
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

export function ForAgroPage() {
    const isLocalhost = useIsLocalhost();

    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="ForAgroPage"
                    title="Chcete dostat agronomické know-how do AI?"
                    requestSent="Děkujeme, ozveme se."
                    specialistContact="Ozve se vám náš specialista."
                    ceoOf="CEO Promptbooku"
                    description="Domluvte si bezplatnou a nezávaznou konzultaci. Společně projdeme, jak dostat expertizu, compliance a provozní know-how k týmům v různých regionech."
                    emailPlaceholder="jmeno@agrofirma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo."
                    genericErrorMessage="Nastala chyba. Zkuste to prosím znovu."
                    sending="Odesílání..."
                    scheduleCall="Domluvit konzultaci"
                />
            </Suspense>

            <main className="min-h-screen">
                <Header
                    tryItYourselfText={null}
                    whyPromptbookText="Proč Promptbook?"
                    integrationsText="Případy použití"
                    pricingText="Ceník"
                    getStartedText="Začít"
                />

                <Suspense>
                    <OldHeroSection
                        conversation={forAgroConversation}
                        backgroundImage="/backgrounds/for-agro.svg"
                        getHero={({ you }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium">
                                        <BookOpen className="h-4 w-4" />
                                        AI pro {you || 'agronomii a zemědělské provozy'}
                                    </div>
                                    <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                        Vytvořte AI, která{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            rozumí
                                        </span>{' '}
                                        {you || <>agronomii vašeho podniku</>}
                                    </h1>
                                    <p className="max-w-2xl text-lg leading-relaxed text-white sm:text-xl">
                                        S Promptbookem převedete agronomické know-how, regulatorní pravidla a provozní
                                        postupy do AI agentů, kteří pomohou týmům v různých regionech.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-center text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    >
                                        Začít
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>

                                <div className="flex flex-wrap items-center gap-4 text-sm opacity-80 sm:gap-8">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Open source
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Data máte pod kontrolou
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Stejná expertiza v každém regionu
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

                <BenefitsSection
                    title="AI pro agronomy a zemědělské firmy"
                    description="Dostaňte odborné know-how k lidem v terénu rychleji a držte compliance pod kontrolou. AI pracuje s vašimi dokumenty a postupy."
                    benefits={forAgroBenefits}
                />
                <IntegrationsSection
                    title="Kde AI pomůže v agronomii"
                    description="Od dotazů z terénu po compliance a logistiku. AI můžete použít tam, kde ji tým potřebuje."
                    integrations={forAgroIntegrations}
                />
                <TestimonialsSection
                    title="Co o Promptbooku říkají jeho uživatelé"
                    description="Promptbook pomáhá dostat znalosti z dokumentů a hlav lidí do nástrojů, které se dají používat každý den."
                    testimonials={forAgroTestimonials}
                />
                <PricingSection
                    title="Začněte pilotem"
                    description="Začněte u jednoho týmu a podle potřeby přidejte další regiony nebo celý holding."
                    plans={forAgroPricing}
                    footnotes={forAgroPricingFootnotes}
                    monthlyText="Měsíčně"
                    yearlyText="Ročně"
                    saveText="Ušetřete"
                    openSourceGuaranteeText="Promptbook je open source. Začněte pilotem bez závislosti na jednom dodavateli. Pokud se pro agronomii nehodí, řekneme vám to rovnou."
                />
                {isLocalhost && <PlaygroundSection />}
                <TeamSection
                    title="Náš tým"
                    description="Pomáháme firmám převést odborné znalosti, procesy a dokumenty do AI, která se dá bezpečně používat i v regulovaném provozu."
                    jiriDescription={
                        <>
                            Matematik s titulem Ph.D. a bývalý výzkumník v{' '}
                            <Link href="https://www.it4i.cz/">Národním superpočítačovém centru IT4I</Link>. Navrhuje,
                            jak složité odborné znalosti a metodiky převést do srozumitelného postupu pro AI.
                        </>
                    }
                    pavolDescription={
                        <>
                            <Link href="https://www.pavolhejny.com/">Open-source přispěvatel</Link> s více než 15 lety
                            zkušeností ve vývoji softwaru. Zaměřuje se na praktické nasazení AI agentů, integrace a
                            bezpečné zapojení do firemních procesů.
                        </>
                    }
                />
                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}
