'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { Button } from '@/components/ui/button';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { getRecordingErrorMessage } from '@/lib/recording-studio/recordingStudioDevices';
import { editStudioRecording, readRecordingTrack } from '@/lib/recording-studio/recordingStudioStorage';
import { formatRecordingDuration, getTrackTrim } from '@/lib/recording-studio/recordingStudioTiming';
import type { RecordingTrack, RecordingTrim, StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { useEffect, useRef, useState } from 'react';

function RecordingTrackReview({ recordingId, track, trim }: {
    readonly recordingId: string; readonly track: RecordingTrack; readonly trim: RecordingTrim;
}) {
    const [url, setUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const mediaReference = useRef<HTMLVideoElement & HTMLAudioElement>(null);
    useEffect(() => {
        let isDisposed = false;
        let objectUrl: string | null = null;
        void readRecordingTrack(recordingId, track).then((blob) => {
            if (isDisposed) return;
            objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
        }).catch((error: unknown) => { if (!isDisposed) setErrorMessage(getRecordingErrorMessage(error)); });
        return () => { isDisposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [recordingId, track]);
    const range = getTrackTrim(trim, track);
    useEffect(() => {
        const media = mediaReference.current;
        if (!media || !Number.isFinite(range.start)) return;
        media.pause();
        media.currentTime = Math.max(0, range.start);
    }, [range.start, range.end]);
    const mediaProps = {
        ref: mediaReference, src: url ?? undefined, controls: true, preload: 'metadata',
        onPlay: () => {
            const media = mediaReference.current;
            if (media && (media.currentTime < range.start || media.currentTime >= range.end)) media.currentTime = Math.max(0, range.start);
        },
        onTimeUpdate: () => {
            const media = mediaReference.current;
            if (media && !media.paused && media.currentTime >= range.end) media.pause();
        },
        onError: () => setErrorMessage('Náhled této stopy se nepodařilo přehrát. Originál je stále dostupný v ZIP archivu.'),
        'aria-label': `Náhled záznamu: ${track.label}`,
    };
    return (
        <div className="min-w-0 space-y-2">
            <p className="truncate text-sm font-medium" title={track.label}>{track.label}</p>
            {url ? track.kind === 'microphone' ? <audio {...mediaProps} className="w-full" /> :
                <video {...mediaProps} playsInline className="aspect-video w-full rounded-lg bg-slate-950" /> : <p className="text-sm text-slate-500">Načítám stopu…</p>}
            {errorMessage && <p role="alert" className="text-sm text-amber-800">{errorMessage}</p>}
        </div>
    );
}

export function RecordingEditor({ recording, onChange }: {
    readonly recording: StudioRecording; readonly onChange: (recording: StudioRecording) => void;
}) {
    const [title, setTitle] = useState(recording.title);
    const [start, setStart] = useState(String(recording.trim?.startSeconds ?? 0));
    const [end, setEnd] = useState(String(recording.trim?.endSeconds ?? recording.durationSeconds));
    const trim = { startSeconds: Number(start), endSeconds: Number(end) };
    const autosave = useAdminAutosave({
        value: { title, start, end },
        onSave: async () => { onChange(await editStudioRecording(recording, title, trim)); return true; },
    });
    return (
        <form ref={autosave.formRef} className="space-y-6" onSubmit={(event) => { event.preventDefault(); void autosave.saveNow(); }}>
            <label className="block text-sm font-medium">Název záznamu
                <input value={title} required maxLength={160} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border p-3" />
            </label>
            <fieldset className="space-y-4 rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
                <legend className="px-2 text-sm font-semibold">Společný ořez všech stop</legend>
                <p className="text-sm text-slate-600">Rozsah se uloží pro všechny kamery, sdílení i mikrofony. Originály zůstanou zachované; ZIP s ořezem přidá nové soubory. Ořez může znovu zakódovat obraz a zvuk.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">Začátek (sekundy)
                        <input type="number" min="0" max={recording.durationSeconds} step="any" required value={start} onChange={(event) => setStart(event.target.value)} className="mt-2 w-full rounded-lg border p-3" />
                    </label>
                    <label className="text-sm font-medium">Konec (sekundy)
                        <input type="number" min="0" max={recording.durationSeconds} step="any" required value={end} onChange={(event) => setEnd(event.target.value)} className="mt-2 w-full rounded-lg border p-3" />
                    </label>
                </div>
                <p className="text-sm text-slate-600">Vybraný úsek: {formatRecordingDuration(Math.max(0, trim.endSeconds - trim.startSeconds))} / {formatRecordingDuration(recording.durationSeconds)}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => { setStart('0'); setEnd(String(recording.durationSeconds)); }}>Obnovit celý rozsah</Button>
            </fieldset>
            <AdminAutosaveStatus {...autosave} />
            <div className="grid gap-5 sm:grid-cols-2">
                {recording.tracks.filter((track) => track.byteLength > 0).map((track) => <RecordingTrackReview key={track.id} recordingId={recording.id} track={track} trim={trim} />)}
            </div>
        </form>
    );
}
