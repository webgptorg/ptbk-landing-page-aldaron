import { NextRequest, NextResponse } from 'next/server';
import { getAgentDatabase } from '@/lib/agents/agentDatabase';
import { loadManagedMessage, saveManagedMessage } from '@/lib/messages/messageDatabase';
import { MESSAGE_VALUES_SCHEMA } from '@/lib/messages/messageModel';
import { withMessagesAdmin, readValidatedBody, requireRecordId } from '@/lib/messages/messageAdminApi';
import { removeStoredObject } from '@/lib/storage/objectStorage';
type Context = { params: Promise<{ id: string }> };
export function GET(request: NextRequest, { params }: Context) {
    return withMessagesAdmin(request, async () => {
        const message = await loadManagedMessage(requireRecordId((await params).id));
        return NextResponse.json(message ? { message } : { error: 'Zpráva nebyla nalezena.' }, { status: message ? 200 : 404, headers: { 'Cache-Control': 'no-store' } });
    });
}
export function PATCH(request: NextRequest, { params }: Context) {
    return withMessagesAdmin(request, async () => NextResponse.json({ message: await saveManagedMessage(requireRecordId((await params).id),
        await readValidatedBody(request, MESSAGE_VALUES_SCHEMA)) }));
}
export function DELETE(request: NextRequest, { params }: Context) {
    return withMessagesAdmin(request, async () => {
        const id = requireRecordId((await params).id);
        const existing = await loadManagedMessage(id);
        if (!existing) return NextResponse.json({ error: 'Zpráva nebyla nalezena.' }, { status: 404 });
        const { data, error } = await getAgentDatabase().rpc('delete_expanded_message', { target_id: id });
        if (error) throw new Error('Zprávu se nepodařilo odstranit.');
        // An asset-cleanup error must not recreate a deleted message or leave its public URL alive.
        if (existing.audio) await removeStoredObject(existing.audio.key).catch(() => console.warn('Message audio cleanup is pending.'));
        return NextResponse.json({ isDeleted: data === true });
    });
}
