'use client';

import { Button } from '@/components/ui/button';
import { RecordingStudioTransport } from '@/lib/recording-studio/RecordingStudioTransport';
import { getRecordingPartAtTime, getRecordingPartTrack } from '@/lib/recording-studio/recordingStudioSessionTime';
import { inspectRecordingMedia, openRecordingMedia, readRecordingMediaArtwork, type RecordingMediaArtwork, type RecordingMediaBounds } from '@/lib/recording-studio/recordingStudioMedia';
import { readRecordingPart } from '@/lib/recording-studio/recordingStudioStorage';
import type { RecordingTrack } from '@/lib/recording-studio/recordingStudioTypes';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';

const SOURCE_STATE_LABELS = { loading: 'Načítám médium…', buffering: 'Srovnávám čas / čekám na dekodér…', gap: 'V tomto čase chybí médium', error: 'Náhled není dostupný', ready: 'Připraveno' };

export function RecordingSourceMonitor({ recordingId, track, transport, isVisible, isMuted, onBounds, onArtwork, children }: {
    readonly recordingId: string; readonly track: RecordingTrack; readonly transport: RecordingStudioTransport;
    readonly isVisible: boolean; readonly isMuted: boolean;
    readonly onBounds: (id: string, bounds: RecordingMediaBounds | null) => void;
    readonly onArtwork: (id: string, artwork: RecordingMediaArtwork) => void;
    readonly children: ReactNode;
}) {
    const [resource, setResource] = useState<{ url: string; bounds: RecordingMediaBounds; partId: string } | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [isArtworkFailed, setIsArtworkFailed] = useState(false);
    const mediaReference = useRef<HTMLVideoElement & HTMLAudioElement>(null);
    const previousVisibility = useRef(isVisible);
    const snapshot = useSyncExternalStore(transport.subscribe, transport.getSnapshot, transport.getSnapshot);
    const activePart = getRecordingPartAtTime(track, snapshot.seconds);
    const activePartId = activePart?.id ?? null;
    const sourceState = snapshot.sources[track.id] ?? 'loading';
    useEffect(() => {
        const controller = new AbortController();
        let objectUrl: string | null = null;
        let input: ReturnType<typeof openRecordingMedia> | null = null;
        setResource(null); setIsArtworkFailed(false);
        void (async () => {
            try {
                if (!activePart) { transport.markGap(track.id); onBounds(track.id, null); return; }
                const playbackTrack = getRecordingPartTrack(track, activePart);
                const blob = await readRecordingPart(recordingId, activePart, controller.signal);
                controller.signal.throwIfAborted();
                input = openRecordingMedia(blob);
                const bounds = await inspectRecordingMedia(input, playbackTrack);
                controller.signal.throwIfAborted();
                objectUrl = URL.createObjectURL(blob);
                setResource({ url: objectUrl, bounds, partId: activePart.id });
                onBounds(track.id, bounds);
                try {
                    const artwork = await readRecordingMediaArtwork(input, bounds, controller.signal);
                    if (!controller.signal.aborted) onArtwork(track.id, { thumbnails: artwork.thumbnails.map((item) => ({ ...item, seconds: item.seconds + activePart.sessionStartSeconds })),
                        peaks: artwork.peaks.map((item) => ({ ...item, seconds: item.seconds + activePart.sessionStartSeconds })) });
                } catch { if (!controller.signal.aborted) setIsArtworkFailed(true); }
            } catch (error) {
                if (!controller.signal.aborted) {
                    onBounds(track.id, null);
                    transport.failSource(track.id, error instanceof Error ? error.message : 'Místní médium není dostupné.');
                }
            }
        })();
        return () => { controller.abort(); input?.dispose(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [recordingId, track, transport, attempt, onBounds, onArtwork, activePartId]);
    useEffect(() => {
        if (!resource || resource.partId !== activePartId || !activePart || !mediaReference.current) return;
        return transport.register(getRecordingPartTrack(track, activePart), mediaReference.current, resource.bounds.firstTimestampSeconds, resource.bounds.endTimestampSeconds, resource.bounds.availableStartTimestampSeconds);
    }, [resource, track, transport, activePartId]);
    useLayoutEffect(() => {
        // Browsers may stop decoding hidden pictures while their media clock/audio keeps advancing.
        // Rejoin through the common seek barrier before revealing a possibly stale decoded frame.
        if (isVisible && !previousVisibility.current) transport.resynchronize();
        previousVisibility.current = isVisible;
    }, [isVisible, transport]);
    useEffect(() => {
        if (sourceState === 'error') onBounds(track.id, null);
        else if (resource && sourceState === 'ready') onBounds(track.id, resource.bounds);
    }, [sourceState, resource, onBounds, track.id]);
    const activeResource = resource?.partId === activePartId ? resource : null;
    const mediaProps = { ref: mediaReference, src: activeResource?.url, muted: isMuted, preload: 'auto', controls: false, 'aria-label': `Náhled záznamu: ${track.label}`, 'data-source-id': track.id };
    const isFrameVisible = isVisible && sourceState === 'ready';
    return <article className="min-w-0 space-y-3 rounded-xl border bg-white p-3" aria-label={`Monitor ${track.label}`} data-source-state={sourceState}>
        <h3 className="truncate font-semibold" title={track.label}>{track.label}</h3>
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-slate-950 text-sm text-white">
            {activeResource && (track.kind === 'microphone' ? <audio {...mediaProps} /> : <video {...mediaProps} playsInline className={`h-full w-full object-contain ${isFrameVisible ? '' : 'invisible'}`} />)}
            {(!isFrameVisible || track.kind === 'microphone') && <span className="absolute inset-0 flex items-center justify-center p-4 text-center">{sourceState !== 'ready' ? SOURCE_STATE_LABELS[sourceState] : track.kind === 'microphone' ? isMuted ? 'Zvuk ztlumený v poslechu' : 'Poslech zvuku' : 'Obraz skrytý v náhledu'}</span>}
        </div>
        {children}
        {track.isAudioIncluded && <p className="text-xs text-slate-600">{track.kind === 'camera' ? `Zvuk je součástí tohoto video souboru${track.audioSourceLabel ? ` (${track.audioSourceLabel})` : ''}. ` : ''}Poslech nemění uložený zvuk ani export.</p>}
        {sourceState === 'error' && <div role="alert" className="space-y-2 text-xs text-amber-800"><p>{snapshot.errors[track.id]}</p><Button size="sm" variant="outline" type="button" onClick={() => { transport.retry(); setAttempt((value) => value + 1); }}>Načíst náhled znovu</Button></div>}
        {isArtworkFailed && <p className="text-xs text-slate-500">Miniatury nebo vzorky zvuku nejsou dostupné; přehrávání a originál jsou nezávislé.</p>}
    </article>;
}
