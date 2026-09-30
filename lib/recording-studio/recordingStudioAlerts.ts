import { readBrowserLocalStorageItem, writeBrowserLocalStorageItem } from '@/lib/browser/browserStorage';

/**
 * What one failure did to the take which was running, if any
 *
 * Note: This is the only thing which decides how loudly a failure is announced, so a source which was taken out of a
 *       running take is never described the same way as a take which ended.
 */
export type RecordingAlertImpact = 'test' | 'recording-continues' | 'recording-stopped' | 'no-recording';

/** How urgent the announcement of one failure is. It is derived from the impact, never written by hand. */
export type RecordingAlertSeverity = 'critical' | 'warning';

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
};

/** Older failures stay readable after the fact without letting a flapping device grow without a bound. */
export const RECORDING_ALERT_HISTORY_LIMIT = 20;

export function getRecordingAlertSeverity(impact: RecordingAlertImpact): RecordingAlertSeverity {
    return impact === 'recording-continues' || impact === 'no-recording' ? 'warning' : 'critical';
}

/**
 * Names one failure in the few words a notification, a tab title or a list row can show
 *
 * Note: Everything the administrator needs in order to act stays in the message; this only says what is broken and
 *       whether the recording is still running, because that is the one thing which decides whether to run back.
 */
export function describeRecordingAlertTitle(failure: RecordingFailure): string {
    if (failure.impact === 'test') {
        return 'Zkušební výstraha nahrávacího studia';
    }

    const sourceName = failure.sourceLabel ? `Zdroj „${failure.sourceLabel}“` : 'Nahrávací studio';

    if (failure.impact === 'recording-continues') {
        return `${sourceName} selhal · záznam pokračuje`;
    }

    if (failure.impact === 'recording-stopped') {
        return failure.sourceLabel ? `${sourceName} selhal · záznam se zastavil` : 'Nahrávání se zastavilo';
    }

    return failure.sourceLabel ? `${sourceName} selhal` : 'Chyba nahrávacího studia';
}

export function createRecordingAlert(failure: RecordingFailure, occurredAt = Date.now()): RecordingAlert {
    return {
        id: crypto.randomUUID(),
        impact: failure.impact,
        severity: getRecordingAlertSeverity(failure.impact),
        title: describeRecordingAlertTitle(failure),
        message: failure.message,
        sourceId: failure.sourceId ?? null,
        sourceLabel: failure.sourceLabel ?? null,
        occurredAt,
    };
}

/** The test alert takes the very path a real failure takes, so a silent channel is found before it is needed. */
export function createRecordingTestFailure(): RecordingFailure {
    return {
        impact: 'test',
        message: 'Takto vypadá výstraha studia. Nic se nepokazilo a žádný záznam se nezastavil. Pokud jste ji neslyšeli ani neviděli mimo tuto kartu, povolte zvuk a upozornění prohlížeče.',
    };
}

export function appendRecordingAlert(alerts: readonly RecordingAlert[], alert: RecordingAlert): readonly RecordingAlert[] {
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
