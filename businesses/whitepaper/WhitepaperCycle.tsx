'use client';

import { ArrowRight, Check, Circle, FileCheck2, GitCommitHorizontal, RotateCcw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { WhitepaperContent } from './whitepaperContent';
import { WHITEPAPER_CYCLE_PATHS, WHITEPAPER_CYCLE_SCENARIOS, type WhitepaperCycleScenario } from './whitepaperCycleModel';

export function WhitepaperCycle({ content }: { readonly content: WhitepaperContent['cycle'] }) {
    const [scenario, setScenario] = useState<WhitepaperCycleScenario>('pass');
    const [stageIndex, setStageIndex] = useState(0);
    const stages = WHITEPAPER_CYCLE_PATHS[scenario];
    const currentStage = stages[stageIndex];
    const stageContent = content.stages[currentStage];
    const isAccepted = currentStage === 'commit';
    const isPaused = currentStage === 'pause';
    const isFinished = isAccepted || isPaused;

    return (
        <div className="wp-cycle-demo">
            <div className="wp-demo-toolbar">
                <span className="wp-status-dot" />
                <span>{content.demo}</span>
            </div>
            <fieldset className="wp-scenario-picker">
                <legend>{content.scenario}</legend>
                <div className="wp-segmented-control">
                    {WHITEPAPER_CYCLE_SCENARIOS.map((candidate, index) => (
                        <label key={candidate}>
                            <input
                                type="radio"
                                name="cycle-scenario"
                                value={candidate}
                                checked={scenario === candidate}
                                onChange={() => {
                                    setScenario(candidate);
                                    setStageIndex(0);
                                }}
                            />
                            <span>{content.scenarios[index]}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
            <ol className="wp-cycle-track" aria-label={content.title.join(' ')}>
                {stages.map((stage, index) => (
                    <li
                        key={stage}
                        data-is-current={index === stageIndex}
                        data-is-complete={index < stageIndex}
                        aria-current={index === stageIndex ? 'step' : undefined}
                    >
                        <span>{index < stageIndex ? <Check size={15} /> : index + 1}</span>
                        <small>{content.stages[stage].label}</small>
                    </li>
                ))}
            </ol>
            <div className="wp-cycle-body">
                <div className="wp-cycle-explanation" aria-live="polite" aria-atomic="true">
                    <span className="wp-eyebrow">
                        {content.step} {stageIndex + 1} / {stages.length}
                    </span>
                    <h3>{stageContent.title}</h3>
                    <p>{stageContent.description}</p>
                </div>
                <div className="wp-cycle-result" data-is-accepted={isAccepted} data-is-paused={isPaused}>
                    <div className="wp-cycle-result-heading">
                        <ShieldCheck size={20} />
                        <span>{content.stateLabel}</span>
                    </div>
                    {content.files.map((file) => (
                        <div className="wp-cycle-file" key={file}>
                            <FileCheck2 size={18} />
                            <span>{file}</span>
                            {isAccepted ? <Check size={18} /> : <Circle size={14} />}
                        </div>
                    ))}
                    <div className="wp-cycle-result-state">
                        <GitCommitHorizontal size={20} />
                        {isAccepted ? content.accepted : isPaused ? content.paused : content.pending}
                    </div>
                </div>
            </div>
            <div className="wp-demo-actions">
                <button
                    type="button"
                    className="wp-button"
                    onClick={() => setStageIndex(isFinished ? 0 : stageIndex + 1)}
                >
                    {isFinished ? content.restart : stageIndex === 0 ? content.start : content.next}
                    {isFinished ? <RotateCcw size={16} /> : <ArrowRight size={16} />}
                </button>
                {!isFinished && stageIndex > 0 && (
                    <button type="button" className="wp-reset-button" onClick={() => setStageIndex(0)}>
                        <RotateCcw size={15} />
                        {content.restart}
                    </button>
                )}
            </div>
        </div>
    );
}
