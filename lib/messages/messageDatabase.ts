import 'server-only';
import { cache } from 'react';
import { createHash } from 'node:crypto';
import { getAgentDatabase } from '@/lib/agents/agentDatabase';
import { generateShortcode } from '@/lib/shortener/generateShortcode';
import { normalizeHostname } from '@/lib/domains/publicDomainRouting';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import type { ManagedMessage, MessageAudio, MessageValues, MessageListItem } from './messageModel';

export const MESSAGE_RESPONSE_HEADERS = {
    'Cache-Control': 'private, no-store, max-age=0',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
};
export type MessageRow = {
    id: string; shortcode_link_id: number; agent_id: string; title: string; markdown: string;
    context: string; introduction: string; prefix: string; code_suffix: string;
    domain: MessageValues['domain']; audio: MessageAudio | null; created_at: string; updated_at: string;
};
export function mapMessage(row: MessageRow): ManagedMessage {
    return { id: row.id, shortcodeLinkId: row.shortcode_link_id, shortcode: `${row.prefix}-${row.code_suffix}`,
        agentId: row.agent_id, title: row.title, markdown: row.markdown, context: row.context,
        introduction: row.introduction, prefix: row.prefix, domain: row.domain, audio: row.audio,
        createdAt: row.created_at, updatedAt: row.updated_at, audioIsCurrent: row.audio?.textHash === messageTextHash(row.markdown) };
}
export function messageTextHash(markdown: string): string { return createHash('sha256').update(markdown).digest('hex'); }
export function getCurrentMessageAudio(message: ManagedMessage): MessageAudio | null {
    return message.audio?.textHash === messageTextHash(message.markdown) ? message.audio : null;
}
export async function listManagedMessages(): Promise<MessageListItem[]> {
    const result = await loadAllSupabaseRows<Pick<MessageRow, 'id' | 'shortcode_link_id' | 'title' | 'prefix' | 'code_suffix' | 'domain' | 'created_at' | 'updated_at'>>(
        (from, to) => getAgentDatabase().from('messages').select('id,shortcode_link_id,title,prefix,code_suffix,domain,created_at,updated_at').order('created_at', { ascending: false }).order('id').range(from, to),
        'loading messages',
    );
    if (!result.rows) throw new Error('Zprávy se nepodařilo načíst.');
    return result.rows.map((row) => ({ id: row.id, shortcodeLinkId: row.shortcode_link_id, title: row.title, prefix: row.prefix, domain: row.domain,
        shortcode: `${row.prefix}-${row.code_suffix}`, createdAt: row.created_at, updatedAt: row.updated_at }));
}
export async function loadManagedMessage(id: string): Promise<ManagedMessage | null> {
    const { data, error } = await getAgentDatabase().from('messages').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error('Zprávu se nepodařilo načíst.');
    return data ? mapMessage(data as MessageRow) : null;
}
/** No public list or numeric ID lookup: every public read rechecks the code and its one allowed domain. */
export const loadMessageByShortcode = cache(async (shortcode: string, hostname: string): Promise<ManagedMessage | null> => {
    if (!/^[A-Za-z0-9-]{1,80}$/.test(shortcode)) return null;
    const client = getAgentDatabase();
    const { data: link, error: linkError } = await client.from('ShortcodeLink').select('id,domains')
        .eq('shortcode', shortcode).eq('sourceApp', 'messages').maybeSingle();
    const host = normalizeHostname(hostname);
    if (linkError || !link || !Array.isArray(link.domains) || !link.domains.includes(host)) return null;
    const { data, error } = await client.from('messages').select('*').eq('shortcode_link_id', link.id).eq('domain', host).maybeSingle();
    if (error) throw new Error('Zprávu se nepodařilo načíst.');
    return data ? mapMessage(data as MessageRow) : null;
});
export async function saveManagedMessage(id: string | null, values: MessageValues): Promise<ManagedMessage> {
    const client = getAgentDatabase();
    for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await client.rpc('save_expanded_message', {
            target_id: id, target_title: values.title, target_markdown: values.markdown, target_context: values.context,
            target_introduction: values.introduction, target_prefix: values.prefix, target_domain: values.domain,
            target_agent_id: values.agentId, target_code_suffix: generateShortcode(),
        });
        if (error?.code === '23505' && id === null) continue;
        if (error) throw Object.assign(new Error(error.message.includes('MESSAGE_NOT_FOUND') ? 'Zpráva nebyla nalezena.' : 'Zprávu se nepodařilo uložit.'), { status: error.message.includes('MESSAGE_NOT_FOUND') ? 404 : 500 });
        const message = await loadManagedMessage(data);
        if (!message) throw new Error('Uloženou zprávu se nepodařilo načíst.');
        return message;
    }
    throw new Error('Volný kód se nepodařilo rezervovat. Zkuste vytvoření znovu.');
}
