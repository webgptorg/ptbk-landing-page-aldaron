'use client';

import { getProFirmyContent, type ProFirmyLanguage } from '@/businesses/pro-firmy/proFirmyContent';
import { BookingNotification } from '@/components/booking-notification';
import { EnemySection } from '@/components/enemy-section';
import { FinalCTASection } from '@/components/final-cta-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { PainPointsSection } from '@/components/pain-points-section';
import { QualificationPopup } from '@/components/qualification-popup';
import { SocialProofStrip } from '@/components/social-proof-strip';
import { SolutionSection } from '@/components/solution-section';
import { TeamSection } from '@/components/team-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Suspense } from 'react';

/**
 * Company-data landing page: company documents, a virtual employee answering in plain language, and a strategic call
 *
 * Note: This preserved composition is published at `/cs/pro-firmy`. The agenda homepage owns its own composition
 *       in `businesses/homepage`, so changes to that proposition do not change this page.
 */
export function ProFirmyPage({ language }: { language: ProFirmyLanguage }) {
    const content = getProFirmyContent(language);

    return (
        <main className="min-h-screen">
            <Header language={language} />
            <Suspense fallback={<div>{content.loading}</div>}>
                <HeroSection language={language} />
            </Suspense>
            <SocialProofStrip language={language} />
            <PainPointsSection language={language} />
            <SolutionSection language={language} />
            <HowItWorksSection language={language} />
            <EnemySection language={language} />
            <TestimonialsSection language={language} />
            <TeamSection {...content.team} />
            <FinalCTASection language={language} />
            <Footer language={language} />
            {/* <- Note: Due to legal reasons we cannot use `<MinimalFooter/>` here and need to use `<Footer/>` instead
                         On the other hand, we can use `<MinimalFooter/>` on the `/dekujeme` page
            */}
            <QualificationPopup language={language} />
            <BookingNotification language={language} />
        </main>
    );
}
