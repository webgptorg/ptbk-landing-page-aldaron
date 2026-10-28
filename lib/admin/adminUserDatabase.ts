import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { ADMIN_USER_PUBLIC_COLUMNS, ADMIN_USER_TABLE_NAME, type AdminUser } from './adminUserSchemas';
import type { AdminPermission } from './adminPermissions';

export type AdminUserRow = {
    readonly id: string;
    readonly username: string;
    readonly permissions: readonly AdminPermission[];
    readonly is_enabled: boolean;
    readonly session_version: string;
    readonly created_at: string;
    readonly updated_at: string;
};

export class AdminUserDatabaseError extends Error {
    constructor(message = 'Účty administrace nejsou dostupné. Ověřte připojení a databázové migrace.', readonly status = 503) {
        super(message);
    }
}

export function getAdminUserDatabase() {
    const database = createSupabaseServiceRoleClient();
    if (!database) throw new AdminUserDatabaseError();
    return database;
}

export function throwAdminUserDatabaseError(error: { readonly code?: string } | null): void {
    if (error?.code === '23505') throw new AdminUserDatabaseError('Uživatelské jméno už existuje.', 409);
    if (error) throw new AdminUserDatabaseError();
}

/** Explicit projection: password hashes and session versions never become API response fields. */
export function mapAdminUser(row: Omit<AdminUserRow, 'session_version'>): AdminUser {
    return { id: row.id, username: row.username, permissions: row.permissions, isEnabled: row.is_enabled,
        createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function loadAdminUsers(): Promise<readonly AdminUser[]> {
    const { data, error } = await getAdminUserDatabase().from(ADMIN_USER_TABLE_NAME)
        .select(ADMIN_USER_PUBLIC_COLUMNS).order('username');
    throwAdminUserDatabaseError(error);
    return (data ?? []).map(mapAdminUser);
}

export async function findAdminUserForSession(id: string): Promise<AdminUserRow | null> {
    const { data, error } = await getAdminUserDatabase().from(ADMIN_USER_TABLE_NAME)
        .select(`${ADMIN_USER_PUBLIC_COLUMNS},session_version`).eq('id', id).maybeSingle();
    throwAdminUserDatabaseError(error);
    return data as AdminUserRow | null;
}
