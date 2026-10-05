/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ResumeBehavior = 'starts' | 'never-answers' | 'refuses';

/**
 * Stands in for the sound output of a browser
 *
 * Note: It models the one rule the alert sound depends on — an output which is not running has to be resumed, and a
 *       browser may answer that at once, refuse it, or never answer at all. Nothing here makes or proves a sound.
 */
class FakeAudioContext {
    public static readonly instances: FakeAudioContext[] = [];
    public static resumeBehavior: ResumeBehavior = 'starts';
    public state: AudioContextState = 'suspended';
    public readonly currentTime = 10;
    public readonly destination = {};
    public readonly frequencies: number[] = [];
    public readonly peakGains: number[] = [];
    public readonly resume = vi.fn((): Promise<void> => {
        if (FakeAudioContext.resumeBehavior === 'never-answers') return new Promise(() => undefined);
        if (FakeAudioContext.resumeBehavior === 'refuses') return Promise.reject(new Error('The AudioContext was not allowed to start.'));
        this.state = 'running';
        return Promise.resolve();
    });
    public readonly suspend = vi.fn(async () => { this.state = 'suspended'; });

    public constructor() {
        FakeAudioContext.instances.push(this);
    }

    public createOscillator() {
        return {
            type: 'sine', connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
            frequency: { setValueAtTime: (frequencyHertz: number) => { this.frequencies.push(frequencyHertz); } },
        };
    }

    public createGain() {
        return {
            connect: vi.fn(),
            gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: (gain: number) => { if (gain > 0) this.peakGains.push(gain); } },
        };
    }
}

const IDLE_MILLISECONDS = 30_000;

async function loadSound() {
    return import('./recordingStudioAlertSound');
}

beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    FakeAudioContext.instances.length = 0;
    FakeAudioContext.resumeBehavior = 'starts';
    vi.stubGlobal('AudioContext', FakeAudioContext);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('the sound output of the alert channel', () => {
    it('is opened and resumed inside the very call a click made', async () => {
        const { prepareRecordingAlertSound } = await loadSound();

        prepareRecordingAlertSound();

        // No await and no timer stand between the click and the request a browser only honours during one.
        expect(FakeAudioContext.instances).toHaveLength(1);
        expect(FakeAudioContext.instances[0].resume).toHaveBeenCalledTimes(1);
    });

    it('is one output for the test and for every failure after it, never a new one opened by a timer', async () => {
        const { prepareRecordingAlertSound, playRecordingAlertSound, retainRecordingAlertSound } = await loadSound();

        prepareRecordingAlertSound();
        const release = retainRecordingAlertSound();
        const firstPlayback = playRecordingAlertSound('test');
        await vi.advanceTimersByTimeAsync(5_000);
        const secondPlayback = playRecordingAlertSound('critical');
        await vi.advanceTimersByTimeAsync(5_000);
        release();

        expect(await firstPlayback).toBe('played');
        expect(await secondPlayback).toBe('played');
        expect(FakeAudioContext.instances).toHaveLength(1);
    });

    it('is put to rest some time after its last use and woken again by the next alert', async () => {
        const { playRecordingAlertSound } = await loadSound();

        const playback = playRecordingAlertSound('warning');
        await vi.advanceTimersByTimeAsync(1_000);
        expect(await playback).toBe('played');
        const [context] = FakeAudioContext.instances;

        await vi.advanceTimersByTimeAsync(IDLE_MILLISECONDS - 1_000);
        expect(context.suspend).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(2_000);
        expect(context.suspend).toHaveBeenCalledTimes(1);
        expect(context.state).toBe('suspended');

        const laterPlayback = playRecordingAlertSound('critical');
        await vi.advanceTimersByTimeAsync(2_000);
        expect(await laterPlayback).toBe('played');
        expect(FakeAudioContext.instances).toHaveLength(1);
        expect(context.state).toBe('running');
    });

    it('stays awake for as long as a countdown holds it, however long that is', async () => {
        const { retainRecordingAlertSound } = await loadSound();

        const release = retainRecordingAlertSound();
        const [context] = FakeAudioContext.instances;
        await vi.advanceTimersByTimeAsync(IDLE_MILLISECONDS * 4);
        expect(context.suspend).not.toHaveBeenCalled();

        release();
        // Releasing the same hold twice must not put the output to rest under somebody else who still holds it.
        release();
        const otherRelease = retainRecordingAlertSound();
        await vi.advanceTimersByTimeAsync(IDLE_MILLISECONDS * 2);
        expect(context.suspend).not.toHaveBeenCalled();

        otherRelease();
        await vi.advanceTimersByTimeAsync(IDLE_MILLISECONDS + 1);
        expect(context.suspend).toHaveBeenCalledTimes(1);
    });

    it('replaces an output the browser has closed', async () => {
        const { playRecordingAlertSound } = await loadSound();

        const playback = playRecordingAlertSound('warning');
        await vi.advanceTimersByTimeAsync(1_000);
        await playback;
        FakeAudioContext.instances[0].state = 'closed';
        const laterPlayback = playRecordingAlertSound('warning');
        await vi.advanceTimersByTimeAsync(1_000);

        expect(await laterPlayback).toBe('played');
        expect(FakeAudioContext.instances).toHaveLength(2);
    });
});

describe('the audible half of one alert', () => {
    it('sounds a test differently from both alarms and exactly as loud', async () => {
        const melodies: Record<string, number[]> = {};
        const loudness: Record<string, number[]> = {};

        for (const severity of ['critical', 'warning', 'test'] as const) {
            // A fresh output for each pattern, so that what one of them played is not read as another's.
            vi.resetModules();
            FakeAudioContext.instances.length = 0;
            const { playRecordingAlertSound } = await loadSound();
            const playback = playRecordingAlertSound(severity);
            await vi.advanceTimersByTimeAsync(2_000);
            expect(await playback).toBe('played');
            melodies[severity] = FakeAudioContext.instances[0].frequencies;
            loudness[severity] = Array.from(new Set(FakeAudioContext.instances[0].peakGains));
        }

        expect(melodies.test).not.toEqual(melodies.critical);
        expect(melodies.test).not.toEqual(melodies.warning);
        // A rehearsal rises; neither alarm does, so the ear tells them apart without a word being read.
        expect(melodies.test).toEqual([...melodies.test].sort((first, second) => first - second));
        expect(melodies.critical).not.toEqual([...melodies.critical].sort((first, second) => first - second));
        expect(loudness.test).toEqual(loudness.critical);
        expect(loudness.test).toEqual(loudness.warning);
    });

    it('reports a held-back sound as blocked after a bounded wait instead of waiting for ever', async () => {
        FakeAudioContext.resumeBehavior = 'never-answers';
        const { playRecordingAlertSound } = await loadSound();
        const settled = vi.fn();

        const playback = playRecordingAlertSound('critical').then(settled);
        await vi.advanceTimersByTimeAsync(999);
        expect(settled).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);
        await playback;

        expect(settled).toHaveBeenCalledWith('blocked');
        expect(FakeAudioContext.instances[0].frequencies).toEqual([]);
    });

    it('reports a refused sound as blocked and nothing more', async () => {
        FakeAudioContext.resumeBehavior = 'refuses';
        const { playRecordingAlertSound } = await loadSound();

        expect(await playRecordingAlertSound('warning')).toBe('blocked');
    });

    it('says so in a browser which cannot make a sound at all', async () => {
        vi.stubGlobal('AudioContext', undefined);
        const { isRecordingAlertSoundSupported, playRecordingAlertSound, prepareRecordingAlertSound, retainRecordingAlertSound } = await loadSound();

        expect(isRecordingAlertSoundSupported()).toBe(false);
        expect(() => { prepareRecordingAlertSound(); retainRecordingAlertSound()(); }).not.toThrow();
        expect(await playRecordingAlertSound('critical')).toBe('unsupported');
    });

    it('never lets an output which cannot be opened take the alert down with it', async () => {
        vi.stubGlobal('AudioContext', class { public constructor() { throw new Error('Too many sound outputs'); } });
        const { playRecordingAlertSound, prepareRecordingAlertSound } = await loadSound();

        expect(() => prepareRecordingAlertSound()).not.toThrow();
        expect(await playRecordingAlertSound('critical')).toBe('unsupported');
    });
});
