import { NextRequest, NextResponse } from 'next/server';
import { getAgentDatabase, mapAgent } from '@/lib/agents/agentDatabase';
import { AGENT_VALUES_SCHEMA } from '@/lib/agents/agentModel';
import { withMessagesAdmin, readValidatedBody, requireRecordId } from '@/lib/messages/messageAdminApi';
type Context = { params: Promise<{ id: string }> };
export function PATCH(request: NextRequest, { params }: Context) {
    return withMessagesAdmin(request, async () => {
        const id = requireRecordId((await params).id);
        const v = await readValidatedBody(request, AGENT_VALUES_SCHEMA);
        const { data, error } = await getAgentDatabase().from('workshop_agents').update({ name: v.name, book_source: v.bookSource, is_enabled: v.isEnabled, updated_at: new Date().toISOString() })
            .eq('id', id).select('id,name,book_source,is_enabled').maybeSingle();
        if (error) throw new Error('Agenta se nepodařilo uložit.');
        return NextResponse.json(data ? { agent: mapAgent(data) } : { error: 'Agent nebyl nalezen.' }, { status: data ? 200 : 404 });
    });
}
export function DELETE(request: NextRequest, { params }: Context) {
    return withMessagesAdmin(request, async () => {
        const id = requireRecordId((await params).id);
        const { data, error } = await getAgentDatabase().from('workshop_agents').delete().eq('id', id).select('id').maybeSingle();
        if (error?.code === '23503') return NextResponse.json({ error: 'Agent je použitý ve zprávách nebo historii workshopů. Můžete jej vypnout nebo nejprve změnit přiřazení.' }, { status: 409 });
        if (error) throw new Error('Agenta se nepodařilo odstranit.');
        return NextResponse.json(data ? { isDeleted: true } : { error: 'Agent nebyl nalezen.' }, { status: data ? 200 : 404 });
    });
}
