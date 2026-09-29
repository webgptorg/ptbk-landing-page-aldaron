'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TRACK_ROLES = ['editor', 'application', 'camera'] as const;
export type TrackRole = (typeof TRACK_ROLES)[number];
const TRACK_LABELS: Record<TrackRole, string> = { editor: 'Editor', application: 'Aplikace', camera: 'Kamera' };
const MAXIMUM_ACCEPTABLE_DRIFT_SECONDS = 0.1;

export type PlayerManifest = {
    readonly schemaVersion: 1;
    readonly durationSeconds: number;
    readonly liveStartAt: string;
    readonly liveSegments?: readonly { readonly startSeconds: number; readonly endSeconds: number;
        readonly startsAt: string }[];
    readonly tracks: readonly { readonly role: TrackRole; readonly contentType: string; readonly hasAudio: boolean }[];
    readonly events: readonly { readonly seconds?: number; readonly title?: string }[];
    readonly autoView: { readonly defaultScene?: 'editor' | 'application';
        readonly transitions?: readonly { readonly seconds: number; readonly scene: 'editor' | 'application' }[] } | null;
};

export type HostedRecordingAdminPreview = {
    readonly manifest: PlayerManifest;
    readonly trackUrls: Partial<Record<TrackRole, string>>;
};
type ParticipantProps = { readonly workshopSlug: string; readonly revisionId: string; readonly isLive: boolean;
    readonly serverTime: string; readonly adminPreview?: never };
type AdminProps = { readonly adminPreview: HostedRecordingAdminPreview; readonly serverTime: string;
    readonly isLive?: false; readonly workshopSlug?: never; readonly revisionId?: never };
type Props = ParticipantProps | AdminProps;

function getSceneAt(manifest: PlayerManifest, seconds: number): TrackRole | null {
    if (!manifest.autoView) return null;
    return [...(manifest.autoView.transitions ?? [])]
        .filter((transition) => transition.seconds <= seconds)
        .sort((first, second) => second.seconds - first.seconds)[0]?.scene ?? manifest.autoView.defaultScene ?? null;
}

function getLivePlaybackSeconds(manifest: PlayerManifest, wallClockMilliseconds: number): number {
    const segments = manifest.liveSegments ?? [{ startSeconds: 0,
        endSeconds: manifest.durationSeconds, startsAt: manifest.liveStartAt }];
    let previousEndSeconds = 0;
    for (const segment of segments) {
        const segmentStartMilliseconds = Date.parse(segment.startsAt);
        if (wallClockMilliseconds < segmentStartMilliseconds) return previousEndSeconds;
        const segmentEndMilliseconds = segmentStartMilliseconds +
            (segment.endSeconds - segment.startSeconds) * 1000;
        if (wallClockMilliseconds < segmentEndMilliseconds) {
            return segment.startSeconds + (wallClockMilliseconds - segmentStartMilliseconds) / 1000;
        }
        previousEndSeconds = segment.endSeconds;
    }
    return previousEndSeconds;
}

export function WorkshopHostedRecordingPlayer(props: Props) {
    const { serverTime, adminPreview } = props;
    const workshopSlug = props.workshopSlug ?? '';
    const revisionId = props.revisionId ?? '';
    const isLive = props.isLive ?? false;
    // Keep one immutable revision for this mounted viewer while an admin publishes a replacement.
    const viewerRevision = useRef({ workshopSlug, revisionId });
    if (viewerRevision.current.workshopSlug !== workshopSlug) {
        viewerRevision.current = { workshopSlug, revisionId };
    }
    const [manifest, setManifest] = useState<PlayerManifest | null>(null);
    const [playableRoles, setPlayableRoles] = useState<readonly TrackRole[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<TrackRole | 'auto'>('auto');
    const [audioRole, setAudioRole] = useState<TrackRole | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const videoReferences = useRef<Partial<Record<TrackRole, HTMLVideoElement | null>>>({});
    const serverClockOffset = useMemo(() => Date.parse(serverTime) - Date.now(), [serverTime]);
    const baseUrl = adminPreview ? '' :
        `/api/workshops/${encodeURIComponent(workshopSlug)}/hosted-recording/${encodeURIComponent(viewerRevision.current.revisionId)}`;

    const showManifest = useCallback((loaded: PlayerManifest) => {
        const video = document.createElement('video');
        const availableTracks = loaded.tracks.filter((track) => video.canPlayType(track.contentType) !== '');
        if (availableTracks.length === 0) {
            throw new Error('Tento prohlížeč neumí přehrát formát záznamu. Zkuste aktuální prohlížeč s podporou MP4 nebo WebM.');
        }
        setManifest(loaded);
        setPlayableRoles(availableTracks.map((track) => track.role));
        setAudioRole(availableTracks.find((track) => track.role === 'camera' && track.hasAudio)?.role ??
            availableTracks.find((track) => track.hasAudio)?.role ?? null);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setManifest(null); setPlayableRoles([]); setError(null); setSeconds(0); setIsPlaying(false);
        if (adminPreview) {
            try { showManifest(adminPreview.manifest); }
            catch (cause) { setError(cause instanceof Error ? cause.message : 'Záznam nelze načíst.'); }
            return () => controller.abort();
        }
        void fetch(baseUrl, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) throw new Error(response.status === 403 ? 'Záznam vyžaduje placené členství.' : 'Záznam nelze načíst.');
                return response.json() as Promise<PlayerManifest>;
            }).then((loaded) => {
                if (loaded.schemaVersion !== 1 || !Number.isFinite(loaded.durationSeconds)) throw new Error('Neplatný manifest záznamu.');
                showManifest(loaded);
            }).catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Záznam nelze načíst.'); });
        return () => controller.abort();
    }, [baseUrl, adminPreview?.manifest, showManifest]);

    const roles = playableRoles;
    const autoRole = manifest ? getSceneAt(manifest, seconds) : null;
    const activeRole = (selectedRole === 'auto' ? autoRole : selectedRole) &&
        roles.includes((selectedRole === 'auto' ? autoRole : selectedRole) as TrackRole)
        ? (selectedRole === 'auto' ? autoRole : selectedRole) as TrackRole : roles[0] ?? null;

    const seekAll = useCallback((nextSeconds: number) => {
        if (!manifest) return;
        const bounded = Math.max(0, Math.min(nextSeconds, manifest.durationSeconds));
        setSeconds(bounded);
        for (const video of Object.values(videoReferences.current)) {
            if (video && video.readyState >= 1) video.currentTime = bounded;
        }
    }, [manifest]);

    useEffect(() => {
        if (!manifest || !isLive) return;
        seekAll(getLivePlaybackSeconds(manifest, Date.now() + serverClockOffset));
    }, [manifest, isLive, serverClockOffset, seekAll]);

    useEffect(() => {
        for (const [role, video] of Object.entries(videoReferences.current)) {
            if (video) video.muted = !isAudioEnabled || role !== audioRole;
        }
    }, [audioRole, isAudioEnabled, manifest]);

    useEffect(() => {
        if (!isPlaying || !manifest) return;
        const interval = window.setInterval(() => {
            const master = activeRole ? videoReferences.current[activeRole] : null;
            if (!master) return;
            if (isLive) {
                const liveSeconds = getLivePlaybackSeconds(manifest, Date.now() + serverClockOffset);
                if (Math.abs(master.currentTime - liveSeconds) > MAXIMUM_ACCEPTABLE_DRIFT_SECONDS) {
                    seekAll(liveSeconds);
                    return;
                }
            }
            setSeconds(master.currentTime);
            for (const [role, video] of Object.entries(videoReferences.current)) {
                if (!video || role === activeRole || video.readyState < 1) continue;
                if (Math.abs(video.currentTime - master.currentTime) > MAXIMUM_ACCEPTABLE_DRIFT_SECONDS) {
                    video.currentTime = master.currentTime;
                }
            }
        }, 250);
        return () => window.clearInterval(interval);
    }, [activeRole, isLive, isPlaying, manifest, seekAll, serverClockOffset]);

    const togglePlayback = async () => {
        if (isPlaying) {
            for (const video of Object.values(videoReferences.current)) video?.pause();
            setIsPlaying(false); return;
        }
        const master = activeRole ? videoReferences.current[activeRole] : null;
        if (!master || !manifest) return;
        if (isLive) {
            seekAll(getLivePlaybackSeconds(manifest, Date.now() + serverClockOffset));
        }
        for (const video of Object.values(videoReferences.current)) {
            if (!video || video === master) continue;
            video.currentTime = master.currentTime;
            void video.play().catch(() => undefined);
        }
        try { await master.play(); setIsPlaying(true); }
        catch {
            for (const video of Object.values(videoReferences.current)) video?.pause();
            setError('Přehrávání se nepodařilo spustit.');
        }
    };

    if (error) return <p role="alert" className="p-4 text-room-text">{error}</p>;
    if (!manifest) return <p role="status" className="p-4 text-room-text">Načítám záznam…</p>;
    return <div className="space-y-3 bg-room-inset p-3 text-room-text" aria-label="Synchronizovaný záznam workshopu">
        <div role="tablist" aria-label="Obrazová stopa" className="flex flex-wrap gap-2">
            <button type="button" role="tab" aria-selected={selectedRole === 'auto'}
                onClick={() => setSelectedRole('auto')} className="rounded border border-room-border/30 px-3 py-1 aria-selected:bg-room-hover">Auto-view</button>
            {TRACK_ROLES.map((role) => <button key={role} type="button" role="tab"
                aria-selected={selectedRole === role} disabled={!roles.includes(role)}
                onClick={() => setSelectedRole(role)}
                className="rounded border border-room-border/30 px-3 py-1 aria-selected:bg-room-hover disabled:opacity-40">
                {TRACK_LABELS[role]}{!roles.includes(role)
                    ? manifest.tracks.some((track) => track.role === role) ? ' · formát nepodporován' : ' · nedostupné'
                    : ''}
            </button>)}
        </div>
        <div className="relative aspect-video overflow-hidden rounded bg-black">
            {manifest.tracks.filter((track) => roles.includes(track.role)).map((track) => <video key={track.role} ref={(video) => { videoReferences.current[track.role] = video; }}
                className={track.role === activeRole ? 'absolute inset-0 h-full w-full object-contain' : 'invisible absolute inset-0 h-full w-full'}
                src={adminPreview ? adminPreview.trackUrls[track.role] : `${baseUrl}/${track.role}`}
                preload="metadata" playsInline muted
                onLoadedMetadata={(event) => { if (seconds > 0) event.currentTarget.currentTime = seconds; }}
                onEnded={() => setIsPlaying(false)} onError={() => setError('Obrazová stopa se nepodařila přehrát.')} />)}
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void togglePlayback()} className="rounded bg-room-accent px-3 py-2 font-semibold text-room-surface">
                {isPlaying ? 'Pozastavit' : 'Přehrát'}
            </button>
            <label className="flex min-w-40 flex-1 items-center gap-2 text-xs">
                Čas <input type="range" min={0} max={manifest.durationSeconds} step="0.1" value={seconds}
                    onChange={(event) => seekAll(Number(event.target.value))} className="min-w-24 flex-1" />
            </label>
            <span className="font-mono text-xs">{Math.floor(seconds)} / {Math.floor(manifest.durationSeconds)} s</span>
            <button type="button" onClick={() => setIsAudioEnabled((current) => !current)} disabled={!audioRole}
                className="rounded border border-room-border/30 px-2 py-1 disabled:opacity-50">
                {isAudioEnabled ? 'Ztlumit' : 'Zapnout zvuk'}
            </button>
            {isAudioEnabled && <label className="text-xs">Poslech <select className="rounded border p-1 text-slate-900"
                value={audioRole ?? ''} onChange={(event) => setAudioRole(event.target.value as TrackRole)}>
                {manifest.tracks.filter((track) => track.hasAudio).map((track) => <option key={track.role} value={track.role}>{TRACK_LABELS[track.role]}</option>)}
            </select></label>}
        </div>
        {manifest.events.length > 0 && <details className="text-xs"><summary className="cursor-pointer">Události z časové osy</summary>
            <ul className="mt-2 space-y-1">{manifest.events.filter((event) => typeof event.seconds === 'number' && event.title)
                .map((event, index) => <li key={index}><button type="button" onClick={() => seekAll(event.seconds!)}
                    className="underline">{Math.floor(event.seconds!)} s · {event.title}</button></li>)}</ul>
        </details>}
    </div>;
}
