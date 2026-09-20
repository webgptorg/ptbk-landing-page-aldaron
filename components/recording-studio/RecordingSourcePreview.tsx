'use client';

import { Button } from '@/components/ui/button';
import { formatRecordingBytes } from '@/lib/recording-studio/recordingStudioTiming';
import type { RecordingSource } from '@/lib/recording-studio/recordingStudioTypes';
import { Mic, Monitor, Video } from 'lucide-react';
import { useEffect, useRef } from 'react';

const SOURCE_ICONS = { camera: Video, screen: Monitor, microphone: Mic };

export function RecordingSourcePreview({ source, byteLength, isRecording, onRemove }: {
    readonly source: RecordingSource;
    readonly byteLength: number;
    readonly isRecording: boolean;
    readonly onRemove: () => void;
}) {
    const videoReference = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        const video = videoReference.current;
        if (!video) return;
        video.srcObject = source.stream;
        return () => { video.srcObject = null; };
    }, [source.stream]);
    const Icon = SOURCE_ICONS[source.kind];
    return (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex aspect-video items-center justify-center bg-slate-950">
                {source.kind === 'microphone' ? <Mic className="h-12 w-12 text-cyan-300" aria-hidden="true" /> :
                    <video ref={videoReference} autoPlay muted playsInline className="h-full w-full object-contain" aria-label={`Živý náhled: ${source.label}`} />}
            </div>
            <div className="space-y-3 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 shrink-0" /><span className="truncate" title={source.label}>{source.label}</span></p>
                <p className="text-xs text-slate-500">{source.stream.getAudioTracks().length > 0 ? 'Se zvukem' : 'Bez zvuku'} · Uloženo {formatRecordingBytes(byteLength)}</p>
                <Button type="button" variant="outline" size="sm" disabled={isRecording} onClick={onRemove}>Odebrat zdroj</Button>
            </div>
        </article>
    );
}
