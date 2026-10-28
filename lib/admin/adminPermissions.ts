/** One registry for delegated access, navigation and the account editor. Users never grant access themselves. */
export const ADMIN_PERMISSION_DEFINITIONS = [
    { id: 'workshops', label: 'Živé workshopy', path: '/admin/workshops' },
    { id: 'community', label: 'Komunita', path: '/admin/community' },
    { id: 'studio', label: 'Studio', path: '/admin/studio' },
    { id: 'contacts', label: 'Kontakty a leady', path: '/admin/contacts' },
    { id: 'shortener', label: 'Zkracovač odkazů', path: '/admin/shortener' },
    { id: 'discount-codes', label: 'Slevové kódy', path: '/admin/discount-codes' },
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSION_DEFINITIONS)[number]['id'];
export type AdminIdentity = {
    readonly id: string | null;
    readonly username: string;
    readonly isSuperAdmin: boolean;
    readonly permissions: readonly AdminPermission[];
};

export function hasAdminPermission(identity: AdminIdentity, permission: AdminPermission): boolean {
    return identity.isSuperAdmin || identity.permissions.includes(permission);
}

export function isPathWithin(pathname: string, root: string): boolean {
    return pathname === root || pathname.startsWith(`${root}/`);
}

export function canAccessAdminPath(identity: AdminIdentity, path: string): boolean {
    if (!path.startsWith('/') || path.startsWith('//')) return false;
    const pathname = new URL(path, 'https://admin.invalid').pathname;
    if (pathname === '/admin') return true;
    if (!isPathWithin(pathname, '/admin') || isPathWithin(pathname, '/admin/login')) return false;
    if (identity.isSuperAdmin) return true;
    const permission = ADMIN_PERMISSION_DEFINITIONS.find((definition) => isPathWithin(pathname, definition.path))?.id;
    if (permission) return hasAdminPermission(identity, permission);
    return isPathWithin(pathname, '/admin/recording-studio') && hasAdminPermission(identity, 'studio');
}
