'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import { CopyTextButton } from '@/components/shortener/CopyTextButton';
import { MessageEditor } from './MessageEditor';
import { MessageConversations } from './MessageConversations';
import { getMessageUrl, type ManagedMessage, type MessageListItem } from '@/lib/messages/messageModel';
import type { ManagedAgent } from '@/lib/agents/agentModel';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';
import { ExternalLink, MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react';

type State = { messages: MessageListItem[]; agents: Pick<ManagedAgent, 'id' | 'name' | 'isEnabled'>[]; audioConfigured: boolean; transcriptionConfigured: boolean };
export function MessagesAdmin() {
    const search = useSearchParams();
    const [state, setState] = useState<State | null>(null);
    const [editing, setEditing] = useState<ManagedMessage | null | undefined>(undefined);
    const [conversationMessage, setConversationMessage] = useState<MessageListItem | null>(null);
    const [query, setQuery] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [siteChat, setSiteChat] = useState<'cs' | 'en' | null>(null);
    const load = useCallback(async () => {
        try { setState(await requestAdminJson<State>('/api/admin/messages')); setError(''); }
        catch (e) { setError(e instanceof Error ? e.message : 'Zprávy se nepodařilo načíst.'); }
    }, []);
    const openMessage = useCallback(async (message: MessageListItem) => {
        setBusy(true); setError('');
        try { setEditing((await requestAdminJson<{ message: ManagedMessage }>(`/api/admin/messages/${message.id}`)).message); }
        catch (e) { setError(e instanceof Error ? e.message : 'Zprávu se nepodařilo načíst.'); }
        finally { setBusy(false); }
    }, []);
    useEffect(() => { void load(); }, [load]);
    useEffect(() => {
        const linkId = search.get('shortcodeLinkId');
        if (state && linkId && editing === undefined) {
            const found = state.messages.find((message) => String(message.shortcodeLinkId) === linkId);
            if (found) void openMessage(found);
        }
    }, [search, state, editing, openMessage]);
    function saved(message: ManagedMessage) {
        setState((current) => current ? { ...current, messages: [message, ...current.messages.filter((item) => item.id !== message.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) } : current);
        if (editing === null) setEditing(message);
    }
    async function remove(message: MessageListItem) {
        if (!window.confirm(`Odstranit zprávu „${message.title}“ i její odkaz a zaznamenané konverzace?`)) return;
        setBusy(true); setError('');
        try { await requestAdminJson(`/api/admin/messages/${message.id}`, { method: 'DELETE' }); setState((current) => current ? { ...current, messages: current.messages.filter((item) => item.id !== message.id) } : current); }
        catch (e) { setError(e instanceof Error ? e.message : 'Zprávu se nepodařilo odstranit.'); }
        finally { setBusy(false); }
    }
    return <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold text-slate-950">Messages</h1><p className="mt-2 text-sm text-slate-500">Krátká zpráva, celý kontext a prostor pro otázky.</p></div>
            <Button disabled={!state || busy} onClick={() => void runAfterAdminSaves(() => setEditing(null))}><Plus className="mr-2 h-4 w-4" />Nová zpráva</Button></header>
        <Input aria-label="Hledat zprávy" placeholder="Hledat zprávy…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-md" />
        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4" aria-label="Konverzace z osobního webu">
            <span className="mr-auto text-sm font-medium">Chat na osobním webu</span>
            {(['cs', 'en'] as const).map(language => <Button key={language} variant="outline" onClick={() => void runAfterAdminSaves(() => setSiteChat(language))}>
                <MessageCircle className="mr-2 h-4 w-4" />{language === 'cs' ? 'Český web' : 'Anglický web'}</Button>)}
        </section>
        <AdminEditorDialog isOpen={siteChat !== null} onClose={() => setSiteChat(null)} title={`Chat na osobním webu · ${siteChat?.toUpperCase() ?? ''}`} className="max-w-4xl">
            {siteChat && <MessageConversations key={siteChat} language={siteChat} />}
        </AdminEditorDialog>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error} <button className="underline" onClick={() => void load()}>Zkusit znovu</button></p>}
        {!state && !error && <p role="status">Načítám zprávy…</p>}
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {state?.messages.filter((message) => `${message.title} ${message.shortcode}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map((message) => <article key={message.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0"><h2 className="font-semibold text-slate-900">{message.title}</h2><div className="mt-1 flex items-center gap-1 text-sm"><a className="break-all text-cyan-700 hover:underline" target="_blank" rel="noreferrer" href={getMessageUrl(message)}>{message.domain}/{message.shortcode}</a><CopyTextButton text={getMessageUrl(message)} label={`Kopírovat odkaz: ${message.title}`} /></div></div>
                <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" disabled={busy} onClick={() => void runAfterAdminSaves(() => setConversationMessage(message))}><MessageCircle className="mr-2 h-4 w-4" />Konverzace</Button><Button variant="ghost" size="sm" asChild><a href={getMessageUrl(message)} target="_blank" rel="noreferrer" aria-label={`Otevřít: ${message.title}`}><ExternalLink className="h-4 w-4" /></a></Button><Button variant="outline" size="sm" disabled={busy} onClick={() => void runAfterAdminSaves(() => openMessage(message))}><Pencil className="mr-2 h-4 w-4" />Upravit</Button><Button variant="ghost" size="sm" disabled={busy} aria-label={`Odstranit: ${message.title}`} onClick={() => void remove(message)}><Trash2 className="h-4 w-4" /></Button></div>
            </article>)}
            {state?.messages.length === 0 && <p className="p-8 text-center text-slate-500">Zatím tu není žádná zpráva.</p>}
        </div>
        <AdminEditorDialog isOpen={conversationMessage !== null} onClose={() => setConversationMessage(null)} title={`Konverzace: ${conversationMessage?.title ?? ''}`} className="max-w-4xl">
            {conversationMessage && <MessageConversations key={conversationMessage.id} messageId={conversationMessage.id} />}
        </AdminEditorDialog>
        <AdminEditorDialog isOpen={editing !== undefined && state !== null} onClose={() => { setEditing(undefined); if (search.has('shortcodeLinkId')) window.history.replaceState(null, '', '/admin/messages'); }} canClose={() => !busy}
            title={editing ? 'Upravit zprávu' : 'Nová zpráva'} className="max-w-4xl">
            {state && editing !== undefined && <MessageEditor key={editing?.id ?? 'new'} message={editing} agents={state.agents} audioConfigured={state.audioConfigured} transcriptionConfigured={state.transcriptionConfigured} onSaved={saved} onBusy={setBusy} />}
        </AdminEditorDialog>
    </div>;
}
