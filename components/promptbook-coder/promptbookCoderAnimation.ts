export const PROMPTBOOK_CODER_URL = 'https://coder.ptbk.io/';

/** Every part occupies one terminal cell, including each eye and the coding slash. */
export type PromptbookCoderPose = {
    readonly leftTentacle: string;
    readonly headOpening: string;
    readonly leftEye: string;
    readonly rightEye: string;
    readonly code: string;
    readonly headClosing: string;
    readonly rightTentacle: string;
};

export const DEFAULT_PROMPTBOOK_CODER_POSE: PromptbookCoderPose = {
    leftTentacle: '~',
    headOpening: '<',
    leftEye: '@',
    rightEye: '@',
    code: '/',
    headClosing: '>',
    rightTentacle: '-',
};

export const PROMPTBOOK_CODER_TICK_IN_MILLISECONDS = 200;
export const PROMPTBOOK_CODER_COMMAND_FRAMES = ['$ ', '$ ', '$ p', '$ pt', '$ ptb', '$ ptbk', '$ ptbk', '$ ptbk'];

type PromptbookCoderScene = {
    readonly mood: string;
    readonly frames: readonly Partial<PromptbookCoderPose>[];
};

const SNAKE_SCENE: PromptbookCoderScene = {
    mood: 'snake',
    frames: [
        { leftEye: 'o', rightEye: 'o', rightTentacle: 's' },
        { leftEye: '◑', rightEye: '◑', rightTentacle: 'S' },
        { leftTentacle: '^', rightTentacle: '∿' },
        { leftEye: 'o', rightEye: 'O', rightTentacle: 's' },
        { leftEye: '^', rightEye: '^', rightTentacle: '~' },
    ],
};

const CODER_SCENES: readonly PromptbookCoderScene[] = [
    {
        mood: 'coding',
        frames: [
            { leftTentacle: '-', leftEye: 'o', rightEye: 'o', rightTentacle: '_' },
            { leftTentacle: '=', headOpening: '[', headClosing: ']', rightTentacle: '|' },
            { leftTentacle: '~', leftEye: '0', rightEye: '0', code: '\\', rightTentacle: '_' },
            { leftTentacle: '=', leftEye: '+', rightEye: '+', rightTentacle: '|' },
            { leftEye: '^', rightEye: '^', rightTentacle: '✓' },
        ],
    },
    SNAKE_SCENE,
    {
        mood: 'painting',
        frames: [
            { leftEye: 'o', rightEye: 'o', rightTentacle: '·' },
            { code: '\\', rightTentacle: '*' },
            { leftTentacle: '—', leftEye: '+', rightEye: '+', rightTentacle: '✿' },
            { headOpening: '(', headClosing: ')', rightTentacle: '♥' },
            { leftEye: '^', rightEye: '^', rightTentacle: '☺' },
        ],
    },
];

const IDLE_TICKS = 22;
const SCENE_FRAME_TICKS = 2;
const SCENE_TICKS = 32;

export type PromptbookCoderFrame = {
    readonly pose: PromptbookCoderPose;
    readonly mood: string;
};

/** Brief vignettes fit inside the same seven cells as the resting octopus. */
export function getPromptbookCoderFrame(tick: number, isPlayingWithSnake: boolean): PromptbookCoderFrame {
    const sceneTick = tick % SCENE_TICKS;
    const scene = isPlayingWithSnake
        ? SNAKE_SCENE
        : CODER_SCENES[Math.floor(tick / SCENE_TICKS) % CODER_SCENES.length];

    if (!isPlayingWithSnake && sceneTick < IDLE_TICKS) {
        const isBlinking = sceneTick === 16;
        return {
            mood: 'idle',
            pose: isBlinking
                ? { ...DEFAULT_PROMPTBOOK_CODER_POSE, leftEye: '.', rightEye: '.' }
                : DEFAULT_PROMPTBOOK_CODER_POSE,
        };
    }

    const frameIndex = Math.floor((isPlayingWithSnake ? tick : sceneTick - IDLE_TICKS) / SCENE_FRAME_TICKS);
    return {
        mood: scene.mood,
        pose: { ...DEFAULT_PROMPTBOOK_CODER_POSE, ...scene.frames[frameIndex % scene.frames.length] },
    };
}
