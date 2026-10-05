import type { RecordingAlert } from './recordingStudioAlerts';

/** `unsupported` is a browser without the API at all, which is not the same as one which was refused. */
export type RecordingNotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * How far the browser notification of one alert is known to have got
 *
 * Note: These are separate answers on purpose, and none of them stands in for the next. A permission only says the
 *       browser may be asked. `dispatched` says it took the request. `displayed` says it reports having handed the
 *       notification on — Chrome reports that a millisecond after the request, whatever the system then does with it,
 *       so a Focus mode or a switched-off system setting still shows nothing. Only `activated`, the administrator
 *       clicking the notification, is evidence that anybody ever saw it.
 */
export type RecordingAlertNotificationStatus =
    /** Turned off in the settings of the studio; decided by the channel, never by the browser. */
    | 'disabled'
    | 'unsupported'
    /** The administrator was never asked, or left the question unanswered. */
    | 'permission-missing'
    | 'permission-denied'
    /** The browser refused the request outright or reported afterwards that it could not show it. */
    | 'dispatch-failed'
    | 'dispatched'
    | 'displayed'
    | 'activated';

export type RecordingAlertNotificationReport = {
    readonly status: RecordingAlertNotificationStatus;
    /** What the browser itself said about a refused dispatch, when it said anything. */
    readonly detail: string | null;
};

const NOTIFICATION_TAG_PREFIX = 'promptbook-recording-studio-alert';

function getNotificationConstructor(): typeof Notification | undefined {
    return typeof window === 'undefined' || typeof Notification === 'undefined' ? undefined : Notification;
}

function createNotificationReport(status: RecordingAlertNotificationStatus, detail: string | null = null): RecordingAlertNotificationReport {
    return { status, detail };
}

export const DISABLED_RECORDING_ALERT_NOTIFICATION: RecordingAlertNotificationReport = createNotificationReport('disabled');

export function readRecordingNotificationPermission(): RecordingNotificationPermission {
    const notificationConstructor = getNotificationConstructor();
    return notificationConstructor ? notificationConstructor.permission : 'unsupported';
}

/**
 * Asks the browser for permission to announce a failure outside this tab
 *
 * Note: Several browsers only answer this while a click of the administrator is still being handled, which is why it
 *       belongs to an explicit button or to the click which starts a test, and never to the start of a recording or
 *       to the moment a countdown runs out.
 *
 * @returns what the browser allows after the question, read from the browser itself rather than from the answer
 */
export async function requestRecordingNotificationPermission(): Promise<RecordingNotificationPermission> {
    const notificationConstructor = getNotificationConstructor();
    if (!notificationConstructor) {
        return 'unsupported';
    }

    try {
        await notificationConstructor.requestPermission();
    } catch {
        // A browser which refuses to ask has still decided something, and that is what is read below.
    }

    return readRecordingNotificationPermission();
}

/**
 * Tells the studio whenever the permission may have changed behind its back
 *
 * Note: The permission is changed in the settings of the browser, on another page entirely, so what the studio read
 *       when it was opened goes stale without any event of its own. Coming back to the tab is when that matters.
 *
 * @param onChange receives the permission as the browser reports it now
 * @returns stops watching
 */
export function watchRecordingNotificationPermission(onChange: (permission: RecordingNotificationPermission) => void): () => void {
    if (typeof window === 'undefined') {
        return () => undefined;
    }

    const report = () => onChange(readRecordingNotificationPermission());
    const reportWhenShown = () => { if (document.visibilityState === 'visible') report(); };
    window.addEventListener('focus', report);
    window.addEventListener('pageshow', report);
    document.addEventListener('visibilitychange', reportWhenShown);

    let isWatching = true;
    let permissionStatus: PermissionStatus | null = null;
    // Some browsers also say so the moment it changes, which covers the site settings opened from the address bar.
    void Promise.resolve()
        .then(() => navigator.permissions.query({ name: 'notifications' }))
        .then((status) => {
            if (!isWatching) return;
            permissionStatus = status;
            status.addEventListener('change', report);
        })
        .catch(() => undefined);

    return () => {
        isWatching = false;
        window.removeEventListener('focus', report);
        window.removeEventListener('pageshow', report);
        document.removeEventListener('visibilitychange', reportWhenShown);
        permissionStatus?.removeEventListener('change', report);
    };
}

function describeDispatchError(error: unknown): string | null {
    return error instanceof Error && error.message ? error.message : null;
}

/** Brings the studio which raised the alert to the front, as far as the browser lets a page do that. */
function focusStudioWindow(): void {
    try {
        window.focus();
    } catch {
        // A browser which refuses leaves the tab where it is; the alert is in the history either way.
    }
}

/**
 * Announces one alert outside the studio tab
 *
 * Note: Every alert carries its own tag, because a failure which quietly replaced an earlier one in the notification
 *       centre would be a failure the administrator was never told about.
 *
 * Note: Nothing here asks whether the studio is focused or visible. A browser shows a notification of a focused tab
 *       like any other, and an administrator looking at the studio is told twice rather than not at all.
 *
 * Note: This is a notification of the page, raised through the constructor, which every desktop browser the studio
 *       runs in supports. A mobile browser refuses the constructor and wants a service worker instead; that refusal
 *       is reported as a failed dispatch, because a studio which captures a screen does not run there anyway.
 *
 * @param alert the failure to announce
 * @param onProgress receives every later answer of the browser about this notification
 * @returns how far the notification got before this function returned
 */
export function showRecordingAlertNotification(
    alert: RecordingAlert,
    onProgress: (report: RecordingAlertNotificationReport) => void,
): RecordingAlertNotificationReport {
    const notificationConstructor = getNotificationConstructor();
    if (!notificationConstructor) {
        return createNotificationReport('unsupported');
    }

    const permission = notificationConstructor.permission;
    if (permission !== 'granted') {
        return createNotificationReport(permission === 'denied' ? 'permission-denied' : 'permission-missing');
    }

    let notification: Notification;
    try {
        notification = new notificationConstructor(alert.title, {
            body: alert.message,
            tag: `${NOTIFICATION_TAG_PREFIX}-${alert.id}`,
            requireInteraction: alert.isKeptOnScreen,
        });
    } catch (error) {
        return createNotificationReport('dispatch-failed', describeDispatchError(error));
    }

    let status: RecordingAlertNotificationStatus = 'dispatched';
    const advance = (nextStatus: RecordingAlertNotificationStatus, detail: string | null = null) => {
        status = nextStatus;
        onProgress(createNotificationReport(nextStatus, detail));
    };

    notification.onshow = () => {
        if (status === 'dispatched') advance('displayed');
    };
    // The browser accepted the request and only then found out it cannot show it; a click already proved otherwise.
    notification.onerror = () => {
        if (status !== 'activated') advance('dispatch-failed');
    };
    notification.onclick = () => {
        focusStudioWindow();
        notification.close();
        advance('activated');
    };

    return createNotificationReport('dispatched');
}
