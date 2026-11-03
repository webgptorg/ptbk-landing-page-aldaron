'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { MessageMeetingCapture } from '@/lib/messages/MessageMeetingCapture';
import { listRecordingParts, loadRecordingChunks, loadRecordingPart, patchRecordingPart } from '@/lib/messages/messageRecordingStorage';
import { downloadRecordingBlob, listServerRecordingParts, persistRecordingTranscript, recordingFile, syncRecordingBackups } from '@/lib/messages/messageRecordingClient';
import { recordingFilename, type MessageRecordingPart } from '@/lib/messages/messageRecordingTypes';
import { transcribeMessageFile } from '@/lib/messages/messageTranscriptionClient';
import { Download, Mic, Square, RotateCcw } from 'lucide-react';

type Props = { scope: string; disabled: boolean; transcriptionConfigured: boolean; onBusy: (busy: boolean) => void; onTranscript: (transcript: string) => void };
const defaultTitle = () => `Meeting ${new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())}`;
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Nahrávání se nepodařilo dokončit.';
export function MessageMeetingRecorder({ scope, disabled, transcriptionConfigured, onBusy, onTranscript }: Props) {
    const [parts, setParts] = useState<MessageRecordingPart[]>([]), [remote, setRemote] = useState<MessageRecordingPart[]>([]);
    const [selected, setSelected] = useState(''), [title, setTitle] = useState(defaultTitle);
    const [active, setActive] = useState(false), [working, setWorking] = useState(false), [ready, setReady] = useState(false);
    const [error, setError] = useState(''), [backupError, setBackupError] = useState(''), [notice, setNotice] = useState('');
    const [progress, setProgress] = useState(''), [now, setNow] = useState(Date.now());
    const [recoveredTranscript, setRecoveredTranscript] = useState('');
    const [level, setLevel] = useState<number | null>(null);
    const [olderBefore, setOlderBefore] = useState<string | undefined>();
    const capture = useRef<MessageMeetingCapture | null>(null), syncing = useRef(false), alive = useRef(true);
    const callbacks = useRef({ onBusy, onTranscript }); callbacks.current = { onBusy, onTranscript };
    const busyRef = useRef(false);
    useAdminDraftProtection([active || working, recoveredTranscript, capture.current?.unsaved.length ?? 0]);
    const refresh = async () => {
        const saved = await listRecordingParts();
        if (alive.current) { setParts(saved); setActive(capture.current?.isActive ?? false); setSelected(old => old || saved.at(-1)?.recordingId || ''); }
    };
    const sync = async () => {
        if (syncing.current) return;
        syncing.current = true;
        try { await syncRecordingBackups(); if (alive.current) setBackupError(''); }
        catch (failure) { if (alive.current) setBackupError(errorText(failure)); }
        finally { syncing.current = false; await refresh().catch(() => undefined); }
    };
    const loadRemote = async (before?: string) => {
        try {
            const result = await listServerRecordingParts(before);
            if (!alive.current) return;
            setRemote(old => before ? [...old, ...result.parts] : result.parts);
            setSelected(old => old || result.parts[0]?.recordingId || '');
            setOlderBefore(result.parts.length === 100 ? result.parts.at(-1)?.startedAt : undefined);
        } catch (failure) { if (alive.current) setBackupError(errorText(failure)); }
    };
    useEffect(() => {
        alive.current = true;
        capture.current = new MessageMeetingCapture({
            changed: () => { void refresh().catch(failure => { if (alive.current) setError(errorText(failure)); });
                if (!capture.current?.isActive && !busyRef.current) callbacks.current.onBusy(false); },
            failed: message => { if (alive.current) setError(message); },
        });
        void refresh().then(() => { if (alive.current) setReady(true); }).catch(failure => setError(`Místní audio úložiště není dostupné: ${errorText(failure)}`));
        void loadRemote();
        const interval = setInterval(() => { setNow(Date.now()); void sync(); }, 5000);
        const meter = setInterval(() => { if (capture.current?.isActive) { setNow(Date.now()); setLevel(capture.current.microphoneLevel); } }, 250);
        const online = () => { void sync(); void loadRemote(); };
        window.addEventListener('online', online);
        return () => { alive.current = false; clearInterval(interval); clearInterval(meter); window.removeEventListener('online', online); void capture.current?.stop(true).catch(() => undefined); };
        // One recorder owns this mounted editor; live callbacks are held in refs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const merged = new Map(remote.map(part => [part.id, part]));
    for (const part of parts) merged.set(part.id, part);
    const all = Array.from(merged.values()).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    const groups = Array.from(new Map([...all].reverse().map(part => [part.recordingId, part])).values());
    const current = all.filter(part => part.recordingId === selected);
    const currentActive = active && capture.current?.currentPart?.recordingId === selected;
    const seconds = current.reduce((sum, part) => sum + Math.max(0, ((part.endedAt ? new Date(part.endedAt).getTime() : currentActive && part.id === capture.current?.currentPart?.id ? now : new Date(part.lastSavedAt ?? part.startedAt).getTime()) - new Date(part.startedAt).getTime()) / 1000), 0);
    const time = `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor(seconds / 60 % 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
    const perform = async (action: () => Promise<void>) => {
        if (busyRef.current) return;
        busyRef.current = true; setWorking(true); callbacks.current.onBusy(true); setError(''); setNotice('');
        try { await action(); }
        catch (failure) { setError(errorText(failure)); }
        finally { busyRef.current = false; setWorking(false); setProgress(''); callbacks.current.onBusy(capture.current?.isActive ?? false); await refresh().catch(() => undefined); }
    };
    const start = (resume = false) => perform(async () => {
        const recordingId = resume ? selected : crypto.randomUUID();
        if (!title.trim() && !resume) throw new Error('Zadejte název meetingu.');
        await capture.current!.start(scope, resume ? current[0].title : title.trim(), recordingId);
        // Only after obtaining the cross-tab lock may an abandoned local part be marked interrupted.
        for (const part of await listRecordingParts()) {
            if (part.status === 'recording' && part.id !== capture.current?.currentPart?.id) await patchRecordingPart(part.id, { status: 'interrupted' });
        }
        setSelected(recordingId); setActive(true); void sync();
        void navigator.storage?.persist?.().catch(() => false);
    });
    const stop = () => perform(async () => {
        await capture.current!.stop(); setActive(false); await refresh(); void sync();
        setNotice('Nahrávání je ukončené. Původní audio zůstává uložené; přepis spustíte samostatně.');
    });
    const transcribe = (selectedParts: MessageRecordingPart[]) => perform(async () => {
        for (const part of selectedParts) {
            const local = await loadRecordingPart(part.id), value = local ?? part;
            let transcript = value.transcript;
            if (!transcript) {
                if (value.attempted && !window.confirm('Předchozí přepis této části nemá uložený výsledek. Zkontrolujte historii v ElevenLabs. Přesto spustit nový placený přepis?')) return;
                const file = await recordingFile(value);
                await persistRecordingTranscript(value);
                transcript = await transcribeMessageFile(file, setProgress);
                setRecoveredTranscript(transcript);
                await persistRecordingTranscript(value, transcript);
                setRecoveredTranscript('');
                // The paid result is durable before editing/validating the message context.
                void sync();
            }
            callbacks.current.onTranscript(transcript);
        }
        setNotice('Přepis byl přidán do kontextu. Audio i uložené přepisy zůstávají dostupné.');
    });
    return <section aria-label="Rekordér meetingu" className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div><h3 className="flex items-center gap-2 text-lg font-semibold"><Mic className="h-5 w-5" />Nahrát meeting</h3>
            <p className="mt-1 text-sm text-slate-600">Spusťte mikrofon, nahrajte meeting a potom přidejte přepis do kontextu zprávy.</p></div>
        <label className="block text-sm font-medium">Název meetingu<Input value={title} maxLength={200} disabled={active || working || disabled} onChange={event => setTitle(event.target.value)} className="mt-1 bg-white" /></label>
        <div className="flex flex-wrap items-center gap-3">
            {active ? <Button type="button" className="min-h-12 bg-red-700 hover:bg-red-800" disabled={working} onClick={() => void stop()}><Square className="mr-2 h-5 w-5" />Ukončit nahrávání</Button>
                : <Button type="button" className="min-h-12" disabled={!ready || working || disabled} onClick={() => void start()}><Mic className="mr-2 h-5 w-5" />Spustit nahrávání</Button>}
            <output className={`font-mono text-xl tabular-nums ${active ? 'font-bold text-red-700' : ''}`} aria-label="Délka nahrávky">{time}</output>
            {active && <span role="status" className="font-semibold text-red-700">● Nahrává se mikrofon</span>}
        </div>
        {active && level !== null && <label className="flex items-center gap-3 text-xs text-slate-600">Úroveň mikrofonu<meter aria-label="Úroveň mikrofonu" min={0} max={1} value={level} className="h-4 min-w-0 flex-1" /></label>}
        <p className="text-xs text-slate-600">Nechte prohlížeč otevřený a telefon odemčený. Při dostupnosti držíme obrazovku rozsvícenou. Obnovení stránky, telefonní hovor nebo uspání mohou přerušit mikrofon; pokračování vytvoří novou část. Audio dodané prohlížečem ukládáme průběžně do tohoto zařízení a zálohujeme na server. Síťový výpadek neukončuje místní nahrávání.</p>
        {backupError && <p role="alert" className="rounded-lg bg-amber-100 p-3 text-sm text-amber-950">Serverová záloha zatím není potvrzená: {backupError} Nevymazávejte data tohoto prohlížeče. <button type="button" className="underline" onClick={() => void sync()}>Zkusit zálohu znovu</button></p>}
        {groups.length > 0 && <>
            <label className="block text-sm font-medium">Uložené meetingy<select aria-label="Uložené meetingy" value={selected} disabled={active || working} onChange={event => setSelected(event.target.value)} className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2">
                <option value="">Vyberte meeting…</option>{groups.map(group => <option key={group.recordingId} value={group.recordingId}>{group.title} · {new Date(group.startedAt).toLocaleString('cs-CZ')}</option>)}
            </select></label>
            {olderBefore && <Button type="button" variant="ghost" disabled={working} onClick={() => void loadRemote(olderBefore)}>Načíst starší serverové zálohy</Button>}
            {current.length > 0 && <>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" disabled={active || working || disabled} onClick={() => void start(true)}><RotateCcw className="mr-2 h-4 w-4" />Pokračovat novou částí</Button>
                    <Button type="button" disabled={active || working || disabled || !transcriptionConfigured} onClick={() => void transcribe(current)}>Přepsat všechny části do kontextu</Button>
                </div>
                <p className="text-xs text-slate-500">Přepis přes ElevenLabs spotřebovává kredity. Dokončené přepisy se použijí z uložené kopie. Řečníci se rozlišují v rámci každé části samostatně.</p>
                <ol className="space-y-2">{current.map((part, index) => {
                    const local = parts.find(item => item.id === part.id), isRecording = active && capture.current?.currentPart?.id === part.id;
                    const transcript = part.transcript;
                    return <li key={part.id} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="text-sm font-medium">Část {index + 1} · {new Date(part.startedAt).toLocaleTimeString('cs-CZ')} · {isRecording ? 'nahrává se' : part.status === 'complete' ? 'ukončená' : 'přerušená / obnovená záloha'}</div>
                        <p className="mt-1 text-xs text-slate-500">{local && !local.remoteOnly ? `Místně uloženo ${local.chunkCount} bloků (${(local.byteLength / 1024 / 1024).toFixed(1)} MB); server potvrdil ${local.backedUpChunks ?? 0} bloků.` : 'Serverová záloha; úplnost ověříme při stažení.'}{part.transcript ? ' Přepis uložen.' : ''}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Button type="button" size="sm" variant="outline" disabled={working || isRecording} onClick={() => void perform(async () => { const fresh = await loadRecordingPart(part.id) ?? part; downloadRecordingBlob(await recordingFile(fresh), recordingFilename(part)); })}><Download className="mr-2 h-4 w-4" />Stáhnout původní audio</Button>
                            <Button type="button" size="sm" variant="ghost" disabled={active || working || disabled || (!part.transcript && !transcriptionConfigured)} onClick={() => void transcribe([part])}>{part.transcript ? 'Přidat uložený přepis' : part.attempted ? 'Opakovat přepis…' : 'Přepsat část'}</Button>
                            {transcript && <Button type="button" size="sm" variant="ghost" onClick={() => downloadRecordingBlob(new Blob([transcript], { type: 'text/plain;charset=utf-8' }), `${recordingFilename(part)}.txt`)}>Stáhnout přepis</Button>}
                        </div>
                    </li>;
                })}</ol>
            </>}
        </>}
        {!!capture.current?.unsaved.length && <Button type="button" variant="outline" onClick={() => void perform(async () => {
            const part = capture.current!.currentPart!;
            const chunks = await loadRecordingChunks(part.id).catch(() => []);
            downloadRecordingBlob(new Blob([...chunks.map(chunk => chunk.bytes), ...capture.current!.unsaved], { type: part.mimeType }), `zachranene-${recordingFilename(part)}`);
        })}>Stáhnout záchrannou kopii včetně neuloženého konce</Button>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {recoveredTranscript && <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
            <p className="text-sm">Přepis je dokončený, ale jeho uložení nebylo potvrzené. Před zavřením si ho stáhněte.</p>
            <textarea aria-label="Zachráněný přepis" readOnly value={recoveredTranscript} rows={6} className="w-full rounded border p-2 text-sm" />
            <Button type="button" variant="outline" onClick={() => downloadRecordingBlob(new Blob([recoveredTranscript], { type: 'text/plain;charset=utf-8' }), 'zachraneny-prepis.txt')}>Stáhnout dokončený přepis</Button>
        </div>}
        {progress && <p role="status" className="text-sm">{progress}</p>}
        {notice && <p role="status" className="text-sm text-green-800">{notice}</p>}
    </section>;
}
