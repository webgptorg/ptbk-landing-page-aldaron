import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopAgentRequest } from '@/lib/workshops/agents/workshopAgentAdminRequest';
import { hasWorkshopListeningAgents } from '@/lib/workshops/agents/workshopAgentAudio';
import { isWorkshopAgentConfigured, isWorkshopAgentLiveAudioAllowed } from '@/lib/workshops/agents/workshopAgentPolicy';
import { WORKSHOP_AGENT_AUDIO_SESSION_TABLE_NAME } from '@/lib/workshops/agents/workshopAgentTypes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const SESSION_SCHEMA = z.object({ sessionId: z.string().uuid() }).strict();
type RouteContext = { readonly params: Promise<{ readonly workshopId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopAgentRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    const parsed = SESSION_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return NextResponse.json({ error: 'Neplatná relace zvuku.' }, { status: 400 });
    if (!isWorkshopAgentConfigured()) return NextResponse.json({ error: 'Na serveru chybí OPENAI_API_KEY.' }, { status: 503 });
    if (!isWorkshopAgentLiveAudioAllowed(workshopData.workshopRow)) {
        return NextResponse.json({ error: 'Naslouchání je dostupné jen během publikovaného živého workshopu s otevřeným chatem.' }, { status: 409 });
    }
    try {
        if (!await hasWorkshopListeningAgents(workshopData.supabase, workshopId)) {
            return NextResponse.json({ error: 'Nejdříve zapněte naslouchání alespoň jednomu agentovi.' }, { status: 409 });
        }
        const { data: isStarted, error } = await workshopData.supabase.rpc('start_workshop_agent_audio', {
            target_workshop_id: workshopId, target_session_id: parsed.data.sessionId,
        });
        if (error) throw new Error('Audio session unavailable');
        if (!isStarted) return NextResponse.json({ error: 'Zvuk už sdílí jiné okno. Zastavte jej nebo vyčkejte 90 sekund.' }, { status: 409 });
        return NextResponse.json({ sessionId: parsed.data.sessionId });
    } catch {
        return NextResponse.json({ error: 'Naslouchání se nepodařilo spustit.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopAgentRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    const parsed = SESSION_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return NextResponse.json({ error: 'Neplatná relace zvuku.' }, { status: 400 });
    const { error } = await workshopData.supabase.from(WORKSHOP_AGENT_AUDIO_SESSION_TABLE_NAME)
        .delete().eq('workshop_id', workshopId).eq('session_id', parsed.data.sessionId);
    return error ? NextResponse.json({ error: 'Naslouchání se nepodařilo zastavit.' }, { status: 500 }) : NextResponse.json({ isStopped: true });
}
