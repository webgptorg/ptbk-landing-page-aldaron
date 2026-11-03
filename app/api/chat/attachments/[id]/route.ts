import { z } from 'zod';
import { getAgentDatabase } from '@/lib/agents/agentDatabase';
import { getPublicRequestHostname, normalizeHostname } from '@/lib/domains/publicDomainRouting';
import { loadChatAttachment } from '@/lib/messages/messageAttachmentDatabase';
import { MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { signStoredObject } from '@/lib/storage/objectStorage';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** The random file ID is a durable unlisted read capability; CDN signatures remain short-lived. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const missing = () => new Response(null, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return missing();
    try {
        const file = await loadChatAttachment(id);
        if (!file) return missing();
        const host = normalizeHostname(getPublicRequestHostname(request.headers));
        if (file.message_id) {
            const { data, error } = await getAgentDatabase().from('messages').select('domain').eq('id', file.message_id).maybeSingle();
            if (error || !data || data.domain !== host) return missing();
        } else if (host !== (file.source_key === 'pavol-cs' ? 'pavolhejny.cz' : 'pavolhejny.com')) return missing();
        return new Response(null, { status: 307, headers: { ...MESSAGE_RESPONSE_HEADERS, Location: await signStoredObject(file.object_key) } });
    } catch { return new Response(null, { status: 503, headers: MESSAGE_RESPONSE_HEADERS }); }
}
