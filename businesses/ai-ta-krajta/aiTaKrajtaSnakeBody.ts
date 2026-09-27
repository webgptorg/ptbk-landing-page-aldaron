import { AI_TA_KRAJTA_MARK_BODY, type AiTaKrajtaMarkPoint } from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';

/**
 * How thick the animal is and what colour it has at one point along its length
 */
type AiTaKrajtaSnakeBodyShape = {
    /**
     * Half of the thickness here, in units of the view box of the mark
     */
    readonly halfWidth: number;

    readonly color: string;
};

/**
 * How thick the snake is at its nose and at the tip of its tail once it swims freely, in units of the view box
 *
 * Note: Measured in the units of the mark rather than in pixels, so that a snake which has left the logo stays as
 *       thick as the logo was, whatever size the terrarium happens to be.
 */
const PLAYING_HEAD_HALF_WIDTH = 8;
const PLAYING_TAIL_HALF_WIDTH = 2.4;

/**
 * Where along the drawn animal each measured point sits, from zero at the nose to one at the tip of the tail
 */
const LOGO_BODY_FRACTIONS: readonly number[] = (() => {
    const distances = [0];

    for (let index = 1; index < AI_TA_KRAJTA_MARK_BODY.length; index++) {
        const previousPoint = AI_TA_KRAJTA_MARK_BODY[index - 1];
        const point = AI_TA_KRAJTA_MARK_BODY[index];

        distances.push(distances[index - 1] + Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y));
    }

    const length = distances[distances.length - 1];

    return distances.map((distance) => distance / length);
})();

function clampFraction(value: number): number {
    return Math.min(1, Math.max(0, value));
}

/**
 * Reads the three channels out of a `#rrggbb` colour
 */
function parseColor(color: string): readonly number[] {
    return [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16));
}

/**
 * Writes three channels back as a `#rrggbb` colour
 */
function formatColor(channels: readonly number[]): string {
    return '#' + channels.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('');
}

/**
 * A colour part of the way between two others
 */
function mixColors(fromColor: string, toColor: string, ratio: number): string {
    if (fromColor === toColor) {
        return fromColor;
    }

    const fromChannels = parseColor(fromColor);
    const toChannels = parseColor(toColor);

    return formatColor(fromChannels.map((channel, index) => channel + (toChannels[index] - channel) * ratio));
}

/**
 * How the cover artwork draws the animal at a point along its length
 */
function getLogoBodyShape(bodyFraction: number): AiTaKrajtaSnakeBodyShape {
    let index = 1;

    while (index < AI_TA_KRAJTA_MARK_BODY.length - 1 && bodyFraction > LOGO_BODY_FRACTIONS[index]) {
        index++;
    }

    const before = AI_TA_KRAJTA_MARK_BODY[index - 1];
    const after = AI_TA_KRAJTA_MARK_BODY[index];
    const span = LOGO_BODY_FRACTIONS[index] - LOGO_BODY_FRACTIONS[index - 1];
    const ratio = span === 0 ? 0 : clampFraction((bodyFraction - LOGO_BODY_FRACTIONS[index - 1]) / span);

    return {
        halfWidth: before.halfWidth + (after.halfWidth - before.halfWidth) * ratio,
        color: mixColors(before.color, after.color, ratio),
    };
}

/**
 * How the game draws the animal at a point along its length, which is an even taper in the colours of the show
 */
function getPlayingBodyShape(bodyFraction: number): AiTaKrajtaSnakeBodyShape {
    return {
        halfWidth: PLAYING_HEAD_HALF_WIDTH - (PLAYING_HEAD_HALF_WIDTH - PLAYING_TAIL_HALF_WIDTH) * bodyFraction,
        color: mixColors(AI_TA_KRAJTA_COLORS.CORAL, AI_TA_KRAJTA_COLORS.INDIGO, bodyFraction),
    };
}

/**
 * How thick and what colour the animal is at a point along its length while it wakes up
 *
 * Note: At the first frame this is the drawing, measured off the cover; by the end of the release it is an ordinary
 *       game snake. Nothing jumps in between, which is the point of measuring the drawing in the first place.
 *
 * @param bodyFraction where along the animal this is asked for, zero at the nose and one at the tip of the tail
 * @param releaseProgress how far the logo has been let go, zero while it is still the logo and one once it is loose
 */
function getBodyShape(bodyFraction: number, releaseProgress: number): AiTaKrajtaSnakeBodyShape {
    const clampedFraction = clampFraction(bodyFraction);
    const logoShape = getLogoBodyShape(clampedFraction);

    if (releaseProgress <= 0) {
        return logoShape;
    }

    const playingShape = getPlayingBodyShape(clampedFraction);
    const ratio = clampFraction(releaseProgress);

    return {
        halfWidth: logoShape.halfWidth + (playingShape.halfWidth - logoShape.halfWidth) * ratio,
        color: mixColors(logoShape.color, playingShape.color, ratio),
    };
}

/**
 * One round-capped stroke the animal is drawn with
 */
export type AiTaKrajtaSnakeBodySlice = {
    readonly from: AiTaKrajtaMarkPoint;
    readonly to: AiTaKrajtaMarkPoint;

    /**
     * How wide the stroke is drawn, in the units the centre line is given in
     */
    readonly strokeWidth: number;

    readonly color: string;
};

/**
 * Cuts the animal into the strokes it is drawn with, from the tip of the tail towards the nose
 *
 * Note: Laid down in that order, a body which crosses itself overlaps the way the cover artwork paints its coil. The
 *       same slices are drawn onto the canvas of the game and rendered by the test which holds the drawing against
 *       the cover, so what is measured there is what a visitor sees.
 *
 * @param centerLine where the body runs, from the nose to the tip of the tail
 * @param markScale how many units of the centre line one unit of the artwork is worth
 * @param releaseProgress how far the logo has been let go, zero while it is still the logo and one once it is loose
 */
export function createAiTaKrajtaSnakeBodySlices(
    centerLine: readonly AiTaKrajtaMarkPoint[],
    markScale: number,
    releaseProgress: number,
): readonly AiTaKrajtaSnakeBodySlice[] {
    const lastIndex = centerLine.length - 1;
    const slices: AiTaKrajtaSnakeBodySlice[] = [];
    const distancesFromNose = Array.from({ length: centerLine.length }, () => 0);

    for (let pointIndex = 1; pointIndex <= lastIndex; pointIndex++) {
        const previousPoint = centerLine[pointIndex - 1];
        const point = centerLine[pointIndex];

        if (previousPoint !== undefined && point !== undefined) {
            distancesFromNose[pointIndex] =
                (distancesFromNose[pointIndex - 1] ?? 0) + Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
        }
    }

    const totalBodyLength = distancesFromNose[lastIndex] ?? 0;

    if (totalBodyLength === 0) {
        return slices;
    }

    for (let pointIndex = lastIndex; pointIndex > 0; pointIndex--) {
        const from = centerLine[pointIndex];
        const to = centerLine[pointIndex - 1];

        if (from === undefined || to === undefined) {
            continue;
        }

        const bodyShape = getBodyShape((distancesFromNose[pointIndex] ?? totalBodyLength) / totalBodyLength, releaseProgress);

        slices.push({ from, to, strokeWidth: bodyShape.halfWidth * 2 * markScale, color: bodyShape.color });
    }

    return slices;
}
