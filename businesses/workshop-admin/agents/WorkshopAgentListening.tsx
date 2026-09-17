'use client';

import { Button } from '@/components/ui/button';
import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { useEffect, useRef, useState } from 'react';
import { WorkshopAgentAudioCapture } from './WorkshopAgentAudioCapture';

type WorkshopAgentListeningProps = {
    readonly workshop: WorkshopDetails;
    readonly isConfigured: boolean;
    readonly isListeningEnabled: boolean;
};

export function WorkshopAgentListening({ workshop, isConfigured, isListeningEnabled }: WorkshopAgentListeningProps) {
    const captureReference = useRef<WorkshopAgentAudioCapture | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isLive = getWorkshopPhase(workshop) === 'ongoing' && workshop.isPublished && !workshop.disabledPanels.includes('chat');
    const isCaptureOffered = isLive && isConfigured && isListeningEnabled;

    useEffect(() => () => { captureReference.current?.stop(); }, []);
    useEffect(() => { if (!isCaptureOffered) captureReference.current?.stop(); }, [isCaptureOffered]);

    const start = (source: 'tab' | 'microphone') => {
        setErrorMessage(null);
        setTranscript(null);
        setIsCapturing(true);
        const capture = new WorkshopAgentAudioCapture({
            workshopId: workshop.id,
            onTranscript: setTranscript,
            onStop: (message) => { setIsCapturing(false); setErrorMessage(message); captureReference.current = null; },
        });
        captureReference.current = capture;
        void capture.start(source);
    };

    return (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">Naslouchání živému workshopu</h3>
            <p className="max-w-2xl text-sm text-slate-500">Sdílejte kartu, ve které přehráváte workshop, a zapněte sdílení jejího zvuku. Nebo použijte mikrofon přednášejícího. Agenti dostávají průběžný přepis a podle svého Booku pokládají otázky do chatu.</p>
            <p className="text-sm text-slate-500">Tuto stránku nechte otevřenou na kartě Agenti. Na server odchází pouze zvuk, obraz se neposílá. Přepis je dostupný jen administraci a agentům.</p>
            {!isLive && <p className="text-sm text-amber-800">Naslouchání lze spustit během publikovaného workshopu s otevřeným chatem.</p>}
            {!isListeningEnabled && <p className="text-sm text-slate-500">Nejdříve zapněte naslouchání u alespoň jednoho agenta.</p>}
            <div className="flex flex-wrap gap-2">
                {isCapturing ? <Button variant="destructive" onClick={() => captureReference.current?.stop()}>Zastavit naslouchání</Button> : <>
                    <Button disabled={!isCaptureOffered} onClick={() => start('tab')}>Sdílet zvuk workshopu</Button>
                    <Button variant="outline" disabled={!isCaptureOffered} onClick={() => start('microphone')}>Použít mikrofon</Button>
                </>}
            </div>
            {isCapturing && <p role="status" className="text-sm text-emerald-800">Naslouchání je zapnuté. Přepis přichází přibližně po 15 sekundách.</p>}
            {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
            {transcript && <blockquote className="border-l-2 border-cyan-400 pl-3 text-sm text-slate-600">{transcript}</blockquote>}
        </div>
    );
}
