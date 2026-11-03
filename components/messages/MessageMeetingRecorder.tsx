'use client';
import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { MessageMeetingCapture } from '@/lib/messages/MessageMeetingCapture';
import { listRecordingParts, loadRecordingChunks, loadRecordingPart } from '@/lib/messages/messageRecordingStorage';
import { downloadRecordingBlob, persistRecordingTranscript, recordingFile } from '@/lib/messages/messageRecordingClient';
import { acquireMessageStudio } from '@/lib/messages/messageRecordingStudio';
import { preserveMessageRecordingsInStudio } from '@/lib/messages/messageRecordingRecovery';
import { recordingFilename, type MessageRecordingPart } from '@/lib/messages/messageRecordingTypes';
import { transcribeMessageFile } from '@/lib/messages/messageTranscriptionClient';
import { ArrowLeft, Check, Download, LoaderCircle, Mic, Pause, Play, Plus } from 'lucide-react';

type Props = { scope: string; agentName?: string; disabled: boolean; transcriptionConfigured: boolean; onBusy: (busy: boolean) => void; onTranscript: (transcript: string) => void };
const defaultTitle = () => `Meeting ${new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())}`;
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Nahrávání se nepodařilo dokončit.';
const duration = (part: MessageRecordingPart) => part.durationSeconds ?? Math.max(0, (new Date(part.endedAt ?? part.lastSavedAt ?? part.startedAt).getTime() - new Date(part.startedAt).getTime()) / 1000);

export function MessageMeetingRecorder({ scope, agentName = 'Pavol Hejný', disabled, transcriptionConfigured, onBusy, onTranscript }: Props) {
    const [parts, setParts] = useState<MessageRecordingPart[]>([]);
    const [open, setOpen] = useState(false), [confirmFinish, setConfirmFinish] = useState(false);
    const [selected, setSelected] = useState(''), [title, setTitle] = useState(defaultTitle);
    const [active, setActive] = useState(false), [paused, setPaused] = useState(false), [working, setWorking] = useState(false), [ready, setReady] = useState(false);
    const [error, setError] = useState(''), [notice, setNotice] = useState(''), [progress, setProgress] = useState('');
    const [seconds, setSeconds] = useState(0), [level, setLevel] = useState<number | null>(null), [microphoneInterrupted, setMicrophoneInterrupted] = useState(false);
    const [recoveredTranscript, setRecoveredTranscript] = useState('');
    const recoveredPartId = useRef<string | null>(null);
    const capture = useRef<MessageMeetingCapture | null>(null), alive = useRef(true), busyRef = useRef(false);
    const callbacks = useRef({ onBusy, onTranscript }); callbacks.current = { onBusy, onTranscript };
    const selectionKey = useRef(`ptbk-message-meeting-selection:${scope}`);
    const stateRef = useRef({ active, working }); stateRef.current = { active, working };
    useAdminDraftProtection([active || working, recoveredTranscript, capture.current?.unsaved.length ?? 0]);

    const choose = (id: string) => {
        setSelected(id);
        try { localStorage.setItem(selectionKey.current, id); } catch { /* IndexedDB retains the actual recording. */ }
    };
    const refresh = async () => {
        const saved = await listRecordingParts();
        if (!alive.current) return;
        setParts(saved); setActive(capture.current?.isActive ?? false); setPaused(capture.current?.isPaused ?? false);
    };
    useEffect(() => {
        alive.current = true;
        const recorder = new MessageMeetingCapture({
            changed: () => {
                if (!alive.current || capture.current !== recorder) return;
                void refresh().catch(failure => { if (alive.current) setError(errorText(failure)); });
                if (!recorder.isActive && !busyRef.current) callbacks.current.onBusy(false);
            },
            failed: message => { if (alive.current) setError(message); },
        });
        capture.current = recorder;
        try { setSelected(localStorage.getItem(selectionKey.current) ?? ''); } catch { /* Selection is optional. */ }
        void refresh().then(() => { if (alive.current) setReady(true); }).catch(failure => { if (alive.current) setError(`Místní audio úložiště není dostupné: ${errorText(failure)}`); });
        const meter = setInterval(() => {
            if (!alive.current) return;
            setSeconds(recorder.elapsedSeconds); setLevel(recorder.microphoneLevel); setMicrophoneInterrupted(recorder.isMicrophoneInterrupted);
        }, 250);
        return () => { alive.current = false; clearInterval(meter); void recorder.stop(true).catch(() => undefined); };
        // One capture owner survives opening/closing its fullscreen view. Live callbacks use refs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (!open) return;
        // Back closes an idle screen; during capture it stays in the studio instead of navigating away.
        const token = crypto.randomUUID();
        history.pushState({ ...history.state, meetingStudio: token }, '', location.href);
        const back = () => {
            if (stateRef.current.active || stateRef.current.working) {
                history.pushState({ ...history.state, meetingStudio: token }, '', location.href);
                setNotice('Nahrávání pokračuje. Pro návrat použijte tlačítko Zpět ke zprávě.');
            } else setOpen(false);
        };
        window.addEventListener('popstate', back);
        return () => {
            window.removeEventListener('popstate', back);
            if (history.state?.meetingStudio === token) history.back();
        };
    }, [open]);

    const all = parts.filter(part => part.scope === scope || part.scope === 'new' || part.recordingId === selected);
    const groups = Array.from(new Map([...all].reverse().map(part => [part.recordingId, part])).values());
    const current = all.filter(part => part.recordingId === selected);
    const timeSeconds = current.reduce((sum, part) => sum + (active && part.id === capture.current?.currentPart?.id ? seconds : duration(part)), 0);
    const time = `${Math.floor(timeSeconds / 3600).toString().padStart(2, '0')}:${Math.floor(timeSeconds / 60 % 60).toString().padStart(2, '0')}:${Math.floor(timeSeconds % 60).toString().padStart(2, '0')}`;
    const perform = async (action: () => Promise<void>) => {
        if (busyRef.current) return;
        busyRef.current = true; setWorking(true); callbacks.current.onBusy(true); setError(''); setNotice('');
        try { await action(); }
        catch (failure) { if (alive.current) setError(errorText(failure)); }
        finally {
            busyRef.current = false;
            if (alive.current) { setWorking(false); setProgress(''); callbacks.current.onBusy(capture.current?.isActive ?? false); await refresh().catch(() => undefined); }
        }
    };
    const openStudio = () => {
        setOpen(true);
        // Migrate the former recorder's local backups without touching source configuration or removing originals.
        void perform(async () => {
            const release = await acquireMessageStudio();
            try { await preserveMessageRecordingsInStudio(); }
            finally { await release(); }
        });
    };
    const start = () => perform(async () => {
        const recordingId = selected || crypto.randomUUID();
        const meetingTitle = current[0]?.title ?? title.trim();
        if (!meetingTitle) throw new Error('Zadejte název meetingu.');
        await capture.current!.start(scope, meetingTitle, recordingId, agentName);
        choose(recordingId); setSeconds(0); setActive(true); setPaused(false);
    });
    const close = () => {
        if (working) return;
        if (active && !window.confirm('Uložit dosavadní nahrávku a vrátit se ke zprávě bez přepisu? Audio zůstane v Recording Studiu.')) return;
        void perform(async () => { await capture.current!.stop(); setActive(false); setOpen(false); });
    };
    const transcribe = async (selectedParts: MessageRecordingPart[]) => {
        for (const part of selectedParts) {
            const value = await loadRecordingPart(part.id) ?? part;
            let transcript = value.transcript;
            if (!transcript) {
                if (value.attempted && !window.confirm('Předchozí přepis nemá uložený výsledek. Zkontrolujte historii v ElevenLabs. Přesto spustit nový placený přepis?')) return false;
                const file = await recordingFile(value);
                await persistRecordingTranscript(value);
                transcript = await transcribeMessageFile(file, setProgress);
                recoveredPartId.current = value.id;
                setRecoveredTranscript(transcript);
                await persistRecordingTranscript(value, transcript);
                setRecoveredTranscript(''); recoveredPartId.current = null;
            }
            callbacks.current.onTranscript(transcript);
        }
        return true;
    };
    const finish = () => {
        setConfirmFinish(false);
        void perform(async () => {
            await capture.current!.stop(); setActive(false); setPaused(false);
            const saved = (await listRecordingParts()).filter(part => part.recordingId === selected);
            if (await transcribe(saved)) { setOpen(false); setNotice('Přepis byl přidán do kontextu. Původní audio zůstává v Recording Studiu.'); }
        });
    };
    return <section aria-label="Rekordér meetingu" className="space-y-3">
        <Button type="button" size="lg" className="min-h-16 w-full justify-center gap-3 rounded-xl text-base" disabled={!ready || disabled || working} onClick={openStudio}>
            <Mic className="h-6 w-6" />Otevřít Meeting Studio
        </Button>
        <p className="text-center text-xs text-slate-500">Nahrát meeting, pozastavit a přepsat do kontextu. Původní audio zůstane v Recording Studiu.</p>
        {!open && error && <p role="alert" className="text-sm text-red-800">{error}</p>}
        {!open && notice && <p role="status" className="text-sm text-green-800">{notice}</p>}
        <Dialog.Root open={open} onOpenChange={next => { if (!next && !active && !working) close(); }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-950" />
                <Dialog.Content id="meeting-studio-screen" tabIndex={-1} className="fixed inset-0 z-[101] flex h-[100dvh] flex-col overflow-y-auto overscroll-contain bg-slate-950 text-white outline-none"
                    onEscapeKeyDown={event => { if (active || working) event.preventDefault(); }} onPointerDownOutside={event => event.preventDefault()}
                    onOpenAutoFocus={event => { event.preventDefault(); document.getElementById('meeting-studio-screen')?.focus(); }}>
                    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
                        <Button type="button" variant="ghost" className="text-slate-300 hover:bg-white/10 hover:text-white" disabled={working} onClick={close}><ArrowLeft className="mr-2 h-4 w-4" />Zpět ke zprávě</Button>
                        <div className="text-right"><Dialog.Title className="font-semibold">Meeting Studio</Dialog.Title><p className="text-xs text-slate-400">{agentName}</p></div>
                    </header>
                    <Dialog.Description className="sr-only">Samostatný rekordér meetingu. Pauza a pokračování zachovají jednu nahrávku. Dokončení a přepis vyžadují potvrzení.</Dialog.Description>
                    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 px-5 py-5 sm:gap-8 sm:py-8">
                        {!active && !current.length ? <label className="w-full max-w-md text-center text-sm text-slate-400">Název meetingu<Input className="mt-2 border-white/20 bg-white/5 text-center text-lg text-white" value={title} maxLength={200} disabled={working} onChange={event => setTitle(event.target.value)} /></label>
                            : <p className="max-w-full break-words text-center text-lg text-slate-300">{current[0]?.title ?? title}</p>}
                        <div className="space-y-3 text-center">
                            <p role="status" className={`flex items-center justify-center gap-2 font-medium ${microphoneInterrupted ? 'text-amber-300' : active && !paused ? 'text-red-300' : 'text-slate-300'}`}>
                                <span className={`h-2.5 w-2.5 rounded-full ${active && !paused && !microphoneInterrupted ? 'bg-red-500 motion-safe:animate-pulse' : 'bg-amber-400'}`} />
                                {working ? progress || 'Ukládám…' : microphoneInterrupted && active ? 'Mikrofon je dočasně přerušený' : active ? paused ? 'Pozastaveno' : 'Nahrává se' : current.length ? 'Uložená nahrávka' : 'Připraveno k nahrávání'}
                            </p>
                            <output aria-label="Délka nahrávky" className="block font-mono text-5xl font-light tabular-nums tracking-tight sm:text-7xl">{time}</output>
                        </div>
                        <button id="meeting-record-control" type="button" aria-label={active ? paused ? 'Pokračovat v nahrávání' : 'Pozastavit nahrávání' : current.length ? 'Pokračovat v meetingu' : 'Spustit nahrávání'}
                            disabled={working || disabled || Boolean(recoveredTranscript)} onClick={() => { if (!active) void start(); else void perform(async () => { if (capture.current!.isPaused) capture.current!.resume(); else await capture.current!.pause(); }); }}
                            className={`flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-8 border-white/10 shadow-2xl transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-8 focus-visible:outline-white disabled:opacity-40 sm:h-40 sm:w-40 ${active && !paused ? 'bg-red-600 hover:bg-red-500' : 'bg-white text-slate-950 hover:bg-slate-200'}`}>
                            {working ? <LoaderCircle className="h-12 w-12 animate-spin" /> : active ? paused ? <Play className="h-12 w-12 fill-current" /> : <Pause className="h-12 w-12 fill-current" /> : <Mic className="h-12 w-12" />}
                        </button>
                        <p className="-mt-3 text-sm text-slate-400">{active ? paused ? 'Pokračovat ve stejné nahrávce' : 'Klepnutím pozastavíte nahrávání' : current.length ? 'Pokračovat novou částí · předchozí audio zůstane uložené' : 'Klepnutím spustíte mikrofon'}</p>
                        {active && <meter aria-label="Úroveň mikrofonu" min={0} max={1} value={level ?? 0} className="h-2 w-48" />}
                        <Button type="button" size="lg" variant="outline" className="min-h-12 w-full max-w-sm border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            disabled={working || disabled || Boolean(recoveredTranscript) || (!active && !current.length) || !transcriptionConfigured} onClick={() => setConfirmFinish(true)}><Check className="mr-2 h-5 w-5" />Dokončit a přepsat</Button>
                        {!transcriptionConfigured && <p className="text-sm text-amber-300">Přepis nemá nastavené ElevenLabs. Audio můžete nahrát a uložit.</p>}
                        <p className="max-w-md text-center text-xs leading-relaxed text-slate-400">Audio průběžně ukládáme v tomto prohlížeči do Recording Studia. Telefon nechte odemčený; při dostupnosti držíme obrazovku rozsvícenou. Zamčení nebo zavření může přerušit mikrofon, uložená data zůstávají zachovaná.</p>
                        {(error || recoveredTranscript) && <div className="w-full space-y-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4">
                            {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
                            {recoveredTranscript && <><p className="text-sm">Přepis je hotový, jeho uložení ale nebylo potvrzené. Před zavřením ho stáhněte.</p><textarea aria-label="Zachráněný přepis" readOnly value={recoveredTranscript} rows={5} className="w-full rounded bg-slate-900 p-3 text-sm" /><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => downloadRecordingBlob(new Blob([recoveredTranscript], { type: 'text/plain;charset=utf-8' }), 'zachraneny-prepis.txt')}>Stáhnout dokončený přepis</Button><Button type="button" disabled={working} onClick={() => void perform(async () => {
                                const part = recoveredPartId.current ? await loadRecordingPart(recoveredPartId.current) : undefined;
                                if (!part) throw new Error('Původní přepis nelze přiřadit k nahrávce. Stáhněte dokončený text.');
                                await persistRecordingTranscript(part, recoveredTranscript);
                                const transcript = recoveredTranscript; setRecoveredTranscript(''); recoveredPartId.current = null;
                                callbacks.current.onTranscript(transcript); setOpen(false); setNotice('Dokončený přepis byl uložen a přidán do kontextu.');
                            })}>Zkusit uložit hotový přepis</Button></div></>}
                        </div>}
                        {notice && <p role="status" className="text-sm text-slate-300">{notice}</p>}
                    </div>
                    {!active && <footer className="mx-auto w-full max-w-2xl space-y-4 px-5 pb-8">
                        <div className="flex justify-center gap-4">
                            <Button type="button" variant="ghost" className="text-slate-300 hover:bg-white/10 hover:text-white" disabled={working} onClick={() => { choose(''); setTitle(defaultTitle()); setSeconds(0); setError(''); }}><Plus className="mr-2 h-4 w-4" />Nový meeting</Button>
                            <a className="self-center text-sm text-slate-400 underline" href="/admin/studio/recording" target="_blank" rel="noreferrer">Recording Studio</a>
                        </div>
                        {groups.length > 0 && <details className="rounded-xl border border-white/10 p-4" open={current.length > 0}>
                            <summary className="cursor-pointer text-sm text-slate-300">Uložené nahrávky ({groups.length})</summary>
                            <label className="mt-4 block text-sm text-slate-400">Meeting<select aria-label="Uložené meetingy" value={selected} disabled={working} onChange={event => choose(event.target.value)} className="mt-2 w-full rounded-md border border-white/20 bg-slate-900 p-3 text-white"><option value="">Vyberte meeting…</option>{groups.map(group => <option key={group.recordingId} value={group.recordingId}>{group.title} · {new Date(group.startedAt).toLocaleString('cs-CZ')}</option>)}</select></label>
                            <ol className="mt-4 space-y-3">{current.map((part, i) => <li key={part.id} className="space-y-2 border-t border-white/10 pt-3 text-sm">
                                <p>{current.length > 1 ? `Část ${i + 1} · ` : ''}{part.status === 'complete' ? 'Dokončená' : 'Obnovená nahrávka'} · {(part.byteLength / 1024 / 1024).toFixed(1)} MB{part.transcript ? ' · přepis uložen' : ''}</p>
                                <div className="flex flex-wrap gap-3"><button type="button" className="flex items-center text-slate-300 underline disabled:opacity-40" disabled={working} onClick={() => void perform(async () => { downloadRecordingBlob(await recordingFile(await loadRecordingPart(part.id) ?? part), recordingFilename(part)); })}><Download className="mr-1 h-4 w-4" />Stáhnout původní audio</button>
                                    {part.transcript && <button type="button" className="text-slate-300 underline" onClick={() => downloadRecordingBlob(new Blob([part.transcript!], { type: 'text/plain;charset=utf-8' }), `${recordingFilename(part)}.txt`)}>Stáhnout přepis</button>}
                                </div>
                            </li>)}</ol>
                        </details>}
                    </footer>}
                    {!!capture.current?.unsaved.length && <div className="px-5 pb-6 text-center"><Button type="button" variant="destructive" onClick={() => void perform(async () => {
                        const part = capture.current!.currentPart!;
                        const chunks = await loadRecordingChunks(part.id).catch(() => []);
                        downloadRecordingBlob(new Blob([...chunks.map(chunk => chunk.bytes), ...capture.current!.unsaved], { type: part.mimeType }), `zachranene-${recordingFilename(part)}`);
                    })}>Stáhnout záchrannou kopii včetně neuloženého konce</Button></div>}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
        <AlertDialog open={confirmFinish} onOpenChange={setConfirmFinish}>
            <AlertDialogContent className="z-[110]">
                <AlertDialogHeader><AlertDialogTitle>Dokončit meeting a spustit přepis?</AlertDialogTitle><AlertDialogDescription>Nahrávání se ukončí a audio odešleme do ElevenLabs pro přepis do kontextu zprávy. Přepis spotřebovává kredity. Původní nahrávka zůstane v Recording Studiu, dokud ji tam ručně nesmažete.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Pokračovat v meetingu</AlertDialogCancel><AlertDialogAction onClick={finish}>Ano, dokončit a přepsat</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </section>;
}
