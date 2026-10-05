/**
 * @vitest-environment jsdom
 */

import { ADMIN_SIGN_OUT_API_PATH } from '@/lib/admin/adminConstants';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRecordingStudioAlerts } from './useRecordingStudioAlerts';

const SOUND = vi.hoisted(() => ({ play: vi.fn(), retain: vi.fn(), release: vi.fn(), prepare: vi.fn() }));
// The sound output has tests of its own; here it only has to be seen being asked, and to answer as a browser would.
vi.mock('@/lib/recording-studio/recordingStudioAlertSound', () => ({
    isRecordingAlertSoundSupported: () => true,
    playRecordingAlertSound: SOUND.play,
    prepareRecordingAlertSound: SOUND.prepare,
    retainRecordingAlertSound: SOUND.retain,
}));

/**
 * Stands in for the Notifications API of a browser
 *
 * Note: These are checks of the path the studio takes through that API. A request the fake accepts says nothing about
 *       a banner appearing on any screen.
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

const TEST_TITLE = 'Zkouška výstrahy studia · nic se nepokazilo';
const REAL_FAILURE = { impact: 'recording-stopped', message: 'Úložiště nestíhá ukládat záznam.' } as const;

function renderAlerts(isTakeRunning = false) {
    return renderHook(() => useRecordingStudioAlerts({ isTakeRunning: () => isTakeRunning }));
}

async function advance(milliseconds: number) {
    await act(async () => { await vi.advanceTimersByTimeAsync(milliseconds); });
}

beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    FakeNotification.permission = 'granted';
    FakeNotification.constructorError = null;
    FakeNotification.instances.length = 0;
    FakeNotification.requestPermission.mockReset().mockImplementation(async () => FakeNotification.permission);
    SOUND.play.mockReset().mockResolvedValue('played');
    SOUND.release.mockReset();
    SOUND.retain.mockReset().mockReturnValue(SOUND.release);
    SOUND.prepare.mockReset();
    vi.stubGlobal('Notification', FakeNotification);
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('a test of the alert channels which fires after a countdown', () => {
    it('gives five seconds to leave the tab and then announces exactly one labelled test alert through both channels', async () => {
        const { result } = renderAlerts();

        act(() => result.current.startTestAlert());
        expect(result.current.testAlert).toEqual({ status: 'counting', remainingSeconds: 5 });
        // The sound output is opened by the click itself, five seconds before anything is played through it.
        expect(SOUND.retain).toHaveBeenCalledTimes(1);
        expect(SOUND.play).not.toHaveBeenCalled();

        await advance(4_999);
        expect(result.current.alerts).toEqual([]);
        expect(FakeNotification.instances).toEqual([]);

        await advance(1);
        expect(result.current.testAlert).toEqual({ status: 'idle' });
        expect(result.current.alerts).toHaveLength(1);
        expect(result.current.alerts[0].alert).toMatchObject({ impact: 'test', severity: 'test', title: TEST_TITLE });
        expect(FakeNotification.instances.map(({ title }) => title)).toEqual([TEST_TITLE]);
        expect(FakeNotification.instances[0].options.body).toContain('Toto je jen zkouška');
        expect(SOUND.play.mock.calls).toEqual([['test']]);
        expect(SOUND.release).toHaveBeenCalledTimes(1);

        await advance(60_000);
        expect(result.current.alerts).toHaveLength(1);
        expect(FakeNotification.instances).toHaveLength(1);
        expect(SOUND.play).toHaveBeenCalledTimes(1);
    });

    it('schedules one test however many times the button is clicked', async () => {
        const { result } = renderAlerts();

        act(() => { result.current.startTestAlert(); result.current.startTestAlert(); });
        await advance(2_000);
        act(() => result.current.startTestAlert());
        await advance(60_000);

        expect(SOUND.retain).toHaveBeenCalledTimes(1);
        expect(result.current.alerts).toHaveLength(1);
        expect(FakeNotification.instances).toHaveLength(1);
        expect(SOUND.play).toHaveBeenCalledTimes(1);
    });

    it('announces nothing after Zrušit test and gives the sound output back', async () => {
        const { result } = renderAlerts();

        act(() => result.current.startTestAlert());
        await advance(3_000);
        act(() => result.current.cancelTestAlert());
        expect(result.current.testAlert).toEqual({ status: 'idle' });
        expect(SOUND.release).toHaveBeenCalledTimes(1);
        await advance(60_000);

        expect(result.current.alerts).toEqual([]);
        expect(FakeNotification.instances).toEqual([]);
        expect(SOUND.play).not.toHaveBeenCalled();
    });

    it('is cancelled when the studio it belongs to is disposed', async () => {
        const { result, unmount } = renderAlerts();

        act(() => result.current.startTestAlert());
        unmount();
        await advance(60_000);

        expect(FakeNotification.instances).toEqual([]);
        expect(SOUND.play).not.toHaveBeenCalled();
        expect(SOUND.release).toHaveBeenCalledTimes(1);
    });

    it('is cancelled when the page of the studio is left', async () => {
        const { result } = renderAlerts();

        act(() => result.current.startTestAlert());
        act(() => { window.dispatchEvent(new Event('pagehide')); });
        expect(result.current.testAlert).toEqual({ status: 'idle' });
        await advance(60_000);

        expect(result.current.alerts).toEqual([]);
        expect(FakeNotification.instances).toEqual([]);
    });

    it('is cancelled the moment the administrator signs out, not only once the server has answered', async () => {
        const { result } = renderAlerts();
        const submitForm = (action: string | null, innerHtml = '') => {
            const form = document.createElement('form');
            if (action !== null) form.setAttribute('action', action);
            form.innerHTML = innerHtml;
            document.body.append(form);
            // The page is still there while the sign-out is on its way; only the form says what is happening.
            act(() => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
            form.remove();
        };

        act(() => result.current.startTestAlert());
        // Every other form of the administration is none of the studio's business, however oddly it is built.
        submitForm('/api/admin/contacts');
        submitForm(null);
        submitForm('/api/admin/contacts', '<input name="action" value="delete">');
        submitForm('http://[not an address');
        expect(result.current.testAlert).toEqual({ status: 'counting', remainingSeconds: 5 });

        submitForm(ADMIN_SIGN_OUT_API_PATH);
        expect(result.current.testAlert).toEqual({ status: 'idle' });
        await advance(60_000);

        expect(result.current.alerts).toEqual([]);
        expect(FakeNotification.instances).toEqual([]);
        expect(SOUND.play).not.toHaveBeenCalled();
    });

    it('keeps counting when the administrator does what they were asked to and leaves the tab', async () => {
        const { result } = renderAlerts();

        act(() => result.current.startTestAlert());
        await advance(1_000);
        act(() => {
            window.dispatchEvent(new Event('blur'));
            vi.spyOn(document, 'hasFocus').mockReturnValue(false);
            vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
            document.dispatchEvent(new Event('visibilitychange'));
        });
        expect(result.current.testAlert).toEqual({ status: 'counting', remainingSeconds: 4 });

        await advance(4_000);
        // Hidden and unfocused is exactly where the alert has to arrive, so it is sent there like anywhere else.
        expect(result.current.alerts).toHaveLength(1);
        expect(FakeNotification.instances.map(({ title }) => title)).toEqual([TEST_TITLE]);
        expect(SOUND.play).toHaveBeenCalledTimes(1);
    });

    it('announces a real failure at once and on its own while a test is still counting down', async () => {
        const { result } = renderAlerts();

        act(() => result.current.startTestAlert());
        await advance(2_000);
        act(() => { result.current.announceFailure(REAL_FAILURE); });

        // Not one tick was waited for: the countdown belongs to the test alone.
        expect(result.current.alerts.map(({ alert }) => alert.title)).toEqual(['Nahrávání se zastavilo']);
        expect(FakeNotification.instances.map(({ title }) => title)).toEqual(['Nahrávání se zastavilo']);
        expect(SOUND.play.mock.calls).toEqual([['critical']]);
        expect(result.current.testAlert).toEqual({ status: 'counting', remainingSeconds: 3 });

        await advance(3_000);
        expect(result.current.alerts.map(({ alert }) => alert.title)).toEqual([TEST_TITLE, 'Nahrávání se zastavilo']);
        expect(FakeNotification.instances.map(({ title }) => title)).toEqual(['Nahrávání se zastavilo', TEST_TITLE]);
        expect(SOUND.play.mock.calls).toEqual([['critical'], ['test']]);
    });

    it('rehearses the waiting notification before a recording and the passing one during it', async () => {
        const beforeRecording = renderAlerts(false);
        act(() => beforeRecording.result.current.startTestAlert());
        await advance(5_000);
        beforeRecording.unmount();
        const duringRecording = renderAlerts(true);
        act(() => duringRecording.result.current.startTestAlert());
        await advance(5_000);

        expect(FakeNotification.instances.map(({ options }) => options.requireInteraction)).toEqual([true, false]);
        expect(duringRecording.result.current.alerts[0].alert.isKeptOnScreen).toBe(false);
    });
});

describe('the permission a test needs before it can show a notification', () => {
    it('is asked for by the click itself, and the whole countdown starts only after the answer', async () => {
        FakeNotification.permission = 'default';
        let answer!: (permission: NotificationPermission) => void;
        FakeNotification.requestPermission.mockImplementationOnce(() => new Promise((resolve) => { answer = resolve; }));
        const { result } = renderAlerts();

        act(() => result.current.startTestAlert());
        expect(FakeNotification.requestPermission).toHaveBeenCalledTimes(1);
        expect(result.current.testAlert).toEqual({ status: 'awaiting-permission' });
        await advance(20_000);
        expect(result.current.alerts).toEqual([]);

        FakeNotification.permission = 'granted';
        await act(async () => { answer('granted'); });
        expect(result.current.notificationPermission).toBe('granted');
        expect(result.current.testAlert).toEqual({ status: 'counting', remainingSeconds: 5 });
        await advance(5_000);

        expect(FakeNotification.instances.map(({ title }) => title)).toEqual([TEST_TITLE]);
        expect(result.current.alerts[0].delivery.notification.status).toBe('dispatched');
    });

    it('is never asked for by a timer: a countdown which ran out without it only says it is missing', async () => {
        FakeNotification.permission = 'default';
        FakeNotification.requestPermission.mockImplementation(async () => 'default');
        const { result } = renderAlerts();

        act(() => result.current.startTestAlert());
        await advance(5_000);

        expect(FakeNotification.requestPermission).toHaveBeenCalledTimes(1);
        expect(FakeNotification.instances).toEqual([]);
        expect(result.current.alerts[0].delivery.notification.status).toBe('permission-missing');
        expect(SOUND.play).toHaveBeenCalledTimes(1);
    });

    it('is not asked for when the administrator turned notifications off in the studio', async () => {
        FakeNotification.permission = 'default';
        const { result } = renderAlerts();

        act(() => result.current.changeAlertPreferences({ isNotificationEnabled: false }));
        act(() => result.current.startTestAlert());
        expect(result.current.testAlert).toEqual({ status: 'counting', remainingSeconds: 5 });
        await advance(5_000);

        expect(FakeNotification.requestPermission).not.toHaveBeenCalled();
        expect(result.current.alerts[0].delivery).toEqual({ notification: { status: 'disabled', detail: null }, sound: 'played' });
    });

    it('can be cancelled while the browser is still asking', async () => {
        FakeNotification.permission = 'default';
        let answer!: (permission: NotificationPermission) => void;
        FakeNotification.requestPermission.mockImplementationOnce(() => new Promise((resolve) => { answer = resolve; }));
        const { result } = renderAlerts();

        act(() => result.current.startTestAlert());
        act(() => result.current.cancelTestAlert());
        FakeNotification.permission = 'granted';
        await act(async () => { answer('granted'); });
        await advance(60_000);

        expect(result.current.testAlert).toEqual({ status: 'idle' });
        expect(result.current.alerts).toEqual([]);
        // The answer itself still counts: the administrator did grant the permission.
        expect(result.current.notificationPermission).toBe('granted');
    });

    it('keeps its own button, which turns notifications on once the browser allows them', async () => {
        FakeNotification.permission = 'default';
        const { result } = renderAlerts();
        act(() => result.current.changeAlertPreferences({ isNotificationEnabled: false }));

        FakeNotification.requestPermission.mockImplementationOnce(async () => { FakeNotification.permission = 'granted'; return 'granted'; });
        await act(async () => { await result.current.requestNotificationPermission(); });

        expect(result.current.notificationPermission).toBe('granted');
        expect(result.current.alertPreferences).toEqual({ isSoundEnabled: true, isNotificationEnabled: true });
    });

    it('is read again after the administrator comes back from the settings of the browser', () => {
        const { result } = renderAlerts();
        expect(result.current.notificationPermission).toBe('granted');

        FakeNotification.permission = 'denied';
        act(() => { window.dispatchEvent(new Event('focus')); });
        expect(result.current.notificationPermission).toBe('denied');

        FakeNotification.permission = 'granted';
        act(() => { document.dispatchEvent(new Event('visibilitychange')); });
        expect(result.current.notificationPermission).toBe('granted');
    });

    it('is read again by every alert, so a permission revoked meanwhile is not shown as still granted', () => {
        const { result } = renderAlerts();

        FakeNotification.permission = 'denied';
        act(() => { result.current.announceFailure(REAL_FAILURE); });

        expect(result.current.notificationPermission).toBe('denied');
        expect(result.current.alerts[0].delivery.notification.status).toBe('permission-denied');
    });
});

describe('two channels which announce independently of each other', () => {
    it('still sounds and still records an alert whose notification the browser forbids', async () => {
        FakeNotification.permission = 'denied';
        const { result } = renderAlerts();

        act(() => { result.current.announceFailure(REAL_FAILURE); });
        await advance(0);

        expect(FakeNotification.instances).toEqual([]);
        expect(SOUND.play.mock.calls).toEqual([['critical']]);
        expect(result.current.alerts).toHaveLength(1);
        expect(result.current.alerts[0].delivery).toEqual({ notification: { status: 'permission-denied', detail: null }, sound: 'played' });
    });

    it('still sounds and still records an alert whose notification the browser refuses to dispatch', async () => {
        FakeNotification.constructorError = new TypeError('Illegal constructor.');
        const { result } = renderAlerts();

        act(() => { result.current.announceFailure(REAL_FAILURE); });
        await advance(0);

        expect(result.current.alerts[0].alert.message).toBe(REAL_FAILURE.message);
        expect(result.current.alerts[0].delivery).toEqual({ notification: { status: 'dispatch-failed', detail: 'Illegal constructor.' }, sound: 'played' });
    });

    it('keeps the alert when the browser reports afterwards that it could not show its notification', async () => {
        const { result } = renderAlerts();

        act(() => { result.current.announceFailure(REAL_FAILURE); });
        await advance(0);
        act(() => { FakeNotification.instances[0].onerror?.(); });

        expect(result.current.alerts).toHaveLength(1);
        expect(result.current.alerts[0].alert.title).toBe('Nahrávání se zastavilo');
        expect(result.current.alerts[0].delivery).toEqual({ notification: { status: 'dispatch-failed', detail: null }, sound: 'played' });
    });

    it('still notifies when the sound is turned off, and never opens a sound output for it', async () => {
        const { result } = renderAlerts();

        act(() => result.current.changeAlertPreferences({ isSoundEnabled: false }));
        act(() => result.current.startTestAlert());
        await advance(5_000);

        expect(SOUND.retain).not.toHaveBeenCalled();
        expect(SOUND.play).not.toHaveBeenCalled();
        expect(FakeNotification.instances).toHaveLength(1);
        expect(result.current.alerts[0].delivery).toEqual({ notification: { status: 'dispatched', detail: null }, sound: 'disabled' });
    });

    it('still notifies when the browser holds the sound back, and says which of the two stayed silent', async () => {
        SOUND.play.mockResolvedValue('blocked');
        const { result } = renderAlerts();

        act(() => { result.current.announceFailure(REAL_FAILURE); });
        expect(result.current.alerts[0].delivery.sound).toBe('pending');
        await advance(0);

        expect(FakeNotification.instances).toHaveLength(1);
        expect(result.current.alerts[0].delivery).toEqual({ notification: { status: 'dispatched', detail: null }, sound: 'blocked' });
    });

    it('never lets a sound which fails take the alert or its notification down with it', async () => {
        SOUND.play.mockRejectedValue(new Error('The sound device disappeared'));
        const { result } = renderAlerts();

        act(() => { result.current.announceFailure(REAL_FAILURE); });
        await advance(0);

        expect(result.current.alerts[0].delivery).toEqual({ notification: { status: 'dispatched', detail: null }, sound: 'blocked' });
    });

    it('remembers each of the two settings on its own', () => {
        const first = renderAlerts();
        act(() => first.result.current.changeAlertPreferences({ isSoundEnabled: false }));
        first.unmount();

        expect(renderAlerts().result.current.alertPreferences).toEqual({ isSoundEnabled: false, isNotificationEnabled: true });
    });

    it('opens the sound output during the clicks which precede a failure, and only while the sound is wanted', () => {
        const { result } = renderAlerts();

        act(() => result.current.prepareAlertSound());
        expect(SOUND.prepare).toHaveBeenCalledTimes(1);

        act(() => result.current.changeAlertPreferences({ isSoundEnabled: false }));
        act(() => result.current.prepareAlertSound());
        expect(SOUND.prepare).toHaveBeenCalledTimes(1);

        // Turning the sound back on is a click too, and possibly the last one before the failure.
        act(() => result.current.changeAlertPreferences({ isSoundEnabled: true }));
        expect(SOUND.prepare).toHaveBeenCalledTimes(2);
    });
});

describe('how far a notification is known to have got', () => {
    it('separates a request the browser took from one it reports as shown and from one somebody clicked', async () => {
        const focus = vi.spyOn(window, 'focus').mockImplementation(() => undefined);
        const { result } = renderAlerts();

        act(() => { result.current.announceFailure(REAL_FAILURE); });
        expect(result.current.alerts[0].delivery.notification.status).toBe('dispatched');
        expect(result.current.alertActivation).toBeNull();

        act(() => { FakeNotification.instances[0].onshow?.(); });
        expect(result.current.alerts[0].delivery.notification.status).toBe('displayed');
        expect(result.current.alertActivation).toBeNull();

        act(() => { FakeNotification.instances[0].onclick?.(); });
        expect(result.current.alerts[0].delivery.notification.status).toBe('activated');
        expect(focus).toHaveBeenCalledTimes(1);
        expect(result.current.alertActivation).toEqual({ alertId: result.current.alerts[0].alert.id, activationNumber: 1 });
    });

    it('ignores an answer about an alert which was dismissed in the meantime', async () => {
        const { result } = renderAlerts();

        act(() => { result.current.announceFailure(REAL_FAILURE); });
        act(() => result.current.dismissAllAlerts());
        act(() => { FakeNotification.instances[0].onshow?.(); });
        await advance(0);

        expect(result.current.alerts).toEqual([]);
    });
});
