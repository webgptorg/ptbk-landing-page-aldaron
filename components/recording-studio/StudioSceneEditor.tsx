'use client';

import { Button } from '@/components/ui/button';
import { createStudioScene } from '@/lib/recording-studio/studioProjectStorage';
import { getStudioSceneAt } from '@/lib/recording-studio/studioProjectTimeline';
import type { StudioProject, StudioScene } from '@/lib/recording-studio/studioProjectTypes';

export function StudioSceneEditor({
    project,
    seconds,
    selectedSceneId,
    onSelect,
    onChange,
}: {
    readonly project: StudioProject;
    readonly seconds: number;
    readonly selectedSceneId: string | null;
    readonly onSelect: (id: string) => void;
    readonly onChange: (project: StudioProject) => void;
}) {
    const selected = project.scenes.find((scene) => scene.id === selectedSceneId) ?? getStudioSceneAt(project, seconds);
    const updateScene = (change: Partial<StudioScene>) => {
        if (selected)
            onChange({
                ...project,
                scenes: project.scenes.map((scene) => (scene.id === selected.id ? { ...scene, ...change } : scene)),
            });
    };
    const addScene = () => {
        const group = project.groups.find(
            (candidate) =>
                seconds >= candidate.projectStartSeconds &&
                seconds < candidate.projectStartSeconds + candidate.sourceOutSeconds - candidate.sourceInSeconds,
        );
        if (!group) return;
        const offsetSeconds = seconds - group.projectStartSeconds + group.sourceInSeconds;
        const scene = {
            ...(getStudioSceneAt(project, seconds) ?? createStudioScene(group.id, project.tracks)),
            id: crypto.randomUUID(),
            groupId: group.id,
            offsetSeconds,
        };
        onChange({ ...project, scenes: [...project.scenes, scene] });
        onSelect(scene.id);
    };
    const selectTrack = (label: string, field: 'backgroundTrackId' | 'overlayTrackId' | 'audioTrackId') =>
        selected && (
            <label className="text-sm">
                {label}
                <select
                    className="ml-2 rounded border p-2"
                    value={selected[field] ?? ''}
                    onChange={(event) => updateScene({ [field]: event.target.value || null })}
                >
                    <option value="">Žádný zdroj</option>
                    {project.tracks
                        .filter((track) => field === 'audioTrackId' || track.role !== 'audio')
                        .map((track) => (
                            <option key={track.id} value={track.id}>
                                {track.label}
                            </option>
                        ))}
                </select>
            </label>
        );
    return (
        <section aria-label="Nastavení kompozice" className="space-y-4 rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">Scény a zvuk kompozice</h3>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                        !project.groups.length ||
                        project.scenes.some((scene) => {
                            const group = project.groups.find((candidate) => candidate.id === scene.groupId)!;
                            return scene.offsetSeconds === seconds - group.projectStartSeconds + group.sourceInSeconds;
                        })
                    }
                    onClick={addScene}
                >
                    Nová scéna v tomto čase
                </Button>
            </div>
            {selected ? (
                <>
                    <label className="text-sm">
                        Scéna
                        <select
                            className="ml-2 max-w-full rounded border p-2"
                            value={selected.id}
                            onChange={(event) => onSelect(event.target.value)}
                        >
                            {project.scenes.map((scene) => (
                                <option key={scene.id} value={scene.id}>
                                    {project.groups.find((group) => group.id === scene.groupId)?.label} ·{' '}
                                    {scene.offsetSeconds.toFixed(3)} s
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm">
                            Začátek v části (s)
                            <input
                                type="number"
                                min="0"
                                required
                                step="any"
                                value={Number.isFinite(selected.offsetSeconds) ? selected.offsetSeconds : ''}
                                className="ml-2 w-28 rounded border p-2"
                                onChange={(event) =>
                                    updateScene({
                                        offsetSeconds: event.target.value === '' ? NaN : Number(event.target.value),
                                    })
                                }
                            />
                        </label>
                        <label className="text-sm">
                            Předvolba
                            <select
                                className="ml-2 rounded border p-2"
                                value={!selected.overlayTrackId ? 'fullscreen' : selected.mask}
                                onChange={(event) =>
                                    updateScene(
                                        event.target.value === 'fullscreen'
                                            ? { overlayTrackId: null }
                                            : {
                                                  mask: event.target.value as StudioScene['mask'],
                                                  overlayTrackId:
                                                      project.tracks.find((track) => track.role === 'webcam')?.id ??
                                                      project.tracks.find(
                                                          (track) =>
                                                              track.id !== selected.backgroundTrackId &&
                                                              track.role !== 'audio',
                                                      )?.id ??
                                                      null,
                                              },
                                    )
                                }
                            >
                                <option value="fullscreen">Celá obrazovka</option>
                                <option value="rectangle">Obrazovka + obdélníková kamera</option>
                                <option value="circle">Obrazovka + kruhová kamera</option>
                            </select>
                        </label>
                        {selectTrack('Hlavní obraz', 'backgroundTrackId')}
                        {selectTrack('Kamera / overlay', 'overlayTrackId')}
                        {selectTrack('Jediný zvuk', 'audioTrackId')}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {(['fit', 'overlayFit'] as const).map((field) => (
                            <label key={field} className="text-xs">
                                {field === 'fit' ? 'Hlavní obraz' : 'Overlay'}
                                <select
                                    className="ml-2 rounded border p-2"
                                    value={selected[field]}
                                    onChange={(event) => updateScene({ [field]: event.target.value })}
                                >
                                    <option value="contain">Celý zdroj (fit)</option>
                                    <option value="cover">Vyplnit a oříznout</option>
                                </select>
                            </label>
                        ))}
                        {(['x', 'y', 'width', 'height'] as const).map((field) => (
                            <label key={field} className="text-xs">
                                {field}
                                <input
                                    aria-label={`Overlay ${field}`}
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    required
                                    value={Number.isFinite(selected.rectangle[field]) ? selected.rectangle[field] : ''}
                                    onChange={(event) =>
                                        updateScene({
                                            rectangle: {
                                                ...selected.rectangle,
                                                [field]: event.target.value === '' ? NaN : Number(event.target.value),
                                            },
                                        })
                                    }
                                    className="ml-1 w-20 rounded border p-2"
                                />
                            </label>
                        ))}
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={project.scenes.filter((scene) => scene.groupId === selected.groupId).length <= 1}
                            onClick={() =>
                                onChange({
                                    ...project,
                                    scenes: project.scenes.filter((scene) => scene.id !== selected.id),
                                })
                            }
                        >
                            Odebrat scénu
                        </Button>
                    </div>
                    <p className="text-xs text-slate-600">
                        Rozložení je uložené v souřadnicích 0–1. Scény mají tvrdé řezy. Každá část/scéna vybírá jediný
                        zvuk; volby poslechu monitoru se do předpisu neukládají.
                    </p>
                </>
            ) : (
                <p className="text-sm text-slate-500">Přidejte část workshopu pro první scénu.</p>
            )}
        </section>
    );
}
