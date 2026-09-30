'use client';

import { showRecordingAlertNotification, readRecordingNotificationPermission, requestRecordingNotificationPermission, type RecordingNotificationPermission } from '@/lib/recording-studio/recordingStudioAlertNotification';
import { isRecordingAlertSoundSupported, playRecordingAlertSound } from '@/lib/recording-studio/recordingStudioAlertSound';
import {
    appendRecordingAlert, createRecordingAlert, createRecordingTestFailure, DEFAULT_ALERT_PREFERENCES, loadRecordingAlertPreferences,
    saveRecordingAlertPreferences, type RecordingAlert, type RecordingAlertPreferences, type RecordingFailure,
} from '@/lib/recording-studio/recordingStudioAlerts';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Owns the one channel through which every studio failure reaches the administrator
 *
 * Note: The administrator of a recording is normally working in the very application being recorded, which is another
 *       window or another Space entirely. A message painted into this tab is therefore not a way of telling anybody
 *       anything, which is why the same alert always goes out as a sound and as a notification of the browser too.
 */
export function useRecordingStudioAlerts() {
    const [alerts, setAlerts] = useState<readonly RecordingAlert[]>([]);
    const [alertPreferences, setAlertPreferences] = useState<RecordingAlertPreferences>(DEFAULT_ALERT_PREFERENCES);
    const [notificationPermission, setNotificationPermission] = useState<RecordingNotificationPermission>('unsupported');
    const [isAlertSoundSupported, setIsAlertSoundSupported] = useState(false);
    const alertPreferencesReference = useRef<RecordingAlertPreferences>(DEFAULT_ALERT_PREFERENCES);

    useEffect(() => {
        const loadedPreferences = loadRecordingAlertPreferences();
        alertPreferencesReference.current = loadedPreferences;
        setAlertPreferences(loadedPreferences);
        setNotificationPermission(readRecordingNotificationPermission());
        setIsAlertSoundSupported(isRecordingAlertSoundSupported());
    }, []);

    /**
     * Announces one failure through every channel which is enabled
     *
     * Note: This is deliberately the only way an alert is ever raised, so the test button below exercises exactly what
     *       a lost camera at three in the morning will do.
     */
    const announceFailure = useCallback((failure: RecordingFailure): RecordingAlert => {
        const alert = createRecordingAlert(failure);
        setAlerts((previousAlerts) => appendRecordingAlert(previousAlerts, alert));
        // A refused or missing channel leaves the others announcing; the panel keeps the alert either way.
        if (alertPreferencesReference.current.isNotificationEnabled) showRecordingAlertNotification(alert);
        if (alertPreferencesReference.current.isSoundEnabled) void playRecordingAlertSound(alert.severity);
        return alert;
    }, []);

    const changeAlertPreferences = useCallback((change: Partial<RecordingAlertPreferences>) => {
        const nextPreferences = { ...alertPreferencesReference.current, ...change };
        alertPreferencesReference.current = nextPreferences;
        saveRecordingAlertPreferences(nextPreferences);
        setAlertPreferences(nextPreferences);
    }, []);

    return {
        alerts, alertPreferences, notificationPermission, isAlertSoundSupported,
        announceFailure, changeAlertPreferences,
        announceTestAlert: useCallback(() => announceFailure(createRecordingTestFailure()), [announceFailure]),
        dismissAlert: useCallback((alertId: string) => setAlerts((previousAlerts) => previousAlerts.filter(({ id }) => id !== alertId)), []),
        dismissAllAlerts: useCallback(() => setAlerts([]), []),
        requestNotificationPermission: useCallback(async () => {
            const permission = await requestRecordingNotificationPermission();
            setNotificationPermission(permission);
            if (permission === 'granted') changeAlertPreferences({ isNotificationEnabled: true });
            return permission;
        }, [changeAlertPreferences]),
    };
}
