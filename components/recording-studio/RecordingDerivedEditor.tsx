'use client';

import { Button } from '@/components/ui/button';
import { flushAdminSaves } from '@/lib/admin/adminPendingSaves';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { generateRecordingDerivedTrack } from '@/lib/recording-studio/recordingStudioDerivedGeneration';
import { applyRecordingSpeechCorrection, getRecordingAudioAvailability, getRecordingMediaRevision } from '@/lib/recording-studio/recordingStudioDerived';
import { openRecordingMedia } from '@/lib/recording-studio/recordingStudioMedia';
import { formatRecordingTimecode, getRecordingMediaParts, getRecordingSessionDuration } from '@/lib/recording-studio/recordingStudioSessionTime';
import { readRecordingPart, readStudioRecording } from '@/lib/recording-studio/recordingStudioStorage';
import type { RecordingDerivedTrack, RecordingSpeechInterval, RecordingSubtitleCue, RecordingTrack, StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { SUBTITLE_CUE_SCHEMA, type SubtitleCue, type SubtitleLanguage } from '@/lib/workshops/subtitles/workshopSubtitleTypes';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';

const EDITOR_PAGE_SIZE = 50;
type DerivedKind = RecordingDerivedTrack['kind'];
type DerivedEditorProps = {
    readonly recording: StudioRecording;
    readonly tracks: readonly RecordingDerivedTrack[];
    readonly onChange: (tracks: readonly RecordingDerivedTrack[]) => void;
    readonly seconds: number;
    readonly onSeek: (seconds: number) => void;
    readonly hiddenTrackIds: readonly string[];
    readonly onToggleVisibility: (trackId: string) => void;
    readonly isDisabled: boolean;
};

async function transcribeRecordingChunk(file: File, language: SubtitleLanguage, signal: AbortSignal): Promise<readonly SubtitleCue[]> {
    const form = new FormData();
    form.set('file', file);
    form.set('language', language);
    const response = await fetch('/api/admin/recording-studio/transcribe', { method: 'POST', body: form, signal });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(typeof result === 'object' && result && 'error' in result && typeof result.error === 'string'
        ? result.error : 'Přepis se nezdařil. Zkontrolujte server a zkuste to znovu.');
    const parsed = z.array(SUBTITLE_CUE_SCHEMA).max(2_000).safeParse(typeof result === 'object' && result && 'cues' in result ? result.cues : null);
    if (!parsed.success) throw new Error('Server vrátil neplatné časy titulků. Zkuste přepis znovu.');
    return parsed.data;
}

async function inspectUnmeasuredRecordingAudio(recordingId: string, track: RecordingTrack, signal: AbortSignal): Promise<boolean> {
    for (const part of getRecordingMediaParts(track).filter((candidate) => candidate.byteLength > 0 && !candidate.mediaBounds)) {
        signal.throwIfAborted();
        try {
            const input = openRecordingMedia(await readRecordingPart(recordingId, part, signal));
            try {
                const audio = await input.getPrimaryAudioTrack();
                if (audio && await audio.canDecode()) return true;
            } finally { input.dispose(); }
        } catch { signal.throwIfAborted(); }
    }
    return false;
}

export function RecordingDerivedEditor({ recording, tracks, onChange, seconds, onSeek, hiddenTrackIds, onToggleVisibility, isDisabled }: DerivedEditorProps) {
    const durationSeconds = getRecordingSessionDuration(recording);
    const [inspectedAudioSources, setInspectedAudioSources] = useState<Record<string, boolean>>({});
    const availability = (track: RecordingTrack) => {
        const recorded = getRecordingAudioAvailability(track);
        return recorded === 'unchecked' ? inspectedAudioSources[track.id] === undefined ? 'checking' :
            inspectedAudioSources[track.id] ? 'available' : 'unavailable' : recorded;
    };
    const isAvailableSourceId = (sourceId: string) => {
        const source = recording.tracks.find((track) => track.id === sourceId);
        return Boolean(source && availability(source) === 'available');
    };
    const firstAudioSourceId = recording.tracks.find((track) => availability(track) === 'available')?.id ?? '';
    const [subtitleSourceId, setSubtitleSourceId] = useState(firstAudioSourceId);
    const [activitySourceId, setActivitySourceId] = useState(firstAudioSourceId);
    const [language, setLanguage] = useState<SubtitleLanguage>('cs');
    const [workingKind, setWorkingKind] = useState<DerivedKind | null>(null);
    const [lastKind, setLastKind] = useState<DerivedKind>('subtitles');
    const [progress, setProgress] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [mediaRevision, setMediaRevision] = useState<string | null>(null);
    const [history, setHistory] = useState<Record<string, RecordingDerivedTrack[]>>({});
    const controller = useRef<AbortController | null>(null);
    const tracksReference = useRef(tracks);
    tracksReference.current = tracks;
    const isWorking = workingKind !== null;
    useEffect(() => {
        const operation = new AbortController();
        setInspectedAudioSources({});
        for (const track of recording.tracks.filter((candidate) => getRecordingAudioAvailability(candidate) === 'unchecked')) {
            void inspectUnmeasuredRecordingAudio(recording.id, track, operation.signal).then((isAvailable) => {
                if (!operation.signal.aborted) setInspectedAudioSources((previous) => ({ ...previous, [track.id]: isAvailable }));
            }).catch(() => undefined);
        }
        return () => operation.abort();
    }, [recording.id, recording.tracks]);
    useEffect(() => {
        if (!isAvailableSourceId(subtitleSourceId)) setSubtitleSourceId(firstAudioSourceId);
        if (!isAvailableSourceId(activitySourceId)) setActivitySourceId(firstAudioSourceId);
    }, [firstAudioSourceId, inspectedAudioSources, recording.tracks, subtitleSourceId, activitySourceId]);
    useEffect(() => { let isCurrent = true; void getRecordingMediaRevision(recording).then((revision) => { if (isCurrent) setMediaRevision(revision); });
        return () => { isCurrent = false; }; }, [recording.status, recording.durationSeconds, recording.captureEndSeconds, recording.takes, recording.tracks]);
    useEffect(() => () => controller.current?.abort(), []);
    useEffect(() => { if (isDisabled) controller.current?.abort(); }, [isDisabled]);

    const changeTrack = (updated: RecordingDerivedTrack) => {
        const previous = tracks.find((track) => track.id === updated.id);
        if (!previous) return;
        setHistory((values) => ({ ...values, [updated.id]: [...(values[updated.id] ?? []).slice(-19), previous] }));
        onChange(tracks.map((track) => track.id === updated.id ? updated : track));
    };
    const undoTrack = (trackId: string) => {
        const entries = history[trackId] ?? [];
        const previous = entries[entries.length - 1];
        if (!previous) return;
        onChange(tracks.map((track) => track.id === trackId ? previous : track));
        setHistory((values) => ({ ...values, [trackId]: entries.slice(0, -1) }));
    };
    const startGeneration = (kind: DerivedKind) => {
        if (controller.current || isDisabled || recording.status !== 'complete') return;
        const sourceId = kind === 'subtitles' ? subtitleSourceId : activitySourceId;
        const source = recording.tracks.find((track) => track.id === sourceId);
        if (!source || availability(source) !== 'available') {
            setErrorMessage('Vyberte zdroj s ověřeným zvukem. Pokud ověřování neskončí, načtěte stránku znovu.');
            return;
        }
        const operation = new AbortController();
        controller.current = operation;
        setLastKind(kind);
        setWorkingKind(kind); setProgress('Ověřuji dokončený zdroj…'); setErrorMessage(null);
        void (async () => {
            try {
                if (!(await flushAdminSaves())) throw new Error('Nejprve opravte a uložte změny v editoru.');
                const savedRecording = await readStudioRecording(recording.id);
                if (!savedRecording) throw new Error('Místní záznam není dostupný. Připojte jeho složku znovu.');
                const generated = await protectAdminMutation(() => generateRecordingDerivedTrack({ recording: savedRecording, sourceId, kind, language,
                    signal: operation.signal, onProgress: setProgress, transcribe: transcribeRecordingChunk }));
                operation.signal.throwIfAborted();
                const current = await readStudioRecording(recording.id);
                if (!current || await getRecordingMediaRevision(current) !== generated.provenance.mediaRevision) {
                    setErrorMessage('Během zpracování se změnily uložené zdroje nebo časování. Výsledek je zastaralý; spusťte generování znovu. Ruční úpravy zůstaly zachované.');
                    return;
                }
                // Every run creates a new revision, so corrected captions and intervals remain intact.
                onChange([...tracksReference.current, generated]);
                setProgress(kind === 'subtitles' ? `Nová revize: ${generated.kind === 'subtitles' ? generated.cues.length : 0} titulků.` :
                    `Nová revize: ${generated.kind === 'speech-activity' ? generated.intervals.length : 0} intervalů.`);
            } catch (error) {
                if (operation.signal.aborted) setProgress('Generování bylo zrušeno. Uložené úpravy i originály zůstaly zachované.');
                else setErrorMessage(error instanceof Error ? error.message : 'Generování se nezdařilo. Zkuste to znovu.');
            } finally { controller.current = null; setWorkingKind(null); }
        })();
    };
    return <section className="space-y-4 rounded-xl border bg-white p-4" aria-label="Odvozené stopy řeči">
        <div><h3 className="font-semibold">Titulky a aktivita řeči</h3><p className="text-sm text-slate-600">Každou stopu vytvořte zvlášť z vybraného, dokončeného zvuku. Nové generování přidá revizi a ponechá ruční opravy. Zobrazení stop nemění přehrávání ani originály.</p></div>
        {recording.status !== 'complete' && <p role="status" className="text-sm text-amber-800">Generování vyžaduje dokončený záznam. Pozastavenou relaci nejprve zastavte a bezpečně uložte.</p>}
        <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-lg border p-3"><h4 className="font-medium">Titulky · co bylo řečeno</h4>
                <SourceSelector label="Zvuk pro titulky" sourceId={subtitleSourceId} onChange={setSubtitleSourceId} recording={recording} availability={availability} />
                <label className="block text-sm">Jazyk řeči <select className="mt-1 w-full rounded border p-2" value={language} onChange={(event) => setLanguage(event.target.value as SubtitleLanguage)}><option value="cs">Čeština</option><option value="en">English</option><option value="mul">Čeština a angličtina</option></select></label>
                <p className="text-xs text-slate-600">Po kliknutí odešle vybrané zvukové části přes chráněný server do již nastavené služby OpenAI Whisper. Neodesílá ostatní zdroje.</p>
                <Button type="button" disabled={isDisabled || isWorking || !isAvailableSourceId(subtitleSourceId) || recording.status !== 'complete'} onClick={() => startGeneration('subtitles')}>Generovat titulky · nová revize</Button>
            </div>
            <div className="space-y-3 rounded-lg border p-3"><h4 className="font-medium">Aktivita řeči · kdy se mluvilo</h4>
                <SourceSelector label="Zvuk pro aktivitu" sourceId={activitySourceId} onChange={setActivitySourceId} recording={recording} availability={availability} />
                <p className="text-xs text-slate-600">Model Silero VAD běží v tomto prohlížeči. Hlasitost sama neprokazuje řeč; silný zvuk bez rozpoznané řeči je nejistý. Hudbu, šum, dech a tichou řeč zkontrolujte poslechem. Model neposkytuje kalibrovanou jistotu.</p>
                <Button type="button" disabled={isDisabled || isWorking || !isAvailableSourceId(activitySourceId) || recording.status !== 'complete'} onClick={() => startGeneration('speech-activity')}>Analyzovat řeč · nová revize</Button>
            </div>
        </div>
        {isWorking && <div role="status" className="flex flex-wrap items-center gap-3 text-sm text-cyan-800">{progress}<Button type="button" size="sm" variant="outline" onClick={() => controller.current?.abort()}>Zrušit generování</Button></div>}
        {!isWorking && progress && <p role="status" className="text-sm text-cyan-800">{progress}</p>}
        {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage} <Button type="button" size="sm" variant="outline" disabled={isDisabled || isWorking} onClick={() => startGeneration(lastKind)}>Zkusit znovu</Button></p>}
        {tracks.map((track) => <article key={track.id} className="space-y-3 rounded-lg border p-3" aria-label={`${track.kind === 'subtitles' ? 'Titulky' : 'Aktivita řeči'} ${track.provenance.sourceLabel}`}>
            <div className="flex flex-wrap items-center gap-2"><h4 className="font-medium">{track.kind === 'subtitles' ? 'Titulky' : 'Aktivita řeči'} · {track.provenance.sourceLabel}</h4><span className="text-xs text-slate-500">{track.provenance.createdAt} · {track.provenance.processor} · {track.provenance.sourceId}</span>
                {mediaRevision && mediaRevision !== track.provenance.mediaRevision && <span className="text-xs font-medium text-amber-800">Zastaralá revize zdroje · vygenerujte novou</span>}
                {Number(track.provenance.settings.unavailablePartCount ?? 0) > 0 && <span className="text-xs font-medium text-amber-800">Některé části zvuku nebyly dostupné; u aktivity jsou označené jako neznámé.</span>}
            </div>
            <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" aria-pressed={!hiddenTrackIds.includes(track.id)} onClick={() => onToggleVisibility(track.id)}>{hiddenTrackIds.includes(track.id) ? 'Ukázat v ose' : 'Skrýt v ose'}</Button>
                <Button type="button" size="sm" variant="outline" disabled={!history[track.id]?.length} onClick={() => undoTrack(track.id)}>Vrátit úpravu</Button></div>
            {track.kind === 'subtitles' ? <SubtitleTrackEditor track={track} seconds={seconds} durationSeconds={durationSeconds} onSeek={onSeek} onChange={changeTrack} /> :
                <ActivityTrackEditor track={track} seconds={seconds} durationSeconds={durationSeconds} onSeek={onSeek} onChange={changeTrack} />}
        </article>)}
    </section>;
}

function SourceSelector({ label, sourceId, onChange, recording, availability }: { readonly label: string; readonly sourceId: string;
    readonly onChange: (sourceId: string) => void; readonly recording: StudioRecording;
    readonly availability: (track: RecordingTrack) => 'available' | 'unavailable' | 'checking' }) {
    return <label className="block text-sm">{label}<select className="mt-1 w-full rounded border p-2" value={sourceId} onChange={(event) => onChange(event.target.value)}>
        <option value="" disabled>Vyberte ověřený zvuk</option>
        {recording.tracks.map((track) => <option key={track.id} value={track.id} disabled={availability(track) !== 'available'}>{track.label} · {availability(track) === 'checking'
            ? 'ověřuji uložený zvuk' : availability(track) === 'unavailable' ? 'bez zpracovatelného zvuku' :
                track.kind === 'microphone' ? 'samostatný zvuk' :
                    `zvuk v ${track.kind === 'camera' ? 'kameře' : 'obrazovce'}${track.audioSourceLabel ? ` (${track.audioSourceLabel})` : ''}`}</option>)}
    </select></label>;
}

function SubtitleTrackEditor({ track, seconds, durationSeconds, onSeek, onChange }: { readonly track: Extract<RecordingDerivedTrack, { kind: 'subtitles' }>;
    readonly durationSeconds: number;
    readonly seconds: number; readonly onSeek: (seconds: number) => void; readonly onChange: (track: RecordingDerivedTrack) => void }) {
    const [page, setPage] = useState(0);
    const active = track.cues.find((cue) => cue.isEnabled && seconds >= cue.startSeconds && seconds < cue.endSeconds);
    const updateCue = (id: string, change: Partial<RecordingSubtitleCue>) => onChange({ ...track, cues: track.cues.map((cue) => cue.id === id ? { ...cue, ...change, origin: 'manual' } : cue) });
    const addCue = () => { const startSeconds = Math.min(seconds, durationSeconds - 0.001);
        onChange({ ...track, cues: [...track.cues, { id: crypto.randomUUID(), startSeconds,
            endSeconds: Math.min(durationSeconds, startSeconds + 2), text: 'Nový titulek', isEnabled: true, origin: 'manual' as const }]
            .sort((first, second) => first.startSeconds - second.startSeconds) }); };
    return <div className="space-y-3"><p className="rounded bg-cyan-50 p-2 text-sm" role="status">Právě: {active?.text ?? 'Bez titulku'} · {formatRecordingTimecode(seconds)}</p>
        <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={addCue}>Přidat titulek u hlavy</Button><span className="text-xs text-slate-500">{track.cues.length} titulků · časy původní relace</span></div>
        <PagedControls count={track.cues.length} page={page} onChange={setPage} />
        <div className="space-y-2">{track.cues.slice(page * EDITOR_PAGE_SIZE, (page + 1) * EDITOR_PAGE_SIZE).map((cue) => <div key={cue.id} className={`grid gap-2 rounded border p-2 text-sm md:grid-cols-[6rem_6rem_1fr_auto] ${seconds >= cue.startSeconds && seconds < cue.endSeconds ? 'border-cyan-600' : ''}`}>
            <label>Od <input aria-label="Začátek titulku" type="number" min="0" max={cue.endSeconds - 0.001} step="0.001" className="w-full rounded border p-1" value={cue.startSeconds} onChange={(event) => { const value = Number(event.target.value); if (event.target.value !== '' && Number.isFinite(value) && value >= 0 && value < cue.endSeconds) updateCue(cue.id, { startSeconds: value }); }} /></label>
            <label>Do <input aria-label="Konec titulku" type="number" min={cue.startSeconds + 0.001} max={durationSeconds} step="0.001" className="w-full rounded border p-1" value={cue.endSeconds} onChange={(event) => { const value = Number(event.target.value); if (event.target.value !== '' && Number.isFinite(value) && value > cue.startSeconds && value <= durationSeconds) updateCue(cue.id, { endSeconds: value }); }} /></label>
            <label>Text <textarea className="w-full rounded border p-1" maxLength={5_000} value={cue.text} onChange={(event) => updateCue(cue.id, { text: event.target.value })} /></label>
            <div className="flex flex-wrap items-center gap-2"><label><input type="checkbox" checked={cue.isEnabled} onChange={(event) => updateCue(cue.id, { isEnabled: event.target.checked })} /> Zapnuto</label><button type="button" className="text-cyan-800 underline" onClick={() => onSeek(cue.startSeconds)}>Přejít</button><button type="button" className="text-red-700 underline" onClick={() => onChange({ ...track, cues: track.cues.filter((value) => value.id !== cue.id) })}>Smazat</button><span className="text-xs text-slate-500">{cue.origin === 'manual' ? 'Ručně' : 'Generováno'}</span></div>
        </div>)}</div>
    </div>;
}

function ActivityTrackEditor({ track, seconds, durationSeconds, onSeek, onChange }: { readonly track: Extract<RecordingDerivedTrack, { kind: 'speech-activity' }>;
    readonly durationSeconds: number;
    readonly seconds: number; readonly onSeek: (seconds: number) => void; readonly onChange: (track: RecordingDerivedTrack) => void }) {
    const [page, setPage] = useState(0);
    const active = track.intervals.find((interval) => seconds >= interval.startSeconds && seconds < interval.endSeconds);
    const updateInterval = (id: string, change: Partial<RecordingSpeechInterval>) => {
        const previous = track.intervals.find((interval) => interval.id === id);
        if (!previous) return;
        onChange({ ...track, intervals: applyRecordingSpeechCorrection(track.intervals, { ...previous, ...change, origin: 'manual', confidence: undefined }) });
    };
    return <div className="space-y-3"><p className="rounded bg-violet-50 p-2 text-sm" role="status">Právě: {active ? ACTIVITY_LABELS[active.type] : 'Mimo interval'} · {formatRecordingTimecode(seconds)}</p>
        <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => { const startSeconds = Math.min(seconds, durationSeconds - 0.001);
            onChange({ ...track, intervals: applyRecordingSpeechCorrection(track.intervals, { id: crypto.randomUUID(), type: 'unknown', startSeconds,
                endSeconds: Math.min(durationSeconds, startSeconds + 1), origin: 'manual' }) }); }}>Přidat interval u hlavy</Button><span className="text-xs text-slate-500">{track.intervals.length} intervalů · začátky a konce řeči vznikají z intervalů</span></div>
        <PagedControls count={track.intervals.length} page={page} onChange={setPage} />
        <div className="space-y-2">{track.intervals.slice(page * EDITOR_PAGE_SIZE, (page + 1) * EDITOR_PAGE_SIZE).map((interval) => <div key={interval.id} className={`flex flex-wrap items-center gap-2 rounded border p-2 text-sm ${seconds >= interval.startSeconds && seconds < interval.endSeconds ? 'border-violet-600' : ''}`}>
            <label>Od <input aria-label="Začátek intervalu" type="number" min="0" max={interval.endSeconds - 0.001} step="0.001" className="w-24 rounded border p-1" value={interval.startSeconds} onChange={(event) => { const value = Number(event.target.value); if (event.target.value !== '' && Number.isFinite(value) && value >= 0 && value < interval.endSeconds) updateInterval(interval.id, { startSeconds: value }); }} /></label>
            <label>Do <input aria-label="Konec intervalu" type="number" min={interval.startSeconds + 0.001} max={durationSeconds} step="0.001" className="w-24 rounded border p-1" value={interval.endSeconds} onChange={(event) => { const value = Number(event.target.value); if (event.target.value !== '' && Number.isFinite(value) && value > interval.startSeconds && value <= durationSeconds) updateInterval(interval.id, { endSeconds: value }); }} /></label>
            <label>Typ <select className="rounded border p-1" value={interval.type} onChange={(event) => updateInterval(interval.id, { type: event.target.value as RecordingSpeechInterval['type'] })}>{Object.entries(ACTIVITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <button type="button" className="text-cyan-800 underline" onClick={() => onSeek(interval.startSeconds)}>Přejít</button><button type="button" className="text-red-700 underline" onClick={() => updateInterval(interval.id, { type: 'unknown' })}>Označit neznámé</button><span className="text-xs text-slate-500">{interval.origin === 'manual' ? 'Ručně' : 'Generováno'}{interval.confidence === undefined ? '' : ` · ${Math.round(interval.confidence * 100)} %`}</span>
        </div>)}</div>
    </div>;
}

const ACTIVITY_LABELS: Record<RecordingSpeechInterval['type'], string> = { speech: 'Řeč', silence: 'Bez rozpoznané řeči', uncertain: 'Nejistý zvuk', unknown: 'Zvuk nedostupný' };

function PagedControls({ count, page, onChange }: { readonly count: number; readonly page: number; readonly onChange: (page: number) => void }) {
    if (count <= EDITOR_PAGE_SIZE) return null;
    const pageCount = Math.ceil(count / EDITOR_PAGE_SIZE);
    return <div className="flex items-center gap-3 text-sm"><Button type="button" size="sm" variant="outline" disabled={page === 0} onClick={() => onChange(page - 1)}>Předchozí</Button><span>Strana {page + 1} z {pageCount}</span><Button type="button" size="sm" variant="outline" disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)}>Další</Button></div>;
}
