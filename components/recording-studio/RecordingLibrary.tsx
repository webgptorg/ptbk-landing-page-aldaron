'use client';

import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { Button } from '@/components/ui/button';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { getRecordingStorageErrorMessage } from '@/lib/recording-studio/recordingStudioCapacity';
import { getRecordingErrorMessage } from '@/lib/recording-studio/recordingStudioDevices';
import { chooseRecordingArchiveDestination, chooseRecordingOriginalDestination, exportRecordingArchive, exportRecordingManifest, exportRecordingOriginal } from '@/lib/recording-studio/recordingStudioExport';
import { deleteStudioRecording, reconnectStudioRecording } from '@/lib/recording-studio/recordingStudioStorage';
import { formatRecordingBytes, formatRecordingDuration, getRecordingByteLength, getRecordingMissingRanges } from '@/lib/recording-studio/recordingStudioTiming';
import type { RecordingTrack, StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { Download, Scissors } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { RecordingEditor } from './RecordingEditor';

export function RecordingLibrary({ recordings, isDisabled, onChange, onDelete, onBusyChange, onStorageChange, onUseSourceConfiguration }: {
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

    const download = (recording: StudioRecording, isTrimIncluded: boolean, track?: RecordingTrack) => {
        if (controller.current) return;
        const operationController = new AbortController();
        controller.current = operationController;
        setWorkingId(recording.id); setErrorMessage(null); setProgress(track ? 'Připravuji stažení originálu…' : 'Připravuji ZIP archiv…'); onBusyChange(true);
        // Invoke the native picker in the click gesture, before the asynchronous export work.
        const destination = track ? chooseRecordingOriginalDestination(recording, track) : chooseRecordingArchiveDestination(recording);
        void protectAdminMutation(async () => {
            try {
                if (track) await exportRecordingOriginal(recording, track, await destination, operationController.signal);
                else await exportRecordingArchive({ recording, isTrimIncluded, destination: await destination, signal: operationController.signal, onProgress: setProgress });
                setProgress(track ? 'Originál je připravený.' : 'ZIP je připravený.');
            } catch (error) {
                if (!(error instanceof DOMException && error.name === 'AbortError')) setErrorMessage(error instanceof DOMException ? getRecordingStorageErrorMessage(error, false) : getRecordingErrorMessage(error));
                setProgress('');
            } finally {
                controller.current = null; setWorkingId(null); onBusyChange(false); await onStorageChange();
            }
        });
    };
    const reconnect = async (recording: StudioRecording) => {
        setWorkingId(recording.id); onBusyChange(true); setErrorMessage(null);
        try { onChange(await protectAdminMutation(() => reconnectStudioRecording(recording.id))); }
        catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Složku se nepodařilo připojit.'); }
        finally { setWorkingId(null); onBusyChange(false); await onStorageChange(); }
    };
    const remove = (recording: StudioRecording, closeEditor: () => void) => {
        setWorkingId(recording.id); setErrorMessage(null); onBusyChange(true);
        void protectAdminMutation(async () => {
            try {
                await deleteStudioRecording(recording.id);
                onDelete(recording.id); closeEditor();
            } catch (error) { setErrorMessage(error instanceof DOMException ? getRecordingStorageErrorMessage(error, false) : getRecordingErrorMessage(error)); }
            finally { setWorkingId(null); onBusyChange(false); await onStorageChange(); }
        });
    };
    const isBusy = isDisabled || workingId !== null;
    return (
        <section className="space-y-5" aria-labelledby="recording-library-title">
            <div><h2 id="recording-library-title" className="text-xl font-bold">Uložené záznamy</h2><p className="mt-1 text-sm text-slate-500">V tomto prohlížeči nebo ve zvolených místních složkách. Originály a ZIP slouží jako záloha pro střihače.</p></div>
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
                        {recording.tracks.map((track, index) => <li key={track.id} className="flex flex-wrap items-center justify-between gap-3 py-2"><span className="min-w-0 truncate" title={track.label}>{index + 1}. {track.label}{track.isAudioIncluded ? ` · obraz i zvuk${track.audioSourceLabel ? ` (${track.audioSourceLabel})` : ''}` : ''}</span><span className="shrink-0 tabular-nums text-slate-500">{formatRecordingBytes(track.byteLength)}</span><Button type="button" variant="outline" size="sm" disabled={isBusy || track.byteLength === 0} onClick={() => download(recording, false, track)}>Stáhnout originál {index + 1}</Button></li>)}
                    </ul>
                    {recording.trim && <p className="text-sm text-cyan-800">Společný ořez: {formatRecordingDuration(recording.trim.startSeconds)} – {formatRecordingDuration(recording.trim.endSeconds)}</p>}
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" disabled={isBusy || recording.tracks.length === 0} onClick={() => onUseSourceConfiguration(recording)}>Použít tuto konfiguraci zdrojů</Button>
                        {recording.storageDestination && <Button type="button" variant="outline" disabled={isBusy} onClick={() => { void reconnect(recording); }}>Připojit složku znovu</Button>}
                        <AdminEditorButton label="Náhled a ořez" title="Upravit záznam" description="Jeden rozsah pro všechny stopy; originály se nemění." buttonProps={{ disabled: isBusy || recording.durationSeconds <= 0 }}>
                            <RecordingEditor key={recording.id} recording={recording} onChange={onChange} onUseSourceConfiguration={(reportSuccess) => onUseSourceConfiguration(recording, reportSuccess)} />
                        </AdminEditorButton>
                        <Button type="button" variant="outline" disabled={isBusy || getRecordingByteLength(recording) === 0} onClick={() => download(recording, false)}><Download className="mr-2 h-4 w-4" />Originály ZIP</Button>
                        <Button type="button" variant="outline" disabled={isBusy} onClick={() => exportRecordingManifest(recording)}>Stáhnout údaje o stopách</Button>
                        {recording.trim && <Button type="button" disabled={isBusy} onClick={() => download(recording, true)}><Scissors className="mr-2 h-4 w-4" />ZIP s ořezem</Button>}
                        <AdminEditorButton label="Smazat" title="Smazat místní záznam" errorMessage={errorMessage} buttonProps={{ disabled: isBusy, className: 'text-red-700' }}>
                            {(closeEditor) => <div className="space-y-4"><p className="text-sm text-slate-600">Záznam „{recording.title}“ a všechny jeho potvrzené části budou odstraněny {recording.storageDestination ? 'z jeho složky na disku' : 'z tohoto prohlížeče'}. Stažené ZIP soubory zůstanou zachované.</p><Button type="button" variant="destructive" disabled={workingId !== null} onClick={() => remove(recording, closeEditor)}>Smazat záznam a všechny stopy</Button></div>}
                        </AdminEditorButton>
                    </div>
                </article>
            ))}
        </section>
    );
}
