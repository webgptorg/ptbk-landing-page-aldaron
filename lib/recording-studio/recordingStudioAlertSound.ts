import type { RecordingAlertSeverity } from './recordingStudioAlerts';

type RecordingAlertTone = {
    readonly frequencyHertz: number;
    readonly startSeconds: number;
    readonly durationSeconds: number;
};

/**
 * Two distinguishable patterns, synthesized rather than downloaded
 *
 * Note: The studio records for hours without a network, and an alert which needs a file to arrive first is an alert
 *       which is missing exactly when the disk or the network is the thing which broke.
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
};

const ALERT_PEAK_GAIN = 0.22;
const ALERT_FADE_SECONDS = 0.02;

function getAudioContextConstructor(): typeof AudioContext | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }
    return window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

export function isRecordingAlertSoundSupported(): boolean {
    return getAudioContextConstructor() !== undefined;
}

/**
 * Plays the audible half of one alert
 *
 * Note: A browser which refuses to make a sound must never take the failure itself down with it, so every refusal is
 *       reported as a channel which stayed silent and nothing more.
 *
 * @param severity which of the two patterns to play
 * @returns whether the sound was actually played
 */
export async function playRecordingAlertSound(severity: RecordingAlertSeverity): Promise<boolean> {
    const AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor) {
        return false;
    }

    let context: AudioContext | undefined;
    try {
        context = new AudioContextConstructor();
        if (context.state === 'suspended') {
            await context.resume();
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
        return true;
    } catch {
        return false;
    } finally {
        void context?.close().catch(() => undefined);
    }
}
