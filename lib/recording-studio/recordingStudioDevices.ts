import type { RecordingSource, RecordingSourceKind } from './recordingStudioTypes';

const VIDEO_CAPTURE_CONSTRAINTS: MediaTrackConstraints = { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } };

export function releaseRecordingSource(source: RecordingSource): void {
    source.stream.getTracks().forEach((track) => track.stop());
}

/** Call directly from the Add button: screen selection needs the browser's transient user gesture. */
export async function acquireRecordingSource(kind: RecordingSourceKind, deviceId: string): Promise<RecordingSource> {
    const stream = kind === 'screen'
        ? await navigator.mediaDevices.getDisplayMedia({ video: VIDEO_CAPTURE_CONSTRAINTS, audio: true })
        : await navigator.mediaDevices.getUserMedia(kind === 'camera'
            ? { video: { ...VIDEO_CAPTURE_CONSTRAINTS, ...(deviceId ? { deviceId: { exact: deviceId } } : {}) }, audio: false }
            : { video: false, audio: deviceId ? { deviceId: { exact: deviceId } } : true });
    const track = kind === 'microphone' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
    if (!track) {
        stream.getTracks().forEach((streamTrack) => streamTrack.stop());
        throw new Error('Vybraný zdroj neposkytl požadovanou stopu.');
    }
    return { id: crypto.randomUUID(), kind, label: track.label || { camera: 'Kamera', screen: 'Obrazovka', microphone: 'Mikrofon' }[kind], stream };
}

export function getRecordingErrorMessage(error: unknown): string {
    if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') return 'Přístup nebyl povolen nebo byl výběr zrušen. Zdroj můžete přidat znovu.';
        if (error.name === 'NotReadableError') return 'Zdroj nelze otevřít. Zkontrolujte, zda ho nepoužívá jiná aplikace.';
        if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') return 'Vybrané zařízení není dostupné. Zkuste jiné.';
        if (error.name === 'QuotaExceededError') return 'Úložiště prohlížeče je plné. Uložené části záznamu zůstávají dostupné.';
    }
    return error instanceof Error ? error.message : 'Operace se nezdařila. Zkuste ji znovu.';
}
