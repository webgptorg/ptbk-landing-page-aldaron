import {
    drawPromptbookCoderOctopus,
    PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS,
    PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS,
    type PromptbookCoderOctopusGaze,
    type PromptbookCoderOctopusMood,
    type PromptbookCoderOctopusPose,
} from '@/components/promptbook-coder/promptbookCoderOctopusArt';
import { describe, expect, it } from 'vitest';

/**
 * Every way the octopus can be turned
 */
const OCTOPUS_GAZES = [
    'CENTER',
    'LEFT',
    'RIGHT',
    'UP',
    'DOWN',
] as const satisfies readonly PromptbookCoderOctopusGaze[];

/**
 * Everything the octopus can be up to
 */
const OCTOPUS_MOODS = [
    'WORKING',
    'WATCHING',
    'SURFING',
    'GREETING',
] as const satisfies readonly PromptbookCoderOctopusMood[];

/**
 * The octopus as the badge is named after it, which is also the frame the page is served with
 */
const RESTING_POSE: PromptbookCoderOctopusPose = {
    mood: 'WORKING',
    gaze: 'CENTER',
    isBlinking: false,
    wavePhase: 0,
    activityId: 'CODING',
    activityPhase: 0,
};

/**
 * How many frames of every animation are compared, which is far more than any of them has
 */
const COMPARED_FRAME_COUNT = 30;

describe('drawPromptbookCoderOctopus', () => {
    it('draws the octopus the badge is named after in its first frame', () => {
        expect(drawPromptbookCoderOctopus(RESTING_POSE)).toBe('-<@@/>- { }');
    });

    it('keeps every frame of every mood exactly as wide as the badge reserves for it', () => {
        for (const mood of OCTOPUS_MOODS) {
            for (const gaze of OCTOPUS_GAZES) {
                for (const activityId of PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS) {
                    for (let phase = 0; phase < COMPARED_FRAME_COUNT; phase++) {
                        const drawnOctopus = drawPromptbookCoderOctopus({
                            mood,
                            gaze,
                            isBlinking: phase % 2 === 0,
                            wavePhase: phase,
                            activityId,
                            activityPhase: phase,
                        });

                        expect(
                            Array.from(drawnOctopus),
                            `Expected ${mood}/${gaze}/${activityId} at ${phase} to be drawn to the width of the badge`,
                        ).toHaveLength(PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS);
                    }
                }
            }
        }
    });

    it('shuts the eyes of a blinking octopus whatever it is up to', () => {
        for (const mood of OCTOPUS_MOODS) {
            const blinkedOctopus = drawPromptbookCoderOctopus({ ...RESTING_POSE, mood, isBlinking: true });

            expect(blinkedOctopus, `Expected the eyes of a blinking ${mood} octopus to be shut`).toContain('<--');
            expect(blinkedOctopus).not.toContain('@');
        }
    });

    it('writes code with the beak while it works and puts that beak down for the visitor', () => {
        expect(drawPromptbookCoderOctopus(RESTING_POSE)).toContain('<@@/>');
        expect(drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'WATCHING' })).toContain('<@@o>');
        expect(drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'GREETING' })).toContain('<^^w>');
    });

    it('waves with the tentacles of a busy octopus and never with the same two twice in a row', () => {
        const wavedFrames = Array.from({ length: COMPARED_FRAME_COUNT }, (_, wavePhase) =>
            drawPromptbookCoderOctopus({ ...RESTING_POSE, wavePhase, activityPhase: 0 }),
        );

        for (let frameIndex = 1; frameIndex < wavedFrames.length; frameIndex++) {
            expect(wavedFrames[frameIndex]).not.toBe(wavedFrames[frameIndex - 1]);
        }

        // Note: The whole point of the wave is that a tentacle is not always the same character, so more than one
        //       kind of tentacle has to be drawn over a turn of the animation.
        expect(new Set(wavedFrames).size).toBeGreaterThan(1);
    });

    it('reaches towards the pointer with the tentacle on its side and drops what it was holding', () => {
        const watchedFromLeft = drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'WATCHING', gaze: 'LEFT' });
        const watchedFromRight = drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'WATCHING', gaze: 'RIGHT' });

        expect(watchedFromLeft).toBe('—<@@o>-    ');
        expect(watchedFromRight).toBe('-<@@o>—    ');
    });

    it('rides a scrolled page with its tentacles blown against the way it travels', () => {
        const surfedUpwards = drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'SURFING', gaze: 'UP' });
        const surfedDownwards = drawPromptbookCoderOctopus({ ...RESTING_POSE, mood: 'SURFING', gaze: 'DOWN' });

        expect(surfedUpwards).not.toBe(surfedDownwards);
        expect(surfedUpwards.startsWith('/')).toBe(true);
        expect(surfedDownwards.startsWith('\\')).toBe(true);
    });

    it('holds something of its own in every activity it works through', () => {
        const heldThings = PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS.map((activityId) =>
            drawPromptbookCoderOctopus({ ...RESTING_POSE, activityId, activityPhase: 1 }),
        );

        expect(new Set(heldThings).size).toBe(PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS.length);
        expect(heldThings).toContain('-<@@/>- {;}');
    });
});
