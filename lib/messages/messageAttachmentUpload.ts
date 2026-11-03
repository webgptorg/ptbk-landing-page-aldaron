import { z } from 'zod';
import { CHAT_ATTACHMENT_MAX_BYTES } from './messageAttachments';
import { storeChatAttachment } from './messageAttachmentDatabase';
import { allowPublicChatRequest } from './publicChatRateLimit';
import type { ChatConversationSource } from './messageConversationDatabase';
import { MESSAGE_RESPONSE_HEADERS } from './messageDatabase';

/** One bounded file per upload fits the existing server/CDN path and Vercel's request limit. */
export async function uploadPublicChatAttachment(request: Request, source: ChatConversationSource) {
    const json = (value: unknown, status = 200) => Response.json(value, { status, headers: MESSAGE_RESPONSE_HEADERS });
    if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Neplatný požadavek.' }, 403);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!allowPublicChatRequest(`attachment:${typeof source === 'string' ? source : source.sourceKey}:${ip}`)) return json({ error: 'Chvilku prosím počkej a zkus nahrávání znovu.' }, 429);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Vyber soubor.' }, 400);
    const chunks: Uint8Array[] = []; let length = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            length += value.length;
            if (length > CHAT_ATTACHMENT_MAX_BYTES + 65536) { await reader.cancel(); return json({ error: 'Soubor může mít nejvýše 4 MB.' }, 413); }
            chunks.push(value);
        }
        const bounded = new Request(request.url, { method: 'POST', headers: request.headers, body: Buffer.concat(chunks) });
        const form = await bounded.formData(), file = form.get('file');
        const conversation = z.string().uuid().safeParse(form.get('conversationId'));
        if (!conversation.success || !file || typeof file === 'string') return json({ error: 'Neplatný soubor nebo chat.' }, 400);
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (bytes.length > CHAT_ATTACHMENT_MAX_BYTES) return json({ error: 'Soubor může mít nejvýše 4 MB.' }, 413);
        try { return json({ attachment: await storeChatAttachment(source, conversation.data, file.name, bytes) }); }
        catch (failure) {
            // Only user-facing validation/storage errors are returned, never provider diagnostics.
            return json({ error: failure instanceof Error ? failure.message : 'Přílohu se nepodařilo uložit.' }, 400);
        }
    } catch { return json({ error: 'Nahrávání se nepodařilo. Zkus to prosím znovu.' }, 400); }
}
