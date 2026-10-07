import Image from 'next/image';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Footer } from '@/components/footer';
import { createPublicUrl } from '@/lib/domains/publicDomainRouting';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { PRO_FIRMY_PATH } from '@/businesses/pro-firmy/config';
import { WHITEPAPER_PATHS } from '@/businesses/whitepaper/whitepaperConfig';
import { HOMEPAGE_CONTENT } from './homepageContent';
import { HOMEPAGE_SCENARIOS } from './homepageScenarios';
import { HomepageNavigation } from './HomepageNavigation';
import { HomepageStory } from './HomepageStory';
import { HomepageStoryBoundary } from './HomepageStoryBoundary';
import { HomepageEnquiry, HomepageEnquiryLink } from './HomepageEnquiry';
import './homepage.css';

/** Server-rendered proposition, all scenario outcomes and an independent native reader surround the client story. */
export function HomepagePage({ language }: { readonly language: SupportedHomepageLanguage }) {
    const content = HOMEPAGE_CONTENT[language];
    const scenarios = HOMEPAGE_SCENARIOS[language];
    return (
        <div className="hp-page" lang={language}>
            <HomepageNavigation language={language} content={content} />
            <main id="homepage-main">
                <section className="hp-hero hp-container" aria-labelledby="homepage-title">
                    <div className="hp-hero-topline">
                        <p className="hp-eyebrow">
                            <span className="hp-dot" />
                            {content.hero.eyebrow}
                        </p>
                        <span className="hp-hero-index" aria-hidden="true">
                            01 — ∞
                        </span>
                    </div>
                    <h1 id="homepage-title">
                        {content.hero.title}
                        <span>{content.hero.accent}</span>
                    </h1>
                    <div className="hp-hero-bottom">
                        <p className="hp-hero-description">{content.hero.description}</p>
                        <div className="hp-hero-actions">
                            <HomepageEnquiryLink id="hero-cta">{content.cta}</HomepageEnquiryLink>
                            <a className="hp-text-link" href="#agendas">
                                {content.hero.explore}
                                <ArrowDown size={16} aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                    <p className="hp-hero-note">{content.hero.note}</p>
                </section>
                <section id="agendas" className="hp-examples hp-container" aria-labelledby="homepage-examples-title">
                    <div className="hp-section-heading hp-examples-heading">
                        <div>
                            <p className="hp-eyebrow">{content.stories.eyebrow}</p>
                            <h2 id="homepage-examples-title">{content.stories.title}</h2>
                        </div>
                        <p className="hp-demo-note">{content.stories.illustration}</p>
                    </div>
                    <HomepageStoryBoundary
                        fallback={
                            <div className="hp-story-fallback">
                                <p>{content.stories.fallback}</p>
                                <a href="#homepage-reader" className="hp-text-link">
                                    {content.stories.reader}
                                    <ArrowDown size={16} />
                                </a>
                            </div>
                        }
                    >
                        <HomepageStory scenarios={scenarios} content={content.stories} />
                    </HomepageStoryBoundary>
                    <div className="hp-after-story">
                        <details id="homepage-reader" className="hp-reader">
                            <summary>{content.stories.reader}</summary>
                            <div className="hp-readable-scenarios">
                                {scenarios.map((scenario) => (
                                    <article key={scenario.id}>
                                        <h3>{scenario.name}</h3>
                                        <p>{scenario.burden}</p>
                                        <dl>
                                            <dt>{content.stories.responsibility}</dt>
                                            <dd>{scenario.responsibility}</dd>
                                            <dt>{content.stories.benefit}</dt>
                                            <dd>{scenario.benefit}</dd>
                                            <dt>{content.stories.owner}</dt>
                                            <dd>{scenario.human}</dd>
                                        </dl>
                                        <ol>
                                            {scenario.steps.map((step) => (
                                                <li key={step.label}>
                                                    <strong>{step.title}</strong>
                                                    <p>{step.explanation}</p>
                                                    <p>{step.result}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    </article>
                                ))}
                            </div>
                        </details>
                        <HomepageEnquiryLink className="hp-text-link">{content.cta}</HomepageEnquiryLink>
                    </div>
                </section>
                <section id="control" className="hp-control" aria-labelledby="homepage-control-title">
                    <div className="hp-container">
                        <div className="hp-control-heading">
                            <div className="hp-section-heading">
                                <p className="hp-eyebrow">{content.control.eyebrow}</p>
                                <h2 id="homepage-control-title">{content.control.title}</h2>
                            </div>
                            <p>{content.control.description}</p>
                        </div>
                        <div className="hp-comparison">
                            {[
                                { title: content.control.before, steps: content.control.beforeSteps },
                                { title: content.control.after, steps: content.control.afterSteps },
                            ].map((row, index) => (
                                <div key={row.title} data-entrusted={index === 1}>
                                    <h3>{row.title}</h3>
                                    <ol>
                                        {row.steps.map((step, stepIndex) => (
                                            <li key={step}>
                                                <span>{step}</span>
                                                {stepIndex < row.steps.length - 1 && (
                                                    <ArrowRight size={17} aria-hidden="true" />
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                        <div className="hp-control-cards">
                            {content.control.cards.map((card, index) => (
                                <article key={card.title}>
                                    <span>0{index + 1}</span>
                                    <h3>{card.title}</h3>
                                    <p>{card.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
                <section id="contact" className="hp-contact hp-container" aria-labelledby="homepage-contact-title">
                    <div className="hp-section-heading">
                        <p className="hp-eyebrow">{content.contact.eyebrow}</p>
                        <h2 id="homepage-contact-title">{content.contact.title}</h2>
                    </div>
                    <div className="hp-contact-grid">
                        <div>
                            <p className="hp-contact-description">{content.contact.description}</p>
                            <HomepageEnquiryLink>{content.cta}</HomepageEnquiryLink>
                            <p className="hp-direct-contact">
                                {content.contact.direct} <a href="mailto:jiri@ptbk.io">jiri@ptbk.io</a>
                            </p>
                        </div>
                        <div className="hp-contact-team">
                            <div className="hp-team-portraits">
                                <Image
                                    src="/people/jiri-jahn-transparent-square.png"
                                    alt="Jiří Jahn"
                                    width={76}
                                    height={76}
                                />
                                <Image
                                    src="/people/pavol-hejny-transparent-square.png"
                                    alt="Pavol Hejný"
                                    width={76}
                                    height={76}
                                />
                            </div>
                            <p>{content.contact.team}</p>
                            <span>Jiří Jahn · Pavol Hejný</span>
                        </div>
                    </div>
                    <p className="hp-delivery-note">{content.contact.status}</p>
                    <div className="hp-depth-links">
                        <div>
                            <p>{content.contact.paperTitle}</p>
                            <a className="hp-text-link" href={WHITEPAPER_PATHS[language]}>
                                {content.contact.paper}
                                <ArrowUpRight size={16} aria-hidden="true" />
                            </a>
                        </div>
                        <div>
                            <p>{content.contact.companyTitle}</p>
                            <a className="hp-text-link" href={PRO_FIRMY_PATH} hrefLang="cs">
                                {content.contact.company}
                                <ArrowUpRight size={16} aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer
                language={language}
                claim={content.hero.note}
                productLinks={[
                    { href: '#agendas', text: content.navigation.examples },
                    { href: '#control', text: content.navigation.control },
                    { href: '#contact', text: content.navigation.contact },
                    { href: PRO_FIRMY_PATH, text: content.contact.company },
                ]}
                companyLinks={[
                    {
                        href: 'https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&typ=UPLNY',
                        text: 'AI Web s.r.o. · IČO 21012288',
                    },
                    { href: createPublicUrl(language === 'cs' ? '/cs/pavol' : '/en/pavol'), text: 'Pavol Hejný' },
                    { href: '/contact', text: language === 'cs' ? 'Kontakt' : 'Contact' },
                ]}
            />
            <HomepageEnquiry language={language} />
        </div>
    );
}
