import { NextRequest, NextResponse } from 'next/server';
import { withMessagesAdmin, requireRecordId } from '@/lib/messages/messageAdminApi';
import { listMessageConversations, listMessageConversationTurns } from '@/lib/messages/messageConversationDatabase';
import { MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { getSiteAgentEmbed, siteAgentSourceKey, type SiteAgentEmbedId } from '@/lib/site-agents/registry';

export const dynamic = 'force-dynamic';
export function GET(request: NextRequest, { params }: { params: Promise<{ embedId: string; language: string }> }) {
    return withMessagesAdmin(request, async () => {
        const { embedId, language } = await params;
        if (!getSiteAgentEmbed(embedId) || (language !== 'cs' && language !== 'en')) return NextResponse.json({ error: 'Zdroj nebyl nalezen.' }, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
        const rawOffset = request.nextUrl.searchParams.get('offset') ?? '0';
        if (!/^\d{1,8}$/.test(rawOffset)) return NextResponse.json({ error: 'Neplatná stránka.' }, { status: 400, headers: MESSAGE_RESPONSE_HEADERS });
        const source = { sourceKey: siteAgentSourceKey(embedId as SiteAgentEmbedId, language) };
        const id = request.nextUrl.searchParams.get('conversationId');
        const result = id === null ? await listMessageConversations(source, Number(rawOffset))
            : await listMessageConversationTurns(source, requireRecordId(id), Number(rawOffset));
        return NextResponse.json(result, { headers: MESSAGE_RESPONSE_HEADERS });
    });
}
