/**
 * @vitest-environment jsdom
 */

import { PROMPTBOOK_CODER_URL } from '@/businesses/ai-ta-krajta/config';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const PAGE_STATE_MOCKS = vi.hoisted(() => ({
    playingEpisode: null as unknown,
}));

vi.mock('@/businesses/ai-ta-krajta/AiTaKrajtaPageState', () => ({
    useAiTaKrajtaPageState: () => PAGE_STATE_MOCKS,
}));

import { AiTaKrajtaFooter } from './AiTaKrajtaFooter';
import { AiTaKrajtaPromptbookCoderBadge } from './AiTaKrajtaPromptbookCoderBadge';

const INTRODUCTION_DURATION_IN_MILLISECONDS = 1_000;

beforeEach(() => {
    PAGE_STATE_MOCKS.playingEpisode = null;
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0));
    vi.stubGlobal('cancelAnimationFrame', (animationFrameId: number) => window.clearTimeout(animationFrameId));
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

function finishBadgeIntroduction() {
    act(() => {
        vi.advanceTimersByTime(INTRODUCTION_DURATION_IN_MILLISECONDS);
    });
}

describe('AI ta Krajta Promptbook coder badge', () => {
    it('types the terminal command before revealing the octopus and opens Promptbook coder', () => {
        render(<AiTaKrajtaPromptbookCoderBadge />);

        const badgeLink = screen.getByRole('link', { name: 'Otevřít Promptbook coder v novém okně' });

        expect(badgeLink.textContent).toContain('$');
        expect(badgeLink.getAttribute('href')).toBe(PROMPTBOOK_CODER_URL);
        expect(badgeLink.getAttribute('target')).toBe('_blank');

        finishBadgeIntroduction();

        expect(badgeLink.textContent).toContain('-<@@/>-');
    });

    it('changes its one-line sketch while hovered, scrolled and following the mouse', () => {
        render(<AiTaKrajtaPromptbookCoderBadge />);
        const badgeLink = screen.getByRole('link', { name: 'Otevřít Promptbook coder v novém okně' });

        finishBadgeIntroduction();
        fireEvent.pointerEnter(badgeLink);
        expect(badgeLink.textContent).toContain('=<@@/>- {}');

        fireEvent.pointerLeave(badgeLink);
        act(() => window.dispatchEvent(new Event('scroll')));
        expect(badgeLink.textContent).toContain('~<@@/>≈');

        act(() => vi.advanceTimersByTime(300));
        Object.defineProperty(badgeLink, 'getBoundingClientRect', {
            value: () => ({ left: 100, top: 100, width: 176, height: 36 }),
        });
        fireEvent.mouseMove(window, { clientX: 400, clientY: 118 });
        act(() => vi.advanceTimersByTime(1));

        expect(badgeLink.textContent).toContain('—<@@/>→');
    });
});

describe('AI ta Krajta footer', () => {
    it('credits Promptbook coder with the same destination as the badge', () => {
        render(<AiTaKrajtaFooter />);

        const coderLink = screen.getByRole('link', { name: 'Done by Promptbook coder' });

        expect(coderLink.getAttribute('href')).toBe(PROMPTBOOK_CODER_URL);
        expect(coderLink.getAttribute('target')).toBe('_blank');
    });
});
