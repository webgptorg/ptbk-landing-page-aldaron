import type { RecordingAlertSeverity } from './recordingStudioAlerts';

/**
 * What became of the audible half of one alert
 *
 * Note: `played` means the browser rendered the signal into its sound output. Whether anybody heard it is decided by
 *       the volume of the computer, the output device and a muted site, none of which a page is told about.
 */
export type RecordingAlertSoundStatus = 'disabled' | 'unsupported' | 'pending' | 'played' | 'blocked';

type RecordingAlertTone = {
    readonly frequencyHertz: number;
    readonly startSeconds: number;
    readonly durationSeconds: number;
};

/**
 * Distinguishable patterns, synthesized rather than downloaded
 *
 * Note: The studio records for hours without a network, and an alert which needs a file to arrive first is an alert
 *       which is missing exactly when the disk or the network is the thing which broke.
 *
 * Note: A test rises where the two alarms fall or repeat, and it is exactly as loud as they are, so it proves the
 *       volume of the real thing without ever sounding like it.
 */
const ALERT_TONE_PATTERNS: Record<RecordingAlertSeverity, readonly RecordingAlertTone[]> = {
    critical: [
        { frequencyHertz: 880, startSeconds: 0, durationSeconds: 0.18 },
        { frequencyHertz: 622, startSeconds: 0.22, durationSeconds: 0.18 },
        { frequencyHertz: 880, startSeconds: 0.44, durationSeconds: 0.18 },
        { frequencyHertz: 622, startSeconds: 0.66, durationSeconds: 0.34 },
    ],
    warning: [
        { frequencyHertz: 784, startSeconds: 0, durationSeconds: 0.14 },
        { frequencyHertz: 988, startSeconds: 0.18, durationSeconds: 0.22 },
    ],
    test: [
        { frequencyHertz: 523, startSeconds: 0, durationSeconds: 0.16 },
        { frequencyHertz: 659, startSeconds: 0.2, durationSeconds: 0.16 },
        { frequencyHertz: 784, startSeconds: 0.4, durationSeconds: 0.3 },
    ],
};

const ALERT_PEAK_GAIN = 0.22;
const ALERT_FADE_SECONDS = 0.02;

/**
 * How long a sound output which does not start is waited for
 *
 * Note: A browser which holds the output back until the next click never answers at all, and an alert which waits
 *       for that answer would report its sound as still playing for ever.
 */
const ALERT_SOUND_RESUME_TIMEOUT_MILLISECONDS = 1_000;

/** How long the sound output stays open after its last use before it is put to rest. */
const ALERT_SOUND_IDLE_MILLISECONDS = 30_000;

/**
 * The one sound output of the alert channel, kept for as long as the page lives
 *
 * Note: A browser holds the sound of a page back until the administrator has clicked something. Chrome is content
 *       with any earlier click on the page and then lets an output be opened or woken at any time, even in a hidden
 *       tab; a stricter browser wants the output itself to have been opened during a click. A failure is never
 *       announced during a click, so the output opened during one is kept and woken up again, rather than a new one
 *       being opened at the one moment a stricter browser would refuse it.
 */
let alertSoundContext: AudioContext | null = null;
let alertSoundUseCount = 0;
let alertSoundIdleTimer: ReturnType<typeof setTimeout> | null = null;

function getAudioContextConstructor(): typeof AudioContext | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }
    return window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

export function isRecordingAlertSoundSupported(): boolean {
    return getAudioContextConstructor() !== undefined;
}

function openAlertSoundContext(): AudioContext | null {
    const AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor) {
        return null;
    }

    if (alertSoundContext === null || alertSoundContext.state === 'closed') {
        try {
            alertSoundContext = new AudioContextConstructor();
        } catch {
            alertSoundContext = null;
        }
    }
    return alertSoundContext;
}

function wakeAlertSoundContext(context: AudioContext): Promise<void> {
    try {
        return context.resume().catch(() => undefined);
    } catch {
        return Promise.resolve();
    }
}

function restAlertSoundContext(): void {
    try {
        void alertSoundContext?.suspend().catch(() => undefined);
    } catch {
        // An output which cannot be put to rest stays open, which costs a little power and no alert.
    }
}

/**
 * Keeps the sound output awake until the returned function is called
 *
 * Note: Called while a click is still being handled, this is what opens the output at all. Whoever raises an alert
 *       later — a countdown five seconds after the click, a camera lost two hours after it — finds it open.
 *
 * Note: An unused output is put to rest after a while rather than at once, so that it does not hold the sound device
 *       of the computer for the whole day, and so that two alerts in a row do not close and reopen it between them.
 *
 * @returns releases this one hold; calling it again does nothing
 */
export function retainRecordingAlertSound(): () => void {
    const context = openAlertSoundContext();
    if (!context) {
        return () => undefined;
    }

    if (alertSoundIdleTimer !== null) {
        clearTimeout(alertSoundIdleTimer);
        alertSoundIdleTimer = null;
    }
    alertSoundUseCount += 1;
    if (context.state !== 'running') {
        void wakeAlertSoundContext(context);
    }

    let isReleased = false;
    return () => {
        if (isReleased) {
            return;
        }
        isReleased = true;
        alertSoundUseCount -= 1;
        if (alertSoundUseCount > 0) {
            return;
        }
        alertSoundIdleTimer = setTimeout(() => {
            alertSoundIdleTimer = null;
            if (alertSoundUseCount === 0) restAlertSoundContext();
        }, ALERT_SOUND_IDLE_MILLISECONDS);
    };
}

/**
 * Opens the sound output during a click of the administrator, for an alert which may come at any time afterwards
 *
 * Note: Starting a recording is such a click, and it is the last one before hours in another application.
 */
export function prepareRecordingAlertSound(): void {
    retainRecordingAlertSound()();
}

async function isAlertSoundContextAwake(context: AudioContext): Promise<boolean> {
    const isRunning = () => context.state === 'running';
    if (isRunning()) {
        return true;
    }

    await Promise.race([
        wakeAlertSoundContext(context),
        new Promise((resolve) => setTimeout(resolve, ALERT_SOUND_RESUME_TIMEOUT_MILLISECONDS)),
    ]);
    return isRunning();
}

/**
 * Plays the audible half of one alert
 *
 * Note: A browser which refuses to make a sound must never take the failure itself down with it, so every refusal is
 *       reported as a channel which stayed silent and nothing more.
 *
 * @param severity which of the patterns to play
 * @returns whether the browser rendered the sound, held it back, or cannot make one at all
 */
export async function playRecordingAlertSound(severity: RecordingAlertSeverity): Promise<'played' | 'blocked' | 'unsupported'> {
    const context = openAlertSoundContext();
    if (!context) {
        return 'unsupported';
    }

    const release = retainRecordingAlertSound();
    try {
        if (!(await isAlertSoundContextAwake(context))) {
            return 'blocked';
        }

        const tones = ALERT_TONE_PATTERNS[severity];
        const startedAt = context.currentTime;
        for (const tone of tones) {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const toneStartedAt = startedAt + tone.startSeconds;
            const toneEndedAt = toneStartedAt + tone.durationSeconds;
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(tone.frequencyHertz, toneStartedAt);
            // A square-edged tone clicks on every device; the short ramps are what make it a signal instead of a pop.
            gain.gain.setValueAtTime(0, toneStartedAt);
            gain.gain.linearRampToValueAtTime(ALERT_PEAK_GAIN, toneStartedAt + ALERT_FADE_SECONDS);
            gain.gain.setValueAtTime(ALERT_PEAK_GAIN, toneEndedAt - ALERT_FADE_SECONDS);
            gain.gain.linearRampToValueAtTime(0, toneEndedAt);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(toneStartedAt);
            oscillator.stop(toneEndedAt);
        }

        const lastTone = tones[tones.length - 1];
        await new Promise((resolve) => setTimeout(resolve, (lastTone.startSeconds + lastTone.durationSeconds) * 1000));
        return 'played';
    } catch {
        return 'blocked';
    } finally {
        release();
    }
}
