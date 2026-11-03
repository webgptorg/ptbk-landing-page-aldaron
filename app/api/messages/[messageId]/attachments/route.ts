import { loadMessageByShortcode, MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { getPublicRequestHostname } from '@/lib/domains/publicDomainRouting';
import { uploadPublicChatAttachment } from '@/lib/messages/messageAttachmentUpload';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request, { params }: { params: Promise<{ messageId: string }> }) {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Neplatný požadavek.' }, { status: 403, headers: MESSAGE_RESPONSE_HEADERS });
    const { messageId } = await params;
    const message = await loadMessageByShortcode(messageId, getPublicRequestHostname(request.headers));
    if (!message) return Response.json({ error: 'Zpráva nebyla nalezena.' }, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
    return uploadPublicChatAttachment(request, message.id);
}
