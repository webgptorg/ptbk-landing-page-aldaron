'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { openStudioRecordingProject, listStudioAssets, listStudioProjects, saveStudioProject } from '@/lib/recording-studio/studioProjectStorage';
import { getRecordingSelection } from '@/lib/recording-studio/recordingStudioSessionTime';
import { runRecordingStudioWork } from '@/lib/recording-studio/recordingStudioWork';
import type { StudioAsset, StudioProject } from '@/lib/recording-studio/studioProjectTypes';
import type { StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { StudioProjectEditor } from './StudioProjectEditor';

/** Both historic entry points open the same small local recipe and the same preview-based editor. */
export function RecordingEditor({ recording, isDisabled, onUseSourceConfiguration, onAppend, onBusyChange }: {
    readonly recording: StudioRecording; readonly isDisabled: boolean;
    readonly onChange: (recording: StudioRecording) => void;
    readonly onUseSourceConfiguration: (reportSuccess: (message: string) => void) => void;
    readonly onAppend: () => void;
    readonly onBusyChange?: (value: boolean) => void;
}) {
    const [resource, setResource] = useState<{ project: StudioProject; assets: StudioAsset[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
    const opening = useRef<Promise<{ project: StudioProject; assets: StudioAsset[] }> | null>(null);
    useEffect(() => {
        if (isDisabled || resource) return;
        let disposed = false;
        opening.current ??= runRecordingStudioWork(async () => {
            const existed = (await listStudioProjects()).some((project) => project.originRecordingId === recording.id);
            let project = await openStudioRecordingProject(recording);
            if (!existed) project = await saveStudioProject({ ...project, selection: getRecordingSelection(recording) });
            return { project, assets: await listStudioAssets() };
        });
        void opening.current.then((value) => { if (!disposed) setResource(value); }).catch((error: unknown) => {
            opening.current = null;
            if (!disposed) setError(error instanceof Error ? error.message : 'Záznam nelze otevřít.');
        });
        return () => { disposed = true; };
        // Keep one opening transaction through Strict Mode and title/autosave updates.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recording.id, isDisabled]);
    if (error) return <p role="alert" className="text-sm text-red-700">{error}</p>;
    if (!resource) return <p role="status">Načítám místní náhled a střih…</p>;
    return <div className="space-y-5">
        <StudioProjectEditor initialProject={resource.project} assets={resource.assets} recordings={[recording]} isDisabled={isDisabled} onBusyChange={onBusyChange}
            onAssetChange={(asset) => setResource((previous) => previous ? { ...previous, assets: [...previous.assets.filter((item) => item.id !== asset.id), asset] } : previous)}
            onProjectSaved={(project) => setResource((previous) => previous ? { ...previous, project } : previous)} />
        <details className="rounded-xl border bg-white p-4"><summary className="cursor-pointer text-sm">Donahrání a nastavení zdrojů</summary>
            <div className="mt-3 flex flex-wrap gap-3"><Button type="button" variant="outline" disabled={isDisabled || recording.status !== 'complete'} onClick={onAppend}>Donahrát do tohoto projektu</Button>
                <Button type="button" variant="outline" disabled={isDisabled} onClick={() => onUseSourceConfiguration(setRestoreMessage)}>Použít konfiguraci pro nový záznam</Button></div>
            {restoreMessage && <p role="status" className="mt-3 text-sm">{restoreMessage}</p>}
        </details>
    </div>;
}
