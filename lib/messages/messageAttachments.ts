import { z } from 'zod';

export const CHAT_ATTACHMENT_MAX_BYTES = 4 * 1024 * 1024;
export const CHAT_ATTACHMENT_MAX_COUNT = 4;
export const CHAT_ATTACHMENT_CONTEXT_MAX_COUNT = 8;
export const CHAT_ATTACHMENT_CONTEXT_MAX_BYTES = 16 * 1024 * 1024;
export const CHAT_ATTACHMENT_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,application/pdf,.txt,.md,.book,.csv,.json';
export const messageAttachmentSchema = z.object({
    id: z.string().uuid(), name: z.string().min(1).max(200), byteLength: z.number().int().min(1).max(CHAT_ATTACHMENT_MAX_BYTES),
    contentType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain']),
});
export type MessageChatAttachment = z.infer<typeof messageAttachmentSchema>;
export const chatAttachmentHref = (id: string, admin = false) => `${admin ? '/api/admin/messages/attachments' : '/api/chat/attachments'}/${encodeURIComponent(id)}`;

/** The server validates actual bytes instead of trusting a browser-supplied MIME type or extension. */
export function inspectChatAttachment(name: string, bytes: Uint8Array): MessageChatAttachment['contentType'] {
    if (!bytes.length || bytes.length > CHAT_ATTACHMENT_MAX_BYTES) throw new Error('Soubor může mít nejvýše 4 MB a nesmí být prázdný.');
    const start = Array.from(bytes.subarray(0, 16));
    if ([137,80,78,71,13,10,26,10].every((byte, i) => start[i] === byte)) return 'image/png';
    if (start[0] === 255 && start[1] === 216 && start[2] === 255) return 'image/jpeg';
    const header = new TextDecoder().decode(bytes.subarray(0, 16));
    if (header.startsWith('RIFF') && header.slice(8, 12) === 'WEBP') return 'image/webp';
    if (header.startsWith('GIF87a') || header.startsWith('GIF89a')) return 'image/gif';
    if (header.startsWith('%PDF-')) return 'application/pdf';
    if (/\.(txt|md|book|csv|json)$/i.test(name)) {
        let text: string;
        try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
        catch { throw new Error('Textový soubor musí být v UTF-8.'); }
        if (text.includes('\0')) throw new Error('Tento soubor není podporovaný text.');
        if (text.length > 60000) throw new Error('Textová příloha může mít nejvýše 60 000 znaků.');
        return 'text/plain';
    }
    throw new Error('Vlož PNG, JPEG, WebP, GIF, PDF nebo textový soubor (TXT, Markdown, Book, CSV, JSON).');
}
