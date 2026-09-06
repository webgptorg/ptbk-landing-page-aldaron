/**
 * @vitest-environment jsdom
 */

import { PromptbookCoderBadge } from '@/components/promptbook-coder/PromptbookCoderBadge';
import { PROMPTBOOK_CODER_FRAME_IN_MILLISECONDS } from '@/components/promptbook-coder/promptbookCoderAnimationClock';
import {
    PROMPTBOOK_CODER_BADGE_LABEL,
    PROMPTBOOK_CODER_URL,
} from '@/components/promptbook-coder/promptbookCoderConfig';
import { PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES } from '@/components/promptbook-coder/promptbookCoderTerminalBoot';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

/**
 * The one line of terminal the badge wears, which no screen reader is told about
 */
function readTerminalLine(): string {
    return screen.getByRole('link').querySelector('[aria-hidden="true"]')?.textContent ?? '';
}

/**
 * Waits out the frames in which the command is typed, which is when the octopus takes the line over
 *
 * @param extraFrames how many frames of the octopus itself to watch on top of that
 */
function runTypedCommand(extraFrames = 0): void {
    act(() => {
        vi.advanceTimersByTime(
            (PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES + extraFrames) * PROMPTBOOK_CODER_FRAME_IN_MILLISECONDS,
        );
    });
}

describe('PromptbookCoderBadge', () => {
    it('credits Promptbook coder and leads to its page in a new tab', () => {
        render(<PromptbookCoderBadge />);

        const badgeLink = screen.getByRole('link', { name: PROMPTBOOK_CODER_BADGE_LABEL });

        expect(badgeLink.getAttribute('href')).toBe(PROMPTBOOK_CODER_URL);
        expect(badgeLink.getAttribute('target')).toBe('_blank');
        expect(badgeLink.getAttribute('rel')).toBe('noreferrer');
    });

    it('is served as a terminal with the command being typed into it', () => {
        render(<PromptbookCoderBadge />);

        expect(readTerminalLine()).toBe('$ p▌');
    });

    it('prints the octopus once the typed command runs', () => {
        render(<PromptbookCoderBadge />);
        runTypedCommand();

        expect(readTerminalLine()).toBe('$ -<@@/>- { }');
    });

    it('keeps drawing something new while it is left alone', () => {
        render(<PromptbookCoderBadge />);
        runTypedCommand();

        const printedOctopus = readTerminalLine();

        runTypedCommand(1);
        expect(readTerminalLine()).not.toBe(printedOctopus);
    });

    it('waves back at a visitor who reaches the badge with the keyboard', () => {
        render(<PromptbookCoderBadge />);
        runTypedCommand();

        const badgeLink = screen.getByRole('link');

        fireEvent.focus(badgeLink);
        expect(readTerminalLine()).toBe('$ \\<^^w>/    ');

        fireEvent.blur(badgeLink);
        expect(readTerminalLine()).toBe('$ -<@@/>- { }');
    });

    it('names the octopus nowhere, so the badge is read as its label alone', () => {
        render(<PromptbookCoderBadge />);
        runTypedCommand();

        // Note: The drawing repeats what the label already says, so a screen reader which read it too would say the
        //       same thing twice.
        expect(screen.getByRole('link', { name: PROMPTBOOK_CODER_BADGE_LABEL })).toBeDefined();
        expect(screen.getByRole('link').querySelector('[aria-hidden="true"]')).not.toBeNull();
    });

    it('takes the colours of the page it is worn on', () => {
        render(
            <PromptbookCoderBadge
                className="border-black/10"
                terminalClassName="text-black"
                labelClassName="max-w-0"
            />,
        );

        const badgeLink = screen.getByRole('link');

        expect(badgeLink.className).toContain('border-black/10');
        expect(badgeLink.querySelector('[aria-hidden="true"]')?.getAttribute('class')).toContain('text-black');
        expect(screen.getByText(PROMPTBOOK_CODER_BADGE_LABEL).getAttribute('class')).toContain('max-w-0');
    });
});
