'use client';

import { ArrowDown, ArrowUpRight, Check, Shield } from 'lucide-react';
import { useState } from 'react';
import type { WhitepaperContent } from './whitepaperContent';

const PART_LETTERS = ['A', 'P', 'T'];

export function WhitepaperPractice({ content }: { readonly content: WhitepaperContent['practice'] }) {
    const [selectedScenario, setSelectedScenario] = useState(0);
    const scenario = content.scenarios[selectedScenario];
    return (
        <div className="wp-practice-demo">
            <div className="wp-practice-picker" role="group" aria-label={content.choose}>
                {content.scenarios.map((candidate, index) => (
                    <button
                        type="button"
                        key={candidate.name}
                        aria-pressed={selectedScenario === index}
                        aria-controls="practice-scenario"
                        onClick={() => setSelectedScenario(index)}
                    >
                        {candidate.name}
                        <ArrowUpRight size={17} />
                    </button>
                ))}
            </div>
            <div id="practice-scenario" className="wp-practice-scenario" aria-live="polite" aria-atomic="true">
                <div className="wp-practice-signal">
                    <span className="wp-eyebrow">{content.trigger}</span>
                    <h3>{scenario.signal}</h3>
                    <ArrowDown size={22} />
                </div>
                <dl className="wp-practice-parts">
                    {scenario.parts.map((part, index) => (
                        <div key={content.labels[index]}>
                            <dt>
                                <span>{PART_LETTERS[index]}</span>
                                {content.labels[index]}
                            </dt>
                            <dd>{part}</dd>
                        </div>
                    ))}
                </dl>
                <div className="wp-practice-checks">
                    <div>
                        <Check size={20} />
                        <p>
                            <strong>{content.check}</strong>
                            {scenario.check}
                        </p>
                    </div>
                    <div>
                        <Shield size={20} />
                        <p>
                            <strong>{content.boundary}</strong>
                            {scenario.boundary}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
