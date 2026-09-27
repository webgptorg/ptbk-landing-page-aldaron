'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type CaptureStatus = 'idle' | 'requesting' | 'live' | 'temporarily-unavailable' | 'ended' | 'stopped' | 'cancelled' | 'failed';
type WindowPlacement = 'not-recorded' | 'same-space' | 'another-space' | 'fullscreen-space' | 'minimized' | 'hidden' | 'another-monitor' | 'multiple';
type ChooserResult = 'not-recorded' | 'visible-and-selected' | 'visible-but-unselectable' | 'missing' | 'cancelled';
type CaptureContinuity = 'not-tested' | 'still-updating' | 'frozen' | 'muted' | 'ended';
type VideoFrameCallbackElement = HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: (now: number, metadata: { readonly presentedFrames?: number }) => void) => number;
    cancelVideoFrameCallback?: (handle: number) => void;
};

const WINDOW_PLACEMENT_OPTIONS: readonly { readonly value: WindowPlacement; readonly label: string }[] = [
    { value: 'not-recorded', label: 'Nevybráno' },
    { value: 'same-space', label: 'Stejný běžný Space' },
    { value: 'another-space', label: 'Jiný běžný Space' },
    { value: 'fullscreen-space', label: 'Fullscreen Space' },
    { value: 'minimized', label: 'Minimalizované' },
    { value: 'hidden', label: 'Skryté okno' },
    { value: 'another-monitor', label: 'Jiný monitor' },
    { value: 'multiple', label: 'Více stavů současně' },
];

const CHOOSER_RESULT_OPTIONS: readonly { readonly value: ChooserResult; readonly label: string }[] = [
    { value: 'not-recorded', label: 'Nevybráno' },
    { value: 'visible-and-selected', label: 'Okno bylo vidět a šlo vybrat' },
    { value: 'visible-but-unselectable', label: 'Okno bylo vidět, ale nešlo vybrat' },
    { value: 'missing', label: 'Okno v nabídce chybělo' },
    { value: 'cancelled', label: 'Výběr byl zrušen' },
];

const CONTINUITY_OPTIONS: readonly { readonly value: CaptureContinuity; readonly label: string }[] = [
    { value: 'not-tested', label: 'Neověřeno' },
    { value: 'still-updating', label: 'Obraz se po přepnutí dál měnil' },
    { value: 'frozen', label: 'Obraz zamrzl nebo se neobnovil' },
    { value: 'muted', label: 'Video stopa byla ztlumena' },
    { value: 'ended', label: 'Video stopa skončila' },
];

function formatElapsedSince(timestamp: number | null): string {
    if (timestamp === null) return 'zatím žádný snímek';
    const elapsedSeconds = Math.max(0, Math.floor((performance.now() - timestamp) / 1000));
    return elapsedSeconds === 0 ? 'právě teď' : `před ${elapsedSeconds} s`;
}

export function RecordingCaptureProbe() {
    const videoReference = useRef<HTMLVideoElement>(null);
    const frameReference = useRef({ count: 0, lastAt: null as number | null });
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [captureStatus, setCaptureStatus] = useState<CaptureStatus>('idle');
    const [isRequesting, setIsRequesting] = useState(false);
    const [frameSnapshot, setFrameSnapshot] = useState({ count: 0, lastAt: null as number | null });
    const [events, setEvents] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copyMessage, setCopyMessage] = useState<string | null>(null);
    const [testStartedAt, setTestStartedAt] = useState('not started');
    const [browserUserAgent, setBrowserUserAgent] = useState('');
    const [macOSVersion, setMacOSVersion] = useState('');
    const [browserVersion, setBrowserVersion] = useState('');
    const [screenPermissionState, setScreenPermissionState] = useState('neověřeno');
    const [windowPlacement, setWindowPlacement] = useState<WindowPlacement>('not-recorded');
    const [chooserResult, setChooserResult] = useState<ChooserResult>('not-recorded');
    const [captureContinuity, setCaptureContinuity] = useState<CaptureContinuity>('not-tested');
    const [displaySurface, setDisplaySurface] = useState('neznámý');
    const [selectedSourceLabel, setSelectedSourceLabel] = useState('neznámý');
    const [mediaSettings, setMediaSettings] = useState('neznámé');

    const appendEvent = useCallback((message: string) => {
        setEvents((previousEvents) => [...previousEvents, `${new Date().toISOString()}  ${message}`].slice(-80));
    }, []);

    useEffect(() => {
        setBrowserUserAgent(navigator.userAgent);
    }, []);

    useEffect(() => {
        const video = videoReference.current as VideoFrameCallbackElement | null;
        if (!stream || !video) return;
        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) return;
        let isDisposed = false;
        let frameCallbackHandle: number | null = null;
        let previousVideoTime = -1;

        video.srcObject = stream;
        void video.play().catch(() => appendEvent('Náhled se nepodařilo spustit automaticky.'));

        const handleMute = () => {
            setCaptureStatus('temporarily-unavailable');
            appendEvent('Video stopa byla ztlumena prohlížečem nebo systémem.');
        };
        const handleUnmute = () => {
            setCaptureStatus('live');
            appendEvent('Video stopa znovu posílá obraz.');
        };
        const handleEnded = () => {
            setCaptureStatus('ended');
            appendEvent('Video stopa skončila.');
        };
        videoTrack.addEventListener('mute', handleMute);
        videoTrack.addEventListener('unmute', handleUnmute);
        videoTrack.addEventListener('ended', handleEnded);

        const requestVideoFrameCallback = video.requestVideoFrameCallback?.bind(video);
        if (requestVideoFrameCallback) {
            const updateFrame = () => {
                if (isDisposed) return;
                frameReference.current = { count: frameReference.current.count + 1, lastAt: performance.now() };
                frameCallbackHandle = requestVideoFrameCallback(updateFrame);
            };
            frameCallbackHandle = requestVideoFrameCallback(updateFrame);
        }
        const snapshotInterval = window.setInterval(() => {
            if (!requestVideoFrameCallback && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.currentTime !== previousVideoTime) {
                previousVideoTime = video.currentTime;
                frameReference.current = { count: frameReference.current.count + 1, lastAt: performance.now() };
            }
            setFrameSnapshot({ ...frameReference.current });
        }, 500);

        return () => {
            isDisposed = true;
            window.clearInterval(snapshotInterval);
            if (frameCallbackHandle !== null) video.cancelVideoFrameCallback?.(frameCallbackHandle);
            videoTrack.removeEventListener('mute', handleMute);
            videoTrack.removeEventListener('unmute', handleUnmute);
            videoTrack.removeEventListener('ended', handleEnded);
            video.srcObject = null;
            stream.getTracks().forEach((track) => track.stop());
        };
    }, [appendEvent, stream]);

    const report = useMemo(() => [
        'Recording studio plain getDisplayMedia diagnostic',
        `Test start time: ${testStartedAt}`,
        `macOS version/build (entered by user): ${macOSVersion || 'not recorded'}`,
        `Browser/version (entered by user): ${browserVersion || 'not recorded'}`,
        `Browser user agent: ${browserUserAgent || 'not available'}`,
        `Screen Recording permission state (entered by user): ${screenPermissionState}`,
        `VS Code window state: ${WINDOW_PLACEMENT_OPTIONS.find((option) => option.value === windowPlacement)?.label}`,
        `Chooser result: ${CHOOSER_RESULT_OPTIONS.find((option) => option.value === chooserResult)?.label}`,
        `Selected capture kind: ${displaySurface}`,
        `Selected source label: ${selectedSourceLabel}`,
        `Track settings: ${mediaSettings}`,
        `Capture continuity after Space switch: ${CONTINUITY_OPTIONS.find((option) => option.value === captureContinuity)?.label}`,
        `Probe track state: ${captureStatus}`,
        `Video frames reported: ${frameSnapshot.count}`,
        `Most recent frame: ${formatElapsedSince(frameSnapshot.lastAt)}`,
        'Capture request: navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })',
        'The test did not upload, record, store, or enumerate display sources.',
        'Events:',
        ...(events.length ? events : ['No capture events recorded.']),
    ].join('\n'), [browserUserAgent, browserVersion, captureContinuity, captureStatus, chooserResult, displaySurface, events, frameSnapshot, macOSVersion, mediaSettings, screenPermissionState, selectedSourceLabel, testStartedAt, windowPlacement]);

    const startCapture = async () => {
        if (isRequesting || stream) return;
        setIsRequesting(true);
        setErrorMessage(null);
        setCopyMessage(null);
        setCaptureStatus('requesting');
        const startedAt = new Date().toISOString();
        setTestStartedAt(startedAt);
        setEvents([`${startedAt}  Requested plain display capture.`]);
        frameReference.current = { count: 0, lastAt: null };
        setFrameSnapshot({ count: 0, lastAt: null });
        setDisplaySurface('neznámý');
        setSelectedSourceLabel('neznámý');
        setMediaSettings('neznámé');
        try {
            const nextStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            const videoTrack = nextStream.getVideoTracks()[0];
            if (!videoTrack) {
                nextStream.getTracks().forEach((track) => track.stop());
                throw new Error('Prohlížeč nevrátil video stopu.');
            }
            const settings = videoTrack.getSettings();
            const logicalSurfaceSetting = (settings as MediaTrackSettings & { readonly logicalSurface?: boolean }).logicalSurface;
            const nextDisplaySurface = settings.displaySurface || 'prohlížeč typ neoznámil';
            const nextSettings = [
                settings.width ? `${settings.width}×${settings.height}` : null,
                settings.frameRate ? `${settings.frameRate} fps` : null,
                logicalSurfaceSetting === undefined ? null : logicalSurfaceSetting ? 'logická plocha' : 'viditelná plocha',
            ].filter(Boolean).join(', ') || 'prohlížeč nastavení nevrátil';
            setDisplaySurface(nextDisplaySurface);
            setSelectedSourceLabel(videoTrack.label || 'prohlížeč název nevrátil');
            setMediaSettings(nextSettings);
            setCaptureStatus(videoTrack.muted ? 'temporarily-unavailable' : 'live');
            appendEvent(`Capture selected: ${nextDisplaySurface}; ${nextSettings}; track=${videoTrack.readyState}; muted=${videoTrack.muted}.`);
            setStream(nextStream);
        } catch (error) {
            const errorName = error instanceof DOMException ? error.name : 'Error';
            const isCancelled = errorName === 'AbortError' || errorName === 'NotAllowedError';
            const message = isCancelled
                ? 'Výběr nebo oprávnění bylo zrušeno či zamítnuto. Zkuste nový výběr tlačítkem; prohlížeč dál řídí své potvrzení.'
                : error instanceof Error ? error.message : 'Základní snímání obrazovky se nepodařilo spustit.';
            setCaptureStatus(isCancelled ? 'cancelled' : 'failed');
            setErrorMessage(message);
            appendEvent(`Capture request failed: ${errorName}${error instanceof Error ? ` — ${error.message}` : ''}.`);
        } finally {
            setIsRequesting(false);
        }
    };

    const stopCapture = () => {
        if (!stream) return;
        appendEvent('Testovací stream byl uživatelem zastaven.');
        setCaptureStatus('stopped');
        setStream(null);
    };

    const copyReport = async () => {
        try {
            await navigator.clipboard.writeText(report);
            setCopyMessage('Výsledek byl zkopírován do schránky.');
        } catch {
            setCopyMessage('Schránka není dostupná. Označte a zkopírujte text výsledku níže.');
        }
    };

    const isCaptureLive = captureStatus === 'live';
    const isFrameStale = isCaptureLive && frameSnapshot.lastAt !== null && performance.now() - frameSnapshot.lastAt > 3000;

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
            <div className="mx-auto max-w-4xl space-y-6">
                <header className="space-y-2">
                    <h1 className="text-2xl font-bold">Základní test snímání obrazovky</h1>
                    <p className="text-sm leading-6 text-slate-700">
                        Tato stránka volá přímo <code>getDisplayMedia({'{'} video: true, audio: false {'}'})</code> bez voleb studia pro rozlišení, typ plochy nebo výběr zdroje.
                        Výběr potvrzuje prohlížeč. Stránka pouze zobrazí lokální náhled a stav stopy; nic nenahrává, neukládá ani neodesílá.
                    </p>
                </header>

                <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2" aria-label="Podmínky reprodukce">
                    <label className="block text-sm font-medium">Verze a build macOS
                        <input className="mt-2 w-full rounded-lg border p-3" value={macOSVersion} placeholder="Např. macOS 15.1 (24B83)" onChange={(event) => setMacOSVersion(event.target.value)} />
                    </label>
                    <label className="block text-sm font-medium">Verze prohlížeče
                        <input className="mt-2 w-full rounded-lg border p-3" value={browserVersion} placeholder="Přesná verze z nabídky O aplikaci" onChange={(event) => setBrowserVersion(event.target.value)} />
                    </label>
                    <label className="block text-sm font-medium">Oprávnění Záznam obrazovky v macOS
                        <select className="mt-2 w-full rounded-lg border p-3" value={screenPermissionState} onChange={(event) => setScreenPermissionState(event.target.value)}>
                            <option value="neověřeno">Neověřeno</option><option value="prohlížeč je povolen">Prohlížeč je povolen</option><option value="prohlížeč je zakázán">Prohlížeč je zakázán</option><option value="položka v nastavení chybí">Položka v nastavení chybí</option><option value="nepoužívá se / nelze určit">Nepoužívá se / nelze určit</option>
                        </select>
                    </label>
                    <label className="block text-sm font-medium">Stav okna VS Code při výběru
                        <select className="mt-2 w-full rounded-lg border p-3" value={windowPlacement} onChange={(event) => setWindowPlacement(event.target.value as WindowPlacement)}>
                            {WINDOW_PLACEMENT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>
                    <label className="block text-sm font-medium">Výsledek v nabídce oken
                        <select className="mt-2 w-full rounded-lg border p-3" value={chooserResult} onChange={(event) => setChooserResult(event.target.value as ChooserResult)}>
                            {CHOOSER_RESULT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>
                    <label className="block text-sm font-medium">Obraz po změně obsahu a přepnutí Space
                        <select className="mt-2 w-full rounded-lg border p-3" value={captureContinuity} onChange={(event) => setCaptureContinuity(event.target.value as CaptureContinuity)}>
                            {CONTINUITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>
                </section>

                <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5" aria-label="Testovací snímání">
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" onClick={() => void startCapture()} disabled={isRequesting || Boolean(stream)}>{isRequesting ? 'Čekám na výběr prohlížeče…' : 'Vybrat zdroj a spustit základní test'}</Button>
                        {stream && <Button type="button" variant="outline" onClick={stopCapture}>Zastavit testovací stream</Button>}
                        <span role="status" className="self-center text-sm text-slate-700">Stav: {captureStatus}</span>
                    </div>
                    {errorMessage && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{errorMessage}</p>}
                    {captureStatus === 'temporarily-unavailable' && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Prohlížeč nebo systém ztlumil obrazovou stopu. Zkontrolujte, zda se znovu aktivuje; tento stav není důkazem, že se obraz úspěšně průběžně nahrává.</p>}
                    {captureStatus === 'ended' && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Video stopa skončila. Spusťte nový test a potvrďte nový výběr v prohlížeči.</p>}
                    <video ref={videoReference} autoPlay muted playsInline className="aspect-video w-full rounded-lg bg-slate-950 object-contain" aria-label="Lokální náhled vybraného zdroje" />
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                        <div><dt className="font-semibold">Vybraný typ</dt><dd>{displaySurface}</dd></div>
                        <div><dt className="font-semibold">Název stopy</dt><dd className="break-all">{selectedSourceLabel}</dd></div>
                        <div><dt className="font-semibold">Nastavení stopy</dt><dd>{mediaSettings}</dd></div>
                        <div><dt className="font-semibold">Video snímky</dt><dd>{frameSnapshot.count}; poslední {formatElapsedSince(frameSnapshot.lastAt)}{isFrameStale ? ' — bez nového snímku déle než 3 s' : ''}</dd></div>
                    </dl>
                    <p className="text-xs leading-5 text-slate-500">Po výběru okna proveďte v něm viditelnou změnu (například napište text do VS Code), přepněte Space a pak se vraťte k náhledu. Počet snímků dokládá jen snímky hlášené prohlížečem; vizuálně ověřte také, že náhled obsahuje nové změny.</p>
                </section>

                <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Reprodukční výsledek</h2><Button type="button" variant="outline" onClick={() => void copyReport()}>Kopírovat zprávu</Button></div>
                    {copyMessage && <p role="status" className="text-sm text-slate-700">{copyMessage}</p>}
                    <label className="block text-sm font-medium">Zkopírovatelný záznam
                        <textarea className="mt-2 min-h-64 w-full rounded-lg border p-3 font-mono text-xs" readOnly value={report} onFocus={(event) => event.currentTarget.select()} />
                    </label>
                </section>
            </div>
        </main>
    );
}
