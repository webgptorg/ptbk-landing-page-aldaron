'use client';
import { useCallback, useEffect, useState } from 'react';
import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import { Button } from '@/components/ui/button';
import { WorkshopAgentEditor, preloadWorkshopAgentBookEditor } from '@/businesses/workshop-admin/agents/WorkshopAgentEditor';
import { DEFAULT_WORKSHOP_AGENT_VALUES, type WorkshopAgentWriteValues } from '@/lib/workshops/agents/workshopAgentTypes';
import type { ManagedAgent } from '@/lib/agents/agentModel';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';
import { MessageConversations } from '@/components/messages/MessageConversations';
import { SITE_AGENT_EMBEDS } from '@/lib/site-agents/registry';
import { Pencil, Plus, Trash2 } from 'lucide-react';

export function AgentsAdmin() {
    const [agents, setAgents] = useState<ManagedAgent[] | null>(null);
    const [editing, setEditing] = useState<ManagedAgent | null | undefined>(undefined);
    const [history, setHistory] = useState<{ embedId: string; language: 'cs' | 'en' } | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const load = useCallback(async () => {
        try { setAgents((await requestAdminJson<{ agents: ManagedAgent[] }>('/api/admin/agents')).agents); }
        catch (e) { setError(e instanceof Error ? e.message : 'Agenty se nepodařilo načíst.'); }
    }, []);
    useEffect(() => { void load(); preloadWorkshopAgentBookEditor(); }, [load]);
    async function save(values: WorkshopAgentWriteValues) {
        setBusy(true); setError('');
        try {
            const { agent } = await requestAdminJson<{ agent: ManagedAgent }>(editing ? `/api/admin/agents/${editing.id}` : '/api/admin/agents', {
                method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: values.name, bookSource: values.bookSource, isEnabled: values.isEnabled }),
            });
            setAgents((current) => current ? current.some((item) => item.id === agent.id) ? current.map((item) => item.id === agent.id ? agent : item) : [...current, agent] : [agent]);
            if (editing === null) setEditing(agent);
            return true;
        } catch (e) { setError(e instanceof Error ? e.message : 'Agenta se nepodařilo uložit.'); return false; }
        finally { setBusy(false); }
    }
    async function remove(agent: ManagedAgent) {
        if (!window.confirm(`Odstranit agenta „${agent.name}“?`)) return;
        setBusy(true); setError('');
        try { await requestAdminJson(`/api/admin/agents/${agent.id}`, { method: 'DELETE' }); setAgents((current) => current?.filter((item) => item.id !== agent.id) ?? null); }
        catch (e) { setError(e instanceof Error ? e.message : 'Agenta se nepodařilo odstranit.'); }
        finally { setBusy(false); }
    }
    return <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold text-slate-950">Agents</h1><p className="mt-2 text-sm text-slate-500">Společní Book agenti pro zprávy, workshopy a vložené chaty webu.</p></div><Button disabled={!agents || busy} onClick={() => void runAfterAdminSaves(() => setEditing(null))}><Plus className="mr-2 h-4 w-4" />Nový agent</Button></header>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
        {!agents && !error && <p role="status">Načítám agenty…</p>}
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {agents?.map((agent) => <article key={agent.id} className="flex items-center justify-between gap-3 p-5"><div><h2 className="font-semibold">{agent.name}</h2><p className="mt-1 text-sm text-slate-500">{agent.isEnabled ? 'Zapnutý' : 'Vypnutý'}</p></div><div className="flex flex-wrap gap-2">{Object.entries(SITE_AGENT_EMBEDS).filter(([, embed]) => embed.agentId === agent.id).map(([embedId]) => <span key={embedId} className="flex gap-2">{(['cs', 'en'] as const).map(language => <Button key={language} variant="outline" size="sm" disabled={busy} onClick={() => void runAfterAdminSaves(() => setHistory({ embedId, language }))}>Konverzace {language.toUpperCase()}</Button>)}</span>)}<Button variant="outline" size="sm" disabled={busy} onClick={() => void runAfterAdminSaves(() => { setError(''); setEditing(agent); })}><Pencil className="mr-2 h-4 w-4" />Upravit Book</Button><Button variant="ghost" size="sm" disabled={busy} aria-label={`Odstranit agenta ${agent.name}`} onClick={() => void remove(agent)}><Trash2 className="h-4 w-4" /></Button></div></article>)}
        </div>
        <AdminEditorDialog isOpen={history !== null} onClose={() => setHistory(null)} title={`Konverzace poradce · ${history?.language.toUpperCase() ?? ''}`}>
            {history && <MessageConversations key={`${history.embedId}-${history.language}`} endpoint={`/api/admin/agents/embeds/${history.embedId}/${history.language}/conversations`} assistantName="Poradce s výběrem AI" />}
        </AdminEditorDialog>
        <AdminEditorDialog isOpen={editing !== undefined} onClose={() => setEditing(undefined)} canClose={() => !busy} title={editing ? editing.name : 'Nový agent'} errorMessage={error}>
            {editing !== undefined && <WorkshopAgentEditor key={editing?.id ?? 'new'} initialValues={editing ? { ...DEFAULT_WORKSHOP_AGENT_VALUES, ...editing } : null} globalOnly isListeningOffered={false} isSaving={busy} onSave={save} onCancel={() => setEditing(undefined)} />}
        </AdminEditorDialog>
    </div>;
}
