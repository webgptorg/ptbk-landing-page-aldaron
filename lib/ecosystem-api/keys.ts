import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { apiKeyCreateSchema, type ApiKey, type ApiScope } from './contract';
import type { z } from 'zod';

export const API_KEYS_TABLE = 'ecosystem_api_keys';
const PUBLIC_COLUMNS = 'id,name,token_prefix,scopes,created_at,created_by,expires_at,revoked_at,revoked_by';
type KeyRow = {
    id: string; name: string; token_prefix: string; scopes: ApiScope[];
    created_at: string; created_by: string; expires_at: string | null; revoked_at: string | null; revoked_by: string | null;
};

function database() {
    const client = createSupabaseServiceRoleClient();
    if (!client) throw new Error('API key storage unavailable');
    return client;
}

export function hashApiKey(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

function metadata(row: KeyRow): ApiKey {
    return { id: row.id, name: row.name, prefix: row.token_prefix, scopes: row.scopes,
        createdAt: row.created_at, createdBy: row.created_by, expiresAt: row.expires_at,
        revokedAt: row.revoked_at, revokedBy: row.revoked_by };
}

export async function listApiKeys(offset: number) {
    const result = await database().from(API_KEYS_TABLE).select(PUBLIC_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false }).order('id').range(offset, offset + 49);
    if (result.error) throw new Error('API key list unavailable');
    return { items: (result.data as KeyRow[]).map(metadata), total: result.count ?? 0, offset, limit: 50 };
}

/** The random secret is returned once. Only its SHA-256 hash and a display prefix are persisted. */
export async function createApiKey(input: z.infer<typeof apiKeyCreateSchema>, actor: string) {
    const token = `ptbk_${randomBytes(32).toString('base64url')}`;
    const result = await database().from(API_KEYS_TABLE).insert({
        name: input.name, scopes: input.scopes, expires_at: input.expiresAt,
        token_hash: hashApiKey(token), token_prefix: token.slice(0, 13), created_by: actor,
    }).select(PUBLIC_COLUMNS).single<KeyRow>();
    if (result.error || !result.data) throw new Error('API key creation unavailable');
    return { key: metadata(result.data), token };
}

export async function revokeApiKey(id: string, actor: string): Promise<boolean> {
    // First revocation owns the audit fields. Retrying never restores a key or rewrites its actor/time.
    const result = await database().from(API_KEYS_TABLE)
        .update({ revoked_at: new Date().toISOString(), revoked_by: actor }).eq('id', id).is('revoked_at', null)
        .select('id').maybeSingle();
    if (result.error) throw new Error('API key revocation unavailable');
    if (result.data) return true;
    const existing = await database().from(API_KEYS_TABLE).select('id').eq('id', id).maybeSingle();
    if (existing.error) throw new Error('API key revocation unavailable');
    return existing.data !== null;
}

/** No cross-request cache: revocation, expiration and scope changes apply on the next request. */
export async function acceptsApiKey(token: string, scope: ApiScope): Promise<boolean> {
    if (!/^ptbk_[A-Za-z0-9_-]{43}$/.test(token)) return false;
    const result = await database().from(API_KEYS_TABLE).select('scopes,expires_at,revoked_at')
        .eq('token_hash', hashApiKey(token)).maybeSingle<Pick<KeyRow, 'scopes' | 'expires_at' | 'revoked_at'>>();
    if (result.error) throw new Error('API key authentication unavailable');
    const key = result.data;
    return key !== null && key.revoked_at === null && key.scopes.includes(scope)
        && (key.expires_at === null || Date.parse(key.expires_at) > Date.now());
}
