import { z } from 'zod';

export const API_DOCS_PATH = '/api/docs';
export const API_OPENAPI_PATH = '/api/openapi.json';
export const API_KEYS_ADMIN_PATH = '/admin/api-keys';
export const API_KEYS_ADMIN_ENDPOINT = '/api/admin/api-keys';
export const API_LICENSES_PATH = '/api/v1/licenses';
export const API_EXCHANGE_PATH = '/api/v1/identity/exchange';

/** Extend this registry as new ecosystem API resources become available. */
export const API_SCOPE_DEFINITIONS = [
    { id: 'licenses:read', label: 'Čtení licencí', description: 'Zjištění licencí podle ověřeného e-mailu nebo propojeného účtu.' },
    { id: 'identity:exchange', label: 'Propojení identity', description: 'Výměna jednorázového přihlašovacího lístku za ověřenou identitu.' },
] as const;
export type ApiScope = (typeof API_SCOPE_DEFINITIONS)[number]['id'];

export const apiKeyCreateSchema = z.object({
    name: z.string().trim().min(1).max(120),
    scopes: z.array(z.enum(['licenses:read', 'identity:exchange'])).min(1).max(API_SCOPE_DEFINITIONS.length)
        .refine((values) => new Set(values).size === values.length, 'Oprávnění se nesmí opakovat.'),
    expiresAt: z.string().datetime().nullable().default(null)
        .refine((value) => value === null || Date.parse(value) > Date.now(), 'Platnost musí končit v budoucnosti.'),
}).strict();

export type ApiKey = {
    id: string; name: string; prefix: string; scopes: ApiScope[];
    createdAt: string; createdBy: string; expiresAt: string | null; revokedAt: string | null; revokedBy: string | null;
};

export function apiKeyStatus(key: Pick<ApiKey, 'revokedAt' | 'expiresAt'>): 'active' | 'expired' | 'revoked' {
    if (key.revokedAt) return 'revoked';
    return key.expiresAt && Date.parse(key.expiresAt) <= Date.now() ? 'expired' : 'active';
}
