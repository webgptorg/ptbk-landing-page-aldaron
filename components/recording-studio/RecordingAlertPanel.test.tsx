/**
 * @vitest-environment jsdom
 */

import type { RecordingAnnouncedAlert } from '@/lib/recording-studio/recordingStudioAlertDelivery';
import type { RecordingAlertNotificationStatus } from '@/lib/recording-studio/recordingStudioAlertNotification';
import { createRecordingAlert, createRecordingTestFailure, type RecordingFailure } from '@/lib/recording-studio/recordingStudioAlerts';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordingAlertPanel } from './RecordingAlertPanel';
import type { useRecordingStudio } from './useRecordingStudio';

type Studio = ReturnType<typeof useRecordingStudio>;

function announce(failure: RecordingFailure, notificationStatus: RecordingAlertNotificationStatus = 'displayed'): RecordingAnnouncedAlert {
    return { alert: createRecordingAlert(failure), delivery: { notification: { status: notificationStatus, detail: null }, sound: 'played' } };
}

/** Only what the panel reads. Everything else of the studio is none of its business, which this keeps honest. */
function createStudio(overrides: Partial<Studio> = {}): Studio {
    return {
        phase: 'idle', alerts: [], alertActivation: null, testAlert: { status: 'idle' },
        alertPreferences: { isSoundEnabled: true, isNotificationEnabled: true }, notificationPermission: 'granted', isAlertSoundSupported: true,
        startTestAlert: vi.fn(), cancelTestAlert: vi.fn(), changeAlertPreferences: vi.fn(), dismissAlert: vi.fn(), dismissAllAlerts: vi.fn(),
        requestNotificationPermission: vi.fn(async () => 'granted' as const),
        ...overrides,
    } as Studio;
}

afterEach(cleanup);

describe('the test of the alert channels as the administrator sees it', () => {
    it('offers the test and shows no countdown while none is pending', () => {
        const studio = createStudio();
        render(<RecordingAlertPanel studio={studio} isTakeRunning={false} />);

        const testButton = screen.getByRole('button', { name: 'Otestovat výstrahu' });
        expect(testButton).toHaveProperty('disabled', false);
        expect(screen.queryByRole('group', { name: 'Zkouška výstrahy' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Zrušit test' })).toBeNull();

        fireEvent.click(testButton);
        expect(studio.startTestAlert).toHaveBeenCalledTimes(1);
    });

    it('shows the remaining time, says where to go meanwhile and lets the test be called off', () => {
        const studio = createStudio({ testAlert: { status: 'counting', remainingSeconds: 4 } });
        render(<RecordingAlertPanel studio={studio} isTakeRunning={false} />);

        const notice = within(screen.getByRole('group', { name: 'Zkouška výstrahy' }));
        expect(notice.getByRole('timer').textContent).toBe('Zbývá 4 s');
        expect(notice.getByText(/Přepněte teď na jinou kartu, do jiné aplikace nebo na jinou plochu/)).toBeTruthy();
        // A countdown which cannot keep its word about a moment says so rather than promising one.
        expect(notice.getByText(/může přijít o chvíli později; během spánku počítače nebo po zavření prohlížeče nepřijde/)).toBeTruthy();
        // A second click must have nothing to press.
        expect(screen.getByRole('button', { name: 'Otestovat výstrahu' })).toHaveProperty('disabled', true);

        fireEvent.click(notice.getByRole('button', { name: 'Zrušit test' }));
        expect(studio.cancelTestAlert).toHaveBeenCalledTimes(1);
    });

    it('says the countdown has not started yet while the browser is still asking about permission', () => {
        render(<RecordingAlertPanel studio={createStudio({ testAlert: { status: 'awaiting-permission' }, notificationPermission: 'default' })} isTakeRunning={false} />);

        const notice = within(screen.getByRole('group', { name: 'Zkouška výstrahy' }));
        expect(notice.getByText(/Prohlížeč se ptá, zda smí posílat upozornění\. Odpovězte mu; odpočet 5 s začne až potom\./)).toBeTruthy();
        expect(notice.queryByRole('timer')).toBeNull();
        expect(notice.getByRole('button', { name: 'Zrušit test' })).toBeTruthy();
        // One question at a time: the explicit permission button would ask the browser the very same thing.
        expect(screen.getByRole('button', { name: 'Povolit upozornění prohlížeče' })).toHaveProperty('disabled', true);
    });

    it('warns that a test during a recording can be heard and seen by that recording, and changes nothing else', () => {
        render(<RecordingAlertPanel studio={createStudio({ testAlert: { status: 'counting', remainingSeconds: 5 } })} isTakeRunning />);

        expect(screen.getByText(/Právě se nahrává: zkušební signál může zachytit mikrofon/)).toBeTruthy();
        cleanup();
        render(<RecordingAlertPanel studio={createStudio({ testAlert: { status: 'counting', remainingSeconds: 5 } })} isTakeRunning={false} />);
        expect(screen.queryByText(/Právě se nahrává/)).toBeNull();
    });

    it('offers no test in a studio which cannot act', () => {
        render(<RecordingAlertPanel studio={createStudio({ phase: 'unavailable' })} isTakeRunning={false} />);

        expect(screen.getByRole('button', { name: 'Otestovat výstrahu' })).toHaveProperty('disabled', true);
    });
});

describe('what the panel says about the notification channel', () => {
    it('promises nothing beyond the browser, even with the permission granted', () => {
        render(<RecordingAlertPanel studio={createStudio()} isTakeRunning={false} />);

        expect(screen.getByText(/Prohlížeč má oprávnění upozornění posílat\. Jestli je uvidíte, rozhoduje ještě systém/)).toBeTruthy();
        expect(screen.getByText(/Systém upozornění skryje nebo odloží v režimu Soustředění či Nerušit/)).toBeTruthy();
        expect(screen.getByText(/Zvukový signál na oznámeních systému nezávisí/)).toBeTruthy();
        expect(document.body.textContent).not.toMatch(/výstraha dorazí i mimo tuto kartu|dostanete upozornění prohlížeče, i když/);
    });

    it('keeps the explicit permission button for a browser which was never asked', () => {
        const studio = createStudio({ notificationPermission: 'default' });
        render(<RecordingAlertPanel studio={studio} isTakeRunning={false} />);

        expect(screen.getByText(/Prohlížeč zatím nemá oprávnění upozornění posílat/)).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Povolit upozornění prohlížeče' }));
        expect(studio.requestNotificationPermission).toHaveBeenCalledTimes(1);
    });

    it('tells a forbidden, an unsupported, a switched-off and a failed channel apart', () => {
        render(<RecordingAlertPanel studio={createStudio({ notificationPermission: 'denied' })} isTakeRunning={false} />);
        expect(screen.getByText(/Upozornění jsou pro tento web v prohlížeči zakázaná/)).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Povolit upozornění prohlížeče' })).toBeNull();
        cleanup();

        render(<RecordingAlertPanel studio={createStudio({ notificationPermission: 'unsupported' })} isTakeRunning={false} />);
        expect(screen.getByText(/Tento prohlížeč upozornění nenabízí/)).toBeTruthy();
        expect(screen.getByRole('checkbox', { name: 'Upozornění prohlížeče' })).toHaveProperty('disabled', true);
        cleanup();

        render(<RecordingAlertPanel studio={createStudio({ alertPreferences: { isSoundEnabled: true, isNotificationEnabled: false } })} isTakeRunning={false} />);
        expect(screen.getByText(/Upozornění prohlížeče máte ve studiu vypnutá/)).toBeTruthy();
        cleanup();

        render(<RecordingAlertPanel studio={createStudio({ alerts: [announce({ impact: 'recording-stopped', message: 'Disk je plný.' }, 'dispatch-failed')] })} isTakeRunning={false} />);
        expect(screen.getByText(/Poslední upozornění prohlížeč nedokázal odeslat/)).toBeTruthy();
    });

    it('lets each channel be turned off without the other, whatever the permission is', () => {
        const studio = createStudio({ notificationPermission: 'default' });
        render(<RecordingAlertPanel studio={studio} isTakeRunning={false} />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Upozornění prohlížeče' }));
        expect(studio.changeAlertPreferences).toHaveBeenLastCalledWith({ isNotificationEnabled: false });
        fireEvent.click(screen.getByRole('checkbox', { name: 'Zvukový signál' }));
        expect(studio.changeAlertPreferences).toHaveBeenLastCalledWith({ isSoundEnabled: false });
    });
});

describe('the history of alerts', () => {
    it('paints a test unlike a stopped recording or a lost source, and says what became of each on the way out', () => {
        const alerts = [
            announce(createRecordingTestFailure(), 'activated'),
            announce({ impact: 'recording-stopped', message: 'Disk je plný.' }, 'permission-denied'),
            announce({ impact: 'recording-continues', sourceLabel: 'App', message: 'Zdroj byl odpojen.' }, 'displayed'),
        ];
        render(<RecordingAlertPanel studio={createStudio({ alerts })} isTakeRunning={false} />);

        const [testRow, stoppedRow, lostSourceRow] = within(screen.getByRole('log', { name: 'Historie výstrah' })).getAllByRole('listitem');
        expect(testRow.textContent).toContain('Zkouška výstrahy studia · nic se nepokazilo');
        expect(new Set([testRow.className, stoppedRow.className, lostSourceRow.className]).size).toBe(3);

        expect(within(testRow).getByTestId('recording-alert-delivery').textContent).toContain('doručeno, otevřeli jste je kliknutím');
        expect(within(stoppedRow).getByTestId('recording-alert-delivery').textContent).toContain('pro tento web je v prohlížeči zakázané');
        expect(within(lostSourceRow).getByTestId('recording-alert-delivery').textContent).toContain('krátký banner');
        // The sound has its own sentence in every row: a refused notification never hides what the other channel did.
        expect(within(stoppedRow).getByTestId('recording-alert-delivery').textContent).toContain('Zvuk: prohlížeč signál přehrál');
    });

    it('brings the administrator to the alert whose notification they clicked', () => {
        const alerts = [announce({ impact: 'recording-stopped', message: 'Disk je plný.' }), announce({ impact: 'recording-continues', message: 'Zdroj byl odpojen.' })];
        const { rerender } = render(<RecordingAlertPanel studio={createStudio({ alerts })} isTakeRunning={false} />);
        const rows = within(screen.getByRole('log', { name: 'Historie výstrah' })).getAllByRole('listitem');
        expect(document.activeElement).not.toBe(rows[1]);

        rerender(<RecordingAlertPanel studio={createStudio({ alerts, alertActivation: { alertId: alerts[1].alert.id, activationNumber: 1 } })} isTakeRunning={false} />);

        expect(document.activeElement).toBe(rows[1]);
    });
});
