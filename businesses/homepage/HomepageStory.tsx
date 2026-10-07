'use client';

import { ArrowLeft, ArrowRight, Check, CirclePause, RotateCcw, UserRound, ArrowDownLeft } from 'lucide-react';
import { useEffect, useReducer, useRef, useState } from 'react';
import type { HomepageContent } from './homepageContent';
import type { HomepageScenario } from './homepageScenarios';
import { INITIAL_HOMEPAGE_STORY_STATE, reduceHomepageStory } from './homepageStoryModel';
import { HomepageStoryArtifact } from './HomepageStoryArtifact';

/** Motion is only a short, interruptible CSS reveal. No clocks or automatic story progression. */
export function HomepageStory({
    scenarios,
    content,
}: {
    readonly scenarios: readonly HomepageScenario[];
    readonly content: HomepageContent['stories'];
}) {
    const [state, dispatch] = useReducer(
        (current: typeof INITIAL_HOMEPAGE_STORY_STATE, action: Parameters<typeof reduceHomepageStory>[2]) =>
            reduceHomepageStory(scenarios, current, action),
        INITIAL_HOMEPAGE_STORY_STATE,
    );
    const [isInteractive, setIsInteractive] = useState(false);
    const [isMotionActive, setIsMotionActive] = useState(false);
    const containerReference = useRef<HTMLDivElement>(null);
    const scenario = scenarios[state.scenarioIndex];
    const step = scenario.steps[state.stepIndex];
    const StatusIcon =
        step.status === 'attention'
            ? UserRound
            : step.status === 'waiting'
              ? CirclePause
              : step.status === 'received'
                ? ArrowDownLeft
                : Check;

    useEffect(() => {
        setIsInteractive(true);
        let isOnscreen = false;
        const updateMotion = () => setIsMotionActive(isOnscreen && document.visibilityState === 'visible');
        const observer = new IntersectionObserver(([entry]) => {
            isOnscreen = entry.isIntersecting;
            updateMotion();
        });
        if (containerReference.current) observer.observe(containerReference.current);
        document.addEventListener('visibilitychange', updateMotion);
        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', updateMotion);
        };
    }, []);

    return (
        <div
            className="hp-story"
            ref={containerReference}
            data-motion-active={isMotionActive}
            data-scenario={scenario.id}
            data-step={state.stepIndex}
        >
            <div className="hp-scenario-picker" role="group" aria-label={content.choose}>
                {scenarios.map((candidate, index) => (
                    <button
                        key={candidate.id}
                        type="button"
                        disabled={!isInteractive}
                        aria-pressed={index === state.scenarioIndex}
                        aria-controls="homepage-story-panel"
                        onClick={() => dispatch({ type: 'scenario', index })}
                    >
                        <span aria-hidden="true">0{index + 1}</span>
                        {candidate.name}
                        <ArrowRight size={16} aria-hidden="true" />
                    </button>
                ))}
            </div>
            <div id="homepage-story-panel" className="hp-story-panel">
                <div className="hp-story-mandate">
                    <span>{content.entrusted}</span>
                    <p>{scenario.responsibility}</p>
                </div>
                <div className="hp-story-scene">
                    <HomepageStoryArtifact
                        key={`${scenario.id}-${state.stepIndex}`}
                        scenarioId={scenario.id}
                        step={step}
                    />
                    <div className="hp-story-narrative" aria-live="polite" aria-atomic="true">
                        <span className="hp-status" data-status={step.status}>
                            <StatusIcon size={15} aria-hidden="true" />
                            {content.statuses[step.status]}
                        </span>
                        <h3>{step.title}</h3>
                        <p>{step.explanation}</p>
                        <div className="hp-step-result">
                            <ArrowRight size={19} aria-hidden="true" />
                            <strong>{step.result}</strong>
                        </div>
                    </div>
                </div>
                <div className="hp-story-controls">
                    <div className="hp-step-picker" role="group" aria-label={content.steps}>
                        {scenario.steps.map((candidate, index) => (
                            <button
                                key={index}
                                type="button"
                                disabled={!isInteractive}
                                aria-pressed={index === state.stepIndex}
                                aria-controls="homepage-story-panel"
                                onClick={() => dispatch({ type: 'step', index })}
                            >
                                <span aria-hidden="true">{index + 1}</span>
                                {candidate.label}
                            </button>
                        ))}
                    </div>
                    <div className="hp-playback-controls">
                        <button
                            type="button"
                            disabled={!isInteractive || state.stepIndex === 0}
                            aria-label={content.previous}
                            onClick={() => dispatch({ type: 'previous' })}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <span className="hp-step-count">
                            {state.stepIndex + 1} / {scenario.steps.length}
                        </span>
                        <button
                            type="button"
                            disabled={!isInteractive || state.stepIndex === scenario.steps.length - 1}
                            aria-label={content.next}
                            onClick={() => dispatch({ type: 'next' })}
                        >
                            <ArrowRight size={18} />
                        </button>
                        <button
                            type="button"
                            className="hp-replay"
                            disabled={!isInteractive}
                            onClick={() => dispatch({ type: 'replay' })}
                        >
                            <RotateCcw size={15} aria-hidden="true" />
                            {content.replay}
                        </button>
                    </div>
                </div>
                <div className="hp-story-bottom">
                    <div>
                        <span>{content.result}</span>
                        <strong>{scenario.benefit}</strong>
                    </div>
                    <div>
                        <span>
                            <UserRound size={14} aria-hidden="true" />
                            {content.owner}
                        </span>
                        <p>{scenario.human}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
