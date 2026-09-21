'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { parseSubtitleFile, serializeSubtitleFile } from '@/lib/workshops/subtitles/workshopSubtitleFormat';
import { MAXIMAL_SUBTITLE_FILE_BYTES, SUBTITLE_LANGUAGE_LABELS, type SubtitleLanguage, type WorkshopSubtitleDraft, type WorkshopSubtitleTrack } from '@/lib/workshops/subtitles/workshopSubtitleTypes';
import { useState } from 'react';
import { WorkshopSubtitleGeneration } from './WorkshopSubtitleGeneration';

export function WorkshopSubtitleEditor({ workshopId, videoId, track, isTranscriptionConfigured, onSave, onDelete }: {
    readonly workshopId: string;
    readonly videoId: string | null;
    readonly track: WorkshopSubtitleTrack | null;
    readonly isTranscriptionConfigured: boolean;
    readonly onSave: (draft: WorkshopSubtitleDraft) => Promise<boolean>;
    readonly onDelete?: () => Promise<void>;
}) {
    const [language, setLanguage] = useState<SubtitleLanguage>(track?.language ?? 'cs');
    const [text, setText] = useState(track ? serializeSubtitleFile(track.cues) : '');
    const [source, setSource] = useState<Pick<WorkshopSubtitleDraft, 'source' | 'sourceYoutubeVideoId' | 'sourceFilename'>>(
        track ?? { source: 'manual', sourceYoutubeVideoId: videoId, sourceFilename: null });
    const [isBusy, setIsBusy] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const saveDraft = async () => {
        setErrorMessage(null);
        try { return await onSave({ ...source, language, cues: parseSubtitleFile(text) }); }
        catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Titulky se nepodařilo uložit.'); return false; }
    };
    const autosave = useAdminAutosave({ value: { language, text }, isEnabled: track !== null, onSave: saveDraft });
    const importFile = async (file: File | undefined) => {
        if (!file) return;
        setErrorMessage(null);
        try {
            if (file.size > MAXIMAL_SUBTITLE_FILE_BYTES) throw new Error('Soubor titulků může mít nejvýše 2 MB.');
            setText(serializeSubtitleFile(parseSubtitleFile(await file.text())));
            setSource({ source: 'manual', sourceYoutubeVideoId: videoId, sourceFilename: file.name.slice(0, 255) });
        } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Soubor nelze načíst.'); }
    };

    return <form ref={autosave.formRef} className="space-y-4" onSubmit={async (event) => {
        event.preventDefault();
        if (track) { await autosave.saveNow(); return; }
        setIsCreating(true);
        try { await saveDraft(); } finally { setIsCreating(false); }
    }}>
        <label className="block text-sm font-medium">Jazyk titulků
            <select className="mt-1 block w-full rounded-md border border-slate-300 bg-white p-2" value={language} disabled={isBusy || isCreating}
                onChange={(event) => setLanguage(event.target.value as SubtitleLanguage)}>
                {Object.entries(SUBTITLE_LANGUAGE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
        </label>
        {!track && <WorkshopSubtitleGeneration workshopId={workshopId} videoId={videoId} language={language}
            isTranscriptionConfigured={isTranscriptionConfigured} onBusyChange={setIsBusy}
            onGenerated={(draft) => { setText(serializeSubtitleFile(draft.cues)); setSource(draft); setLanguage(draft.language); setErrorMessage(null); }} />}
        <label className="block text-sm font-medium">Importovat SRT nebo WebVTT
            <Input type="file" accept=".srt,.vtt,text/vtt,application/x-subrip" className="mt-1" disabled={isBusy || isCreating}
                onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ''; }} />
        </label>
        <label className="block text-sm font-medium">Text titulků (SRT / WebVTT)
            <Textarea className="mt-1 min-h-64 font-mono text-xs" required value={text} disabled={isBusy || isCreating}
                placeholder={'WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nVítejte na workshopu.'}
                onChange={(event) => setText(event.target.value)} />
        </label>
        <p className="text-xs text-slate-600">Časy se počítají od začátku původního videa, bez odečtení úvodu záznamu. Titulky jsou zatím dostupné pouze v administraci.</p>
        {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
        {track && <AdminAutosaveStatus {...autosave} />}
        <div className="flex justify-end gap-2">
            {onDelete && <Button type="button" variant="destructive" disabled={isBusy} onClick={async () => {
                if (!window.confirm('Opravdu smazat tuto stopu titulků?')) return;
                if (autosave.isDirty && !(await autosave.saveNow())) return;
                setIsBusy(true);
                try { await onDelete(); } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Titulky se nepodařilo smazat.'); }
                finally { setIsBusy(false); }
            }}>Smazat titulky</Button>}
            <Button type="submit" disabled={isBusy || isCreating || autosave.isSaving}>{track ? 'Uložit titulky' : 'Přidat titulky'}</Button>
        </div>
    </form>;
}
