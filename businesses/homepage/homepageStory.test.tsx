// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import HomepageStory from './HomepageStory';
import { HomepageStoryBoundary } from './HomepageStoryBoundary';
import { HomepageEnquiryLink } from './HomepageEnquiryLink';
import { HOMEPAGE_SCENARIOS } from './homepageScenarios';
import { HOMEPAGE_CONTENT } from './homepageContent';
import { homepageStoryReducer, INITIAL_HOMEPAGE_STORY } from './homepageStoryModel';

const MOTION_PREFERENCES = vi.hoisted(() => ({ isInView: false, isReducedMotion: true }));
vi.mock('framer-motion', () => ({
    useInView: () => MOTION_PREFERENCES.isInView,
    useReducedMotion: () => MOTION_PREFERENCES.isReducedMotion,
}));
vi.mock('next/dynamic', () => ({ default: () => () => <span data-testid="homepage-motion" /> }));
beforeEach(() => {
    MOTION_PREFERENCES.isInView = false;
    MOTION_PREFERENCES.isReducedMotion = true;
});
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('homepage story', () => {
    it('keeps the native contact anchor until an enquiry handler can open the dialog', () => {
        render(<HomepageEnquiryLink>Discuss our use case</HomepageEnquiryLink>);
        const link = screen.getByRole('link', { name: 'Discuss our use case' });
        expect(fireEvent.click(link)).toBe(true);
        const open = vi.fn((event: Event) => event.preventDefault());
        window.addEventListener('open-qualification-popup', open);
        try {
            expect(fireEvent.click(link)).toBe(false);
            expect(open).toHaveBeenCalledTimes(1);
            expect(fireEvent.click(link, { ctrlKey: true })).toBe(true);
            expect(open).toHaveBeenCalledTimes(1);
        } finally {
            window.removeEventListener('open-qualification-popup', open);
        }
    });

    it('resets a selected scenario, bounds navigation and replays without accumulating events', () => {
        let state = INITIAL_HOMEPAGE_STORY;
        for (let index = 0; index < 20; index++) state = homepageStoryReducer(state, { type: 'next' });
        expect(state.stepIndex).toBe(4);
        state = homepageStoryReducer(state, { type: 'select', scenarioId: 'documents' });
        expect(state).toEqual({ scenarioId: 'documents', stepIndex: 1 });
        state = homepageStoryReducer(state, { type: 'replay' });
        expect(homepageStoryReducer(state, { type: 'previous' })).toEqual({ scenarioId: 'documents', stepIndex: 0 });
    });

    it('keeps both languages structurally aligned, with human decisions, continuation and waiting', () => {
        for (const [index, scenario] of Array.from(HOMEPAGE_SCENARIOS.cs.entries())) {
            const translated = HOMEPAGE_SCENARIOS.en[index];
            expect(translated.id).toBe(scenario.id);
            expect(translated.steps.map((step) => step.status)).toEqual(scenario.steps.map((step) => step.status));
            expect(scenario.steps.map((step) => step.status)).toEqual([
                'incoming',
                'prepared',
                'decision',
                'continuing',
                'waiting',
            ]);
            for (const version of [scenario, translated]) {
                expect(version.ownerDecision.length).toBeGreaterThan(30);
                expect(version.benefit.length).toBeGreaterThan(20);
                expect(version.steps.every((step) => step.result && step.artifactDetail)).toBe(true);
            }
        }
    });

    it.each(['cs', 'en'] as const)(
        'server renders an understandable result and disables unhydrated controls (%s)',
        (language) => {
            const html = renderToStaticMarkup(<HomepageStory language={language} />);
            expect(html).toContain(HOMEPAGE_SCENARIOS[language][0].benefit);
            expect(html).toContain(HOMEPAGE_SCENARIOS[language][0].steps[1].description);
            expect(html).toContain('aria-pressed="true"');
            expect(html).toContain('disabled=""');
            expect(html).toContain('href="#contact"');
        },
    );

    it('rapid switches always agree across artifact, explanation and selection; visibility and enquiry do not advance', () => {
        render(<HomepageStory language="en" />);
        const content = HOMEPAGE_CONTENT.en;
        for (const scenario of [...HOMEPAGE_SCENARIOS.en, ...HOMEPAGE_SCENARIOS.en].reverse()) {
            fireEvent.click(screen.getByRole('button', { name: new RegExp(scenario.name) }));
            fireEvent.click(screen.getByRole('button', { name: content.story.next }));
            expect(screen.getByTestId('homepage-story')).toHaveAttribute('data-scenario', scenario.id);
            expect(screen.getByTestId('homepage-story')).toHaveAttribute('data-step', '2');
            expect(screen.getByRole('heading', { name: scenario.steps[2].title })).toBeInTheDocument();
            expect(screen.getByText(scenario.steps[2].artifactDetail)).toBeInTheDocument();
            expect(screen.getByText(scenario.steps[2].result)).toBeInTheDocument();
        }
        const before = screen.getByTestId('homepage-story').textContent;
        fireEvent(document, new Event('visibilitychange'));
        fireEvent(window, new CustomEvent('open-qualification-popup'));
        expect(screen.getByTestId('homepage-story').textContent).toBe(before);
        expect(document.querySelectorAll('.ah-task')).toHaveLength(1);
        expect(document.querySelectorAll('.ah-project')).toHaveLength(1);
        fireEvent.click(screen.getByRole('button', { name: content.story.replay }));
        expect(screen.getByTestId('homepage-story')).toHaveAttribute('data-step', '0');
    });

    it('unmounts optional motion offscreen, in a hidden tab and for reduced motion without changing the story', () => {
        MOTION_PREFERENCES.isInView = true;
        MOTION_PREFERENCES.isReducedMotion = false;
        const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
        const { rerender } = render(<HomepageStory language="en" />);
        fireEvent.click(screen.getByRole('button', { name: HOMEPAGE_CONTENT.en.story.next }));
        expect(screen.getByTestId('homepage-motion')).toBeInTheDocument();

        visibility.mockReturnValue('hidden');
        fireEvent(document, new Event('visibilitychange'));
        expect(screen.queryByTestId('homepage-motion')).not.toBeInTheDocument();
        visibility.mockReturnValue('visible');
        fireEvent(document, new Event('visibilitychange'));
        expect(screen.getByTestId('homepage-motion')).toBeInTheDocument();

        MOTION_PREFERENCES.isInView = false;
        rerender(<HomepageStory language="en" />);
        expect(screen.queryByTestId('homepage-motion')).not.toBeInTheDocument();
        MOTION_PREFERENCES.isInView = true;
        MOTION_PREFERENCES.isReducedMotion = true;
        rerender(<HomepageStory language="en" />);
        expect(screen.queryByTestId('homepage-motion')).not.toBeInTheDocument();
        expect(screen.getByTestId('homepage-story')).toHaveAttribute('data-step', '2');
        expect(screen.getByRole('heading', { name: HOMEPAGE_SCENARIOS.en[0].steps[2].title })).toBeVisible();
    });

    it('contains a failed interactive render without losing readable summaries or conversion', () => {
        const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const FailedStory = (): never => {
            throw new Error('Scene failed');
        };
        try {
            render(
                <>
                    <HomepageStoryBoundary fallback="Read the examples below">
                        <FailedStory />
                    </HomepageStoryBoundary>
                    <p>{HOMEPAGE_SCENARIOS.en[0].benefit}</p>
                    <a href="#contact">Discuss our use case</a>
                </>,
            );
            expect(screen.getByRole('status')).toHaveTextContent('Read the examples below');
            expect(screen.getByText(HOMEPAGE_SCENARIOS.en[0].benefit)).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Discuss our use case' })).toBeInTheDocument();
        } finally {
            errorLog.mockRestore();
        }
    });
});
