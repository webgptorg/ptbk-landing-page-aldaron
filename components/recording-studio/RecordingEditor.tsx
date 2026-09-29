'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { flushAdminSaves } from '@/lib/admin/adminPendingSaves';
import { Button } from '@/components/ui/button';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { RecordingStudioTransport } from '@/lib/recording-studio/RecordingStudioTransport';
import type { RecordingMediaArtwork, RecordingMediaBounds } from '@/lib/recording-studio/recordingStudioMedia';
import { createRecordingEditRecipe, formatRecordingTimecode, getRecordingAvailableRanges, getRecordingSelection, getRecordingSessionDuration } from '@/lib/recording-studio/recordingStudioSessionTime';
import { editStudioRecording } from '@/lib/recording-studio/recordingStudioStorage';
import type { RecordingTrim, StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { RecordingTimeline } from './RecordingTimeline';
import { RecordingSourceMonitor } from './RecordingSourceMonitor';
import { RecordingDerivedEditor } from './RecordingDerivedEditor';

type RecordingEditorProps = {
    readonly isDisabled: boolean;
    readonly recording: StudioRecording; readonly onChange: (recording: StudioRecording) => void;
    readonly onUseSourceConfiguration: (reportSuccess: (message: string) => void) => void;
    readonly onAppend: () => void;
};

export function RecordingEditor(props: RecordingEditorProps) {
    const [transport, setTransport] = useState<RecordingStudioTransport | null>(null);
    const initialRecording = useRef(props.recording).current;
    useEffect(() => {
        const controller = new RecordingStudioTransport(initialRecording.tracks, getRecordingSessionDuration(initialRecording));
        setTransport(controller);
        return () => controller.dispose();
    }, [initialRecording]);
    return transport ? <RecordingEditorWorkspace {...props} transport={transport} /> : <p role="status">Připravuji časovou osu…</p>;
}

function RecordingEditorWorkspace({ recording, isDisabled, onChange, onUseSourceConfiguration, onAppend, transport }: RecordingEditorProps & { readonly transport: RecordingStudioTransport }) {
    const durationSeconds = getRecordingSessionDuration(recording);
    const initialSelection = getRecordingSelection(recording);
    const [title, setTitle] = useState(recording.title);
    const [start, setStart] = useState(String(initialSelection.startSeconds));
    const [end, setEnd] = useState(String(initialSelection.endSeconds));
    const [sourceRestoreMessage, setSourceRestoreMessage] = useState<string | null>(null);
    const [history, setHistory] = useState<RecordingTrim[]>([]);
    const [derivedTracks, setDerivedTracks] = useState(recording.derivedTracks ?? []);
    const [hiddenDerivedTrackIds, setHiddenDerivedTrackIds] = useState<string[]>([]);
    const [hiddenSources, setHiddenSources] = useState<string[]>([]);
    const [visualSolo, setVisualSolo] = useState<string | null>(null);
    const [audioSolo, setAudioSolo] = useState<string | null>(null);
    const defaultAudibleSource = recording.tracks.find((track) => track.kind === 'microphone') ?? recording.tracks.find((track) => track.isAudioIncluded);
    const [mutedSources, setMutedSources] = useState(() => recording.tracks.filter((track) => track.id !== defaultAudibleSource?.id).map((track) => track.id));
    const [artwork, setArtwork] = useState<Record<string, RecordingMediaArtwork>>({});
    const [availableRanges, setAvailableRanges] = useState<Record<string, readonly RecordingTrim[]>>({});
    const snapshot = useSyncExternalStore(transport.subscribe, transport.getSnapshot, transport.getSnapshot);
    const selection = { startSeconds: Number(start), endSeconds: Number(end) };
    const isSelectionValid = start !== '' && end !== '' && Number.isFinite(selection.startSeconds) && Number.isFinite(selection.endSeconds) && selection.startSeconds >= 0 && selection.endSeconds <= durationSeconds && selection.startSeconds < selection.endSeconds;
    const autosave = useAdminAutosave({
        value: { title, start, end, derivedTracks },
        onSave: async () => {
            // Export disables the controls before flushing. Disabled fields are excluded from native form
            // validation, so preserve incomplete raw input rather than converting an empty field to zero.
            if (!isSelectionValid) throw new AdminSaveValidationError('Vyplňte platný začátek a konec společného výběru.');
            onChange(await editStudioRecording(recording, title, selection, derivedTracks));
            return true;
        },
    });
    const setSelection = (value: RecordingTrim) => { if (!isDisabled) { setStart(String(value.startSeconds)); setEnd(String(value.endSeconds)); } };
    const beginEdit = () => { if (isSelectionValid) setHistory((values) => [...values.slice(-49), selection]); };
    const toggleSource = (values: string[], id: string) => values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
    const handleBounds = useCallback((id: string, bounds: RecordingMediaBounds | null) => {
        const track = recording.tracks.find((candidate) => candidate.id === id)!;
        setAvailableRanges((values) => ({ ...values, [id]: track.parts
            ? getRecordingAvailableRanges(track)
            : bounds ? getRecordingAvailableRanges(track, bounds.firstTimestampSeconds, bounds.endTimestampSeconds, bounds.availableStartTimestampSeconds) : [] }));
    }, [recording.tracks]);
    const handleArtwork = useCallback((id: string, value: RecordingMediaArtwork) => setArtwork((values) => ({ ...values, [id]: value })), []);
    useEffect(() => { if (isDisabled) transport.pause(); }, [isDisabled, transport]);
    return <form ref={autosave.formRef} className="space-y-6" onSubmit={(event) => event.preventDefault()} onKeyDown={(event) => {
        if (isDisabled) return;
        if (event.target instanceof HTMLElement && event.target.closest('input, select, textarea, button, [role=slider]')) return;
        if (event.code === 'Space') { event.preventDefault(); if (snapshot.isPlayRequested) transport.pause(); else transport.play(); }
    }}>
        {isDisabled && <p role="status" className="text-sm text-cyan-800">Probíhá práce se soubory. Výběr a náhled jsou pozastavené; zrušení exportu je u jeho průběhu.</p>}
        <fieldset disabled={isDisabled} className="min-w-0 space-y-6" onPointerDownCapture={(event) => { if (isDisabled) { event.preventDefault(); event.stopPropagation(); } }} onKeyDownCapture={(event) => { if (isDisabled && event.key !== 'Tab') { event.preventDefault(); event.stopPropagation(); } }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
            <label className="block min-w-0 flex-1 text-sm font-medium">Název záznamu<input value={title} required maxLength={160} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
            <AdminAutosaveStatus {...autosave} />
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4" aria-label="Společné přehrávání">
            <Button type="button" onClick={snapshot.isPlayRequested ? transport.pause : transport.play}>{snapshot.isPlayRequested ? 'Pozastavit vše' : 'Přehrát vše'}</Button>
            <Button type="button" variant="outline" onClick={() => transport.seek(0)}>Na začátek</Button>
            <output className="font-mono text-lg tabular-nums" aria-label="Společný čas" data-session-seconds={snapshot.seconds}>{formatRecordingTimecode(snapshot.seconds)} / {formatRecordingTimecode(durationSeconds)}</output>
            <label className="text-sm">Rychlost <select aria-label="Rychlost přehrávání" className="rounded border p-2" value={snapshot.speed} onChange={(event) => transport.setSpeed(Number(event.target.value))}>{[0.25, 0.5, 1, 1.5, 2, 4].map((speed) => <option key={speed} value={speed}>{speed}×</option>)}</select></label>
            <span role="status" className="text-xs text-slate-600">{snapshot.isSettling ? 'Čekám na společný čas zdrojů…' : snapshot.isPlaying ? 'Společné přehrávání' : 'Pozastaveno'}</span>
        </div>
        <RecordingTimeline tracks={recording.tracks} derivedTracks={derivedTracks.filter((track) => !hiddenDerivedTrackIds.includes(track.id))} durationSeconds={durationSeconds} seconds={snapshot.seconds} selection={isSelectionValid ? selection : initialSelection} artwork={artwork} availableRanges={availableRanges} onSeek={transport.seek} onSelection={setSelection} onBeginEdit={beginEdit} />
        <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">Začátek (sekundy)<input type="number" min="0" max={Number(end) - 0.001} step="any" required value={start} onFocus={beginEdit} onChange={(event) => setStart(event.target.value)} className="mt-1 block w-40 rounded border p-2" /></label>
            <label className="text-sm">Konec (sekundy)<input type="number" min={Number(start) + 0.001} max={durationSeconds} step="any" required value={end} onFocus={beginEdit} onChange={(event) => setEnd(event.target.value)} className="mt-1 block w-40 rounded border p-2" /></label>
            <Button type="button" variant="outline" onClick={() => { beginEdit(); setSelection({ startSeconds: 0, endSeconds: durationSeconds }); }}>Obnovit celý rozsah</Button>
            <Button type="button" variant="outline" disabled={history.length === 0} onClick={() => { setSelection(history[history.length - 1]); setHistory((values) => values.slice(0, -1)); }}>Vrátit ořez</Button>
            <span className="text-sm text-cyan-800">Výběr: {formatRecordingTimecode(Math.max(0, selection.endSeconds - selection.startSeconds))}</span>
        </div>
        <p className="text-sm text-slate-600">Časový ořez platí pro všechny soubory. Originály se nemění. Obraz a poslech níže slouží jen ke kontrole; všechny zdroje zůstávají v exportu. Ve výchozím poslechu hraje jen jeden mikrofon, aby se zvuk nezdvojoval.</p>
        <RecordingDerivedEditor recording={recording} tracks={derivedTracks} onChange={setDerivedTracks} seconds={snapshot.seconds} onSeek={transport.seek} hiddenTrackIds={hiddenDerivedTrackIds} onToggleVisibility={(trackId) => setHiddenDerivedTrackIds((values) => values.includes(trackId) ? values.filter((value) => value !== trackId) : [...values, trackId])} isDisabled={isDisabled} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recording.tracks.map((track) => <RecordingSourceMonitor key={track.id} recordingId={recording.id} track={track} transport={transport} isVisible={!hiddenSources.includes(track.id) && (!visualSolo || visualSolo === track.id)} isMuted={audioSolo ? audioSolo !== track.id : mutedSources.includes(track.id)} onBounds={handleBounds} onArtwork={handleArtwork}>
                <div className="flex flex-wrap gap-2 text-xs">
                    {track.kind !== 'microphone' && <><Button type="button" size="sm" variant="outline" aria-pressed={hiddenSources.includes(track.id)} onClick={() => setHiddenSources(toggleSource(hiddenSources, track.id))}>Skrýt obraz</Button><Button type="button" size="sm" variant="outline" aria-pressed={visualSolo === track.id} onClick={() => setVisualSolo(visualSolo === track.id ? null : track.id)}>Sólo obraz</Button></>}
                    {(track.isAudioIncluded || track.kind === 'microphone') && <><Button type="button" size="sm" variant="outline" aria-pressed={mutedSources.includes(track.id)} onClick={() => { setAudioSolo(null); setMutedSources(toggleSource(mutedSources, track.id)); }}>Ztlumit zvuk</Button><Button type="button" size="sm" variant="outline" aria-pressed={audioSolo === track.id} onClick={() => setAudioSolo(audioSolo === track.id ? null : track.id)}>Sólo zvuk</Button></>}
                </div>
            </RecordingSourceMonitor>)}
        </div>
        <details className="rounded-lg border p-3 text-xs text-slate-600"><summary className="cursor-pointer">Časování a předpis pro střihače</summary><p className="my-2">Cíl náhledu je odchylka do 100 ms po ustálení přesunu. Starší záznamy obsahují časy spuštění prohlížeče, nikoli měření latence zařízení. Export znovu kóduje na vybrané hranice; nepodporované nebo chybějící části ponechá výslovně jako originál s předpisem.</p><pre className="max-h-48 overflow-auto">{JSON.stringify(createRecordingEditRecipe(recording, isSelectionValid ? selection : initialSelection), null, 2)}</pre></details>
        <div className="space-y-2"><div className="flex flex-wrap gap-2">
            <Button type="button" disabled={recording.status !== 'complete'} onClick={() => { void flushAdminSaves().then((isSaved) => { if (isSaved) onAppend(); else setSourceRestoreMessage('Nejprve opravte a uložte změny ořezu.'); }); }}>Donahrát do tohoto projektu</Button>
            <Button type="button" variant="outline" disabled={recording.tracks.length === 0} onClick={() => onUseSourceConfiguration(setSourceRestoreMessage)}>Použít tuto konfiguraci zdrojů · nový záznam</Button>
        </div>{sourceRestoreMessage && <p role="status" className="text-sm text-cyan-800">{sourceRestoreMessage}</p>}</div>
        </fieldset>
    </form>;
}
