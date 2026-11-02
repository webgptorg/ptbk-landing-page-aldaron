import { NextRequest, NextResponse } from 'next/server';
import { listManagedMessages, saveManagedMessage } from '@/lib/messages/messageDatabase';
import { MESSAGE_VALUES_SCHEMA } from '@/lib/messages/messageModel';
import { withMessagesAdmin, readValidatedBody } from '@/lib/messages/messageAdminApi';
import { listManagedAgents } from '@/lib/agents/agentDatabase';
export const dynamic = 'force-dynamic';
export function GET(request: NextRequest) {
    return withMessagesAdmin(request, async () => {
        const [messages, agents] = await Promise.all([listManagedMessages(), listManagedAgents()]);
        return NextResponse.json({ messages, agents: agents.map(({ id, name, isEnabled }) => ({ id, name, isEnabled })),
            audioConfigured: Boolean(process.env.ELEVENLABS_API_KEY?.trim() && process.env.OBJECT_STORAGE_BUCKET?.trim()),
            transcriptionConfigured: Boolean(process.env.ELEVENLABS_API_KEY?.trim()),
        }, { headers: { 'Cache-Control': 'no-store' } });
    });
}
export function POST(request: NextRequest) {
    return withMessagesAdmin(request, async () => NextResponse.json({ message: await saveManagedMessage(null,
        await readValidatedBody(request, MESSAGE_VALUES_SCHEMA)) }, { status: 201 }));
}
