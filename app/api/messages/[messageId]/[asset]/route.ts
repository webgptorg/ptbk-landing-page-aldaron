import { getPublicRequestHostname } from '@/lib/domains/publicDomainRouting';
import { loadMessageByShortcode, getCurrentMessageAudio, MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { createMessageShareText, getMessageUrl } from '@/lib/messages/messageModel';
import { signStoredObject } from '@/lib/storage/objectStorage';
import { createMessageTextExport, type MessageExportDocument, type MessageTextFormat } from '@/lib/messages/messageExport';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request, { params }: { params: Promise<{ messageId: string; asset: string }> }) {
    const { messageId, asset } = await params;
    const missing = () => new Response(null, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
    const textAsset = /^(message|context)\.(book|md|txt|json)$/.exec(asset);
    if (!textAsset && !['words.json', 'audio.mp3'].includes(asset)) return missing();
    const message = await loadMessageByShortcode(messageId, getPublicRequestHostname(request.headers));
    if (!message) return missing();
    if (textAsset) {
        const kind = textAsset[1] as 'message' | 'context', format = textAsset[2];
        const document: MessageExportDocument = { kind, title: kind === 'context' ? `${message.title} - celý kontext` : message.title,
            sourceUrl: getMessageUrl(message), createdAt: message.createdAt, language: message.domain === 'pavolhejny.com' ? 'en' : 'cs',
            content: kind === 'message' ? createMessageShareText(message.markdown, getMessageUrl(message)) : message.context };
        if (format === 'json') return Response.json(document, { headers: MESSAGE_RESPONSE_HEADERS });
        return new Response(createMessageTextExport(document, format as MessageTextFormat), { headers: {
            ...MESSAGE_RESPONSE_HEADERS, 'Content-Type': `${format === 'md' ? 'text/markdown' : 'text/plain'}; charset=utf-8`,
            'Content-Disposition': `attachment; filename="${message.prefix}-${kind === 'message' ? 'zprava' : 'kontext'}.${format}"`,
        } });
    }
    const audio = getCurrentMessageAudio(message);
    if (!audio) return missing();
    if (asset === 'words.json') return audio.timings ? Response.json(audio.timings, { headers: MESSAGE_RESPONSE_HEADERS }) : missing();
    // Let the storage CDN serve media, including native byte ranges; Vercel does not buffer whole recordings.
    return new Response(null, { status: 307, headers: { ...MESSAGE_RESPONSE_HEADERS, Location: await signStoredObject(audio.key) } });
}
