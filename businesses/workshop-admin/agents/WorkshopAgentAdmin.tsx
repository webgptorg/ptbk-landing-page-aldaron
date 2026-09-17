'use client';

import { fetchAdminWorkshopAgents, saveAdminWorkshopAgent } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { Button } from '@/components/ui/button';
import type { WorkshopAgentAdminState, WorkshopAgentDefinition, WorkshopAgentWriteValues } from '@/lib/workshops/agents/workshopAgentTypes';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { useCallback, useEffect, useState } from 'react';
import { WorkshopAgentEditor } from './WorkshopAgentEditor';
import { WorkshopAgentListening } from './WorkshopAgentListening';

const AGENT_REFRESH_MILLISECONDS = 10_000;
const AGENT_RUN_STATUS_LABELS = { pending: 'Čeká', running: 'Připravuje zprávu', replied: 'Odesláno', skipped: 'Bez odpovědi', failed: 'Selhalo' } as const;

export function WorkshopAgentAdmin({ workshop }: { readonly workshop: WorkshopDetails }) {
    const [state, setState] = useState<WorkshopAgentAdminState | null>(null);
    const [editedAgent, setEditedAgent] = useState<WorkshopAgentDefinition | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isListeningOffered = getWorkshopKindCapabilities(workshop.kind).isStageOffered;

    const refresh = useCallback(async () => {
        try {
            setState(await fetchAdminWorkshopAgents(workshop.id));
        } catch (error) {
            setErrorMessage((error as Error).message);
        }
    }, [workshop.id]);

    useEffect(() => {
        void refresh();
        const interval = setInterval(() => void refresh(), AGENT_REFRESH_MILLISECONDS);
        return () => clearInterval(interval);
    }, [refresh]);

    const save = async (values: WorkshopAgentWriteValues) => {
        setIsSaving(true);
        setErrorMessage(null);
        try {
            await saveAdminWorkshopAgent(workshop.id, editedAgent?.id ?? null, values);
            setIsEditing(false);
            await refresh();
        } catch (error) {
            setErrorMessage((error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">Agenti v diskusi</h2>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">Vyberte osobnosti, které se zapojí do této místnosti. Každá odpovídá podle svého Booku; může také reagovat na jiné agenty.</p>
                </div>
                <Button disabled={isSaving} onClick={() => { setEditedAgent(null); setIsEditing(true); }}>Nový agent</Button>
            </div>
            {errorMessage && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p>}
            {state !== null && !state.isConfigured && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Agenty můžete připravit. Odpovídat začnou po nastavení OPENAI_API_KEY na serveru.</p>}
            {state === null ? <p className="text-sm text-slate-500">Načítám agenty…</p> : <div className="grid gap-3 sm:grid-cols-2">
                {state.agents.length === 0 && <p className="text-sm text-slate-500">Zatím nemáte žádného agenta. Vytvořte prvního a napište jeho Book.</p>}
                {state.agents.map((agent) => <button type="button" key={agent.id} disabled={isSaving}
                    onClick={() => { setEditedAgent(agent); setIsEditing(true); }}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-cyan-500 focus-visible:outline-cyan-600">
                    <span className="block font-semibold">{agent.name}</span>
                    <span className="mt-1 block text-sm text-slate-500">{!agent.isEnabled ? 'Vypnutý ve všech místnostech' : [agent.isReplyEnabled ? 'Odpovídá v chatu' : '', agent.isListening ? 'Naslouchá workshopu' : ''].filter(Boolean).join(' · ') || 'V této místnosti se nezapojuje'}</span>
                </button>)}
            </div>}
            {isEditing && <WorkshopAgentEditor key={editedAgent?.id ?? 'new'} initialValues={editedAgent === null ? null : {
                name: editedAgent.name, bookSource: editedAgent.bookSource, isEnabled: editedAgent.isEnabled,
                isReplyEnabled: editedAgent.isReplyEnabled, isListening: editedAgent.isListening,
                replyCooldownSeconds: editedAgent.replyCooldownSeconds, questionIntervalSeconds: editedAgent.questionIntervalSeconds,
            }} isListeningOffered={isListeningOffered} isSaving={isSaving} onSave={save} onCancel={() => setIsEditing(false)} />}
            {isListeningOffered && <WorkshopAgentListening workshop={workshop} isConfigured={state?.isConfigured ?? false}
                isListeningEnabled={state?.agents.some((agent) => agent.isEnabled && agent.isListening) ?? false} />}
            {state !== null && state.runs.length > 0 && <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold">Poslední aktivita</h3>
                <ul className="mt-3 divide-y divide-slate-100 text-sm">
                    {state.runs.map((run) => <li key={run.id} className="flex flex-wrap justify-between gap-2 py-2" title={`Běh: ${run.id}`}>
                        <span>{run.agentName} · {run.isLiveQuestion ? 'Otázka k workshopu' : 'Odpověď v chatu'}</span>
                        <span className="text-slate-500">{AGENT_RUN_STATUS_LABELS[run.status]}{run.errorCode ? ' · ' + run.errorCode : ''}</span>
                    </li>)}
                </ul>
            </div>}
        </section>
    );
}
