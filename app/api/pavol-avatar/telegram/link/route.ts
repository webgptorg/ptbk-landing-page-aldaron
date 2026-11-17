import { randomBytes } from 'node:crypto';
import { getAvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { getAvatarAccess } from '@/lib/pavol-avatar/access';
import { getAvatarDatabase } from '@/lib/pavol-avatar/database';
import { assertAvatarRequest } from '@/lib/pavol-avatar/config';
import { AvatarIntegrationError, hashCredential, integrationError, privateHeaders } from '@/lib/pavol-avatar/integrations/credentials';
import { getAvatarTelegramConfiguration } from '@/lib/pavol-avatar/integrations/telegramConfig';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        assertAvatarRequest(request, true);
        const principal = await getAvatarPrincipal(request);
        if (!principal) throw new AvatarIntegrationError('Přihlaste se pomocí e-mailu.', 401);
        if ((await getAvatarAccess(principal)).plan !== 'full') throw new AvatarIntegrationError('Telegram je součástí předplatného Full.', 403);
        const configuration = getAvatarTelegramConfiguration();
        if (!configuration.available) throw new AvatarIntegrationError('Telegram připravujeme. Přístup přes web a MCP je dostupný.', 503);
        const code = randomBytes(32).toString('base64url');
        const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
        const database = getAvatarDatabase();
        // At most the latest link request for this account remains usable.
        const inserted = await database.from('pavol_avatar_telegram_codes').upsert({
            code_hash: hashCredential(code), user_id: principal.id, expires_at: expiresAt,
        }, { onConflict: 'user_id' });
        if (inserted.error) throw inserted.error;
        return Response.json({ url: `https://t.me/${configuration.botUsername}?start=${code}`, expiresAt }, { headers: privateHeaders });
    } catch (error) { return integrationError(error); }
}
export async function DELETE(request: Request) {
    try {
        assertAvatarRequest(request, true);
        const principal = await getAvatarPrincipal(request);
        if (!principal) throw new AvatarIntegrationError('Přihlaste se pomocí e-mailu.', 401);
        const { error } = await getAvatarDatabase().rpc('avatar_disconnect_telegram_account', { p_user_id: principal.id });
        if (error) throw error;
        return Response.json({ isDisconnected: true }, { headers: privateHeaders });
    } catch (error) { return integrationError(error); }
}
