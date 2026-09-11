'use client';

import { industryIntegrations } from '@/businesses/for-industry/industryIntegrations';
import { industryPricing } from '@/businesses/for-industry/industryPricing';
import { industryTestimonials } from '@/businesses/for-industry/industryTestimonials';
import { industryConversation } from '@/businesses/for-industry/industryConversation';
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
import { TryItYourselfSection } from '@/components/try-it-yourself-section';
import { Button } from '@/components/ui/button';
import forIndustryBook from '@/businesses/for-industry/for-industry.book';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { industryBenefits } from '@/businesses/for-industry/industryBenefits';

export function ForIndustryPage() {
    const isLocalhost = useIsLocalhost();
    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="ForIndustryPage"
                    title="Want to put your technical knowledge to work?"
                    requestSent="Request sent."
                    specialistContact="A specialist will be in touch soon."
                    ceoOf="CEO of Promptbook"
                    description="Book a free, no-obligation call to discuss how Promptbook could organize your company's knowledge and help your team."
                    emailPlaceholder="name@company.com"
                    phonePlaceholder="+1 555 000 0000"
                    errorNoEmailOrPhone="Enter an email address or phone number."
                    genericErrorMessage="Something went wrong. Please try again."
                    sending="Sending..."
                    scheduleCall="Book a call"
                />
            </Suspense>
            <main className="min-h-screen">
                <Header language="en" brandHref="/" />
                <Suspense>
                    <OldHeroSection
                        conversation={industryConversation}
                        backgroundImage="/backgrounds/for-industry.svg"
                        getHero={({ you }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        AI for {you || 'industrial operations'}
                                    </div>
                                    <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                        Give {you || 'your industrial team'} an AI that{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            knows your procedures
                                        </span>
                                    </h1>
                                    <p className="max-w-2xl text-lg leading-relaxed text-white sm:text-xl">
                                        With Promptbook, you turn technical manuals, company rules, and maintenance
                                        know-how into simple <b>Books</b>. Use them to build AI agents that answer
                                        questions in your company's context.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-center text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    >
                                        Book a free call
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>

                                <div className="flex flex-wrap items-center gap-4 text-sm opacity-80 sm:gap-8">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Open source
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Your data stays under your control
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Easy to set up
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>
                <Suspense>
                    <TryItYourselfSection
                        initialBook={forIndustryBook}
                        tryItYourself="Try the industry advisor"
                        tryChatting="Ask the industry advisor a question:"
                    />
                </Suspense>
                <BenefitsSection
                    title="AI for engineering and maintenance teams"
                    description="Put manuals, procedures, and maintenance know-how where technicians and support staff can use them."
                    benefits={industryBenefits}
                />
                <IntegrationsSection
                    title="Where industry teams can use it"
                    description="Put the same technical knowledge in support chat, email, engineering tools, and internal apps."
                    integrations={industryIntegrations}
                />
                <TestimonialsSection
                    language="en"
                    eyebrow="User perspectives"
                    title="What users say about Promptbook"
                    description="A couple of perspectives from people who use Promptbook."
                    testimonials={industryTestimonials}
                />
                <TeamSection
                    title="Who's behind Promptbook"
                    description="We help companies turn technical knowledge, processes, and documents into AI they can use safely at work."
                    jiriDescription={
                        <>
                            Ph.D. in Mathematics and former researcher at{' '}
                            <Link href="https://www.it4i.cz/">IT4I National Supercomputing Centre</Link>. He helps turn
                            complex technical knowledge and methods into clear instructions for AI.
                        </>
                    }
                    pavolDescription={
                        <>
                            <Link href="https://www.pavolhejny.com/">Open-source contributor</Link> in Czechia with 15+
                            years of software development experience. He focuses on practical AI agent deployments and
                            integrations.
                        </>
                    }
                />
                <PricingSection
                    title="Plans for your team"
                    description="Choose a plan for a small team, a growing operation, or a larger deployment."
                    openSourceGuaranteeText="Promptbook is open source. Your data stays under your control."
                    plans={industryPricing}
                />
                {isLocalhost && <PlaygroundSection />}
                <Footer />
            </main>
        </>
    );
}
