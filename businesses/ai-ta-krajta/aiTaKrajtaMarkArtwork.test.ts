import {
    AI_TA_KRAJTA_MARK_BODY,
    AI_TA_KRAJTA_MARK_BOUNDS,
    AI_TA_KRAJTA_MARK_SHAPES,
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE,
    createAiTaKrajtaMarkGradientId,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { createAiTaKrajtaSnakeBodySlices } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

/**
 * The cover artwork of the show, which the mark is traced off and is therefore measured against
 */
const COVER_FILE_PATH = 'public/pavol/media/ai-ta-krajta.jpg';

/**
 * How large both pictures are compared, in pixels of their edge
 */
const COMPARISON_SIZE = 450;

/**
 * The dark green the cover sits on, read off the cover itself rather than off the palette of the page
 */
const COVER_BACKGROUND: readonly number[] = [53, 60, 53];

/**
 * How far a colour may be from the background and still count as background, and how bright a pixel of the white
 * corners of the cover is
 *
 * Note: The cover is a JPEG with no transparency, so it paints the corners around its rounding white. Those corners
 *       are left out of every comparison here.
 */
const BACKGROUND_TOLERANCE = 45;
const CORNER_BRIGHTNESS = 200;

type Picture = {
    readonly readColor: (x: number, y: number) => readonly number[];
    readonly isAnimal: (x: number, y: number) => boolean;
    readonly isCorner: (x: number, y: number) => boolean;
};

function getColorDistance(firstColor: readonly number[], secondColor: readonly number[]): number {
    return Math.hypot(
        (firstColor[0] ?? 0) - (secondColor[0] ?? 0),
        (firstColor[1] ?? 0) - (secondColor[1] ?? 0),
        (firstColor[2] ?? 0) - (secondColor[2] ?? 0),
    );
}

async function readPicture(image: Buffer): Promise<Picture> {
    const { data, info } = await sharp(image)
        .resize(COMPARISON_SIZE, COMPARISON_SIZE)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    const readColor = (x: number, y: number) => {
        const offset = (y * info.width + x) * info.channels;

        return [data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0];
    };
    const isCorner = (x: number, y: number) => readColor(x, y).every((channel) => channel > CORNER_BRIGHTNESS);

    return {
        readColor,
        isCorner,
        isAnimal: (x, y) =>
            getColorDistance(readColor(x, y), COVER_BACKGROUND) > BACKGROUND_TOLERANCE && !isCorner(x, y),
    };
}

/**
 * Renders SVG markup the way a browser renders it, on the background the cover uses
 */
async function drawOnCoverBackground(markup: string): Promise<Picture> {
    const background = `rgb(${COVER_BACKGROUND.join(',')})`;

    return readPicture(
        Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE}` +
                ` ${AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE}" width="${COMPARISON_SIZE}" height="${COMPARISON_SIZE}">` +
                `<rect width="${AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE}" height="${AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE}"` +
                ` fill="${background}"/>${markup}</svg>`,
        ),
    );
}

/**
 * The drawn mark, as the page and the browser tab draw it
 */
function createMarkMarkup(): string {
    const gradients = AI_TA_KRAJTA_MARK_SHAPES.map((shape) => {
        const stops = shape.gradient.stops
            .map((stop) => `<stop offset="${stop.offset}" stop-color="${stop.color}"/>`)
            .join('');

        return (
            `<linearGradient id="${createAiTaKrajtaMarkGradientId('test', shape.id)}" x1="${shape.gradient.x1}"` +
            ` y1="${shape.gradient.y1}" x2="${shape.gradient.x2}" y2="${shape.gradient.y2}"` +
            ` gradientUnits="userSpaceOnUse">${stops}</linearGradient>`
        );
    }).join('');
    const paths = AI_TA_KRAJTA_MARK_SHAPES.map(
        (shape) => `<path d="${shape.pathData}" fill="url(#${createAiTaKrajtaMarkGradientId('test', shape.id)})"/>`,
    ).join('');

    return `<defs>${gradients}</defs>${paths}`;
}

/**
 * The living animal standing in the pose of the logo, drawn with the strokes the game draws it with
 */
function createRestingSnakeMarkup(): string {
    return createAiTaKrajtaSnakeBodySlices(AI_TA_KRAJTA_MARK_BODY, 1, 0)
        .map(
            (slice) =>
                `<path d="M${slice.from.x} ${slice.from.y}L${slice.to.x} ${slice.to.y}" stroke="${slice.color}"` +
                ` stroke-width="${slice.strokeWidth}" stroke-linecap="round" fill="none"/>`,
        )
        .join('');
}

/**
 * How far a rendered picture is from the cover, over every pixel outside the white corners of the cover
 */
function measureAgainstCover(
    cover: Picture,
    candidate: Picture,
): { readonly meanColorDistance: number; readonly silhouetteOverlap: number } {
    let colorDistanceSum = 0;
    let comparedPixelCount = 0;
    let sharedAnimalPixelCount = 0;
    let anyAnimalPixelCount = 0;

    for (let y = 0; y < COMPARISON_SIZE; y++) {
        for (let x = 0; x < COMPARISON_SIZE; x++) {
            if (cover.isCorner(x, y)) {
                continue;
            }

            colorDistanceSum += getColorDistance(cover.readColor(x, y), candidate.readColor(x, y));
            comparedPixelCount += 1;

            const isCoverAnimal = cover.isAnimal(x, y);
            const isCandidateAnimal = candidate.isAnimal(x, y);

            if (isCoverAnimal && isCandidateAnimal) sharedAnimalPixelCount += 1;
            if (isCoverAnimal || isCandidateAnimal) anyAnimalPixelCount += 1;
        }
    }

    return {
        meanColorDistance: colorDistanceSum / comparedPixelCount,
        silhouetteOverlap: sharedAnimalPixelCount / anyAnimalPixelCount,
    };
}

describe('AI ta Krajta mark artwork', () => {
    it('draws the cover artwork of the show and not something merely like it', async () => {
        const cover = await readPicture(await sharp(COVER_FILE_PATH).toBuffer());
        const mark = await drawOnCoverBackground(createMarkMarkup());
        const { meanColorDistance, silhouetteOverlap } = measureAgainstCover(cover, mark);

        // Note: What is left over is the one soft pixel along the outline, which is worth about three per cent of the
        //       animal at this size and which no rendering of a curve can avoid.
        expect(meanColorDistance).toBeLessThan(4);
        expect(silhouetteOverlap).toBeGreaterThan(0.96);
    });

    it('measures the animal so that it rests in the shape it is drawn in', async () => {
        const mark = await drawOnCoverBackground(createMarkMarkup());
        const restingSnake = await drawOnCoverBackground(createRestingSnakeMarkup());
        const { silhouetteOverlap } = measureAgainstCover(mark, restingSnake);

        // Note: A body of one thickness cannot hold the widest part of the drawn coil and the wedge of its tail at
        //       once. What it misses is a thin rim, which is why the logo can be faded into it without a jump.
        expect(silhouetteOverlap).toBeGreaterThan(0.87);
    });

    it('knows where the animal sits inside its view box', () => {
        expect(AI_TA_KRAJTA_MARK_BOUNDS.left).toBeGreaterThan(0);
        expect(AI_TA_KRAJTA_MARK_BOUNDS.right).toBeLessThan(AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE);
        expect(AI_TA_KRAJTA_MARK_BOUNDS.top).toBeGreaterThan(0);
        expect(AI_TA_KRAJTA_MARK_BOUNDS.bottom).toBeLessThan(AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE);

        for (const point of AI_TA_KRAJTA_MARK_BODY) {
            expect(point.x).toBeGreaterThanOrEqual(AI_TA_KRAJTA_MARK_BOUNDS.left);
            expect(point.x).toBeLessThanOrEqual(AI_TA_KRAJTA_MARK_BOUNDS.right);
            expect(point.y).toBeGreaterThanOrEqual(AI_TA_KRAJTA_MARK_BOUNDS.top);
            expect(point.y).toBeLessThanOrEqual(AI_TA_KRAJTA_MARK_BOUNDS.bottom);
        }
    });
});
