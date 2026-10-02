import { HomepageCallButton } from './HomepageCallButton';
import { getHomepageContent } from './homepageContent';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { ArrowDown, ArrowRight, Check, CornerDownLeft, Repeat2, SlidersHorizontal } from 'lucide-react';
import STYLES from './homepage.module.css';

export function AgendaHero({ language }: { language: SupportedHomepageLanguage }) {
    const { hero: CONTENT, callToAction: CALL_TO_ACTION } = getHomepageContent(language);

    return (
        <section className={STYLES.hero} aria-labelledby="homepage-title">
            <div className={STYLES.heroCopy}>
                <p className={STYLES.eyebrow}>
                    <span className={STYLES.brandDot} />
                    {CONTENT.eyebrow}
                </p>
                <h1 id="homepage-title">
                    {CONTENT.heading}
                    <br />
                    <span>{CONTENT.emphasis}</span>
                </h1>
                <p className={STYLES.heroDescription}>{CONTENT.description}</p>
                <div className={STYLES.heroActions}>
                    <HomepageCallButton label={CALL_TO_ACTION} id="hero-cta" />
                    <a href="#agenda" className={STYLES.textLink}>
                        {CONTENT.secondaryAction}
                        <ArrowDown aria-hidden="true" size={16} />
                    </a>
                </div>
                <p className={STYLES.callNote}>{CONTENT.callNote}</p>
            </div>

            <figure className={STYLES.heroDiagram}>
                <figcaption className={STYLES.diagramCaption}>{CONTENT.illustration}</figcaption>
                <div className={STYLES.oneShot}>
                    <span className={STYLES.smallLabel}>{CONTENT.oneShotLabel}</span>
                    <p className={STYLES.diagramPrompt}>{CONTENT.oneShotPrompt}</p>
                    <ol className={STYLES.oneShotSteps}>
                        {CONTENT.oneShotSteps.map((step, index) => (
                            <li key={step}>
                                {step}
                                {index < CONTENT.oneShotSteps.length - 1 ? (
                                    <ArrowRight size={15} aria-hidden="true" />
                                ) : (
                                    <Check size={15} aria-hidden="true" />
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
                <div className={STYLES.agendaPreview}>
                    <div className={STYLES.agendaPreviewLabel}>
                        <Repeat2 aria-hidden="true" size={18} />
                        <span>{CONTENT.agendaLabel}</span>
                    </div>
                    <p className={STYLES.diagramPrompt}>{CONTENT.agendaPrompt}</p>
                    <ol className={STYLES.agendaCycle}>
                        {CONTENT.agendaSteps.map((step, index) => (
                            <li key={step}>
                                <span>{String(index + 1).padStart(2, '0')}</span>
                                {step}
                            </li>
                        ))}
                    </ol>
                    <p className={STYLES.continuation}>
                        <CornerDownLeft aria-hidden="true" size={21} />
                        {CONTENT.continuation}
                    </p>
                </div>
                <p className={STYLES.humanNote}>
                    <SlidersHorizontal size={17} aria-hidden="true" />
                    {CONTENT.human}
                </p>
            </figure>
        </section>
    );
}
