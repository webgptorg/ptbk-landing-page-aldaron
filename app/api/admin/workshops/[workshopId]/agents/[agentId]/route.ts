import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopAgentRequest } from '@/lib/workshops/agents/workshopAgentAdminRequest';
import { saveWorkshopAgent } from '@/lib/workshops/agents/workshopAgentDatabase';
import { WORKSHOP_AGENT_WRITE_SCHEMA } from '@/lib/workshops/agents/workshopAgentTypes';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type RouteContext = { readonly params: Promise<{ readonly workshopId: string; readonly agentId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
    const { workshopId, agentId } = await context.params;
    const workshopData = await getAdminWorkshopAgentRequest(request, workshopId);
    if ('response' in workshopData) return workshopData.response;
    const parsed = WORKSHOP_AGENT_WRITE_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!z.string().uuid().safeParse(agentId).success || !parsed.success ||
        (parsed.data.isListening && !getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isStageOffered)) {
        return NextResponse.json({ error: 'Zkontrolujte jméno, Book a intervaly agenta.' }, { status: 400 });
    }
    try {
        await saveWorkshopAgent(workshopData.supabase, workshopId, agentId, parsed.data);
        return NextResponse.json({ agentId });
    } catch {
        return NextResponse.json({ error: 'Agenta se nepodařilo uložit.' }, { status: 500 });
    }
}
