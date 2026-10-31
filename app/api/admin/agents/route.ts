import { NextRequest, NextResponse } from 'next/server';
import { getAgentDatabase, listManagedAgents, mapAgent } from '@/lib/agents/agentDatabase';
import { AGENT_VALUES_SCHEMA } from '@/lib/agents/agentModel';
import { withMessagesAdmin, readValidatedBody } from '@/lib/messages/messageAdminApi';
export const dynamic = 'force-dynamic';
export function GET(request: NextRequest) {
    return withMessagesAdmin(request, async () => NextResponse.json({ agents: await listManagedAgents() }, { headers: { 'Cache-Control': 'no-store' } }));
}
export function POST(request: NextRequest) {
    return withMessagesAdmin(request, async () => {
        const v = await readValidatedBody(request, AGENT_VALUES_SCHEMA);
        const { data, error } = await getAgentDatabase().from('workshop_agents').insert({ name: v.name, book_source: v.bookSource, is_enabled: v.isEnabled })
            .select('id,name,book_source,is_enabled').single();
        if (error) throw new Error('Agenta se nepodařilo vytvořit.');
        return NextResponse.json({ agent: mapAgent(data) }, { status: 201 });
    });
}
