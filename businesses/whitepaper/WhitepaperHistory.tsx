'use client';

import { Code2, FileCheck2, GitCommitHorizontal, Mail } from 'lucide-react';
import { useState } from 'react';
import type { WhitepaperContent } from './whitepaperContent';

export function WhitepaperHistory({ content }: { readonly content: WhitepaperContent['history'] }) {
    const [selectedState, setSelectedState] = useState(0);
    const rows = [
        { Icon: Code2, label: content.implementation, value: content.implementationStates[selectedState] },
        { Icon: FileCheck2, label: content.taskLabel, value: content.taskStates[selectedState] },
        { Icon: GitCommitHorizontal, label: content.historyLabel, value: content.historyStates[selectedState] },
    ];
    return (
        <div className="wp-history-demo">
            <div className="wp-history-toolbar">
                <GitCommitHorizontal size={20} />
                <span>{content.demo}</span>
                <code>main</code>
            </div>
            <div className="wp-segmented-control" role="group" aria-label={content.controls}>
                {content.states.map((state, index) => (
                    <button
                        type="button"
                        key={state}
                        aria-pressed={selectedState === index}
                        onClick={() => setSelectedState(index)}
                    >
                        {state}
                    </button>
                ))}
            </div>
            <div className="wp-history-graph" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                    <span key={index} data-is-active={index <= selectedState}>
                        <GitCommitHorizontal size={30} />
                        <small>{['a1b2c3', 'd4e5f6', 'f7a8b9'][index]}</small>
                    </span>
                ))}
            </div>
            <div className="wp-history-state" aria-live="polite" aria-atomic="true">
                <p className="wp-history-task">{content.task}</p>
                <dl className="wp-history-files">
                    {rows.map(({ Icon, label, value }) => (
                        <div key={label}>
                            <dt>
                                <Icon size={18} />
                                {label}
                            </dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
                <dl className="wp-history-external">
                    <div>
                        <dt>
                            <Mail size={18} />
                            {content.externalLabel}
                        </dt>
                        <dd>{content.externalStates[selectedState]}</dd>
                    </div>
                </dl>
                <p className="wp-history-explanation">{content.explanations[selectedState]}</p>
            </div>
        </div>
    );
}
