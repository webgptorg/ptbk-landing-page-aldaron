/**
 * @vitest-environment jsdom
 */

import {
    AI_TA_KRAJTA_SNAKE_GAME_STARTED_EVENT_NAME,
    PROMPTBOOK_CODER_INITIAL_OCTOPUS,
    PROMPTBOOK_CODER_TERMINAL_COMMAND,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPromptbookCoder';
import { useAiTaKrajtaPromptbookCoderBadge } from '@/businesses/ai-ta-krajta/useAiTaKrajtaPromptbookCoderBadge';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Slightly longer than each implementation delay, so an individual React effect can schedule the next one
 */
const TERMINAL_CHARACTER_TICK_IN_MILLISECONDS = 100;
const TERMINAL_COMMAND_HOLD_TICK_IN_MILLISECONDS = 600;

/**
 * Advances the chained typewriter timers one at a time, exactly as a browser does between renders
 */
function enterTerminalCommand(): void {
    for (
        let remainingCharacterCount = PROMPTBOOK_CODER_TERMINAL_COMMAND.length - '$'.length;
        remainingCharacterCount > 0;
        remainingCharacterCount -= 1
    ) {
        act(() => vi.advanceTimersByTime(TERMINAL_CHARACTER_TICK_IN_MILLISECONDS));
    }
}

/**
 * Leaves the entered command on screen briefly, then lets its octopus take over
 */
function completeTerminalBoot(): void {
    enterTerminalCommand();

    act(() => vi.advanceTimersByTime(TERMINAL_COMMAND_HOLD_TICK_IN_MILLISECONDS));
}

afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
});

describe('AI ta Krajta Promptbook coder badge', () => {
    it('enters the terminal command before becoming the simplified octopus', () => {
        vi.useFakeTimers();

        const { result } = renderHook(() => useAiTaKrajtaPromptbookCoderBadge());

        expect(result.current.displayedAscii).toBe(PROMPTBOOK_CODER_TERMINAL_COMMAND.slice(0, 1));

        enterTerminalCommand();

        expect(result.current.displayedAscii).toBe(PROMPTBOOK_CODER_TERMINAL_COMMAND);

        act(() => vi.advanceTimersByTime(TERMINAL_COMMAND_HOLD_TICK_IN_MILLISECONDS));

        expect(result.current.displayedAscii).toBe(PROMPTBOOK_CODER_INITIAL_OCTOPUS);
    });

    it('celebrates when the hero snake starts to play', () => {
        vi.useFakeTimers();

        const { result } = renderHook(() => useAiTaKrajtaPromptbookCoderBadge());

        completeTerminalBoot();
        act(() => window.dispatchEvent(new Event(AI_TA_KRAJTA_SNAKE_GAME_STARTED_EVENT_NAME)));

        expect(result.current.displayedAscii).toBe('~<@@/>~ 🐍');
    });

    it('waves while a visitor hovers it', () => {
        vi.useFakeTimers();

        const { result } = renderHook(() => useAiTaKrajtaPromptbookCoderBadge());

        completeTerminalBoot();
        act(() => result.current.handlePointerEnter());

        expect(result.current.displayedAscii).toBe('^<@@/>~');
    });

    it('looks toward a nearby moving pointer', () => {
        vi.useFakeTimers();

        const { result } = renderHook(() => useAiTaKrajtaPromptbookCoderBadge());
        const badgeElement = document.createElement('a');

        Object.defineProperty(badgeElement, 'getBoundingClientRect', {
            value: () => ({ left: 100, top: 100, width: 100, height: 40 }) as DOMRect,
        });
        result.current.badgeReference.current = badgeElement;

        completeTerminalBoot();
        act(() => window.dispatchEvent(new MouseEvent('pointermove', { clientX: 80, clientY: 120 })));

        expect(result.current.displayedAscii).toBe('←-<@@/>~');
    });
});
