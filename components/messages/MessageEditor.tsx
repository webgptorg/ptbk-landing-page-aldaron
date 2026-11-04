'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { appendMessageTranscript, MESSAGE_AUDIO_ACCEPT } from '@/lib/messages/messageTranscription';
import { transcribeMessageFile } from '@/lib/messages/messageTranscriptionClient';
import { createMessagePrefix, createMessageShareText, getMessageUrl, MESSAGE_CONTEXT_MAX_LENGTH, MESSAGE_DOMAINS, MESSAGE_VALUES_SCHEMA,
    PAVOL_MESSAGE_AGENT_ID, type ManagedMessage, type MessageValues } from '@/lib/messages/messageModel';
import type { ManagedAgent } from '@/lib/agents/agentModel';
import { MessageMeetingRecorder } from './MessageMeetingRecorder';
import { ArrowLeft, ArrowRight, Copy, ExternalLink, LoaderCircle, Sparkles, Volume2 } from 'lucide-react';

type AgentChoice = Pick<ManagedAgent, 'id' | 'name' | 'isEnabled'>;
type Props = { message: ManagedMessage | null; agents: readonly AgentChoice[]; audioConfigured: boolean; transcriptionConfigured: boolean;
    onSaved: (message: ManagedMessage) => void; onBusy: (busy: boolean) => void };

export function MessageEditor({ message, agents, audioConfigured, transcriptionConfigured, onSaved, onBusy }: Props) {
    const [values, setValues] = useState<MessageValues>(() => message ? {
        title: message.title, markdown: message.markdown, context: message.context, introduction: message.introduction,
        prefix: message.prefix, domain: message.domain, agentId: message.agentId,
    } : { title: '', markdown: '', context: '', introduction: '', prefix: 'zprava', domain: 'pavolhejny.cz', agentId: PAVOL_MESSAGE_AGENT_ID });
    const [saved, setSaved] = useState(message);
    const [step, setStep] = useState(message ? 2 : 1);
    const [operation, setOperation] = useState('');
    const [error, setError] = useState('');
    const [transcriptionNotice, setTranscriptionNotice] = useState('');
    const [failedAudioFile, setFailedAudioFile] = useState<File | null>(null);
    const [pendingTranscript, setPendingTranscript] = useState('');
    const [recordingBusy, setRecordingBusy] = useState(false);
    const [contextSource, setContextSource] = useState<'meeting' | 'file' | 'text'>(message ? 'text' : 'meeting');
    const recordingBusyRef = useRef(false);
    const valuesRef = useRef(values); valuesRef.current = values;
    useAdminDraftProtection(pendingTranscript);
    const operationRef = useRef(false);
    const { copyStatus, copyText } = useCopyTextToClipboard();
    const update = <K extends keyof MessageValues>(field: K, value: MessageValues[K]) => setValues((old) => ({ ...old, [field]: value }));
    const save = async () => {
        const parsed = MESSAGE_VALUES_SCHEMA.safeParse(values);
        if (!parsed.success) throw new AdminSaveValidationError(parsed.error.issues[0]?.message ?? 'Zkontrolujte vyplněná pole.');
        const result = await requestAdminJson<{ message: ManagedMessage }>(saved ? `/api/admin/messages/${saved.id}` : '/api/admin/messages', {
            method: saved ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data),
        });
        setSaved(result.message);
        // Adopt server-prepared links only while this field still contains the submitted draft.
        if (valuesRef.current.markdown === parsed.data.markdown) {
            const normalized = { ...valuesRef.current, markdown: result.message.markdown };
            valuesRef.current = normalized;
            setValues(normalized);
        }
        if (!saved) autosave.acceptDraftValue();
        onSaved(result.message);
        return true;
    };
    const autosave = useAdminAutosave({ value: values, onSave: save, isEnabled: saved !== null });
    const run = async (name: string, action: () => Promise<void>) => {
        if (operationRef.current) return;
        operationRef.current = true; setOperation(name); setError(''); onBusy(true);
        try { await action(); }
        catch (e) { setError(e instanceof Error ? e.message : 'Požadavek se nepodařilo dokončit.'); }
        finally { operationRef.current = false; setOperation(''); onBusy(recordingBusyRef.current); }
    };
    const captureBusy = useCallback((value: boolean) => {
        recordingBusyRef.current = value; setRecordingBusy(value); onBusy(value || operationRef.current);
    }, [onBusy]);
    const acceptRecordedTranscript = (transcript: string) => {
        // Cached results can be re-applied after a reload without duplicating existing text.
        if (valuesRef.current.context.includes(transcript)) return;
        const context = appendMessageTranscript(valuesRef.current.context, transcript);
        valuesRef.current = { ...valuesRef.current, context };
        update('context', context);
        setContextSource('text');
    };
    const generate = () => run('Generuji texty…', async () => {
        if (!values.context.trim()) throw new Error('Nejprve vložte celý kontext.');
        const result = await requestAdminJson<Pick<MessageValues, 'title' | 'markdown' | 'introduction'>>('/api/admin/messages/generate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: values.context, agentId: values.agentId }),
        });
        setValues((current) => ({ ...current, ...result, prefix: !saved || current.prefix === createMessagePrefix(current.title) ? createMessagePrefix(result.title) : current.prefix }));
        setStep(2);
    });
    const generateAudio = () => run('Generuji nahrávku…', async () => {
        if (!saved || !(await autosave.saveNow())) throw new Error('Nejprve dokončete uložení zprávy.');
        const result = await requestAdminJson<{ message: ManagedMessage }>(`/api/admin/messages/${saved.id}/audio`, { method: 'POST' });
        setSaved(result.message); onSaved(result.message);
    });
    const transcribe = (file: File) => run('Připravuji přepis…', async () => {
        setContextSource('file');
        setTranscriptionNotice(''); setFailedAudioFile(null);
        let completed = false;
        try {
            const transcript = await transcribeMessageFile(file, setOperation);
            completed = true;
            // Retain the paid result even if the combined context exceeds its limit.
            setPendingTranscript(transcript);
            update('context', appendMessageTranscript(values.context, transcript));
            setContextSource('text');
            setPendingTranscript('');
            setTranscriptionNotice(`Přepis souboru „${file.name}“ byl přidán do kontextu. Text můžete upravit a pokračovat jako obvykle.`);
        } catch (failure) {
            if (!completed) setFailedAudioFile(file);
            throw failure;
        }
    });
    const publicUrl = saved ? getMessageUrl({ domain: values.domain, shortcode: `${values.prefix}-${saved.shortcode.split('-').at(-1)}` }) : '';
    const shareText = saved ? createMessageShareText(values.markdown, publicUrl) : '';
    const busy = Boolean(operation) || recordingBusy;

    return <form ref={autosave.formRef} className="space-y-5" onSubmit={(event) => { event.preventDefault(); if (!saved && step === 2) void run('Vytvářím zprávu…', async () => { await save(); }); }}>
        <nav aria-label="Kroky zprávy" className="flex gap-2 border-b border-slate-200 pb-4">
            <Button type="button" variant={step === 1 ? 'default' : 'outline'} disabled={busy} onClick={() => setStep(1)}>1. Celý kontext</Button>
            <Button type="button" variant={step === 2 ? 'default' : 'outline'} disabled={busy || !values.context.trim()} onClick={() => setStep(2)}>2. Zpráva</Button>
        </nav>
        <div hidden={step !== 1}>
            <MessageMeetingRecorder scope={saved?.id ?? 'new'} agentName={agents.find(agent => agent.id === values.agentId)?.name ?? 'Vybraný agent'} disabled={Boolean(operation) || Boolean(pendingTranscript)}
                transcriptionConfigured={transcriptionConfigured} onBusy={captureBusy} onTranscript={acceptRecordedTranscript} />
        </div>
        {step === 1 ? <>
            <div className="flex flex-wrap gap-2" aria-label="Další zdroje kontextu">
                <Button type="button" variant={contextSource === 'file' ? 'secondary' : 'ghost'} disabled={busy} onClick={() => setContextSource(contextSource === 'file' ? 'meeting' : 'file')}>Importovat audio soubor</Button>
                <Button type="button" variant={contextSource === 'text' ? 'secondary' : 'ghost'} disabled={busy} onClick={() => setContextSource(contextSource === 'text' ? 'meeting' : 'text')}>Napsat nebo upravit kontext{values.context ? ` (${new Intl.NumberFormat('cs-CZ').format(values.context.length)} znaků)` : ''}</Button>
            </div>
            <section hidden={contextSource !== 'file'} aria-label="Kontext z audia" className="space-y-3 rounded-xl border border-dashed border-slate-300 p-4"
                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = busy || !transcriptionConfigured || pendingTranscript ? 'none' : 'copy'; }}
                onDrop={(event) => {
                    event.preventDefault();
                    if (busy || !transcriptionConfigured || pendingTranscript) return;
                    const files = event.dataTransfer.files;
                    if (files.length !== 1) { setError('Přetáhněte jeden audio soubor.'); return; }
                    void transcribe(files[0]);
                }}>
                <label className="block text-sm font-medium">Audio soubor
                    <Input type="file" accept={MESSAGE_AUDIO_ACCEPT} disabled={busy || !transcriptionConfigured || Boolean(pendingTranscript)}
                        className="mt-2" onChange={(event) => {
                            const file = event.currentTarget.files?.[0];
                            event.currentTarget.value = '';
                            if (file) void transcribe(file);
                        }} aria-describedby="message-context-audio-help" />
                </label>
                <p id="message-context-audio-help" className="text-xs text-slate-500">{transcriptionConfigured
                    ? 'Vyberte nebo sem přetáhněte nahrávku (např. M4A ze Samsung rekordéru, MP3 nebo WAV, do 2 GB). Výběrem spustíte přepis přes ElevenLabs včetně rozlišení řečníků; spotřebovává kredity. Přepis doplní stávající kontext.'
                    : 'Pro přepis chybí serverové nastavení ElevenLabs.'}</p>
                {failedAudioFile && <Button type="button" variant="outline" disabled={busy || !transcriptionConfigured} onClick={() => void transcribe(failedAudioFile)}>Zkusit přepis znovu</Button>}
            </section>
            {transcriptionNotice && <p role="status" className="text-sm text-green-800">{transcriptionNotice}</p>}
            <div hidden={contextSource !== 'text'} className="space-y-2"><label className="block text-sm font-medium">Celý kontext
                <Textarea value={values.context} onChange={(e) => update('context', e.target.value)} disabled={busy}
                    rows={17} maxLength={MESSAGE_CONTEXT_MAX_LENGTH} className="mt-2 font-mono text-sm" placeholder="Vložte konverzaci, podklady nebo celé myšlenky…" required />
            </label>
            <p className="text-xs text-slate-500">{new Intl.NumberFormat('cs-CZ').format(values.context.length)} znaků</p></div>
            {pendingTranscript && <section className="space-y-3 rounded-xl border border-slate-200 p-4">
                <label className="block text-sm font-medium">Dokončený přepis
                    <Textarea value={pendingTranscript} readOnly rows={8} className="mt-2 font-mono text-sm" />
                </label>
                <Button type="button" variant="outline" disabled={busy} onClick={() => void run('Přidávám přepis…', async () => {
                    update('context', appendMessageTranscript(values.context, pendingTranscript)); setPendingTranscript('');
                    setTranscriptionNotice('Dokončený přepis byl přidán do kontextu.');
                })}>Přidat přepis do kontextu</Button>
            </section>}
            <label className="block text-sm font-medium">Agent
                <select value={values.agentId} disabled={busy} onChange={(e) => update('agentId', e.target.value)} className="mt-2 w-full rounded-md border border-slate-200 bg-white p-2">
                    {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}{agent.isEnabled ? '' : ' (vypnutý)'}</option>)}
                </select>
            </label>
            <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={busy || !values.context.trim()} onClick={generate}><Sparkles className="mr-2 h-4 w-4" />Vygenerovat a pokračovat</Button>
                <Button type="button" variant="outline" disabled={busy || !values.context.trim()} onClick={() => setStep(2)}>Pokračovat ručně<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
        </> : <>
            <div className="flex flex-wrap justify-between gap-2">
                <Button type="button" variant="ghost" disabled={busy} onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" />Kontext</Button>
                <Button type="button" variant="outline" disabled={busy} onClick={generate}><Sparkles className="mr-2 h-4 w-4" />Přegenerovat texty</Button>
            </div>
            <label className="block text-sm font-medium">Titulek
                <Input value={values.title} disabled={busy} maxLength={200} required className="mt-2" onChange={(e) => {
                    const title = e.target.value;
                    setValues((current) => ({ ...current, title, prefix: current.prefix === createMessagePrefix(current.title) ? createMessagePrefix(title) : current.prefix }));
                }} />
            </label>
            <label className="block text-sm font-medium">Krátká zpráva
                <Textarea value={values.markdown} disabled={busy} required maxLength={50_000} rows={12} className="mt-2" onChange={(e) => update('markdown', e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Úvodní zpráva chatu
                <Textarea value={values.introduction} disabled={busy} maxLength={4000} rows={3} className="mt-2" onChange={(e) => update('introduction', e.target.value)} />
            </label>
            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <label className="text-sm font-medium">Doména
                    <select value={values.domain} disabled={busy} onChange={(e) => update('domain', e.target.value as MessageValues['domain'])} className="mt-2 w-full rounded-md border border-slate-200 bg-white p-2">
                        {MESSAGE_DOMAINS.map((domain) => <option key={domain}>{domain}</option>)}
                    </select>
                </label>
                <label className="text-sm font-medium">Prefix adresy
                    <Input value={values.prefix} disabled={busy} required maxLength={40} pattern="[a-z0-9]+(-[a-z0-9]+)*" className="mt-2 font-mono" onChange={(e) => update('prefix', e.target.value)} onBlur={() => update('prefix', createMessagePrefix(values.prefix))} />
                </label>
            </div>
            {saved && <p className="break-all text-xs text-slate-500">{publicUrl} · Změna prefixu nebo domény mění sdílenou adresu.</p>}
            {saved ? <>
                <section className="space-y-3 rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-medium">Zpráva k odeslání</h3>
                        <Button type="button" disabled={busy} variant="outline" onClick={() => void run('Ukládám před kopírováním…', async () => { if (await autosave.saveNow()) await copyText(createMessageShareText(valuesRef.current.markdown, publicUrl)); })}><Copy className="mr-2 h-4 w-4" />{copyStatus === 'copied' ? 'Zkopírováno' : 'Kopírovat zprávu s odkazem'}</Button>
                    </div>
                    <Textarea aria-label="Zpráva k odeslání včetně odkazu" value={shareText} readOnly rows={6} className="bg-slate-50" />
                    {copyStatus === 'failed' && <p role="alert" className="text-sm text-red-700">Kopírování se nepodařilo. Označte a zkopírujte text z pole.</p>}
                    <Button asChild variant="ghost" size="sm"><a href={publicUrl} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Otevřít zprávu</a></Button>
                </section>
                <section className="space-y-3 rounded-xl border border-slate-200 p-4">
                    <h3 className="font-medium">Hlasová nahrávka</h3>
                    {saved.audio && <p className="text-sm text-slate-600">{saved.audio.voiceName} · {Math.round(saved.audio.duration)} s{values.markdown !== saved.markdown || !saved.audioIsCurrent ? ' · Text se změnil, nahrávka se na stránce nezobrazuje.' : ''}</p>}
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" disabled={busy || !audioConfigured} onClick={generateAudio}><Volume2 className="mr-2 h-4 w-4" />{saved.audio ? 'Přegenerovat hlas přes ElevenLabs' : 'Vygenerovat hlas přes ElevenLabs'}</Button>
                        {saved.audio && <Button type="button" variant="ghost" disabled={busy} onClick={() => void run('Odstraňuji nahrávku…', async () => {
                            const result = await requestAdminJson<{ message: ManagedMessage }>(`/api/admin/messages/${saved.id}/audio`, { method: 'DELETE' }); setSaved(result.message); onSaved(result.message);
                        })}>Odstranit nahrávku</Button>}
                    </div>
                    <p className="text-xs text-slate-500">{audioConfigured ? 'Generování spotřebovává ElevenLabs kredity. Spouští se pouze tímto tlačítkem.' : 'Pro generování chybí serverové nastavení ElevenLabs. Zpráva funguje i bez nahrávky.'}</p>
                </section>
            </> : <Button type="submit" disabled={busy}>Vytvořit zprávu</Button>}
        </>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {operation && <p role="status" className="flex items-center gap-2 text-sm text-slate-600"><LoaderCircle className="h-4 w-4 animate-spin" />{operation}</p>}
        {saved && <AdminAutosaveStatus {...autosave} />}
    </form>;
}
