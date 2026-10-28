import { describe, expect, it } from 'vitest';
import { ADMIN_SHORTENER_PERMISSION_DEFINITIONS, canAccessAdminPath, expandAdminPermissions, hasAdminPermission, type AdminIdentity } from './adminPermissions';

function identity(permissions: AdminIdentity['permissions'], isSuperAdmin = false): AdminIdentity {
    return { id: 'user', username: 'user', isSuperAdmin, permissions };
}

describe('shortener action permissions', () => {
    it('preserves full section grants and the permanent superadmin', () => {
        for (const definition of ADMIN_SHORTENER_PERMISSION_DEFINITIONS) {
            expect(hasAdminPermission(identity(['shortener']), definition.id)).toBe(true);
            expect(hasAdminPermission(identity([], true), definition.id)).toBe(true);
        }
    });
    it('includes list/navigation access without implicitly granting other actions', () => {
        const creator = identity(['shortener:create']);
        expect(hasAdminPermission(creator, 'shortener:view')).toBe(true);
        expect(canAccessAdminPath(creator, '/admin/shortener')).toBe(true);
        expect(canAccessAdminPath(creator, '/admin/users')).toBe(false);
        expect(canAccessAdminPath(creator, '/admin/contacts')).toBe(false);
        for (const action of ['shortener:update', 'shortener:delete', 'shortener:clicks'] as const) {
            expect(hasAdminPermission(creator, action)).toBe(false);
        }
        expect(hasAdminPermission(identity([]), 'shortener:view')).toBe(false);
    });
    it('removes the hidden broad grant before an editor removes an action', () => {
        const edited = expandAdminPermissions(['contacts', 'shortener']).filter((value) => value !== 'shortener:delete');
        expect(edited).not.toContain('shortener');
        expect(edited).toContain('contacts');
        expect(hasAdminPermission(identity(edited), 'shortener:create')).toBe(true);
        expect(hasAdminPermission(identity(edited), 'shortener:delete')).toBe(false);
    });
});
