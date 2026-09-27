'use client';


import { Button } from '@/components/ui/button';
import { RecordingDisplayCaptureHelp } from './RecordingDisplayCaptureHelp';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { getRecordingErrorMessage } from '@/lib/recording-studio/recordingStudioDevices';
import { createRecordingSourceConfiguration, isUnknownLegacyDeviceId } from '@/lib/recording-studio/recordingStudioSourceConfiguration';
import type { RecordingDisplaySurface, RecordingSourceConfiguration, RecordingSourceKind } from '@/lib/recording-studio/recordingStudioTypes';
import { useEffect, useState } from 'react';

export function RecordingSourcePicker({ onAdd, onClose, initialConfiguration, initialLabel }: {
    readonly onAdd: (configuration: RecordingSourceConfiguration) => Promise<void>;
    readonly onClose: () => void;
    readonly initialConfiguration?: RecordingSourceConfiguration;
    readonly initialLabel?: string;
}) {
    const [configurationId] = useState(() => initialConfiguration?.id ?? crypto.randomUUID());
    const sourceLabelNumber = Number(initialLabel?.match(/\d+$/)?.[0]) || 1;
    const defaultLabels: Record<RecordingSourceKind, string> = {
        camera: `Kamera ${sourceLabelNumber}`,
        screen: `Sdílení obrazovky ${sourceLabelNumber}`,
        microphone: `Mikrofon ${sourceLabelNumber}`,
    };
    const [kind, setKind] = useState<RecordingSourceKind>(initialConfiguration?.kind ?? 'camera');
    const [label, setLabel] = useState(initialConfiguration?.label ?? initialLabel ?? 'Kamera');
    const [cameraDeviceId, setCameraDeviceId] = useState(initialConfiguration?.cameraDeviceId ?? '');
    const [microphoneDeviceId, setMicrophoneDeviceId] = useState(initialConfiguration?.microphoneDeviceId ?? '');
    const [displaySurface, setDisplaySurface] = useState<RecordingDisplaySurface | null>(initialConfiguration?.displaySurface ?? null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(initialConfiguration?.isAudioEnabled ?? true);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [isDisplaySurfaceHintSupported, setIsDisplaySurfaceHintSupported] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    useAdminDraftProtection({ kind, label, cameraDeviceId, microphoneDeviceId, displaySurface, isAudioEnabled });

    useEffect(() => {
        let isDisposed = false;
        const refreshDevices = () => {
            void navigator.mediaDevices.enumerateDevices().then((availableDevices) => {
                if (!isDisposed) setDevices(availableDevices);
            }).catch(() => undefined);
        };
        setIsDisplaySurfaceHintSupported(navigator.mediaDevices.getSupportedConstraints?.().displaySurface === true);
        refreshDevices();
        navigator.mediaDevices.addEventListener?.('devicechange', refreshDevices);
        return () => {
            isDisposed = true;
            navigator.mediaDevices.removeEventListener?.('devicechange', refreshDevices);
        };
    }, []);

    const cameraDevices = devices.filter((device) => device.kind === 'videoinput' && device.deviceId);
    const microphoneDevices = devices.filter((device) => device.kind === 'audioinput' && device.deviceId);
    const isSavedCameraMissing = Boolean(cameraDeviceId && !cameraDevices.some((device) => device.deviceId === cameraDeviceId));
    const isSavedMicrophoneMissing = Boolean(microphoneDeviceId && !microphoneDevices.some((device) => device.deviceId === microphoneDeviceId));
    const selectedConfiguration: RecordingSourceConfiguration = {
        id: configurationId,
        kind,
        label: label.trim() || { camera: 'Kamera', screen: 'Sdílení obrazovky', microphone: 'Mikrofon' }[kind],
        cameraDeviceId,
        cameraDeviceLabel: cameraDevices.find((device) => device.deviceId === cameraDeviceId)?.label || initialConfiguration?.cameraDeviceLabel || null,
        microphoneDeviceId,
        microphoneDeviceLabel: microphoneDevices.find((device) => device.deviceId === microphoneDeviceId)?.label || initialConfiguration?.microphoneDeviceLabel || null,
        displaySurface,
        displaySourceLabel: initialConfiguration?.displaySourceLabel ?? null,
        isCaptureEnabled: initialConfiguration?.isCaptureEnabled ?? true,
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
            <label className="block text-sm font-medium">Název zdroje
                <input className="mt-2 w-full rounded-lg border p-3" value={label} maxLength={200} disabled={isAdding} onChange={(event) => setLabel(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">Typ zdroje
                <select className="mt-2 w-full rounded-lg border p-3" value={kind} disabled={isAdding} onChange={(event) => {
                    setKind(event.target.value as RecordingSourceKind);
                    const selectedKind = event.target.value as RecordingSourceKind;
                    if (!initialConfiguration && Object.values(defaultLabels).includes(label)) setLabel(defaultLabels[selectedKind]);
                }}>
                    <option value="camera">Kamera</option><option value="screen">Obrazovka / okno / karta</option><option value="microphone">Samostatný mikrofon</option>
                </select>
            </label>
            {kind === 'camera' && <>
                <label className="block text-sm font-medium">Kamera
                    <select className="mt-2 w-full rounded-lg border p-3" value={cameraDeviceId} disabled={isAdding} onChange={(event) => setCameraDeviceId(event.target.value)}>
                        <option value="">Výchozí kamera systému</option>
                        {isSavedCameraMissing && <option value={cameraDeviceId}>{isUnknownLegacyDeviceId(cameraDeviceId) ? 'Výběr z původního záznamu není známý' : `Dříve vybraná: ${initialConfiguration?.cameraDeviceLabel || 'kamera; dostupnost se ověří při připojení'}`}</option>}
                        {cameraDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Kamera ${index + 1}`}</option>)}
                    </select>
                </label>
                <label className="block text-sm font-medium">Mikrofon
                    <select className="mt-2 w-full rounded-lg border p-3" value={microphoneDeviceId} disabled={!isAudioEnabled || isAdding} onChange={(event) => setMicrophoneDeviceId(event.target.value)}>
                        <option value="">Výchozí mikrofon systému</option>
                        {isAudioEnabled && isSavedMicrophoneMissing && <option value={microphoneDeviceId}>{isUnknownLegacyDeviceId(microphoneDeviceId) ? 'Výběr z původního záznamu není známý' : `Dříve vybraný: ${initialConfiguration?.microphoneDeviceLabel || 'mikrofon; dostupnost se ověří při připojení'}`}</option>}
                        {microphoneDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Mikrofon ${index + 1}`}</option>)}
                    </select>
                </label>
                <label className="flex items-start gap-3 rounded-lg border border-cyan-100 bg-cyan-50/60 p-3 text-sm">
                    <input type="checkbox" checked={isAudioEnabled} disabled={isAdding} onChange={(event) => setIsAudioEnabled(event.target.checked)} className="mt-1 h-4 w-4 accent-cyan-700" />
                    <span><span className="font-semibold">Nahrávat zvuk</span><span className="mt-1 block text-slate-600">Zapíše vybraný mikrofon přímo do video souboru. Mikrofon může být samostatné zařízení. Náhled kamery zůstává ztlumený.</span></span>
                </label>
                {isSavedCameraMissing && cameraDeviceId && <p role="status" className="text-sm text-amber-800">Původní kamera „{initialConfiguration?.cameraDeviceLabel || 'bez známého názvu'}“ se v dostupném seznamu neukazuje. Studio nepřejde na jinou kameru samo; vyberte náhradu, nebo zkuste původní volbu znovu.</p>}
                {isAudioEnabled && isSavedMicrophoneMissing && microphoneDeviceId && <p role="status" className="text-sm text-amber-800">Původní mikrofon „{initialConfiguration?.microphoneDeviceLabel || 'bez známého názvu'}“ se v dostupném seznamu neukazuje. Studio nepřejde na jiný mikrofon samo; vyberte náhradu, nebo zkuste původní volbu znovu.</p>}
            </>}
            {kind === 'microphone' && <>
                <label className="block text-sm font-medium">Mikrofon
                    <select className="mt-2 w-full rounded-lg border p-3" value={microphoneDeviceId} disabled={isAdding} onChange={(event) => setMicrophoneDeviceId(event.target.value)}>
                        <option value="">Výchozí mikrofon systému</option>
                        {isSavedMicrophoneMissing && <option value={microphoneDeviceId}>{isUnknownLegacyDeviceId(microphoneDeviceId) ? 'Výběr z původního záznamu není známý' : `Dříve vybraný: ${initialConfiguration?.microphoneDeviceLabel || 'mikrofon; dostupnost se ověří při připojení'}`}</option>}
                        {microphoneDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Mikrofon ${index + 1}`}</option>)}
                    </select>
                </label>
                {isSavedMicrophoneMissing && microphoneDeviceId && <p role="status" className="text-sm text-amber-800">Původní mikrofon „{initialConfiguration?.microphoneDeviceLabel || 'bez známého názvu'}“ se v dostupném seznamu neukazuje. Studio nepřejde na jiný mikrofon samo; vyberte náhradu, nebo zkuste původní volbu znovu.</p>}
            </>}
            {kind === 'screen' && <>
                <RecordingDisplayCaptureHelp />
                <label className="block text-sm font-medium">Preferovaný typ sdílené plochy
                    <select className="mt-2 w-full rounded-lg border p-3" value={displaySurface ?? ''} disabled={isAdding} onChange={(event) => setDisplaySurface((event.target.value || null) as RecordingDisplaySurface | null)}>
                        <option value="">Bez preference</option><option value="window">Okno</option><option value="browser">Karta prohlížeče</option><option value="monitor">Celá obrazovka</option>
                    </select>
                </label>
                <label className="flex items-start gap-3 rounded-lg border border-cyan-100 bg-cyan-50/60 p-3 text-sm">
                    <input type="checkbox" checked={isAudioEnabled} disabled={isAdding} onChange={(event) => setIsAudioEnabled(event.target.checked)} className="mt-1 h-4 w-4 accent-cyan-700" />
                    <span><span className="font-semibold">Požádat také o zvuk sdílené plochy</span><span className="mt-1 block text-slate-600">Dostupnost závisí na volbě v prohlížeči, operačním systému a typu sdílené plochy.</span></span>
                </label>
                {initialConfiguration?.displaySourceLabel && <p className="text-sm text-slate-600">Předchozí výběr: {initialConfiguration.displaySourceLabel}. Prohlížeč vyžádá nový výběr při každém připojení.</p>}
                {!isDisplaySurfaceHintSupported && displaySurface && <p className="text-sm text-amber-800">Tento prohlížeč nepodporuje preferenci typu sdílené plochy; vyberte okno, kartu nebo monitor v jeho vlastním dialogu.</p>}
            </>}
            <p className="text-sm leading-6 text-slate-500">
                {kind === 'camera' ? isAudioEnabled
                    ? microphoneDevices.length === 0
                        ? 'Kamera a mikrofon se vyžádají až po tomto kliknutí. Seznam zařízení může být před povolením skrytý; při selhání zde zůstane volba pro opakování, jiný mikrofon nebo video bez zvuku.'
                        : 'Kamera i vybraný mikrofon se nahrají společně do jednoho synchronizovaného souboru.'
                    : 'Tento zdroj je nastaven záměrně jako tiché video. Mikrofon se nevyžádá.'
                    : kind === 'screen'
                        ? 'Každé připojení otevře prohlížečový výběr. Uložený název a typ jsou jen vodítkem; oprávnění ke sdílení se po zavření stránky neobnovuje.'
                        : 'Mikrofon bude samostatná zvuková stopa pro střihače.'}
            </p>
            {errorMessage && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}
            {(kind === 'camera' && (isUnknownLegacyDeviceId(cameraDeviceId) || (isAudioEnabled && isUnknownLegacyDeviceId(microphoneDeviceId))) || kind === 'microphone' && isUnknownLegacyDeviceId(microphoneDeviceId)) && <p role="status" className="text-sm text-amber-800">Starší záznam neuložil identitu potřebného zařízení. Zvolte výchozí systémové zařízení vědomě nebo vyberte konkrétní zařízení, než jej připojíte.</p>}
            <Button type="submit" disabled={isAdding || (kind === 'camera' && (isUnknownLegacyDeviceId(cameraDeviceId) || (isAudioEnabled && isUnknownLegacyDeviceId(microphoneDeviceId))) || kind === 'microphone' && isUnknownLegacyDeviceId(microphoneDeviceId))}>{isAdding ? 'Připojuji zařízení…' : errorMessage ? 'Zkusit znovu' : 'Připojit zdroj'}</Button>
        </form>
    );
}
