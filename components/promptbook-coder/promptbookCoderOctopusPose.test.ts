import { drawPromptbookCoderOctopus } from '@/components/promptbook-coder/promptbookCoderOctopusArt';
import {
    resolvePromptbookCoderPointerAttention,
    selectPromptbookCoderOctopusPose,
    type PromptbookCoderOctopusSenses,
} from '@/components/promptbook-coder/promptbookCoderOctopusPose';
import { describe, expect, it } from 'vitest';

/**
 * An octopus nobody is doing anything to, in the frame the command prints it in
 */
const UNDISTURBED_SENSES: PromptbookCoderOctopusSenses = {
    octopusFrame: 0,
    pointerGaze: null,
    isPointerNear: false,
    scrollDirection: null,
    isGreeting: false,
};

/**
 * How many frames of the animation are looked through, which is several turns of every one of them
 */
const EXAMINED_FRAME_COUNT = 120;

describe('resolvePromptbookCoderPointerAttention', () => {
    it('turns the octopus towards the longer half of the way to the pointer', () => {
        expect(resolvePromptbookCoderPointerAttention(-300, 20).pointerGaze).toBe('LEFT');
        expect(resolvePromptbookCoderPointerAttention(300, -20).pointerGaze).toBe('RIGHT');
        expect(resolvePromptbookCoderPointerAttention(20, -300).pointerGaze).toBe('UP');
        expect(resolvePromptbookCoderPointerAttention(-20, 300).pointerGaze).toBe('DOWN');
    });

    it('leaves an octopus the pointer rests on facing straight ahead', () => {
        expect(resolvePromptbookCoderPointerAttention(0, 0)).toEqual({ pointerGaze: 'CENTER', isPointerNear: true });
        expect(resolvePromptbookCoderPointerAttention(4, -6).pointerGaze).toBe('CENTER');
    });

    it('only counts a pointer which came close as one worth watching', () => {
        expect(resolvePromptbookCoderPointerAttention(120, 80).isPointerNear).toBe(true);
        expect(resolvePromptbookCoderPointerAttention(600, 400).isPointerNear).toBe(false);
    });
});

describe('selectPromptbookCoderOctopusPose', () => {
    it('leaves an undisturbed octopus at work', () => {
        const pose = selectPromptbookCoderOctopusPose(UNDISTURBED_SENSES);

        expect(pose.mood).toBe('WORKING');
        expect(pose.isBlinking).toBe(false);
        expect(drawPromptbookCoderOctopus(pose)).toBe('-<@@/>- { }');
    });

    it('greets the visitor before it does anything else', () => {
        const pose = selectPromptbookCoderOctopusPose({
            ...UNDISTURBED_SENSES,
            isGreeting: true,
            isPointerNear: true,
            pointerGaze: 'LEFT',
            scrollDirection: 'DOWN',
        });

        expect(pose.mood).toBe('GREETING');
        expect(pose.gaze).toBe('CENTER');
    });

    it('rides a moving page rather than watching a pointer which came close', () => {
        const pose = selectPromptbookCoderOctopusPose({
            ...UNDISTURBED_SENSES,
            isPointerNear: true,
            pointerGaze: 'LEFT',
            scrollDirection: 'UP',
        });

        expect(pose.mood).toBe('SURFING');
        expect(pose.gaze).toBe('UP');
    });

    it('watches a pointer which came close and ignores one which stayed away', () => {
        expect(
            selectPromptbookCoderOctopusPose({ ...UNDISTURBED_SENSES, pointerGaze: 'RIGHT', isPointerNear: true }),
        ).toMatchObject({ mood: 'WATCHING', gaze: 'RIGHT' });

        expect(
            selectPromptbookCoderOctopusPose({ ...UNDISTURBED_SENSES, pointerGaze: 'RIGHT', isPointerNear: false }),
        ).toMatchObject({ mood: 'WORKING' });
    });

    it('blinks now and then rather than every frame or never', () => {
        const blinkedFrameCount = Array.from({ length: EXAMINED_FRAME_COUNT }, (_, octopusFrame) =>
            selectPromptbookCoderOctopusPose({ ...UNDISTURBED_SENSES, octopusFrame }),
        ).filter((pose) => pose.isBlinking).length;

        expect(blinkedFrameCount).toBeGreaterThan(0);
        expect(blinkedFrameCount).toBeLessThan(EXAMINED_FRAME_COUNT / 4);
    });

    it('works through every one of its activities and comes back to the first', () => {
        const workedActivityIds = Array.from(
            { length: EXAMINED_FRAME_COUNT },
            (_, octopusFrame) => selectPromptbookCoderOctopusPose({ ...UNDISTURBED_SENSES, octopusFrame }).activityId,
        );

        expect(new Set(workedActivityIds)).toEqual(new Set(['CODING', 'PLAYING_WITH_SNAKE', 'PAINTING', 'THINKING']));
        expect(workedActivityIds[0]).toBe('CODING');
        expect(workedActivityIds[workedActivityIds.length - 1]).toBe('CODING');
    });
});
