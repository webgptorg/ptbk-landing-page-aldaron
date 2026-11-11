'use client';

import { useEffect, useState } from 'react';
import type { PreparedMessageAudio } from '@/lib/messages/messageTranscriptionClient';

const STATUS_TEXT = {
    silent: 'V audiu nebyl nalezen zvukový signál.',
    'signal-detected': 'Audio obsahuje zvukový signál. Poslechem ověřte srozumitelnou řeč.',
    unavailable: 'Prohlížeč neumí automaticky změřit zvuk. Ověřte ho poslechem.',
};

export function MessageImportedAudioPreview({ audio }: { audio: PreparedMessageAudio }) {
    const [url, setUrl] = useState('');
    useEffect(() => {
        const source = URL.createObjectURL(audio.file);
        setUrl(source);
        return () => URL.revokeObjectURL(source);
    }, [audio.file]);
    return <div className="min-w-0 space-y-2 rounded-lg bg-slate-50 p-3">
        <p className="text-xs text-slate-600">{STATUS_TEXT[audio.analysis.status]}</p>
        {url && <>
            <audio controls preload="metadata" src={url} aria-label={`Kontrola audia – ${audio.file.name}`} className="w-full" />
            <a href={url} download={audio.file.name} className="inline-block text-sm underline">Stáhnout audio ke kontrole</a>
        </>}
        <details className="text-xs">
            <summary className="cursor-pointer">Podrobnosti audia</summary>
            <pre className="mt-2 overflow-x-auto">{JSON.stringify({ sourceMedia: audio.sourceMedia, analysis: audio.analysis }, null, 2)}</pre>
        </details>
    </div>;
}
