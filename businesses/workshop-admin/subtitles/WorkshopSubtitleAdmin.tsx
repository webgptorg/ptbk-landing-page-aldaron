'use client';

import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { Button } from '@/components/ui/button';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { formatSubtitleTime, serializeSubtitleFile } from '@/lib/workshops/subtitles/workshopSubtitleFormat';
import { SUBTITLE_LANGUAGE_LABELS, type WorkshopSubtitleAdminState, type WorkshopSubtitleTrack } from '@/lib/workshops/subtitles/workshopSubtitleTypes';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { createYoutubeWatchUrl } from '@/lib/youtube/youtubeEmbed';
import { useEffect, useRef, useState } from 'react';
import { createWorkshopSubtitlesApiUrl, saveAdminWorkshopSubtitles } from './workshopSubtitleApi';
import { WorkshopSubtitleEditor } from './WorkshopSubtitleEditor';

const SUBTITLE_SOURCE_LABELS = { manual: 'Vložené titulky', youtube: 'YouTube', transcription: 'Přepis nahrávky' } as const;

function downloadSubtitleTrack(track: WorkshopSubtitleTrack, slug: string, format: 'vtt' | 'srt') {
    const url = URL.createObjectURL(new Blob([serializeSubtitleFile(track.cues, format)], { type: format === 'vtt' ? 'text/vtt;charset=utf-8' : 'application/x-subrip;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `${slug}-${track.language}.${format}`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function WorkshopSubtitleAdmin({ workshop }: { readonly workshop: WorkshopDetails }) {
    const [state, setState] = useState<WorkshopSubtitleAdminState | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [refreshVersion, setRefreshVersion] = useState(0);
    const loadSequence = useRef(0);
    useEffect(() => {
        const sequence = ++loadSequence.current;
        const controller = new AbortController();
        setErrorMessage(null);
        void requestAdminJson<WorkshopSubtitleAdminState>(createWorkshopSubtitlesApiUrl(workshop.id), { signal: controller.signal })
            .then((result) => { if (sequence === loadSequence.current) setState(result); })
            .catch((error: unknown) => { if (!controller.signal.aborted) setErrorMessage(error instanceof Error ? error.message : 'Titulky se nepodařilo načíst.'); });
        return () => controller.abort();
    }, [workshop.id, refreshVersion]);
    const acceptTrack = (track: WorkshopSubtitleTrack) => {
        loadSequence.current++;
        setState((current) => current && { ...current, tracks: current.tracks.some((existing) => existing.id === track.id)
            ? current.tracks.map((existing) => existing.id === track.id ? track : existing) : [...current.tracks, track] });
    };

    return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div>
            <h2 className="text-xl font-bold text-slate-950">Titulky videa</h2>
            <p className="mt-1 text-sm text-slate-600">České, anglické i smíšené titulky k tomuto workshopu. Každý jazyk může mít vlastní stopu. Účastníkům se zatím nezobrazují.</p>
            {workshop.youtubeVideoId && <a href={createYoutubeWatchUrl(workshop.youtubeVideoId)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-cyan-700 underline">Otevřít video workshopu na YouTube</a>}
        </div>
        {errorMessage && <div role="alert" className="text-sm text-red-700">{errorMessage} <Button variant="outline" onClick={() => setRefreshVersion((value) => value + 1)}>Zkusit znovu</Button></div>}
        {!state && !errorMessage && <p role="status">Načítám titulky…</p>}
        {state && <>
            {state.tracks.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">Tento workshop zatím nemá titulky. Přidejte soubor, načtěte je z YouTube nebo je vytvořte z nahrávky.</p>}
            {state.tracks.map((track) => <article key={track.id} className="space-y-3 rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold">{SUBTITLE_LANGUAGE_LABELS[track.language]}</h3>
                <p className="text-xs text-slate-600">{SUBTITLE_SOURCE_LABELS[track.source]}{track.sourceFilename ? ` · ${track.sourceFilename}` : ''} · {track.cues.length} titulků · do {formatSubtitleTime(Math.max(...track.cues.map((cue) => cue.endSeconds)))}</p>
                {track.sourceYoutubeVideoId !== workshop.youtubeVideoId && <p className="text-sm text-amber-800">Tato stopa vznikla pro jiné video. Před použitím zkontrolujte její text a časy.</p>}
                <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm text-slate-700">{track.cues.slice(0, 3).map((cue) => cue.text).join('\n')}</p>
                <div className="flex flex-wrap gap-2">
                    <AdminEditorButton label="Upravit titulky" title={`Titulky: ${SUBTITLE_LANGUAGE_LABELS[track.language]}`} buttonProps={{ size: 'sm' }}>
                        {(closeEditor) => <WorkshopSubtitleEditor key={track.id} workshopId={workshop.id} videoId={workshop.youtubeVideoId}
                            track={track} isTranscriptionConfigured={state.isTranscriptionConfigured}
                            onSave={async (values) => { const result = await saveAdminWorkshopSubtitles(workshop.id, track.id, values); acceptTrack(result.track); return true; }}
                            onDelete={async () => {
                                await requestAdminJson(`${createWorkshopSubtitlesApiUrl(workshop.id)}/${track.id}`, { method: 'DELETE' });
                                loadSequence.current++;
                                setState((current) => current && { ...current, tracks: current.tracks.filter((existing) => existing.id !== track.id) });
                                closeEditor();
                            }} />}
                    </AdminEditorButton>
                    {(['vtt', 'srt'] as const).map((format) => <Button key={format} variant="outline" size="sm" onClick={() => downloadSubtitleTrack(track, workshop.slug, format)}>Stáhnout {format.toUpperCase()}</Button>)}
                </div>
            </article>)}
            <AdminEditorButton label="Přidat titulky" title="Nová stopa titulků">
                {(closeEditor) => <WorkshopSubtitleEditor workshopId={workshop.id} videoId={workshop.youtubeVideoId} track={null}
                    isTranscriptionConfigured={state.isTranscriptionConfigured}
                    onSave={async (values) => { const result = await saveAdminWorkshopSubtitles(workshop.id, null, values); acceptTrack(result.track); closeEditor(); return true; }} />}
            </AdminEditorButton>
        </>}
    </section>;
}
