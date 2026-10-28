import { ADMIN_USERNAME } from '@/lib/admin/adminConstants';
import { isSecretEqual } from '@/lib/admin/isSecretEqual';

/**
 * The admin token of this server, which is the password of the environment-backed superadmin
 */
export function getConfiguredAdminTokenOrNull(): string | null {
    return process.env.ADMIN_PASSWORD || null;
}

/**
 * Whether the given token is the admin token of this server
 *
 * Note: A server without a configured admin token accepts no token at all, so the administration stays closed instead
 *       of opening to everybody
 */
export function isAdminTokenValid(token: string | null | undefined): boolean {
    return isSecretEqual(token, getConfiguredAdminTokenOrNull());
}

/**
 * Whether the filled in login form names the environment-backed superadmin and their token
 */
export function isAdminSignInAllowed(
    username: string | null | undefined,
    password: string | null | undefined,
): boolean {
    return username === ADMIN_USERNAME && isAdminTokenValid(password);
}
