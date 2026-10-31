import { z } from 'zod';
import type { ArticleWordTimings } from '@/businesses/articles/articleTiming';

export const PAVOL_MESSAGE_AGENT_ID = 'a3307473-e95b-4e34-9e84-1c15daecf238';
export const MESSAGE_DOMAINS = ['pavolhejny.cz', 'pavolhejny.com'] as const;

export function createMessagePrefix(title: string): string {
    return title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/g, '') || 'zprava';
}

export const MESSAGE_VALUES_SCHEMA = z.object({
    title: z.string().trim().min(1, 'Vyplňte titulek.').max(200),
    markdown: z.string().min(1, 'Vyplňte zprávu.').max(50_000),
    context: z.string().min(1, 'Vložte celý kontext.').max(1_500_000),
    introduction: z.string().max(4000),
    prefix: z.string().min(1).max(40).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Prefix pište malými písmeny bez diakritiky a s pomlčkami.'),
    domain: z.enum(MESSAGE_DOMAINS),
    agentId: z.string().uuid(),
}).strict();

export type MessageValues = z.infer<typeof MESSAGE_VALUES_SCHEMA>;
export type MessageAudio = {
    readonly key: string;
    readonly duration: number;
    readonly byteLength: number;
    readonly voiceName: string;
    readonly textHash: string;
    readonly timings?: ArticleWordTimings;
};
export type ManagedMessage = MessageValues & {
    readonly id: string;
    readonly shortcodeLinkId: number;
    readonly shortcode: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly audio: MessageAudio | null;
    readonly audioIsCurrent: boolean;
};

export function getMessageUrl(message: Pick<ManagedMessage, 'shortcode' | 'domain'>): string {
    return `https://${message.domain}/${message.shortcode}`;
}

/** Sharing adds the link only to the exported text, immediately after an opening greeting when present. */
export function createMessageShareText(markdown: string, url: string): string {
    const greeting = /^(\s*(?:Ahoj|Dobrý den|Čau|Zdravím|Hi|Hello|Dear)\b[^\n.!?]{0,100}?(?:,|!|\n))(?:[ \t]*\r?\n)?/i.exec(markdown);
    if (greeting) return `${greeting[1].trimEnd()}\n\n${url}\n\n${markdown.slice(greeting[0].length).trimStart()}`.trimEnd();
    return `${url}\n\n${markdown}`;
}

export type MessageListItem = Pick<ManagedMessage, 'id' | 'shortcodeLinkId' | 'shortcode' | 'title' | 'prefix' | 'domain' | 'createdAt' | 'updatedAt'>;
