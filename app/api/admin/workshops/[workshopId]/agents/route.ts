import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopAgentRequest } from '@/lib/workshops/agents/workshopAgentAdminRequest';
import { loadWorkshopAgentAdminState, saveWorkshopAgent } from '@/lib/workshops/agents/workshopAgentDatabase';
import { WORKSHOP_AGENT_WRITE_SCHEMA } from '@/lib/workshops/agents/workshopAgentTypes';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { readonly params: Promise<{ readonly workshopId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopAgentRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    try {
        return NextResponse.json(await loadWorkshopAgentAdminState(workshopData.supabase, workshopId), {
            headers: { 'Cache-Control': 'no-store' },
        });
    } catch {
        return NextResponse.json({ error: 'Agenty se nepodařilo načíst.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, context: RouteContext) {
    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopAgentRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    const parsed = WORKSHOP_AGENT_WRITE_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success || (parsed.data.isListening && !getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isStageOffered)) {
        return NextResponse.json({ error: 'Zkontrolujte jméno, Book a intervaly agenta.' }, { status: 400 });
    }
    try {
        const agentId = await saveWorkshopAgent(workshopData.supabase, workshopId, null, parsed.data);
        return NextResponse.json({ agentId }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Agenta se nepodařilo uložit.' }, { status: 500 });
    }
}
