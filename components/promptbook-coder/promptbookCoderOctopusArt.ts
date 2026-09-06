/**
 * Which way the octopus of Promptbook coder turns its attention
 */
export type PromptbookCoderOctopusGaze = 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

/**
 * What the octopus is up to, which decides its face, its tentacles and what it holds
 */
export type PromptbookCoderOctopusMood =
    /**
     * Busy with one of its activities, which is what it does when nobody bothers it
     */
    | 'WORKING'

    /**
     * Put the work down to watch the pointer which came close
     */
    | 'WATCHING'

    /**
     * Rides the page while it is being scrolled
     */
    | 'SURFING'

    /**
     * Says hello to whoever points at the badge
     */
    | 'GREETING';

/**
 * One thing the octopus does while it is left alone
 */
export type PromptbookCoderOctopusActivityId = 'CODING' | 'PLAYING_WITH_SNAKE' | 'PAINTING' | 'THINKING';

/**
 * Everything one drawn frame of the octopus is made of
 */
export type PromptbookCoderOctopusPose = {
    readonly mood: PromptbookCoderOctopusMood;

    /**
     * Which way it turns, which is the tentacle it reaches out with
     */
    readonly gaze: PromptbookCoderOctopusGaze;

    /**
     * Whether the eyes are shut in the middle of a blink
     */
    readonly isBlinking: boolean;

    /**
     * Which frame of the tentacle wave is drawn
     */
    readonly wavePhase: number;

    /**
     * Which activity it is busy with, drawn only while it is `WORKING`
     */
    readonly activityId: PromptbookCoderOctopusActivityId;

    /**
     * Which frame of that activity is drawn
     */
    readonly activityPhase: number;
};

/**
 * Both tentacles of one drawn frame, the left one first
 */
type PromptbookCoderOctopusTentacles = readonly [left: string, right: string];

/**
 * The activities the octopus works through, in the order it gets to them
 */
export const PROMPTBOOK_CODER_OCTOPUS_ACTIVITY_IDS = [
    'CODING',
    'PLAYING_WITH_SNAKE',
    'PAINTING',
    'THINKING',
] as const satisfies readonly PromptbookCoderOctopusActivityId[];

/**
 * The eyes of an octopus which is awake, which are the two `@` of `-<@@/>-`
 */
const OCTOPUS_OPEN_EYES = '@@';

/**
 * The eyes of an octopus which is in the middle of a blink
 */
const OCTOPUS_BLINKING_EYES = '--';

/**
 * The eyes of an octopus which is happy to see somebody
 */
const OCTOPUS_GREETING_EYES = '^^';

/**
 * The beak of an octopus, which says what it is up to
 *
 * Note: While it works, the beak is the `/` of `-<@@/>-`, which is the one character of the drawing that is about
 *       code. It only ever gives that character up to say something about the visitor instead.
 */
const OCTOPUS_BEAK_BY_MOOD: Readonly<Record<PromptbookCoderOctopusMood, string>> = {
    WORKING: '/',
    WATCHING: 'o',
    SURFING: 'o',
    GREETING: 'w',
};

/**
 * Tentacles of an octopus which is busy, rolling one after the other
 *
 * Note: The first frame is the `-` of `-<@@/>-` on both sides, so that the octopus which is served with the page and
 *       the one a visitor who asked for no movement keeps is exactly the drawing the badge is named after.
 */
const OCTOPUS_WAVING_TENTACLES: readonly PromptbookCoderOctopusTentacles[] = [
    ['-', '-'],
    ['~', '='],
    ['=', '~'],
    ['—', '-'],
    ['~', '~'],
    ['-', '—'],
];

/**
 * Tentacles thrown in the air, which is how the octopus says hello
 */
const OCTOPUS_GREETING_TENTACLES: readonly PromptbookCoderOctopusTentacles[] = [
    ['\\', '/'],
    ['^', '^'],
    ['/', '\\'],
    ['^', '^'],
];

/**
 * The tentacle the octopus reaches towards a pointer which came close, by the way that pointer lies
 *
 * Note: Two characters of eyes cannot point anywhere, so the octopus follows the pointer with a tentacle instead: the
 *       one on the side the pointer is on stretches out towards it while the other stays short.
 */
const OCTOPUS_REACHING_TENTACLES_BY_GAZE: Readonly<
    Record<PromptbookCoderOctopusGaze, PromptbookCoderOctopusTentacles>
> = {
    CENTER: ['-', '-'],
    LEFT: ['—', '-'],
    RIGHT: ['-', '—'],
    UP: ['^', '^'],
    DOWN: ['_', '_'],
};

/**
 * Tentacles blown by a page which is being scrolled, streaming against the way it travels
 */
const OCTOPUS_SURFING_TENTACLES_WHILE_LOOKING_UP: PromptbookCoderOctopusTentacles = ['/', '\\'];
const OCTOPUS_SURFING_TENTACLES_WHILE_LOOKING_DOWN: PromptbookCoderOctopusTentacles = ['\\', '/'];

/**
 * What the octopus holds while it does each of its activities
 *
 * Note: Every frame is exactly `OCTOPUS_HANDS_WIDTH_IN_CHARACTERS` wide, its first character being the gap which keeps
 *       whatever is held off the tentacle holding it.
 */
const OCTOPUS_HANDS_BY_ACTIVITY: Readonly<Record<PromptbookCoderOctopusActivityId, readonly string[]>> = {
    /**
     * Writes code, cursor and semicolon included
     */
    CODING: [' { }', ' {;}', ' {|}', ' { }'],

    /**
     * Plays with a snake, which on this page is the animal of the show itself
     */
    PLAYING_WITH_SNAKE: [' s~~', ' ~s~', ' ~~s', ' ~s~'],

    /**
     * Paints one little face after another
     */
    PAINTING: [' :) ', ' :D ', ' <3 ', ' ;) '],

    /**
     * Thinks, the way a coding agent visibly does
     */
    THINKING: [' .  ', ' .. ', ' ...', '    '],
};

/**
 * The trail of a page which is travelling under the octopus
 */
const OCTOPUS_SURFING_HANDS: readonly string[] = [' ~  ', ' ~~ ', ' ~~~', ' ~~ '];

/**
 * Hands of an octopus which holds nothing, because it is busy with the visitor instead
 */
const OCTOPUS_EMPTY_HANDS = '    ';

/**
 * How wide what the octopus holds is, in characters
 */
const OCTOPUS_HANDS_WIDTH_IN_CHARACTERS = OCTOPUS_EMPTY_HANDS.length;

/**
 * How wide the octopus itself is with a tentacle on each side, in characters, as in `-<@@/>-`
 */
const OCTOPUS_BODY_WIDTH_IN_CHARACTERS = 7;

/**
 * How wide every frame of the octopus is, in characters
 *
 * Note: Every frame is drawn to exactly this width, so that a badge around a moving octopus never changes size and
 *       nothing on the page is pushed around by a waving tentacle.
 */
export const PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS =
    OCTOPUS_BODY_WIDTH_IN_CHARACTERS + OCTOPUS_HANDS_WIDTH_IN_CHARACTERS;

/**
 * Picks the frame an endlessly repeating animation stands at
 *
 * @param frames all frames of the animation, in order
 * @param phase how far the animation has got, counted in frames and allowed to grow without end
 * @returns the frame to draw now
 */
function readAnimationFrame<TFrame>(frames: readonly TFrame[], phase: number): TFrame {
    return frames[((phase % frames.length) + frames.length) % frames.length];
}

/**
 * Draws the eyes of one frame
 *
 * @param pose the frame being drawn
 * @returns two characters of eyes
 */
function drawOctopusEyes(pose: PromptbookCoderOctopusPose): string {
    if (pose.isBlinking) {
        return OCTOPUS_BLINKING_EYES;
    }

    if (pose.mood === 'GREETING') {
        return OCTOPUS_GREETING_EYES;
    }

    return OCTOPUS_OPEN_EYES;
}

/**
 * Draws both tentacles of one frame
 *
 * @param pose the frame being drawn
 * @returns the left tentacle and the right one
 */
function drawOctopusTentacles(pose: PromptbookCoderOctopusPose): PromptbookCoderOctopusTentacles {
    if (pose.mood === 'GREETING') {
        return readAnimationFrame(OCTOPUS_GREETING_TENTACLES, pose.wavePhase);
    }

    if (pose.mood === 'SURFING') {
        return pose.gaze === 'UP'
            ? OCTOPUS_SURFING_TENTACLES_WHILE_LOOKING_UP
            : OCTOPUS_SURFING_TENTACLES_WHILE_LOOKING_DOWN;
    }

    if (pose.mood === 'WATCHING') {
        return OCTOPUS_REACHING_TENTACLES_BY_GAZE[pose.gaze];
    }

    return readAnimationFrame(OCTOPUS_WAVING_TENTACLES, pose.wavePhase);
}

/**
 * Draws what the octopus holds in one frame
 *
 * Note: An octopus which watches the pointer or greets it holds nothing, because it has just put its work down to do
 *       exactly that.
 *
 * @param pose the frame being drawn
 * @returns `OCTOPUS_HANDS_WIDTH_IN_CHARACTERS` characters of whatever it is up to
 */
function drawOctopusHands(pose: PromptbookCoderOctopusPose): string {
    if (pose.mood === 'WATCHING' || pose.mood === 'GREETING') {
        return OCTOPUS_EMPTY_HANDS;
    }

    if (pose.mood === 'SURFING') {
        return readAnimationFrame(OCTOPUS_SURFING_HANDS, pose.wavePhase);
    }

    return readAnimationFrame(OCTOPUS_HANDS_BY_ACTIVITY[pose.activityId], pose.activityPhase);
}

/**
 * Draws one frame of the octopus of Promptbook coder as a single line of characters
 *
 * Note: This is the terminal octopus of Promptbook coder shrunk to what a badge can wear: two eyes, a beak, a tentacle
 *       on each side and whatever it holds. It is written in characters rather than drawn as a picture, because
 *       characters are what the octopus is made of everywhere else the tool prints it.
 *
 * @param pose what the octopus is doing, turned towards and holding right now
 * @returns exactly `PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS` characters, such as `-<@@/>- { }`
 */
export function drawPromptbookCoderOctopus(pose: PromptbookCoderOctopusPose): string {
    const [leftTentacle, rightTentacle] = drawOctopusTentacles(pose);

    return (
        leftTentacle +
        '<' +
        drawOctopusEyes(pose) +
        OCTOPUS_BEAK_BY_MOOD[pose.mood] +
        '>' +
        rightTentacle +
        drawOctopusHands(pose)
    );
}
