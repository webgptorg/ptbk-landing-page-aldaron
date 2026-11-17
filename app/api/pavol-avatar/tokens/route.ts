import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getAvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { getAvatarAccess } from '@/lib/pavol-avatar/access';
import { getAvatarDatabase } from '@/lib/pavol-avatar/database';
import { assertAvatarRequest, getAvatarOrigin } from '@/lib/pavol-avatar/config';
import { AvatarIntegrationError, createConnectorToken, hashCredential, integrationError, privateHeaders, readIntegrationJson } from '@/lib/pavol-avatar/integrations/credentials';
import { createAvatarSetup } from '@/lib/pavol-avatar/integrations/setup';
import { getAvatarTelegramConfiguration } from '@/lib/pavol-avatar/integrations/telegramConfig';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        assertAvatarRequest(request, false);
        const principal = await getAvatarPrincipal(request);
        if (!principal) throw new AvatarIntegrationError('Přihlaste se pomocí e-mailu.', 401);
        const { data, error } = await getAvatarDatabase().from('pavol_avatar_tokens')
            .select('id,label,created_at').eq('user_id', principal.id).is('revoked_at', null).order('created_at', { ascending: false });
        if (error) throw error;
        const telegram = getAvatarTelegramConfiguration();
        return Response.json({
            tokens: (data ?? []).map(row => ({ id: row.id, label: row.label, createdAt: row.created_at })),
            setup: createAvatarSetup(getAvatarOrigin(request)),
            telegram: { available: telegram.available, botUsername: telegram.available ? telegram.botUsername : null },
        }, { headers: privateHeaders });
    } catch (error) { return integrationError(error); }
}
export async function POST(request: Request) {
    try {
        assertAvatarRequest(request, true);
        const principal = await getAvatarPrincipal(request);
        if (!principal) throw new AvatarIntegrationError('Přihlaste se pomocí e-mailu.', 401);
        if ((await getAvatarAccess(principal)).plan !== 'full') throw new AvatarIntegrationError('MCP připojení je součástí předplatného Full.', 403);
        const parsed = z.object({ label: z.string().trim().min(1).max(80) }).safeParse(await readIntegrationJson(request));
        if (!parsed.success) throw new AvatarIntegrationError('Pojmenujte připojení, nejvýše 80 znaky.');
        const database = getAvatarDatabase();
        const active = await database.from('pavol_avatar_tokens').select('id', { count: 'exact', head: true }).eq('user_id', principal.id).is('revoked_at', null);
        if (active.error) throw active.error;
        if ((active.count ?? 0) >= 20) throw new AvatarIntegrationError('Nejdřív odpojte některé ze stávajících připojení.', 409);
        const token = createConnectorToken();
        const id = randomUUID();
        const { error } = await database.from('pavol_avatar_tokens').insert({
            id, user_id: principal.id, label: parsed.data.label, token_hash: hashCredential(token),
        });
        if (error) throw error;
        return Response.json({ id, label: parsed.data.label, token }, { status: 201, headers: privateHeaders });
    } catch (error) { return integrationError(error); }
}
export async function DELETE(request: Request) {
    try {
        assertAvatarRequest(request, true);
        const principal = await getAvatarPrincipal(request);
        if (!principal) throw new AvatarIntegrationError('Přihlaste se pomocí e-mailu.', 401);
        const parsed = z.object({ id: z.string().uuid() }).safeParse(await readIntegrationJson(request));
        if (!parsed.success) throw new AvatarIntegrationError('Vyberte připojení.');
        const { error } = await getAvatarDatabase().from('pavol_avatar_tokens')
            .update({ revoked_at: new Date().toISOString() }).eq('id', parsed.data.id).eq('user_id', principal.id).is('revoked_at', null);
        if (error) throw error;
        return Response.json({ isRevoked: true }, { headers: privateHeaders });
    } catch (error) { return integrationError(error); }
}
