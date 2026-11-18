import { convertMarkdownToPlainText } from '@/lib/text/markdownText';
import type { MessageChatTurn } from './messageTypes';
import { chatAttachmentHref } from './messageAttachments';
import { voicePlaybackDescription } from '@/lib/voice-chat/voicePlaybackDescription';

export const MESSAGE_TEXT_FORMATS = ['book', 'md', 'txt'] as const;
export type MessageTextFormat = typeof MESSAGE_TEXT_FORMATS[number];
export type MessageExportDocument = {
    readonly kind: 'message' | 'context' | 'chat'; readonly title: string; readonly sourceUrl: string;
    readonly createdAt: string; readonly language: 'cs' | 'en'; readonly content?: string;
    readonly assistantName?: string; readonly brandLabel?: string;
    readonly exportedAt?: string; readonly conversationId?: string; readonly sourceTitle?: string;
    readonly turns?: readonly (MessageChatTurn & { readonly createdAt?: string })[];
};
export function messageExportBrand(document: MessageExportDocument): string {
    if (document.brandLabel) return document.brandLabel;
    const host = new URL(document.sourceUrl).hostname.replace(/^www\./, '');
    return `${document.language === 'cs' ? 'Zpráva od Pavola Hejného' : 'A message from Pavol Hejný'} · ${host}`;
}
/** A longer literal fence preserves pasted Book commands and nested Markdown code blocks. */
function literal(text: string): string {
    let length = 3;
    for (const run of text.match(/`+/g) ?? []) length = Math.max(length, run.length + 1);
    const fence = '`'.repeat(length);
    return `${fence}markdown\n${text}\n${fence}`;
}
const singleLine = (text: string) => text.replace(/[\r\n\t]+/g, ' ').trim();
const slug = (text: string) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** A readable topic without another model request; the complete question remains in the transcript. */
export function createConversationExportTitle(turns: readonly MessageChatTurn[], fallback: string): string {
    let title = singleLine(fallback);
    for (const turn of turns) {
        if (turn.role !== 'user') continue;
        const question = singleLine(convertMarkdownToPlainText(turn.content));
        if (!question || /^(?:ahoj|čau|dobrý den|zdravím|hi|hello|hey)[!.,\s]*$/i.test(question)) continue;
        title = question; break;
    }
    if (title.length <= 120) return title;
    return `${title.slice(0, 117).replace(/\s+\S*$/, '').trimEnd()}…`;
}

export function messageExportKindLabel(document: Pick<MessageExportDocument, 'kind' | 'language'>): string {
    return (document.language === 'cs'
        ? { message: 'Zpráva', context: 'Celý kontext', chat: 'Konverzace' }
        : { message: 'Message', context: 'Full context', chat: 'Conversation' })[document.kind];
}

/** Local time is explicit and independent of the device/server timezone. */
function filenameDate(value: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Prague', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}_${part('hour')}-${part('minute')}-${part('second')}`;
}

/** One filename contract for browser blobs, server downloads and every export format. */
export function createMessageExportFilename(document: MessageExportDocument, format: MessageTextFormat | 'pdf'): string {
    const cs = document.language === 'cs';
    const suffix = (cs ? { message: 'zprava', context: 'cely-kontext', chat: 'konverzace' }
        : { message: 'message', context: 'full-context', chat: 'conversation' })[document.kind];
    let name: string;
    if (document.kind === 'chat') {
        const topic = slug(document.title).slice(0, 80).replace(/-+$/g, '') || slug(document.sourceTitle ?? document.assistantName ?? '') || (cs ? 'rozhovor' : 'chat');
        // The stable local conversation ID distinguishes sessions with the same topic and start time.
        const identity = document.conversationId?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
        name = [topic, filenameDate(document.createdAt), identity].filter(Boolean).join('-');
    } else {
        const path = new URL(document.sourceUrl).pathname.split('/').filter(Boolean).at(-1) ?? '';
        // Keep the case-sensitive shortcode suffix in an existing URL slug.
        name = decodeURIComponent(path).replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 160).replace(/-+$/g, '')
            || slug(document.title).slice(0, 100).replace(/-+$/g, '') || (cs ? 'zprava' : 'message');
    }
    return `${name}-${suffix}.${format}`;
}

/** Format-neutral provenance; source content and transcript turns stay separate. */
export function messageExportMetadata(document: MessageExportDocument): string {
    const cs = document.language === 'cs';
    return [singleLine(messageExportBrand(document)),
        `${cs ? 'Typ' : 'Type'}: ${messageExportKindLabel(document)}`,
        `${cs ? 'Název' : 'Title'}: ${singleLine(document.title)}`,
        ...(document.sourceTitle ? [`${cs ? 'Rozhovor v' : 'Chat in'}: ${singleLine(document.sourceTitle)}`] : []),
        `${cs ? 'Zdroj' : 'Source'}: ${singleLine(document.sourceUrl)}`,
        `${cs ? document.kind === 'chat' ? 'Začátek konverzace' : 'Vytvořeno' : document.kind === 'chat' ? 'Conversation started' : 'Created'}: ${singleLine(document.createdAt)}`,
        `${cs ? 'Exportováno' : 'Exported'}: ${singleLine(document.exportedAt ?? new Date().toISOString())}`,
        ...(document.conversationId ? [`${cs ? 'ID konverzace' : 'Conversation ID'}: ${singleLine(document.conversationId)}`] : []),
        ...(document.assistantName ? [`${cs ? 'Asistent' : 'Assistant'}: ${singleLine(document.assistantName)}`] : []),
    ].join('\n');
}
const speaker = (turn: MessageChatTurn, cs: boolean, assistantName = 'Pavol Hejný') => turn.role === 'user' ? cs ? 'Návštěvník' : 'Visitor' : assistantName;
function turnMarkdown(document: MessageExportDocument, turn: MessageChatTurn): string {
    const files = (turn.attachments ?? []).map((file) => `[${file.name.replace(/[\\\[\]]/g, '\\$&')}](${new URL(chatAttachmentHref(file.id), document.sourceUrl).href})`);
    return [turn.content, ...(turn.voice ? [voicePlaybackDescription(turn.voice, document.language)] : []), ...files].join('\n\n');
}

/** Shared by downloads and clipboard; PDF reads the same source document. */
export function createMessageTextExport(document: MessageExportDocument, format: MessageTextFormat): string {
    const assistant = singleLine(document.assistantName ?? 'Pavol Hejný').replace(/[{}]/g, '');
    const cs = document.language === 'cs', title = singleLine(document.title), brand = singleLine(messageExportBrand(document));
    const metadata = messageExportMetadata(document);
    if (format === 'book') {
        const note = `NOTE ${brand}\n${literal(metadata)}`;
        if (document.kind === 'chat') return [
            `CHAT ${cs ? 'Rozhovor' : 'Conversation'} - ${title} - ${document.createdAt}`, 'CHAT MEMBER @User', `CHAT MEMBER {${assistant}}`, note,
            ...(document.turns ?? []).map((turn) => `CHAT MESSAGE ${turn.role === 'user' ? '@User' : `{${assistant}}`} ${turn.createdAt ?? document.createdAt}\n${literal(turnMarkdown(document, turn))}`),
        ].join('\n\n') + '\n';
        return [`AGENT ${messageExportKindLabel(document)} - ${title}`,
            `PERSONA ${cs ? 'Odpovídáš na otázky podle přiloženého kontextu Pavola Hejného. Pokud odpověď neznáš, řekni to.' : "Answer questions using Pavol Hejný's attached context. Say when the context has no answer."}`,
            note, `KNOWLEDGE\n${literal(document.content ?? '')}`, ''].join('\n\n');
    }
    const body = document.kind === 'chat'
        ? (document.turns ?? []).map((turn) => `${format === 'md' ? '## ' : ''}${speaker(turn, cs, document.assistantName)}${turn.createdAt ? ` · ${turn.createdAt}` : ''}\n\n${format === 'txt' ? convertMarkdownToPlainText(turnMarkdown(document, turn)) : turnMarkdown(document, turn)}`).join('\n\n')
        : format === 'txt' ? convertMarkdownToPlainText(document.content ?? '') : document.content ?? '';
    return format === 'md' ? `# ${title}\n\n<!-- ${metadata.replace(/-{2,}/g, run => run.split('').join(' '))} -->\n\n${body}\n`
        : `${title}\n\n${metadata}\n____________________\n\n${body}\n`;
}
export function messageExportMarkdown(document: MessageExportDocument): string {
    return document.kind === 'chat'
        ? (document.turns ?? []).map((turn) => `## ${speaker(turn, document.language === 'cs', document.assistantName)}\n\n${turnMarkdown(document, turn)}`).join('\n\n')
        : document.content ?? '';
}
