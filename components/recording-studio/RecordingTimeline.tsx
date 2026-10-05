'use client';

import { formatRecordingTimecode, getRecordingTrackSegments } from '@/lib/recording-studio/recordingStudioSessionTime';
import { getRecordingSpeechEvents } from '@/lib/recording-studio/recordingStudioDerived';
import type { RecordingMediaArtwork } from '@/lib/recording-studio/recordingStudioMedia';
import type { RecordingDerivedTrack, RecordingTrack, RecordingTrim } from '@/lib/recording-studio/recordingStudioTypes';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

const MINIMUM_SELECTION_SECONDS = 0.001;
const TIMELINE_LABEL_WIDTH = 180;
const RULER_INTERVALS_SECONDS = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 18000, 36000];

export function RecordingTimeline({ tracks, derivedTracks = [], compositionScenes = [], coordinateLabel = 'Původní čas relace', onSceneSelect, onSceneMove, durationSeconds, seconds, selection, artwork, availableRanges, onSeek, onSelection, onBeginEdit, onEndEdit }: {
    readonly tracks: readonly RecordingTrack[];
    readonly derivedTracks?: readonly RecordingDerivedTrack[];
    readonly compositionScenes?: readonly { readonly id: string; readonly startSeconds: number; readonly endSeconds: number; readonly label: string; readonly minimumSeconds?: number; readonly maximumSeconds?: number }[];
    readonly coordinateLabel?: string;
    readonly onSceneSelect?: (id: string) => void;
    readonly onSceneMove?: (id: string, seconds: number) => void;
    readonly durationSeconds: number;
    readonly seconds: number;
    readonly selection: RecordingTrim;
    readonly artwork: Readonly<Record<string, RecordingMediaArtwork>>;
    readonly availableRanges: Readonly<Record<string, readonly RecordingTrim[]>>;
    readonly onSeek: (seconds: number) => void;
    readonly onSelection: (selection: RecordingTrim) => void;
    readonly onBeginEdit: () => void;
    readonly onEndEdit?: () => void;
}) {
    const [zoomLevel, setZoomLevel] = useState(0);
    const zoom = 2 ** zoomLevel;
    const scrollReference = useRef<HTMLDivElement>(null);
    const [viewport, setViewport] = useState({ left: 0, width: 850 });
    const bodyReference = useRef<HTMLDivElement>(null);
    const dragReference = useRef<'start' | 'end' | 'playhead' | { readonly sceneId: string } | null>(null);
    const safeDuration = Math.max(0.001, durationSeconds);
    const timelineWidth = Math.max(viewport.width, zoom * 850) - TIMELINE_LABEL_WIDTH;
    const rulerInterval = RULER_INTERVALS_SECONDS.find((interval) => interval / safeDuration * timelineWidth >= 100) ?? safeDuration / 10;
    const firstRulerTime = Math.floor(viewport.left / timelineWidth * safeDuration / rulerInterval) * rulerInterval;
    const lastRulerTime = Math.min(safeDuration, (viewport.left + viewport.width) / timelineWidth * safeDuration);
    const rulerTimes = Array.from({ length: Math.max(0, Math.min(80, Math.ceil((lastRulerTime - firstRulerTime) / rulerInterval) + 1)) }, (_, index) => firstRulerTime + index * rulerInterval).filter((value) => value <= safeDuration);
    const playheadSeconds = useRef(seconds);
    playheadSeconds.current = seconds;
    const focusPlayhead = useCallback(() => {
        const element = scrollReference.current;
        if (element) element.scrollLeft = Math.max(0, playheadSeconds.current / safeDuration * (bodyReference.current?.clientWidth ?? 0) - (element.clientWidth - TIMELINE_LABEL_WIDTH) / 2);
    }, [safeDuration]);
    useLayoutEffect(focusPlayhead, [focusPlayhead, zoomLevel]); // Preserve the current session moment when zooming.
    useEffect(() => {
        const element = scrollReference.current!;
        const measure = () => setViewport({ left: element.scrollLeft, width: element.clientWidth });
        const observer = new ResizeObserver(measure); observer.observe(element); measure();
        return () => observer.disconnect();
    }, []);
    const percent = (value: number) => `${Math.max(0, Math.min(100, value / safeDuration * 100))}%`;
    const pointerSeconds = (event: PointerEvent) => {
        const rectangle = bodyReference.current!.getBoundingClientRect();
        return Math.max(0, Math.min(safeDuration, (event.clientX - rectangle.left) / rectangle.width * safeDuration));
    };
    const changeHandle = (handle: 'start' | 'end', value: number) => {
        onSelection(handle === 'start'
            ? { ...selection, startSeconds: Math.max(0, Math.min(selection.endSeconds - MINIMUM_SELECTION_SECONDS, value)) }
            : { ...selection, endSeconds: Math.min(safeDuration, Math.max(selection.startSeconds + MINIMUM_SELECTION_SECONDS, value)) });
    };
    const movePointer = (event: PointerEvent) => {
        if (!dragReference.current) return;
        const value = pointerSeconds(event);
        if (typeof dragReference.current === 'object') onSceneMove?.(dragReference.current.sceneId, value);
        else if (dragReference.current === 'playhead') onSeek(value);
        else changeHandle(dragReference.current, value);
    };
    const startPointer = (event: PointerEvent<HTMLDivElement>) => {
        const handle = (event.target as HTMLElement).closest<HTMLElement>('[data-trim-handle]')?.dataset.trimHandle as 'start' | 'end' | undefined;
        const sceneId = (event.target as HTMLElement).closest<HTMLElement>('[data-scene-handle]')?.dataset.sceneHandle;
        if (event.button !== 0) return;
        dragReference.current = sceneId && onSceneMove ? { sceneId } : handle ?? 'playhead';
        if (handle || sceneId) onBeginEdit();
        if (sceneId) onSceneSelect?.(sceneId);
        event.currentTarget.setPointerCapture(event.pointerId);
        movePointer(event);
    };
    const finishPointer = () => { dragReference.current = null; onEndEdit?.(); };
    const handleKey = (event: KeyboardEvent, handle?: 'start' | 'end') => {
        const value = handle === 'start' ? selection.startSeconds : handle === 'end' ? selection.endSeconds : seconds;
        const step = event.shiftKey ? 10 : event.altKey ? 0.01 : 1;
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? safeDuration :
            event.key === 'ArrowLeft' ? value - step : event.key === 'ArrowRight' ? value + step : null;
        if (target === null) return;
        event.preventDefault(); event.stopPropagation();
        if (handle) { onBeginEdit(); changeHandle(handle, target); onEndEdit?.(); }
        else onSeek(target);
    };
    return <section aria-label="Společná časová osa" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">Časová osa všech zdrojů</h3>
            <div className="flex flex-wrap items-center gap-3"><button type="button" className="text-sm text-cyan-800 underline" onClick={focusPlayhead}>Ukázat přehrávací hlavu</button><label className="flex items-center gap-2 text-sm">Přiblížení <input aria-label="Přiblížení časové osy" type="range" min="0" max="10" value={zoomLevel} onChange={(event) => setZoomLevel(Number(event.target.value))} />{zoom}×</label></div>
        </div>
        <p className="text-xs text-slate-600">Tažením posuňte přehrávací hlavu nebo krajní úchyty výběru. Šipky: 1 s · Shift: 10 s · Alt: 0,01 s · Home/End: kraj záznamu. Šrafování označuje nedostupný rozsah. Zvuková vlna je řídký vzorek úrovně.</p>
        <div ref={scrollReference} onScroll={(event) => setViewport({ left: event.currentTarget.scrollLeft, width: event.currentTarget.clientWidth })} className="overflow-x-auto rounded-xl border border-slate-300 bg-white" tabIndex={0} aria-label="Posouvání časové osy">
            <div className="flex" style={{ width: `max(100%, ${zoom * 850}px)` }}>
                <div className="sticky left-0 z-20 shrink-0 border-r bg-white/95" style={{ width: TIMELINE_LABEL_WIDTH }}>
                    <div className="h-14 p-3 text-xs text-slate-500">{coordinateLabel}</div>
                    {compositionScenes.length > 0 && <div className="h-16 border-t p-3 text-sm font-medium">Kompozice · předpis</div>}
                    {tracks.map((track) => <div key={track.id} className="h-24 border-t p-3 text-sm"><p className="truncate font-medium" title={track.label}>{track.label}</p><p className="mt-1 text-xs text-slate-500">{track.kind === 'microphone' ? 'Zvuk' : track.kind === 'screen' ? 'Obrazovka' : 'Kamera'}{track.isAudioIncluded && track.kind !== 'microphone' ? ' + zvuk' : ''}</p></div>)}
                    {derivedTracks.map((track) => <div key={track.id} className="h-16 border-t p-2 text-xs"><p className="truncate font-medium" title={track.provenance.sourceLabel}>{track.kind === 'subtitles' ? 'Titulky' : 'Aktivita řeči'}</p><p className="truncate text-slate-500">{track.provenance.sourceLabel}</p></div>)}
                </div>
                <div ref={bodyReference} className="relative min-w-0 flex-1 touch-none select-none" onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={finishPointer} onPointerCancel={finishPointer} onLostPointerCapture={finishPointer}>
                    <div className="relative h-14" role="slider" tabIndex={0} aria-label="Přehrávací hlava" aria-valuemin={0} aria-valuemax={safeDuration} aria-valuenow={seconds} aria-valuetext={formatRecordingTimecode(seconds)} onKeyDown={(event) => handleKey(event)}>
                        {rulerTimes.map((value) => <span key={value} className="absolute top-2 border-l pl-1 text-[10px] tabular-nums text-slate-600" style={{ left: percent(value), transform: value === safeDuration ? 'translateX(-100%)' : undefined }}>{formatRecordingTimecode(value)}</span>)}
                    </div>
                    {compositionScenes.length > 0 && <div className="relative h-16 overflow-hidden border-t bg-violet-50" aria-label="Stopa kompozice">
                        {compositionScenes.map((scene) => <button key={scene.id} type="button" className="absolute inset-y-2 truncate rounded border border-violet-700 bg-violet-200 px-2 text-left text-xs text-violet-950" style={{ left: percent(scene.startSeconds), width: percent(scene.endSeconds - scene.startSeconds) }} title={scene.label} onPointerDown={(event) => event.stopPropagation()} onClick={() => { onSeek(scene.startSeconds); onSceneSelect?.(scene.id); }}>{scene.label}</button>)}
                        {onSceneMove && compositionScenes.map((scene) => <div key={`boundary:${scene.id}`} role="slider" tabIndex={0} data-scene-handle={scene.id} aria-label={`Hranice scény: ${scene.label}`} aria-valuemin={scene.minimumSeconds ?? 0} aria-valuemax={scene.maximumSeconds ?? safeDuration} aria-valuenow={scene.startSeconds} aria-valuetext={formatRecordingTimecode(scene.startSeconds)} className="absolute inset-y-1 z-20 w-3 -translate-x-1/2 cursor-ew-resize rounded border-2 border-violet-900 bg-violet-700/50 outline-offset-2 focus:outline focus:outline-2 focus:outline-violet-900" style={{ left: percent(scene.startSeconds) }} onKeyDown={(event) => {
                            const step = event.shiftKey ? 10 : event.altKey ? 0.01 : 1;
                            const value = event.key === 'Home' ? scene.minimumSeconds ?? 0 : event.key === 'End' ? scene.maximumSeconds ?? safeDuration : event.key === 'ArrowLeft' ? scene.startSeconds - step : event.key === 'ArrowRight' ? scene.startSeconds + step : null;
                            if (value === null) return;
                            event.preventDefault(); event.stopPropagation(); onSceneSelect?.(scene.id); onBeginEdit(); onSceneMove(scene.id, value); onEndEdit?.();
                        }} />)}
                    </div>}
                    {tracks.map((track) => <div key={track.id} className="relative h-24 overflow-hidden border-t bg-slate-100" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 6px, #cbd5e1 6px, #cbd5e1 7px)' }} aria-label={`Stopa ${track.label}`}>
                        {(availableRanges[track.id] ?? []).map((range, index) => <div key={index} className="absolute inset-y-1 rounded bg-cyan-100" style={{ left: percent(range.startSeconds), width: percent(range.endSeconds - range.startSeconds) }} />)}
                        <div className="pointer-events-none absolute inset-0" aria-label={`Náhledy a vzorky zvuku: ${track.label}`}>
                            {getRecordingTrackSegments(track).map((segment, segmentIndex) => <div key={segmentIndex}>
                                {(artwork[track.id]?.thumbnails ?? []).filter(({ seconds: sourceSeconds }) => sourceSeconds >= segment.sourceStartSeconds && sourceSeconds < segment.sourceStartSeconds + segment.durationSeconds).map((thumbnail, index) =>
                                    <svg key={index} className="absolute top-2 h-12 w-20 -translate-x-1/2" style={{ left: percent(segment.sessionStartSeconds + thumbnail.seconds - segment.sourceStartSeconds) }} viewBox="0 0 80 48" aria-hidden="true"><image href={thumbnail.url} width="80" height="48" preserveAspectRatio="xMidYMid slice" /></svg>)}
                                {(artwork[track.id]?.peaks ?? []).filter(({ seconds: sourceSeconds }) => sourceSeconds >= segment.sourceStartSeconds && sourceSeconds < segment.sourceStartSeconds + segment.durationSeconds).map((peak, index) => {
                                    const height = Math.min(30, Math.max(1, peak.amplitude * 90));
                                    return <span key={index} className="absolute w-0.5 bg-cyan-700" style={{ left: percent(segment.sessionStartSeconds + peak.seconds - segment.sourceStartSeconds), top: 76 - height / 2, height }} />;
                                })}
                            </div>)}
                        </div>
                    </div>)}
                    {derivedTracks.map((track) => <div key={track.id} className="relative h-16 overflow-hidden border-t bg-white" aria-label={`${track.kind === 'subtitles' ? 'Titulky' : 'Aktivita řeči'} zdroje ${track.provenance.sourceLabel}`}>
                        {track.kind === 'subtitles' ? track.cues.filter((cue) => cue.isEnabled).map((cue) => <div key={cue.id} title={`${formatRecordingTimecode(cue.startSeconds)}–${formatRecordingTimecode(cue.endSeconds)} ${cue.text}`} className={`absolute inset-y-3 overflow-hidden rounded border px-1 text-[10px] text-white ${cue.origin === 'manual' ? 'border-cyan-900 bg-cyan-700' : 'border-cyan-700 bg-cyan-500'}`} style={{ left: percent(cue.startSeconds), width: percent(cue.endSeconds - cue.startSeconds) }}>{cue.text}</div>) : <>
                            {track.intervals.map((interval) => <div key={interval.id} title={`${formatRecordingTimecode(interval.startSeconds)}–${formatRecordingTimecode(interval.endSeconds)} ${interval.type} · ${interval.origin}`} className={`absolute inset-y-3 border ${interval.type === 'speech' ? 'border-violet-700 bg-violet-400' : interval.type === 'silence' ? 'border-slate-400 bg-slate-200' : interval.type === 'uncertain' ? 'border-amber-600 bg-amber-200' : 'border-slate-500 bg-slate-300'}`} style={{ left: percent(interval.startSeconds), width: percent(interval.endSeconds - interval.startSeconds) }} />)}
                            {getRecordingSpeechEvents(track.intervals).map((event) => <span key={`${event.intervalId}-${event.type}`} className="pointer-events-none absolute inset-y-1 border-l-2 border-violet-900" title={`${event.type === 'speech-start' ? 'Začátek řeči' : 'Konec řeči'} · ${formatRecordingTimecode(event.seconds)}`} style={{ left: percent(event.seconds) }}><span className="bg-violet-900 px-0.5 text-[9px] text-white">{event.type === 'speech-start' ? 'S' : 'E'}</span></span>)}
                        </>}
                    </div>)}
                    <div className="pointer-events-none absolute inset-y-10 border-x-2 border-cyan-600 bg-cyan-500/10" style={{ left: percent(selection.startSeconds), width: percent(selection.endSeconds - selection.startSeconds) }} />
                    {(['start', 'end'] as const).map((handle) => <div key={handle} role="slider" tabIndex={0} data-trim-handle={handle} aria-label={handle === 'start' ? 'Začátek výběru' : 'Konec výběru'} aria-valuemin={0} aria-valuemax={safeDuration} aria-valuenow={handle === 'start' ? selection.startSeconds : selection.endSeconds} aria-valuetext={formatRecordingTimecode(handle === 'start' ? selection.startSeconds : selection.endSeconds)} onKeyDown={(event) => handleKey(event, handle)} className="absolute inset-y-9 z-10 w-5 -translate-x-1/2 cursor-ew-resize border-x-4 border-cyan-700 bg-cyan-600/20 outline-offset-2 focus:outline focus:outline-2 focus:outline-cyan-900" style={{ left: percent(handle === 'start' ? selection.startSeconds : selection.endSeconds) }}><span className="absolute top-0 bg-cyan-800 px-0.5 text-[10px] text-white">{handle === 'start' ? 'IN' : 'OUT'}</span></div>)}
                    <div className="pointer-events-none absolute inset-y-8 z-10 w-0.5 bg-rose-600" style={{ left: percent(seconds) }} />
                </div>
            </div>
        </div>
    </section>;
}
