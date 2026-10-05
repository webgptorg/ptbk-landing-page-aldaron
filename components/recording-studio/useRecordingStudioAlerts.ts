'use client';

import { ADMIN_SIGN_OUT_API_PATH } from '@/lib/admin/adminConstants';
import { updateRecordingAlertDelivery, type RecordingAnnouncedAlert } from '@/lib/recording-studio/recordingStudioAlertDelivery';
import {
    DISABLED_RECORDING_ALERT_NOTIFICATION, readRecordingNotificationPermission, requestRecordingNotificationPermission,
    showRecordingAlertNotification, watchRecordingNotificationPermission, type RecordingNotificationPermission,
} from '@/lib/recording-studio/recordingStudioAlertNotification';
import { isRecordingAlertSoundSupported, playRecordingAlertSound, prepareRecordingAlertSound, retainRecordingAlertSound } from '@/lib/recording-studio/recordingStudioAlertSound';
import { IDLE_RECORDING_ALERT_TEST, RecordingAlertTestCountdown, type RecordingAlertTestState } from '@/lib/recording-studio/recordingStudioAlertTest';
import {
    appendRecordingAlert, createRecordingAlert, createRecordingTestFailure, DEFAULT_ALERT_PREFERENCES, loadRecordingAlertPreferences,
    saveRecordingAlertPreferences, type RecordingAlert, type RecordingAlertPreferences, type RecordingFailure,
} from '@/lib/recording-studio/recordingStudioAlerts';
import { useCallback, useEffect, useRef, useState } from 'react';

/** The alert a clicked notification belongs to. A second click on the same one is a new activation. */
export type RecordingAlertActivation = {
    readonly alertId: string;
    readonly activationNumber: number;
};

/**
 * Whether a submitted form is the one which signs the administrator out
 *
 * Note: It is asked about every form submitted on the page, so it reads the attribute rather than the property a field
 *       named `action` would shadow, and an address it cannot read is simply not the sign-out.
 */
function isAdminSignOutForm(target: EventTarget | null): boolean {
    const action = target instanceof HTMLFormElement ? target.getAttribute('action') : null;
    if (action === null) {
        return false;
    }

    try {
        return new URL(action, window.location.href).pathname === ADMIN_SIGN_OUT_API_PATH;
    } catch {
        return false;
    }
}

/**
 * Owns the one channel through which every studio failure reaches the administrator
 *
 * Note: The administrator of a recording is normally working in the very application being recorded, which is another
 *       window or another Space entirely. A message painted into this tab is therefore not a way of telling anybody
 *       anything, which is why the same alert always goes out as a sound and as a notification of the browser too.
 *
 * Note: The channel can only know what the browser tells it. It records how far each alert got on each way out, and
 *       never turns "the browser took it" into "the administrator was told".
 *
 * @param isTakeRunning whether the studio is recording right now, asked at the moment an alert is raised
 */
export function useRecordingStudioAlerts({ isTakeRunning }: { readonly isTakeRunning: () => boolean }) {
    const [alerts, setAlerts] = useState<readonly RecordingAnnouncedAlert[]>([]);
    const [alertPreferences, setAlertPreferences] = useState<RecordingAlertPreferences>(DEFAULT_ALERT_PREFERENCES);
    const [notificationPermission, setNotificationPermission] = useState<RecordingNotificationPermission>('unsupported');
    const [isAlertSoundSupported, setIsAlertSoundSupported] = useState(false);
    const [testAlert, setTestAlert] = useState<RecordingAlertTestState>(IDLE_RECORDING_ALERT_TEST);
    const [alertActivation, setAlertActivation] = useState<RecordingAlertActivation | null>(null);
    const alertPreferencesReference = useRef<RecordingAlertPreferences>(DEFAULT_ALERT_PREFERENCES);
    const isTakeRunningReference = useRef(isTakeRunning);
    isTakeRunningReference.current = isTakeRunning;
    const testCountdownReference = useRef<RecordingAlertTestCountdown | null>(null);
    const releaseTestSoundReference = useRef<(() => void) | null>(null);

    useEffect(() => {
        const loadedPreferences = loadRecordingAlertPreferences();
        alertPreferencesReference.current = loadedPreferences;
        setAlertPreferences(loadedPreferences);
        setNotificationPermission(readRecordingNotificationPermission());
        setIsAlertSoundSupported(isRecordingAlertSoundSupported());
        // The permission is changed in the settings of the browser, so it is read again whenever the tab is come back to.
        return watchRecordingNotificationPermission(setNotificationPermission);
    }, []);

    /**
     * Announces one failure through every channel which is enabled
     *
     * Note: This is deliberately the only way an alert is ever raised, so the test below exercises exactly what a lost
     *       camera at three in the morning will do. Nothing in it waits for anything: a countdown which is running
     *       belongs to the test alone and holds no real failure back.
     */
    const announceFailure = useCallback((failure: RecordingFailure): RecordingAlert => {
        const alert = createRecordingAlert(failure, Date.now(), isTakeRunningReference.current());
        const { isNotificationEnabled, isSoundEnabled } = alertPreferencesReference.current;
        const reportDelivery = (change: Parameters<typeof updateRecordingAlertDelivery>[2]) =>
            setAlerts((previousAlerts) => updateRecordingAlertDelivery(previousAlerts, alert.id, change));

        // A refused or missing channel leaves the others announcing; the history keeps the alert either way.
        const notification = isNotificationEnabled
            ? showRecordingAlertNotification(alert, (report) => {
                reportDelivery({ notification: report });
                if (report.status === 'activated') {
                    setAlertActivation((previous) => ({ alertId: alert.id, activationNumber: (previous?.activationNumber ?? 0) + 1 }));
                }
            })
            : DISABLED_RECORDING_ALERT_NOTIFICATION;
        setAlerts((previousAlerts) => appendRecordingAlert(previousAlerts, { alert, delivery: { notification, sound: isSoundEnabled ? 'pending' : 'disabled' } }));
        if (isSoundEnabled) {
            void playRecordingAlertSound(alert.severity).then((sound) => reportDelivery({ sound }), () => reportDelivery({ sound: 'blocked' }));
        }
        // What the browser allowed at this very moment is fresher than anything the panel remembered.
        setNotificationPermission(readRecordingNotificationPermission());
        return alert;
    }, []);

    const changeAlertPreferences = useCallback((change: Partial<RecordingAlertPreferences>) => {
        const nextPreferences = { ...alertPreferencesReference.current, ...change };
        alertPreferencesReference.current = nextPreferences;
        saveRecordingAlertPreferences(nextPreferences);
        setAlertPreferences(nextPreferences);
        // Turning the sound on is a click too, and it may be the last one before a failure needs the sound.
        if (change.isSoundEnabled) prepareRecordingAlertSound();
    }, []);

    const requestNotificationPermission = useCallback(async () => {
        const permission = await requestRecordingNotificationPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') changeAlertPreferences({ isNotificationEnabled: true });
        return permission;
    }, [changeAlertPreferences]);

    /**
     * The countdown of the test lives exactly as long as this studio does
     *
     * Note: It is cancelled when the studio is unmounted, when the administrator signs out, when its page is left, and
     *       by `cancelTestAlert` for a studio which stops being the active one. Signing out is watched for by its form
     *       rather than by the page going away, because the page lives on until the server has answered and a test
     *       must not fire into that gap. It listens to neither focus nor visibility for any of this: the administrator
     *       is asked to leave the tab, and a test which that cancelled would test nothing. Coming back only makes it
     *       look at its deadline again.
     */
    useEffect(() => {
        const countdown = new RecordingAlertTestCountdown({
            prepare: () => {
                const { isNotificationEnabled, isSoundEnabled } = alertPreferencesReference.current;
                // Both are asked for here, during the click, because neither a sound output nor a permission question
                // is something a browser grants to a timer five seconds later.
                if (isSoundEnabled) releaseTestSoundReference.current = retainRecordingAlertSound();
                if (!isNotificationEnabled || readRecordingNotificationPermission() !== 'default') return null;
                return requestNotificationPermission();
            },
            onChange: (state) => {
                setTestAlert(state);
                if (state.status !== 'idle') return;
                releaseTestSoundReference.current?.();
                releaseTestSoundReference.current = null;
            },
            onExpire: (delayMilliseconds) => { announceFailure(createRecordingTestFailure(delayMilliseconds)); },
        });
        testCountdownReference.current = countdown;

        const refreshCountdown = () => countdown.refresh();
        const cancelCountdown = () => countdown.cancel();
        const cancelCountdownOnSignOut = (event: Event) => { if (isAdminSignOutForm(event.target)) countdown.cancel(); };
        document.addEventListener('visibilitychange', refreshCountdown);
        window.addEventListener('pageshow', refreshCountdown);
        window.addEventListener('pagehide', cancelCountdown);
        // Capturing, so that the shared admin protection holding the form back for a pending save does not hide it.
        document.addEventListener('submit', cancelCountdownOnSignOut, true);
        return () => {
            document.removeEventListener('visibilitychange', refreshCountdown);
            window.removeEventListener('pageshow', refreshCountdown);
            window.removeEventListener('pagehide', cancelCountdown);
            document.removeEventListener('submit', cancelCountdownOnSignOut, true);
            countdown.dispose();
            testCountdownReference.current = null;
        };
    }, [announceFailure, requestNotificationPermission]);

    return {
        alerts, alertPreferences, notificationPermission, isAlertSoundSupported, testAlert, alertActivation,
        announceFailure, changeAlertPreferences, requestNotificationPermission,
        /** Starts the countdown of one test alert. It has to be called from the click itself; see `prepare` above. */
        startTestAlert: useCallback(() => { testCountdownReference.current?.start(); }, []),
        cancelTestAlert: useCallback(() => { testCountdownReference.current?.cancel(); }, []),
        /** Opens the sound output during a click which precedes a recording, so a failure hours later can use it. */
        prepareAlertSound: useCallback(() => { if (alertPreferencesReference.current.isSoundEnabled) prepareRecordingAlertSound(); }, []),
        dismissAlert: useCallback((alertId: string) => setAlerts((previousAlerts) => previousAlerts.filter(({ alert }) => alert.id !== alertId)), []),
        dismissAllAlerts: useCallback(() => setAlerts([]), []),
    };
}
