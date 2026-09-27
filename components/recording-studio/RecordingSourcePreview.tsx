'use client';

import { Button } from '@/components/ui/button';
import { formatRecordingBytes } from '@/lib/recording-studio/recordingStudioTiming';
import type { RecordingSource, RecordingSourceConfiguration } from '@/lib/recording-studio/recordingStudioTypes';
import { Mic, Monitor, Video } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const SOURCE_ICONS = { camera: Video, screen: Monitor, microphone: Mic };

function useAudioLevel(stream: MediaStream | null) {
    const [level, setLevel] = useState<number | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    useEffect(() => {
        const audioTrack = stream?.getAudioTracks()[0];
        if (!audioTrack) { setLevel(null); setIsMuted(false); return; }
        let isDisposed = false;
        let animationFrame = 0;
        let audioContext: AudioContext | null = null;
        let analyser: AnalyserNode | null = null;
        let sourceNode: MediaStreamAudioSourceNode | null = null;
        let silentOutput: GainNode | null = null;
        const updateMutedState = () => setIsMuted(audioTrack.muted);
        updateMutedState();
        audioTrack.addEventListener('mute', updateMutedState);
        audioTrack.addEventListener('unmute', updateMutedState);
        try {
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            sourceNode = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
            sourceNode.connect(analyser);
            silentOutput = audioContext.createGain();
            silentOutput.gain.value = 0;
            analyser.connect(silentOutput);
            silentOutput.connect(audioContext.destination);
            const samples = new Uint8Array(analyser.fftSize);
            const updateLevel = () => {
                if (isDisposed || !analyser) return;
                analyser.getByteTimeDomainData(samples);
                const meanSquare = samples.reduce((sum, sample) => {
                    const normalizedSample = (sample - 128) / 128;
                    return sum + normalizedSample * normalizedSample;
                }, 0) / samples.length;
                setLevel(Math.min(100, Math.round(Math.sqrt(meanSquare) * 500)));
                animationFrame = requestAnimationFrame(updateLevel);
            };
            void audioContext.resume().then(updateLevel).catch(() => setLevel(null));
        } catch {
            setLevel(null);
        }
        return () => {
            isDisposed = true;
            cancelAnimationFrame(animationFrame);
            sourceNode?.disconnect();
            analyser?.disconnect();
            silentOutput?.disconnect();
            audioTrack.removeEventListener('mute', updateMutedState);
            audioTrack.removeEventListener('unmute', updateMutedState);
            void audioContext?.close().catch(() => undefined);
        };
    }, [stream]);
    return { level, isMuted };
}

export function RecordingSourcePreview({ configuration, source, errorMessage, byteLength, isRecording, onConnect, onRemove, children }: {
    readonly configuration: RecordingSourceConfiguration;
    readonly source: RecordingSource | null;
    readonly errorMessage: string | null;
    readonly byteLength: number;
    readonly isRecording: boolean;
    readonly onConnect: () => Promise<void>;
    readonly onRemove: () => void;
    readonly children?: ReactNode;
}) {
    const videoReference = useRef<HTMLVideoElement>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const audioTracks = source?.stream.getAudioTracks() ?? [];
    const isAudioIncluded = audioTracks.some((track) => track.readyState === 'live');
    const { level: audioLevel, isMuted: isAudioTrackMuted } = useAudioLevel(source?.stream ?? null);
    useEffect(() => {
        const video = videoReference.current;
        if (!video || !source) return;
        video.srcObject = source.stream;
        return () => { video.srcObject = null; };
    }, [source]);
    const Icon = SOURCE_ICONS[configuration.kind];
    const microphoneName = source?.microphoneLabel || configuration.microphoneDeviceLabel || 'Výchozí mikrofon systému';
    const isVideoSource = configuration.kind !== 'microphone';

    return (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="relative flex aspect-video items-center justify-center bg-slate-950">
                {isVideoSource && source
                    ? <video ref={videoReference} autoPlay muted playsInline className="h-full w-full object-contain" aria-label={`Ztlumený živý náhled: ${configuration.label}`} />
                    : <Icon className="h-12 w-12 text-cyan-300" aria-hidden="true" />}
                <span className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${source ? 'bg-emerald-950/80 text-emerald-100' : 'bg-slate-800 text-slate-200'}`}>
                    {source ? isRecording ? 'Nahrává' : 'Náhled aktivní' : 'Čeká na připojení'}
                </span>
            </div>
            <div className="space-y-3 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 shrink-0" /><span className="truncate" title={configuration.label}>{configuration.label}</span></p>
                {configuration.kind === 'camera' && configuration.isAudioEnabled
                    ? <>
                        <p className="truncate text-xs text-slate-600" title={microphoneName}>Mikrofon: {microphoneName}</p>
                        <p className={`text-xs font-medium ${isAudioTrackMuted ? 'text-amber-800' : 'text-emerald-800'}`}>Zvuková stopa: {isAudioIncluded ? isAudioTrackMuted ? 'přítomna, ale mikrofon dočasně neposílá data' : 'přítomna' : 'čeká na připojení'}</p>
                    </>
                    : configuration.kind === 'camera'
                        ? <p className="text-xs text-slate-600">Záměrně tiché video; mikrofon se nevyžaduje.</p>
                        : configuration.kind === 'microphone'
                            ? <p className={`text-xs font-medium ${isAudioTrackMuted ? 'text-amber-800' : 'text-emerald-800'}`}>Zvuková stopa: {isAudioIncluded ? isAudioTrackMuted ? 'přítomna, ale mikrofon dočasně neposílá data' : 'přítomna' : 'čeká na připojení'}</p>
                            : <p className="text-xs text-slate-600">Zvuk obrazovky/karty: {isAudioIncluded ? 'přítomen' : 'není sdílen'}</p>}
                {isAudioIncluded && <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600"><span>Živá úroveň zvuku · stopa přítomna</span><span>{audioLevel === null ? 'měřič nedostupný' : `${audioLevel}%`}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="meter" aria-label="Úroveň živého zvuku" aria-valuemin={0} aria-valuemax={100} aria-valuenow={audioLevel ?? 0}>
                        <div className="h-full rounded-full bg-cyan-600 transition-[width]" style={{ width: `${audioLevel ?? 0}%` }} />
                    </div>
                </div>}
                {isVideoSource && source?.stream.getAudioTracks().length ? <p className="text-xs text-slate-500">Náhled obrazu je ztlumený; zvuk se dál ukládá do souboru.</p> : null}
                {source && <p className="text-xs text-slate-500">Uloženo {formatRecordingBytes(byteLength)}</p>}
                {errorMessage && <p role="alert" className="rounded bg-red-50 p-2 text-xs leading-5 text-red-800">{errorMessage}</p>}
                <div className="flex flex-wrap gap-2">
                    {!source && <Button type="button" variant="outline" size="sm" disabled={isRecording || isConnecting} onClick={() => {
                        setIsConnecting(true);
                        void onConnect().catch(() => undefined).finally(() => setIsConnecting(false));
                    }}>{isConnecting ? 'Připojuji…' : errorMessage ? 'Zkusit znovu' : 'Připojit'}</Button>}
                    {children}
                    <Button type="button" variant="outline" size="sm" disabled={isRecording} onClick={onRemove}>Odebrat zdroj</Button>
                </div>
            </div>
        </article>
    );
}
