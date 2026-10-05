'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { Button } from '@/components/ui/button';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { RecordingStudioTransport } from '@/lib/recording-studio/RecordingStudioTransport';
import {
    createStudioTimelineTracks,
    getStudioAvailableRanges,
    getStudioProjectDuration,
    getStudioSceneAt,
    getStudioSceneBoundaryRange,
    mapStudioProjectMetadata,
    moveStudioSceneBoundary,
    placeStudioScenes,
    validateStudioProject,
} from '@/lib/recording-studio/studioProjectTimeline';
import { persistStudioProject } from '@/lib/recording-studio/studioProjectPersistence';
import { downloadStudioProjectRecipe } from '@/lib/recording-studio/studioProjectRecipe';
import { formatRecordingTimecode } from '@/lib/recording-studio/recordingStudioSessionTime';
import type { StudioAsset, StudioProject } from '@/lib/recording-studio/studioProjectTypes';
import type { StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { flushAdminEditorSaves } from '@/lib/admin/adminPendingSaves';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { RecordingTimeline } from './RecordingTimeline';
import { StudioProjectSource } from './StudioProjectSource';
import { StudioCompositePreview } from './StudioCompositePreview';
import { StudioAssemblyEditor } from './StudioAssemblyEditor';
import { StudioSceneEditor } from './StudioSceneEditor';
import { StudioSourceLibrary } from './StudioSourceLibrary';

const PROJECT_HISTORY_LIMIT = 50;

export function StudioProjectEditor({
    initialProject,
    assets,
    recordings,
    isDisabled,
    onAssetChange,
    onProjectSaved,
}: {
    readonly initialProject: StudioProject;
    readonly assets: readonly StudioAsset[];
    readonly recordings: readonly StudioRecording[];
    readonly isDisabled: boolean;
    readonly onAssetChange: (asset: StudioAsset) => void;
    readonly onProjectSaved: (project: StudioProject) => void;
}) {
    const [project, setProject] = useState(initialProject);
    const projectReference = useRef(project);
    projectReference.current = project;
    const [history, setHistory] = useState<StudioProject[]>([]);
    const isTimelineEditReference = useRef(false);
    const [isWorking, setIsWorking] = useState(false);
    const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
    const [isRawAudio, setIsRawAudio] = useState(false);
    const [audibleMonitorId, setAudibleMonitorId] = useState<string | null>(null);
    const [hiddenMonitorIds, setHiddenMonitorIds] = useState<string[]>([]);
    const [transport, setTransport] = useState<RecordingStudioTransport | null>(null);
    const transportReference = useRef<RecordingStudioTransport | null>(null);
    const media = useRef(new Map<string, HTMLMediaElement>()).current;
    const durationSeconds = getStudioProjectDuration(project);
    const tracks = useMemo(() => createStudioTimelineTracks(project, assets), [project, assets]);
    const transportKey = JSON.stringify({
        durationSeconds,
        tracks: tracks.map((track) => ({ id: track.id, segments: track.segments })),
    });
    useEffect(() => {
        const seconds = transportReference.current?.getSnapshot().seconds ?? 0;
        const controller = new RecordingStudioTransport(tracks, durationSeconds);
        transportReference.current = controller;
        setTransport(controller);
        controller.seek(seconds);
        return () => controller.dispose();
        // The shared controller changes only when the time mapping changes, not a title, scene or storage location.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transportKey]);
    const rememberProjectRevision = () => {
        // Capture before scheduling React's updates: its next render updates the ref before evaluating history.
        const previous = projectReference.current;
        setHistory((values) => [...values.slice(-(PROJECT_HISTORY_LIMIT - 1)), previous]);
    };
    const updateProject = (next: StudioProject) => {
        if (isDisabled || isWorking) return;
        if (!isTimelineEditReference.current) rememberProjectRevision();
        setProject(next);
    };
    const beginTimelineEdit = () => {
        if (isDisabled || isWorking || isTimelineEditReference.current) return;
        rememberProjectRevision();
        isTimelineEditReference.current = true;
    };
    const autosave = useAdminAutosave({
        value: project,
        onSave: async () => {
            try {
                validateStudioProject(project);
            } catch (error) {
                throw new AdminSaveValidationError(error instanceof Error ? error.message : 'Opravte projekt.');
            }
            onProjectSaved(await persistStudioProject(project, assets));
            return true;
        },
    });
    useEffect(() => {
        if (isDisabled || isWorking) transport?.pause();
    }, [isDisabled, isWorking, transport]);
    const [exportError, setExportError] = useState<string | null>(null);
    return (
        <form ref={autosave.formRef} className="space-y-6" onSubmit={(event) => event.preventDefault()}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">Střižna · workshop</h2>
                <AdminAutosaveStatus {...autosave} />
            </div>
            <p className="break-all text-xs text-slate-500">
                Projekt {project.id} · metadata a média jsou místní pro tento profil, dokud výslovně nenahrajete zdroj
                na CDN. Adresa nesynchronizuje projekt mezi počítači.
            </p>
            <fieldset disabled={isDisabled || isWorking} className="space-y-5">
                <label className="block text-sm">
                    Název workshopu
                    <input
                        className="mt-1 w-full rounded border p-3"
                        value={project.title}
                        required
                        maxLength={160}
                        onChange={(event) => updateProject({ ...project, title: event.target.value })}
                    />
                </label>
                {transport && (
                    <StudioProjectPlayback
                        project={project}
                        assets={assets}
                        tracks={tracks}
                        transport={transport}
                        media={media}
                        isRawAudio={isRawAudio}
                        audibleMonitorId={audibleMonitorId}
                        hiddenMonitorIds={hiddenMonitorIds}
                        selectedSceneId={selectedSceneId}
                        onSceneSelect={setSelectedSceneId}
                        onChange={updateProject}
                        onBeginTimelineEdit={beginTimelineEdit}
                        onEndTimelineEdit={() => {
                            isTimelineEditReference.current = false;
                        }}
                        onMonitorVisibility={(id) => {
                            setHiddenMonitorIds((values) =>
                                values.includes(id) ? values.filter((value) => value !== id) : [...values, id],
                            );
                            transport.resynchronize();
                        }}
                        onMonitorAudio={(id) => {
                            setIsRawAudio(true);
                            setAudibleMonitorId(audibleMonitorId === id ? null : id);
                        }}
                        onCompositionAudio={() => setIsRawAudio(false)}
                    />
                )}
                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={!history.length}
                        onClick={() => {
                            const previous = history[history.length - 1];
                            setProject(previous);
                            setHistory((values) => values.slice(0, -1));
                        }}
                    >
                        Vrátit střih / kompozici
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            void flushAdminEditorSaves().then((isSaved) => {
                                if (!isSaved) {
                                    setExportError('Před exportem opravte a uložte projekt.');
                                    return;
                                }
                                try {
                                    downloadStudioProjectRecipe(project, assets);
                                    setExportError(null);
                                } catch (error) {
                                    setExportError(
                                        error instanceof Error ? error.message : 'Předpis nelze exportovat.',
                                    );
                                }
                            });
                        }}
                    >
                        Stáhnout projekt a předpis
                    </Button>
                </div>
                {exportError && (
                    <p role="alert" className="text-sm text-red-700">
                        {exportError}
                    </p>
                )}
            </fieldset>
            <StudioSourceLibrary
                project={project}
                assets={assets}
                recordings={recordings}
                isDisabled={isDisabled}
                onChange={(next) => {
                    // Source operations finish while the rest of the editor is locked, then register their metadata as one undo step.
                    rememberProjectRevision();
                    setProject(next);
                }}
                onAssetChange={onAssetChange}
                onBusyChange={setIsWorking}
            />
        </form>
    );
}

function StudioProjectPlayback({
    project,
    assets,
    tracks,
    transport,
    media,
    isRawAudio,
    audibleMonitorId,
    hiddenMonitorIds,
    selectedSceneId,
    onSceneSelect,
    onChange,
    onBeginTimelineEdit,
    onEndTimelineEdit,
    onMonitorVisibility,
    onMonitorAudio,
    onCompositionAudio,
}: {
    readonly project: StudioProject;
    readonly assets: readonly StudioAsset[];
    readonly tracks: ReturnType<typeof createStudioTimelineTracks>;
    readonly transport: RecordingStudioTransport;
    readonly media: Map<string, HTMLMediaElement>;
    readonly isRawAudio: boolean;
    readonly audibleMonitorId: string | null;
    readonly hiddenMonitorIds: readonly string[];
    readonly selectedSceneId: string | null;
    readonly onSceneSelect: (id: string) => void;
    readonly onChange: (project: StudioProject) => void;
    readonly onBeginTimelineEdit: () => void;
    readonly onEndTimelineEdit: () => void;
    readonly onMonitorVisibility: (id: string) => void;
    readonly onMonitorAudio: (id: string) => void;
    readonly onCompositionAudio: () => void;
}) {
    const snapshot = useSyncExternalStore(transport.subscribe, transport.getSnapshot, transport.getSnapshot);
    const durationSeconds = getStudioProjectDuration(project);
    const scene = getStudioSceneAt(project, snapshot.seconds);
    const metadata = useMemo(() => mapStudioProjectMetadata(project), [project]);
    const compositionScenes = placeStudioScenes(project).map((scene) => ({
        id: scene.id,
        startSeconds: scene.startSeconds,
        endSeconds: scene.endSeconds,
        minimumSeconds: getStudioSceneBoundaryRange(project, scene.id)?.startSeconds,
        maximumSeconds: getStudioSceneBoundaryRange(project, scene.id)?.endSeconds,
        label: `${project.groups.find((group) => group.id === scene.groupId)?.label} · ${project.tracks.find((track) => track.id === scene.backgroundTrackId)?.label ?? 'Bez obrazu'}${scene.overlayTrackId ? (scene.mask === 'circle' ? ' + kruh' : ' + kamera') : ''}`,
    }));
    const availableRanges = getStudioAvailableRanges(project, assets);
    return (
        <>
            <div
                className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3"
                aria-label="Společné přehrávání"
            >
                <Button type="button" onClick={snapshot.isPlayRequested ? transport.pause : transport.play}>
                    {snapshot.isPlayRequested ? 'Pozastavit vše' : 'Přehrát vše'}
                </Button>
                <output aria-label="Společný čas" className="font-mono" data-session-seconds={snapshot.seconds}>
                    {formatRecordingTimecode(snapshot.seconds)} / {formatRecordingTimecode(durationSeconds)}
                </output>
                <label className="text-xs">
                    Přejít na (s)
                    <input
                        aria-label="Přejít na čas projektu"
                        type="number"
                        min="0"
                        max={durationSeconds}
                        step="any"
                        value={Number.isFinite(snapshot.seconds) ? snapshot.seconds.toFixed(3) : '0'}
                        onChange={(event) => transport.seek(Number(event.target.value))}
                        className="ml-1 w-28 rounded border p-2"
                    />
                </label>
                <label className="text-xs">
                    Rychlost
                    <select
                        value={snapshot.speed}
                        onChange={(event) => transport.setSpeed(Number(event.target.value))}
                        className="ml-1 rounded border p-2"
                    >
                        {[0.25, 0.5, 1, 1.5, 2, 4].map((speed) => (
                            <option key={speed} value={speed}>
                                {speed}×
                            </option>
                        ))}
                    </select>
                </label>
                <span role="status" className="text-xs">
                    {snapshot.isSettling ? 'Srovnávám společný čas…' : snapshot.isPlaying ? 'Přehrávám' : 'Pozastaveno'}
                </span>
            </div>
            <StudioCompositePreview project={project} snapshot={snapshot} media={media} />
            <RecordingTimeline
                tracks={tracks}
                derivedTracks={metadata.derivedTracks}
                compositionScenes={compositionScenes}
                coordinateLabel="Čas projektu (sekundy)"
                onSceneSelect={onSceneSelect}
                onSceneMove={(id, seconds) => onChange(moveStudioSceneBoundary(project, id, seconds))}
                durationSeconds={durationSeconds}
                seconds={snapshot.seconds}
                selection={project.selection}
                artwork={{}}
                availableRanges={availableRanges}
                onSeek={transport.seek}
                onSelection={(selection) => onChange({ ...project, selection })}
                onBeginEdit={onBeginTimelineEdit}
                onEndEdit={onEndTimelineEdit}
            />
            <div className="flex flex-wrap items-center gap-3">
                {(['startSeconds', 'endSeconds'] as const).map((field) => (
                    <label key={field} className="text-xs">
                        {field === 'startSeconds' ? 'Projekt IN (s)' : 'Projekt OUT (s)'}
                        <input
                            type="number"
                            step="any"
                            min="0"
                            max={durationSeconds}
                            required
                            value={Number.isFinite(project.selection[field]) ? project.selection[field] : ''}
                            onChange={(event) =>
                                onChange({
                                    ...project,
                                    selection: {
                                        ...project.selection,
                                        [field]: event.target.value === '' ? NaN : Number(event.target.value),
                                    },
                                })
                            }
                            className="ml-1 w-32 rounded border p-2"
                        />
                    </label>
                ))}
            </div>
            <StudioSceneEditor
                project={project}
                seconds={snapshot.seconds}
                selectedSceneId={selectedSceneId}
                onSelect={onSceneSelect}
                onChange={onChange}
            />
            <StudioAssemblyEditor
                project={project}
                seconds={snapshot.seconds}
                onChange={onChange}
                onSeek={transport.seek}
            />
            <section aria-label="Surové stopy" className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold">Surové stopy · monitor</h3>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-pressed={!isRawAudio}
                        onClick={onCompositionAudio}
                    >
                        Poslech uložené kompozice
                    </Button>
                    <span className="text-xs text-slate-600">
                        {isRawAudio
                            ? 'Samostatný kontrolní poslech monitoru'
                            : `Jediný zvuk: ${project.tracks.find((track) => track.id === scene?.audioTrackId)?.label ?? 'ticho'}`}
                    </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {tracks.map((track) => (
                        <div key={track.id} className="space-y-2">
                            <StudioProjectSource
                                project={project}
                                track={track}
                                assets={assets}
                                transport={transport}
                                media={media}
                                isVisible={!hiddenMonitorIds.includes(track.id)}
                                isMuted={track.id !== (isRawAudio ? audibleMonitorId : scene?.audioTrackId)}
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onMonitorVisibility(track.id)}
                                >
                                    {hiddenMonitorIds.includes(track.id) ? 'Ukázat obraz' : 'Skrýt obraz'}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onMonitorAudio(track.id)}
                                >
                                    Kontrolní poslech
                                </Button>
                            </div>
                            <label className="block text-xs">
                                Role
                                <select
                                    value={project.tracks.find((candidate) => candidate.id === track.id)!.role}
                                    className="ml-1 rounded border p-1"
                                    onChange={(event) =>
                                        onChange({
                                            ...project,
                                            tracks: project.tracks.map((candidate) =>
                                                candidate.id === track.id
                                                    ? {
                                                          ...candidate,
                                                          role: event.target.value as typeof candidate.role,
                                                      }
                                                    : candidate,
                                            ),
                                        })
                                    }
                                >
                                    {['webcam', 'editor', 'application', 'audio', 'additional'].map((role) => (
                                        <option key={role}>{role}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block text-xs">
                                Název stopy
                                <input
                                    required
                                    maxLength={160}
                                    value={track.label}
                                    className="mt-1 w-full rounded border p-2"
                                    onChange={(event) =>
                                        onChange({
                                            ...project,
                                            tracks: project.tracks.map((candidate) =>
                                                candidate.id === track.id
                                                    ? { ...candidate, label: event.target.value }
                                                    : candidate,
                                            ),
                                        })
                                    }
                                />
                            </label>
                            {!project.clips.some((clip) => clip.trackId === track.id) && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        onChange({
                                            ...project,
                                            tracks: project.tracks.filter((candidate) => candidate.id !== track.id),
                                            scenes: project.scenes.map((candidate) => ({
                                                ...candidate,
                                                backgroundTrackId:
                                                    candidate.backgroundTrackId === track.id
                                                        ? null
                                                        : candidate.backgroundTrackId,
                                                overlayTrackId:
                                                    candidate.overlayTrackId === track.id
                                                        ? null
                                                        : candidate.overlayTrackId,
                                                audioTrackId:
                                                    candidate.audioTrackId === track.id ? null : candidate.audioTrackId,
                                            })),
                                        })
                                    }
                                >
                                    Odebrat prázdnou stopu
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </section>
            <details className="rounded border bg-white p-3 text-xs">
                <summary className="cursor-pointer">Mapovaná workshopová metadata a časování</summary>
                <p className="my-2">
                    Události, řeč, soukromé titulky a commit anchors čtou připnuté revize a stejný trim/sestavení jako
                    obraz. Cíl po ustálení zůstává 100 ms; skutečné odchylky měří browser testy. Publikace do místnosti
                    je samostatná akce v původním editoru záznamu.
                </p>
                {metadata.events.map((event) => (
                    <button
                        key={event.id}
                        type="button"
                        className="mr-2 rounded border p-2"
                        onClick={() => transport.seek(event.seconds)}
                    >
                        {formatRecordingTimecode(event.seconds)} · {event.title}
                    </button>
                ))}
                {metadata.unavailable.map((message) => (
                    <p key={message} className="text-amber-800">
                        {message}
                    </p>
                ))}
                <pre className="mt-3 max-h-48 overflow-auto">
                    {JSON.stringify(
                        {
                            activityIntervals: metadata.activityIntervals,
                            commitAnchors: metadata.commitAnchors,
                            autoView: metadata.autoView,
                        },
                        null,
                        2,
                    )}
                </pre>
            </details>
        </>
    );
}
