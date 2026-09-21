'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import type { SubtitleLanguage, WorkshopSubtitleDraft } from '@/lib/workshops/subtitles/workshopSubtitleTypes';
import { useEffect, useRef, useState } from 'react';
import { importAdminYoutubeSubtitles, transcribeAdminWorkshopAudio } from './workshopSubtitleApi';
import { generateSubtitlesFromRecording } from './workshopSubtitleAudio';

export function WorkshopSubtitleGeneration({ workshopId, videoId, language, isTranscriptionConfigured, onGenerated, onBusyChange }: {
    readonly workshopId: string;
    readonly videoId: string | null;
    readonly language: SubtitleLanguage;
    readonly isTranscriptionConfigured: boolean;
    readonly onGenerated: (draft: WorkshopSubtitleDraft) => void;
    readonly onBusyChange: (isBusy: boolean) => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [progress, setProgress] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const controller = useRef<AbortController | null>(null);
    useEffect(() => () => controller.current?.abort(), []);

    const runGeneration = async (isYoutube: boolean) => {
        const abortController = new AbortController();
        controller.current = abortController;
        setIsBusy(true); onBusyChange(true); setErrorMessage(null);
        setProgress(isYoutube ? 'Načítám titulky z YouTube…' : 'Připravuji zvuk nahrávky…');
        try {
            await protectAdminMutation(async () => {
                if (isYoutube && videoId && language !== 'mul') {
                    const result = await importAdminYoutubeSubtitles(workshopId, videoId, language, abortController.signal);
                    abortController.signal.throwIfAborted();
                    onGenerated({ language, cues: result.cues, source: 'youtube', sourceYoutubeVideoId: result.sourceYoutubeVideoId, sourceFilename: null });
                } else if (!isYoutube && file) {
                    const cues = await generateSubtitlesFromRecording({ file, signal: abortController.signal,
                        transcribe: (chunk) => transcribeAdminWorkshopAudio(workshopId, chunk, language, abortController.signal),
                        onProgress: (fraction) => setProgress(`Přepsáno ${Math.round(fraction * 100)} % nahrávky…`) });
                    onGenerated({ language, cues, source: 'transcription', sourceYoutubeVideoId: videoId, sourceFilename: file.name.slice(0, 255) });
                }
                setProgress('Titulky jsou připravené ke kontrole a přidání.');
            });
        } catch (error) {
            setProgress(null);
            setErrorMessage(abortController.signal.aborted ? 'Generování bylo zrušeno.' : error instanceof Error ? error.message : 'Titulky se nepodařilo vytvořit.');
        } finally { setIsBusy(false); onBusyChange(false); controller.current = null; }
    };

    return <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold">Automatické titulky</h3>
        {videoId ? <>
            <Button type="button" variant="outline" disabled={isBusy || language === 'mul'} onClick={() => void runGeneration(true)}>Načíst titulky z YouTube</Button>
            <p className="text-xs text-slate-600">Načte dostupné ruční nebo automatické titulky ve vybraném jazyce. Pro YouTube vyberte češtinu nebo angličtinu; každou stopu lze přidat zvlášť.</p>
        </> : <p className="text-sm text-slate-600">Pro načtení z YouTube nejprve nastavte video v Nastavení workshopu.</p>}
        <label className="block text-sm font-medium">Video nebo zvuková nahrávka
            <Input className="mt-1 bg-white" type="file" accept="video/*,audio/*,.mkv" disabled={isBusy || !isTranscriptionConfigured}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </label>
        <p className="text-xs text-slate-600">Použijte původní nahrávku od začátku videa, včetně úvodu. Dlouhé nahrávky se zpracují po částech. Zvuk se odešle k přepisu do OpenAI; titulky zůstávají v původním jazyce.</p>
        {isTranscriptionConfigured
            ? <Button type="button" variant="outline" disabled={isBusy || !file} onClick={() => void runGeneration(false)}>Vygenerovat titulky z nahrávky</Button>
            : <p className="text-sm text-amber-800">Přepis nahrávek vyžaduje nastavený OPENAI_API_KEY. Import z YouTube a souborů funguje i bez něj.</p>}
        {isBusy && <Button type="button" variant="outline" onClick={() => controller.current?.abort()}>Zrušit generování</Button>}
        {progress && <p role="status" className="text-sm text-cyan-800">{progress}</p>}
        {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
    </div>;
}
