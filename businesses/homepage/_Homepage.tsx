import { AgendaExamples } from './AgendaExamples';
import { AgendaHero } from './AgendaHero';
import { AgendaModel } from './AgendaModel';
import { AgendaTechnology } from './AgendaTechnology';
import { HomepageCallButton } from './HomepageCallButton';
import { HomepageLeadFlow } from './HomepageLeadFlow';
import { getHomepageContent } from './homepageContent';
import { HOMEPAGE_PAGE_DEFINITIONS } from './homepageMetadata';
import { PRO_FIRMY_PATH } from '@/businesses/pro-firmy/config';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { StructuredData } from '@/components/structured-data';
import { TeamSection } from '@/components/team-section';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createWebPageStructuredData } from '@/lib/metadata/structured-data';
import { ArrowUpRight, Check } from 'lucide-react';
import Link from 'next/link';
import STYLES from './homepage.module.css';

/** The agenda homepage owns its composition; the preserved company-data page has no dependency on it. */
export function Homepage({ language }: { language: SupportedHomepageLanguage }) {
    const CONTENT = getHomepageContent(language);

    return (
        <div lang={language} className={STYLES.homepage}>
            <StructuredData nodes={[createWebPageStructuredData(HOMEPAGE_PAGE_DEFINITIONS[language])]} />
            <a href="#main-content" className={STYLES.skipLink}>
                {CONTENT.skipLink}
            </a>
            <Header
                language={language}
                hideCenterContent
                navItems={[
                    { href: '#agenda', label: CONTENT.navigation.model },
                    { href: '#priklady', label: CONTENT.navigation.examples },
                    { href: '#technologie', label: CONTENT.navigation.technology },
                    { href: language === 'cs' ? '/en' : '/cs', label: CONTENT.navigation.language },
                ]}
                primaryAction={{ label: CONTENT.callToAction, mobileLabel: CONTENT.mobileCallToAction }}
            />
            <main id="main-content" tabIndex={-1}>
                <AgendaHero language={language} />
                <AgendaModel language={language} />
                <AgendaExamples language={language} />
                <AgendaTechnology language={language} />
                <TeamSection {...CONTENT.team} />
                <section id="kontakt" className={STYLES.contact} aria-labelledby="contact-title">
                    <div className={STYLES.contactInner}>
                        <h2 id="contact-title">{CONTENT.contact.title}</h2>
                        <p>{CONTENT.contact.description}</p>
                        <ul>
                            {CONTENT.contact.steps.map((step) => (
                                <li key={step}>
                                    <Check size={17} aria-hidden="true" />
                                    {step}
                                </li>
                            ))}
                        </ul>
                        <HomepageCallButton label={CONTENT.callToAction} id="final-cta" />
                        <Link href={PRO_FIRMY_PATH} className={STYLES.companyLink}>
                            {CONTENT.contact.companyLink}
                            <ArrowUpRight size={17} aria-hidden="true" />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer language={language} productLinks={CONTENT.footer.productLinks} claim={CONTENT.footer.claim} />
            <HomepageLeadFlow language={language} />
        </div>
    );
}
