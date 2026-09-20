'use client';

import { Button } from '@/components/ui/button';
import { getRecordingErrorMessage } from '@/lib/recording-studio/recordingStudioDevices';
import type { RecordingSourceKind } from '@/lib/recording-studio/recordingStudioTypes';
import { useEffect, useState } from 'react';

export function RecordingSourcePicker({ onAdd, onClose }: {
    readonly onAdd: (kind: RecordingSourceKind, deviceId: string) => Promise<void>;
    readonly onClose: () => void;
}) {
    const [kind, setKind] = useState<RecordingSourceKind>('camera');
    const [deviceId, setDeviceId] = useState('');
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    useEffect(() => {
        void navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => undefined);
    }, []);
    const matchingDevices = devices.filter((device) => device.kind === (kind === 'camera' ? 'videoinput' : 'audioinput'));
    return (
        <form className="space-y-5" onSubmit={(event) => {
            event.preventDefault();
            if (isAdding) return;
            setIsAdding(true); setErrorMessage(null);
            void onAdd(kind, deviceId).then(onClose).catch((error: unknown) => setErrorMessage(getRecordingErrorMessage(error))).finally(() => setIsAdding(false));
        }}>
            <label className="block text-sm font-medium">Typ zdroje
                <select className="mt-2 w-full rounded-lg border p-3" value={kind} disabled={isAdding} onChange={(event) => { setKind(event.target.value as RecordingSourceKind); setDeviceId(''); }}>
                    <option value="camera">Kamera</option><option value="screen">Obrazovka / okno / karta</option><option value="microphone">Mikrofon</option>
                </select>
            </label>
            {kind !== 'screen' && <label className="block text-sm font-medium">Zařízení
                <select className="mt-2 w-full rounded-lg border p-3" value={deviceId} disabled={isAdding} onChange={(event) => setDeviceId(event.target.value)}>
                    <option value="">Výchozí zařízení</option>
                    {matchingDevices.filter((device) => device.deviceId).map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Zařízení ${index + 1}`}</option>)}
                </select>
            </label>}
            <p className="text-sm leading-6 text-slate-500">
                {kind === 'camera' ? 'Kamera nahrává obraz. Zvuk přidejte jako samostatný mikrofon. Po prvním povolení se v nabídce objeví názvy dalších kamer.' :
                    kind === 'screen' ? 'Pro každé sdílení přidejte nový zdroj. Zvuk karty se nahraje, pokud jej povolíte ve výběru prohlížeče.' : 'Mikrofon bude samostatná zvuková stopa pro střihače.'}
            </p>
            {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
            <Button type="submit" disabled={isAdding}>{isAdding ? 'Čekám na výběr…' : 'Připojit zdroj'}</Button>
        </form>
    );
}
