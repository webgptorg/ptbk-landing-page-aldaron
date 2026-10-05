/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    readRecordingNotificationPermission, requestRecordingNotificationPermission, showRecordingAlertNotification,
    watchRecordingNotificationPermission, type RecordingAlertNotificationReport,
} from './recordingStudioAlertNotification';
import { createRecordingAlert, createRecordingTestFailure } from './recordingStudioAlerts';

/**
 * Stands in for the Notifications API of a browser
 *
 * Note: Everything below checks which requests the studio makes and how it reads the answers. A browser accepting a
 *       request is not a banner on a screen, so none of it is evidence of a delivered notification.
 */
class FakeNotification {
    public static permission: NotificationPermission = 'granted';
    public static constructorError: Error | null = null;
    public static readonly instances: FakeNotification[] = [];
    public static requestPermission = vi.fn(async (): Promise<NotificationPermission> => FakeNotification.permission);
    public onshow: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public onclick: (() => void) | null = null;
    public readonly close = vi.fn();

    public constructor(public readonly title: string, public readonly options: NotificationOptions = {}) {
        if (FakeNotification.constructorError) throw FakeNotification.constructorError;
        FakeNotification.instances.push(this);
    }
}

function createStoppedRecordingAlert() {
    return createRecordingAlert({ impact: 'recording-stopped', message: 'Úložiště nestíhá ukládat záznam.' });
}

function dispatch(alert = createStoppedRecordingAlert()) {
    const progress: RecordingAlertNotificationReport[] = [];
    const report = showRecordingAlertNotification(alert, (nextReport) => progress.push(nextReport));
    return { alert, report, progress, notification: FakeNotification.instances.at(-1) };
}

beforeEach(() => {
    FakeNotification.permission = 'granted';
    FakeNotification.constructorError = null;
    FakeNotification.instances.length = 0;
    FakeNotification.requestPermission.mockClear();
    vi.stubGlobal('Notification', FakeNotification);
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('what the browser allows the studio to announce', () => {
    it('tells a browser without notifications apart from one which was refused', () => {
        vi.stubGlobal('Notification', undefined);
        expect(readRecordingNotificationPermission()).toBe('unsupported');
        expect(dispatch().report).toEqual({ status: 'unsupported', detail: null });
    });

    it('does not ask the browser for a notification it has no permission to show', () => {
        FakeNotification.permission = 'default';
        expect(dispatch().report).toEqual({ status: 'permission-missing', detail: null });
        FakeNotification.permission = 'denied';
        expect(dispatch().report).toEqual({ status: 'permission-denied', detail: null });
        expect(FakeNotification.instances).toHaveLength(0);
    });

    it('reads the permission which is in force at the moment of every alert, not the one it once saw', () => {
        expect(dispatch().report.status).toBe('dispatched');
        // The administrator blocked the site in the settings of the browser while the studio stayed open.
        FakeNotification.permission = 'denied';
        expect(dispatch().report.status).toBe('permission-denied');
        expect(FakeNotification.instances).toHaveLength(1);
    });

    it('answers with what the browser allows after the question rather than with what the question returned', async () => {
        FakeNotification.permission = 'default';
        FakeNotification.requestPermission.mockImplementationOnce(async () => {
            FakeNotification.permission = 'granted';
            // An older engine answers through a callback and resolves with nothing at all.
            return undefined as unknown as NotificationPermission;
        });
        expect(await requestRecordingNotificationPermission()).toBe('granted');
    });

    it('reports the standing permission when the browser refuses even to ask', async () => {
        FakeNotification.permission = 'denied';
        FakeNotification.requestPermission.mockRejectedValueOnce(new Error('Not during a user gesture'));
        expect(await requestRecordingNotificationPermission()).toBe('denied');
        vi.stubGlobal('Notification', undefined);
        expect(await requestRecordingNotificationPermission()).toBe('unsupported');
    });
});

describe('one alert handed to the browser as a notification', () => {
    it('sends the words of the alert under a tag of its own', () => {
        const first = dispatch();
        const second = dispatch();

        expect(first.report).toEqual({ status: 'dispatched', detail: null });
        expect(first.notification?.title).toBe('Nahrávání se zastavilo');
        expect(first.notification?.options.body).toBe('Úložiště nestíhá ukládat záznam.');
        // A second failure must never quietly replace the first one in the notification centre.
        expect(first.notification?.options.tag).toContain(first.alert.id);
        expect(second.notification?.options.tag).not.toBe(first.notification?.options.tag);
    });

    it('keeps a stopped recording on the screen and lets the loss of one source pass', () => {
        expect(dispatch().notification?.options.requireInteraction).toBe(true);
        expect(dispatch(createRecordingAlert({ impact: 'recording-continues', sourceLabel: 'App', message: '' })).notification?.options.requireInteraction).toBe(false);
    });

    it('sends a test in the form the studio would use for a real failure at that moment', () => {
        const beforeRecording = dispatch(createRecordingAlert(createRecordingTestFailure(), Date.now(), false));
        const duringRecording = dispatch(createRecordingAlert(createRecordingTestFailure(), Date.now(), true));

        expect(beforeRecording.notification?.title).toBe('Zkouška výstrahy studia · nic se nepokazilo');
        expect(beforeRecording.notification?.options.requireInteraction).toBe(true);
        expect(duringRecording.notification?.options.requireInteraction).toBe(false);
    });

    it('announces the same way whether the studio is the focused tab or a hidden one', () => {
        // The suspicion was that a focused document keeps its own notification back. Nothing in the studio does.
        vi.spyOn(document, 'hasFocus').mockReturnValue(true);
        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
        const focused = dispatch();
        vi.spyOn(document, 'hasFocus').mockReturnValue(false);
        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
        const hidden = dispatch();

        expect(focused.report).toEqual({ status: 'dispatched', detail: null });
        expect(hidden.report).toEqual(focused.report);
        expect(FakeNotification.instances).toHaveLength(2);
    });
});

describe('how far a notification is known to have got', () => {
    it('does not call an accepted request a displayed notification until the browser says so', () => {
        const { report, progress, notification } = dispatch();

        expect(report.status).toBe('dispatched');
        expect(progress).toEqual([]);
        notification?.onshow?.();
        expect(progress).toEqual([{ status: 'displayed', detail: null }]);
    });

    it('reports a request the browser refuses outright, in the words of the browser', () => {
        FakeNotification.constructorError = new TypeError('Illegal constructor. Use ServiceWorkerRegistration.showNotification() instead.');
        const { report, progress } = dispatch();

        expect(report).toEqual({ status: 'dispatch-failed', detail: 'Illegal constructor. Use ServiceWorkerRegistration.showNotification() instead.' });
        expect(progress).toEqual([]);
    });

    it('reports a notification the browser accepted and then could not show', () => {
        const { report, progress, notification } = dispatch();

        expect(report.status).toBe('dispatched');
        notification?.onerror?.();
        expect(progress).toEqual([{ status: 'dispatch-failed', detail: null }]);
        // A browser which reported the failure does not get to report a display afterwards.
        notification?.onshow?.();
        expect(progress).toHaveLength(1);
    });

    it('treats a clicked notification as delivered and brings the studio to the front', () => {
        const focus = vi.spyOn(window, 'focus').mockImplementation(() => undefined);
        const { progress, notification } = dispatch();

        notification?.onshow?.();
        notification?.onclick?.();

        expect(focus).toHaveBeenCalledTimes(1);
        expect(notification?.close).toHaveBeenCalledTimes(1);
        expect(progress.at(-1)).toEqual({ status: 'activated', detail: null });
        // Somebody clicked it, so a later complaint of the browser cannot mean that nobody saw it.
        notification?.onerror?.();
        expect(progress.at(-1)).toEqual({ status: 'activated', detail: null });
    });

    it('still records the click when the browser does not let the page come to the front', () => {
        vi.spyOn(window, 'focus').mockImplementation(() => { throw new Error('Focus is not allowed'); });
        const { progress, notification } = dispatch();

        expect(() => notification?.onclick?.()).not.toThrow();
        expect(progress).toEqual([{ status: 'activated', detail: null }]);
    });
});

describe('a permission which changes in the settings of the browser', () => {
    function stubPermissionStatus() {
        const status = new EventTarget();
        vi.stubGlobal('navigator', { ...navigator, permissions: { query: vi.fn(async () => status) } });
        return status;
    }

    it('is read again whenever the administrator comes back to the studio', () => {
        const onChange = vi.fn();
        const stopWatching = watchRecordingNotificationPermission(onChange);

        FakeNotification.permission = 'denied';
        window.dispatchEvent(new Event('focus'));
        expect(onChange).toHaveBeenLastCalledWith('denied');

        FakeNotification.permission = 'granted';
        window.dispatchEvent(new Event('pageshow'));
        expect(onChange).toHaveBeenLastCalledWith('granted');

        FakeNotification.permission = 'default';
        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
        document.dispatchEvent(new Event('visibilitychange'));
        expect(onChange).toHaveBeenCalledTimes(2);
        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
        document.dispatchEvent(new Event('visibilitychange'));
        expect(onChange).toHaveBeenLastCalledWith('default');

        stopWatching();
        window.dispatchEvent(new Event('focus'));
        expect(onChange).toHaveBeenCalledTimes(3);
    });

    it('is read the moment the browser itself says it changed, without leaving the tab', async () => {
        const status = stubPermissionStatus();
        const onChange = vi.fn();
        const stopWatching = watchRecordingNotificationPermission(onChange);
        await vi.waitFor(() => expect(navigator.permissions.query).toHaveBeenCalledWith({ name: 'notifications' }));
        await Promise.resolve();

        FakeNotification.permission = 'denied';
        status.dispatchEvent(new Event('change'));
        expect(onChange).toHaveBeenLastCalledWith('denied');

        stopWatching();
        status.dispatchEvent(new Event('change'));
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('keeps watching the tab in a browser which cannot be asked about permissions', () => {
        vi.stubGlobal('navigator', { ...navigator, permissions: undefined });
        const onChange = vi.fn();
        const stopWatching = watchRecordingNotificationPermission(onChange);

        window.dispatchEvent(new Event('focus'));
        expect(onChange).toHaveBeenCalledWith('granted');
        stopWatching();
    });
});
