import 'server-only';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { getAvatarAccess } from '@/lib/pavol-avatar/access';
import { getAvatarDatabase } from '@/lib/pavol-avatar/database';
import { askAvatar } from '@/lib/pavol-avatar/service';
import { AvatarIntegrationError, hashCredential, readIntegrationJson, readPrincipalById } from './credentials';
import { getAvatarTelegramConfiguration } from './telegramConfig';

const telegramUpdateSchema = z.object({
    update_id: z.number().int().nonnegative().safe(),
    message: z.object({
        from: z.object({ id: z.number().int().positive().safe(), is_bot: z.boolean().optional() }),
        chat: z.object({ id: z.number().int().safe(), type: z.string() }),
        text: z.string().max(10_000).optional(),
    }).optional(),
});
export function isTelegramWebhookSecretValid(provided: string | null, expected: string): boolean {
    if (!provided || !expected || provided.length !== expected.length) return false;
    const left = Buffer.from(provided);
    const right = Buffer.from(expected);
    return left.length === right.length && timingSafeEqual(left, right);
}
/** Plain text avoids Markdown escaping and UTF-16 chunks stay under Telegram's 4096 limit. */
export function splitTelegramReply(text: string, maximum = 3900): string[] {
    if (!text) return ['Odpověď je prázdná. Zkuste otázku znovu.'];
    const chunks: string[] = [];
    let remainder = text;
    while (remainder.length > maximum) {
        let end = remainder.lastIndexOf('\n', maximum);
        if (end < maximum / 2) end = maximum;
        if (end > 0 && /[\uD800-\uDBFF]/.test(remainder[end - 1])) end--;
        chunks.push(remainder.slice(0, end));
        remainder = remainder.slice(end);
    }
    if (remainder) chunks.push(remainder);
    return chunks;
}
export function telegramRequestUuid(value: string): string {
    const hex = createHash('sha256').update('pavol-avatar:telegram:v1:').update(value).digest('hex').slice(0, 32).split('');
    hex[12] = '4'; hex[16] = '8';
    return [hex.slice(0, 8).join(''), hex.slice(8, 12).join(''), hex.slice(12, 16).join(''), hex.slice(16, 20).join(''), hex.slice(20).join('')].join('-');
}
async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
    let response: Response;
    try {
        response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, link_preview_options: { is_disabled: true } }),
            signal: AbortSignal.timeout(15_000),
        });
    } catch { throw new AvatarIntegrationError('Telegram zprávu nepřijal.', 503); }
    if (!response.ok) throw new AvatarIntegrationError('Telegram zprávu nepřijal.', 503);
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object' || !('ok' in result) || result.ok !== true) {
        throw new AvatarIntegrationError('Telegram zprávu nepřijal.', 503);
    }
}
async function linkedPrincipal(telegramUserId: string) {
    const { data, error } = await getAvatarDatabase().from('pavol_avatar_telegram_links').select('user_id')
        .eq('telegram_user_id', telegramUserId).maybeSingle();
    if (error) throw error;
    return data ? readPrincipalById(data.user_id) : null;
}
async function answerTelegramText(userId: string, text: string, updateId: number, signal: AbortSignal): Promise<string> {
    const start = /^\/start(?:@[A-Za-z0-9_]+)?(?:\s+([A-Za-z0-9_-]{43}))?\s*$/.exec(text);
    if (start?.[1]) {
        const { data, error } = await getAvatarDatabase().rpc('avatar_consume_telegram_code', {
            p_code_hash: hashCredential(start[1]), p_telegram_user_id: userId,
        });
        if (error) throw error;
        const linked = z.array(z.object({ user_id: z.string().uuid() })).safeParse(data);
        if (!linked.success) throw new Error('Invalid Telegram linking result.');
        if (!linked.data[0]) return 'Odkaz už neplatí nebo byl použit. Na pavolhejny.cz/avatar si vytvořte nové připojení Telegramu.';
        return 'Telegram je připojený k vašemu Pavolovu AI avatarovi. Jsem AI avatar, ne živý Pavol. Napište otázku; čerpání je společné s webem a MCP. Příkaz /disconnect toto připojení odpojí.';
    }
    if (/^\/disconnect(?:@[A-Za-z0-9_]+)?\s*$/.test(text)) {
        const { error } = await getAvatarDatabase().rpc('avatar_disconnect_telegram_user', { p_telegram_user_id: userId });
        if (error) throw error;
        return 'Telegram je odpojený. Předplatné zůstává beze změny. Nové připojení vytvoříte na pavolhejny.cz/avatar.';
    }
    const principal = await linkedPrincipal(userId);
    if (!principal) return 'Nejdřív propojte Telegram se svým předplatným Full na pavolhejny.cz/avatar. Propojení ověří váš přístup bez zadávání hesla do Telegramu.';
    if ((await getAvatarAccess(principal)).plan !== 'full') return 'Přístup přes Telegram vyžaduje aktivní předplatné Full. Správu předplatného najdete na pavolhejny.cz/avatar.';
    if (start || /^\/help(?:@[A-Za-z0-9_]+)?\s*$/.test(text)) return 'Jsem Pavolův AI avatar. Napište textovou otázku k AI, agentům nebo specifikacím. Čerpání je společné s webem a MCP. /disconnect odpojí Telegram.';
    if (text.length > 4000) return 'Otázka je příliš dlouhá. Zkraťte ji prosím na 4 000 znaků, nebo použijte webového avatara.';
    try {
        return (await askAvatar(principal, {
            prompt: text, channel: 'telegram', language: 'cs', signal,
            conversationId: telegramRequestUuid('conversation:' + principal.id + ':' + userId),
            requestId: telegramRequestUuid('update:' + updateId),
        })).reply;
    } catch (error) {
        if (error instanceof Error && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) return error.message;
        return 'Odpověď teď není dostupná. Zkuste otázku později nebo otevřete pavolhejny.cz/avatar.';
    }
}
export async function handleAvatarTelegramWebhook(request: Request): Promise<Response> {
    const configuration = getAvatarTelegramConfiguration();
    if (!configuration.available) return Response.json({ error: 'Telegram is not configured.' }, { status: 503 });
    if (!isTelegramWebhookSecretValid(request.headers.get('x-telegram-bot-api-secret-token'), configuration.webhookSecret)) {
        return Response.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    let update: z.infer<typeof telegramUpdateSchema>;
    try {
        const parsed = telegramUpdateSchema.safeParse(await readIntegrationJson(request));
        if (!parsed.success) return Response.json({ ok: true });
        update = parsed.data;
    } catch { return Response.json({ error: 'Invalid update.' }, { status: 400 }); }
    const message = update.message;
    if (!message || message.chat.type !== 'private' || message.chat.id !== message.from.id || message.from.is_bot === true) {
        return Response.json({ ok: true });
    }
    const userId = String(message.from.id);
    const claimId = randomUUID();
    const database = getAvatarDatabase();
    let claimed = false;
    try {
        const claim = await database.rpc('avatar_claim_telegram_update', {
            p_update_id: update.update_id, p_telegram_user_id: userId, p_claim_id: claimId,
        });
        if (claim.error) throw claim.error;
        const decoded = z.array(z.object({
            claimed: z.boolean(), pending: z.boolean().default(false), response: z.string().nullable(),
            sent_chunks: z.number().int().nonnegative(),
        })).length(1).safeParse(claim.data);
        if (!decoded.success) throw new Error('Invalid Telegram claim result.');
        const state = decoded.data[0];
        if (!state?.claimed) return state?.pending ? Response.json({ error: 'Update is still processing.' }, { status: 503 }) : Response.json({ ok: true });
        claimed = true;
        const text = message.text?.trim();
        const reply = state.response ?? (text
            ? await answerTelegramText(userId, text, update.update_id, request.signal)
            : 'Zatím zpracovávám textové zprávy. Přílohy můžete poslat přes pavolhejny.cz/avatar.');
        const saved = await database.from('pavol_avatar_telegram_updates').update({ response: reply, claimed_at: new Date().toISOString() })
            .eq('update_id', update.update_id).eq('claim_id', claimId).eq('status', 'processing').select('update_id').single();
        if (saved.error || !saved.data) throw new Error('Telegram delivery claim lost.');
        const chunks = splitTelegramReply(reply);
        for (let index = state.sent_chunks ?? 0; index < chunks.length; index++) {
            await sendTelegramMessage(configuration.botToken, userId, chunks[index]);
            const recorded = await database.from('pavol_avatar_telegram_updates').update({ sent_chunks: index + 1, claimed_at: new Date().toISOString() })
                .eq('update_id', update.update_id).eq('claim_id', claimId).eq('status', 'processing').select('update_id').single();
            if (recorded.error || !recorded.data) throw new Error('Telegram delivery claim lost.');
        }
        const completed = await database.from('pavol_avatar_telegram_updates').update({ status: 'completed' })
            .eq('update_id', update.update_id).eq('claim_id', claimId).eq('status', 'processing').select('update_id').single();
        if (completed.error || !completed.data) throw new Error('Telegram delivery claim lost.');
        return Response.json({ ok: true });
    } catch {
        if (claimed) await database.from('pavol_avatar_telegram_updates').update({ status: 'failed' })
            .eq('update_id', update.update_id).eq('claim_id', claimId);
        return Response.json({ error: 'Update could not be processed.' }, { status: 503 });
    }
}
