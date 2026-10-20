import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Compass, SlidersHorizontal, Eye } from 'lucide-react';
import { Footer } from '@/components/footer';
import { QualificationPopup } from '@/components/qualification-popup';
import { createPublicUrl } from '@/lib/domains/publicDomainRouting';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { PRO_FIRMY_PATH } from '@/businesses/pro-firmy/config';
import { WHITEPAPER_PATHS } from '@/businesses/whitepaper/whitepaperConfig';
import { HOMEPAGE_CONTENT } from './homepageContent';
import { HOMEPAGE_SCENARIOS } from './homepageScenarios';
import { getHomepageEnquiry } from './homepageEnquiry';
import { HomepageEnquiryLink } from './HomepageEnquiryLink';
import HomepageStory from './HomepageStory';
import { HomepageStoryBoundary } from './HomepageStoryBoundary';
import { HomepageMobileNavigation } from './HomepageMobileNavigation';
import './homepage.css';

const OWNERSHIP_ICONS = [Compass, SlidersHorizontal, Eye];

/** The business homepage owns its words and sections; the company-data offer remains independent. */
export function HomepagePage({ language }: { readonly language: SupportedHomepageLanguage }) {
    const content = HOMEPAGE_CONTENT[language];
    const whitepaperUrl = createPublicUrl(WHITEPAPER_PATHS[language]);
    const companyUrl = createPublicUrl(PRO_FIRMY_PATH);
    const navigation = [
        { href: '#agendas', label: content.examples },
        { href: '#control', label: content.control },
        { href: whitepaperUrl, label: 'Whitepaper' },
        { href: createPublicUrl(`/${language}/articles`), label: language === 'cs' ? 'Články' : 'Articles' },
    ];
    const navigationLinks = navigation.map((item) => (
        <a key={item.href} href={item.href}>
            {item.label}
        </a>
    ));

    return (
        <div className="ah-page" lang={language}>
            <a className="ah-skip" href="#homepage-main">
                {content.skip}
            </a>
            <header className="ah-header">
                <div className="ah-header-inner">
                    <Link href={`/${language}`} className="ah-brand" aria-label="Promptbook">
                        <Image src="/logo/promptbook-logo-blue-transparent-128.png" width={30} height={30} alt="" />
                        Promptbook
                    </Link>
                    <nav className="ah-desktop-navigation" aria-label={content.navigation}>
                        {navigationLinks}
                    </nav>
                    <div className="ah-header-actions">
                        <nav className="ah-language" aria-label={language === 'cs' ? 'Jazyk' : 'Language'}>
                            {(['cs', 'en'] as const).map((candidate) => (
                                <Link
                                    key={candidate}
                                    href={`/${candidate}`}
                                    hrefLang={candidate}
                                    lang={candidate}
                                    aria-label={candidate === 'cs' ? 'Česky' : 'English'}
                                    aria-current={candidate === language ? 'page' : undefined}
                                >
                                    {candidate === 'cs' ? 'CZ' : 'EN'}
                                </Link>
                            ))}
                        </nav>
                        <HomepageEnquiryLink className="ah-button ah-header-cta">{content.cta}</HomepageEnquiryLink>
                        <HomepageMobileNavigation label={content.menu}>
                            <nav aria-label={content.navigation}>
                                {navigationLinks}
                                <a href="#contact">{content.contact}</a>
                            </nav>
                        </HomepageMobileNavigation>
                    </div>
                </div>
            </header>
            <main id="homepage-main">
                <section className="ah-hero ah-container" aria-labelledby="homepage-title">
                    <p className="ah-eyebrow">
                        <span />
                        {content.eyebrow}
                    </p>
                    <h1 id="homepage-title">
                        <span>{content.title[0]}</span>
                        <span>{content.title[1]}</span>
                    </h1>
                    <p className="ah-hero-description">{content.description}</p>
                    <div className="ah-hero-actions">
                        <HomepageEnquiryLink id="hero-cta">{content.cta}</HomepageEnquiryLink>
                        <a className="ah-text-link" href="#agendas">
                            {content.explore}
                            <ArrowRight size={17} aria-hidden="true" />
                        </a>
                    </div>
                    <p className="ah-hero-note">{content.heroNote}</p>
                </section>
                <section className="ah-agendas ah-container" id="agendas" aria-labelledby="agendas-title">
                    <div className="ah-section-heading">
                        <p className="ah-eyebrow">{content.story.eyebrow}</p>
                        <h2 id="agendas-title">{content.story.title}</h2>
                    </div>
                    <HomepageStoryBoundary fallback={content.story.fallback}>
                        <HomepageStory language={language} />
                    </HomepageStoryBoundary>
                    <p className="ah-vision-note">{content.story.note}</p>
                    <details className="ah-summaries" id="agenda-summaries">
                        <summary>
                            {content.story.summaries}
                            <span aria-hidden="true">+</span>
                        </summary>
                        <div>
                            {HOMEPAGE_SCENARIOS[language].map((scenario) => (
                                <article key={scenario.id}>
                                    <h3>{scenario.name}</h3>
                                    <p className="ah-summary-benefit">{scenario.benefit}</p>
                                    <dl>
                                        {[
                                            [content.story.burden, scenario.burden],
                                            [content.story.entrusted, scenario.entrusted],
                                            [content.story.owner, scenario.ownerDecision],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <dt>{label}</dt>
                                                <dd>{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </article>
                            ))}
                        </div>
                    </details>
                </section>
                <section className="ah-comparison ah-container" aria-labelledby="comparison-title">
                    <h2 id="comparison-title">{content.comparison.title}</h2>
                    {[content.comparison.beforeSteps, content.comparison.afterSteps].map((steps, index) => (
                        <div className="ah-comparison-row" data-is-agenda={index === 1} key={index}>
                            <h3>{index === 0 ? content.comparison.before : content.comparison.after}</h3>
                            <ol>
                                {steps.map((step, stepIndex) => (
                                    <li key={step}>
                                        <span>{step}</span>
                                        {stepIndex < steps.length - 1 && <ArrowRight size={17} aria-hidden="true" />}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </section>
                <section className="ah-control" id="control" aria-labelledby="control-title">
                    <div className="ah-container">
                        <div className="ah-section-heading">
                            <p className="ah-eyebrow">{content.ownership.eyebrow}</p>
                            <h2 id="control-title">{content.ownership.title}</h2>
                        </div>
                        <div className="ah-control-cards">
                            {content.ownership.cards.map((card, index) => {
                                const Icon = OWNERSHIP_ICONS[index];
                                return (
                                    <article key={card.title}>
                                        <Icon size={27} strokeWidth={1.4} aria-hidden="true" />
                                        <span className="ah-card-number">0{index + 1}</span>
                                        <h3>{card.title}</h3>
                                        <p>{card.description}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>
                <section className="ah-closing ah-container" id="contact" aria-labelledby="contact-title">
                    <p className="ah-eyebrow">{content.closing.eyebrow}</p>
                    <h2 id="contact-title">{content.closing.title}</h2>
                    <p>{content.closing.description}</p>
                    <div className="ah-hero-actions">
                        <HomepageEnquiryLink>{content.cta}</HomepageEnquiryLink>
                        <Link className="ah-text-link" href="/contact">
                            {content.closing.contactLink}
                            <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                    <div className="ah-people">
                        <div>
                            <Image
                                src="/people/jiri-jahn-transparent-square.png"
                                alt="Jiří Jahn"
                                width={48}
                                height={48}
                            />
                            <Image
                                src="/people/pavol-hejny-transparent-square.png"
                                alt="Pavol Hejný"
                                width={48}
                                height={48}
                            />
                        </div>
                        <span>{content.closing.people}</span>
                    </div>
                </section>
                <aside className="ah-depth ah-container">
                    <div>
                        <h2>{content.depth.title}</h2>
                        <p>{content.depth.description}</p>
                        <a className="ah-text-link" href={whitepaperUrl}>
                            {content.depth.paper}
                            <ArrowUpRight size={16} aria-hidden="true" />
                        </a>
                    </div>
                    <div>
                        <h2>{content.depth.company}</h2>
                        <a className="ah-text-link" href={companyUrl}>
                            {content.depth.companyLink}
                            <ArrowUpRight size={16} aria-hidden="true" />
                        </a>
                    </div>
                </aside>
            </main>
            <Footer
                language={language}
                claim={content.footerClaim}
                isTechnologyIncubationShown
                productLinks={[
                    { href: '#agendas', text: content.examples },
                    { href: '#control', text: content.control },
                    { href: '#contact', text: content.contact },
                    { href: whitepaperUrl, text: 'Whitepaper' },
                    { href: companyUrl, text: content.depth.companyLink },
                ]}
            />
            <QualificationPopup language={language} presentation={getHomepageEnquiry(language)} />
        </div>
    );
}
