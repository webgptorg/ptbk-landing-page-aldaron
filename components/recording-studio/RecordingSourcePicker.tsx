'use client';

import { Button } from '@/components/ui/button';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { getRecordingErrorMessage } from '@/lib/recording-studio/recordingStudioDevices';
import { createRecordingSourceConfiguration } from '@/lib/recording-studio/recordingStudioSourceConfiguration';
import type { RecordingSourceConfiguration, RecordingSourceKind } from '@/lib/recording-studio/recordingStudioTypes';
import { useEffect, useState } from 'react';

export function RecordingSourcePicker({ onAdd, onClose, initialConfiguration }: {
    readonly onAdd: (configuration: RecordingSourceConfiguration) => Promise<void>;
    readonly onClose: () => void;
    readonly initialConfiguration?: RecordingSourceConfiguration;
}) {
    const [configurationId] = useState(() => initialConfiguration?.id ?? crypto.randomUUID());
    const [kind, setKind] = useState<RecordingSourceKind>(initialConfiguration?.kind ?? 'camera');
    const [cameraDeviceId, setCameraDeviceId] = useState(initialConfiguration?.cameraDeviceId ?? '');
    const [microphoneDeviceId, setMicrophoneDeviceId] = useState(initialConfiguration?.microphoneDeviceId ?? '');
    const [isAudioEnabled, setIsAudioEnabled] = useState(initialConfiguration?.isAudioEnabled ?? true);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    useAdminDraftProtection({ kind, cameraDeviceId, microphoneDeviceId, isAudioEnabled });

    useEffect(() => {
        let isDisposed = false;
        const refreshDevices = () => {
            void navigator.mediaDevices.enumerateDevices().then((availableDevices) => {
                if (!isDisposed) setDevices(availableDevices);
            }).catch(() => undefined);
        };
        refreshDevices();
        navigator.mediaDevices.addEventListener?.('devicechange', refreshDevices);
        return () => {
            isDisposed = true;
            navigator.mediaDevices.removeEventListener?.('devicechange', refreshDevices);
        };
    }, []);

    const cameraDevices = devices.filter((device) => device.kind === 'videoinput' && device.deviceId);
    const microphoneDevices = devices.filter((device) => device.kind === 'audioinput' && device.deviceId);
    const selectedConfiguration: RecordingSourceConfiguration = {
        id: configurationId,
        kind,
        label: initialConfiguration?.label ?? { camera: 'Kamera', screen: 'Obrazovka', microphone: 'Mikrofon' }[kind],
        cameraDeviceId,
        cameraDeviceLabel: cameraDevices.find((device) => device.deviceId === cameraDeviceId)?.label || initialConfiguration?.cameraDeviceLabel || null,
        microphoneDeviceId,
        microphoneDeviceLabel: microphoneDevices.find((device) => device.deviceId === microphoneDeviceId)?.label || initialConfiguration?.microphoneDeviceLabel || null,
        isAudioEnabled,
    };

    return (
        <form className="space-y-5" onSubmit={(event) => {
            event.preventDefault();
            if (isAdding) return;
            setIsAdding(true);
            setErrorMessage(null);
            void onAdd(selectedConfiguration).then(onClose).catch((error: unknown) => {
                setErrorMessage(getRecordingErrorMessage(error, selectedConfiguration));
            }).finally(() => setIsAdding(false));
        }}>
            <label className="block text-sm font-medium">Typ zdroje
                <select className="mt-2 w-full rounded-lg border p-3" value={kind} disabled={isAdding} onChange={(event) => {
                    const selectedKind = event.target.value as RecordingSourceKind;
                    setKind(selectedKind);
                }}>
                    <option value="camera">Kamera</option><option value="screen">Obrazovka / okno / karta</option><option value="microphone">Samostatný mikrofon</option>
                </select>
            </label>
            {kind === 'camera' && <>
                <label className="block text-sm font-medium">Kamera
                    <select className="mt-2 w-full rounded-lg border p-3" value={cameraDeviceId} disabled={isAdding} onChange={(event) => setCameraDeviceId(event.target.value)}>
                        <option value="">Výchozí kamera</option>
                        {cameraDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Kamera ${index + 1}`}</option>)}
                    </select>
                </label>
                <label className="block text-sm font-medium">Mikrofon
                    <select className="mt-2 w-full rounded-lg border p-3" value={microphoneDeviceId} disabled={!isAudioEnabled || isAdding} onChange={(event) => setMicrophoneDeviceId(event.target.value)}>
                        <option value="">Výchozí mikrofon systému</option>
                        {microphoneDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Mikrofon ${index + 1}`}</option>)}
                    </select>
                </label>
                <label className="flex items-start gap-3 rounded-lg border border-cyan-100 bg-cyan-50/60 p-3 text-sm">
                    <input type="checkbox" checked={isAudioEnabled} disabled={isAdding} onChange={(event) => setIsAudioEnabled(event.target.checked)} className="mt-1 h-4 w-4 accent-cyan-700" />
                    <span><span className="font-semibold">Nahrávat zvuk</span><span className="mt-1 block text-slate-600">Zapíše vybraný mikrofon přímo do video souboru. Mikrofon může být samostatné zařízení. Náhled kamery zůstává ztlumený.</span></span>
                </label>
            </>}
            {kind === 'microphone' && <label className="block text-sm font-medium">Mikrofon
                <select className="mt-2 w-full rounded-lg border p-3" value={microphoneDeviceId} disabled={isAdding} onChange={(event) => setMicrophoneDeviceId(event.target.value)}>
                    <option value="">Výchozí mikrofon systému</option>
                    {microphoneDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Mikrofon ${index + 1}`}</option>)}
                </select>
            </label>}
            <p className="text-sm leading-6 text-slate-500">
                {kind === 'camera' ? isAudioEnabled
                    ? microphoneDevices.length === 0
                        ? 'Kamera a mikrofon se vyžádají až po tomto kliknutí. Seznam mikrofonů může být před povolením skrytý; při selhání zde zůstane volba pro opakování, jiný mikrofon nebo video bez zvuku.'
                        : 'Kamera i vybraný mikrofon se nahrají společně do jednoho synchronizovaného souboru.'
                    : 'Tento zdroj je nastaven záměrně jako tiché video. Mikrofon se nevyžádá.'
                    : kind === 'screen'
                        ? 'Pro každé sdílení přidejte nový zdroj. Zvuk karty se nahraje, pokud jej povolíte ve výběru prohlížeče.'
                        : 'Mikrofon bude samostatná zvuková stopa pro střihače.'}
            </p>
            {errorMessage && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}
            <Button type="submit" disabled={isAdding}>{isAdding ? 'Připojuji zařízení…' : errorMessage ? 'Zkusit znovu' : initialConfiguration ? 'Připojit zdroj' : 'Připojit zdroj'}</Button>
        </form>
    );
}
