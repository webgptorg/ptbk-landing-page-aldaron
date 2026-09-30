'use client';

import { getHostedRecordingCommitAt, type HostedRecordingCommitSelection,
    type HostedRecordingMetadata } from '@/lib/workshops/hostedRecording/hostedRecordingTimeline';
import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';

const EMPTY_SELECTION: HostedRecordingCommitSelection = { state: 'absent', sha: null };

class WorkshopRecordingTimelineStore {
    private selection: HostedRecordingCommitSelection = EMPTY_SELECTION;
    private readonly listeners = new Set<() => void>();

    public getSelection = () => this.selection;
    public subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    public constructor(private readonly connectedRepository: { readonly owner: string; readonly name: string } | null) {}
    public publish(metadata: HostedRecordingMetadata | null, seconds: number) {
        const next = metadata ? getHostedRecordingCommitAt(metadata, seconds, this.connectedRepository) : EMPTY_SELECTION;
        if (next.state === this.selection.state && next.sha === this.selection.sha) return;
        this.selection = next;
        this.listeners.forEach((listener) => listener());
    }
}

const WORKSHOP_RECORDING_TIMELINE_CONTEXT = createContext<WorkshopRecordingTimelineStore | null>(null);

export function WorkshopRecordingTimelineProvider({ children, workshopSlug, repository = null }: {
    readonly children: ReactNode; readonly workshopSlug: string;
    readonly repository?: { readonly owner: string; readonly name: string } | null;
}) {
    const store = useMemo(() => new WorkshopRecordingTimelineStore(repository),
        [workshopSlug, repository?.owner, repository?.name]);
    return <WORKSHOP_RECORDING_TIMELINE_CONTEXT.Provider value={store}>{children}</WORKSHOP_RECORDING_TIMELINE_CONTEXT.Provider>;
}

export function useWorkshopRecordingTimelineStore() {
    return useContext(WORKSHOP_RECORDING_TIMELINE_CONTEXT);
}

export function useWorkshopRecordingCommitSelection(): HostedRecordingCommitSelection {
    const store = useWorkshopRecordingTimelineStore();
    return useSyncExternalStore(store?.subscribe ?? (() => () => undefined), store?.getSelection ?? (() => EMPTY_SELECTION),
        () => EMPTY_SELECTION);
}
