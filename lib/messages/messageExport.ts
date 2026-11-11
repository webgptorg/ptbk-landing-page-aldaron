import { convertMarkdownToPlainText } from '@/lib/text/markdownText';
import type { MessageChatTurn } from './messageTypes';
import { chatAttachmentHref } from './messageAttachments';

export const MESSAGE_TEXT_FORMATS = ['book', 'md', 'txt'] as const;
export type MessageTextFormat = typeof MESSAGE_TEXT_FORMATS[number];
export type MessageExportDocument = {
    readonly kind: 'message' | 'context' | 'chat'; readonly title: string; readonly sourceUrl: string;
    readonly createdAt: string; readonly language: 'cs' | 'en'; readonly content?: string;
    readonly assistantName?: string; readonly brandLabel?: string;
    readonly turns?: readonly (MessageChatTurn & { readonly createdAt?: string })[];
};
export function messageExportBrand(document: MessageExportDocument): string {
    if (document.brandLabel) return document.brandLabel;
    const host = new URL(document.sourceUrl).hostname.replace(/^www\./, '');
    return `${document.language === 'cs' ? 'Zpráva od Pavola Hejného' : 'A message from Pavol Hejný'} · ${host === 'pavolhejny.com' ? host : 'pavolhejny.cz'}`;
}
/** A longer literal fence preserves pasted Book commands and nested Markdown code blocks. */
function literal(text: string): string {
    let length = 3;
    for (const run of text.match(/`+/g) ?? []) length = Math.max(length, run.length + 1);
    const fence = '`'.repeat(length);
    return `${fence}markdown\n${text}\n${fence}`;
}
const singleLine = (text: string) => text.replace(/[\r\n\t]+/g, ' ').trim();
const speaker = (turn: MessageChatTurn, cs: boolean, assistantName = 'Pavol Hejný') => turn.role === 'user' ? cs ? 'Návštěvník' : 'Visitor' : assistantName;
function turnMarkdown(document: MessageExportDocument, turn: MessageChatTurn): string {
    const files = (turn.attachments ?? []).map((file) => `[${file.name.replace(/[\\\[\]]/g, '\\$&')}](${new URL(chatAttachmentHref(file.id), document.sourceUrl).href})`);
    return [turn.content, ...files].join('\n\n');
}

/** Shared by downloads and clipboard; PDF reads the same source document. */
export function createMessageTextExport(document: MessageExportDocument, format: MessageTextFormat): string {
    const assistant = singleLine(document.assistantName ?? 'Pavol Hejný').replace(/[{}]/g, '');
    const cs = document.language === 'cs', title = singleLine(document.title), brand = messageExportBrand(document);
    if (format === 'book') {
        const note = `NOTE ${brand}\n${document.sourceUrl}`;
        if (document.kind === 'chat') return [
            `CHAT ${cs ? 'Rozhovor' : 'Conversation'} - ${title} - ${document.createdAt}`, 'CHAT MEMBER @User', `CHAT MEMBER {${assistant}}`, note,
            ...(document.turns ?? []).map((turn) => `CHAT MESSAGE ${turn.role === 'user' ? '@User' : `{${assistant}}`} ${turn.createdAt ?? document.createdAt}\n${literal(turnMarkdown(document, turn))}`),
        ].join('\n\n') + '\n';
        return [`AGENT ${cs ? 'Zpráva' : 'Message'} - ${title}`,
            `PERSONA ${cs ? 'Odpovídáš na otázky podle přiloženého kontextu Pavola Hejného. Pokud odpověď neznáš, řekni to.' : "Answer questions using Pavol Hejný's attached context. Say when the context has no answer."}`,
            `KNOWLEDGE\n${literal(document.content ?? '')}`, note, ''].join('\n\n');
    }
    const body = document.kind === 'chat'
        ? (document.turns ?? []).map((turn) => `${format === 'md' ? '## ' : ''}${speaker(turn, cs, document.assistantName)}${turn.createdAt ? ` · ${turn.createdAt}` : ''}\n\n${format === 'txt' ? convertMarkdownToPlainText(turnMarkdown(document, turn)) : turnMarkdown(document, turn)}`).join('\n\n')
        : format === 'txt' ? convertMarkdownToPlainText(document.content ?? '') : document.content ?? '';
    const attribution = `${brand}\n${cs ? 'Zdroj' : 'Source'}: ${document.sourceUrl}`;
    return format === 'md' ? `# ${title}\n\n${body}\n\n<!-- ${attribution.replace(/--/g, '- -')} -->\n`
        : `${title}\n\n${body}\n\n____________________\n${attribution}\n`;
}
export function messageExportMarkdown(document: MessageExportDocument): string {
    return document.kind === 'chat'
        ? (document.turns ?? []).map((turn) => `## ${speaker(turn, document.language === 'cs', document.assistantName)}\n\n${turnMarkdown(document, turn)}`).join('\n\n')
        : document.content ?? '';
}
