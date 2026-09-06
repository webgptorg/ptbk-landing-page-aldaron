import { PROMPTBOOK_CODER_COMMAND } from '@/components/promptbook-coder/promptbookCoderConfig';
import {
    drawPromptbookCoderTypedCommand,
    isPromptbookCoderCommandRunning,
    PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES,
} from '@/components/promptbook-coder/promptbookCoderTerminalBoot';
import { describe, expect, it } from 'vitest';

/**
 * Every frame the command is typed in, from the first character to the one before the octopus takes the line over
 */
const TYPED_FRAMES = Array.from({ length: PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES }, (_, frame) =>
    drawPromptbookCoderTypedCommand(frame),
);

describe('drawPromptbookCoderTypedCommand', () => {
    it('types the command one character at a time', () => {
        expect(TYPED_FRAMES.slice(0, PROMPTBOOK_CODER_COMMAND.length)).toEqual(['p▌', 'pt▌', 'ptb▌', 'ptbk▌']);
    });

    it('keeps the cursor standing until the whole command is typed', () => {
        const framesTheCursorStandsIn = TYPED_FRAMES.slice(0, PROMPTBOOK_CODER_COMMAND.length);

        expect(framesTheCursorStandsIn.every((typedFrame) => typedFrame.endsWith('▌'))).toBe(true);
    });

    it('blinks the cursor once the command is typed, without losing what was typed', () => {
        const heldFrames = TYPED_FRAMES.slice(PROMPTBOOK_CODER_COMMAND.length);

        expect(heldFrames.every((heldFrame) => heldFrame.startsWith(PROMPTBOOK_CODER_COMMAND))).toBe(true);
        expect(new Set(heldFrames).size).toBeGreaterThan(1);
    });

    it('never grows past the command and its cursor', () => {
        for (const typedFrame of TYPED_FRAMES) {
            expect(typedFrame.length).toBeLessThanOrEqual(PROMPTBOOK_CODER_COMMAND.length + 1);
        }
    });
});

describe('isPromptbookCoderCommandRunning', () => {
    it('hands the line over to the octopus only once the command has been typed', () => {
        expect(isPromptbookCoderCommandRunning(0)).toBe(false);
        expect(isPromptbookCoderCommandRunning(PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES - 1)).toBe(false);
        expect(isPromptbookCoderCommandRunning(PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES)).toBe(true);
    });
});
