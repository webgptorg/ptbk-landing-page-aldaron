import { ADMIN_PERMISSION_VALUES } from './adminPermissions';
import type { AdminPermission } from './adminPermissions';
import { z } from 'zod';

export const ADMIN_USERS_PATH = '/admin/users';
export const ADMIN_USERS_API_PATH = '/api/admin/users';
export const ADMIN_USER_TABLE_NAME = 'admin_users';
export const ADMIN_USER_PUBLIC_COLUMNS = 'id,username,permissions,is_enabled,created_at,updated_at';
export const ADMIN_USER_MINIMUM_PASSWORD_LENGTH = 12;
export const ADMIN_USER_MAXIMUM_PASSWORD_LENGTH = 256;

const username = z.string().trim().toLowerCase().min(3).max(64)
    .regex(/^[a-z0-9][a-z0-9._-]*$/, 'Použijte písmena a–z, číslice, tečku, pomlčku nebo podtržítko.')
    .refine((value) => value !== 'admin', 'Jméno admin je vyhrazené superadminovi.');
const permission = z.custom<AdminPermission>(
    (value) => ADMIN_PERMISSION_VALUES.some((permission) => permission === value), 'Neznámé oprávnění.',
);
const permissions = z.array(permission).max(ADMIN_PERMISSION_VALUES.length)
    .refine((values) => new Set(values).size === values.length, 'Oprávnění se nesmí opakovat.');
const password = z.string().min(ADMIN_USER_MINIMUM_PASSWORD_LENGTH, 'Heslo musí mít alespoň 12 znaků.')
    .max(ADMIN_USER_MAXIMUM_PASSWORD_LENGTH, 'Heslo může mít nejvýše 256 znaků.');

export const adminUserCreateSchema = z.object({ username, password, permissions, isEnabled: z.boolean().default(true) }).strict();
export const adminUserUpdateSchema = z.object({
    username: username.optional(), password: password.optional(), permissions: permissions.optional(), isEnabled: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'Není co uložit.');

export type AdminUser = {
    readonly id: string;
    readonly username: string;
    readonly permissions: readonly AdminPermission[];
    readonly isEnabled: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
};
