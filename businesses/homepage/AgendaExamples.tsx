'use client';

import { useState } from 'react';
import { Check, CornerDownLeft, FolderOpen, Globe2, Hand, Mail, ReceiptText, Newspaper } from 'lucide-react';
import { getHomepageContent, type AgendaExample } from './homepageContent';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import STYLES from './homepage.module.css';

const EXAMPLE_ICONS = [Globe2, Mail, ReceiptText, Newspaper] as const;

function AgendaTimeline({ steps }: Pick<AgendaExample, 'steps'>) {
    return (
        <ol className={STYLES.timeline}>
            {steps.map((step, index) => (
                <li key={step.title}>
                    <span className={STYLES.timelineNumber}>
                        {index === steps.length - 1 ? (
                            <CornerDownLeft size={18} aria-hidden="true" />
                        ) : (
                            String(index + 1).padStart(2, '0')
                        )}
                    </span>
                    <div>
                        <h4>{step.title}</h4>
                        <p>{step.detail}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}

export function AgendaExamples({ language }: { language: SupportedHomepageLanguage }) {
    const CONTENT = getHomepageContent(language).examples;
    const [selectedId, setSelectedId] = useState(CONTENT.items[0].id);
    const EXAMPLE = CONTENT.items.find((item) => item.id === selectedId) ?? CONTENT.items[0];

    return (
        <section id="priklady" className={STYLES.examplesSection} aria-labelledby="examples-title">
            <div className={STYLES.section}>
                <p className={STYLES.eyebrow}>{CONTENT.eyebrow}</p>
                <h2 id="examples-title" className={STYLES.examplesTitle}>
                    {CONTENT.title}
                </h2>
                <div className={STYLES.exampleSelector} role="group" aria-label={CONTENT.selector}>
                    {CONTENT.items.map((item, index) => {
                        const Icon = EXAMPLE_ICONS[index];
                        return (
                            <button
                                key={item.id}
                                type="button"
                                aria-pressed={item.id === selectedId}
                                aria-controls="agenda-example"
                                onClick={() => setSelectedId(item.id)}
                            >
                                <Icon size={18} aria-hidden="true" />
                                {item.label}
                            </button>
                        );
                    })}
                </div>
                <div id="agenda-example" className={STYLES.examplePanel} aria-live="polite" aria-atomic="true">
                    <div className={STYLES.exampleBrief}>
                        <p className={STYLES.smallLabel}>{CONTENT.illustration}</p>
                        <h3>{EXAMPLE.title}</h3>
                        <p>{EXAMPLE.goal}</p>
                        <div className={STYLES.contextNote}>
                            <FolderOpen size={20} aria-hidden="true" />
                            <h4>{CONTENT.context}</h4>
                            <p>{EXAMPLE.context}</p>
                        </div>
                        <div className={STYLES.approvalNote}>
                            <Hand size={20} aria-hidden="true" />
                            <h4>{CONTENT.approval}</h4>
                            <p>{EXAMPLE.approval}</p>
                        </div>
                    </div>
                    <div className={STYLES.exampleWorkflow}>
                        <AgendaTimeline steps={EXAMPLE.steps} />
                        <div className={STYLES.outcome}>
                            <Check size={20} aria-hidden="true" />
                            <div>
                                <h4>{CONTENT.outcome}</h4>
                                <p>{EXAMPLE.outcome}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <p className={STYLES.examplesConclusion}>{CONTENT.conclusion}</p>
            </div>
        </section>
    );
}
