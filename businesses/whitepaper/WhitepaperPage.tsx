import { ArrowDown, ArrowRight, ArrowUpRight, Check, Layers3, RefreshCw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { MinimalFooter } from '@/components/minimal-footer';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { WHITEPAPER_DATE, WHITEPAPER_REPOSITORY_URL, WHITEPAPER_VERSION } from './whitepaperConfig';
import { WHITEPAPER_CONTENT } from './whitepaperContent';
import { WhitepaperAptExplorer } from './WhitepaperAptExplorer';
import { WhitepaperCycle } from './WhitepaperCycle';
import { WhitepaperHistory } from './WhitepaperHistory';
import { WhitepaperNavigation } from './WhitepaperNavigation';
import { WhitepaperPractice } from './WhitepaperPractice';
import { WhitepaperReader } from './WhitepaperReader';
import './whitepaper.css';

function SplitHeadline({ lines }: { readonly lines: readonly string[] }) {
    return (
        <>
            {lines.map((line, index) => (
                <span key={line} className={index === 0 ? undefined : 'wp-soft-heading'}>
                    {line}
                </span>
            ))}
        </>
    );
}

export function WhitepaperPage({ language }: { readonly language: SupportedHomepageLanguage }) {
    const content = WHITEPAPER_CONTENT[language];
    return (
        <div className="wp-page" lang={language}>
            <WhitepaperNavigation language={language} content={content.navigation} />
            <main id="whitepaper-main">
                <section className="wp-hero wp-container" aria-labelledby="whitepaper-title">
                    <p className="wp-eyebrow">
                        <span className="wp-status-dot" />
                        {content.hero.eyebrow}
                    </p>
                    <h1 id="whitepaper-title">
                        <SplitHeadline lines={content.hero.title} />
                    </h1>
                    <p className="wp-hero-description">{content.hero.description}</p>
                    <div className="wp-hero-actions">
                        <a href="#framework" className="wp-button">
                            {content.hero.explore}
                            <ArrowDown size={17} />
                        </a>
                        <a href="#read" className="wp-text-link">
                            {content.hero.read}
                            <ArrowUpRight size={17} />
                        </a>
                    </div>
                    <p className="wp-edition">
                        {content.hero.edition} {WHITEPAPER_VERSION}
                        <span>·</span>APT Framework<span>·</span>
                        <time dateTime={WHITEPAPER_DATE}>{content.hero.date}</time>
                    </p>
                </section>
                <WhitepaperAptExplorer content={content.framework} />
                <section id="idea" className="wp-section wp-idea" aria-labelledby="idea-title">
                    <div className="wp-container">
                        <div className="wp-two-column-heading">
                            <div className="wp-section-heading">
                                <p className="wp-eyebrow">{content.idea.eyebrow}</p>
                                <h2 id="idea-title">
                                    <SplitHeadline lines={content.idea.title} />
                                </h2>
                            </div>
                            <p className="wp-section-description">{content.idea.description}</p>
                        </div>
                        <div className="wp-comparison">
                            {[content.idea.beforeSteps, content.idea.afterSteps].map((steps, index) => (
                                <div className="wp-comparison-row" key={index} data-is-agenda={index === 1}>
                                    <h3>{index === 0 ? content.idea.before : content.idea.after}</h3>
                                    <ol>
                                        {steps.map((step, stepIndex) => (
                                            <li key={step}>
                                                <span>{step}</span>
                                                {stepIndex < steps.length - 1 ? (
                                                    <ArrowRight size={18} />
                                                ) : index === 1 ? (
                                                    <RefreshCw size={18} />
                                                ) : (
                                                    <span className="wp-waiting-dots" aria-hidden="true">
                                                        ···
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                        <p className="wp-idea-conclusion">{content.idea.conclusion}</p>
                        <p className="wp-note wp-centered">{content.idea.note}</p>
                    </div>
                </section>
                <section id="cycle" className="wp-section wp-container" aria-labelledby="cycle-title">
                    <div className="wp-section-heading">
                        <p className="wp-eyebrow">{content.cycle.eyebrow}</p>
                        <h2 id="cycle-title">
                            <SplitHeadline lines={content.cycle.title} />
                        </h2>
                        <p>{content.cycle.description}</p>
                    </div>
                    <WhitepaperCycle content={content.cycle} />
                    <p className="wp-note">{content.cycle.note}</p>
                </section>
                <section id="history" className="wp-section wp-history-section" aria-labelledby="history-title">
                    <div className="wp-container wp-history-layout">
                        <div>
                            <div className="wp-section-heading">
                                <p className="wp-eyebrow">{content.history.eyebrow}</p>
                                <h2 id="history-title">
                                    <SplitHeadline lines={content.history.title} />
                                </h2>
                                <p>{content.history.description}</p>
                            </div>
                            <p className="wp-note">{content.history.note}</p>
                        </div>
                        <WhitepaperHistory content={content.history} />
                    </div>
                </section>
                <section className="wp-section wp-container wp-continuity" aria-labelledby="continuity-title">
                    <div className="wp-section-heading wp-centered">
                        <p className="wp-eyebrow">{content.continuity.eyebrow}</p>
                        <h2 id="continuity-title">{content.continuity.title}</h2>
                    </div>
                    <div className="wp-continuity-cards">
                        <div>
                            <Layers3 size={34} strokeWidth={1.3} />
                            <h3>{content.continuity.preservedTitle}</h3>
                            <ul>
                                {content.continuity.preserved.map((item) => (
                                    <li key={item}>
                                        <Check size={17} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <RefreshCw size={34} strokeWidth={1.3} />
                            <h3>{content.continuity.replaceableTitle}</h3>
                            <ul>
                                {content.continuity.replaceable.map((item) => (
                                    <li key={item}>
                                        <ArrowRight size={17} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p className="wp-note">{content.continuity.note}</p>
                </section>
                <section id="practice" className="wp-section wp-practice" aria-labelledby="practice-title">
                    <div className="wp-container">
                        <div className="wp-section-heading">
                            <p className="wp-eyebrow">{content.practice.eyebrow}</p>
                            <h2 id="practice-title">{content.practice.title}</h2>
                            <p>{content.practice.description}</p>
                        </div>
                        <WhitepaperPractice content={content.practice} />
                    </div>
                </section>
                <section className="wp-section wp-container wp-boundaries" aria-labelledby="boundaries-title">
                    <div className="wp-boundaries-icon">
                        <ShieldCheck size={44} strokeWidth={1.2} />
                    </div>
                    <div>
                        <h2 id="boundaries-title">{content.boundaries.title}</h2>
                        <p>{content.boundaries.description}</p>
                        <a className="wp-text-link" href="#chapter-10">
                            {content.boundaries.link}
                            <ArrowUpRight size={16} />
                        </a>
                    </div>
                </section>
                <section className="wp-section wp-status-section" aria-labelledby="status-title">
                    <div className="wp-container">
                        <div className="wp-section-heading">
                            <p className="wp-eyebrow">{content.status.eyebrow}</p>
                            <h2 id="status-title">{content.status.title}</h2>
                        </div>
                        <div className="wp-status-cards">
                            {content.status.cards.map((card, index) => (
                                <article key={card.label}>
                                    <span className="wp-status-label" data-status={index}>
                                        {card.label}
                                    </span>
                                    <h3>{card.title}</h3>
                                    <p>{card.description}</p>
                                </article>
                            ))}
                        </div>
                        <p className="wp-note">{content.status.note}</p>
                    </div>
                </section>
                <WhitepaperReader language={language} content={content.reader} />
                <section className="wp-closing wp-container" aria-labelledby="closing-title">
                    <p className="wp-eyebrow">Promptbook</p>
                    <h2 id="closing-title">
                        <SplitHeadline lines={content.closing.title} />
                    </h2>
                    <p>{content.closing.description}</p>
                    <div className="wp-hero-actions">
                        <a className="wp-button" href={WHITEPAPER_REPOSITORY_URL}>
                            {content.closing.repository}
                            <ArrowUpRight size={17} />
                        </a>
                        <Link className="wp-text-link" href="/contact">
                            {content.closing.contact}
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </section>
            </main>
            <MinimalFooter language={language} />
        </div>
    );
}
