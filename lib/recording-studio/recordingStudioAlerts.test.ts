/**
 * @vitest-environment jsdom
 */

import {
    appendRecordingAlert, createRecordingAlert, createRecordingTestFailure, DEFAULT_ALERT_PREFERENCES, describeRecordingAlertTitle,
    getRecordingAlertSeverity, loadRecordingAlertPreferences, RECORDING_ALERT_HISTORY_LIMIT, saveRecordingAlertPreferences,
    type RecordingAlert,
} from './recordingStudioAlerts';
import { afterEach, describe, expect, it } from 'vitest';

const ALERT_PREFERENCES_KEY = 'promptbook-recording-studio-alerts-v1';

describe('studio failures announced to an administrator who is not watching the tab', () => {
    afterEach(() => window.localStorage.clear());

    it('says whether the recording survived the failure, because that decides whether to run back', () => {
        expect(describeRecordingAlertTitle({ impact: 'recording-continues', sourceLabel: 'App', message: '' }))
            .toBe('Zdroj „App“ selhal · záznam pokračuje');
        expect(describeRecordingAlertTitle({ impact: 'recording-stopped', sourceLabel: 'App', message: '' }))
            .toBe('Zdroj „App“ selhal · záznam se zastavil');
        expect(describeRecordingAlertTitle({ impact: 'recording-stopped', message: '' })).toBe('Nahrávání se zastavilo');
        expect(describeRecordingAlertTitle({ impact: 'no-recording', message: '' })).toBe('Chyba nahrávacího studia');
        expect(describeRecordingAlertTitle(createRecordingTestFailure())).toBe('Zkušební výstraha nahrávacího studia');
    });

    it('sounds the loud alarm only where something is no longer being recorded', () => {
        expect(getRecordingAlertSeverity('recording-stopped')).toBe('critical');
        expect(getRecordingAlertSeverity('test')).toBe('critical');
        expect(getRecordingAlertSeverity('recording-continues')).toBe('warning');
        expect(getRecordingAlertSeverity('no-recording')).toBe('warning');
    });

    it('describes one failure once for every channel which announces it', () => {
        const alert = createRecordingAlert({ impact: 'recording-continues', message: 'Zdroj byl odpojen.', sourceId: 'screen-1', sourceLabel: 'App' }, 1_700_000_000_000);
        expect(alert).toMatchObject({
            severity: 'warning', title: 'Zdroj „App“ selhal · záznam pokračuje',
            message: 'Zdroj byl odpojen.', sourceId: 'screen-1', sourceLabel: 'App', occurredAt: 1_700_000_000_000,
        });
        expect(alert.id).not.toBe(createRecordingAlert({ impact: 'recording-continues', message: 'Zdroj byl odpojen.' }).id);
    });

    it('keeps the newest failures readable without letting a flapping device grow without a bound', () => {
        const alerts = Array.from({ length: RECORDING_ALERT_HISTORY_LIMIT + 5 })
            .reduce<readonly RecordingAlert[]>((previous, _unused, index) =>
                appendRecordingAlert(previous, createRecordingAlert({ impact: 'recording-continues', message: `Selhání ${index}` })), []);
        expect(alerts).toHaveLength(RECORDING_ALERT_HISTORY_LIMIT);
        expect(alerts[0].message).toBe(`Selhání ${RECORDING_ALERT_HISTORY_LIMIT + 4}`);
    });

    it('announces through both channels for an administrator who never opened these settings', () => {
        expect(loadRecordingAlertPreferences()).toEqual(DEFAULT_ALERT_PREFERENCES);
        saveRecordingAlertPreferences({ isSoundEnabled: false, isNotificationEnabled: true });
        expect(loadRecordingAlertPreferences()).toEqual({ isSoundEnabled: false, isNotificationEnabled: true });
    });

    it('falls back to announcing when the remembered settings cannot be read', () => {
        window.localStorage.setItem(ALERT_PREFERENCES_KEY, 'not json at all');
        expect(loadRecordingAlertPreferences()).toEqual(DEFAULT_ALERT_PREFERENCES);
        window.localStorage.setItem(ALERT_PREFERENCES_KEY, JSON.stringify({ isSoundEnabled: 'yes' }));
        expect(loadRecordingAlertPreferences()).toEqual(DEFAULT_ALERT_PREFERENCES);
    });
});
