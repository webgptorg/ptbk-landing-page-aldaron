/**
 * Edge of the square the snake of the show is drawn in
 */
export const AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE = 128;

/**
 * One point in the square coordinate system used by the artwork
 */
export type AiTaKrajtaMarkPoint = {
    readonly x: number;
    readonly y: number;
};

/**
 * Where the square artwork is placed in another coordinate system
 */
export type AiTaKrajtaMarkFrame = {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
};

/**
 * A colour which runs across a drawn part of the snake, in the coordinates of the artwork
 */
export type AiTaKrajtaMarkGradient = {
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
    readonly stops: readonly { readonly offset: number; readonly color: string }[];
};

/**
 * One drawn part of the snake
 *
 * Note: It is described as data rather than as markup, so that the same animal can be turned into React elements for
 *       the page, into a standalone SVG document for the icon of the browser tab and into canvas paths for the game.
 */
export type AiTaKrajtaMarkShape = {
    readonly id: string;
    readonly pathData: string;
    readonly gradient: AiTaKrajtaMarkGradient;
};

/**
 * The snake of the show, in the order its parts are drawn over each other
 *
 * Note: Traced off the cover artwork of the podcast, `public/pavol/media/ai-ta-krajta.jpg`, by
 *       `scripts/_traceAiTaKrajtaMark.mjs`, which is why the numbers are not round. Drawn in this order the coil lies
 *       on itself the way the cover paints it: the tail first, then the part of the coil furthest from the head, then
 *       everything up to the head over both. `aiTaKrajtaMarkArtwork.test.ts` holds the result against that cover.
 */
export const AI_TA_KRAJTA_MARK_SHAPES: readonly AiTaKrajtaMarkShape[] = [
    {
        // The tail, which slides out to the right from under the coil
        id: 'tail',
        pathData:
            'M77.21 85.28C83.27 87.09 88.69 90.53 94.29 93.34C95.86 94.12 97.46 94.91 98.99 95.78C99.73 96.2 100.52 96.48 101.06 97.14C101.06 97.8 100.96 98.31 100.63 98.89C99.65 99.28 98.49 99.2 97.42 99.27C94.62 99.47 91.83 99.78 89.03 99.98C85.9 100.21 82.78 100.61 79.64 100.84C72.4 101.35 65.01 101.12 57.74 101.12C54.46 101.12 51.2 101.5 47.93 101.26C46.59 101.17 44.96 101.36 43.91 100.46C44.46 98.71 47.12 99.13 48.64 99.13C53.18 99.13 58.04 98.87 62.5 97.92C64.88 97.41 67.24 96.89 69.55 96.06C71.17 95.49 72.59 95.01 73.56 93.48C74.54 91.95 75.08 90.22 75.58 88.49C75.91 87.34 76.01 86.17 76.91 85.35C77.01 85.33 77.11 85.3 77.21 85.28Z',
        gradient: {
            x1: 70.52,
            y1: 22.7,
            x2: 119.52,
            y2: 38.47,
            stops: [
                { offset: 0.013, color: '#fb968a' },
                { offset: 0.988, color: '#fd4f51' },
            ],
        },
    },
    {
        // The far side of the coil, which the rest of the body then lies over
        id: 'coil',
        pathData:
            'M63.68 79.92C63.3 82.6 59.78 84.34 57.46 85.16C53.06 86.74 48.65 87.7 43.98 88.03C42.24 88.16 39.63 88.67 37.96 88.06C37.25 87.81 36.82 87.11 36.17 86.76C34.29 87.08 32.23 87.82 30.42 88.46C29.41 88.82 28.32 89.27 27.27 89.16C25.06 84.96 29 80.06 32.14 77.59C32.93 76.97 33.82 76.59 34.7 76.15C35.76 75.62 36.96 74.85 38.12 74.61C44.64 73.21 51.34 74.88 57.46 77.06C58.8 77.54 60.12 78.15 61.44 78.71C62.27 79.07 63.07 79.28 63.68 79.92Z',
        gradient: {
            x1: 55.31,
            y1: 26.36,
            x2: 82.09,
            y2: 39.13,
            stops: [
                { offset: 0.013, color: '#aa87ac' },
                { offset: 0.813, color: '#fd968a' },
                { offset: 0.988, color: '#fe9084' },
            ],
        },
    },
    {
        // The head, the neck and the near side of the coil, in one stroke of the drawing
        id: 'body',
        pathData:
            'M75.76 43.38C75.33 44.6 75.84 45.98 76.11 47.22C76.69 49.93 77.17 52.84 77.37 55.61C78.04 65.07 78.93 74.95 76.92 84.34C76.81 84.86 77.39 85.39 77.18 85.89C75.97 88.85 75.69 92.43 73.41 94.87C72.44 95.91 71.11 96.27 69.83 96.73C67.62 97.52 65.38 98 63.09 98.49C59.12 99.34 54.98 99.55 50.95 99.84C49.3 99.95 47.64 99.73 46 99.83C45.21 99.88 44.61 100.74 43.89 100.75C41.96 100.79 40.26 99.27 38.26 99.27C34.97 99.27 29.71 99.1 27.71 96C26.93 94.78 26.74 93.29 26.74 91.88C26.74 90.86 26.86 89.85 27.11 88.88C27.92 88.36 28.95 88.25 29.88 87.91C31.88 87.2 34.25 86.23 36.36 86.08C37.06 86.41 37.57 87.17 38.27 87.42C39.02 87.68 40.17 87.47 40.96 87.47C43.32 87.47 45.67 87.26 48.01 86.92C50.56 86.56 53.05 85.91 55.47 85.05C57.22 84.43 59.11 83.98 60.61 82.8C61.66 81.98 62.6 80.95 63.09 79.74C63.22 79.42 63.68 79.38 63.92 79.2C64.24 78.95 64.43 78.29 64.61 77.94C65.6 75.95 66.06 73.69 66.52 71.54C68.2 63.69 67.55 55.43 66.99 47.5C66.81 45.04 66.44 42.55 66.09 40.11C65.68 37.2 65.29 34.49 66.99 31.86C67.49 31.08 68.13 30.35 68.84 29.74C73.16 26.04 79.06 27.78 83.34 30.54C85.53 31.94 88.14 34.68 87.53 37.55C86.81 40.88 82.38 41.91 79.5 42.32C78.16 42.51 76.75 42.35 75.76 43.38Z',
        gradient: {
            x1: -0.14,
            y1: 99.92,
            x2: -0.04,
            y2: 28.05,
            stops: [
                { offset: 0.013, color: '#5075d1' },
                { offset: 0.037, color: '#5176d1' },
                { offset: 0.512, color: '#fe9689' },
                { offset: 0.988, color: '#fe4f51' },
            ],
        },
    },
];

/**
 * One point of the line the snake of the show is coiled along, with the animal measured across it
 */
export type AiTaKrajtaMarkBodyPoint = AiTaKrajtaMarkPoint & {
    /**
     * Half of the thickness of the animal here, in units of the view box
     */
    readonly halfWidth: number;

    /**
     * What colour the cover paints the animal here
     */
    readonly color: string;
};

/**
 * The animal itself, from the tip of its nose to the tip of its tail
 *
 * Note: The shapes above are a picture of the snake and these are the snake. Measured off the middle of those same
 *       traced shapes, they let the game pick the drawing up and start moving it, instead of swapping it for a
 *       different, straight animal at the moment somebody clicks it.
 */
export const AI_TA_KRAJTA_MARK_BODY: readonly AiTaKrajtaMarkBodyPoint[] = [
    { x: 80.2, y: 35.9, halfWidth: 7.4, color: '#ff5c5a' },
    { x: 77.8, y: 35.4, halfWidth: 7.48, color: '#ff5b5a' },
    { x: 75.4, y: 35.4, halfWidth: 7.77, color: '#ff5c5a' },
    { x: 73.3, y: 36.5, halfWidth: 7.73, color: '#fe5e5d' },
    { x: 72.1, y: 38.5, halfWidth: 6.61, color: '#fe6261' },
    { x: 71.5, y: 40.8, halfWidth: 5.62, color: '#fe6864' },
    { x: 71.2, y: 43.2, halfWidth: 5.18, color: '#fe6c67' },
    { x: 71.3, y: 45.6, halfWidth: 5.12, color: '#fe716c' },
    { x: 71.6, y: 48, halfWidth: 5.12, color: '#fe7670' },
    { x: 72, y: 50.3, halfWidth: 5.12, color: '#ff7b73' },
    { x: 72.2, y: 52.7, halfWidth: 5.12, color: '#ff8079' },
    { x: 72.5, y: 55.1, halfWidth: 5.12, color: '#fe857c' },
    { x: 72.6, y: 57.5, halfWidth: 5.15, color: '#fe897f' },
    { x: 72.7, y: 59.9, halfWidth: 5.23, color: '#fe8f83' },
    { x: 72.7, y: 62.3, halfWidth: 5.34, color: '#fe9487' },
    { x: 72.8, y: 64.7, halfWidth: 5.5, color: '#f8968c' },
    { x: 72.7, y: 67.1, halfWidth: 5.62, color: '#eb9391' },
    { x: 72.5, y: 69.5, halfWidth: 5.73, color: '#df9196' },
    { x: 72.4, y: 71.9, halfWidth: 5.91, color: '#d48f9b' },
    { x: 72, y: 74.3, halfWidth: 6.11, color: '#c78ca0' },
    { x: 71.6, y: 76.6, halfWidth: 6.36, color: '#ba89a6' },
    { x: 71, y: 79, halfWidth: 6.67, color: '#ae87aa' },
    { x: 70.3, y: 81.3, halfWidth: 7.24, color: '#a385af' },
    { x: 69.7, y: 83.6, halfWidth: 7.87, color: '#9783b4' },
    { x: 68.9, y: 85.8, halfWidth: 8.95, color: '#8c81b9' },
    { x: 67.7, y: 87.9, halfWidth: 10.59, color: '#817fbf' },
    { x: 65.8, y: 89.4, halfWidth: 11.36, color: '#7a7dc0' },
    { x: 63.6, y: 90.2, halfWidth: 11.33, color: '#757cc3' },
    { x: 61.3, y: 90.9, halfWidth: 10.87, color: '#727cc4' },
    { x: 59, y: 91.6, halfWidth: 10.15, color: '#6e7bc5' },
    { x: 56.7, y: 92.1, halfWidth: 9.64, color: '#6b7ac7' },
    { x: 54.3, y: 92.6, halfWidth: 9.23, color: '#697ac8' },
    { x: 51.9, y: 93, halfWidth: 8.88, color: '#677ac9' },
    { x: 49.6, y: 93.3, halfWidth: 8.62, color: '#6579c9' },
    { x: 47.2, y: 93.5, halfWidth: 8.23, color: '#6479ca' },
    { x: 44.8, y: 93.8, halfWidth: 7.64, color: '#6379ca' },
    { x: 42.4, y: 94, halfWidth: 6.89, color: '#6178cb' },
    { x: 40, y: 93.8, halfWidth: 6.57, color: '#6379ca' },
    { x: 37.6, y: 93.5, halfWidth: 6.57, color: '#6479ca' },
    { x: 35.3, y: 93.1, halfWidth: 6.47, color: '#677ac9' },
    { x: 32.9, y: 93, halfWidth: 5.9, color: '#677ac9' },
    { x: 30.5, y: 93, halfWidth: 4.54, color: '#677ac9' },
    { x: 28.1, y: 93, halfWidth: 4.03, color: '#677ac8' },
    { x: 28, y: 90.7, halfWidth: 4.03, color: '#727cc3' },
    { x: 28.4, y: 88.4, halfWidth: 4.03, color: '#aa86ab' },
    { x: 29.1, y: 86.1, halfWidth: 4.03, color: '#b087a9' },
    { x: 30.7, y: 84.3, halfWidth: 4.1, color: '#b288a9' },
    { x: 32.7, y: 83, halfWidth: 4.57, color: '#b689a7' },
    { x: 34.8, y: 81.8, halfWidth: 5.29, color: '#bc8aa5' },
    { x: 37.1, y: 81, halfWidth: 6.11, color: '#c18ba3' },
    { x: 39.5, y: 80.9, halfWidth: 6.92, color: '#c88ca0' },
    { x: 41.9, y: 80.9, halfWidth: 7.17, color: '#d08e9c' },
    { x: 44.3, y: 80.8, halfWidth: 7.14, color: '#d78f9a' },
    { x: 46.6, y: 80.8, halfWidth: 6.94, color: '#df9197' },
    { x: 49, y: 80.9, halfWidth: 6.52, color: '#e69292' },
    { x: 51.4, y: 80.7, halfWidth: 6.02, color: '#ee9490' },
    { x: 53.8, y: 80.7, halfWidth: 5.55, color: '#f6958d' },
    { x: 56.2, y: 80.8, halfWidth: 5.38, color: '#fd9689' },
    { x: 58.6, y: 80.7, halfWidth: 5.38, color: '#fe9487' },
    { x: 61, y: 80.4, halfWidth: 5.38, color: '#ff9085' },
    { x: 63.3, y: 80.5, halfWidth: 5.38, color: '#cd899a' },
    { x: 65, y: 82.2, halfWidth: 5.39, color: '#9f84b1' },
    { x: 66.6, y: 84, halfWidth: 6.34, color: '#9583b6' },
    { x: 68.2, y: 85.8, halfWidth: 8.32, color: '#8c81b9' },
    { x: 69.9, y: 87.6, halfWidth: 8.95, color: '#837fbc' },
    { x: 71.5, y: 89.4, halfWidth: 8.87, color: '#7a7ec0' },
    { x: 73.1, y: 91.1, halfWidth: 8.87, color: '#707cc4' },
    { x: 74.7, y: 92.9, halfWidth: 8.3, color: '#e6767e' },
    { x: 76.3, y: 94.7, halfWidth: 7.06, color: '#fe716d' },
    { x: 78.3, y: 95.7, halfWidth: 6.23, color: '#fe6e69' },
    { x: 80.3, y: 94.4, halfWidth: 5.63, color: '#fd6c67' },
    { x: 82.7, y: 94.2, halfWidth: 4.76, color: '#fe6965' },
    { x: 85, y: 94.6, halfWidth: 3.81, color: '#fe6563' },
    { x: 87.4, y: 95.2, halfWidth: 2.98, color: '#fe6260' },
    { x: 89.7, y: 95.6, halfWidth: 2.25, color: '#fe5e5c' },
    { x: 92.1, y: 96.2, halfWidth: 1.65, color: '#fe5b59' },
    { x: 94.4, y: 96.6, halfWidth: 1.23, color: '#fe5757' },
    { x: 96.8, y: 97.1, halfWidth: 0.96, color: '#fe5355' },
    { x: 99.1, y: 97.5, halfWidth: 0.72, color: '#fe5051' },
    { x: 100.3, y: 97.3, halfWidth: 0.6, color: '#f94e52' },
];

/**
 * Where the drawn animal really sits inside its view box, measured off the traced shapes
 *
 * Note: The snake is drawn a little above and to the right of the middle of its box, which nobody notices beside a
 *       heading but which is plain to see once the mark is the only thing inside an icon. An icon therefore moves it
 *       into the middle of its tile.
 */
export const AI_TA_KRAJTA_MARK_BOUNDS = {
    left: 26.6,
    top: 27.6,
    right: 101,
    bottom: 101.3,
} as const;

/**
 * The shadow the animal casts wherever it is drawn as large as it is in the terrarium
 *
 * Note: The still logo and the canvas of the game both wear it. A shadow which appeared or vanished at the moment one
 *       is handed over to the other would be the thing left to give that handover away.
 */
export const AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME = 'drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]';

/**
 * Places a point of the vector artwork into a rendered frame
 */
export function placeAiTaKrajtaMarkPointInFrame(
    point: AiTaKrajtaMarkPoint,
    frame: AiTaKrajtaMarkFrame,
): AiTaKrajtaMarkPoint {
    return {
        x: frame.left + (point.x / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE) * frame.width,
        y: frame.top + (point.y / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE) * frame.height,
    };
}

/**
 * How many pixels of a rendered frame one unit of the artwork is worth
 */
export function getAiTaKrajtaMarkFrameScale(frame: AiTaKrajtaMarkFrame): number {
    return frame.width / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE;
}

/**
 * Id the gradient of one drawn part is defined under inside a document which draws the mark
 *
 * Note: A page can hold several marks at once, so the document hands in something unique of its own to build on.
 */
export function createAiTaKrajtaMarkGradientId(documentId: string, shapeId: string): string {
    return `aiTaKrajtaMark-${documentId}-${shapeId}`;
}
