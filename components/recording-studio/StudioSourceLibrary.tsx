'use client';

import { Button } from '@/components/ui/button';
import { flushAdminEditorSaves } from '@/lib/admin/adminPendingSaves';
import {
    importStudioFile,
    importStudioMediaUrl,
    relinkStudioFile,
    relinkStudioMediaUrl,
    requestStudioFileReadPermission,
    readStudioLocalRangeSource,
} from '@/lib/recording-studio/studioMediaSource';
import { addStudioExternalAsset } from '@/lib/recording-studio/studioProjectAssembly';
import { addStudioRecordingRevision, saveStudioAsset } from '@/lib/recording-studio/studioProjectStorage';
import { runRecordingStudioWork } from '@/lib/recording-studio/recordingStudioWork';
import { cancelStudioAssetUpload, uploadStudioAsset } from '@/lib/recording-studio/studioAssetUploadClient';
import type { StudioAssetUploadProgress } from '@/lib/recording-studio/studioAssetUploadTypes';
import { formatRecordingBytes, formatRecordingDuration } from '@/lib/recording-studio/recordingStudioTiming';
import type { StudioAsset, StudioProject } from '@/lib/recording-studio/studioProjectTypes';
import type { StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { useEffect, useRef, useState, type DragEvent } from 'react';

type FilePickerWindow = Window & {
    showOpenFilePicker?: (options: {
        multiple: boolean;
        types: { description: string; accept: Record<string, string[]> }[];
    }) => Promise<FileSystemFileHandle[]>;
};
type DroppedFileItem = DataTransferItem & { getAsFileSystemHandle?: () => Promise<FileSystemHandle | null> };
const PHASE_LABELS = {
    preparing: 'Doplňuji index · bez překódování',
    hashing: 'Ověřuji identitu souboru',
    uploading: 'Přímý upload do S3',
    verifying: 'Server ověřuje objekt',
    reading: 'Ověřuji vzdálené čtení a seek',
};

export function StudioSourceLibrary({
    project,
    assets,
    recordings,
    isDisabled,
    onChange,
    onAssetChange,
    onBusyChange,
}: {
    readonly project: StudioProject;
    readonly assets: readonly StudioAsset[];
    readonly recordings: readonly StudioRecording[];
    readonly isDisabled: boolean;
    readonly onChange: (project: StudioProject) => void;
    readonly onAssetChange: (asset: StudioAsset) => void;
    readonly onBusyChange: (isBusy: boolean) => void;
}) {
    const [groupId, setGroupId] = useState<string>('');
    const [trackId, setTrackId] = useState<string>('');
    const [offset, setOffset] = useState('0');
    const [url, setUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [progress, setProgress] = useState<StudioAssetUploadProgress | null>(null);
    const [batchProgress, setBatchProgress] = useState<{
        readonly fileNumber: number;
        readonly fileCount: number;
        readonly completedBytes: number;
        readonly totalBytes: number;
    } | null>(null);
    const [isStorageConfigured, setIsStorageConfigured] = useState(false);
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [isBusy, setIsBusy] = useState(false);
    const controllerReference = useRef<AbortController | null>(null);
    const pickerReference = useRef<HTMLInputElement>(null);
    const relinkReference = useRef<string | null>(null);
    const projectReference = useRef(project);
    projectReference.current = project;
    useEffect(() => {
        void requestAdminJson<{ isConfigured: boolean }>('/api/admin/studio/assets')
            .then((value) => setIsStorageConfigured(value.isConfigured))
            .catch(() => setIsStorageConfigured(false));
    }, []);
    useEffect(() => () => controllerReference.current?.abort(), []);
    const perform = (operation: (signal: AbortSignal) => Promise<void>) => {
        if (controllerReference.current) return;
        const controller = new AbortController();
        controllerReference.current = controller;
        setIsBusy(true);
        onBusyChange(true);
        setErrorMessage(null);
        setMessage(null);
        void runRecordingStudioWork(operation, controller)
            .catch((error: unknown) => {
                if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError'))
                    setMessage(
                        'Práce se zastavila. Místní originály a střih zůstávají; upload lze obnovit se stejným zdrojem.',
                    );
                else setErrorMessage(error instanceof Error ? error.message : 'Zdroj se nepodařilo připojit.');
            })
            .finally(() => {
                controllerReference.current = null;
                setIsBusy(false);
                onBusyChange(false);
                setProgress(null);
                setBatchProgress(null);
            });
    };
    const attachFiles = (
        selection: Promise<readonly { file: File; handle?: FileSystemFileHandle }[]>,
        relinkAssetId: string | null,
    ) => {
        void selection.catch(() => undefined);
        perform(async (signal) => {
            const files = await selection;
            let next = projectReference.current;
            for (const selected of files) {
                signal.throwIfAborted();
                const original = assets.find((asset) => asset.id === relinkAssetId);
                const asset = original
                    ? await relinkStudioFile(original, selected.file, selected.handle)
                    : await importStudioFile(selected.file, selected.handle);
                signal.throwIfAborted();
                await saveStudioAsset(asset);
                onAssetChange(asset);
                if (!original)
                    next = addStudioExternalAsset(next, asset, groupId || null, trackId || null, Number(offset));
            }
            onChange(next);
            setMessage(
                relinkAssetId
                    ? 'Stejný originál je znovu připojený. Střih se nezměnil.'
                    : 'Zdroje jsou připojené bez kopírování médií. Synchronizaci externích stop nastavte jejich posunem.',
            );
        });
    };
    const chooseFiles = (relinkAssetId: string | null = null) => {
        const picker = (window as FilePickerWindow).showOpenFilePicker;
        if (picker) {
            const selection = picker({
                multiple: !relinkAssetId,
                types: [
                    {
                        description: 'Video nebo zvuk',
                        accept: { 'video/*': ['.mp4', '.webm', '.mov'], 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'] },
                    },
                ],
            }).then((handles) =>
                Promise.all(handles.map(async (handle) => ({ file: await handle.getFile(), handle }))),
            );
            attachFiles(selection, relinkAssetId);
        } else {
            relinkReference.current = relinkAssetId;
            pickerReference.current?.click();
        }
    };
    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        if (isDisabled || isBusy) return;
        // Obtain handles synchronously while the drop gesture's DataTransfer is still live.
        const selections = Array.from(event.dataTransfer.items)
            .filter((item) => item.kind === 'file')
            .map((item) => {
                const file = item.getAsFile();
                const handlePromise = (item as DroppedFileItem).getAsFileSystemHandle?.();
                return handlePromise
                    ? handlePromise.then(async (handle) =>
                          handle?.kind === 'file'
                              ? {
                                    file: await (handle as FileSystemFileHandle).getFile(),
                                    handle: handle as FileSystemFileHandle,
                                }
                              : file
                                ? { file }
                                : null,
                      )
                    : Promise.resolve(file ? { file } : null);
            });
        attachFiles(
            Promise.all(selections).then((values) => values.filter((value) => value !== null)),
            null,
        );
    };
    const referencedAssets = assets.filter((asset) => project.clips.some((clip) => clip.assetId === asset.id));
    const uploadSelected = (assetIds: readonly string[]) =>
        perform(async (signal) => {
            if (!(await flushAdminEditorSaves())) throw new Error('Před uploadem opravte a uložte projekt.');
            const selected = referencedAssets.filter(
                (asset) =>
                    assetIds.includes(asset.id) && asset.location.kind !== 's3' && asset.original.kind !== 'https',
            );
            let completedBytes = 0;
            let totalBytes = selected.reduce((bytes, asset) => bytes + asset.byteLength, 0);
            for (let index = 0; index < selected.length; index += 1) {
                const asset = selected[index];
                let preparedBytes = asset.byteLength;
                setBatchProgress({ fileNumber: index + 1, fileCount: selected.length, completedBytes, totalBytes });
                const converted = await uploadStudioAsset(asset, project.id, signal, (value) => {
                    if (value.phase !== 'preparing') {
                        totalBytes += value.totalBytes - preparedBytes;
                        preparedBytes = value.totalBytes;
                    }
                    const transferredBytes =
                        value.phase === 'uploading' || value.phase === 'verifying' || value.phase === 'reading'
                            ? value.completedBytes
                            : 0;
                    setProgress(value);
                    setBatchProgress({
                        fileNumber: index + 1,
                        fileCount: selected.length,
                        completedBytes: completedBytes + transferredBytes,
                        totalBytes,
                    });
                });
                completedBytes += preparedBytes;
                onAssetChange(converted);
            }
            setMessage(
                'Vybrané zdroje jsou ověřené na soukromém CDN. Originály zůstávají místní; workshop se nepublikoval.',
            );
        });
    return (
        <section
            className="space-y-4 rounded-xl border border-slate-300 bg-slate-100 p-4"
            aria-label="Knihovna zdrojů"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
        >
            <h3 className="font-semibold">Knihovna zdrojů</h3>
            <p className="text-sm text-slate-600">
                Přetáhněte video/zvuk, vyberte soubor nebo připojte přímou HTTPS adresu. Soubory se do úložiště
                prohlížeče nekopírují. Oprávnění mohou po obnovení vyžadovat nový výběr.
            </p>
            {errorMessage && (
                <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {errorMessage}
                </p>
            )}
            {message && (
                <p role="status" className="text-sm text-cyan-900">
                    {message}
                </p>
            )}
            {progress && (
                <div role="status" className="space-y-2 text-sm">
                    <p>
                        {PHASE_LABELS[progress.phase]} · {progress.filename} ·{' '}
                        {formatRecordingBytes(progress.completedBytes)} / {formatRecordingBytes(progress.totalBytes)}
                    </p>
                    <progress max={progress.totalBytes} value={progress.completedBytes} className="w-full" />
                </div>
            )}
            {batchProgress && (
                <div role="status" className="space-y-2 text-sm">
                    <p>
                        Celkový upload · soubor {batchProgress.fileNumber} / {batchProgress.fileCount} ·{' '}
                        {formatRecordingBytes(batchProgress.completedBytes)} /{' '}
                        {formatRecordingBytes(batchProgress.totalBytes)}
                    </p>
                    <progress max={batchProgress.totalBytes} value={batchProgress.completedBytes} className="w-full" />
                </div>
            )}
            {isBusy && (
                <Button type="button" size="sm" variant="outline" onClick={() => controllerReference.current?.abort()}>
                    Pozastavit práci / upload
                </Button>
            )}
            <fieldset disabled={isDisabled || isBusy} className="space-y-4">
                <div className="flex flex-wrap items-end gap-3">
                    <label className="text-xs">
                        Přidat zdroj do části
                        <select
                            value={groupId}
                            onChange={(event) => setGroupId(event.target.value)}
                            className="mt-1 block max-w-64 rounded border p-2"
                        >
                            <option value="">Nová část na konci</option>
                            {project.groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs">
                        Logická stopa
                        <select
                            value={trackId}
                            onChange={(event) => setTrackId(event.target.value)}
                            className="mt-1 block max-w-64 rounded border p-2"
                        >
                            <option value="">Nová pojmenovaná stopa</option>
                            {project.tracks.map((track) => (
                                <option key={track.id} value={track.id}>
                                    {track.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs">
                        Ruční posun v části (s)
                        <input
                            type="number"
                            step="any"
                            value={offset}
                            onChange={(event) => setOffset(event.target.value)}
                            className="mt-1 block w-32 rounded border p-2"
                        />
                    </label>
                    <Button type="button" variant="outline" onClick={() => chooseFiles()}>
                        Vybrat místní soubory
                    </Button>
                    <input
                        ref={pickerReference}
                        type="file"
                        multiple={!relinkReference.current}
                        accept="video/*,audio/*"
                        className="hidden"
                        aria-label="Vybrat místní média"
                        onChange={(event) => {
                            const files = Array.from(event.target.files ?? []);
                            const relinkId = relinkReference.current;
                            relinkReference.current = null;
                            event.target.value = '';
                            if (files.length) attachFiles(Promise.resolve(files.map((file) => ({ file }))), relinkId);
                        }}
                    />
                </div>
                <div className="flex flex-wrap items-end gap-3">
                    <label className="min-w-0 flex-1 text-xs">
                        Přímá HTTPS / CDN adresa
                        <input
                            type="url"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            className="mt-1 block w-full rounded border p-2"
                            placeholder="https://cdn.example.org/workshop.mp4"
                        />
                    </label>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={!url}
                        onClick={() =>
                            perform(async (signal) => {
                                const asset = await importStudioMediaUrl(url, signal);
                                await saveStudioAsset(asset);
                                onAssetChange(asset);
                                onChange(
                                    addStudioExternalAsset(
                                        projectReference.current,
                                        asset,
                                        groupId || null,
                                        trackId || null,
                                        Number(offset),
                                    ),
                                );
                                setUrl('');
                            })
                        }
                    >
                        Připojit URL
                    </Button>
                </div>
                <details>
                    <summary className="cursor-pointer text-sm text-cyan-800">Dokončené záznamy z Nahrávání</summary>
                    <div className="mt-3 space-y-2">
                        {recordings
                            .filter((recording) => recording.status !== 'recording')
                            .map((recording) => (
                                <div
                                    key={recording.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded border bg-white p-3 text-sm"
                                >
                                    <span>
                                        {recording.title} · {formatRecordingDuration(recording.durationSeconds)} ·{' '}
                                        {recording.tracks.length} stop
                                        {recording.status === 'interrupted' ? ' · přerušený, jen potvrzená média' : ''}
                                    </span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            perform(async () => {
                                                const added = await addStudioRecordingRevision(
                                                    projectReference.current,
                                                    recording,
                                                );
                                                for (const asset of added.assets) {
                                                    await saveStudioAsset(asset);
                                                    onAssetChange(asset);
                                                }
                                                onChange(added.project);
                                            })
                                        }
                                    >
                                        {project.recordingSnapshots.some(
                                            (snapshot) => snapshot.recording.id === recording.id,
                                        )
                                            ? 'Přidat nově donahrané části'
                                            : 'Přidat záznam do projektu'}
                                    </Button>
                                </div>
                            ))}
                    </div>
                </details>
                <div className="space-y-3">
                    {referencedAssets.map((asset) => (
                        <article
                            key={asset.id}
                            className="space-y-2 rounded border bg-white p-3 text-sm"
                            aria-label={`Zdroj ${asset.label}`}
                        >
                            <div className="flex flex-wrap items-center gap-3">
                                <input
                                    type="checkbox"
                                    aria-label={`Vybrat zdroj ${asset.label}`}
                                    checked={selectedAssetIds.includes(asset.id)}
                                    onChange={(event) =>
                                        setSelectedAssetIds((values) =>
                                            event.target.checked
                                                ? [...values, asset.id]
                                                : values.filter((id) => id !== asset.id),
                                        )
                                    }
                                />
                                <span className="flex-1">
                                    {asset.label} · {formatRecordingBytes(asset.byteLength)} ·{' '}
                                    {asset.location.kind === 's3'
                                        ? 'Soukromé CDN'
                                        : asset.original.kind === 'recording'
                                          ? 'IndexedDB · původní záznam'
                                          : asset.original.kind === 'file'
                                            ? asset.original.handle
                                                ? 'Soubor · uložený read-only handle'
                                                : 'Soubor · tento otevřený prohlížeč'
                                            : 'Přímá HTTPS adresa'}
                                </span>
                                {asset.location.kind !== 's3' && asset.original.kind !== 'https' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={!isStorageConfigured}
                                        onClick={() => uploadSelected([asset.id])}
                                    >
                                        Nahrát na CDN
                                    </Button>
                                )}
                                {asset.location.kind === 's3' && asset.original.kind !== 'https' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            perform(async (signal) => {
                                                const source = await readStudioLocalRangeSource(asset);
                                                await source.read(0, Math.min(1, source.byteLength), signal);
                                                const restored = { ...asset, location: asset.original };
                                                await saveStudioAsset(restored);
                                                onAssetChange(restored);
                                                setMessage(
                                                    'Projekt znovu čte místní originál. Ověřený objekt na CDN zůstává zachovaný.',
                                                );
                                            })
                                        }
                                    >
                                        Použít místní originál
                                    </Button>
                                )}
                                {asset.original.kind === 'file' && (
                                    <>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => chooseFiles(asset.id)}
                                        >
                                            Znovu připojit soubor
                                        </Button>
                                        {asset.original.handle && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const location = asset.original;
                                                    if (location.kind !== 'file') return;
                                                    const permission = requestStudioFileReadPermission(location);
                                                    perform(async () => {
                                                        if ((await permission) !== 'granted')
                                                            throw new Error(
                                                                'Čtení nebylo povolené. Projekt zůstává zachovaný.',
                                                            );
                                                        onAssetChange({ ...asset });
                                                        setMessage('Čtení souboru je povolené. Obnovte jeho náhled.');
                                                    });
                                                }}
                                            >
                                                Povolit čtení
                                            </Button>
                                        )}
                                    </>
                                )}
                                {asset.location.kind !== 's3' && asset.original.kind !== 'https' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            perform(async (signal) => {
                                                await cancelStudioAssetUpload(asset.id, signal);
                                                setMessage('Rozpracovaný upload byl zrušen. Originál zůstává místní.');
                                            })
                                        }
                                    >
                                        Zrušit rozpracovaný upload
                                    </Button>
                                )}
                            </div>
                            <p className="break-all text-[10px] text-slate-500">Asset ID: {asset.id}</p>
                            {asset.location.kind === 'https' && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={!url}
                                    onClick={() =>
                                        perform(async (signal) => {
                                            const relinked = await relinkStudioMediaUrl(asset, url, signal);
                                            await saveStudioAsset(relinked);
                                            onAssetChange(relinked);
                                            setUrl('');
                                            setMessage(
                                                'Stejné médium je dostupné na nové URL. Klipy a kompozice se nezměnily.',
                                            );
                                        })
                                    }
                                >
                                    Obnovit URL zdroje z adresního pole
                                </Button>
                            )}
                            {asset.original.kind === 'recording' &&
                                asset.original.part.indexStatus !== 'indexed' &&
                                asset.location.kind !== 's3' && (
                                    <p className="text-xs text-amber-800">
                                        CDN vyžaduje použitelný index. Upload nejprve zkusí existující packet-copy
                                        remux; potřebuje dočasné místo přibližně na jeden zdroj. Nepodporované doplnění
                                        indexu ponechá zdroj místní.
                                    </p>
                                )}
                        </article>
                    ))}
                </div>
                <Button
                    type="button"
                    disabled={!isStorageConfigured || !selectedAssetIds.length}
                    onClick={() => uploadSelected(selectedAssetIds)}
                >
                    Nahrát vybrané zdroje na CDN
                </Button>
                {!isStorageConfigured && (
                    <p className="text-xs text-slate-600">
                        S3 není dostupné nebo nakonfigurované. Místní nahrávání a střih fungují samostatně.
                    </p>
                )}
                <p className="text-xs text-slate-600">
                    Google Drive je pro synchronizovaný přímý zdroj zatím výslovně nepodporovaný: autorizované velké
                    video a seek nejsou ověřené. Použijte místní soubor nebo přímé CDN; soukromé video nezveřejňujte.
                </p>
            </fieldset>
        </section>
    );
}
