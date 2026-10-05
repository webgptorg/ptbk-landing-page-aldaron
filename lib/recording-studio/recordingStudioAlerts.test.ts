/**
 * @vitest-environment jsdom
 */

import {
    appendRecordingAlert, createRecordingAlert, createRecordingTestFailure, DEFAULT_ALERT_PREFERENCES, describeRecordingAlertTitle,
    getRecordingAlertSeverity, isRecordingAlertKeptOnScreen, loadRecordingAlertPreferences, RECORDING_ALERT_HISTORY_LIMIT,
    saveRecordingAlertPreferences, type RecordingAlert, type RecordingAlertImpact,
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
    });

    it('words a test so that neither its first words nor its message can be read as a loss', () => {
        const REAL_IMPACTS: readonly RecordingAlertImpact[] = ['recording-continues', 'recording-kept', 'recording-stopped', 'no-recording'];
        const testFailure = createRecordingTestFailure();
        const testTitle = describeRecordingAlertTitle(testFailure);

        expect(testTitle).toBe('Zkouška výstrahy studia · nic se nepokazilo');
        expect(testFailure.message).toContain('Toto je jen zkouška');
        expect(testFailure.message).toContain('žádný záznam se nezastavil');
        for (const impact of REAL_IMPACTS) {
            for (const sourceLabel of ['App', undefined]) {
                const realTitle = describeRecordingAlertTitle({ impact, sourceLabel, message: '' });
                expect(realTitle).not.toBe(testTitle);
                expect(realTitle).not.toContain('Zkouška');
            }
        }
    });

    it('says how late a test ran out only when a throttled tab made that worth saying', () => {
        expect(createRecordingTestFailure(0).message).not.toContain('později');
        // About a second is what an ordinary hidden tab costs; saying it every time would teach nobody anything.
        expect(createRecordingTestFailure(900).message).not.toContain('později');
        expect(createRecordingTestFailure(3_400).message).toContain('Odpočet doběhl o 3 s později');
    });

    it('says when a whole take was saved and only needs work done to it', () => {
        expect(describeRecordingAlertTitle({ impact: 'recording-kept', sourceLabel: 'App', message: '' }))
            .toBe('Zdroj „App“ je uložený · potřebuje opravu');
        expect(describeRecordingAlertTitle({ impact: 'recording-kept', message: '' })).toBe('Záznam je uložený · potřebuje opravu');
        expect(getRecordingAlertSeverity('recording-kept')).toBe('warning');
    });

    it('sounds the loud alarm only where something is no longer being recorded', () => {
        expect(getRecordingAlertSeverity('recording-stopped')).toBe('critical');
        expect(getRecordingAlertSeverity('recording-continues')).toBe('warning');
        expect(getRecordingAlertSeverity('no-recording')).toBe('warning');
    });

    it('gives a test a level of its own, so it is never painted or sounded as a failure', () => {
        expect(getRecordingAlertSeverity('test')).toBe('test');
        expect(createRecordingAlert(createRecordingTestFailure()).severity).toBe('test');
    });

    it('keeps on the screen only the notification of a recording which is no longer running', () => {
        // What a real failure did to the take decides, whatever the studio is doing by the time it is announced.
        for (const isTakeRunning of [true, false]) {
            expect(isRecordingAlertKeptOnScreen('recording-stopped', isTakeRunning)).toBe(true);
            expect(isRecordingAlertKeptOnScreen('recording-continues', isTakeRunning)).toBe(false);
            expect(isRecordingAlertKeptOnScreen('recording-kept', isTakeRunning)).toBe(false);
            expect(isRecordingAlertKeptOnScreen('no-recording', isTakeRunning)).toBe(false);
        }
    });

    it('lets a test rehearse the waiting notification before a recording and the passing one during it', () => {
        expect(isRecordingAlertKeptOnScreen('test', false)).toBe(true);
        expect(isRecordingAlertKeptOnScreen('test', true)).toBe(false);
        expect(createRecordingAlert(createRecordingTestFailure(), 1_700_000_000_000, false).isKeptOnScreen).toBe(true);
        expect(createRecordingAlert(createRecordingTestFailure(), 1_700_000_000_000, true).isKeptOnScreen).toBe(false);
        expect(createRecordingAlert({ impact: 'recording-stopped', message: '' }, 1_700_000_000_000, true).isKeptOnScreen).toBe(true);
    });

    it('describes one failure once for every channel which announces it', () => {
        const alert = createRecordingAlert({ impact: 'recording-continues', message: 'Zdroj byl odpojen.', sourceId: 'screen-1', sourceLabel: 'App' }, 1_700_000_000_000);
        expect(alert).toMatchObject({
            severity: 'warning', title: 'Zdroj „App“ selhal · záznam pokračuje', isKeptOnScreen: false,
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
