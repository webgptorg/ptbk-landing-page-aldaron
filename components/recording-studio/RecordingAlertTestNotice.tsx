'use client';

import { Button } from '@/components/ui/button';
import { RECORDING_ALERT_TEST_COUNTDOWN_MILLISECONDS, type RecordingAlertTestState } from '@/lib/recording-studio/recordingStudioAlertTest';

const COUNTDOWN_SECONDS = RECORDING_ALERT_TEST_COUNTDOWN_MILLISECONDS / 1000;

/**
 * Says what a pending test of the alert channels is waiting for, and lets the administrator call it off
 *
 * Note: The remaining time is a timer rather than a live region, so that a screen reader says the instruction once
 *       and is not made to read a number aloud every second.
 *
 * Note: It promises a test, not a moment. A browser slows a hidden tab down, and it runs nothing while the computer
 *       sleeps or after it was closed, so the notice says so instead of the countdown pretending otherwise.
 */
export function RecordingAlertTestNotice({ testAlert, isTakeRunning, onCancel }: {
    readonly testAlert: RecordingAlertTestState;
    readonly isTakeRunning: boolean;
    readonly onCancel: () => void;
}) {
    if (testAlert.status === 'idle') {
        return null;
    }

    return <div role="group" aria-label="Zkouška výstrahy" className="space-y-2 rounded-lg border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-950">
        {testAlert.status === 'awaiting-permission'
            ? <>
                <p role="status" className="font-semibold">Prohlížeč se ptá, zda smí posílat upozornění. Odpovězte mu; odpočet {COUNTDOWN_SECONDS} s začne až potom.</p>
                <p className="text-xs leading-5">Nevidíte-li žádnou otázku, hledejte ji u adresy stránky. Některé prohlížeče ji ukážou jen jako malou ikonu.</p>
            </>
            : <>
                <p role="status" className="font-semibold">Zkouška výstrahy běží. Přepněte teď na jinou kartu, do jiné aplikace nebo na jinou plochu a počkejte na signál a upozornění.</p>
                <p role="timer" aria-live="off" className="text-2xl font-semibold tabular-nums">Zbývá {testAlert.remainingSeconds} s</p>
                <p className="text-xs leading-5">Odchod z této karty zkoušku neruší. Prohlížeč může kartu na pozadí zpomalit, takže zkouška může přijít o chvíli později; během spánku počítače nebo po zavření prohlížeče nepřijde.</p>
                {isTakeRunning && <p className="text-xs leading-5">Právě se nahrává: zkušební signál může zachytit mikrofon a upozornění se může objevit na nahrávané obrazovce. Záznam se zkouškou nezastaví ani nezmění.</p>}
            </>}
        <Button type="button" variant="outline" onClick={onCancel}>Zrušit test</Button>
    </div>;
}
