'use client';

import { Button } from '@/components/ui/button';
import { flushAdminEditorSaves } from '@/lib/admin/adminPendingSaves';
import { DEFAULT_STUDIO_TRANSITION, STUDIO_CAMERA_RECTANGLE } from '@/lib/recording-studio/studioComposition';
import { commitRecordingStudioExport, runRecordingStudioWork } from '@/lib/recording-studio/recordingStudioWork';
import { getStudioSceneAt } from '@/lib/recording-studio/studioProjectTimeline';
import type { StudioAsset, StudioProject, StudioScene } from '@/lib/recording-studio/studioProjectTypes';
import { useEffect, useRef, useState } from 'react';

export function StudioCompositionControls({ project, assets, isDisabled, onChange, onBusyChange }: {
    readonly project: StudioProject; readonly assets: readonly StudioAsset[]; readonly isDisabled: boolean;
    readonly onChange: (project: StudioProject) => void; readonly onBusyChange: (value: boolean) => void;
}) {
    const controller = useRef<AbortController | null>(null);
    const [isWorking, setIsWorking] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => () => controller.current?.abort(), []);
    const run = (job: (signal: AbortSignal) => Promise<void>) => {
        if (isDisabled || controller.current) return;
        const operation = new AbortController(); controller.current = operation;
        setIsWorking(true); onBusyChange(true); setError(null);
        void runRecordingStudioWork(async (signal) => {
            if (!await flushAdminEditorSaves()) throw new Error('Nejprve opravte a uložte změny projektu.');
            await job(signal);
        }, operation).catch((error: unknown) => {
            setMessage(null);
            if (operation.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) setMessage('Zpracování zrušeno. Originály a uložené úpravy zůstaly zachované.');
            else setError(error instanceof Error ? error.message : 'Zpracování se nezdařilo.');
        }).finally(() => { controller.current = null; setIsWorking(false); onBusyChange(false); });
    };
    const exportComposition = () => {
        if (isDisabled || controller.current) return;
        const picker = (window as Window & { showSaveFilePicker?: (options: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker;
        const destination: Promise<FileSystemFileHandle | null> = picker ? picker.call(window, { suggestedName: `${project.title.replace(/[\\/:*?"<>|]/g, '-')}-kompozice.webm`, types: [{ description: 'WebM video', accept: { 'video/webm': ['.webm'] } }] }) : Promise.resolve(null);
        void destination.catch(() => undefined);
        setMessage('Připravuji místní export…');
        run(async (signal) => {
            const handle = await destination;
            const { renderStudioComposition, saveStudioComposition } = await import('@/lib/recording-studio/studioCompositionExport');
            await commitRecordingStudioExport(() => renderStudioComposition(project, assets, signal,
                (progress) => setMessage(`Export kompozice · ${Math.round(progress * 100)} %`),
                (file) => saveStudioComposition(file, project, handle, signal)), signal);
            setMessage('Kompozice je vyexportovaná jako WebM · 1080p / 30 fps.');
        });
    };
    const smartLayout = () => {
        setMessage('Hledám začátek sdílení v místním obrazu…');
        run(async (signal) => {
            const { createStudioSmartLayout, suggestStudioScreenStarts } = await import('@/lib/recording-studio/studioSmartLayout');
            const starts = await suggestStudioScreenStarts(project, assets, signal);
            signal.throwIfAborted(); onChange(createStudioSmartLayout(project, starts));
            setMessage('Smart layout připravený. Odhad vychází ze změn obrazu; přechody můžete posunout na stopě Kompozice nebo vložit tlačítky rozložení.');
        });
    };
    const transition = project.transition ?? DEFAULT_STUDIO_TRANSITION;
    return <section aria-label="Kompozice a export" className="space-y-3 rounded-xl border bg-white p-4">
        <fieldset disabled={isDisabled || isWorking} className="flex flex-wrap items-center gap-3">
            <Button type="button" disabled={!project.clips.length} onClick={exportComposition}>Exportovat kompozici</Button>
            <Button type="button" variant="outline" onClick={smartLayout} disabled={!project.groups.length}>Vygenerovat smart layout</Button>
            <label className="text-sm">Přechod <select aria-label="Přechod celé kompozice" className="rounded border p-2" value={transition.type} onChange={(event) => onChange({ ...project, transition: { ...transition, type: event.target.value as typeof transition.type } })}>
                <option value="smooth">Plynulé zmenšení do kruhu</option><option value="fade">Prolnutí</option><option value="cut">Přímý střih</option>
            </select></label>
            {transition.type !== 'cut' && <label className="text-sm">Délka (s) <input aria-label="Délka přechodu" type="number" required min="0.1" max="3" step="0.1" value={Number.isFinite(transition.durationSeconds) ? transition.durationSeconds : ''} onChange={(event) => onChange({ ...project, transition: { ...transition, durationSeconds: event.target.value === '' ? NaN : Number(event.target.value) } })} className="w-20 rounded border p-2" /></label>}
        </fieldset>
        {isWorking && <Button type="button" variant="outline" onClick={() => controller.current?.abort()}>Zrušit zpracování</Button>}
        {message && <p role="status" className="text-sm text-cyan-800">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <p className="text-xs text-slate-500">Místní renderování · originály zůstávají zachované · jeden zvuk kompozice · velké exporty vyžadují přímé uložení na disk.</p>
    </section>;
}

export function StudioLayoutButtons({ project, seconds, onChange }: {
    readonly project: StudioProject; readonly seconds: number; readonly onChange: (project: StudioProject) => void;
}) {
    const camera = project.tracks.find((track) => track.role === 'webcam');
    const screen = project.tracks.find((track) => track.role === 'editor' || track.role === 'application');
    const layoutHere = (layout: 'camera' | 'circle' | 'screen') => {
        const group = project.groups.find((item) => seconds >= item.projectStartSeconds && seconds < item.projectStartSeconds + item.sourceOutSeconds - item.sourceInSeconds);
        if (!group) return;
        const offsetSeconds = seconds - group.projectStartSeconds + group.sourceInSeconds;
        const existing = project.scenes.find((item) => item.groupId === group.id && Math.abs(item.offsetSeconds - offsetSeconds) < 0.001);
        const scene = getStudioSceneAt(project, seconds);
        const next: StudioScene = { id: existing?.id ?? crypto.randomUUID(), groupId: group.id, offsetSeconds,
            backgroundTrackId: (layout === 'camera' ? camera?.id : screen?.id) ?? null, overlayTrackId: layout === 'circle' ? camera?.id ?? null : null,
            audioTrackId: scene?.audioTrackId ?? null, mask: 'circle', fit: layout === 'camera' ? 'cover' : 'contain', overlayFit: 'cover', rectangle: STUDIO_CAMERA_RECTANGLE };
        onChange({ ...project, scenes: [...project.scenes.filter((item) => item.id !== next.id), next] });
    };
    return <div className="flex flex-wrap items-center gap-2" aria-label="Rozložení od přehrávací hlavy">
        <span className="mr-1 text-sm font-medium">Rozložení od tohoto místa</span>
        <Button type="button" size="sm" variant="outline" disabled={!camera} onClick={() => layoutHere('camera')}>Kamera</Button>
        <Button type="button" size="sm" variant="outline" disabled={!screen || !camera} onClick={() => layoutHere('circle')}>Obrazovka + kruh</Button>
        <Button type="button" size="sm" variant="outline" disabled={!screen} onClick={() => layoutHere('screen')}>Obrazovka</Button>
    </div>;
}
