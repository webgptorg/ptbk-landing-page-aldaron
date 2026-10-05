'use client';

import { Button } from '@/components/ui/button';
import {
    describeRecordingAlertNotification, describeRecordingAlertSound, describeRecordingNotificationChannel, getRecordingNotificationChannelState,
} from '@/lib/recording-studio/recordingStudioAlertDelivery';
import type { RecordingAlertSeverity } from '@/lib/recording-studio/recordingStudioAlerts';
import { Bell, BellOff, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { RecordingAlertTestNotice } from './RecordingAlertTestNotice';
import type { useRecordingStudio } from './useRecordingStudio';

const ALERT_SEVERITY_STYLES: Record<RecordingAlertSeverity, string> = {
    critical: 'border-red-300 bg-red-50 text-red-950',
    warning: 'border-amber-300 bg-amber-50 text-amber-950',
    test: 'border-cyan-300 bg-cyan-50 text-cyan-950',
};

function getAlertElementId(alertId: string): string {
    return `recording-alert-${alertId}`;
}

/**
 * Shows every failure of the studio, and the two channels which announce one outside this tab
 *
 * Note: The test raises a real alert through the real channels, because the only useful moment to find out that the
 *       sound is muted or the notification refused is before a recording, never during one. It fires after a
 *       countdown, so that the administrator can first go where they will be while recording.
 *
 * Note: Nothing here says an alert was seen or heard. The browser tells the studio that it took a notification and
 *       that it played a sound; whether either reached anybody is decided by the system, so the panel says what is
 *       known, names what decides the rest, and treats only a clicked notification as delivered.
 *
 * @param isTakeRunning whether the studio is busy with a take, as the studio page around this panel already knows
 */
export function RecordingAlertPanel({ studio, isTakeRunning }: {
    readonly studio: ReturnType<typeof useRecordingStudio>;
    readonly isTakeRunning: boolean;
}) {
    const [isPermissionPending, setIsPermissionPending] = useState(false);
    const panelReference = useRef<HTMLElement>(null);
    const isTestPending = studio.testAlert.status !== 'idle';
    const isNotificationRequestable = studio.notificationPermission === 'default';
    const notificationChannelState = getRecordingNotificationChannelState({
        permission: studio.notificationPermission,
        isNotificationEnabled: studio.alertPreferences.isNotificationEnabled,
        latestStatus: studio.alerts[0]?.delivery.notification.status ?? null,
    });

    // A clicked notification brings the administrator to the alert it was about, not merely to the tab it came from.
    useEffect(() => {
        if (studio.alertActivation === null) return;
        const alertElement = document.getElementById(getAlertElementId(studio.alertActivation.alertId)) ?? panelReference.current;
        alertElement?.scrollIntoView?.({ block: 'center' });
        alertElement?.focus({ preventScroll: true });
    }, [studio.alertActivation]);

    return <section ref={panelReference} tabIndex={-1} aria-labelledby="recording-alerts-title" className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="recording-alerts-title" className="text-xl font-bold">Výstrahy při selhání {studio.alerts.length > 0 && <span className="ml-1 text-slate-400">{studio.alerts.length}</span>}</h2>
            <div className="flex flex-wrap gap-2">
                {isNotificationRequestable && <Button type="button" variant="outline" disabled={isPermissionPending || isTestPending} onClick={async () => {
                    setIsPermissionPending(true);
                    try { await studio.requestNotificationPermission(); } finally { setIsPermissionPending(false); }
                }}><Bell className="mr-2 h-4 w-4" />Povolit upozornění prohlížeče</Button>}
                <Button type="button" variant="outline" disabled={isTestPending || studio.phase === 'unavailable'} onClick={studio.startTestAlert}><Volume2 className="mr-2 h-4 w-4" />Otestovat výstrahu</Button>
                {studio.alerts.length > 0 && <Button type="button" variant="outline" onClick={studio.dismissAllAlerts}>Skrýt všechny výstrahy</Button>}
            </div>
        </div>
        <RecordingAlertTestNotice testAlert={studio.testAlert} isTakeRunning={isTakeRunning} onCancel={studio.cancelTestAlert} />
        <p className="text-sm leading-6 text-slate-600">
            Selže-li cokoli během nahrávání, studio to ohlásí na této stránce, zvukovým signálem a upozorněním prohlížeče,
            protože při nahrávání obvykle pracujete v jiné aplikaci. Ztráta jednoho zdroje zastaví jen jeho stopu a ostatní
            nahrávají dál; celý záznam se zastaví, až když nezbude co nahrávat nebo když selže ukládání.
        </p>
        <div className="flex flex-wrap items-center gap-5 text-sm">
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={studio.alertPreferences.isSoundEnabled} onChange={(event) => studio.changeAlertPreferences({ isSoundEnabled: event.target.checked })} />
                Zvukový signál
            </label>
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={studio.alertPreferences.isNotificationEnabled} disabled={studio.notificationPermission === 'unsupported'} onChange={(event) => studio.changeAlertPreferences({ isNotificationEnabled: event.target.checked })} />
                Upozornění prohlížeče
            </label>
        </div>
        <p role="status" className="flex items-start gap-2 text-xs leading-5 text-slate-600">
            {notificationChannelState === 'ready' ? <Bell className="mt-0.5 h-4 w-4 shrink-0" /> : <BellOff className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{describeRecordingNotificationChannel(notificationChannelState)}{studio.isAlertSoundSupported ? '' : ' Zvukový signál tento prohlížeč nepřehraje.'} Volby se ukládají jen v tomto prohlížeči a profilu.</span>
        </p>
        <details className="text-xs leading-5 text-slate-600">
            <summary className="cursor-pointer font-medium">Proč upozornění nemusí být vidět, i když je prohlížeč odeslal</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Studio ví jen to, že prohlížeč upozornění přijal. O tom, jestli se objeví na obrazovce, rozhoduje systém a stránce to neřekne; že jste je opravdu viděli, potvrdí až kliknutí na ně.</li>
                <li>Systém upozornění skryje nebo odloží v režimu Soustředění či Nerušit a při vypnutých oznámeních prohlížeče v nastavení systému. V macOS může záležet i na volbě oznámení při zrcadlení nebo sdílení displeje.</li>
                <li>Výstraha zastaveného záznamu zůstává na obrazovce, dokud ji nezavřete. Ztráta zdroje během běžícího záznamu je krátký banner, aby nezakryl nahrávanou obrazovku; zkouška se řídí stejně, takže před nahráváním zkouší první podobu a během něj druhou. V macOS má každá podoba v Nastavení systému → Oznámení vlastní položku, u Chromu „Google Chrome Helper (Alerts)“ a „Google Chrome“.</li>
                <li>Zvukový signál na oznámeních systému nezávisí. Uslyšíte ho, pokud není ztlumený počítač, výstupní zařízení ani tento web.</li>
                <li>Zkoušku proto spusťte ve stejné situaci, v jaké budete nahrávat: se stejným režimem Soustředění a se sdílenou obrazovkou.</li>
            </ul>
        </details>
        {studio.alerts.length === 0
            ? <p className="text-sm text-slate-500">Zatím žádná výstraha. Zkouškou výše si ověřte, jestli k vám signál i upozornění dorazí tam, kde budete při nahrávání pracovat.</p>
            : <ul role="log" aria-label="Historie výstrah" className="space-y-2">
                {studio.alerts.map((announcedAlert) => {
                    const { alert, delivery } = announcedAlert;
                    return <li key={alert.id} id={getAlertElementId(alert.id)} tabIndex={-1} className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3 text-sm ${ALERT_SEVERITY_STYLES[alert.severity]}`}>
                        <div className="min-w-0 space-y-1">
                            <p className="font-semibold">{alert.title}</p>
                            <p>{alert.message}</p>
                            <p className="text-xs opacity-80">{new Date(alert.occurredAt).toLocaleTimeString('cs-CZ')}</p>
                            <p className="text-xs opacity-80" data-testid="recording-alert-delivery">{describeRecordingAlertNotification(announcedAlert)} {describeRecordingAlertSound(delivery.sound)}</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => studio.dismissAlert(alert.id)}>Skrýt</Button>
                    </li>;
                })}
            </ul>}
    </section>;
}
