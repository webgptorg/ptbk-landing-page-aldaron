import { describe, expect, it } from 'vitest';
import {
    describeRecordingAlertNotification, describeRecordingAlertSound, describeRecordingNotificationChannel, getRecordingNotificationChannelState,
    updateRecordingAlertDelivery, type RecordingAnnouncedAlert,
} from './recordingStudioAlertDelivery';
import type { RecordingAlertNotificationStatus } from './recordingStudioAlertNotification';
import type { RecordingAlertSoundStatus } from './recordingStudioAlertSound';
import { createRecordingAlert, type RecordingFailure } from './recordingStudioAlerts';

const ALL_NOTIFICATION_STATUSES: readonly RecordingAlertNotificationStatus[] = [
    'disabled', 'unsupported', 'permission-missing', 'permission-denied', 'dispatch-failed', 'dispatched', 'displayed', 'activated',
];
const ALL_SOUND_STATUSES: readonly RecordingAlertSoundStatus[] = ['disabled', 'unsupported', 'pending', 'played', 'blocked'];

function announce(status: RecordingAlertNotificationStatus, failure: RecordingFailure = { impact: 'recording-stopped', message: '' }, detail: string | null = null): RecordingAnnouncedAlert {
    return { alert: createRecordingAlert(failure), delivery: { notification: { status, detail }, sound: 'pending' } };
}

describe('whether the notification channel would carry the next alert', () => {
    it('names the one reason it would not', () => {
        const read = (permission: 'granted' | 'denied' | 'default' | 'unsupported', isNotificationEnabled = true, latestStatus: RecordingAlertNotificationStatus | null = null) =>
            getRecordingNotificationChannelState({ permission, isNotificationEnabled, latestStatus });

        expect(read('unsupported')).toBe('unsupported');
        expect(read('denied')).toBe('permission-denied');
        expect(read('default')).toBe('permission-missing');
        expect(read('granted', false)).toBe('disabled');
        expect(read('granted', true, 'dispatch-failed')).toBe('dispatch-failed');
        expect(read('granted')).toBe('ready');
        expect(read('granted', true, 'displayed')).toBe('ready');
    });

    it('says the administrator turned it off rather than blaming a permission they do not need', () => {
        expect(getRecordingNotificationChannelState({ permission: 'denied', isNotificationEnabled: false, latestStatus: null })).toBe('disabled');
        // A browser without the API cannot be turned on by a setting of the studio.
        expect(getRecordingNotificationChannelState({ permission: 'unsupported', isNotificationEnabled: false, latestStatus: null })).toBe('unsupported');
    });

    it('promises a dispatch and nothing after it, even with every permission in place', () => {
        const readyLabel = describeRecordingNotificationChannel('ready');

        expect(readyLabel).toContain('rozhoduje ještě systém');
        expect(readyLabel).not.toMatch(/dorazí|doručeno|uvidíte je vždy/);
        expect(describeRecordingNotificationChannel('permission-denied')).toContain('zakázaná');
        expect(describeRecordingNotificationChannel('permission-missing')).toContain('nemá oprávnění');
        expect(describeRecordingNotificationChannel('dispatch-failed')).toContain('nedokázal odeslat');
    });
});

describe('what is said about the notification and the sound of one alert', () => {
    it('says something different for every outcome', () => {
        const notificationLabels = ALL_NOTIFICATION_STATUSES.map((status) => describeRecordingAlertNotification(announce(status)));
        const soundLabels = ALL_SOUND_STATUSES.map(describeRecordingAlertSound);

        expect(new Set(notificationLabels).size).toBe(ALL_NOTIFICATION_STATUSES.length);
        expect(new Set(soundLabels).size).toBe(ALL_SOUND_STATUSES.length);
    });

    it('calls only a clicked notification delivered', () => {
        // The browser accepting or reporting a notification is not somebody seeing it.
        for (const status of ['dispatched', 'displayed'] as const) {
            expect(describeRecordingAlertNotification(announce(status))).not.toContain('doručeno');
        }
        expect(describeRecordingAlertNotification(announce('displayed'))).toContain('rozhodl systém');
        expect(describeRecordingAlertNotification(announce('activated'))).toContain('doručeno');
    });

    it('does not call a rendered sound a heard one', () => {
        expect(describeRecordingAlertSound('played')).toContain('slyšet je jen');
    });

    it('repeats what the browser said about a notification it refused', () => {
        expect(describeRecordingAlertNotification(announce('dispatch-failed', undefined, 'Illegal constructor.'))).toContain('Illegal constructor.');
        expect(describeRecordingAlertNotification(announce('dispatch-failed'))).toBe('Upozornění: prohlížeč je nedokázal odeslat.');
    });

    it('names the form a sent notification took, because the system delivers the two separately', () => {
        expect(describeRecordingAlertNotification(announce('displayed', { impact: 'recording-stopped', message: '' }))).toContain('zůstává na obrazovce');
        expect(describeRecordingAlertNotification(announce('displayed', { impact: 'recording-continues', message: '' }))).toContain('krátký banner');
        // A notification which never left has no form worth describing.
        expect(describeRecordingAlertNotification(announce('permission-denied'))).not.toMatch(/banner|zůstává na obrazovce/);
    });
});

describe('a later answer of one channel about one alert', () => {
    it('changes that alert alone and leaves its other channel as it was', () => {
        const [first, second] = [announce('dispatched'), announce('dispatched')];

        const updated = updateRecordingAlertDelivery([first, second], second.alert.id, { notification: { status: 'activated', detail: null } });

        expect(updated[0]).toBe(first);
        expect(updated[1].delivery).toEqual({ notification: { status: 'activated', detail: null }, sound: 'pending' });
        expect(updateRecordingAlertDelivery(updated, second.alert.id, { sound: 'played' })[1].delivery)
            .toEqual({ notification: { status: 'activated', detail: null }, sound: 'played' });
    });

    it('changes nothing for an alert which was dismissed in the meantime', () => {
        const remaining = [announce('dispatched')];

        expect(updateRecordingAlertDelivery(remaining, 'dismissed-alert', { sound: 'played' })).toEqual(remaining);
    });
});
