'use client';

import dynamic from 'next/dynamic';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useReducer, useRef, useState } from 'react';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { HOMEPAGE_CONTENT } from './homepageContent';
import { HOMEPAGE_SCENARIOS } from './homepageScenarios';
import { homepageStoryReducer, INITIAL_HOMEPAGE_STORY } from './homepageStoryModel';
import { HomepageArtifact, HomepageStatus } from './HomepageArtifact';
import { HomepageEnquiryLink } from './HomepageEnquiryLink';

const HomepageSceneMotion = dynamic(() => import('./HomepageSceneMotion'), { ssr: false });

export default function HomepageStory({ language }: { readonly language: SupportedHomepageLanguage }) {
    const content = HOMEPAGE_CONTENT[language];
    const [state, dispatch] = useReducer(homepageStoryReducer, INITIAL_HOMEPAGE_STORY);
    const [isInteractive, setIsInteractive] = useState(false);
    const [isDocumentVisible, setIsDocumentVisible] = useState(false);
    const sceneReference = useRef<HTMLDivElement>(null);
    const isInView = useInView(sceneReference);
    const isReducedMotion = useReducedMotion();
    useEffect(() => {
        setIsInteractive(true);
        const updateVisibility = () => setIsDocumentVisible(document.visibilityState === 'visible');
        updateVisibility();
        document.addEventListener('visibilitychange', updateVisibility);
        return () => document.removeEventListener('visibilitychange', updateVisibility);
    }, []);

    const scenario = HOMEPAGE_SCENARIOS[language].find((candidate) => candidate.id === state.scenarioId)!;
    const step = scenario.steps[state.stepIndex];
    const selectStep = (stepIndex: number) => dispatch({ type: 'step', stepIndex });

    return (
        <div
            className="ah-experience"
            data-testid="homepage-story"
            data-scenario={scenario.id}
            data-step={state.stepIndex}
        >
            <div className="ah-scenario-picker" role="group" aria-label={content.story.choose}>
                {HOMEPAGE_SCENARIOS[language].map((candidate, index) => (
                    <button
                        key={candidate.id}
                        type="button"
                        aria-pressed={candidate.id === scenario.id}
                        aria-controls="homepage-story-panel"
                        disabled={!isInteractive}
                        onClick={() => dispatch({ type: 'select', scenarioId: candidate.id })}
                    >
                        <span aria-hidden="true">0{index + 1}</span>
                        {candidate.name}
                    </button>
                ))}
            </div>
            <div id="homepage-story-panel" className="ah-story-panel" ref={sceneReference}>
                <div className="ah-story-copy">
                    <p className="ah-eyebrow">{content.story.scope}</p>
                    <h3>{scenario.benefit}</h3>
                    <p>{scenario.entrusted}</p>
                    <HomepageEnquiryLink className="ah-text-link">{content.cta}</HomepageEnquiryLink>
                </div>
                <HomepageArtifact
                    scenario={scenario}
                    step={step}
                    content={content.story}
                    isInteractive={isInteractive}
                    onStep={selectStep}
                />
                {isInteractive && isInView && isDocumentVisible && !isReducedMotion && (
                    <HomepageSceneMotion sceneReference={sceneReference} />
                )}
            </div>
            <div className="ah-story-bottom">
                <div className="ah-story-steps" role="group" aria-label={content.story.steps}>
                    {scenario.steps.map((candidate, index) => (
                        <button
                            key={index}
                            type="button"
                            disabled={!isInteractive}
                            aria-pressed={index === state.stepIndex}
                            aria-controls="homepage-step-detail"
                            onClick={() => selectStep(index)}
                        >
                            <span>{index + 1}</span>
                            {candidate.label}
                        </button>
                    ))}
                </div>
                <div id="homepage-step-detail" className="ah-step-detail" aria-live="polite" aria-atomic="true">
                    <div>
                        <HomepageStatus status={step.status}>{step.statusLabel}</HomepageStatus>
                        <h4>{step.title}</h4>
                        <p>{step.description}</p>
                    </div>
                    <div className="ah-step-result">
                        <span>{content.story.result}</span>
                        <strong>{step.result}</strong>
                    </div>
                </div>
                <div className="ah-story-toolbar">
                    <span className="ah-demo-label">{content.story.demo}</span>
                    <div className="ah-story-actions">
                        <button
                            type="button"
                            disabled={!isInteractive}
                            onClick={() => dispatch({ type: 'replay' })}
                            aria-label={content.story.replay}
                            title={content.story.replay}
                        >
                            <RotateCcw size={17} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            disabled={!isInteractive || state.stepIndex === 0}
                            onClick={() => dispatch({ type: 'previous' })}
                            aria-label={content.story.previous}
                        >
                            <ArrowLeft size={18} aria-hidden="true" />
                        </button>
                        <span className="ah-step-count" aria-hidden="true">
                            {state.stepIndex + 1} / {scenario.steps.length}
                        </span>
                        <button
                            type="button"
                            disabled={!isInteractive || state.stepIndex === scenario.steps.length - 1}
                            onClick={() => dispatch({ type: 'next' })}
                            aria-label={content.story.next}
                        >
                            <ArrowRight size={18} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
