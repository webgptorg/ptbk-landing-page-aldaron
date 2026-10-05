import type { RecordingAlertNotificationReport, RecordingAlertNotificationStatus, RecordingNotificationPermission } from './recordingStudioAlertNotification';
import type { RecordingAlertSoundStatus } from './recordingStudioAlertSound';
import type { RecordingAlert } from './recordingStudioAlerts';

/**
 * What each channel is known to have done with one alert
 *
 * Note: It keeps changing after the alert was announced — a sound finishes, a browser reports a notification, the
 *       administrator clicks it — which is why it is kept beside the alert rather than inside it.
 */
export type RecordingAlertDelivery = {
    readonly notification: RecordingAlertNotificationReport;
    readonly sound: RecordingAlertSoundStatus;
};

/** One alert of the history, beside what became of it on its way out of the tab. */
export type RecordingAnnouncedAlert = {
    readonly alert: RecordingAlert;
    readonly delivery: RecordingAlertDelivery;
};

/**
 * Records a later answer of one channel about one alert
 *
 * Note: An answer about an alert which was dismissed in the meantime changes nothing, and is not an error.
 */
export function updateRecordingAlertDelivery(
    announcedAlerts: readonly RecordingAnnouncedAlert[],
    alertId: string,
    change: Partial<RecordingAlertDelivery>,
): readonly RecordingAnnouncedAlert[] {
    return announcedAlerts.map((announcedAlert) => announcedAlert.alert.id === alertId
        ? { ...announcedAlert, delivery: { ...announcedAlert.delivery, ...change } }
        : announcedAlert);
}

/**
 * Whether the notification channel would carry the next alert, and if not, the one reason why
 *
 * Note: `ready` promises a dispatch and nothing after it. What the system does with a notification the browser
 *       accepted is not something a page can read.
 */
export type RecordingNotificationChannelState = 'unsupported' | 'disabled' | 'permission-denied' | 'permission-missing' | 'dispatch-failed' | 'ready';

export function getRecordingNotificationChannelState({ permission, isNotificationEnabled, latestStatus }: {
    readonly permission: RecordingNotificationPermission;
    readonly isNotificationEnabled: boolean;
    /** What became of the notification of the newest alert, if there is one. */
    readonly latestStatus: RecordingAlertNotificationStatus | null;
}): RecordingNotificationChannelState {
    if (permission === 'unsupported') return 'unsupported';
    if (!isNotificationEnabled) return 'disabled';
    if (permission === 'denied') return 'permission-denied';
    if (permission === 'default') return 'permission-missing';
    return latestStatus === 'dispatch-failed' ? 'dispatch-failed' : 'ready';
}

const NOTIFICATION_CHANNEL_LABELS: Record<RecordingNotificationChannelState, string> = {
    unsupported: 'Tento prohlížeč upozornění nenabízí. Zůstává zvukový signál a tato stránka.',
    disabled: 'Upozornění prohlížeče máte ve studiu vypnutá. Zůstává zvukový signál a tato stránka.',
    'permission-denied': 'Upozornění jsou pro tento web v prohlížeči zakázaná. Povolte je v nastavení webu u adresy stránky; po návratu se tu stav sám obnoví. Do té doby zůstává zvukový signál a tato stránka.',
    'permission-missing': 'Prohlížeč zatím nemá oprávnění upozornění posílat. Požádejte o ně tlačítkem výše; bez něj zůstává zvukový signál a tato stránka.',
    'dispatch-failed': 'Poslední upozornění prohlížeč nedokázal odeslat, přestože k tomu má oprávnění. Zkontrolujte nastavení oznámení a zkoušku zopakujte.',
    ready: 'Prohlížeč má oprávnění upozornění posílat. Jestli je uvidíte, rozhoduje ještě systém, proto to ověřte zkouškou.',
};

export function describeRecordingNotificationChannel(state: RecordingNotificationChannelState): string {
    return NOTIFICATION_CHANNEL_LABELS[state];
}

const NOTIFICATION_STATUS_LABELS: Record<RecordingAlertNotificationStatus, string> = {
    disabled: 'Upozornění: vypnuto v nastavení studia.',
    unsupported: 'Upozornění: tento prohlížeč je nenabízí.',
    'permission-missing': 'Upozornění: neodesláno, prohlížeč k němu zatím nemá oprávnění.',
    'permission-denied': 'Upozornění: neodesláno, pro tento web je v prohlížeči zakázané.',
    'dispatch-failed': 'Upozornění: prohlížeč je nedokázal odeslat.',
    dispatched: 'Upozornění: prohlížeč je přijal, zobrazení zatím nepotvrdil.',
    displayed: 'Upozornění: prohlížeč je předal systému; jestli se objevilo na obrazovce, rozhodl systém.',
    activated: 'Upozornění: doručeno, otevřeli jste je kliknutím.',
};

const NOTIFICATION_SENT_STATUSES: readonly RecordingAlertNotificationStatus[] = ['dispatched', 'displayed', 'activated'];

/**
 * Says in one sentence how far the notification of one alert got
 *
 * Note: A sent notification also says which of its two forms it took, because the system delivers them separately
 *       and a missing one is looked for in a different place.
 */
export function describeRecordingAlertNotification({ alert, delivery }: RecordingAnnouncedAlert): string {
    const { status, detail } = delivery.notification;
    const label = NOTIFICATION_STATUS_LABELS[status];
    if (status === 'dispatch-failed' && detail !== null) {
        return `${label} Prohlížeč k tomu říká: ${detail}`;
    }
    if (NOTIFICATION_SENT_STATUSES.includes(status)) {
        return `${label} ${alert.isKeptOnScreen ? 'Podoba: zůstává na obrazovce, dokud je nezavřete.' : 'Podoba: krátký banner, který systém sám skryje.'}`;
    }
    return label;
}

const SOUND_STATUS_LABELS: Record<RecordingAlertSoundStatus, string> = {
    disabled: 'Zvuk: vypnut v nastavení studia.',
    unsupported: 'Zvuk: tento prohlížeč ho nepřehraje.',
    pending: 'Zvuk: přehrává se.',
    played: 'Zvuk: prohlížeč signál přehrál; slyšet je jen při zapnuté hlasitosti počítače a tohoto webu.',
    blocked: 'Zvuk: prohlížeč přehrání nepovolil. Klikněte kamkoli na tuto stránku a zkoušku zopakujte.',
};

export function describeRecordingAlertSound(status: RecordingAlertSoundStatus): string {
    return SOUND_STATUS_LABELS[status];
}
