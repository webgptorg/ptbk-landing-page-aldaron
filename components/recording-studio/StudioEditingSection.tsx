'use client';

import { Button } from '@/components/ui/button';
import {
    createStudioProject,
    deleteStudioProject,
    listStudioAssets,
    listStudioProjects,
    openStudioRecordingProject,
    saveStudioProject,
} from '@/lib/recording-studio/studioProjectStorage';
import { synchronizeStudioProjectReferences } from '@/lib/recording-studio/studioProjectPersistence';
import { getStudioProjectDuration, validateStudioProject } from '@/lib/recording-studio/studioProjectTimeline';
import { runRecordingStudioWork } from '@/lib/recording-studio/recordingStudioWork';
import {
    getStudioProjectPath,
    STUDIO_EDITOR_PATH,
    type StudioAsset,
    type StudioProject,
} from '@/lib/recording-studio/studioProjectTypes';
import type { StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { formatRecordingDuration } from '@/lib/recording-studio/recordingStudioTiming';
import { flushAdminEditorSaves } from '@/lib/admin/adminPendingSaves';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudioProjectEditor } from './StudioProjectEditor';
import { AdminEditorButton } from '@/components/admin/AdminEditorButton';

export function StudioEditingSection({
    projectId,
    recordings,
    isReady,
    isDisabled,
}: {
    readonly projectId?: string;
    readonly recordings: readonly StudioRecording[];
    readonly isReady: boolean;
    readonly isDisabled: boolean;
}) {
    const [projects, setProjects] = useState<StudioProject[]>([]);
    const [assets, setAssets] = useState<StudioAsset[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isOpeningReference = useRef(false);
    const router = useRouter();
    useEffect(() => {
        if (!isReady) return;
        let isDisposed = false;
        setIsLoading(true);
        void Promise.all([listStudioProjects(), listStudioAssets()])
            .then(([loadedProjects, loadedAssets]) => {
                if (!isDisposed) {
                    setProjects(loadedProjects);
                    setAssets(loadedAssets);
                    setIsLoading(false);
                }
            })
            .catch((error: unknown) => {
                if (!isDisposed) {
                    setErrorMessage(error instanceof Error ? error.message : 'Místní projekt nelze načíst.');
                    setIsLoading(false);
                }
            });
        return () => {
            isDisposed = true;
        };
    }, [isReady, projectId]);
    const openProject = (operation: () => Promise<StudioProject>) => {
        if (isOpeningReference.current || isDisabled) return;
        isOpeningReference.current = true;
        setErrorMessage(null);
        void runRecordingStudioWork(async () => {
            if (!(await flushAdminEditorSaves())) return;
            const project = await operation();
            router.push(getStudioProjectPath(project.id));
        })
            .catch((error: unknown) =>
                setErrorMessage(error instanceof Error ? error.message : 'Projekt nelze vytvořit.'),
            )
            .finally(() => {
                isOpeningReference.current = false;
            });
    };
    const selected = projects.find((project) => project.id === projectId);
    let validationError: string | null = null;
    if (selected) {
        try {
            validateStudioProject(selected);
        } catch (error) {
            validationError = error instanceof Error ? error.message : 'Uložený předpis není platný.';
        }
    }
    const updateAsset = (asset: StudioAsset) =>
        setAssets((values) => [...values.filter((candidate) => candidate.id !== asset.id), asset]);
    return (
        <section className="space-y-5" aria-label="Střižna">
            {errorMessage && (
                <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {errorMessage}
                </p>
            )}
            {projectId ? (
                isLoading ? (
                    <p role="status">Načítám projekt Střižny…</p>
                ) : !selected ? (
                    <div className="space-y-3 rounded border border-amber-300 bg-amber-50 p-4">
                        <h2 className="font-semibold">Projekt v tomto profilu chybí</h2>
                        <p className="text-sm">
                            Adresa přenáší identitu, nikoli místní metadata nebo média. Otevřete původní
                            prohlížeč/profil. Prázdný projekt ani hromadné stažení se nevytváří.
                        </p>
                        <Link href={STUDIO_EDITOR_PATH} className="underline">
                            Knihovna projektů
                        </Link>
                    </div>
                ) : validationError ? (
                    <p role="alert">Uložená metadata projektu zůstala zachovaná: {validationError}</p>
                ) : (
                    <StudioProjectEditor
                        key={selected.id}
                        initialProject={selected}
                        assets={assets}
                        recordings={recordings}
                        isDisabled={isDisabled}
                        onAssetChange={updateAsset}
                        onProjectSaved={(project) =>
                            setProjects((values) =>
                                values.map((candidate) => (candidate.id === project.id ? project : candidate)),
                            )
                        }
                    />
                )
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-bold">Střižna</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Sestavte dlouhý workshop z místních záznamů, vlastních souborů a HTTPS/CDN zdrojů.
                                Kamera ani mikrofon nejsou potřeba.
                            </p>
                        </div>
                        <Button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => openProject(() => saveStudioProject(createStudioProject()))}
                        >
                            Nový projekt
                        </Button>
                    </div>
                    {isLoading && <p role="status">Načítám místní projekty…</p>}
                    {projects.map((project) => (
                        <article
                            key={project.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"
                        >
                            <div>
                                <h3 className="font-semibold">{project.title}</h3>
                                <p className="text-xs text-slate-500">
                                    {project.groups.length} částí · {project.tracks.length} stop ·{' '}
                                    {formatRecordingDuration(getStudioProjectDuration(project))}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button asChild variant="outline">
                                    <Link href={getStudioProjectPath(project.id)}>Otevřít projekt</Link>
                                </Button>
                                <AdminEditorButton
                                    label="Smazat projekt"
                                    title="Smazat pouze projektový předpis"
                                    buttonProps={{ disabled: isDisabled }}
                                >
                                    {(closeEditor) => (
                                        <div className="space-y-3">
                                            <p className="text-sm">
                                                Smaže se místní projekt „{project.title}“. Zdrojová média, externí
                                                soubory i ostatní projekty zůstanou.
                                            </p>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() => {
                                                    void runRecordingStudioWork(async () => {
                                                        await deleteStudioProject(project.id);
                                                        setProjects((values) =>
                                                            values.filter((candidate) => candidate.id !== project.id),
                                                        );
                                                        closeEditor();
                                                        const isRemotePresent = assets.some(
                                                            (asset) =>
                                                                asset.location.kind === 's3' &&
                                                                project.clips.some((clip) => clip.assetId === asset.id),
                                                        );
                                                        if (isRemotePresent)
                                                            await synchronizeStudioProjectReferences(
                                                                { ...project, clips: [] },
                                                                assets,
                                                                false,
                                                            );
                                                    }).catch((error: unknown) =>
                                                        setErrorMessage(
                                                            error instanceof Error
                                                                ? error.message
                                                                : 'Odstranění projektu selhalo.',
                                                        ),
                                                    );
                                                }}
                                            >
                                                Smazat předpis
                                            </Button>
                                        </div>
                                    )}
                                </AdminEditorButton>
                            </div>
                        </article>
                    ))}
                    <h3 className="font-semibold">Záznamy připravené pro střih</h3>
                    {recordings
                        .filter((recording) => recording.status !== 'recording')
                        .map((recording) => (
                            <article
                                key={recording.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"
                            >
                                <span className="text-sm">
                                    {recording.title} · {formatRecordingDuration(recording.durationSeconds)} ·{' '}
                                    {recording.tracks.length} stop
                                    {recording.status === 'interrupted' ? ' · přerušený, jen potvrzené části' : ''}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isDisabled}
                                    onClick={() => openProject(() => openStudioRecordingProject(recording))}
                                >
                                    Otevřít ve střižně
                                </Button>
                            </article>
                        ))}
                </>
            )}
        </section>
    );
}
