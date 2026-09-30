'use client';

import { Button } from '@/components/ui/button';
import type { RecordingNotificationPermission } from '@/lib/recording-studio/recordingStudioAlertNotification';
import type { RecordingAlertSeverity } from '@/lib/recording-studio/recordingStudioAlerts';
import { Bell, BellOff, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { useRecordingStudio } from './useRecordingStudio';

const NOTIFICATION_PERMISSION_LABELS: Record<RecordingNotificationPermission, string> = {
    granted: 'Upozornění prohlížeče jsou povolená; výstraha dorazí i mimo tuto kartu.',
    denied: 'Upozornění prohlížeče jsou zakázaná. Povolte je v nastavení webu, jinak zůstane jen zvuk a tato stránka.',
    default: 'Upozornění prohlížeče zatím nejsou povolená. Bez nich uvidíte výstrahu jen na této kartě.',
    unsupported: 'Tento prohlížeč upozornění nenabízí. Zůstává zvukový signál a tato stránka.',
};

const ALERT_SEVERITY_STYLES: Record<RecordingAlertSeverity, string> = {
    critical: 'border-red-300 bg-red-50 text-red-950',
    warning: 'border-amber-300 bg-amber-50 text-amber-950',
};

/**
 * Shows every failure of the studio, and the two channels which announce one outside this tab
 *
 * Note: The test button raises a real alert through the real channels, because the only useful moment to find out
 *       that the sound is muted or the notification refused is before a recording, never during one.
 */
export function RecordingAlertPanel({ studio }: { readonly studio: ReturnType<typeof useRecordingStudio> }) {
    const [isPermissionPending, setIsPermissionPending] = useState(false);
    const isNotificationRequestable = studio.notificationPermission === 'default';
    return <section aria-labelledby="recording-alerts-title" className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="recording-alerts-title" className="text-xl font-bold">Výstrahy při selhání {studio.alerts.length > 0 && <span className="ml-1 text-slate-400">{studio.alerts.length}</span>}</h2>
            <div className="flex flex-wrap gap-2">
                {isNotificationRequestable && <Button type="button" variant="outline" disabled={isPermissionPending} onClick={async () => {
                    setIsPermissionPending(true);
                    try { await studio.requestNotificationPermission(); } finally { setIsPermissionPending(false); }
                }}><Bell className="mr-2 h-4 w-4" />Povolit upozornění prohlížeče</Button>}
                <Button type="button" variant="outline" onClick={studio.announceTestAlert}><Volume2 className="mr-2 h-4 w-4" />Otestovat výstrahu</Button>
                {studio.alerts.length > 0 && <Button type="button" variant="outline" onClick={studio.dismissAllAlerts}>Skrýt všechny výstrahy</Button>}
            </div>
        </div>
        <p className="text-sm leading-6 text-slate-600">
            Selže-li cokoli během nahrávání, uslyšíte signál a dostanete upozornění prohlížeče, i když máte otevřenou jinou
            aplikaci. Ztráta jednoho zdroje zastaví jen jeho stopu a ostatní nahrávají dál; celý záznam se zastaví, až
            když nezbude co nahrávat nebo když selže ukládání.
        </p>
        <div className="flex flex-wrap items-center gap-5 text-sm">
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={studio.alertPreferences.isSoundEnabled} onChange={(event) => studio.changeAlertPreferences({ isSoundEnabled: event.target.checked })} />
                Zvukový signál
            </label>
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={studio.alertPreferences.isNotificationEnabled} disabled={studio.notificationPermission !== 'granted'} onChange={(event) => studio.changeAlertPreferences({ isNotificationEnabled: event.target.checked })} />
                Upozornění prohlížeče
            </label>
        </div>
        <p role="status" className="flex items-start gap-2 text-xs text-slate-600">
            {studio.notificationPermission === 'granted' ? <Bell className="mt-0.5 h-4 w-4 shrink-0" /> : <BellOff className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{NOTIFICATION_PERMISSION_LABELS[studio.notificationPermission]}{studio.isAlertSoundSupported ? '' : ' Zvukový signál tento prohlížeč nepřehraje.'} Volby se ukládají jen v tomto prohlížeči a profilu.</span>
        </p>
        {studio.alerts.length === 0
            ? <p className="text-sm text-slate-500">Zatím žádná výstraha. Tlačítkem výše si ověřte, že signál i upozornění opravdu dorazí.</p>
            : <ul role="log" aria-label="Historie výstrah" className="space-y-2">
                {studio.alerts.map((alert) => <li key={alert.id} className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3 text-sm ${ALERT_SEVERITY_STYLES[alert.severity]}`}>
                    <div className="min-w-0 space-y-1">
                        <p className="font-semibold">{alert.title}</p>
                        <p>{alert.message}</p>
                        <p className="text-xs opacity-80">{new Date(alert.occurredAt).toLocaleTimeString('cs-CZ')}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => studio.dismissAlert(alert.id)}>Skrýt</Button>
                </li>)}
            </ul>}
    </section>;
}
