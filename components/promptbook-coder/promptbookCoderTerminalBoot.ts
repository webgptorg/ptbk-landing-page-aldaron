import { PROMPTBOOK_CODER_COMMAND } from '@/components/promptbook-coder/promptbookCoderConfig';

/**
 * The block a terminal leaves standing where the next character would be typed
 */
const TERMINAL_CURSOR = '▌';

/**
 * What a terminal shows where the cursor is not standing right now
 */
const TERMINAL_CURSOR_GAP = ' ';

/**
 * How many frames the typed command stands complete before it runs
 *
 * Note: Long enough for the cursor to blink once, which is what says the command was typed rather than printed.
 */
const FRAMES_OF_A_TYPED_COMMAND_BEFORE_IT_RUNS = 2;

/**
 * How many frames pass between the first typed character and the octopus the command prints
 */
export const PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES =
    PROMPTBOOK_CODER_COMMAND.length + FRAMES_OF_A_TYPED_COMMAND_BEFORE_IT_RUNS;

/**
 * Whether the command has finished being typed, which is when the octopus takes the line over
 *
 * @param frame how many frames have passed since the badge was first drawn
 */
export function isPromptbookCoderCommandRunning(frame: number): boolean {
    return frame >= PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES;
}

/**
 * Draws the command being typed into the microterminal of the badge
 *
 * Note: The cursor only starts blinking once there is nothing left to type, because a cursor which blinks while
 *       somebody types reads as a fault rather than as a terminal.
 *
 * @param frame how many frames have passed since the badge was first drawn
 * @returns as much of the command as has been typed by now, the cursor behind it, such as `ptb▌`
 */
export function drawPromptbookCoderTypedCommand(frame: number): string {
    const typedCharacterCount = Math.min(frame + 1, PROMPTBOOK_CODER_COMMAND.length);
    const framesSinceCommandWasTyped = frame - (PROMPTBOOK_CODER_COMMAND.length - 1);
    const isCursorDrawn = framesSinceCommandWasTyped < 0 || framesSinceCommandWasTyped % 2 === 0;

    return (
        PROMPTBOOK_CODER_COMMAND.slice(0, typedCharacterCount) + (isCursorDrawn ? TERMINAL_CURSOR : TERMINAL_CURSOR_GAP)
    );
}
