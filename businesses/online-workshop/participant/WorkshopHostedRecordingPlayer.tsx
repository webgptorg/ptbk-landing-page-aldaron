'use client';

import { HostedRecordingTransport, type HostedRecordingSnapshot } from './HostedRecordingTransport';
import { useWorkshopRecordingCommitSelection, useWorkshopRecordingTimelineStore } from './WorkshopRecordingTimelineContext';
import { getHostedRecordingLiveSeconds, getHostedRecordingLiveSegmentIndex, getHostedRecordingLiveWindow,
    type HostedRecordingMetadata, type HostedRecordingRole,
    type HostedRecordingSpeed, type HostedRecordingView } from '@/lib/workshops/hostedRecording/hostedRecordingTimeline';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';

const TRACK_ROLES = ['editor', 'application', 'camera'] as const;
const TRACK_LABELS: Record<HostedRecordingRole, string> = { editor: 'Editor', application: 'Aplikace', camera: 'Kamera' };
const SPEED_OPTIONS: readonly HostedRecordingSpeed[] = ['auto', 0.5, 1, 1.5, 2, 4];
const EMPTY_SNAPSHOT: HostedRecordingSnapshot = { seconds: 0, isPlaying: false, isPlayRequested: false,
    isSettling: false, view: 'auto', speed: 'auto', effectiveSpeed: 1, sourceStates: {},
    isMuted: true, volume: 1, audioRole: null };

export type TrackRole = HostedRecordingRole;
export type PlayerManifest = HostedRecordingMetadata;
export type HostedRecordingAdminPreview = { readonly manifest: PlayerManifest;
    readonly trackUrls: Partial<Record<TrackRole, string>> };
type ParticipantProps = { readonly workshopSlug: string; readonly revisionId: string; readonly isLive: boolean;
    readonly serverTime: string; readonly adminPreview?: never };
type AdminProps = { readonly adminPreview: HostedRecordingAdminPreview; readonly serverTime: string;
    readonly isLive?: false; readonly workshopSlug?: never; readonly revisionId?: never };
type Props = ParticipantProps | AdminProps;

function formatTime(seconds: number): string {
    const wholeSeconds = Math.floor(Math.max(0, seconds));
    const hours = Math.floor(wholeSeconds / 3600);
    const minutes = Math.floor(wholeSeconds % 3600 / 60);
    const remainder = wholeSeconds % 60;
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}` :
        `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function getPreferredScene(manifest: PlayerManifest, seconds: number): HostedRecordingRole | null {
    return [...(manifest.autoView?.transitions ?? [])].reverse().find((transition) =>
        transition.seconds <= seconds)?.scene ?? manifest.autoView?.defaultScene ?? null;
}

function getTrackMessage(role: HostedRecordingRole, state: HostedRecordingSnapshot['sourceStates'][HostedRecordingRole]): string {
    if (state === 'error') return `${TRACK_LABELS[role]} se nepodařilo načíst.`;
    if (state === 'gap') return `${TRACK_LABELS[role]} má v tomto čase mezeru.`;
    if (state === 'buffering' || state === 'loading') return `Načítám ${TRACK_LABELS[role].toLowerCase()}…`;
    return `${TRACK_LABELS[role]} není v tomto záznamu dostupný.`;
}

function HostedTrack({ role, url, transport, isVisible, isOverlay, mediaOffsetSeconds }: {
    readonly role: HostedRecordingRole; readonly url: string; readonly transport: HostedRecordingTransport;
    readonly isVisible: boolean; readonly isOverlay: boolean; readonly mediaOffsetSeconds: number;
}) {
    const mediaReference = useRef<HTMLVideoElement>(null);
    const hideTextTracks = useCallback(() => {
        const media = mediaReference.current;
        if (media) for (const textTrack of Array.from(media.textTracks)) textTrack.mode = 'disabled';
    }, []);
    useEffect(() => {
        const media = mediaReference.current;
        if (!media) return undefined;
        media.textTracks.addEventListener?.('addtrack', hideTextTracks);
        const unregister = transport.register(role, media, mediaOffsetSeconds);
        return () => { media.textTracks.removeEventListener?.('addtrack', hideTextTracks); unregister(); };
    }, [role, transport, url, mediaOffsetSeconds, hideTextTracks]);
    return <video ref={mediaReference} src={url} preload="metadata" playsInline controls={false} muted
        aria-hidden="true" tabIndex={-1} onLoadedMetadata={hideTextTracks}
        className={isOverlay ? `absolute bottom-3 right-3 z-10 aspect-video w-[30%] rounded border-2 border-white object-contain shadow-xl ${isVisible ? '' : 'invisible'}` :
            `absolute inset-0 h-full w-full object-contain ${isVisible ? '' : 'invisible'}`} />;
}

export function WorkshopHostedRecordingPlayer(props: Props) {
    const { adminPreview, serverTime } = props;
    const workshopSlug = props.workshopSlug ?? '';
    const revisionId = props.revisionId ?? '';
    const isLive = props.isLive ?? false;
    const timelineStore = useWorkshopRecordingTimelineStore();
    const recordingCommit = useWorkshopRecordingCommitSelection();
    const fullscreenReference = useRef<HTMLDivElement>(null);
    const viewerRevision = useRef({ workshopSlug, revisionId });
    if (viewerRevision.current.workshopSlug !== workshopSlug) viewerRevision.current = { workshopSlug, revisionId };
    const [serverClockOffsetMilliseconds, setServerClockOffsetMilliseconds] = useState(() => Date.parse(serverTime) - Date.now());
    const [manifest, setManifest] = useState<PlayerManifest | null>(null);
    const [playableRoles, setPlayableRoles] = useState<readonly HostedRecordingRole[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [transport, setTransport] = useState<HostedRecordingTransport | null>(null);
    const [liveSegmentIndex, setLiveSegmentIndex] = useState(-1);
    const [liveSegmentRetry, setLiveSegmentRetry] = useState(0);
    const isLiveLocked = manifest?.delivery?.mode === 'live-window';
    const snapshot = useSyncExternalStore(transport?.subscribe ?? (() => () => undefined),
        transport?.getSnapshot ?? (() => EMPTY_SNAPSHOT), () => EMPTY_SNAPSHOT);
    const baseUrl = adminPreview ? '' :
        `/api/workshops/${encodeURIComponent(workshopSlug)}/hosted-recording/${encodeURIComponent(viewerRevision.current.revisionId)}`;

    const showManifest = useCallback((loaded: PlayerManifest) => {
        if (loaded.schemaVersion !== 1 || !Number.isFinite(loaded.durationSeconds) || loaded.durationSeconds <= 0 ||
            !Array.isArray(loaded.tracks)) throw new Error('Neplatný manifest záznamu.');
        const probe = document.createElement('video');
        const available = loaded.tracks.filter((track) => probe.canPlayType(track.contentType) !== '');
        if (available.length === 0) throw new Error('Tento prohlížeč neumí přehrát formát záznamu.');
        if (loaded.delivery?.serverTime) setServerClockOffsetMilliseconds(Date.parse(loaded.delivery.serverTime) - Date.now());
        setPlayableRoles(available.map((track) => track.role));
        setManifest({ ...loaded, tracks: available });
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setManifest(null); setPlayableRoles([]); setError(null);
        if (adminPreview) {
            try { showManifest(adminPreview.manifest); }
            catch (cause) { setError(cause instanceof Error ? cause.message : 'Záznam nelze načíst.'); }
            return () => controller.abort();
        }
        void fetch(baseUrl, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) throw new Error(response.status === 403 ? 'Záznam vyžaduje placené členství.' : 'Záznam nelze načíst.');
                return response.json() as Promise<PlayerManifest>;
            }).then(showManifest).catch((cause: unknown) => {
                if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Záznam nelze načíst.');
            });
        return () => controller.abort();
    }, [adminPreview, baseUrl, showManifest]);

    useEffect(() => {
        if (!manifest) { setTransport(null); return; }
        const nextTransport = new HostedRecordingTransport(manifest, isLiveLocked, serverClockOffsetMilliseconds);
        if (isLive && !isLiveLocked) {
            nextTransport.seek(getHostedRecordingLiveSeconds(manifest, Date.now() + serverClockOffsetMilliseconds));
            nextTransport.play();
        }
        setTransport(nextTransport);
        return () => nextTransport.dispose();
    }, [manifest, isLive, isLiveLocked, serverClockOffsetMilliseconds]);

    useEffect(() => {
        if (!manifest || !isLiveLocked) { setLiveSegmentIndex(-1); return; }
        const updateSegment = () => setLiveSegmentIndex(getHostedRecordingLiveSegmentIndex(manifest,
            Date.now() + serverClockOffsetMilliseconds));
        updateSegment();
        const timer = window.setInterval(updateSegment, 200);
        return () => window.clearInterval(timer);
    }, [manifest, isLiveLocked, serverClockOffsetMilliseconds]);

    useEffect(() => {
        if (!isLiveLocked || liveSegmentIndex < 0 ||
            !Object.values(snapshot.sourceStates).includes('error')) return;
        const timer = window.setTimeout(() => setLiveSegmentRetry((current) => current + 1), 500);
        return () => window.clearTimeout(timer);
    }, [isLiveLocked, liveSegmentIndex, snapshot.sourceStates]);

    useEffect(() => { timelineStore?.publish(manifest, snapshot.seconds); }, [timelineStore, manifest, snapshot.seconds]);
    useEffect(() => () => timelineStore?.publish(null, 0), [timelineStore]);

    const preferredRole = manifest ? getPreferredScene(manifest, snapshot.seconds) : null;
    const visibleRole = transport?.getVisibleRole() ?? null;
    const overlayRole = transport?.getOverlayRole() ?? null;
    const selectedRole = snapshot.view === 'auto' ? preferredRole : snapshot.view;
    const displayedRole = snapshot.view === 'auto' ? visibleRole :
        snapshot.sourceStates[snapshot.view] === 'ready' ? snapshot.view : null;
    const fallbackMessage = snapshot.view === 'auto' && preferredRole !== null && visibleRole !== null &&
        preferredRole !== visibleRole ? `${TRACK_LABELS[preferredRole]} není připravený; přehrává se ${TRACK_LABELS[visibleRole]}.` : null;
    const statusMessage = isLiveLocked && liveSegmentIndex < 0 ? null : displayedRole === null ? selectedRole ? getTrackMessage(selectedRole,
        snapshot.sourceStates[selectedRole]) : 'Žádná obrazová stopa není v tomto čase připravená.' : null;
    const durationSeconds = manifest?.durationSeconds ?? 0;
    const activityIntervals = manifest?.activityIntervals ?? [];
    const events = manifest?.events ?? [];
    const liveWindow = manifest && isLiveLocked && liveSegmentIndex >= 0 ?
        getHostedRecordingLiveWindow(manifest, liveSegmentIndex) : null;

    const toggleFullscreen = useCallback(() => {
        const container = fullscreenReference.current;
        if (!container) return;
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
        else void container.requestFullscreen().catch(() => undefined);
    }, []);
    const onKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget || !transport) return;
        if (event.key === ' ' || event.key.toLowerCase() === 'k') {
            event.preventDefault();
            if (isLiveLocked) transport.play();
            else if (snapshot.isPlayRequested) transport.pause(); else transport.play();
        } else if (!isLiveLocked && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault();
            transport.seek(snapshot.seconds + (event.key === 'ArrowRight' ? 5 : -5));
        } else if (event.key.toLowerCase() === 'm') {
            transport.setMuted(!snapshot.isMuted);
        } else if (event.key.toLowerCase() === 'f') toggleFullscreen();
    };

    if (error) return <p role="alert" className="p-4 text-room-text">{error}</p>;
    if (!manifest || !transport) return <p role="status" className="p-4 text-room-text">Načítám záznam…</p>;
    return <div ref={fullscreenReference} tabIndex={0} onKeyDown={onKeyboard}
        className="space-y-3 bg-room-inset p-3 text-room-text focus-visible:outline-room-accent"
        aria-label="Synchronizovaný záznam workshopu">
        <div role="tablist" aria-label="Obrazová stopa" className="flex flex-wrap gap-2">
            {(['auto', ...TRACK_ROLES] as const).map((view) => <button key={view} type="button" role="tab"
                aria-selected={snapshot.view === view} onClick={() => transport.setView(view as HostedRecordingView)}
                className="rounded border border-room-border/30 px-3 py-1 aria-selected:bg-room-hover focus-visible:outline-room-accent">
                {view === 'auto' ? 'Auto' : TRACK_LABELS[view]}
                {view !== 'auto' && !playableRoles.includes(view) ? ' · nedostupné' : ''}
            </button>)}
        </div>
        <div className="relative aspect-video overflow-hidden rounded bg-black" aria-live="off">
            {(isLiveLocked && liveWindow === null ? [] : manifest.tracks).map((track) => <HostedTrack
                key={`${track.role}:${isLiveLocked ? `${liveSegmentIndex}:${liveSegmentRetry}` : 'full'}`} role={track.role}
                transport={transport} url={adminPreview ? adminPreview.trackUrls[track.role] ?? '' :
                    `${baseUrl}/${track.role}${isLiveLocked ? `?segment=${liveSegmentIndex}` : ''}`}
                isVisible={displayedRole === track.role || overlayRole === track.role}
                isOverlay={overlayRole === track.role && displayedRole !== track.role}
                mediaOffsetSeconds={liveWindow?.startSeconds ?? 0} />)}
            {isLiveLocked && liveSegmentIndex < 0 && <p role="status"
                className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-white">
                {liveSegmentIndex === -2 ? 'Živý záznam skončil. Čekáme na závěr workshopu.' :
                    'Čekám na další dokončený živý úsek…'}</p>}
            {statusMessage && <p role="status" className="absolute inset-0 flex items-center justify-center bg-black/85 p-4 text-center text-sm text-white">
                {statusMessage}</p>}
            {snapshot.isSettling && displayedRole === null && !statusMessage && <p role="status"
                className="absolute inset-0 flex items-center justify-center bg-black/85 p-4 text-white">Načítám společný čas stop…</p>}
        </div>
        {fallbackMessage && <p role="status" className="text-xs text-room-muted">{fallbackMessage}</p>}
        {!adminPreview && recordingCommit.state === 'absent' && <p role="status" className="text-xs text-room-muted">
            Záznam nemá připojený repozitář; commit v tomto čase nelze zobrazit.
        </p>}
        {isLiveLocked && <p className="text-xs text-room-muted">Živě: připojení vždy naváže na aktuální čas. Posun a změna rychlosti jsou dostupné členům.</p>}
        <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => {
                if (isLiveLocked) transport.play();
                else if (snapshot.isPlayRequested) transport.pause(); else transport.play();
            }} className="rounded bg-room-accent px-3 py-2 font-semibold text-room-surface">
                {isLiveLocked ? 'Přejít živě' : snapshot.isPlayRequested ? 'Pozastavit' : 'Přehrát'}
            </button>
            {!isLiveLocked && Object.values(snapshot.sourceStates).includes('error') &&
                <button type="button" onClick={() => transport.retry()}
                    className="rounded border border-room-border/30 px-3 py-2">Zkusit stopu znovu</button>}
            <span className="font-mono text-xs tabular-nums" aria-live="off">{formatTime(snapshot.seconds)} / {formatTime(durationSeconds)}</span>
            <button type="button" onClick={() => transport.setMuted(!snapshot.isMuted)} disabled={!snapshot.audioRole}
                className="rounded border border-room-border/30 px-2 py-1 disabled:opacity-50">
                {snapshot.isMuted ? 'Zapnout zvuk' : 'Ztlumit'}
            </button>
            <label className="flex items-center gap-1 text-xs">Hlasitost
                <input type="range" min={0} max={1} step={0.05} value={snapshot.volume}
                    aria-label="Hlasitost" onChange={(event) => transport.setVolume(Number(event.target.value))} />
            </label>
            <label className="flex items-center gap-1 text-xs">Rychlost
                <select value={snapshot.speed} disabled={isLiveLocked} aria-label="Rychlost přehrávání"
                    onChange={(event) => transport.setSpeed(event.target.value === 'auto' ? 'auto' :
                        Number(event.target.value) as HostedRecordingSpeed)}
                    className="rounded border border-room-border/30 bg-room-inset p-1 text-room-text">
                    {SPEED_OPTIONS.map((speed) => <option key={speed} value={speed}>{speed === 'auto' ? 'Auto' : `${speed}×`}</option>)}
                </select>
                {snapshot.speed === 'auto' && !isLiveLocked && <span aria-label={`Aktuální rychlost ${snapshot.effectiveSpeed}×`}>
                    {snapshot.effectiveSpeed}×</span>}
            </label>
            <button type="button" onClick={toggleFullscreen} className="rounded border border-room-border/30 px-2 py-1">Celá obrazovka</button>
        </div>
        <div className="relative pt-2">
            <div className="relative h-2 overflow-hidden rounded bg-room-overlay/20" aria-hidden="true">
                {activityIntervals.map((interval, index) => <span key={index} className={`absolute top-0 h-full ${interval.classification === 'automatic-coding'
                    ? 'bg-amber-500' : interval.classification === 'active' ? 'bg-cyan-500' : 'bg-slate-400/50'}`}
                    style={{ left: `${interval.startSeconds / durationSeconds * 100}%`,
                        width: `${(interval.endSeconds - interval.startSeconds) / durationSeconds * 100}%` }} />)}
            </div>
            {events.map((event, index) => <button key={event.id ?? index} type="button" disabled={isLiveLocked}
                onClick={() => transport.seek(event.seconds)} title={`${event.title}${event.detail ? `: ${event.detail}` : ''}`}
                aria-label={`${formatTime(event.seconds)} · ${event.title}${event.detail ? ` · ${event.detail}` : ''}`}
                className="absolute top-0 z-20 h-4 w-2 -translate-x-1/2 rounded bg-room-accent focus-visible:outline-room-accent disabled:cursor-default"
                style={{ left: `${event.seconds / durationSeconds * 100}%` }} />)}
            <input type="range" min={0} max={durationSeconds} step={0.05} value={snapshot.seconds}
                disabled={isLiveLocked} aria-label="Čas záznamu" aria-valuetext={formatTime(snapshot.seconds)}
                onChange={(event) => transport.seek(Number(event.target.value))}
                className="relative z-10 w-full accent-room-accent disabled:opacity-60" />
        </div>
        <p className="text-xs text-room-muted">Aktivní úseky jsou modré, automatické kódování oranžové. Auto rychlost posouvá záznam po dekódovaných krocích až 10×; při pomalém načítání čeká. Zvuk je při 10× ztlumený.</p>
        {events.length > 0 && <details className="text-xs"><summary className="cursor-pointer">Události z časové osy</summary>
            <ol className="mt-2 space-y-1">{events.map((event, index) => <li key={event.id ?? index}>
                <button type="button" disabled={isLiveLocked} onClick={() => transport.seek(event.seconds)}
                    className="underline disabled:no-underline">{formatTime(event.seconds)} · {event.title}</button>
                {event.detail && <p className="text-room-muted">{event.detail}</p>}
            </li>)}</ol>
        </details>}
    </div>;
}
