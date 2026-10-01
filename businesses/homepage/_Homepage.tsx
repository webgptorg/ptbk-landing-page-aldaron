'use client';

import {
    HOMEPAGE_LANGUAGE_FLAG_PATHS,
    HOMEPAGE_LANGUAGE_LABELS,
    HOMEPAGE_PATHS,
} from '@/businesses/homepage/config';
import { HomepageAnatomy } from '@/businesses/homepage/HomepageAnatomy';
import {
    getHomepageContent,
    HOMEPAGE_QUALIFICATION_PLACE_NAME,
    type HomepageLanguage,
} from '@/businesses/homepage/homepageContent';
import { HomepageContrast } from '@/businesses/homepage/HomepageContrast';
import { HomepageExamples } from '@/businesses/homepage/HomepageExamples';
import { HomepageFinalCta } from '@/businesses/homepage/HomepageFinalCta';
import { HomepageHero } from '@/businesses/homepage/HomepageHero';
import { HomepageLeverage } from '@/businesses/homepage/HomepageLeverage';
import { HomepageMaintainedApplication } from '@/businesses/homepage/HomepageMaintainedApplication';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { QualificationPopup } from '@/components/qualification-popup';
import { TeamSection } from '@/components/team-section';
import { SUPPORTED_HOMEPAGE_LANGUAGES } from '@/lib/homepage-language';

/**
 * The main Promptbook homepage: a responsibility handed over as an agenda, rather than a task prompted for again
 * and again
 *
 * Note: It composes sections of its own. The company-data proposition it replaced is preserved whole at
 *       `/cs/pro-firmy`, owns `businesses/pro-firmy`, and must not be reached into from here - the two pages make
 *       different promises and may not borrow each other's words. What they do share is the chrome every public
 *       page wears and the one lead flow behind it.
 */
export function Homepage({ language }: { readonly language: HomepageLanguage }) {
    const content = getHomepageContent(language);

    return (
        <main className="min-h-screen">
            <Header
                language={language}
                centerContent={<span>{content.header.note}</span>}
                primaryAction={{
                    label: content.header.ctaDesktop,
                    mobileLabel: content.header.ctaMobile,
                }}
                languageSwitcher={{
                    ariaLabel: content.header.languageSwitcherLabel,
                    items: SUPPORTED_HOMEPAGE_LANGUAGES.map((switchableLanguage) => ({
                        href: HOMEPAGE_PATHS[switchableLanguage],
                        label: HOMEPAGE_LANGUAGE_LABELS[switchableLanguage],
                        iconSrc: HOMEPAGE_LANGUAGE_FLAG_PATHS[switchableLanguage],
                        isActive: switchableLanguage === language,
                    })),
                }}
            />
            <HomepageHero language={language} />
            <HomepageContrast language={language} />
            <HomepageAnatomy language={language} />
            <HomepageExamples language={language} />
            <HomepageMaintainedApplication language={language} />
            <HomepageLeverage language={language} />
            <TeamSection {...content.team} />
            <HomepageFinalCta language={language} />
            <Footer language={language} />
            {/* <- Note: Due to legal reasons the full `<Footer/>` is needed here, not `<MinimalFooter/>` */}
            <QualificationPopup
                language={language}
                content={content.qualificationPopup}
                placeName={HOMEPAGE_QUALIFICATION_PLACE_NAME}
            />
        </main>
    );
}
