'use client';

import { Button } from '@/components/ui/button';
import { assembleStudioGroups, splitStudioGroup } from '@/lib/recording-studio/studioProjectTimeline';
import type { StudioPartGroup, StudioProject } from '@/lib/recording-studio/studioProjectTypes';
import { formatRecordingTimecode } from '@/lib/recording-studio/recordingStudioSessionTime';

function StudioSecondsInput({
    label,
    value,
    onChange,
    isSigned = false,
}: {
    readonly label: string;
    readonly value: number;
    readonly onChange: (value: number) => void;
    readonly isSigned?: boolean;
}) {
    return (
        <label className="text-xs">
            {label}
            <input
                type="number"
                step="any"
                min={isSigned ? undefined : 0}
                required
                value={Number.isFinite(value) ? value : ''}
                onChange={(event) => onChange(event.target.value === '' ? NaN : Number(event.target.value))}
                className="mt-1 block w-32 rounded border p-2"
            />
        </label>
    );
}

export function StudioAssemblyEditor({
    project,
    seconds,
    onChange,
    onSeek,
}: {
    readonly project: StudioProject;
    readonly seconds: number;
    readonly onChange: (project: StudioProject) => void;
    readonly onSeek: (seconds: number) => void;
}) {
    const updateGroup = (group: StudioPartGroup, change: Partial<StudioPartGroup>, isReassembled = true) => {
        const groups = project.groups.map((candidate) =>
            candidate.id === group.id ? { ...group, ...change } : candidate,
        );
        onChange(isReassembled ? assembleStudioGroups(project, groups) : { ...project, groups });
    };
    const moveGroup = (index: number, direction: number) => {
        const groups = [...project.groups];
        const destination = index + direction;
        if (destination < 0 || destination >= groups.length) return;
        [groups[index], groups[destination]] = [groups[destination], groups[index]];
        onChange(assembleStudioGroups(project, groups));
    };
    return (
        <section aria-label="Sestavení workshopu" className="space-y-4">
            <h3 className="font-semibold">Propojené části</h3>
            <p className="text-xs text-slate-600">
                IN/OUT a řez platí pro všechny současné zdroje části. Pořadí zachovává jejich synchronizaci. Mezeru lze
                vložit ručním začátkem na ose; překryvy jsou odmítnuté.
            </p>
            {project.groups.map((group, index) => (
                <article
                    key={group.id}
                    className="space-y-3 rounded-xl border bg-white p-4"
                    aria-label={`Část ${group.label}`}
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="flex-1 text-sm">
                            Název části
                            <input
                                value={group.label}
                                required
                                maxLength={160}
                                onChange={(event) => updateGroup(group, { label: event.target.value }, false)}
                                className="ml-2 rounded border p-2"
                            />
                        </label>
                        <span className="font-mono text-xs">
                            {formatRecordingTimecode(group.projectStartSeconds)} ·{' '}
                            {group.isInterrupted ? 'Přerušená · jen potvrzené části' : 'Dokončená část'}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <StudioSecondsInput
                            label="Zdrojové IN (s)"
                            value={group.sourceInSeconds}
                            onChange={(sourceInSeconds) => updateGroup(group, { sourceInSeconds })}
                        />
                        <StudioSecondsInput
                            label="Zdrojové OUT (s)"
                            value={group.sourceOutSeconds}
                            onChange={(sourceOutSeconds) => updateGroup(group, { sourceOutSeconds })}
                        />
                        <StudioSecondsInput
                            label="Začátek na ose (s)"
                            value={group.projectStartSeconds}
                            onChange={(projectStartSeconds) => updateGroup(group, { projectStartSeconds }, false)}
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={index === 0}
                            onClick={() => moveGroup(index, -1)}
                        >
                            Dříve
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={index === project.groups.length - 1}
                            onClick={() => moveGroup(index, 1)}
                        >
                            Později
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onSeek(group.projectStartSeconds)}
                        >
                            Přejít na část
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                                seconds <= group.projectStartSeconds ||
                                seconds >= group.projectStartSeconds + group.sourceOutSeconds - group.sourceInSeconds
                            }
                            onClick={() => onChange(splitStudioGroup(project, group.id, seconds))}
                        >
                            Řez všech stop zde
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                onChange(
                                    assembleStudioGroups(
                                        {
                                            ...project,
                                            clips: project.clips.filter((clip) => clip.groupId !== group.id),
                                            scenes: project.scenes.filter((scene) => scene.groupId !== group.id),
                                        },
                                        project.groups.filter((candidate) => candidate.id !== group.id),
                                    ),
                                )
                            }
                        >
                            Odebrat část z projektu
                        </Button>
                    </div>
                    <details>
                        <summary className="cursor-pointer text-xs text-cyan-800">
                            Mapování rolí a ruční posun zdrojů
                        </summary>
                        <div className="mt-3 space-y-3">
                            {project.clips
                                .filter((clip) => clip.groupId === group.id)
                                .map((clip) => (
                                    <div key={clip.id} className="flex flex-wrap items-end gap-3">
                                        <label className="text-xs">
                                            Stopa
                                            <select
                                                aria-label="Role klipu"
                                                value={clip.trackId}
                                                className="mt-1 block rounded border p-2"
                                                onChange={(event) =>
                                                    onChange({
                                                        ...project,
                                                        clips: project.clips.map((candidate) =>
                                                            candidate.id === clip.id
                                                                ? { ...clip, trackId: event.target.value }
                                                                : candidate,
                                                        ),
                                                    })
                                                }
                                            >
                                                {project.tracks.map((track) => (
                                                    <option key={track.id} value={track.id}>
                                                        {track.label} · {track.role}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <StudioSecondsInput
                                            label="Posun v části (s)"
                                            isSigned
                                            value={clip.groupOffsetSeconds}
                                            onChange={(groupOffsetSeconds) =>
                                                onChange({
                                                    ...project,
                                                    clips: project.clips.map((candidate) =>
                                                        candidate.id === clip.id
                                                            ? { ...clip, groupOffsetSeconds }
                                                            : candidate,
                                                    ),
                                                })
                                            }
                                        />
                                        <span className="text-xs text-slate-500">
                                            Zdrojový rozsah {clip.sourceInSeconds.toFixed(3)}–
                                            {clip.sourceOutSeconds.toFixed(3)} s · {clip.assetId.slice(0, 8)}
                                        </span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                onChange({
                                                    ...project,
                                                    clips: project.clips.filter(
                                                        (candidate) => candidate.id !== clip.id,
                                                    ),
                                                })
                                            }
                                        >
                                            Odebrat klip z části
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    </details>
                </article>
            ))}
        </section>
    );
}
