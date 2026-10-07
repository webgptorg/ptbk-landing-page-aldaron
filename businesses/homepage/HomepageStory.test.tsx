// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomepageStory } from './HomepageStory';
import { HomepageStoryBoundary } from './HomepageStoryBoundary';
import { HOMEPAGE_CONTENT } from './homepageContent';
import { HOMEPAGE_SCENARIOS } from './homepageScenarios';

beforeEach(() => {
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            observe() {}
            disconnect() {}
        },
    );
});
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('homepage story interactions', () => {
    it('keeps controls, artifact, explanation and result in one state through rapid selection and replay', () => {
        const content = HOMEPAGE_CONTENT.en.stories;
        const { container } = render(<HomepageStory content={content} scenarios={HOMEPAGE_SCENARIOS.en} />);
        for (const index of [1, 2, 0, 1, 2]) {
            const scenario = HOMEPAGE_SCENARIOS.en[index];
            fireEvent.click(screen.getByRole('button', { name: new RegExp(scenario.name.replace('&', '\\&')) }));
            expect(screen.getByRole('button', { name: new RegExp(scenario.name.replace('&', '\\&')) })).toHaveAttribute(
                'aria-pressed',
                'true',
            );
            expect(screen.getByText(scenario.steps[1].title)).toBeVisible();
            expect(container.querySelectorAll('.hp-artifact-sheet')).toHaveLength(1);
            expect(screen.getByText(scenario.benefit)).toBeVisible();
        }
        fireEvent.click(screen.getByRole('button', { name: content.next }));
        expect(screen.getByText(HOMEPAGE_SCENARIOS.en[2].steps[2].title)).toBeVisible();
        fireEvent.click(screen.getByRole('button', { name: content.previous }));
        expect(screen.getByText(HOMEPAGE_SCENARIOS.en[2].steps[1].title)).toBeVisible();
        fireEvent.click(screen.getByRole('button', { name: content.replay }));
        expect(screen.getByRole('button', { name: content.previous })).toBeDisabled();
    });

    it('isolates a failed interactive component from readable fallback and conversion', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        function FailedStory(): never {
            throw new Error('Example rendering failure');
        }
        render(
            <>
                <HomepageStoryBoundary fallback={<a href="#reader">Read examples</a>}>
                    <FailedStory />
                </HomepageStoryBoundary>
                <article id="reader">{HOMEPAGE_SCENARIOS.en[0].benefit}</article>
                <a href="#contact">Discuss our use case</a>
            </>,
        );
        expect(screen.getByRole('link', { name: 'Read examples' })).toBeVisible();
        expect(screen.getByText(HOMEPAGE_SCENARIOS.en[0].benefit)).toBeVisible();
        expect(screen.getByRole('link', { name: 'Discuss our use case' })).toBeVisible();
    });
});
