import { getPublicRequestHostname } from '@/lib/domains/publicDomainRouting';
import { loadMessageByShortcode, getCurrentMessageAudio, MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { createMessageShareText, getMessageUrl } from '@/lib/messages/messageModel';
import { signStoredObject } from '@/lib/storage/objectStorage';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request, { params }: { params: Promise<{ messageId: string; asset: string }> }) {
    const { messageId, asset } = await params;
    const missing = () => new Response(null, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
    if (!['message.md', 'context.md', 'words.json', 'audio.mp3'].includes(asset)) return missing();
    const message = await loadMessageByShortcode(messageId, getPublicRequestHostname(request.headers));
    if (!message) return missing();
    if (asset === 'context.md' || asset === 'message.md') return new Response(asset === 'message.md' ? createMessageShareText(message.markdown, getMessageUrl(message)) : message.context, { headers: {
        ...MESSAGE_RESPONSE_HEADERS, 'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${message.prefix}-${asset === 'message.md' ? 'zprava' : 'kontext'}.md"`,
    } });
    const audio = getCurrentMessageAudio(message);
    if (!audio) return missing();
    if (asset === 'words.json') return audio.timings ? Response.json(audio.timings, { headers: MESSAGE_RESPONSE_HEADERS }) : missing();
    // Let the storage CDN serve media, including native byte ranges; Vercel does not buffer whole recordings.
    return new Response(null, { status: 307, headers: { ...MESSAGE_RESPONSE_HEADERS, Location: await signStoredObject(audio.key) } });
}
