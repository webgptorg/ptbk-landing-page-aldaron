import { getHomepageContent } from './homepageContent';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { ArrowRight, BookOpen, Goal, Layers3, Repeat2, SlidersHorizontal } from 'lucide-react';
import STYLES from './homepage.module.css';

const PART_ICONS = [BookOpen, Goal, Layers3] as const;

export function AgendaModel({ language }: { language: SupportedHomepageLanguage }) {
    const CONTENT = getHomepageContent(language).model;

    return (
        <section id="agenda" className={STYLES.section} aria-labelledby="agenda-title">
            <p className={STYLES.eyebrow}>{CONTENT.eyebrow}</p>
            <div className={STYLES.sectionIntroduction}>
                <h2 id="agenda-title">{CONTENT.title}</h2>
                <p>{CONTENT.description}</p>
            </div>
            <div className={STYLES.agendaContainer}>
                <div className={STYLES.parts}>
                    {CONTENT.parts.map((part, index) => {
                        const Icon = PART_ICONS[index];
                        return (
                            <div key={part.title} className={STYLES.part}>
                                <Icon aria-hidden="true" size={25} />
                                <h3>{part.title}</h3>
                                <p>{part.description}</p>
                                <span>{part.example}</span>
                            </div>
                        );
                    })}
                </div>
                <ol className={STYLES.workCycle}>
                    {CONTENT.work.map((step, index) => (
                        <li key={step}>
                            {step}
                            {index < CONTENT.work.length - 1 ? (
                                <ArrowRight aria-hidden="true" size={18} />
                            ) : (
                                <Repeat2 aria-hidden="true" size={19} />
                            )}
                        </li>
                    ))}
                </ol>
                <p className={STYLES.results}>{CONTENT.results}</p>
            </div>
            <div className={STYLES.humanControl}>
                <SlidersHorizontal aria-hidden="true" size={25} />
                <h3>{CONTENT.controlTitle}</h3>
                <p>{CONTENT.controlDescription}</p>
            </div>
        </section>
    );
}
