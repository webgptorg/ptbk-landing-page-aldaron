import { getSharedMessage, isMessageHostname, MESSAGE_RESPONSE_HEADERS, readMessageFile } from '@/lib/messages/messageStore';
import { getPublicRequestHostname } from '@/lib/domains/publicDomainRouting';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ messageId: string; asset: string }> }) {
    const { messageId, asset } = await params;
    const missing = () => new Response(null, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
    if (!isMessageHostname(getPublicRequestHostname(request.headers)) || !['context.md', 'words.json', 'audio.mp3'].includes(asset)) return missing();
    const message = await getSharedMessage(messageId);
    if (!message) return missing();
    if (asset === 'context.md') return new Response(message.context, { headers: {
        ...MESSAGE_RESPONSE_HEADERS, 'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="promptbook-mangoweb-kontext.md"',
    } });
    if (asset === 'words.json') return message.timings ? Response.json(message.timings, { headers: MESSAGE_RESPONSE_HEADERS }) : missing();
    if (!message.audio) return missing();
    const bytes = await readMessageFile(messageId, 'audio');
    if (!bytes) return missing();
    const responseHeaders = { ...MESSAGE_RESPONSE_HEADERS, 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes' };
    const range = request.headers.get('range');
    if (!range) return new Response(new Uint8Array(bytes), { headers: { ...responseHeaders, 'Content-Length': String(bytes.length) } });
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const start = match?.[1] ? Number(match[1]) : match?.[2] ? Math.max(0, bytes.length - Number(match[2])) : NaN;
    const end = match?.[1] && match[2] ? Math.min(bytes.length - 1, Number(match[2])) : bytes.length - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= bytes.length) return new Response(null, {
        status: 416, headers: { ...responseHeaders, 'Content-Range': `bytes */${bytes.length}` },
    });
    return new Response(new Uint8Array(bytes.subarray(start, end + 1)), { status: 206, headers: {
        ...responseHeaders, 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${bytes.length}`,
    } });
}
