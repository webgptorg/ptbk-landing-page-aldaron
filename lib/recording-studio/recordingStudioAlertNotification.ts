import type { RecordingAlert } from './recordingStudioAlerts';

/** `unsupported` is a browser without the API at all, which is not the same as one which was refused. */
export type RecordingNotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

const NOTIFICATION_TAG_PREFIX = 'promptbook-recording-studio-alert';

function getNotificationConstructor(): typeof Notification | undefined {
    return typeof window === 'undefined' || typeof Notification === 'undefined' ? undefined : Notification;
}

export function readRecordingNotificationPermission(): RecordingNotificationPermission {
    const notificationConstructor = getNotificationConstructor();
    return notificationConstructor ? notificationConstructor.permission : 'unsupported';
}

/**
 * Asks the browser for permission to announce a failure outside this tab
 *
 * Note: Several browsers only answer this while a click of the administrator is still being handled, which is why it
 *       belongs to an explicit button and never to the start of a recording.
 */
export async function requestRecordingNotificationPermission(): Promise<RecordingNotificationPermission> {
    const notificationConstructor = getNotificationConstructor();
    if (!notificationConstructor) {
        return 'unsupported';
    }

    try {
        return await notificationConstructor.requestPermission();
    } catch {
        return readRecordingNotificationPermission();
    }
}

/**
 * Announces one alert outside the studio tab
 *
 * Note: Every alert carries its own tag, because a failure which quietly replaced an earlier one in the notification
 *       centre would be a failure the administrator was never told about.
 *
 * @param alert the failure to announce
 * @returns whether the browser accepted the notification
 */
export function showRecordingAlertNotification(alert: RecordingAlert): boolean {
    const notificationConstructor = getNotificationConstructor();
    if (!notificationConstructor || notificationConstructor.permission !== 'granted') {
        return false;
    }

    try {
        const notification = new notificationConstructor(alert.title, {
            body: alert.message,
            tag: `${NOTIFICATION_TAG_PREFIX}-${alert.id}`,
            // A stopped recording waits for the administrator; a take which is still running must not bury the screen.
            requireInteraction: alert.severity === 'critical',
        });
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        return true;
    } catch {
        return false;
    }
}
