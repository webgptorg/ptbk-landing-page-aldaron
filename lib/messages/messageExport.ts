import { convertMarkdownToPlainText } from '@/lib/text/markdownText';
import type { MessageChatTurn } from './messageTypes';

export const MESSAGE_TEXT_FORMATS = ['book', 'md', 'txt'] as const;
export type MessageTextFormat = typeof MESSAGE_TEXT_FORMATS[number];
export type MessageExportDocument = {
    readonly kind: 'message' | 'context' | 'chat'; readonly title: string; readonly sourceUrl: string;
    readonly createdAt: string; readonly language: 'cs' | 'en'; readonly content?: string;
    readonly turns?: readonly (MessageChatTurn & { readonly createdAt?: string })[];
};
export function messageExportBrand(document: MessageExportDocument): string {
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
const speaker = (turn: MessageChatTurn, cs: boolean) => turn.role === 'user' ? cs ? 'Návštěvník' : 'Visitor' : 'Pavol Hejný';

/** Shared by downloads and clipboard; PDF reads the same source document. */
export function createMessageTextExport(document: MessageExportDocument, format: MessageTextFormat): string {
    const cs = document.language === 'cs', title = singleLine(document.title), brand = messageExportBrand(document);
    if (format === 'book') {
        const note = `NOTE ${brand}\n${document.sourceUrl}`;
        if (document.kind === 'chat') return [
            `CHAT ${cs ? 'Rozhovor' : 'Conversation'} - ${title}`, 'CHAT MEMBER @User', 'CHAT MEMBER {Pavol Hejný}', note,
            ...(document.turns ?? []).map((turn) => `CHAT MESSAGE ${turn.role === 'user' ? '@User' : '{Pavol Hejný}'} ${turn.createdAt ?? document.createdAt}\n${literal(turn.content)}`),
        ].join('\n\n') + '\n';
        return [`AGENT ${cs ? 'Zpráva' : 'Message'} - ${title}`,
            `PERSONA ${cs ? 'Odpovídáš na otázky podle přiloženého kontextu Pavola Hejného. Pokud odpověď neznáš, řekni to.' : "Answer questions using Pavol Hejný's attached context. Say when the context has no answer."}`,
            `KNOWLEDGE\n${literal(document.content ?? '')}`, note, ''].join('\n\n');
    }
    const body = document.kind === 'chat'
        ? (document.turns ?? []).map((turn) => `${format === 'md' ? '## ' : ''}${speaker(turn, cs)}${turn.createdAt ? ` · ${turn.createdAt}` : ''}\n\n${format === 'txt' ? convertMarkdownToPlainText(turn.content) : turn.content}`).join('\n\n')
        : format === 'txt' ? convertMarkdownToPlainText(document.content ?? '') : document.content ?? '';
    const attribution = `${brand}\n${cs ? 'Zdroj' : 'Source'}: ${document.sourceUrl}`;
    return format === 'md' ? `# ${title}\n\n${body}\n\n<!-- ${attribution.replace(/--/g, '- -')} -->\n`
        : `${title}\n\n${body}\n\n____________________\n${attribution}\n`;
}
export function messageExportMarkdown(document: MessageExportDocument): string {
    return document.kind === 'chat'
        ? (document.turns ?? []).map((turn) => `## ${speaker(turn, document.language === 'cs')}\n\n${turn.content}`).join('\n\n')
        : document.content ?? '';
}
