import { readBrowserLocalStorageItem, writeBrowserLocalStorageItem } from '@/lib/browser/browserStorage';

/**
 * What one failure did to the take which was running, if any
 *
 * Note: This is the only thing which decides how loudly a failure is announced, so a source which was taken out of a
 *       running take is never described the same way as a take which ended. `recording-kept` is the quietest of them:
 *       nothing was lost and nothing stopped, but what was saved needs the administrator to do something to it.
 */
export type RecordingAlertImpact = 'test' | 'recording-continues' | 'recording-kept' | 'recording-stopped' | 'no-recording';

/**
 * How one alert is painted, sounded and worded. It is derived from the impact, never written by hand.
 *
 * Note: `test` is a level of its own rather than a quiet `critical`, so that a rehearsal heard from the next room or
 *       read in a notification can never be mistaken for a lost source or a failed disk.
 */
export type RecordingAlertSeverity = 'critical' | 'warning' | 'test';

/** One failure of the recording studio, as every channel which announces it receives it. */
export type RecordingFailure = {
    readonly impact: RecordingAlertImpact;
    readonly message: string;
    readonly sourceId?: string | null;
    readonly sourceLabel?: string | null;
};

/** One announced failure, with the identity and the title every channel shares. */
export type RecordingAlert = {
    readonly id: string;
    readonly impact: RecordingAlertImpact;
    readonly severity: RecordingAlertSeverity;
    readonly title: string;
    readonly message: string;
    readonly sourceId: string | null;
    readonly sourceLabel: string | null;
    readonly occurredAt: number;
    /** Whether its notification waits on the screen until it is dismissed. See `isRecordingAlertKeptOnScreen`. */
    readonly isKeptOnScreen: boolean;
};

/** Older failures stay readable after the fact without letting a flapping device grow without a bound. */
export const RECORDING_ALERT_HISTORY_LIMIT = 20;

/** A rehearsal which arrived this much later than planned says so, because that is what a throttled tab does to it. */
const RECORDING_ALERT_TEST_NOTICEABLE_DELAY_MILLISECONDS = 2_000;

export function getRecordingAlertSeverity(impact: RecordingAlertImpact): RecordingAlertSeverity {
    if (impact === 'test') {
        return 'test';
    }

    return impact === 'recording-stopped' ? 'critical' : 'warning';
}

/**
 * Whether the notification of one alert stays on the screen until the administrator dismisses it
 *
 * Note: A stopped recording waits for the administrator, while a take which is still running must not have the very
 *       screen it is recording buried under a notification. A test obeys the same rule from what the studio is doing
 *       when it fires, and that is not a detail: a browser hands the two forms to the system separately — Chrome on
 *       macOS posts the waiting one as `Google Chrome Helper (Alerts)` and the passing one as `Google Chrome`, each
 *       with its own switch in the system settings — so a test before a recording rehearses the form a stopped
 *       recording arrives in, and a test during one rehearses the form a lost source arrives in.
 *
 * @param impact what the alert is about
 * @param isTakeRunning whether the studio is recording at the moment the alert is raised
 */
export function isRecordingAlertKeptOnScreen(impact: RecordingAlertImpact, isTakeRunning: boolean): boolean {
    if (impact === 'test') {
        return !isTakeRunning;
    }

    return impact === 'recording-stopped';
}

/**
 * Names one failure in the few words a notification, a tab title or a list row can show
 *
 * Note: Everything the administrator needs in order to act stays in the message; this only says what is broken and
 *       whether the recording is still running, because that is the one thing which decides whether to run back.
 */
export function describeRecordingAlertTitle(failure: RecordingFailure): string {
    if (failure.impact === 'test') {
        // A notification is often read by its first words alone, so those words are the ones which say it is a test.
        return 'Zkouška výstrahy studia · nic se nepokazilo';
    }

    const sourceName = failure.sourceLabel ? `Zdroj „${failure.sourceLabel}“` : 'Nahrávací studio';

    if (failure.impact === 'recording-continues') {
        return `${sourceName} selhal · záznam pokračuje`;
    }

    if (failure.impact === 'recording-kept') {
        return failure.sourceLabel ? `${sourceName} je uložený · potřebuje opravu` : 'Záznam je uložený · potřebuje opravu';
    }

    if (failure.impact === 'recording-stopped') {
        return failure.sourceLabel ? `${sourceName} selhal · záznam se zastavil` : 'Nahrávání se zastavilo';
    }

    return failure.sourceLabel ? `${sourceName} selhal` : 'Chyba nahrávacího studia';
}

export function createRecordingAlert(failure: RecordingFailure, occurredAt = Date.now(), isTakeRunning = false): RecordingAlert {
    return {
        id: crypto.randomUUID(),
        impact: failure.impact,
        severity: getRecordingAlertSeverity(failure.impact),
        title: describeRecordingAlertTitle(failure),
        message: failure.message,
        sourceId: failure.sourceId ?? null,
        sourceLabel: failure.sourceLabel ?? null,
        occurredAt,
        isKeptOnScreen: isRecordingAlertKeptOnScreen(failure.impact, isTakeRunning),
    };
}

/**
 * The test alert takes the very path a real failure takes, so a silent channel is found before it is needed
 *
 * Note: It promises nothing about what the administrator saw or heard. Whether a notification appears is decided by
 *       the browser and then by the system, and neither tells the page; the panel says so beside the alert.
 *
 * @param delayMilliseconds how much later than planned the countdown ran out
 */
export function createRecordingTestFailure(delayMilliseconds = 0): RecordingFailure {
    const delayNote = delayMilliseconds >= RECORDING_ALERT_TEST_NOTICEABLE_DELAY_MILLISECONDS
        ? ` Odpočet doběhl o ${Math.round(delayMilliseconds / 1000)} s později, než měl: prohlížeč nebo systém tuto kartu na pozadí zpomalil.`
        : '';

    return {
        impact: 'test',
        message: `Toto je jen zkouška: nic se nepokazilo, žádný záznam se nezastavil a žádný zdroj se neodpojil. Skutečná výstraha přijde stejnou cestou.${delayNote}`,
    };
}

/** Keeps the newest entries of any alert history, whatever each of them carries beside its alert. */
export function appendRecordingAlert<AlertEntry>(alerts: readonly AlertEntry[], alert: AlertEntry): readonly AlertEntry[] {
    return [alert, ...alerts].slice(0, RECORDING_ALERT_HISTORY_LIMIT);
}

/** Browser-local announcement settings. They contain no failure, no media and no permission grant. */
export type RecordingAlertPreferences = {
    readonly isSoundEnabled: boolean;
    readonly isNotificationEnabled: boolean;
};

const ALERT_PREFERENCES_KEY = 'promptbook-recording-studio-alerts-v1';

/** Both channels are on by default: an administrator who never opens these settings is still told about a failure. */
export const DEFAULT_ALERT_PREFERENCES: RecordingAlertPreferences = { isSoundEnabled: true, isNotificationEnabled: true };

export function loadRecordingAlertPreferences(): RecordingAlertPreferences {
    try {
        const stored = readBrowserLocalStorageItem(ALERT_PREFERENCES_KEY);
        if (stored === null) {
            return DEFAULT_ALERT_PREFERENCES;
        }
        const value = JSON.parse(stored) as Partial<RecordingAlertPreferences>;
        return {
            isSoundEnabled: typeof value.isSoundEnabled === 'boolean' ? value.isSoundEnabled : DEFAULT_ALERT_PREFERENCES.isSoundEnabled,
            isNotificationEnabled: typeof value.isNotificationEnabled === 'boolean' ? value.isNotificationEnabled : DEFAULT_ALERT_PREFERENCES.isNotificationEnabled,
        };
    } catch {
        return DEFAULT_ALERT_PREFERENCES;
    }
}

export function saveRecordingAlertPreferences(preferences: RecordingAlertPreferences): void {
    writeBrowserLocalStorageItem(ALERT_PREFERENCES_KEY, JSON.stringify(preferences));
}
