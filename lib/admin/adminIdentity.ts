import { ADMIN_USERNAME } from './adminConstants';
import { isAdminSessionValueValid, readAdminUserSessionOrNull } from './adminSession';
import { findAdminUserForSession } from './adminUserDatabase';
import { ADMIN_PERMISSION_DEFINITIONS, type AdminIdentity } from './adminPermissions';

export const SUPER_ADMIN_IDENTITY: AdminIdentity = {
    id: null, username: ADMIN_USERNAME, isSuperAdmin: true,
    permissions: ADMIN_PERMISSION_DEFINITIONS.map((permission) => permission.id),
};

/** Never trust permissions carried in a browser. Every request reads the account's current private database row. */
export async function getAdminIdentityForSession(value: string | null | undefined): Promise<AdminIdentity | null> {
    if (isAdminSessionValueValid(value)) return SUPER_ADMIN_IDENTITY;
    const session = readAdminUserSessionOrNull(value);
    if (!session) return null;
    const user = await findAdminUserForSession(session.userId);
    if (!user || !user.is_enabled || user.session_version !== session.sessionVersion) return null;
    return { id: user.id, username: user.username, isSuperAdmin: false, permissions: user.permissions };
}
