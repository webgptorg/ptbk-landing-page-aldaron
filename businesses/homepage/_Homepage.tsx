import { getHomepageContent } from './homepageContent';
import { HOMEPAGE_PAGE_DEFINITIONS } from './homepageMetadata';
import {
    HomepageAgendaModel,
    HomepageComparison,
    HomepageContactSection,
    HomepageHero,
    HomepageTechnology,
} from './HomepageSections';
import { HomepageExamples } from './HomepageExamples';
import { HomepageEnquiryDialog } from './HomepageEnquiryDialog';
import { PRO_FIRMY_PATH } from '@/businesses/pro-firmy/config';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { StructuredData } from '@/components/structured-data';
import { TeamSection } from '@/components/team-section';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createWebPageStructuredData } from '@/lib/metadata/structured-data';

/** Homepage sections and copy are independent of the preserved company-data proposition. */
export function Homepage({ language }: { language: SupportedHomepageLanguage }) {
    const content = getHomepageContent(language);

    return (
        <div lang={language} className="min-h-screen bg-[#f8fafb] text-slate-700">
            <StructuredData nodes={[createWebPageStructuredData(HOMEPAGE_PAGE_DEFINITIONS[language])]} />
            <a
                href="#homepage-content"
                className="sr-only fixed left-4 top-2 z-[60] rounded-lg bg-white p-3 text-cyan-800 focus:not-sr-only"
            >
                {content.skipLink}
            </a>
            <Header
                language={language}
                brandName={
                    <span className="hidden text-xl text-slate-950 sm:inline">
                        Prompt<b>book</b>
                    </span>
                }
                hideCenterContent
                navItems={[
                    { href: '#jak-to-funguje', label: content.navigation.model },
                    { href: '#agendy', label: content.navigation.examples },
                    { href: '#pod-kapotou', label: content.navigation.technology },
                ]}
                primaryAction={{ label: content.callToAction, mobileLabel: content.mobileCallToAction }}
                languageSwitcher={{
                    ariaLabel: content.navigation.language,
                    items: [
                        { href: '/cs', label: 'Česky', iconSrc: '/locale-flags/cs.svg', isActive: language === 'cs' },
                        { href: '/en', label: 'English', iconSrc: '/locale-flags/en.svg', isActive: language === 'en' },
                    ],
                }}
                containerClassName="max-w-6xl"
            />
            <main id="homepage-content" tabIndex={-1}>
                <HomepageHero content={content} />
                <HomepageComparison content={content.comparison} />
                <HomepageAgendaModel content={content.model} />
                <HomepageExamples content={content.examples} />
                <HomepageTechnology content={content.technology} />
                <TeamSection {...content.team} isCompact />
                <HomepageContactSection content={content} />
            </main>
            <Footer
                language={language}
                claim={content.footer.claim}
                productLinks={[
                    { href: '#kontakt', text: content.callToAction },
                    { href: '#agenda', text: content.footer.model },
                    { href: PRO_FIRMY_PATH, text: content.footer.companyPage },
                    { href: 'https://github.com/webgptorg/promptbook', text: content.footer.documentation },
                    { href: '/branding', text: content.footer.branding },
                ]}
            />
            <HomepageEnquiryDialog language={language} />
        </div>
    );
}
