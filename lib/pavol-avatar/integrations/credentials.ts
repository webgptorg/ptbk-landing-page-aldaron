import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { getAvatarDatabase } from '@/lib/pavol-avatar/database';
import type { AvatarPrincipal } from '@/lib/pavol-avatar/auth';

export const privateHeaders = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };
export class AvatarIntegrationError extends Error {
    constructor(message: string, readonly status = 400) { super(message); this.name = 'AvatarIntegrationError'; }
}
export function integrationError(error: unknown): Response {
    const status = error instanceof Error && 'status' in error && typeof error.status === 'number' ? error.status : 503;
    const message = status >= 400 && status < 500 && error instanceof Error ? error.message : 'Připojení teď není dostupné. Zkuste to znovu.';
    return Response.json({ error: message }, { status, headers: privateHeaders });
}
export const hashCredential = (value: string) => createHash('sha256').update(value).digest('hex');
export const createConnectorToken = () => 'pavol_' + randomBytes(32).toString('base64url');

export async function readConnectorPrincipal(request: Request): Promise<AvatarPrincipal | null> {
    const header = request.headers.get('authorization') ?? '';
    const match = /^Bearer (pavol_[A-Za-z0-9_-]{43})$/.exec(header);
    if (!match) return null;
    const database = getAvatarDatabase();
    const { data, error } = await database.from('pavol_avatar_tokens').select('user_id')
        .eq('token_hash', hashCredential(match[1])).is('revoked_at', null).maybeSingle();
    if (error) throw new AvatarIntegrationError('Připojení teď není dostupné.', 503);
    if (!data) return null;
    return readPrincipalById(data.user_id);
}
export async function readPrincipalById(id: string): Promise<AvatarPrincipal | null> {
    const { data, error } = await getAvatarDatabase().from('avatar_principals').select('id,email').eq('id', id).maybeSingle();
    if (error) throw new AvatarIntegrationError('Připojení teď není dostupné.', 503);
    return data ? { id: data.id, email: data.email } : null;
}

export async function readIntegrationJson(request: Request): Promise<unknown> {
    const reader = request.body?.getReader();
    if (!reader) throw new AvatarIntegrationError('Chybí obsah požadavku.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 70_000) { await reader.cancel(); throw new AvatarIntegrationError('Požadavek je příliš velký.', 413); }
        chunks.push(value);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { throw new AvatarIntegrationError('Neplatný požadavek.'); }
}
