import { NextRequest, NextResponse } from 'next/server';
import { generateMessageAudio } from '@/lib/messages/messageAudio';
import { loadManagedMessage } from '@/lib/messages/messageDatabase';
import { getAgentDatabase } from '@/lib/agents/agentDatabase';
import { removeStoredObject } from '@/lib/storage/objectStorage';
import { withMessagesAdmin, requireRecordId } from '@/lib/messages/messageAdminApi';
export const maxDuration = 120;
type Context = { params: Promise<{ id: string }> };
export function POST(request: NextRequest, { params }: Context) {
    return withMessagesAdmin(request, async () => NextResponse.json({ message: await generateMessageAudio(requireRecordId((await params).id), request.signal) }));
}
export function DELETE(request: NextRequest, { params }: Context) {
    return withMessagesAdmin(request, async () => {
        const id = requireRecordId((await params).id);
        const message = await loadManagedMessage(id);
        if (!message) return NextResponse.json({ error: 'Zpráva nebyla nalezena.' }, { status: 404 });
        const { error } = await getAgentDatabase().from('messages').update({ audio: null, audio_generation_token: null, audio_generation_until: null, updated_at: new Date().toISOString() }).eq('id', id);
        if (error) throw new Error('Nahrávku se nepodařilo odpojit.');
        if (message.audio) await removeStoredObject(message.audio.key).catch(() => console.warn('Message audio cleanup is pending.'));
        return NextResponse.json({ message: await loadManagedMessage(id) });
    });
}
