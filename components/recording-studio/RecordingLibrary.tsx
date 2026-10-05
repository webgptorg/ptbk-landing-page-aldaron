'use client';

import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { Button } from '@/components/ui/button';
import { commitRecordingStudioExport, runRecordingStudioWork } from '@/lib/recording-studio/recordingStudioWork';
import { getRecordingStorageErrorMessage } from '@/lib/recording-studio/recordingStudioCapacity';
import { getRecordingErrorMessage } from '@/lib/recording-studio/recordingStudioDevices';
import { chooseRecordingArchiveDestination, chooseRecordingOriginalDestination, chooseRecordingPreparedDestination, describeRecordingOriginalIndexState, exportRecordingArchive, exportRecordingManifest, exportRecordingOriginal, exportRecordingPrepared } from '@/lib/recording-studio/recordingStudioExport';
import { deleteStudioRecording, readStudioRecording, reconnectStudioRecording } from '@/lib/recording-studio/recordingStudioStorage';
import { flushAdminEditorSaves } from '@/lib/admin/adminPendingSaves';
import { formatRecordingBytes, formatRecordingDuration, getRecordingByteLength, getRecordingMissingRanges } from '@/lib/recording-studio/recordingStudioTiming';
import type { RecordingTrack, StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { Download, Scissors } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getRecordingWorkspacePath } from '@/lib/recording-studio/recordingStudioSessionTime';
import { getRecordingMediaParts } from '@/lib/recording-studio/recordingStudioSessionTime';
import type { RecordingMediaPart } from '@/lib/recording-studio/recordingStudioTypes';

export function RecordingLibrary({ recordings, isDisabled, isWorkspace = false, onChange, onDelete, onBusyChange, onStorageChange, onUseSourceConfiguration }: {
    readonly isWorkspace?: boolean;
    readonly recordings: readonly StudioRecording[];
    readonly isDisabled: boolean;
    readonly onChange: (recording: StudioRecording) => void;
    readonly onDelete: (recordingId: string) => void;
    readonly onBusyChange: (isBusy: boolean) => void;
    readonly onStorageChange: () => Promise<void>;
    readonly onUseSourceConfiguration: (recording: StudioRecording, reportSuccess?: (message: string) => void) => void;
}) {
    const [workingId, setWorkingId] = useState<string | null>(null);
    const [progress, setProgress] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const controller = useRef<AbortController | null>(null);
    useEffect(() => () => controller.current?.abort(), []);

    const download = (recording: StudioRecording, isTrimIncluded: boolean, track?: RecordingTrack, selectedPart?: RecordingMediaPart) => {
        if (isDisabled || controller.current) return;
        const operationController = new AbortController();
        controller.current = operationController;
        setWorkingId(recording.id); setErrorMessage(null); setProgress(track ? 'Připravuji stažení originálu…' : 'Připravuji ZIP archiv…'); onBusyChange(true);
        // Invoke the native picker in the click gesture, before the asynchronous export work.
        const destination = track ? isTrimIncluded ? chooseRecordingPreparedDestination(recording, track) : chooseRecordingOriginalDestination(recording, track, selectedPart) : chooseRecordingArchiveDestination(recording);
        // Attach a rejection handler immediately while pending edit metadata is flushed.
        void destination.catch(() => undefined);
        void runRecordingStudioWork(async () => {
            try {
                if (!(await flushAdminEditorSaves())) { setProgress('Export čeká na platné uložené změny.'); return; }
                const savedRecording = await readStudioRecording(recording.id);
                if (!savedRecording) throw new Error('Místní záznam není dostupný.');
                const selectedDestination = await destination;
                operationController.signal.throwIfAborted();
                await commitRecordingStudioExport(async () => {
                    if (track) {
                        const savedTrack = savedRecording.tracks.find((candidate) => candidate.id === track.id);
                        if (!savedTrack) throw new Error('Zdroj není v uloženém záznamu dostupný.');
                        const savedPart = selectedPart ? getRecordingMediaParts(savedTrack).find((part) => part.id === selectedPart.id) : undefined;
                        if (selectedPart && !savedPart) throw new Error('Část média už není dostupná.');
                        if (isTrimIncluded) {
                            await exportRecordingPrepared(savedRecording, savedTrack, selectedDestination, operationController.signal, setProgress);
                            setProgress('Oříznutý soubor a jeho předpis jsou připravené.');
                        } else {
                            setProgress(describeRecordingOriginalIndexState(await exportRecordingOriginal(savedRecording, savedTrack,
                                selectedDestination, operationController.signal, savedPart, setProgress)));
                        }
                    } else {
                        const result = await exportRecordingArchive({ recording: savedRecording, isTrimIncluded, destination: selectedDestination, signal: operationController.signal, onProgress: setProgress });
                        const unindexedNotice = result.unindexedOriginalCount > 0
                            ? ` U ${result.unindexedOriginalCount} originálů zůstal kontejner bez indexu pro vyhledávání; důvod a doporučený příkaz jsou v recording.json a README.txt.` : '';
                        setProgress((result.fallbackCount > 0 ? `ZIP obsahuje ${result.preparedCount} oříznutých souborů. U ${result.fallbackCount} zdrojů obsahuje pouze originály a předpis; důvody jsou v recording.json.` : 'ZIP je připravený.') + unindexedNotice);
                    }
                }, operationController.signal);
            } catch (error) {
                const isCancelled = operationController.signal.aborted || (error instanceof DOMException && error.name === 'AbortError');
                if (!isCancelled) setErrorMessage(error instanceof DOMException ? getRecordingStorageErrorMessage(error, false) : getRecordingErrorMessage(error));
                setProgress(isCancelled ? 'Export byl zrušen. Originály i uložený výběr zůstávají; export můžete spustit znovu.' : '');
            } finally {
                controller.current = null; setWorkingId(null); onBusyChange(false); await onStorageChange();
            }
        }, operationController).catch(() => undefined);
    };
    const reconnect = async (recording: StudioRecording) => {
        setWorkingId(recording.id); onBusyChange(true); setErrorMessage(null);
        try { onChange(await runRecordingStudioWork(() => reconnectStudioRecording(recording.id))); }
        catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Složku se nepodařilo připojit.'); }
        finally { setWorkingId(null); onBusyChange(false); await onStorageChange(); }
    };
    const remove = (recording: StudioRecording, closeEditor: () => void) => {
        setWorkingId(recording.id); setErrorMessage(null); onBusyChange(true);
        void runRecordingStudioWork(async () => {
            try {
                await deleteStudioRecording(recording.id);
                onDelete(recording.id); closeEditor();
            } catch (error) { setErrorMessage(error instanceof DOMException ? getRecordingStorageErrorMessage(error, false) : getRecordingErrorMessage(error)); }
            finally { setWorkingId(null); onBusyChange(false); await onStorageChange(); }
        }).catch(() => undefined);
    };
    const isBusy = isDisabled || workingId !== null;
    const downloadManifest = async (recordingId: string) => {
        setErrorMessage(null);
        try {
            if (!(await flushAdminEditorSaves())) return;
            const savedRecording = await readStudioRecording(recordingId);
            if (!savedRecording) throw new Error('Místní záznam není dostupný.');
            await runRecordingStudioWork((signal) => commitRecordingStudioExport(() => exportRecordingManifest(savedRecording), signal));
        } catch (error) { setErrorMessage(getRecordingErrorMessage(error)); }
    };
    return (
        <section className="space-y-5" aria-labelledby={isWorkspace ? 'recording-export-title' : 'recording-library-title'}>
            <div><h2 id={isWorkspace ? 'recording-export-title' : 'recording-library-title'} className="text-xl font-bold">{isWorkspace ? 'Soubory pro střihače' : 'Uložené záznamy'}</h2><p className="mt-1 text-sm text-slate-500">V tomto prohlížeči nebo ve zvolených místních složkách. Originály a ZIP slouží jako záloha pro střihače. Export zahrnuje všechny zdroje bez ohledu na náhled. Ořez potřebuje místo na jeden dočasný soubor v úložišti prohlížeče; ZIP navíc místo v cíli. Bez přímého ukládání na disk lze stáhnout jednotlivý ořez do 256 MiB, velké originály zůstávají dostupné jednotlivě s časovým předpisem.</p></div>
            {errorMessage && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p>}
            {progress && <div role="status" className="flex flex-wrap items-center gap-4 rounded-lg bg-cyan-50 p-4 text-sm text-cyan-900">{progress}
                {controller.current && <Button type="button" variant="outline" size="sm" onClick={() => controller.current?.abort()}>Zrušit export</Button>}
            </div>}
            {recordings.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Po zastavení nahrávání zde najdete všechny stopy, společný ořez a stažení ZIP.</div>}
            {recordings.map((recording) => (
                <article key={recording.id} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5" aria-label={recording.title}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0"><h3 className="break-words font-semibold">{recording.title}</h3><p className="mt-1 text-sm text-slate-500">{formatRecordingDuration(recording.durationSeconds)} · {formatRecordingBytes(getRecordingByteLength(recording))} · {recording.tracks.length} stop</p></div>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${recording.status === 'complete' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>{recording.status === 'complete' ? 'Uloženo' : 'Přerušený záznam'}</span>
                    </div>
                    {recording.errorMessage && <p className="text-sm text-amber-800">{recording.errorMessage}</p>}
                    <p className="break-all text-xs text-slate-500">{recording.storageDestination ? `Složka: ${recording.storageDestination.name}` : 'Úložiště tohoto prohlížeče (IndexedDB)'}</p>
                    {getRecordingMissingRanges(recording).map((range) => <p key={range.trackId} className="text-xs text-amber-800">{recording.tracks.find((track) => track.id === range.trackId)?.label}: nepotvrzený konec od {formatRecordingDuration(range.startSeconds)} do {range.endSeconds === null ? 'neznámého času' : formatRecordingDuration(range.endSeconds)}. Společně uložený rozsah končí v {formatRecordingDuration(recording.durationSeconds)}.</p>)}
                    <ul className="divide-y divide-slate-100 text-sm">
                        {recording.tracks.map((track, index) => {
                            const parts = getRecordingMediaParts(track);
                            const isPreparationPossible = Boolean(recording.trim && parts.some((part) => part.sessionStartSeconds <= recording.trim!.startSeconds && part.sessionStartSeconds + part.durationSeconds >= recording.trim!.endSeconds));
                            return <li key={track.id} className="flex flex-wrap items-center justify-between gap-3 py-2"><span className="min-w-0 truncate" title={track.label}>{index + 1}. {track.label}{track.kind === 'microphone' ? ' · zvuk' : track.isAudioIncluded ? ` · obraz i zvuk${track.audioSourceLabel ? ` (${track.audioSourceLabel})` : ''}` : ''} · {parts.length} částí</span><span className="shrink-0 tabular-nums text-slate-500">{formatRecordingBytes(track.byteLength)}</span>
                                {parts.length <= 1 ? <Button type="button" variant="outline" size="sm" disabled={isBusy || track.byteLength === 0} onClick={() => download(recording, false, track)}>Stáhnout originál {index + 1}</Button>
                                    : parts.map((part, partIndex) => <Button key={part.id} type="button" variant="outline" size="sm" disabled={isBusy || part.byteLength === 0} onClick={() => download(recording, false, track, part)}>Originál {index + 1} · část {partIndex + 1}</Button>)}
                                {recording.trim && isPreparationPossible && <Button type="button" variant="outline" size="sm" disabled={isBusy || track.byteLength === 0} onClick={() => download(recording, true, track)}>Stáhnout ořez {index + 1}</Button>}
                            </li>;
                        })}
                    </ul>
                    {recording.trim && <p className="text-sm text-cyan-800">Společný ořez: {formatRecordingDuration(recording.trim.startSeconds)} – {formatRecordingDuration(recording.trim.endSeconds)}</p>}
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" disabled={isBusy || recording.tracks.length === 0} onClick={() => onUseSourceConfiguration(recording)}>Použít tuto konfiguraci zdrojů</Button>
                        {recording.storageDestination && <Button type="button" variant="outline" disabled={isBusy} onClick={() => { void reconnect(recording); }}>Připojit složku znovu</Button>}
                        {!isWorkspace && (isBusy ? <Button type="button" variant="outline" disabled>Náhled a ořez</Button> : <Button variant="outline" asChild><Link href={getRecordingWorkspacePath(recording.id)}>Náhled a ořez</Link></Button>)}
                        <Button type="button" variant="outline" disabled={isBusy || getRecordingByteLength(recording) === 0} onClick={() => download(recording, false)}><Download className="mr-2 h-4 w-4" />Originály ZIP</Button>
                        <Button type="button" variant="outline" disabled={isBusy} onClick={() => { void downloadManifest(recording.id); }}>Stáhnout údaje o stopách</Button>
                        {recording.trim && <Button type="button" disabled={isBusy} onClick={() => download(recording, true)}><Scissors className="mr-2 h-4 w-4" />ZIP s ořezem</Button>}
                        <AdminEditorButton label="Smazat" title="Smazat místní záznam" errorMessage={errorMessage} buttonProps={{ disabled: isBusy, className: 'text-red-700' }}>
                            {(closeEditor) => <div className="space-y-4"><p className="text-sm text-slate-600">Záznam „{recording.title}“ a všechny jeho potvrzené části budou odstraněny {recording.storageDestination ? 'z jeho složky na disku' : 'z tohoto prohlížeče'}. Stažené ZIP soubory zůstanou zachované.</p><Button type="button" variant="destructive" disabled={isBusy} onClick={() => remove(recording, closeEditor)}>Smazat záznam a všechny stopy</Button></div>}
                        </AdminEditorButton>
                    </div>
                </article>
            ))}
        </section>
    );
}
