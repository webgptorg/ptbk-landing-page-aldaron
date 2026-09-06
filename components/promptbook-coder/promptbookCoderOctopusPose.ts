import {
    PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS,
    type PromptbookCoderOctopusActivityId,
    type PromptbookCoderOctopusGaze,
    type PromptbookCoderOctopusMood,
    type PromptbookCoderOctopusPose,
} from '@/components/promptbook-coder/promptbookCoderOctopusArt';

/**
 * Which way a page is travelling under the octopus
 */
export type PromptbookCoderScrollDirection = 'UP' | 'DOWN';

/**
 * What the octopus notices around itself
 */
export type PromptbookCoderOctopusSurroundings = {
    /**
     * Where the pointer lies from the badge, `null` while no pointer has moved for a while
     */
    readonly pointerGaze: PromptbookCoderOctopusGaze | null;

    /**
     * Whether that pointer is close enough to be worth putting the work down for
     */
    readonly isPointerNear: boolean;

    /**
     * Which way the page is being scrolled, `null` while it stands still
     */
    readonly scrollDirection: PromptbookCoderScrollDirection | null;
};

/**
 * What the octopus notices, together with how long it has been drawn at all
 */
export type PromptbookCoderOctopusPerception = PromptbookCoderOctopusSurroundings & {
    /**
     * How many frames the octopus has been on the line, counted from the moment the command printed it
     */
    readonly octopusFrame: number;
};

/**
 * Everything the drawn frame is decided by, what the visitor does to the badge itself included
 */
export type PromptbookCoderOctopusSenses = PromptbookCoderOctopusPerception & {
    /**
     * Whether the visitor points at the badge or has reached it with the keyboard
     */
    readonly isGreeting: boolean;
};

/**
 * How many frames the octopus spends on one activity before it takes up the next one
 */
const OCTOPUS_FRAMES_PER_ACTIVITY = 24;

/**
 * How many frames apart the octopus blinks
 */
const OCTOPUS_FRAMES_BETWEEN_BLINKS = 13;

/**
 * Which frame of every such stretch the blink itself falls on
 *
 * Note: Anything but the first one, so that the very first frame the command prints is the open-eyed `-<@@/>-` rather
 *       than an octopus caught mid-blink.
 */
const OCTOPUS_FRAME_OF_A_BLINK = 7;

/**
 * How close to the middle of the badge the pointer has to be for the octopus to face straight ahead, in pixels
 */
const OCTOPUS_GAZE_DEAD_ZONE_IN_PIXELS = 24;

/**
 * How close the pointer has to come before the octopus puts its work down and watches it, in pixels
 */
const OCTOPUS_POINTER_NEARNESS_IN_PIXELS = 260;

/**
 * What the octopus makes of a pointer somewhere around it
 */
export type PromptbookCoderPointerAttention = {
    /**
     * Which way it lies from the badge
     */
    readonly pointerGaze: PromptbookCoderOctopusGaze;

    /**
     * Whether it is close enough to be worth watching
     */
    readonly isPointerNear: boolean;
};

/**
 * Turns the way from the badge to the pointer into what the octopus makes of it
 *
 * Note: One reaching tentacle can only tell four directions apart, so the longer half of the distance wins and the
 *       shorter one is dropped.
 *
 * @param horizontalDistance how far right of the middle of the badge the pointer is, in pixels, negative to the left
 * @param verticalDistance how far below the middle of the badge the pointer is, in pixels, negative above it
 * @returns which way the octopus then turns and whether the pointer is close enough to interrupt it
 */
export function resolvePromptbookCoderPointerAttention(
    horizontalDistance: number,
    verticalDistance: number,
): PromptbookCoderPointerAttention {
    const distance = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
    const isPointerNear = distance <= OCTOPUS_POINTER_NEARNESS_IN_PIXELS;

    if (distance <= OCTOPUS_GAZE_DEAD_ZONE_IN_PIXELS) {
        return { pointerGaze: 'CENTER', isPointerNear };
    }

    if (Math.abs(horizontalDistance) >= Math.abs(verticalDistance)) {
        return { pointerGaze: horizontalDistance < 0 ? 'LEFT' : 'RIGHT', isPointerNear };
    }

    return { pointerGaze: verticalDistance < 0 ? 'UP' : 'DOWN', isPointerNear };
}

/**
 * Decides what the octopus is up to
 *
 * Note: The visitor comes before the page and the page before the work: an octopus which is being pointed at greets,
 *       one whose page is moving rides it, one which the pointer came close to watches it, and only an octopus nobody
 *       is doing anything to gets back to work.
 *
 * @param senses what the octopus notices right now
 * @returns the mood every part of the drawing is then made of
 */
function selectOctopusMood(senses: PromptbookCoderOctopusSenses): PromptbookCoderOctopusMood {
    if (senses.isGreeting) {
        return 'GREETING';
    }

    if (senses.scrollDirection !== null) {
        return 'SURFING';
    }

    if (senses.isPointerNear) {
        return 'WATCHING';
    }

    return 'WORKING';
}

/**
 * Decides which way the octopus turns
 *
 * @param senses what the octopus notices right now
 * @returns the direction its reaching tentacle is drawn towards
 */
function selectOctopusGaze(senses: PromptbookCoderOctopusSenses): PromptbookCoderOctopusGaze {
    if (senses.isGreeting) {
        return 'CENTER';
    }

    // Note: A scrolled page is followed the way it travels, which is also what tells the two ways of scrolling apart
    //       in the drawing, because the tentacles are then blown the other way.
    if (senses.scrollDirection !== null) {
        return senses.scrollDirection;
    }

    return senses.pointerGaze ?? 'CENTER';
}

/**
 * Decides which activity the octopus has got to
 *
 * @param octopusFrame how many frames the octopus has been on the line
 * @returns the activity to draw while the octopus is left alone
 */
function selectOctopusActivityId(octopusFrame: number): PromptbookCoderOctopusActivityId {
    const activityIndex =
        Math.floor(Math.max(0, octopusFrame) / OCTOPUS_FRAMES_PER_ACTIVITY) %
        PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS.length;

    return PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS[activityIndex];
}

/**
 * Turns everything the octopus notices into the one frame to draw now
 *
 * @param senses what the octopus notices and what the visitor does to the badge
 * @returns the pose `drawPromptbookCoderOctopus` then draws
 */
export function selectPromptbookCoderOctopusPose(senses: PromptbookCoderOctopusSenses): PromptbookCoderOctopusPose {
    return {
        mood: selectOctopusMood(senses),
        gaze: selectOctopusGaze(senses),
        isBlinking: senses.octopusFrame % OCTOPUS_FRAMES_BETWEEN_BLINKS === OCTOPUS_FRAME_OF_A_BLINK,
        wavePhase: senses.octopusFrame,
        activityId: selectOctopusActivityId(senses.octopusFrame),
        activityPhase: senses.octopusFrame,
    };
}
