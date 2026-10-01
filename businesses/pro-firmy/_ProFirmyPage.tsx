'use client';

import {
    getProFirmyContent,
    PRO_FIRMY_QUALIFICATION_PLACE_NAME,
    type ProFirmyLanguage,
} from '@/businesses/pro-firmy/proFirmyContent';
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
 * Note: This composition is published at `/cs/pro-firmy` and nowhere else. The main homepage was repositioned
 *       around autonomous agendas and composes sections of its own in `businesses/homepage`, so this page keeps the
 *       proposition it preserves and neither page borrows the other's words.
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
            <QualificationPopup
                language={language}
                content={content.qualificationPopup}
                placeName={PRO_FIRMY_QUALIFICATION_PLACE_NAME}
            />
            <BookingNotification language={language} />
        </main>
    );
}
