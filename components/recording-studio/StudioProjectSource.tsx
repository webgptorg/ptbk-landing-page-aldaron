'use client';

import { Button } from '@/components/ui/button';
import { RecordingStudioTransport } from '@/lib/recording-studio/RecordingStudioTransport';
import { createStudioPlaybackTrack, getStudioClipAt } from '@/lib/recording-studio/studioProjectTimeline';
import { resolveStudioPlayback, type StudioPlaybackResource } from '@/lib/recording-studio/studioMediaSource';
import type { StudioAsset, StudioProject } from '@/lib/recording-studio/studioProjectTypes';
import type { RecordingTrack } from '@/lib/recording-studio/recordingStudioTypes';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

export function StudioProjectSource({
    project,
    track,
    assets,
    transport,
    media,
    isMuted,
    isVisible,
}: {
    readonly project: StudioProject;
    readonly track: RecordingTrack;
    readonly assets: readonly StudioAsset[];
    readonly transport: RecordingStudioTransport;
    readonly media: Map<string, HTMLMediaElement>;
    readonly isMuted: boolean;
    readonly isVisible: boolean;
}) {
    const snapshot = useSyncExternalStore(transport.subscribe, transport.getSnapshot, transport.getSnapshot);
    const clip = getStudioClipAt(project, track.id, snapshot.seconds);
    const asset = assets.find((candidate) => candidate.id === clip?.assetId);
    const assetLocationKey = asset
        ? JSON.stringify(asset.location.kind === 'file' ? asset.location.identity : asset.location)
        : '';
    const clipKey = clip
        ? `${clip.id}:${clip.projectStartSeconds}:${clip.projectEndSeconds}:${clip.sourceStartSeconds}`
        : '';
    const [resource, setResource] = useState<{ readonly url: string; readonly key: string } | null>(null);
    const [attempt, setAttempt] = useState(0);
    const elementReference = useRef<HTMLVideoElement & HTMLAudioElement>(null);
    useEffect(() => {
        let isDisposed = false;
        let playback: StudioPlaybackResource | null = null;
        let refreshTimer: ReturnType<typeof setTimeout> | undefined;
        setResource(null);
        if (!clip) {
            transport.markGap(track.id);
            return;
        }
        if (!asset) {
            transport.failSource(
                track.id,
                'Zdroj tohoto projektu v tomto profilu chybí. Znovu připojte médium; střih zůstává zachovaný.',
            );
            return;
        }
        transport.beginSourceLoading(track.id);
        void resolveStudioPlayback(asset)
            .then((result) => {
                if (isDisposed) {
                    result.dispose();
                    return;
                }
                playback = result;
                setResource({ url: result.url, key: clipKey });
                if (result.expiresAt)
                    refreshTimer = setTimeout(
                        () => setAttempt((value) => value + 1),
                        Math.max(1000, result.expiresAt - Date.now() - 60_000),
                    );
            })
            .catch((error: unknown) => {
                if (!isDisposed)
                    transport.failSource(track.id, error instanceof Error ? error.message : 'Zdroj není dostupný.');
            });
        return () => {
            isDisposed = true;
            clearTimeout(refreshTimer);
            playback?.dispose();
        };
        // Handle identity/timing/location transitions, not every transport tick or unrelated metadata edit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clipKey, asset, assetLocationKey, transport, attempt, track.id]);
    useEffect(() => {
        const element = elementReference.current;
        if (!element || !resource || resource.key !== clipKey || !asset || !clip) return;
        media.set(track.id, element);
        const unregister = transport.register(
            createStudioPlaybackTrack(track, clip, asset),
            element,
            asset.bounds.firstTimestampSeconds,
            asset.bounds.endTimestampSeconds,
            asset.bounds.availableStartTimestampSeconds,
        );
        // React can already have applied the next clip's src before this effect is cleaned up.
        // Clearing that attribute here would unload the new part at precisely the join.
        return () => {
            unregister();
            if (media.get(track.id) === element) media.delete(track.id);
            element.pause();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resource, clipKey, transport, track.id, media]);
    const isReady = snapshot.sources[track.id] === 'ready';
    const activeUrl = resource?.key === clipKey ? resource.url : undefined;
    const mediaProps = {
        ref: elementReference,
        src: activeUrl,
        muted: isMuted || !isReady,
        crossOrigin: 'anonymous' as const,
        preload: 'metadata',
        controls: false,
        'data-source-id': track.id,
        'data-clip-id': clip?.id,
        'aria-label': `Náhled záznamu: ${track.label}`,
    };
    return (
        <article
            className="min-w-0 space-y-2 rounded-xl border bg-white p-3"
            aria-label={`Monitor ${track.label}`}
            data-source-state={snapshot.sources[track.id]}
        >
            <h3 className="truncate font-medium">{track.label}</h3>
            <div className="relative aspect-video overflow-hidden rounded bg-slate-950 text-white">
                {activeUrl &&
                    (asset?.kind === 'audio' ? (
                        <audio {...mediaProps} />
                    ) : (
                        <video
                            {...mediaProps}
                            playsInline
                            className={`h-full w-full object-contain ${isReady && isVisible ? '' : 'invisible'}`}
                        />
                    ))}
                {(!isReady || !isVisible || asset?.kind === 'audio') && (
                    <p className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs">
                        {!clip
                            ? 'Mezera · žádné médium'
                            : snapshot.sources[track.id] === 'error'
                              ? snapshot.errors[track.id]
                              : !isReady
                                ? 'Čekám na zdroj a společný čas…'
                                : asset?.kind === 'audio'
                                  ? isMuted
                                      ? 'Zvuk ztlumený'
                                      : 'Zvuk kompozice / monitoru'
                                  : 'Obraz skrytý v monitoru'}
                    </p>
                )}
            </div>
            {snapshot.sources[track.id] === 'error' && (
                <Button type="button" size="sm" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
                    Obnovit zdroj
                </Button>
            )}
        </article>
    );
}
