import { NextRequest, NextResponse } from 'next/server';
import { loadManagedMessage, MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { listMessageConversations, listMessageConversationTurns } from '@/lib/messages/messageConversationDatabase';
import { withMessagesAdmin, requireRecordId } from '@/lib/messages/messageAdminApi';

export const dynamic = 'force-dynamic';
export function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return withMessagesAdmin(request, async () => {
        const id = requireRecordId((await params).id);
        if (!await loadManagedMessage(id)) return NextResponse.json({ error: 'Zpráva nebyla nalezena.' }, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
        const rawOffset = request.nextUrl.searchParams.get('offset') ?? '0';
        if (!/^\d{1,8}$/.test(rawOffset)) return NextResponse.json({ error: 'Neplatná stránka.' }, { status: 400, headers: MESSAGE_RESPONSE_HEADERS });
        const offset = Number(rawOffset);
        const conversationId = request.nextUrl.searchParams.get('conversationId');
        const result = conversationId === null ? await listMessageConversations(id, offset)
            : await listMessageConversationTurns(id, requireRecordId(conversationId), offset);
        return NextResponse.json(result, { headers: MESSAGE_RESPONSE_HEADERS });
    });
}
